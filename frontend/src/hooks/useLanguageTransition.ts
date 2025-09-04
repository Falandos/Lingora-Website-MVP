import { useEffect, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

// Language color mapping
const LANGUAGE_COLORS: Record<string, string> = {
  nl: '#FF6B35', // Dutch orange
  en: '#0066CC', // British blue
  tr: '#E30A17', // Turkish red
  ar: '#006C35', // Saudi green
  de: '#FFCC00', // German yellow
  fr: '#0055A4', // French blue
  es: '#AA151B', // Spanish red
  pl: '#DC143C', // Polish red
  it: '#009246', // Italian green
  pt: '#006600', // Portuguese green
  ru: '#0033A0', // Russian blue
  uk: '#005BBB', // Ukrainian blue
  zh: '#DE2910', // Chinese red
  hi: '#FF9933', // Hindi saffron
  ur: '#01411C', // Urdu green
  so: '#4189DD', // Somali blue
  ro: '#002B7F', // Romanian blue
  bg: '#00966E'  // Bulgarian green
};

export interface UseLanguageTransitionReturn {
  triggerTransition: (targetLanguage: string, callback?: () => void) => void;
  isTransitioning: boolean;
}

export function useLanguageTransition(): UseLanguageTransitionReturn {
  const { i18n } = useTranslation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Get language color
  const getLanguageColor = useCallback((languageCode: string): string => {
    return LANGUAGE_COLORS[languageCode.toLowerCase()] || '#3B82F6';
  }, []);

  // Apply transition effect
  const triggerTransition = useCallback((targetLanguage: string, callback?: () => void) => {
    // Don't transition if same language
    if (targetLanguage === i18n.language) {
      if (callback) callback();
      return;
    }

    // Force cleanup any previous transition
    const appElement = document.documentElement;
    appElement.classList.remove('language-transitioning');
    // Remove any existing accent classes
    appElement.className = appElement.className.replace(/language-accent-\w+/g, '');
    
    setIsTransitioning(true);
    
    const languageColor = getLanguageColor(targetLanguage);
    
    // Set CSS custom property for current language color
    appElement.style.setProperty('--current-language-color', languageColor);
    
    // Force reflow to ensure cleanup is applied before new animation
    appElement.offsetHeight;
    
    // Add transition classes
    appElement.classList.add('language-transitioning');
    appElement.classList.add(`language-accent-${targetLanguage}`);
    
    // Trigger callback at 50% point (when content is faded out)
    const callbackTimer = setTimeout(() => {
      if (callback) {
        callback();
      }
    }, 300); // 50% of 600ms animation

    // Remove classes after animation completes
    const cleanupTimer = setTimeout(() => {
      appElement.classList.remove('language-transitioning');
      appElement.classList.remove(`language-accent-${targetLanguage}`);
      appElement.style.removeProperty('--current-language-color');
      setIsTransitioning(false);
    }, 650); // Slightly longer than animation to ensure completion

    // Cleanup timers if component unmounts
    return () => {
      clearTimeout(callbackTimer);
      clearTimeout(cleanupTimer);
      setIsTransitioning(false);
    };
  }, [i18n.language, getLanguageColor]);

  return {
    triggerTransition,
    isTransitioning
  };
}