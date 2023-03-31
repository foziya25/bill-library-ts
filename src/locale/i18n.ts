import {CountryMapping} from '../enums/country.enum';
import * as enKeys from '../locale/en.json';
import * as idKeys from '../locale/id.json';

export const localize = (
  key: string,
  language: string = CountryMapping.MALAYSIA.language,
): string => {
  if (!enKeys[key]) {
    return key;
  }
  language = language || CountryMapping.MALAYSIA.language;
  if (language === CountryMapping.INDONESIA.language) {
    return idKeys[key] ? idKeys[key] : enKeys[key];
  }
  return enKeys[key];
};
