import React from 'react';
import { useTranslation } from 'react-i18next';
import LanguageCarouselV2 from './LanguageCarouselV2';
import HeroSearchBarV2 from './HeroSearchBarV2';

interface HeroSectionV2Props {
  onLanguageClick?: (languageCode: string) => void;
  onShowHowItWorks?: () => void;
}

const HeroSectionV2 = ({ onLanguageClick, onShowHowItWorks }: HeroSectionV2Props) => {
  const { t } = useTranslation();

  return (
    <section className="relative bg-white">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233B82F6'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="pt-20 pb-24 sm:pt-24 sm:pb-32 lg:pb-40">
          <div className="text-center">

            {/* Main Headline */}
            <div className="animate-fade-in mb-32 lg:mb-40">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
                <div className="space-y-4 hero-text-container">
                  {/* Row 1: Fixed height for text before rotating language */}
                  <div className="h-20 flex items-center justify-center">
                    {t('home.hero_title_before') && (
                      <div className="text-gray-900">
                        {t('home.hero_title_before')}
                      </div>
                    )}
                  </div>
                  
                  {/* Row 2: Fixed height for rotating language carousel - V2 Version */}
                  <div className="h-24 flex items-center justify-center">
                    <LanguageCarouselV2 
                      className="language-text-shadow" 
                      onLanguageClick={onLanguageClick}
                      renderWithTitle={(currentLanguage) => (
                        <div 
                          className="language-text-shadow" 
                          style={{ color: currentLanguage.color }}
                        >
                          {currentLanguage.native}
                        </div>
                      )}
                    />
                  </div>
                  
                  {/* Row 3: Fixed height for text after rotating language */}
                  <div className="h-20 flex items-center justify-center">
                    {t('home.hero_title_after') && (
                      <div className="text-gray-900">
                        {t('home.hero_title_after')}
                      </div>
                    )}
                  </div>
                </div>
              </h1>
            </div>

            {/* Hero Search Bar V2 - Synced with Language Carousel */}
            <div className="animate-slide-up mb-16">
              <HeroSearchBarV2 onShowHowItWorks={onShowHowItWorks} />
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionV2;