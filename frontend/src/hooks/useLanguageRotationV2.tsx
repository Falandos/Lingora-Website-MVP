import { useState, useEffect, useCallback } from 'react';

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

// COMPLETE LANGUAGES FOR NETHERLANDS LAUNCH - All major communities + expats
const languagesV2: Language[] = [
  { code: 'nl', native: 'Nederlands', color: '#FF6B35' },         // Dutch - primary (orange)
  { code: 'en', native: 'English', color: '#3B82F6' },           // English - international (blue)
  { code: 'tr', native: 'Türkçe', color: '#DC2626' },            // Turkish - large community (red)
  { code: 'ar', native: 'العربية', color: '#059669', rtl: true },  // Arabic - large community (green)
  { code: 'de', native: 'Deutsch', color: '#8B5CF6' },           // German - neighboring country (purple)
  { code: 'fr', native: 'Français', color: '#6366F1' },          // French - common in NL (indigo)
  { code: 'es', native: 'Español', color: '#FBBF24' },           // Spanish - growing community (yellow)
  { code: 'pl', native: 'Polski', color: '#EF4444' },            // Polish - large EU migration (bright red)
  { code: 'it', native: 'Italiano', color: '#10B981' },          // Italian - established community (emerald)
  { code: 'pt', native: 'Português', color: '#F59E0B' },         // Portuguese - growing (amber)
  { code: 'ru', native: 'Русский', color: '#EC4899' },           // Russian - Eastern European (pink)
  { code: 'uk', native: 'Українська', color: '#0EA5E9' },        // Ukrainian - recent refugees (sky blue)
  { code: 'zh', native: '中文', color: '#7C3AED' },               // Chinese - business/horeca community (violet)
  { code: 'hi', native: 'हिन्दी', color: '#F97316' },             // Hindi - Indian community (orange-red)
  { code: 'ur', native: 'اردو', color: '#06B6D4', rtl: true },    // Urdu - Pakistani community (cyan)
  { code: 'so', native: 'Soomaali', color: '#84CC16' },          // Somali - significant community (lime)
  { code: 'ro', native: 'Română', color: '#EAB308' },            // Romanian - EU migration (yellow-600)
  { code: 'bg', native: 'Български', color: '#DB2777' }           // Bulgarian - EU community (rose)
];

export interface UseLanguageRotationV2Return {
  currentLanguage: Language;
  currentIndex: number;
  visualIndex: number;
  isVisible: boolean;
  isPaused: boolean;
  isTransitioning: boolean;
  setIsPaused: (paused: boolean) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToLanguage: (index: number) => void;
}

// Global singleton state for synchronized rotation V2 with TRUE infinite scroll
class LanguageRotationManagerV2 {
  private logicalIndex: number = 0; // Which language (0-3)
  private visualIndex: number = 4; // Position in extended array (start in middle set)
  private isVisible: boolean = true;
  private isPaused: boolean = false;
  private subscribers: Set<() => void> = new Set();
  private timer: NodeJS.Timeout | null = null;
  private interval: number = 4500;
  private initialized: boolean = false;
  private isTransitioning: boolean = false;

  // Create extended array for seamless scrolling: [set0][set1][set2]
  private getExtendedArray() {
    return [...languagesV2, ...languagesV2, ...languagesV2];
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    
    // Initialize on first subscriber to ensure clean start
    if (!this.initialized) {
      this.initialized = true;
      this.logicalIndex = 0;
      this.visualIndex = languagesV2.length; // Start in middle set
      this.isVisible = true;
      
      // Start timer with delay for smooth initial render
      setTimeout(() => {
        this.startTimer();
      }, 200);
    } else if (this.subscribers.size === 1) {
      // Start timer if this is the first subscriber after initialization
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
      if (this.isPaused || this.isTransitioning) return;
      
      this.goToNext();
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

  private performSeamlessReset() {
    // If we're at the edges, seamlessly reset to equivalent position
    const totalLanguages = languagesV2.length;
    
    if (this.visualIndex >= 2 * totalLanguages) {
      // We're in the third set, reset to second set
      this.visualIndex = this.visualIndex - totalLanguages;
    } else if (this.visualIndex < totalLanguages) {
      // We're in the first set, reset to second set  
      this.visualIndex = this.visualIndex + totalLanguages;
    }
  }

  getCurrentIndex() {
    return this.logicalIndex;
  }

  getVisualIndex() {
    return this.visualIndex;
  }

  getIsVisible() {
    return this.isVisible;
  }

  getIsPaused() {
    return this.isPaused;
  }

  getIsTransitioning() {
    return this.isTransitioning;
  }

  setIsPaused(paused: boolean) {
    this.isPaused = paused;
    this.notifySubscribers();
  }

  // Manual navigation methods with TRUE seamless infinite scroll
  goToNext() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // Update logical index
    this.logicalIndex = (this.logicalIndex + 1) % languagesV2.length;
    
    // Update visual index
    this.visualIndex = this.visualIndex + 1;
    
    // Notify for visual transition
    this.notifySubscribers();
    
    // After transition completes, check if we need to reset
    setTimeout(() => {
      this.performSeamlessReset();
      this.isTransitioning = false;
      this.notifySubscribers();
    }, 500); // Match CSS transition duration
  }

  goToPrevious() {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    
    // Update logical index
    this.logicalIndex = (this.logicalIndex - 1 + languagesV2.length) % languagesV2.length;
    
    // Update visual index
    this.visualIndex = this.visualIndex - 1;
    
    // Notify for visual transition
    this.notifySubscribers();
    
    // After transition completes, check if we need to reset
    setTimeout(() => {
      this.performSeamlessReset();
      this.isTransitioning = false;
      this.notifySubscribers();
    }, 500); // Match CSS transition duration
  }

  goToLanguage(index: number) {
    if (index >= 0 && index < languagesV2.length && index !== this.logicalIndex && !this.isTransitioning) {
      this.isTransitioning = true;
      
      // Calculate the shortest path to the target
      const currentVisual = this.visualIndex;
      const targetLogical = index;
      
      // Find target in the middle set for consistency
      const targetVisual = languagesV2.length + targetLogical;
      
      this.logicalIndex = targetLogical;
      this.visualIndex = targetVisual;
      
      this.notifySubscribers();
      
      setTimeout(() => {
        this.isTransitioning = false;
        this.notifySubscribers();
      }, 500);
    }
  }

  // Reset function to ensure clean state
  reset() {
    this.stopTimer();
    this.logicalIndex = 0;
    this.visualIndex = languagesV2.length; // Start in middle set
    this.isVisible = true;
    this.isPaused = false;
    this.isTransitioning = false;
    this.initialized = false;
    this.notifySubscribers();
  }
}

// Global instance
const rotationManagerV2 = new LanguageRotationManagerV2();

export const useLanguageRotationV2 = (_interval: number = 2500): UseLanguageRotationV2Return => {
  const [, forceUpdate] = useState(0);

  // Force re-render when state changes
  const updateComponent = useCallback(() => {
    forceUpdate(prev => prev + 1);
  }, []);

  useEffect(() => {
    const unsubscribe = rotationManagerV2.subscribe(updateComponent);
    return unsubscribe;
  }, [updateComponent]);

  const currentIndex = rotationManagerV2.getCurrentIndex();
  const visualIndex = rotationManagerV2.getVisualIndex();
  const isVisible = rotationManagerV2.getIsVisible();
  const isPaused = rotationManagerV2.getIsPaused();
  const isTransitioning = rotationManagerV2.getIsTransitioning();
  
  // Get current language from hardcoded array using logical index
  const currentLanguage = languagesV2[currentIndex];

  return {
    currentLanguage,
    currentIndex,
    visualIndex, // Add visual index for component positioning
    isVisible,
    isPaused,
    isTransitioning, // Add transitioning state
    setIsPaused: (paused: boolean) => rotationManagerV2.setIsPaused(paused),
    goToNext: () => rotationManagerV2.goToNext(),
    goToPrevious: () => rotationManagerV2.goToPrevious(),
    goToLanguage: (index: number) => rotationManagerV2.goToLanguage(index)
  };
};

export { languagesV2 };
export default useLanguageRotationV2;