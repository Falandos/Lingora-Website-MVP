import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  native: string;
  color: string;
  rtl?: boolean;
}

// Color mapping for languages (keeping visual consistency)
const languageColors: Record<string, string> = {
  'nl': '#FF6B35', // Dutch orange
  'en': '#3B82F6', // Classic blue
  'tr': '#DC2626', // Turkish red  
  'ar': '#059669', // Arabic green
  'uk': '#0EA5E9', // Ukrainian blue
  'de': '#6B7280', // German gray
  'pl': '#EF4444', // Polish red
  'fr': '#6366F1', // French indigo
  'es': '#FBBF24', // Spanish yellow
  'zh-Hans': '#DC2626', // Chinese red
  'hi': '#F97316', // Hindi orange
  'pt': '#10B981', // Portuguese green
  'it': '#059669', // Italian green
  'ru': '#DC2626', // Russian red
  'zgh': '#10B981', // Berber green
  'so': '#06B6D4', // Somali cyan
  'ti': '#8B5CF6', // Tigrinya purple
  'ur': '#059669' // Urdu green
};

// RTL languages
const rtlLanguages = ['ar', 'he', 'fa', 'ur'];

// Initialize with empty array - will be fetched from API
let languages: Language[] = [];

export interface UseLanguageRotationReturn {
  currentLanguage: Language;
  currentIndex: number;
  isVisible: boolean;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToLanguage: (index: number) => void;
}

// Global singleton state for synchronized rotation
class LanguageRotationManager {
  private currentIndex: number = 0;
  private isVisible: boolean = true;
  private isPaused: boolean = false;
  private subscribers: Set<() => void> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private interval: number = 4500;
  private initialized: boolean = false;
  private languagesLoaded: boolean = false;
  private currentUILanguage: string = 'en';

  // Fetch languages from API with UI language ordering
  private async fetchLanguages(uiLanguage: string = 'en'): Promise<void> {
    try {
      const response = await fetch(`/api/languages?ui_lang=${uiLanguage}`);
      if (response.ok) {
        const responseData = await response.json();
        const apiLanguages = responseData.data || responseData; // Handle wrapped response format
        
        // Convert API format to our Language interface
        languages = apiLanguages.map((lang: any) => ({
          code: lang.code,
          native: lang.name_native,
          color: languageColors[lang.code] || '#6B7280', // Default gray if color not found
          rtl: rtlLanguages.includes(lang.code)
        }));
        
        this.languagesLoaded = true;
        this.currentUILanguage = uiLanguage;
        
        // Notify subscribers that languages are loaded
        this.notifySubscribers();
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      // Fallback to basic languages if API fails
      languages = [
        { code: 'nl', native: 'Nederlands', color: '#FF6B35' },
        { code: 'en', native: 'English', color: '#3B82F6' },
        { code: 'tr', native: 'Türkçe', color: '#059669' },
        { code: 'ar', native: 'العربية', color: '#059669', rtl: true }
      ];
      this.languagesLoaded = true;
      this.notifySubscribers();
    }
  }

  // Update languages when UI language changes
  public async updateUILanguage(uiLanguage: string): Promise<void> {
    if (uiLanguage !== this.currentUILanguage) {
      await this.fetchLanguages(uiLanguage);
    }
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    
    // Initialize on first subscriber to ensure clean start
    if (!this.initialized) {
      this.initialized = true;
      this.currentIndex = 0;
      this.isVisible = true;
      
      // Fetch languages before starting timer
      this.fetchLanguages().then(() => {
        // Add delay to ensure smooth initial render
        setTimeout(() => {
          this.startTimer();
        }, 200);
      });
    } else if (this.subscribers.size === 1 && this.languagesLoaded) {
      // Start timer if this is the first subscriber after initialization and languages are loaded
      this.startTimer();
    }
    
    return () => {
      this.subscribers.delete(callback);
      // Stop timer if no more subscribers
      if (this.subscribers.size === 0) {
        this.stopTimer();
      }
    };
  }

  private startTimer() {
    if (this.timer) return;
    if (languages.length === 0) return; // Don't start timer if no languages loaded
    
    this.timer = setInterval(() => {
      if (this.isPaused || languages.length === 0) return;
      
      // For timer-based transitions, just increment normally
      // The component will handle the seamless display using the buffer system
      this.currentIndex = (this.currentIndex + 1) % languages.length;
      this.notifySubscribers();
      
    }, this.interval);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  getCurrentIndex() {
    return this.currentIndex;
  }

  getIsVisible() {
    return this.isVisible;
  }

  getIsPaused() {
    return this.isPaused;
  }

  setIsPaused(paused: boolean) {
    this.isPaused = paused;
    this.notifySubscribers();
  }

  // Manual navigation methods with seamless infinite loop support
  goToNext() {
    this.currentIndex = (this.currentIndex + 1) % languages.length;
    this.notifySubscribers();
  }

  goToPrevious() {
    this.currentIndex = (this.currentIndex - 1 + languages.length) % languages.length;
    this.notifySubscribers();
  }

  goToLanguage(index: number) {
    if (index >= 0 && index < languages.length && index !== this.currentIndex) {
      this.currentIndex = index;
      this.notifySubscribers();
    }
  }

  // Reset function to ensure clean state
  reset() {
    this.stopTimer();
    this.currentIndex = 0;
    this.isVisible = true;
    this.isPaused = false;
    this.initialized = false;
    this.notifySubscribers();
  }
}

// Global instance
const rotationManager = new LanguageRotationManager();

export const useLanguageRotation = (_interval: number = 2500): UseLanguageRotationReturn => {
  const { i18n } = useTranslation();
  const [, forceUpdate] = useState(0);

  // Force re-render when state changes
  const updateComponent = useCallback(() => {
    forceUpdate(prev => prev + 1);
  }, []);

  useEffect(() => {
    const unsubscribe = rotationManager.subscribe(updateComponent);
    return unsubscribe;
  }, [updateComponent]);

  // Update languages when UI language changes
  useEffect(() => {
    if (i18n.language) {
      rotationManager.updateUILanguage(i18n.language);
    }
  }, [i18n.language]);

  const currentIndex = rotationManager.getCurrentIndex();
  const isVisible = rotationManager.getIsVisible();
  const isPaused = rotationManager.getIsPaused();
  
  // Provide fallback language when languages haven't loaded yet
  const currentLanguage = languages[currentIndex] || {
    code: 'en',
    native: 'Loading...',
    color: '#3B82F6',
    rtl: false
  };

  return {
    currentLanguage,
    currentIndex,
    isVisible,
    isPaused,
    setIsPaused: (paused: boolean) => rotationManager.setIsPaused(paused),
    goToNext: () => rotationManager.goToNext(),
    goToPrevious: () => rotationManager.goToPrevious(),
    goToLanguage: (index: number) => rotationManager.goToLanguage(index)
  };
};

export { languages };
export default useLanguageRotation;