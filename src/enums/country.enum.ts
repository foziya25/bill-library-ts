export const CountryMapping = {
  MALAYSIA: {
    country: 'Malaysia',
    country_code: 'MY',
    currency_code: 'MYR',
    currency_symbol: 'RM',
    locale: 'ms-MY',
    language: 'en-US',
    base_roundoff: 0.05,
  },
  INDONESIA: {
    country: 'Indonesia',
    country_code: 'ID',
    currency_code: 'IDR',
    currency_symbol: 'Rp',
    locale: 'id-ID',
    language: 'id-ID',
    base_roundoff: 100,
  },
};

export const countries = (): any => {
  return Object.values(CountryMapping).map(e => e.country);
};

export const countryCodes = (): any => {
  return Object.values(CountryMapping).map(e => e.country_code);
};

export const currencyCodes = (): any => {
  return Object.values(CountryMapping).map(e => e.currency_code);
};

export const currencySymbols = (): any => {
  return Object.values(CountryMapping).map(e => e.currency_symbol);
};

export const getCountryDetails = (
  sub_key: string,
  value: string,
): Record<any, any> => {
  let country_details = {};
  for (const key of Object.keys(CountryMapping)) {
    if (CountryMapping[key][sub_key] === value) {
      country_details = CountryMapping[key];
      break;
    }
  }
  return country_details;
};

export const getLocaleForCountry = (countryKey: string): any => {
  let locale = 'ms-MY';
  try {
    if (typeof countryKey === 'string' && countryKey.trim() != '') {
      if (countryKey.length === 2) {
        // Handling for country_code being passed in country
        if (countryKey === CountryMapping.INDONESIA.country_code) {
          return CountryMapping.INDONESIA.locale;
        }
      } else {
        // Handling for country being passed
        if (countryKey === CountryMapping.INDONESIA.country) {
          return CountryMapping.INDONESIA.locale;
        }
      }
    }
  } catch (e) {}
  return locale;
};

export const getCountryLanguage = countryCode => {
  let language = CountryMapping.MALAYSIA.language;
  if (countryCode == CountryMapping.INDONESIA.country_code) {
    language = CountryMapping.INDONESIA.language;
  }
  return language;
};
