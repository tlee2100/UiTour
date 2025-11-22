import enTranslations from '../locales/en.json';
import viTranslations from '../locales/vi.json';

const translations = {
  en: enTranslations,
  vi: viTranslations
};

export function getTranslation(language, key) {
  const keys = key.split('.');
  let value = translations[language] || translations.en;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      // Fallback to English if translation not found
      value = translations.en;
      for (const fallbackKey of keys) {
        value = value?.[fallbackKey];
        if (value === undefined) return key;
      }
      return value || key;
    }
  }
  
  return value || key;
}

export function t(language, key) {
  return getTranslation(language, key);
}

