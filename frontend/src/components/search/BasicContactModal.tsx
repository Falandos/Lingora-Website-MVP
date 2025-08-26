import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

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

interface BasicContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  city: string;
  bio?: string;
  slug: string;
  languages: Language[];
  services: Service[];
  currentLanguage: string;
}

const BasicContactModal: React.FC<BasicContactModalProps> = ({
  isOpen,
  onClose,
  businessName,
  city,
  bio,
  slug,
  languages,
  services,
  currentLanguage
}) => {
  const [contactData, setContactData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch contact data when modal opens
  useEffect(() => {
    if (isOpen && !contactData) {
      setLoading(true);
      fetch(`/api/providers/${slug}`)
        .then(response => response.json())
        .then(data => {
          setContactData(data.data || data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error loading contact data:', error);
          setLoading(false);
        });
    }
  }, [isOpen, slug, contactData]);

  // Reset data when modal closes
  useEffect(() => {
    if (!isOpen) {
      setContactData(null);
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 flex items-center justify-center min-h-full p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{businessName}</h3>
              <p className="text-sm text-gray-600">{city}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
          
          {/* Content */}
          <div className="space-y-4 mb-6">
            {/* Bio */}
            {bio ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">About</h4>
                <p className="text-gray-700 text-sm">{bio}</p>
              </div>
            ) : null}
            
            {/* Languages */}
            {languages.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {languages.map((lang) => (
                    <span key={lang.language_code} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {currentLanguage === 'nl' ? lang.name_native : lang.name_en}
                      <span className="ml-1 opacity-75">({lang.cefr_level})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Services */}
            {services.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Services</h4>
                <div className="space-y-2">
                  {services.slice(0, 3).map((service, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-primary-600 rounded-full mr-3"></div>
                      <span className="text-gray-900">{service.title}</span>
                      <span className="text-gray-500 ml-2">({service.category_name})</span>
                    </div>
                  ))}
                  {services.length > 3 && (
                    <p className="text-xs text-gray-500 ml-5">+{services.length - 3} more services</p>
                  )}
                </div>
              </div>
            )}
            
            {/* Contact Information */}
            {loading ? (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mx-auto mb-2"></div>
                <p className="text-xs text-gray-600">Loading contact details...</p>
              </div>
            ) : contactData ? (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2">
                  {contactData.phone && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-gray-900">{contactData.phone}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(contactData.phone)}
                        className="ml-2 text-gray-400 hover:text-primary-600"
                        title="Copy phone number"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {contactData.email && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-900">{contactData.email}</span>
                      <button 
                        onClick={() => navigator.clipboard.writeText(contactData.email)}
                        className="ml-2 text-gray-400 hover:text-primary-600"
                        title="Copy email"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  {contactData.website && (
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      <a 
                        href={contactData.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-800 underline"
                      >
                        {contactData.website}
                      </a>
                    </div>
                  )}
                  
                  {contactData.address && (
                    <div className="flex items-start text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="text-gray-900">
                        <div>{contactData.address}</div>
                        <div>{contactData.postal_code} {contactData.city}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-blue-800">
                    Contact information not available in quick preview.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Close
            </button>
            <button
              onClick={() => window.location.href = `/provider/${slug}`}
              className="flex-1 px-4 py-2 bg-primary-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              View Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default BasicContactModal;