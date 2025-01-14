import { createI18n } from 'vue-i18n';
import { useSettingsStore } from '@/store/settingsStore';
import de from './locales/de.json';
import en from './locales/en.json';

const messages = {
  de,
  en,
};

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

// Export i18n instance and initialize function
export { i18n as default, initializeI18n };

// Initialize store and set locale after app is mounted
let settingsStore;
function initializeI18n(store) {
  settingsStore = store;

  // Initialize language from store or default to 'en'
  const storedLanguage = settingsStore.language;
  i18n.global.locale.value = storedLanguage || 'en';

  // Update store with current language
  if (!storedLanguage) {
    settingsStore.setLanguage(i18n.global.locale.value);
  }

  // Add language change handler
  i18n.global.onLanguageChanged = (locale) => {
    settingsStore.setLanguage(locale);
  };
}
