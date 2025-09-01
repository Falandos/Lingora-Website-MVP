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
  onLanguageClick?: (languageCode: string) => void;
}

export const LanguageCarousel = ({ className = '', interval = 2500, renderWithTitle, onLanguageClick }: LanguageCarouselProps) => {
  const { currentLanguage, currentIndex, isVisible, setIsPaused, goToNext, goToPrevious, goToLanguage } = useLanguageRotation(interval);

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
    
    // Create proper infinite loop by duplicating languages at both ends
    const extendedLanguages = [
      ...languages.slice(-3), // Last 3 languages at the beginning (buffer)
      ...languages, // All languages 
      ...languages.slice(0, 3) // First 3 languages at the end (buffer)
    ];
    
    const adjustedIndex = currentIndex + 3; // Offset by buffer size
    
    return (
      <div 
        className={`relative flex items-center ${className}`}
        style={{ 
          width: '800px', // Wider to accommodate buttons
          height: getHeightForLanguage(currentLanguage.code),
          margin: '0 auto'
        }}
      >
        {/* Left Navigation Arrow */}
        <button
          onClick={goToPrevious}
          className="w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 mr-4"
          title="Previous language"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Carousel Container */}
        <div 
          className="relative overflow-hidden flex-1"
          style={{ 
            width: '700px',
            height: getHeightForLanguage(currentLanguage.code)
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
          className="flex items-center transition-transform duration-500"
          style={{
            transform: `translateX(${-adjustedIndex * itemWidth + centerOffset - itemWidth / 2}px)`, // Center the current item
            width: `${extendedLanguages.length * itemWidth}px`,
            willChange: 'transform', // Optimize for animations
            transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
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
                    className="flex items-center cursor-pointer"
                    style={{
                      alignItems: lang.code === 'hi' ? 'center' : 'center',
                      transform: lang.code === 'hi' ? 'translateY(5px)' : 'translateY(0px)',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center'
                    }}
                    onClick={() => {
                      if (onLanguageClick) {
                        onLanguageClick(lang.code);
                      }
                    }}
                  >
                    {renderWithTitle(lang)}
                  </div>
                ) : (
                  <div 
                    className="flex items-center cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => {
                      // Find the real language index (not extended array index)
                      const realIndex = languages.findIndex(l => l.code === lang.code);
                      if (realIndex !== -1) {
                        goToLanguage(realIndex);
                        if (onLanguageClick) {
                          onLanguageClick(lang.code);
                        }
                      }
                    }}
                  >
                    <div 
                      className="language-text-shadow" 
                      style={{ color: lightenColor(lang.color) }}
                    >
                      {lang.native}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </div>

        {/* Right Navigation Arrow */}
        <button
          onClick={goToNext}
          className="w-8 h-8 bg-white/80 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 ml-4"
          title="Next language"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
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