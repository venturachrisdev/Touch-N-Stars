import { createI18n } from 'vue-i18n';
import de from './locales/de.json';
import en from './locales/en.json';

const messages = {
  de,
  en,
};

const i18n = createI18n({
  legacy: false,
  locale: 'en', // default locale
  fallbackLocale: 'en',
  messages,
});

export default i18n;
