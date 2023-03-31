import {
  CountryMapping,
  getCountryDetails,
  getLocaleForCountry,
} from '../enums/country.enum';

/**
 * It takes a number and a country, and returns the number formatted according to the country's conventions
 * @param {any | number} number - The number(currency) to be formatted.
 * @param {string} country - The country for which you want to format the number.
 * @returns - Formatted number in string if input is a number or can be converted to a number. Else returns the input itself.
 */
export const getInternationalizedNumber = (
  number: any | number,
  country: string,
): any => {
  if (isNaN(number)) {
    return number;
  }
  number = Number(number);
  const locale = getLocaleForCountry(country);
  const numberFormatter = getNumberFormatter(locale);
  return numberFormatter.format(number);
};

/**
 * It takes a number and a country code, and returns the number formatted according to the country's locale
 * @param {any | number} number - The number to be formatted.
 * @param {string} country - The country code for the country you want to format the number for.
 * @returns - Formatted number in string if input is a number or can be converted to a number. Else returns the input itself.
 */
export const getInternationalizedQuantity = (
  number: any | number,
  country: string,
): any => {
  if (isNaN(number)) {
    return number;
  }
  number = Number(number);
  const locale = getLocaleForCountry(country);
  const numberFormatter = getQuantityFormatter(locale);
  return numberFormatter.format(number);
};

/**
 *
 * @param data - input to be localized
 * @param locale - Locale, based on which conversion should be done.
 * @param country - Country, based on which locale is decided. Providing either country or locale will work
 * @param include_list - Array of keys(string) which are to be formatted in the object
 * @param quantity_keys_list
 * @param exclude_list - Array of keys(string) which are to be excluded in the object. Function will format all keys besides the ones mentioned in this list.
 * @param key_suffix - Append a custom suffix, if provided. Default is _text
 * @returns - An object in which keys present in included list (or not present in excluded list) are formatted and put in a new key_text field. Also, if the value that is to be formatted is string, then convert it to number, thus sanitizing the data before sending to UI.
 */
export const getLocalizedData = (
  data: Record<any, any> | Array<any> | number,
  locale = '',
  country = '',
  include_list: Array<string> = [],
  quantity_keys_list: Array<string> = [],
  exclude_list: Array<string> = [],
  key_suffix = '',
): any => {
  let current_locale = 'en-US';
  try {
    current_locale = getCurrentLocale(locale, current_locale, country);
    try {
      data = JSON.parse(JSON.stringify(data));
    } catch (e) {}
    return localizeData(
      data,
      current_locale,
      '',
      include_list,
      quantity_keys_list,
      exclude_list,
      key_suffix,
    );
  } catch (e) {
    return data;
  }
};

/* Recursive function to localize data in any type of Object*/
const localizeData = (
  data,
  locale,
  key_to_format = '',
  include_list: Array<string> = [],
  quantity_list: Array<string> = [],
  exclude_list: Array<string> = [],
  key_suffix = '',
): any => {
  // Stringify and Parse needed to make res a new object (remove reference from data)
  let res = JSON.parse(JSON.stringify(data));
  try {
    // Localise all elements in array with only numbers
    if (
      data &&
      Array.isArray(data) &&
      data.length > 0 &&
      isNumberOnlyArray(data)
    ) {
      if (
        isLocalizable(key_to_format, include_list, quantity_list, exclude_list)
      ) {
        const arraySize = data.length;
        for (let i = 0; i < arraySize; i++) {
          res[i] = localizeData(
            data[i],
            locale,
            key_to_format,
            include_list,
            quantity_list,
            exclude_list,
            key_suffix,
          );
        }
      }
    } else if (
      data &&
      (Array.isArray(data) || typeof data === 'object') &&
      Object.keys(data).length > 0
    ) {
      for (const [key, value] of Object.entries(data)) {
        let new_key = key;
        if (Array.isArray(value) && isNumberOnlyArray(value)) {
          if (isLocalizable(key, include_list, quantity_list, exclude_list)) {
            new_key = key + (key_suffix ? key_suffix : '_text');
          }
        } else if (
          typeof value === 'number' ||
          (!['null', 'undefined', ''].includes(String(value)) &&
            !isNaN(Number(value)))
        ) {
          if (isLocalizable(key, include_list, quantity_list, exclude_list)) {
            new_key = key + (key_suffix ? key_suffix : '_text');
            // Sanitizing the data : Converting the value to number if present as string.
            res[key] = Number(value);
          }
        }
        res[new_key] = localizeData(
          value,
          locale,
          key,
          include_list,
          quantity_list,
          exclude_list,
          key_suffix,
        );
      }
    } else if (
      typeof data === 'number' ||
      (!['null', 'undefined', ''].includes(String(data)) &&
        !isNaN(Number(data)))
    ) {
      if (
        isLocalizable(key_to_format, include_list, quantity_list, exclude_list)
      ) {
        try {
          if (quantity_list.includes(key_to_format)) {
            res = getQuantityFormatter(locale).format(Number(data));
          } else {
            res = getNumberFormatter(locale).format(Number(data));
          }
        } catch (e) {}
      }
    }
  } catch (e) {}
  return res;
};

/**
 * It returns true if all the elements in the array are numbers, otherwise it returns false
 * @param data - Array<any>
 * @returns true
 */
function isNumberOnlyArray(data: Array<any>) {
  return !data.some(element => isNaN(element));
}

/* Check whether the key is localizable */
const isLocalizable = (
  key: string,
  include_list: Array<string>,
  quantity_list: Array<string>,
  exclude_list: Array<string>,
): boolean => {
  if (
    (Array.isArray(include_list) && include_list.length > 0) ||
    (Array.isArray(quantity_list) && quantity_list.length > 0)
  ) {
    if (include_list.includes(key)) {
      return true;
    }
    if (quantity_list.includes(key)) {
      return true;
    }
  }
  if (Array.isArray(exclude_list) && exclude_list.length > 0) {
    if (!exclude_list.includes(key)) {
      return true;
    }
  }
  if (
    Array.isArray(include_list) &&
    include_list.length === 0 &&
    Array.isArray(quantity_list) &&
    quantity_list.length === 0 &&
    Array.isArray(exclude_list) &&
    exclude_list.length === 0
  ) {
    return true;
  }
  return false;
};

/**
 * It returns a function that formats a number into a currency string
 * @param {string} locale - The locale of the country you want to format the currency for.
 * @returns A function that returns a formatter based on the locale.
 */
const getNumberFormatter = (locale: string): any => {
  const malaysiaFormatter = new Intl.NumberFormat(
    CountryMapping.MALAYSIA.locale,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
  const indonesiaFormatter = new Intl.NumberFormat(
    CountryMapping.INDONESIA.locale,
  );

  if (typeof locale === 'string' && locale.trim() != '') {
    if (locale === CountryMapping.INDONESIA.locale) {
      return indonesiaFormatter;
    }
  }
  return malaysiaFormatter;
};

/**
 * It returns a number formatter based on the locale passed in
 * @param {string} locale - The locale to use for formatting.
 * @returns A function that returns a number formatter.
 */
const getQuantityFormatter = (locale: string): any => {
  const malaysiaFormatter = new Intl.NumberFormat(
    CountryMapping.MALAYSIA.locale,
  );
  const indonesiaFormatter = new Intl.NumberFormat(
    CountryMapping.INDONESIA.locale,
  );

  if (typeof locale === 'string' && locale.trim() != '') {
    if (locale === CountryMapping.INDONESIA.locale) {
      return indonesiaFormatter;
    }
  }
  return malaysiaFormatter;
};

/**
 * If the locale is provided, use it. If the country is provided, use it. If neither are provided, use the default locale
 * @param {string} locale - The locale you want to use.
 * @param {string} current_locale - The current locale of the user.
 * @param {string} country - The country name or country code.
 * @returns The current locale is being returned.
 */
function getCurrentLocale(
  locale: string,
  current_locale: string,
  country: string,
) {
  if (typeof locale === 'string' && locale.trim() != '') {
    current_locale = locale.trim();
  } else if (typeof country === 'string' && country.trim() != '') {
    if (country.length === 2) {
      const country_details = getCountryDetails('country_code', country.trim());
      current_locale = country_details['locale']
        ? country_details['locale']
        : current_locale;
    } else {
      current_locale = getLocaleForCountry(country.trim());
    }
  }
  return current_locale;
}
