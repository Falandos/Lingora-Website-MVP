import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import useLanguageRotationV2, { languagesV2 } from '../../hooks/useLanguageRotationV2';

interface Language {
  code: string;
  native: string;
  color: string;
  rtl?: boolean;
}

interface LanguageCarouselV2Props {
  className?: string;
  interval?: number; // milliseconds between language changes
  renderWithTitle?: (currentLanguage: Language) => React.ReactNode;
  onLanguageClick?: (languageCode: string) => void;
}

// Memoized Language Item Component for performance
const LanguageItemV2 = memo(({ 
  lang, 
  index, 
  itemWidth, 
  isCurrent, 
  isAdjacent, 
  renderWithTitle, 
  onLanguageClick, 
  getFontSizeForLanguage, 
  lightenColor, 
  goToLanguage, 
  languages 
}: {
  lang: Language;
  index: number;
  itemWidth: number;
  isCurrent: boolean;
  isAdjacent: boolean;
  renderWithTitle?: (currentLanguage: Language) => React.ReactNode;
  onLanguageClick?: (languageCode: string) => void;
  getFontSizeForLanguage: (langCode: string, isCurrent: boolean) => string;
  lightenColor: (color: string, amount?: number) => string;
  goToLanguage: (index: number) => void;
  languages: Language[];
}) => (
  <div
    className="flex items-center justify-center flex-shrink-0"
    style={{
      width: `${itemWidth}px`,
      opacity: isCurrent ? 1 : (isAdjacent ? 0.5 : 0.15),
      transition: 'opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)',
      direction: lang.rtl ? 'rtl' : 'ltr',
      fontSize: getFontSizeForLanguage(lang.code, isCurrent),
      transform: 'translateZ(0)' // Force GPU layer
    }}
  >
    {isCurrent ? (
      <div 
        className="flex items-center cursor-pointer"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          whiteSpace: 'nowrap',
          padding: '8px 12px',
          lineHeight: '1.2'
        }}
        onClick={() => {
          if (onLanguageClick) {
            onLanguageClick(lang.code);
          }
        }}
      >
        {renderWithTitle ? renderWithTitle(lang) : lang.native}
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
));

export const LanguageCarouselV2 = ({ className = '', interval = 2500, renderWithTitle, onLanguageClick }: LanguageCarouselV2Props) => {
  const { currentLanguage, currentIndex, visualIndex, isVisible, isTransitioning, setIsPaused, goToNext, goToPrevious, goToLanguage } = useLanguageRotationV2(interval);

  // Fixed height for all languages to prevent layout shift
  const FIXED_CAROUSEL_HEIGHT = '96px';

  // Get font size adjustment for specific languages
  const getFontSizeForLanguage = (langCode: string, isCurrent: boolean): string => {
    const baseSize = isCurrent ? '1em' : '0.85em';
    // Make Hindi 30% smaller to fit properly
    if (langCode === 'hi') {
      return isCurrent ? '0.7em' : '0.6em'; // 30% smaller
    }
    return baseSize;
  };

  // If renderWithTitle is provided, use it to render the content with the current language
  if (renderWithTitle) {
    // Standardized spacing configuration with perfect centering
    const ITEM_CONFIG = {
      width: 320,           // Fixed width for each language item
      spacing: 0,           // No gaps - width includes all spacing
      centerOffset: 350,    // Half of total carousel width (700px)
    };
    const itemWidth = ITEM_CONFIG.width;
    const totalWidth = 700; // Total carousel width
    const centerOffset = ITEM_CONFIG.centerOffset; // Consistent center calculation
    
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
    
    // Create seamless infinite loop with triple content duplication
    const seamlessLanguages = [
      ...languagesV2, // Set 1: Main content
      ...languagesV2, // Set 2: Seamless continuation  
      ...languagesV2  // Set 3: Buffer for smooth reset
    ];
    
    // Use visual index for positioning
    const displayIndex = visualIndex;
    
    return (
      <div 
        className={`relative flex items-center ${className}`}
        style={{ 
          width: '800px', // Wider to accommodate buttons
          height: FIXED_CAROUSEL_HEIGHT,
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
            height: FIXED_CAROUSEL_HEIGHT
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          role="status"
          aria-live="polite"
          aria-label={`Currently showing language: ${currentLanguage.native}`}
          title={`Language: ${currentLanguage.native} - V2 Correct Order`}
        >
          {/* Sliding Languages Container */}
        <div 
          className={`flex items-center ease-out ${isTransitioning ? 'transition-transform duration-500' : 'transition-none'}`}
          style={{
            transform: `translate3d(${centerOffset - displayIndex * itemWidth - itemWidth / 2}px, 0, 0)`, // Use visual index directly
            width: `${seamlessLanguages.length * itemWidth}px`,
            willChange: 'transform',
            backfaceVisibility: 'hidden', // Prevent flickering
            transformStyle: 'preserve-3d' // Enable hardware acceleration
          }}
        >
          {seamlessLanguages.map((lang, index) => {
            // Determine if this item is currently active based on visualIndex
            const isCurrent = index === displayIndex; // Use visual index directly
            const offset = index - displayIndex;
            const isAdjacent = Math.abs(offset) === 1;
            
            return (
              <LanguageItemV2
                key={`${lang.code}-${index}`}
                lang={lang}
                index={index}
                itemWidth={itemWidth}
                isCurrent={isCurrent}
                isAdjacent={isAdjacent}
                renderWithTitle={renderWithTitle}
                onLanguageClick={onLanguageClick}
                getFontSizeForLanguage={getFontSizeForLanguage}
                lightenColor={lightenColor}
                goToLanguage={goToLanguage}
                languages={languagesV2}
              />
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
        minHeight: FIXED_CAROUSEL_HEIGHT,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="status"
      aria-live="polite"
      aria-label={`Currently showing language: ${currentLanguage.native}`}
      title={`Language: ${currentLanguage.native} - V2 Correct Order`}
    >
      {currentLanguage.native}
    </span>
  );
};

export default LanguageCarouselV2;