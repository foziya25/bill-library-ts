"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCountryLanguage = exports.getLocaleForCountry = exports.getCountryDetails = exports.currencySymbols = exports.currencyCodes = exports.countryCodes = exports.countries = exports.CountryMapping = void 0;
exports.CountryMapping = {
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
const countries = () => {
    return Object.values(exports.CountryMapping).map(e => e.country);
};
exports.countries = countries;
const countryCodes = () => {
    return Object.values(exports.CountryMapping).map(e => e.country_code);
};
exports.countryCodes = countryCodes;
const currencyCodes = () => {
    return Object.values(exports.CountryMapping).map(e => e.currency_code);
};
exports.currencyCodes = currencyCodes;
const currencySymbols = () => {
    return Object.values(exports.CountryMapping).map(e => e.currency_symbol);
};
exports.currencySymbols = currencySymbols;
const getCountryDetails = (sub_key, value) => {
    let country_details = {};
    for (const key of Object.keys(exports.CountryMapping)) {
        if (exports.CountryMapping[key][sub_key] === value) {
            country_details = exports.CountryMapping[key];
            break;
        }
    }
    return country_details;
};
exports.getCountryDetails = getCountryDetails;
const getLocaleForCountry = (countryKey) => {
    let locale = 'ms-MY';
    try {
        if (typeof countryKey === 'string' && countryKey.trim() != '') {
            if (countryKey.length === 2) {
                if (countryKey === exports.CountryMapping.INDONESIA.country_code) {
                    return exports.CountryMapping.INDONESIA.locale;
                }
            }
            else {
                if (countryKey === exports.CountryMapping.INDONESIA.country) {
                    return exports.CountryMapping.INDONESIA.locale;
                }
            }
        }
    }
    catch (e) { }
    return locale;
};
exports.getLocaleForCountry = getLocaleForCountry;
const getCountryLanguage = countryCode => {
    let language = exports.CountryMapping.MALAYSIA.language;
    if (countryCode == exports.CountryMapping.INDONESIA.country_code) {
        language = exports.CountryMapping.INDONESIA.language;
    }
    return language;
};
exports.getCountryLanguage = getCountryLanguage;
//# sourceMappingURL=country.enum.js.map