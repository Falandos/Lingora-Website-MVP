import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';

// Get flag URL for language code (reusing from ProviderCard)
const getFlagUrl = (langCode: string) => {
  const countryCodeMap: Record<string, string> = {
    'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'zgh': 'ma',
    'uk': 'ua', 'pl': 'pl', 'zh-Hans': 'cn', 'yue': 'hk', 'es': 'es',
    'hi': 'in', 'tr': 'tr', 'fr': 'fr', 'ti': 'er', 'so': 'so'
  };
  const countryCode = countryCodeMap[langCode] || 'un';
  return `https://flagcdn.com/24x18/${countryCode}.png`;
};

interface RecentProvider {
  id: number;
  business_name: string;
  slug: string;
  city: string;
  created_at: string;
  languages: string[]; // Array of language codes
  bio_en?: string;
  bio_nl?: string;
}

interface RecentProvidersCarouselProps {
  className?: string;
}

export const RecentProvidersCarousel = ({ className = '' }: RecentProvidersCarouselProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<RecentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRecentProviders = async () => {
      try {
        const response = await fetch('/api/providers/recent');
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || []);
        } else {
          // Fallback to known data if API fails
          setProviders([
            {
              id: 32,
              business_name: 'International Education Center Zwolle',
              slug: 'education-center-zwolle',
              city: 'Zwolle',
              created_at: '2025-08-26T01:31:05Z',
              languages: ['ar', 'de', 'en', 'fr', 'hi', 'nl', 'pl'],
              bio_en: 'International education support and language lessons.'
            },
            {
              id: 33,
              business_name: 'Medisch Centrum Multicultureel Tilburg',
              slug: 'medisch-centrum-tilburg',
              city: 'Tilburg',
              created_at: '2025-08-26T01:31:05Z',
              languages: ['ar', 'de', 'en', 'es', 'fr', 'nl', 'tr', 'zgh'],
              bio_en: 'Healthcare for everyone. Doctors and specialists who speak your language.'
            },
            {
              id: 34,
              business_name: 'Juridisch Adviesbureau Nijmegen International',
              slug: 'juridisch-adviesbureau-nijmegen',
              city: 'Nijmegen',
              created_at: '2025-08-26T01:31:05Z',
              languages: ['de', 'en', 'es', 'nl', 'yue', 'zh-Hans'],
              bio_en: 'Legal advice for international students and professionals.'
            },
            {
              id: 35,
              business_name: 'Taalinstituut Haarlem International',
              slug: 'taalinstituut-haarlem',
              city: 'Haarlem',
              created_at: '2025-08-26T01:31:05Z',
              languages: ['ar', 'de', 'en', 'fr', 'nl', 'uk', 'zgh'],
              bio_en: 'Language lessons and interpreters in the heart of North Holland.'
            },
            {
              id: 36,
              business_name: 'Business Support Almere International',
              slug: 'business-support-almere',
              city: 'Almere',
              created_at: '2025-08-26T01:31:05Z',
              languages: ['en', 'es', 'hi', 'nl', 'uk'],
              bio_en: 'Business support for international entrepreneurs.'
            },
            {
              id: 37,
              business_name: 'Cultureel Integratiecentrum Friesland',
              slug: 'integratie-centrum-friesland',
              city: 'Leeuwarden',
              created_at: '2025-08-26T01:31:05Z',
              languages: ['ar', 'de', 'en', 'nl', 'so', 'yue', 'zh-Hans'],
              bio_en: 'Cultural integration and Dutch lessons in Friesland.'
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch recent providers:', error);
        // Fallback data here if needed
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProviders();
  }, []);

  const nextSlide = () => {
    if (providers.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, providers.length - 2)); // Show 3 at a time
  };

  const prevSlide = () => {
    if (providers.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + Math.max(1, providers.length - 2)) % Math.max(1, providers.length - 2));
  };

  const handleProviderClick = (slug: string) => {
    navigate(`/provider/${slug}`);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  if (loading) {
    return (
      <section className={`py-16 bg-white ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-96 mx-auto mb-12"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-200 rounded-xl h-64"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (providers.length === 0) {
    return null;
  }

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Recently Joined Professionals
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet our newest verified providers across the Netherlands, ready to serve you in your language.
            </p>
          </div>

          {/* Carousel */}
          <div className="relative">
            {/* Carousel Container */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / 3)}%)`
                }}
              >
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="flex-shrink-0 w-full md:w-1/3 px-3"
                  >
                    <Card
                      variant="interactive"
                      className="h-full group cursor-pointer"
                      onClick={() => handleProviderClick(provider.slug)}
                    >
                      <CardBody className="p-6 flex flex-col h-full">
                        {/* Provider Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-2 line-clamp-2">
                              {provider.business_name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              </svg>
                              {provider.city}
                            </div>
                          </div>
                          <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                            {formatDate(provider.created_at)}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 flex-grow">
                          {i18n.language === 'nl' ? provider.bio_nl : provider.bio_en}
                        </p>

                        {/* Language Flags */}
                        <div className="mb-4">
                          <div className="text-xs text-gray-500 mb-2">Languages:</div>
                          <div className="flex flex-wrap gap-1">
                            {provider.languages.slice(0, 8).map((langCode) => (
                              <img
                                key={langCode}
                                src={getFlagUrl(langCode)}
                                alt={langCode}
                                className="w-5 h-4 rounded shadow-sm"
                                loading="lazy"
                              />
                            ))}
                            {provider.languages.length > 8 && (
                              <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                                +{provider.languages.length - 8}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full group-hover:border-primary-600 group-hover:text-primary-600"
                        >
                          View Profile
                        </Button>
                      </CardBody>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            {providers.length > 3 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:border-primary-500"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:border-primary-500"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* View All Button */}
          <div className="text-center mt-12">
            <Button
              onClick={() => navigate('/search')}
              size="lg"
              variant="outline"
              className="px-8"
            >
              View All Providers
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentProvidersCarousel;