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

// Get category icon and styling
const getCategoryInfo = (category?: string) => {
  const categoryMap: Record<string, { icon: string; color: string; bgColor: string; }> = {
    'Healthcare': { icon: '🏥', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    'Legal Services': { icon: '⚖️', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    'Education': { icon: '📚', color: 'text-green-600', bgColor: 'bg-green-50' },
    'Professional Services': { icon: '💼', color: 'text-orange-600', bgColor: 'bg-orange-50' },
    'Technology': { icon: '💻', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    'Beauty & Wellness': { icon: '✨', color: 'text-pink-600', bgColor: 'bg-pink-50' },
    'Food & Catering': { icon: '🍽️', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  };
  
  return categoryMap[category || ''] || { icon: '💼', color: 'text-gray-600', bgColor: 'bg-gray-50' };
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
  primary_category?: string;
  category_id?: number;
  kvk_verified: boolean;
}

interface RecentProvidersCarouselProps {
  className?: string;
}

export const RecentProvidersCarousel = ({ className = '' }: RecentProvidersCarouselProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<RecentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchRecentProviders = async () => {
      try {
        const response = await fetch('/api/providers/recent');
        if (response.ok) {
          const data = await response.json();
          setProviders(data.providers || []);
        } else {
          // Fallback to three recent providers if API fails
          setProviders([
            {
              id: 33,
              business_name: 'Medisch Centrum Multicultureel Tilburg',
              slug: 'medisch-centrum-tilburg',
              city: 'Tilburg',
              created_at: '2025-08-26T01:31:05Z',
              languages: ['ar', 'de', 'en', 'es', 'fr', 'nl', 'tr'],
              bio_en: 'Healthcare for everyone. Doctors and specialists who speak your language.',
              primary_category: 'Healthcare',
              category_id: 1,
              kvk_verified: true
            },
            {
              id: 34,
              business_name: 'Juridisch Adviesbureau Nijmegen International',
              slug: 'juridisch-adviesbureau-nijmegen',
              city: 'Nijmegen',
              created_at: '2025-08-26T01:31:05Z',
              languages: ['de', 'en', 'es', 'nl', 'yue', 'zh-Hans'],
              bio_en: 'Legal advice for international students and professionals.',
              primary_category: 'Legal Services',
              category_id: 2,
              kvk_verified: true
            },
            {
              id: 35,
              business_name: 'Taalinstituut Haarlem International',
              slug: 'taalinstituut-haarlem',
              city: 'Haarlem',
              created_at: '2025-08-26T01:31:05Z',
              languages: ['ar', 'de', 'en', 'fr', 'nl', 'uk'],
              bio_en: 'Language lessons and interpreters in the heart of North Holland.',
              primary_category: 'Education',
              category_id: 3,
              kvk_verified: true
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

  // Auto-rotation effect
  useEffect(() => {
    if (!isAutoRotating || isPaused || providers.length <= 3) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const maxIndex = providers.length - 3; // Show 3 cards at a time
        return prev >= maxIndex ? 0 : prev + 1;
      });
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [providers.length, isAutoRotating, isPaused]);

  const nextSlide = () => {
    if (providers.length <= 3) return;
    setCurrentIndex((prev) => {
      const maxIndex = providers.length - 3;
      return prev >= maxIndex ? 0 : prev + 1;
    });
  };

  const prevSlide = () => {
    if (providers.length <= 3) return;
    setCurrentIndex((prev) => {
      const maxIndex = providers.length - 3;
      return prev <= 0 ? maxIndex : prev - 1;
    });
  };

  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  const handleProviderClick = (slug: string) => {
    navigate(`/provider/${slug}`);
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
    <section className={`py-16 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('carousel.recently_joined')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('carousel.verified_businesses')}
            </p>
          </div>

          {/* Carousel */}
          <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
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
                      variant="hover"
                      className="h-full group cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary-200 hover:scale-[1.02]"
                      onClick={() => handleProviderClick(provider.slug)}
                    >
                      <CardBody className="p-6 flex flex-col h-full">
                        {/* Header Row with Category and KVK Badge */}
                        <div className="flex items-start justify-between mb-4">
                          {provider.primary_category && (
                            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getCategoryInfo(provider.primary_category).color} ${getCategoryInfo(provider.primary_category).bgColor}`}>
                              <span className="text-sm">{getCategoryInfo(provider.primary_category).icon}</span>
                              {provider.primary_category}
                            </div>
                          )}
                          {provider.kvk_verified && (
                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              KVK
                            </div>
                          )}
                        </div>

                        {/* Business Name - Large and Prominent */}
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200 mb-3 line-clamp-2 leading-tight">
                          {provider.business_name}
                        </h3>

                        {/* City with Location Icon */}
                        <div className="flex items-center gap-2 text-gray-600 mb-6">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span className="font-medium">{provider.city}</span>
                        </div>

                        {/* Language Flags - Clean Row, No Label */}
                        <div className="flex-grow flex flex-col justify-end">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {provider.languages.slice(0, 6).map((langCode) => (
                              <img
                                key={langCode}
                                src={getFlagUrl(langCode)}
                                alt={langCode}
                                className="w-6 h-4 rounded-sm shadow-sm transition-transform duration-200 hover:scale-110"
                                loading="lazy"
                              />
                            ))}
                            {provider.languages.length > 6 && (
                              <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded-full font-medium">
                                +{provider.languages.length - 6}
                              </div>
                            )}
                          </div>
                        </div>
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 z-10"
                  aria-label="Previous providers"
                >
                  <svg className="w-5 h-5 text-gray-600 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center hover:border-primary-500 hover:bg-primary-50 z-10"
                  aria-label="Next providers"
                >
                  <svg className="w-5 h-5 text-gray-600 hover:text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Carousel Indicators */}
            {providers.length > 3 && (
              <div className="flex justify-center mt-6 gap-2">
                {Array.from({ length: providers.length - 2 }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      currentIndex === index 
                        ? 'bg-primary-600 w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
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
              {t('carousel.view_all_providers')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RecentProvidersCarousel;