"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocalizedData = exports.getInternationalizedQuantity = exports.getInternationalizedNumber = void 0;
const country_enum_1 = require("../enums/country.enum");
const getInternationalizedNumber = (number, country) => {
    if (isNaN(number)) {
        return number;
    }
    number = Number(number);
    const locale = (0, country_enum_1.getLocaleForCountry)(country);
    const numberFormatter = getNumberFormatter(locale);
    return numberFormatter.format(number);
};
exports.getInternationalizedNumber = getInternationalizedNumber;
const getInternationalizedQuantity = (number, country) => {
    if (isNaN(number)) {
        return number;
    }
    number = Number(number);
    const locale = (0, country_enum_1.getLocaleForCountry)(country);
    const numberFormatter = getQuantityFormatter(locale);
    return numberFormatter.format(number);
};
exports.getInternationalizedQuantity = getInternationalizedQuantity;
const getLocalizedData = (data, locale = '', country = '', include_list = [], quantity_keys_list = [], exclude_list = [], key_suffix = '') => {
    let current_locale = 'en-US';
    try {
        current_locale = getCurrentLocale(locale, current_locale, country);
        try {
            data = JSON.parse(JSON.stringify(data));
        }
        catch (e) { }
        return localizeData(data, current_locale, '', include_list, quantity_keys_list, exclude_list, key_suffix);
    }
    catch (e) {
        return data;
    }
};
exports.getLocalizedData = getLocalizedData;
const localizeData = (data, locale, key_to_format = '', include_list = [], quantity_list = [], exclude_list = [], key_suffix = '') => {
    let res = JSON.parse(JSON.stringify(data));
    try {
        if (data && Array.isArray(data) && data.length > 0 && isNumberOnlyArray(data)) {
            if (isLocalizable(key_to_format, include_list, quantity_list, exclude_list)) {
                const arraySize = data.length;
                for (let i = 0; i < arraySize; i++) {
                    res[i] = localizeData(data[i], locale, key_to_format, include_list, quantity_list, exclude_list, key_suffix);
                }
            }
        }
        else if (data &&
            (Array.isArray(data) || typeof data === 'object') &&
            Object.keys(data).length > 0) {
            for (const [key, value] of Object.entries(data)) {
                let new_key = key;
                if (Array.isArray(value) && isNumberOnlyArray(value)) {
                    if (isLocalizable(key, include_list, quantity_list, exclude_list)) {
                        new_key = key + (key_suffix ? key_suffix : '_text');
                    }
                }
                else if (typeof value === 'number' ||
                    (!['null', 'undefined', ''].includes(String(value)) && !isNaN(Number(value)))) {
                    if (isLocalizable(key, include_list, quantity_list, exclude_list)) {
                        new_key = key + (key_suffix ? key_suffix : '_text');
                        res[key] = Number(value);
                    }
                }
                res[new_key] = localizeData(value, locale, key, include_list, quantity_list, exclude_list, key_suffix);
            }
        }
        else if (typeof data === 'number' ||
            (!['null', 'undefined', ''].includes(String(data)) && !isNaN(Number(data)))) {
            if (isLocalizable(key_to_format, include_list, quantity_list, exclude_list)) {
                try {
                    if (quantity_list.includes(key_to_format)) {
                        res = getQuantityFormatter(locale).format(Number(data));
                    }
                    else {
                        res = getNumberFormatter(locale).format(Number(data));
                    }
                }
                catch (e) { }
            }
        }
    }
    catch (e) { }
    return res;
};
function isNumberOnlyArray(data) {
    return !data.some((element) => isNaN(element));
}
const isLocalizable = (key, include_list, quantity_list, exclude_list) => {
    if ((Array.isArray(include_list) && include_list.length > 0) ||
        (Array.isArray(quantity_list) && quantity_list.length > 0)) {
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
    if (Array.isArray(include_list) &&
        include_list.length === 0 &&
        Array.isArray(quantity_list) &&
        quantity_list.length === 0 &&
        Array.isArray(exclude_list) &&
        exclude_list.length === 0) {
        return true;
    }
    return false;
};
const getNumberFormatter = (locale) => {
    const malaysiaFormatter = new Intl.NumberFormat(country_enum_1.CountryMapping.MALAYSIA.locale, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const indonesiaFormatter = new Intl.NumberFormat(country_enum_1.CountryMapping.INDONESIA.locale);
    if (typeof locale === 'string' && locale.trim() != '') {
        if (locale === country_enum_1.CountryMapping.INDONESIA.locale) {
            return indonesiaFormatter;
        }
    }
    return malaysiaFormatter;
};
const getQuantityFormatter = (locale) => {
    const malaysiaFormatter = new Intl.NumberFormat(country_enum_1.CountryMapping.MALAYSIA.locale);
    const indonesiaFormatter = new Intl.NumberFormat(country_enum_1.CountryMapping.INDONESIA.locale);
    if (typeof locale === 'string' && locale.trim() != '') {
        if (locale === country_enum_1.CountryMapping.INDONESIA.locale) {
            return indonesiaFormatter;
        }
    }
    return malaysiaFormatter;
};
function getCurrentLocale(locale, current_locale, country) {
    if (typeof locale === 'string' && locale.trim() != '') {
        current_locale = locale.trim();
    }
    else if (typeof country === 'string' && country.trim() != '') {
        if (country.length === 2) {
            const country_details = (0, country_enum_1.getCountryDetails)('country_code', country.trim());
            current_locale = country_details['locale'] ? country_details['locale'] : current_locale;
        }
        else {
            current_locale = (0, country_enum_1.getLocaleForCountry)(country.trim());
        }
    }
    return current_locale;
}
//# sourceMappingURL=number-format.js.map