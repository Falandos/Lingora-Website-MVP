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
  const displayLanguages = languages.slice(0, 3);
  const remainingLanguages = languages.length - 3;

  return (
    <Card variant="hover" className="h-full cursor-pointer group" onClick={() => window.location.href = `/provider/${slug}`}>
      <CardBody className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-1">
              {business_name}
            </h3>
            <p className="text-sm text-gray-500 mb-2">
              {city}
              {distance && <span> • {Math.round(distance)} km away</span>}
            </p>
          </div>
          
          {/* Gallery Preview */}
          {gallery.length > 0 && (
            <div className="ml-4 flex-shrink-0">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
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
          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {bio}
          </p>
        )}

        {/* Languages - Text with Small Flags */}
        {languages.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Languages:</span>{' '}
              <span className="inline-flex items-center flex-wrap gap-1">
                {displayLanguages.map((lang, index) => (
                  <span key={lang.language_code} className="inline-flex items-center">
                    <img 
                      src={getFlagUrl(lang.language_code)} 
                      alt={lang.language_code}
                      className="w-3 h-2 mr-1 rounded-sm"
                    />
                    <span>{currentLanguage === 'nl' ? lang.name_native : lang.name_en}</span>
                    {index < displayLanguages.length - 1 && <span className="mx-1">,</span>}
                  </span>
                ))}
                {remainingLanguages > 0 && <span className="text-gray-500 ml-1"> +{remainingLanguages} more</span>}
              </span>
            </p>
          </div>
        )}

        {/* Services - Clean Summary Format */}
        {services.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              <span className="font-medium">
                {services.length} service{services.length !== 1 ? 's' : ''}
              </span>
              {services.length > 0 && services[0].category_name && (
                <span className="text-gray-500"> in {services[0].category_name}</span>
              )}
            </p>
          </div>
        )}

        {/* Single Action Button */}
        <div className="flex justify-end pt-4 border-t border-gray-50">
          <Button 
            variant="primary" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click when clicking contact
              setShowContactModal(true);
            }}
          >
            Contact
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
