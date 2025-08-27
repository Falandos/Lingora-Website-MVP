import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
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
  latitude?: number;
  longitude?: number;
  gallery: string[];
  languages: Language[];
  services: Service[];
  distance?: number;
  currentLanguage: string;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  id,
  business_name,
  slug,
  city,
  bio_nl,
  bio_en,
  gallery,
  languages,
  services,
  distance,
  currentLanguage,
}) => {
  const { t } = useTranslation();
  const [showContactModal, setShowContactModal] = useState(false);

  const bio = currentLanguage === 'nl' ? bio_nl : bio_en;
  const displayLanguages = languages; // Show all languages without truncation
  const remainingLanguages = 0; // No truncation needed

  return (
    <Card variant="hover" className="h-full cursor-pointer group hover:shadow-lg transition-shadow duration-200" onClick={() => window.location.href = `/provider/${slug}`}>
      <CardBody className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-1">
              {business_name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>{city}</span>
              {distance && (
                <div className="flex items-center gap-1">
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {Math.round(distance)} km
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Gallery Preview */}
          {gallery.length > 0 && (
            <div className="ml-4 flex-shrink-0">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 ring-2 ring-white shadow-sm">
                <img
                  src={gallery[0]}
                  alt={business_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bio */}
        {bio && (
          <p className="text-gray-600 text-sm leading-relaxed mb-3 line-clamp-1">
            {bio}
          </p>
        )}

        {/* Language Flag Grid - Clean & Scannable */}
        {languages.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
              {displayLanguages.map((lang) => (
                <div
                  key={lang.language_code}
                  className="group"
                >
                  <img 
                    src={getFlagUrl(lang.language_code)} 
                    alt={currentLanguage === 'nl' ? lang.name_native : lang.name_en}
                    className="w-6 h-4 rounded-sm border border-white shadow-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Single Action Button */}
        <div className="flex justify-end pt-3 mt-2 border-t border-gray-100">
          <Button 
            variant="primary" 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 transition-colors duration-150"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when clicking contact
              setShowContactModal(true);
            }}
          >
            Contact Provider
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
