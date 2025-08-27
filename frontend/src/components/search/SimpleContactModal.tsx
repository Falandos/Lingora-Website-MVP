import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface Language {
  language_code: string;
  cefr_level: string;
  name_en: string;
  name_native: string;
}

interface Service {
  title: string;
  service_mode: string;
  category_name: string;
}

interface Provider {
  id: number;
  business_name: string;
  city: string;
  bio?: string;
  languages: Language[];
  services: Service[];
  slug: string;
}

interface SimpleContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
  currentLanguage: string;
}

const SimpleContactModal: React.FC<SimpleContactModalProps> = ({
  isOpen,
  onClose,
  provider,
  currentLanguage
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{provider.business_name}</h2>
            <p className="text-gray-600 flex items-center mt-1">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {provider.city}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Business Description */}
          {provider.bio && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
              <p className="text-gray-600 leading-relaxed">{provider.bio}</p>
            </div>
          )}

          {/* Languages */}
          {provider.languages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages Spoken</h3>
              <div className="flex flex-wrap gap-2">
                {provider.languages.map((lang) => (
                  <Badge key={lang.language_code} variant="secondary" size="sm">
                    {currentLanguage === 'nl' ? lang.name_native : lang.name_en}
                    <span className="ml-1 text-xs opacity-75">({lang.cefr_level})</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          {provider.services.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Available</h3>
              <div className="grid grid-cols-1 gap-3">
                {provider.services.map((service, index) => (
                  <div key={index} className="flex items-center p-3 bg-primary-50 rounded-lg">
                    <div className="bg-primary-100 p-2 rounded-lg mr-3">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{service.title}</p>
                      <p className="text-sm text-gray-600">{service.category_name}</p>
                      {service.service_mode && (
                        <p className="text-xs text-primary-600 capitalize mt-1">{service.service_mode.replace('_', ' ')}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">Contact Information</p>
                <p className="text-sm text-blue-700 mt-1">
                  View the full profile to see contact details including phone, email, and address.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="primary"
            onClick={() => window.location.href = `/provider/${provider.slug}`}
          >
            View Full Profile & Contact
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SimpleContactModal;