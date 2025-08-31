import React from 'react';
import useLanguageRotation, { languages } from '../../hooks/useLanguageRotation';

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
  const { currentLanguage, currentIndex, isVisible, setIsPaused } = useLanguageRotation(interval);

  // Helper function to get language at specific offset from current
  const getLanguageAtOffset = (offset: number) => {
    const index = (currentIndex + offset + languages.length) % languages.length;
    return languages[index];
  };

  // If renderWithTitle is provided, use it to render the content with the current language
  if (renderWithTitle) {
    const itemWidth = 280; // Width for each language item
    const totalWidth = 700; // Total carousel width
    const centerOffset = totalWidth / 2; // Dynamic center calculation
    
    // Helper function to lighten a color
    const lightenColor = (color: string, amount: number = 0.6): string => {
      // Convert hex color to lighter version
      const hex = color.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      
      const lightR = Math.round(r + (255 - r) * amount);
      const lightG = Math.round(g + (255 - g) * amount);
      const lightB = Math.round(b + (255 - b) * amount);
      
      return `rgb(${lightR}, ${lightG}, ${lightB})`;
    };
    
    // Create infinite loop by duplicating languages
    const extendedLanguages = [
      ...languages.slice(-2), // Last 2 languages at the beginning
      ...languages, // All languages
      ...languages.slice(0, 2) // First 2 languages at the end
    ];
    
    const adjustedIndex = currentIndex + 2; // Adjust for the prepended languages
    
    return (
      <div 
        className={`relative overflow-hidden ${className}`}
        style={{ 
          width: '700px',
          height: '80px',
          margin: '0 auto'
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        role="status"
        aria-live="polite"
        aria-label={`Currently showing language: ${currentLanguage.native}`}
        title={`Language: ${currentLanguage.native}`}
      >
        {/* Sliding Languages Container */}
        <div 
          className="flex items-center transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(${-adjustedIndex * itemWidth + centerOffset - itemWidth / 2}px)`, // Center the current item
            width: `${extendedLanguages.length * itemWidth}px`
          }}
        >
          {extendedLanguages.map((lang, index) => {
            const offset = index - adjustedIndex;
            const isCurrent = offset === 0;
            const isAdjacent = Math.abs(offset) === 1;
            
            return (
              <div
                key={`${lang.code}-${index}`}
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: `${itemWidth}px`,
                  opacity: isCurrent ? 1 : (isAdjacent ? 0.5 : 0.15),
                  transition: 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)',
                  direction: lang.rtl ? 'rtl' : 'ltr',
                  fontSize: isCurrent ? '1em' : '0.85em'
                }}
              >
                {isCurrent ? (
                  renderWithTitle(lang)
                ) : (
                  <div 
                    className="language-text-shadow" 
                    style={{ color: lightenColor(lang.color) }}
                  >
                    {lang.native}
                  </div>
                )}
              </div>
            );
          })}
        </div>
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