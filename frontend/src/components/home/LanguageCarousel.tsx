import React from 'react';
import useLanguageRotation from '../../hooks/useLanguageRotation';

interface Language {
  code: string;
  native: string;
  color: string;
  rtl?: boolean;
}

interface LanguageCarouselProps {
  className?: string;
  interval?: number; // milliseconds between language changes
  renderWithTitle?: (currentLanguage: Language) => React.ReactNode;
}

export const LanguageCarousel = ({ className = '', interval = 2500, renderWithTitle }: LanguageCarouselProps) => {
  const { currentLanguage, isVisible, setIsPaused } = useLanguageRotation(interval);

  // If renderWithTitle is provided, use it to render the content with the current language
  if (renderWithTitle) {
    return (
      <div 
        className={`transition-all duration-300 ${className}`}
        style={{ 
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
        {renderWithTitle(currentLanguage)}
      </div>
    );
  }

  // Default rendering for when used as standalone component
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