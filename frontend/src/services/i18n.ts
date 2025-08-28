import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Language resources
import en from '../locales/en.json';
import nl from '../locales/nl.json';
import de from '../locales/de.json';
import ar from '../locales/ar.json';
import zgh from '../locales/zgh.json';
import uk from '../locales/uk.json';
import pl from '../locales/pl.json';
import zh from '../locales/zh.json';
import yue from '../locales/yue.json';
import es from '../locales/es.json';
import hi from '../locales/hi.json';
import tr from '../locales/tr.json';
import fr from '../locales/fr.json';
import ti from '../locales/ti.json';
import so from '../locales/so.json';

const resources = {
  en: { translation: en },
  nl: { translation: nl },
  de: { translation: de },
  ar: { translation: ar },
  zgh: { translation: zgh },
  uk: { translation: uk },
  pl: { translation: pl },
  'zh-Hans': { translation: zh },
  yue: { translation: yue },
  es: { translation: es },
  hi: { translation: hi },
  tr: { translation: tr },
  fr: { translation: fr },
  ti: { translation: ti },
  so: { translation: so },
};

// Detect initial language with localStorage persistence
const getInitialLanguage = (): string => {
  const supportedLanguages = Object.keys(resources);
  
  // First check localStorage
  const savedLanguage = localStorage.getItem('lingora-language');
  if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
    return savedLanguage;
  }
  
  // Then check browser language
  const browserLang = navigator.language;
  
  // Check exact match
  if (supportedLanguages.includes(browserLang)) {
    return browserLang;
  }
  
  // Check language without region (e.g., 'en' from 'en-US')
  const langWithoutRegion = browserLang.split('-')[0];
  if (supportedLanguages.includes(langWithoutRegion)) {
    return langWithoutRegion;
  }
  
  // Default to Dutch since we're targeting Netherlands
  return 'nl';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'nl',
    
    interpolation: {
      escapeValue: false, // React already escapes
    },
    
    react: {
      useSuspense: false,
    },
    
    // Namespace configuration
    defaultNS: 'translation',
    
    // Debug mode in development
    debug: import.meta.env.DEV,
  });

export default i18n;