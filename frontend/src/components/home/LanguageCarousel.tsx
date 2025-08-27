import { useState, useEffect } from 'react';

interface Language {
  code: string;
  native: string;
  color: string;
  rtl?: boolean;
}

interface LanguageCarouselProps {
  className?: string;
  interval?: number; // milliseconds between language changes
}

export const LanguageCarousel = ({ className = '', interval = 2500 }: LanguageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // All 15 available languages with beautiful colors and native names
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

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setIsVisible(false);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % languages.length);
        setIsVisible(true);
      }, 200); // Quick fade out, then fade in
      
    }, interval);

    return () => clearInterval(timer);
  }, [interval, languages.length, isPaused]);

  const currentLanguage = languages[currentIndex];

  return (
    <span 
      className={`inline-block min-w-[180px] sm:min-w-[220px] text-center transition-all duration-300 ${className}`}
      style={{ 
        color: currentLanguage.color,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0px)' : 'translateY(-10px)',
        direction: currentLanguage.rtl ? 'rtl' : 'ltr'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
      aria-live="polite"
      aria-label={`Currently showing language: ${currentLanguage.native}`}
      title={`Language: ${currentLanguage.native}`}
    >
      {currentLanguage.native}
    </span>
  );
};

export default LanguageCarousel;