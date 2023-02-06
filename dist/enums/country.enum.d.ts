export declare const CountryMapping: {
    MALAYSIA: {
        country: string;
        country_code: string;
        currency_code: string;
        currency_symbol: string;
        locale: string;
        language: string;
        base_roundoff: number;
    };
    INDONESIA: {
        country: string;
        country_code: string;
        currency_code: string;
        currency_symbol: string;
        locale: string;
        language: string;
        base_roundoff: number;
    };
};
export declare const countries: () => any;
export declare const countryCodes: () => any;
export declare const currencyCodes: () => any;
export declare const currencySymbols: () => any;
export declare const getCountryDetails: (sub_key: string, value: string) => Record<any, any>;
export declare const getLocaleForCountry: (countryKey: string) => any;
export declare const getCountryLanguage: (countryCode: any) => string;
