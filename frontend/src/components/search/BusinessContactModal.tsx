import React, { useState, useEffect } from 'react';
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

interface BusinessContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: Provider;
  currentLanguage: string;
}

const BusinessContactModal: React.FC<BusinessContactModalProps> = ({
  isOpen,
  onClose,
  provider,
  currentLanguage
}) => {
  const { t } = useTranslation();
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setContactData(null); // Reset data when opening
      loadContactData();
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Handle escape key
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
  }, [isOpen, provider.slug, onClose]);

  const loadContactData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/providers/${provider.slug}`);
      
      if (response.ok) {
        const data = await response.json();
        setContactData(data.data || data);
      } else {
        console.error('Failed to load contact data');
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple backdrop click handler
  const handleBackdropClick = () => {
    onClose();
  };

  // Prevent modal content clicks from closing the modal
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
        onClick={handleModalClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{provider.business_name}</h2>
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
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-gray-600">Loading contact details...</span>
            </div>
          ) : (
            <>
              {/* Business Description */}
              {provider.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600 leading-relaxed">{provider.bio}</p>
                </div>
              )}

              {/* Contact Information */}
              {contactData && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Phone */}
                    {contactData.phone && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="bg-primary-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{contactData.phone}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(contactData.phone)}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                          title="Copy phone number"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Email */}
                    {contactData.email && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="bg-primary-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{contactData.email}</p>
                        </div>
                        <button 
                          onClick={() => copyToClipboard(contactData.email)}
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                          title="Copy email"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    )}

                    {/* Website */}
                    {contactData.website && (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="bg-primary-100 p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Website</p>
                          <a 
                            href={contactData.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-primary-600 hover:text-primary-800 transition-colors duration-200"
                          >
                            {contactData.website}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {contactData.address && (
                      <div className="flex items-start p-3 bg-gray-50 rounded-lg md:col-span-2">
                        <div className="bg-primary-100 p-2 rounded-lg mr-3 mt-0.5">
                          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium text-gray-900">
                            {contactData.address}
                            {contactData.postal_code && `, ${contactData.postal_code}`}
                            {contactData.city && `, ${contactData.city}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex space-x-3">
            <Button 
              variant="primary"
              onClick={() => window.location.href = `/provider/${provider.slug}`}
            >
              View Full Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessContactModal;