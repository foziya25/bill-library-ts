"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.localize = void 0;
const country_enum_1 = require("../enums/country.enum");
const enKeys = require("../locale/en.json");
const idKeys = require("../locale/id.json");
const localize = (key, language = country_enum_1.CountryMapping.MALAYSIA.language) => {
    if (!enKeys[key]) {
        return key;
    }
    language = language || country_enum_1.CountryMapping.MALAYSIA.language;
    if (language === country_enum_1.CountryMapping.INDONESIA.language) {
        return idKeys[key] ? idKeys[key] : enKeys[key];
    }
    return enKeys[key];
};
exports.localize = localize;
//# sourceMappingURL=i18n.js.map