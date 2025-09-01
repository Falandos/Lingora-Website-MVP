import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import BusinessIcon from '../ui/BusinessIcon';
import BasicContactModal from './BasicContactModal';

interface Language {
  language_code: string;
  cefr_level: string;
  name_en: string;
  name_native: string;
}

// Get flag URL for language code
const getFlagUrl = (langCode: string) => {
  const countryCodeMap: Record<string, string> = {
    'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'zgh': 'ma',
    'uk': 'ua', 'pl': 'pl', 'zh': 'cn', 'yue': 'hk', 'es': 'es',
    'hi': 'in', 'tr': 'tr', 'fr': 'fr', 'ti': 'er', 'so': 'so'
  };
  const countryCode = countryCodeMap[langCode] || 'un';
  return `https://flagcdn.com/24x18/${countryCode}.png`;
};

interface Service {
  title: string;
  service_mode: string;
  category_name: string;
}

interface ProviderCardProps {
  id: number;
  business_name: string;
  slug: string;
  city: string;
  bio_nl?: string;
  bio_en?: string;
  logo_url?: string;
  latitude?: number;
  longitude?: number;
  gallery: string[];
  languages: Language[];
  services: Service[];
  distance?: number;
  currentLanguage: string;
  activeLanguageFilters?: string[]; // Currently filtered languages for smart highlighting
  openingHours?: Record<string, { isOpen: boolean; slots: { open: string; close: string }[] }>;
  isOpen?: boolean | null; // true = open, false = closed, null = no hours data
  rating?: number; // Future Google ratings integration (1-5 stars)
  reviewCount?: number; // Future review count
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  id,
  business_name,
  slug,
  city,
  bio_nl,
  bio_en,
  logo_url,
  gallery,
  languages,
  services,
  distance,
  currentLanguage,
  activeLanguageFilters = [],
  openingHours,
  isOpen,
  rating,
  reviewCount,
}) => {
  const { t } = useTranslation();
  const [showContactModal, setShowContactModal] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  const bio = currentLanguage === 'nl' ? bio_nl : bio_en;
  const displayLanguages = languages.slice(0, 3); // Show max 3 languages
  const remainingLanguages = Math.max(0, languages.length - 3); // Count remaining languages

  // Determine flag styling based on active language filters
  const getFlagClassName = (langCode: string) => {
    const hasActiveFilters = activeLanguageFilters.length > 0;
    const isMatchingFilter = activeLanguageFilters.includes(langCode);
    const baseClasses = "w-6 h-4 rounded-sm border border-white shadow-sm transition-all duration-200 hover:scale-110 transform";
    
    if (hasActiveFilters && isMatchingFilter) {
      // Show in color - only when filter is active AND matches
      return `${baseClasses} hover:shadow-md`;
    } else {
      // Show greyed - default state (no filters) OR non-matching when filters active
      return `${baseClasses} grayscale opacity-40 hover:opacity-70 hover:grayscale-50`;
    }
  };

  return (
    <Card variant="hover" className="h-full cursor-pointer group hover:shadow-lg transition-shadow duration-200" onClick={() => window.location.href = `/provider/${slug}`}>
      <CardBody className="p-4 sm:p-6 flex flex-col h-full relative">
        {/* Header with Business Name and Logo */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-2 truncate">
              {business_name}
            </h3>
            
            {/* Rating Placeholder - Future Google Ratings Integration */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-4 h-4 ${
                      rating && star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              {rating ? (
                <span className="text-sm text-gray-600">
                  {rating.toFixed(1)} {reviewCount ? `(${reviewCount})` : ''}
                </span>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  Ratings coming soon
                </span>
              )}
            </div>
          </div>
          
          {/* Business Logo */}
          <div className="ml-4 flex-shrink-0">
            {logo_url ? (
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
                <img
                  src={logo_url}
                  alt={`${business_name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const parent = target.parentElement;
                    if (parent) {
                      parent.style.display = 'none';
                      const fallbackDiv = parent.nextElementSibling as HTMLElement;
                      if (fallbackDiv) {
                        fallbackDiv.style.display = 'flex';
                      }
                    }
                  }}
                />
              </div>
            ) : null}
            <div className={`${logo_url ? 'hidden' : 'flex'}`} style={{ display: logo_url ? 'none' : 'flex' }}>
              <BusinessIcon size="md" />
            </div>
          </div>
        </div>

        {/* Bio - Centered */}
        {bio && (
          <div className="mb-4 text-center">
            <p className={`text-gray-600 text-sm leading-relaxed ${
              bioExpanded ? '' : 'line-clamp-2'
            }`}>
              {bio}
            </p>
            {bio.length > 150 && (
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card click
                  setBioExpanded(!bioExpanded);
                }}
                className="text-primary-600 hover:text-primary-700 text-xs font-medium mt-1 transition-colors focus:outline-none focus:underline"
              >
                {bioExpanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Language Capabilities - CENTERED & PROMINENT (Key USP) */}
        {languages.length > 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="text-center mb-3">
              <span className="text-sm font-semibold text-gray-800 tracking-wide flex items-center justify-center gap-2">
                <span className="text-lg">🗣️</span>
                {t('provider.we_speak_language')}
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {displayLanguages.map((lang) => (
                <div
                  key={lang.language_code}
                  className="group relative"
                  title={currentLanguage === 'nl' ? lang.name_native : lang.name_en}
                >
                  <img 
                    src={getFlagUrl(lang.language_code)} 
                    alt={currentLanguage === 'nl' ? lang.name_native : lang.name_en}
                    className={getFlagClassName(lang.language_code)}
                  />
                </div>
              ))}
              {remainingLanguages > 0 && (
                <div className="flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-sm text-xs font-medium">
                  +{remainingLanguages}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom Row - Location Info (Bottom Left) and Contact Button (Bottom Right) */}
        <div className="flex items-end justify-between mt-auto pt-4">
          {/* Location and Status Info - Bottom Left */}
          <div className="flex flex-col gap-1 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{city}</span>
            
            <div className="flex flex-wrap gap-2">
              {/* Open/Closed Status */}
              {isOpen !== null && (
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  isOpen 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isOpen ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {isOpen ? 'Open Now' : 'Closed'}
                </span>
              )}
              
              {/* Distance */}
              {distance && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {Math.round(distance)} {t('provider.distance_km')}
                </span>
              )}
            </div>
          </div>

          {/* Quick Contact Button - Bottom Right */}
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors duration-150 border-0 min-h-[44px] px-4 sm:min-h-[36px] sm:px-3 ml-4"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when clicking contact
              setShowContactModal(true);
            }}
          >
            {t('provider.quick_contact')}
          </Button>
        </div>
      </CardBody>

      {/* Contact Modal */}
      <BasicContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        businessName={business_name}
        city={city}
        bio={bio}
        slug={slug}
        languages={languages}
        services={services}
        currentLanguage={currentLanguage}
      />
    </Card>
  );
};

export default ProviderCard;
