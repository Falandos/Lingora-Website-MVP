import React, { useState, useEffect } from 'react';
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
  
  // Track previous index for smooth infinite loop transitions
  const [previousIndex, setPreviousIndex] = useState(currentIndex);
  const [visualIndex, setVisualIndex] = useState(currentIndex);
  const [isResetting, setIsResetting] = useState(false);
  
  // Update visual index with smart wrap-around handling
  useEffect(() => {
    const isWrapAround = previousIndex === languages.length - 1 && currentIndex === 0;
    
    if (isWrapAround) {
      // Continue to the duplicate position instead of jumping
      setVisualIndex(languages.length); // Position 15, which is duplicate Nederlands
      
      // After transition, reset to the real position invisibly
      setTimeout(() => {
        setIsResetting(true);
        setVisualIndex(0);
        setTimeout(() => setIsResetting(false), 50); // Brief disable of transition
      }, 500); // Match transition duration
    } else {
      setVisualIndex(currentIndex);
    }
    
    setPreviousIndex(currentIndex);
  }, [currentIndex, previousIndex]);

  // Get dynamic height based on language script - Hindi needs extra space
  const getHeightForLanguage = (langCode: string): string => {
    if (langCode === 'hi') return '85px'; // Hindi needs extra height for Devanagari diacritics
    const tallScripts = ['ar', 'ti', 'zgh']; // Arabic, Tigrinya, Berber 
    return tallScripts.includes(langCode) ? '70px' : '65px';
  };

  // Get font size adjustment for specific languages
  const getFontSizeForLanguage = (langCode: string, isCurrent: boolean): string => {
    const baseSize = isCurrent ? '1em' : '0.85em';
    // Make Hindi 30% smaller to fit properly
    if (langCode === 'hi') {
      return isCurrent ? '0.7em' : '0.6em'; // 30% smaller
    }
    return baseSize;
  };

  // Helper function to get language at specific offset from current
  const getLanguageAtOffset = (offset: number) => {
    const index = (currentIndex + offset + languages.length) % languages.length;
    return languages[index];
  };

  // If renderWithTitle is provided, use it to render the content with the current language
  if (renderWithTitle) {
    const itemWidth = 320; // Increased width for each language item to account for dots
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
    
    // Create infinite loop by duplicating languages with large buffer for seamless transitions
    const extendedLanguages = [
      ...languages.slice(-5), // Last 5 languages at the beginning
      ...languages, // All languages
      ...languages, // Duplicate all languages again for smoother infinite loop
      ...languages.slice(0, 5) // First 5 languages at the end
    ];
    
    const adjustedIndex = visualIndex + 5; // Use visualIndex for smooth transitions
    
    return (
      <div 
        className={`relative overflow-hidden ${className}`}
        style={{ 
          width: '700px',
          height: getHeightForLanguage(currentLanguage.code),
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
          className={`flex items-center ${isResetting ? '' : 'transition-transform duration-500'}`}
          style={{
            transform: `translateX(${-adjustedIndex * itemWidth + centerOffset - itemWidth / 2}px)`, // Center the current item
            width: `${extendedLanguages.length * itemWidth}px`,
            willChange: 'transform', // Optimize for animations
            transitionTimingFunction: isResetting ? 'none' : 'cubic-bezier(0.4, 0, 0.2, 1)' // Disable during reset
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
                  fontSize: getFontSizeForLanguage(lang.code, isCurrent)
                }}
              >
                {isCurrent ? (
                  <div 
                    className="flex items-center"
                    style={{
                      alignItems: lang.code === 'hi' ? 'center' : 'center',
                      transform: lang.code === 'hi' ? 'translateY(5px)' : 'translateY(0px)',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ margin: '0 12px', color: 'rgb(209, 213, 219)', fontSize: '16px' }}>•</span>
                    {renderWithTitle(lang)}
                    <span style={{ margin: '0 12px', color: 'rgb(209, 213, 219)', fontSize: '16px' }}>•</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span style={{ margin: '0 8px', color: 'rgb(209, 213, 219)', fontSize: '12px', opacity: '0.3' }}>•</span>
                    <div 
                      className="language-text-shadow" 
                      style={{ color: lightenColor(lang.color) }}
                    >
                      {lang.native}
                    </div>
                    <span style={{ margin: '0 8px', color: 'rgb(209, 213, 219)', fontSize: '12px', opacity: '0.3' }}>•</span>
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
        direction: currentLanguage.rtl ? 'rtl' : 'ltr',
        minHeight: getHeightForLanguage(currentLanguage.code),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
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