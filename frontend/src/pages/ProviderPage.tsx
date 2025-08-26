import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import ContactModal from '../components/provider/ContactModal';
import ContactInfoModal from '../components/provider/ContactInfoModal';

interface Provider {
  id: number;
  slug: string;
  name: string;
  city: string;
  bio_i18n: {
    nl: string;
    en: string;
  };
  languages: string[];
  opening_hours?: Record<string, { isOpen: boolean; slots: { open: string; close: string }[] }>;
  services: Array<{
    id: number;
    title: string;
    description_i18n: {
      nl: string;
      en: string;
    };
    price_min: number;
    price_max: number;
    currency: string;
    mode: string;
    contact_staff_id: number;
  }>;
  staff: Array<{
    id: number;
    name: string;
    role_title: string;
    languages: string[];
    email_public: string;
    phone_public?: string;
  }>;
  media: Array<{
    url: string;
    w: number;
    h: number;
  }>;
}

const ProviderPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [providerData, setProviderData] = useState<any>(null); // Store raw API data for contact info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactInfoModalOpen, setContactInfoModalOpen] = useState(false);

  const currentLang = i18n.language as 'nl' | 'en';

  useEffect(() => {
    const fetchProvider = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/providers/${slug}`);
        
        if (response.ok) {
          const result = await response.json();
          // Handle both mock and real API formats
          const providerData = result.data || result;
          
          if (providerData) {
            // Store raw data for contact info modal
            setProviderData(providerData);
            
            // Map backend fields to frontend expected format
            const mappedProvider = {
              id: providerData.id,
              slug: providerData.slug,
              name: providerData.business_name,
              city: providerData.city,
              bio_i18n: {
                nl: providerData.bio_nl || '',
                en: providerData.bio_en || ''
              },
              languages: (providerData.languages || []).map((lang: any) => lang.language_code),
              opening_hours: providerData.opening_hours || {},
              services: (providerData.services || []).map((service: any) => ({
                id: service.id,
                title: service.title,
                description_i18n: {
                  nl: service.description_nl || '',
                  en: service.description_en || ''
                },
                price_min: parseFloat(service.price_min || '0'),
                price_max: parseFloat(service.price_max || '0'),
                currency: 'EUR',
                mode: service.service_mode === 'online' ? 'online' : 'in_person',
                contact_staff_id: 0
              })),
              staff: (providerData.staff || []).map((member: any) => ({
                id: member.id,
                name: member.name,
                role_title: member.role || '',
                languages: (member.languages || []).map((lang: any) => lang.language_code),
                email_public: member.email || '',
                phone_public: member.phone || ''
              })),
              media: providerData.gallery || []
            };
            
            setProvider(mappedProvider);
          } else {
            setError('Provider not found');
          }
        } else {
          setError('Provider not found');
        }
      } catch (err) {
        setError('Failed to load provider');
        console.error('Provider fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [slug]);

  const getFlagUrl = (langCode: string) => {
    const countryCodeMap: Record<string, string> = {
      'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'zgh': 'ma',
      'uk': 'ua', 'pl': 'pl', 'zh': 'cn', 'yue': 'hk', 'es': 'es',
      'hi': 'in', 'tr': 'tr', 'fr': 'fr', 'ti': 'er', 'so': 'so'
    };
    const countryCode = countryCodeMap[langCode] || 'un';
    return `https://flagcdn.com/24x18/${countryCode}.png`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
              </div>
              <div>
                <div className="h-48 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container-custom">
          <Card>
            <CardBody className="p-12 text-center">
              <div className="text-6xl mb-4">😞</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Provider Not Found</h2>
              <p className="text-gray-600 mb-6">{error || 'The provider you are looking for does not exist.'}</p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <a href="/" className="hover:text-primary-600">Home</a>
            <span>›</span>
            <a href="/search" className="hover:text-primary-600">Search</a>
            <span>›</span>
            <span className="text-gray-900">{provider.name}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {provider.name}
          </h1>
          <p className="text-lg text-gray-600">
            📍 {provider.city}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery */}
            {provider.media && provider.media.length > 0 && (
              <Card>
                <CardBody className="p-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                    {provider.media.slice(0, 4).map((image, index) => (
                      <div key={index} className={`${index === 0 ? 'md:col-span-2' : ''}`}>
                        <img
                          src={image.url}
                          alt={`${provider.name} - Image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* About */}
            <Card>
              <CardBody>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">
                  {provider.bio_i18n[currentLang] || provider.bio_i18n.en}
                </p>
              </CardBody>
            </Card>

            {/* Services */}
            <Card>
              <CardBody>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
                <div className="space-y-4">
                  {provider.services.map((service) => (
                    <div key={service.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{service.title}</h3>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary-600">
                            €{service.price_min} - €{service.price_max}
                          </div>
                          <Badge variant={service.mode === 'online' ? 'secondary' : 'primary'} size="sm">
                            {service.mode === 'online' ? '💻 Online' : '🏢 In-person'}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-gray-600">
                        {service.description_i18n[currentLang] || service.description_i18n.en}
                      </p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Staff */}
            <Card>
              <CardBody>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Team</h2>
                <div className="space-y-4">
                  {provider.staff.map((member) => (
                    <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{member.name}</h3>
                        <p className="text-sm text-gray-600">{member.role_title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          {member.languages.map((lang) => (
                            <img
                              key={lang}
                              src={getFlagUrl(lang)}
                              alt={`${lang} flag`}
                              className="w-4 h-3 object-cover rounded-sm"
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setContactModalOpen(true)}
                        >
                          Contact
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Languages */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Languages Spoken</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.languages.map((lang) => (
                    <Badge key={lang} variant="secondary" className="flex items-center">
                      <img
                        src={getFlagUrl(lang)}
                        alt={`${lang} flag`}
                        className="w-4 h-3 object-cover rounded-sm mr-2"
                      />
                      {lang.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Opening Hours */}
            {provider.opening_hours && (
              <Card>
                <CardBody>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Opening Hours</h3>
                  <div className="space-y-2 text-sm">
                    {Object.entries(provider.opening_hours).map(([day, dayInfo]: [string, any]) => (
                      <div key={day} className="flex justify-between">
                        <span className="capitalize font-medium text-gray-700">{day}</span>
                        <span className="text-gray-600">
                          {dayInfo.isOpen && dayInfo.slots?.length > 0
                            ? dayInfo.slots.map((slot: any, index: number) => 
                                `${slot.open} - ${slot.close}`
                              ).join(', ')
                            : 'Closed'
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Contact */}
            <Card>
              <CardBody>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
                <Button 
                  className="w-full mb-3"
                  onClick={() => setContactModalOpen(true)}
                >
                  📧 Send Message
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setContactInfoModalOpen(true)}
                >
                  📞 View Contact Info
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {provider && (
        <ContactModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          providerId={provider.id}
          providerName={provider.name}
        />
      )}

      {/* Contact Info Modal */}
      {providerData && (
        <ContactInfoModal
          isOpen={contactInfoModalOpen}
          onClose={() => setContactInfoModalOpen(false)}
          provider={{
            business_name: providerData.business_name || '',
            city: providerData.city || '',
            phone: providerData.phone || '',
            email: providerData.email || '',
            website: providerData.website || '',
            address: providerData.address || '',
            postal_code: providerData.postal_code || ''
          }}
        />
      )}
    </div>
  );
};

export default ProviderPage;