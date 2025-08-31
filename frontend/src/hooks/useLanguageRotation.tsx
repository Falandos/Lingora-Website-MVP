import { useState, useEffect, useCallback } from 'react';

interface Language {
  code: string;
  native: string;
  color: string;
  rtl?: boolean;
}

// All 15 available languages (same as LanguageCarousel)
const languages: Language[] = [
  { code: 'nl', native: 'Nederlands', color: '#FF6B35' }, // Dutch orange
  { code: 'en', native: 'English', color: '#3B82F6' }, // Classic blue
  { code: 'ar', native: 'العربية', color: '#059669', rtl: true }, // Arabic green
  { code: 'de', native: 'Deutsch', color: '#DC2626' }, // German red
  { code: 'es', native: 'Español', color: '#FBBF24' }, // Spanish yellow
  { code: 'fr', native: 'Français', color: '#6366F1' }, // French indigo
  { code: 'pl', native: 'Polski', color: '#EF4444' }, // Polish red
  { code: 'uk', native: 'Українська', color: '#0EA5E9' }, // Ukrainian blue
  { code: 'zh-Hans', native: '中文', color: '#DC2626' }, // Chinese red
  { code: 'tr', native: 'Türkçe', color: '#059669' }, // Turkish green
  { code: 'hi', native: 'हिन्दी', color: '#F97316' }, // Hindi orange
  { code: 'so', native: 'Soomaali', color: '#06B6D4' }, // Somali cyan
  { code: 'ti', native: 'ትግርኛ', color: '#8B5CF6' }, // Tigrinya purple
  { code: 'yue', native: '廣東話', color: '#EC4899' }, // Cantonese pink
  { code: 'zgh', native: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', color: '#10B981' } // Berber green
];

export interface UseLanguageRotationReturn {
  currentLanguage: Language;
  currentIndex: number;
  isVisible: boolean;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}

// Global singleton state for synchronized rotation
class LanguageRotationManager {
  private currentIndex: number = 0;
  private isVisible: boolean = true;
  private isPaused: boolean = false;
  private subscribers: Set<() => void> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private interval: number = 4500;

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    
    // Start timer if this is the first subscriber
    if (this.subscribers.size === 1) {
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
    
    this.timer = setInterval(() => {
      if (this.isPaused) return;
      
      this.isVisible = false;
      this.notifySubscribers();
      
      setTimeout(() => {
        this.currentIndex = (this.currentIndex + 1) % languages.length;
        this.isVisible = true;
        this.notifySubscribers();
      }, 200); // Quick fade out, then fade in
      
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
}

// Global instance
const rotationManager = new LanguageRotationManager();

export const useLanguageRotation = (_interval: number = 2500): UseLanguageRotationReturn => {
  const [, forceUpdate] = useState(0);

  // Force re-render when state changes
  const updateComponent = useCallback(() => {
    forceUpdate(prev => prev + 1);
  }, []);

  useEffect(() => {
    const unsubscribe = rotationManager.subscribe(updateComponent);
    return unsubscribe;
  }, [updateComponent]);

  const currentIndex = rotationManager.getCurrentIndex();
  const isVisible = rotationManager.getIsVisible();
  const isPaused = rotationManager.getIsPaused();
  const currentLanguage = languages[currentIndex];

  return {
    currentLanguage,
    currentIndex,
    isVisible,
    isPaused,
    setIsPaused: (paused: boolean) => rotationManager.setIsPaused(paused)
  };
};

export { languages };
export default useLanguageRotation;