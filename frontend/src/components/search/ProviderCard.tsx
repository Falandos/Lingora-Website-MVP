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
    <Card variant="hover" className="h-full">
      <CardBody className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <Link to={`/provider/${slug}`} className="group">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-1">
                {business_name}
              </h3>
            </Link>
            <div className="flex items-center text-gray-600 mb-2">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">{city}</span>
              {distance && (
                <>
                  <span className="mx-2 text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{distance.toFixed(1)} km</span>
                </>
              )}
            </div>
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

        {/* Languages */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span className="text-sm font-medium text-gray-700">Languages</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {displayLanguages.map((lang) => (
              <Badge key={lang.language_code} variant="secondary" size="sm">
                <img 
                  src={getFlagUrl(lang.language_code)} 
                  alt={lang.language_code}
                  className="w-4 h-3 mr-2 rounded-sm"
                />
                {currentLanguage === 'nl' ? lang.name_native : lang.name_en}
              </Badge>
            ))}
            {remainingLanguages > 0 && (
              <Badge variant="gray" size="sm">
                +{remainingLanguages} more
              </Badge>
            )}
          </div>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Services</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {services.slice(0, 3).map((service, index) => (
                <Badge key={index} variant="primary" size="sm">
                  {service.title}
                </Badge>
              ))}
              {services.length > 3 && (
                <Badge variant="gray" size="sm">
                  +{services.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Link to={`/provider/${slug}`}>
            <Button variant="outline" size="sm">
              View Profile
            </Button>
          </Link>
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => setShowContactModal(true)}
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
