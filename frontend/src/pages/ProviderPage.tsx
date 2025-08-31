import { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import ContactModal from '../components/provider/ContactModal';
import ContactInfoModal from '../components/provider/ContactInfoModal';
import { EditModeProvider, useEditMode } from '../contexts/EditModeContext';
import EditModeToggle from '../components/provider/EditModeToggle';
import EditModeIndicator from '../components/provider/EditModeIndicator';
import { EditableText } from '../components/editable';
import EditableServiceSection from '../components/provider/EditableServiceSection';
import EditableStaffSection from '../components/provider/EditableStaffSection';
import LocationEditModal from '../components/provider/LocationEditModal';
import SocialLinksModal from '../components/provider/SocialLinksModal';
import OpeningHoursEditModal from '../components/provider/OpeningHoursEditModal';
import GalleryManagementModal from '../components/provider/GalleryManagementModal';
import LogoUploadModal from '../components/provider/LogoUploadModal';
import BusinessIcon from '../components/ui/BusinessIcon';

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
  // Use edit mode hook
  const { isEditMode, canEdit, enterEditMode, exitEditMode, autoSave } = useEditMode();
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [providerData, setProviderData] = useState<any>(null); // Store raw API data for contact info
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactInfoModalOpen, setContactInfoModalOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [socialLinksModalOpen, setSocialLinksModalOpen] = useState(false);
  const [openingHoursModalOpen, setOpeningHoursModalOpen] = useState(false);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);
  const [revealedContacts, setRevealedContacts] = useState<Record<number, { email?: boolean; phone?: boolean }>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  
  // 🎨 Whimsical state
  const [showConfetti, setShowConfetti] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({ team: 0, languages: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0);
  const statsRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language as 'nl' | 'en';

  // 🎨 Whimsical utility functions
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  const animateValue = (start: number, end: number, duration: number, callback: (value: number) => void) => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (end - start) + start);
      callback(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  // 🎨 Intersection Observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, [isVisible]);

  // 🎨 Animate stats when visible
  useEffect(() => {
    if (isVisible && provider) {
      animateValue(0, provider.staff?.length || 0, 1200, (value) => {
        setAnimatedStats(prev => ({ ...prev, team: value }));
      });
      animateValue(0, provider.languages?.length || 0, 1500, (value) => {
        setAnimatedStats(prev => ({ ...prev, languages: value }));
      });
    }
  }, [isVisible, provider]);

  // 🎨 Loading message rotation
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setCurrentLoadingMessage(prev => (prev + 1) % 5); // 5 messages
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  // Auto-enter edit mode if URL contains edit=true, exit if parameter is removed
  useEffect(() => {
    const shouldEdit = searchParams.get('edit') === 'true';
    if (shouldEdit && canEdit && !isEditMode) {
      enterEditMode();
    } else if (!shouldEdit && isEditMode) {
      exitEditMode();
    }
  }, [searchParams, canEdit, isEditMode, enterEditMode, exitEditMode]);

  useEffect(() => {
    const fetchProvider = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/providers/${slug}`);
        
        if (response.ok) {
          const result = await response.json();
          const providerData = result.data || result;
          
          if (providerData) {
            const enhancedProviderData = {
              ...providerData,
              social_links: providerData.social_links || {}
            };
            setProviderData(enhancedProviderData);
            
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
                mode: service.service_mode || 'both'
              })),
              staff: (providerData.staff || []).map((staffMember: any) => ({
                id: staffMember.id,
                name: staffMember.name,
                role_title: staffMember.role,
                languages: (staffMember.languages || []).map((lang: any) => 
                  typeof lang === 'string' ? lang : lang.language_code
                ),
                email_public: staffMember.email,
                phone_public: staffMember.phone,
                email: staffMember.email,
                phone: staffMember.phone
              })),
              media: (providerData.gallery || []).map((item: any) => ({
                url: item.url || item,
                alt: item.alt || 'Gallery image',
                w: item.width || 800,
                h: item.height || 600
              }))
            };
            
            setProvider(mappedProvider);
          }
        } else {
          setError('Provider not found');
        }
      } catch (err) {
        setError('Failed to load provider');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [slug]);

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
            // Add mock social media data for testing visual layout
            const enhancedProviderData = {
              ...providerData,
              social_links: providerData.social_links || {
                linkedin: `https://linkedin.com/company/${providerData.slug}`,
                facebook: `https://facebook.com/${providerData.slug}`,
                instagram: `https://instagram.com/${providerData.slug}`,
                twitter: `https://x.com/${providerData.slug}`,
                youtube: `https://youtube.com/@${providerData.slug}`
              }
            };
            setProviderData(enhancedProviderData);
            
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
              media: (providerData.gallery && providerData.gallery.length > 0) ? providerData.gallery : (() => {
                // Mock gallery data for different providers to test layouts
                const providerId = providerData.id;
                
                // Simple business photos for all providers
                const businessPhotos = [
                  'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&h=400&fit=crop', // Medical office
                  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&h=400&fit=crop', // Professional office
                  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop', // Hospital room
                  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop', // Conference room
                  'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600&h=400&fit=crop', // Clean office
                  'https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&h=400&fit=crop', // Waiting area
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', // Library/study
                  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop', // Modern office
                  'https://images.unsplash.com/photo-1493606278519-11aa9f86e40a?w=600&h=400&fit=crop', // Reception area
                  'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop'  // Consultation room
                ];
                
                // Different layouts for testing
                const specialProviders: Record<number, any[]> = {
                  // Provider 1: Single photo (medical center)
                  1: [{ url: businessPhotos[0], w: 600, h: 400 }],
                  
                  // Provider 2: Two photos (legal office)  
                  2: [
                    { url: businessPhotos[1], w: 600, h: 400 },
                    { url: businessPhotos[3], w: 600, h: 400 }
                  ],
                  
                  // Provider 8: Four photos (hospital)
                  8: [
                    { url: businessPhotos[2], w: 600, h: 400 },
                    { url: businessPhotos[0], w: 600, h: 400 },
                    { url: businessPhotos[9], w: 600, h: 400 },
                    { url: businessPhotos[5], w: 600, h: 400 }
                  ],
                  
                  // Provider 9: Six photos (law firm)
                  9: [
                    { url: businessPhotos[1], w: 600, h: 400 },
                    { url: businessPhotos[3], w: 600, h: 400 },
                    { url: businessPhotos[7], w: 600, h: 400 },
                    { url: businessPhotos[8], w: 600, h: 400 },
                    { url: businessPhotos[6], w: 600, h: 400 },
                    { url: businessPhotos[4], w: 600, h: 400 }
                  ]
                };
                
                // Give special providers their layouts, others get a single photo
                if (specialProviders[providerId]) {
                  return specialProviders[providerId];
                } else {
                  // All other providers get one photo based on their ID
                  const photoIndex = (providerId - 1) % businessPhotos.length;
                  return [{ url: businessPhotos[photoIndex], w: 600, h: 400 }];
                }
              })()
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

  // Click outside handler to close contact reveals
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close all contact reveals if clicking outside
      const target = event.target as Element;
      if (!target.closest('.contact-reveal')) {
        setRevealedContacts({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (lightboxOpen) {
        switch (event.key) {
          case 'Escape':
            setLightboxOpen(false);
            break;
          case 'ArrowLeft':
            prevLightboxImage();
            break;
          case 'ArrowRight':
            nextLightboxImage();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [lightboxOpen]);

  const getFlagUrl = (langCode: string) => {
    const countryCodeMap: Record<string, string> = {
      'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'zgh': 'ma',
      'uk': 'ua', 'pl': 'pl', 'zh': 'cn', 'zh-cn': 'cn', 'zh-Hans': 'cn', 
      'yue': 'hk', 'es': 'es', 'hi': 'in', 'tr': 'tr', 'fr': 'fr', 
      'ti': 'er', 'so': 'so', 'pt': 'pt', 'ru': 'ru', 'ber': 'ma'
    };
    const countryCode = countryCodeMap[langCode] || 'un';
    return `https://flagcdn.com/24x18/${countryCode}.png`;
  };

  const toggleContactReveal = (staffId: number, type: 'email' | 'phone') => {
    setRevealedContacts(prev => ({
      ...prev,
      [staffId]: {
        ...prev[staffId],
        [type]: !prev[staffId]?.[type]
      }
    }));
  };

  const openLightbox = (imageIndex: number) => {
    setLightboxImageIndex(imageIndex);
    setLightboxOpen(true);
  };

  const nextLightboxImage = () => {
    if (provider?.media) {
      setLightboxImageIndex((prev) => (prev + 1) % provider.media.length);
    }
  };

  const prevLightboxImage = () => {
    if (provider?.media) {
      setLightboxImageIndex((prev) => (prev - 1 + provider.media.length) % provider.media.length);
    }
  };

  const handleLocationSave = async (locationData: any): Promise<boolean> => {
    try {
      console.log('Saving location data:', locationData);
      
      // Update the providerData state immediately for instant feedback
      setProviderData((prev: any) => {
        const updated = {
          ...prev,
          ...locationData
        };
        console.log('Updated provider data:', updated);
        return updated;
      });
      
      // Save each field to the backend using autoSave functionality
      const savePromises = [
        autoSave('address', locationData.address || ''),
        autoSave('postal_code', locationData.postal_code || ''),
        autoSave('city', locationData.city || '')
      ];
      
      const results = await Promise.all(savePromises);
      console.log('Backend save results:', results);
      
      return true;
    } catch (error) {
      console.error('Failed to save location data:', error);
      return false;
    }
  };

  const handleSocialLinksSave = async (socialData: any): Promise<boolean> => {
    try {
      console.log('Saving social links data:', socialData);
      
      // Update the providerData state immediately for instant feedback
      setProviderData((prev: any) => {
        const updated = {
          ...prev,
          website: socialData.website,
          social_links: {
            linkedin: socialData.linkedin,
            facebook: socialData.facebook,
            instagram: socialData.instagram,
            twitter: socialData.twitter,
            youtube: socialData.youtube
          },
          google_business_url: socialData.google_business_url
        };
        console.log('Updated provider data with social links:', updated);
        return updated;
      });
      
      // Save each field to the backend using autoSave functionality
      const savePromises = [
        autoSave('website', socialData.website || ''),
        autoSave('linkedin', socialData.linkedin || ''),
        autoSave('facebook', socialData.facebook || ''),
        autoSave('instagram', socialData.instagram || ''),
        autoSave('twitter', socialData.twitter || ''),
        autoSave('youtube', socialData.youtube || ''),
        autoSave('google_business_url', socialData.google_business_url || '')
      ];
      
      const results = await Promise.all(savePromises);
      console.log('Backend social links save results:', results);
      
      return true;
    } catch (error) {
      console.error('Failed to save social links data:', error);
      return false;
    }
  };

  const handleOpeningHoursSave = async (openingHoursData: any): Promise<boolean> => {
    try {
      console.log('Saving opening hours data:', openingHoursData);
      
      // Update the provider state immediately for instant feedback
      setProvider((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          opening_hours: openingHoursData
        };
      });
      
      // Save opening hours to the backend using autoSave functionality
      const savePromises = Object.entries(openingHoursData).map(([day, dayInfo]: [string, any]) => {
        return autoSave(`opening_hours_${day}`, JSON.stringify(dayInfo));
      });
      
      const results = await Promise.all(savePromises);
      console.log('Backend opening hours save results:', results);
      
      return true;
    } catch (error) {
      console.error('Failed to save opening hours data:', error);
      return false;
    }
  };

  const handleGallerySave = async (mediaData: any[]): Promise<boolean> => {
    try {
      console.log('Saving gallery data:', mediaData);
      
      // Update the provider state immediately for instant feedback
      setProvider((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          media: mediaData
        };
      });
      
      // In a real app, you'd upload the images to your server here
      // For now, we'll just save the image references using autoSave
      const galleryJson = JSON.stringify(mediaData);
      await autoSave('gallery', galleryJson);
      
      console.log('Backend gallery save complete');
      
      return true;
    } catch (error) {
      console.error('Failed to save gallery data:', error);
      return false;
    }
  };

  const handleLogoSave = async (logoUrl: string): Promise<boolean> => {
    try {
      console.log('Saving logo URL:', logoUrl);
      
      // Update the providerData state immediately for instant feedback
      setProviderData((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          logo_url: logoUrl
        };
      });
      
      console.log('Backend logo save complete');
      
      return true;
    } catch (error) {
      console.error('Failed to save logo:', error);
      return false;
    }
  };

  // 🎨 Loading messages for whimsical experience
  const loadingMessages = [
    "🔍 Finding amazing professionals who speak your language...",
    "✨ Gathering multilingual superpowers...",
    "🌍 Connecting cultures and expertise...",
    "🤝 Preparing personalized recommendations...",
    "📱 Almost there! Getting everything ready..."
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 py-8 flex items-center">
        <div className="container-custom">
          <div className="text-center mb-8">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-lg font-medium text-gray-700 transition-all duration-500 ease-in-out">
              {loadingMessages[currentLoadingMessage]}
            </p>
          </div>
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-1/3 mb-6 bg-[length:200%_100%] animate-shimmer"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-full bg-[length:200%_100%] animate-shimmer"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-2/3 bg-[length:200%_100%] animate-shimmer"></div>
                </div>
              </div>
              <div>
                <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-xl bg-[length:200%_100%] animate-shimmer"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    const sadEmojis = ['😞', '😔', '😟', '😢', '😭'];
    const encouragingMessages = [
      "Don't worry! There are lots of other amazing professionals waiting to help you.",
      "Oops! This one got away, but we have many more language experts for you.",
      "No worries! Let's find you someone even better.",
      "Sometimes the best connections take a little more searching.",
      "Hey, it happens! Let's get you back to finding the perfect match."
    ];
    
    const randomEmoji = sadEmojis[Math.floor(Math.random() * sadEmojis.length)];
    const randomMessage = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];

    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 py-8 flex items-center">
        <div className="container-custom">
          <Card className="transform hover:scale-105 transition-transform duration-300">
            <CardBody className="p-12 text-center">
              <div className="text-8xl mb-6 animate-bounce">{randomEmoji}</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Oops! Provider Not Found</h2>
              <p className="text-lg text-gray-600 mb-2">{error || 'The provider you are looking for does not exist.'}</p>
              <p className="text-gray-500 mb-8 italic">{randomMessage}</p>
              <div className="space-y-3">
                <Button 
                  onClick={() => window.history.back()}
                  className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Take Me Back
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = '/search'}
                  className="hover:scale-105 transition-transform duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Other Providers
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 animate-fade-in">
    <div className="container-custom">
        {/* Enhanced Hero Section */}
        <div className="mb-8">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <a href="/" className="hover:text-primary-600 transition-colors">Home</a>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a href="/search" className="hover:text-primary-600 transition-colors">Search</a>
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{provider.name}</span>
          </div>
          
          {/* Logo and Business Title */}
          <div className="mb-6 flex items-start gap-6">
            {/* Business Logo */}
            <div className="flex-shrink-0 relative group">
              {providerData?.logo_url ? (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg">
                  <img 
                    src={providerData.logo_url}
                    alt={`${providerData.business_name || provider.name} logo`}
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
              <div className={`${providerData?.logo_url ? 'hidden' : 'flex'}`} style={{ display: providerData?.logo_url ? 'none' : 'flex' }}>
                <BusinessIcon size="lg" className="w-20 h-20 md:w-24 md:h-24" />
              </div>
              
              {/* Edit Logo Button */}
              {canEdit && isEditMode && (
                <button
                  onClick={() => setLogoModalOpen(true)}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center group-hover:scale-110"
                  title="Edit Logo"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Business Title */}
            <div className="flex-1 edit-section">
              <EditableText
                value={providerData?.business_name || provider.name}
                field="business_name"
                placeholder="Enter business name..."
                maxLength={100}
                displayClassName="text-4xl md:text-5xl font-bold text-gray-900 leading-tight"
              />
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <Card>
              <CardBody className="edit-section">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About</h2>
                <EditableText
                  value={providerData?.[`bio_${currentLang}`] || provider.bio_i18n[currentLang] || provider.bio_i18n.en}
                  field={`bio_${currentLang}`}
                  placeholder={`Write your business description in ${currentLang.toUpperCase()}...`}
                  multiline={true}
                  maxLength={1000}
                  showEditIcon={false}  // Remove edit icon for cleaner About section
                  className="mb-4"
                  displayClassName="text-gray-700 leading-relaxed"
                />

                {/* Social Media Links Section */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Follow Us</h4>
                    {canEdit && isEditMode && (
                      <button
                        onClick={() => setSocialLinksModalOpen(true)}
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Edit Social Links
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Website Link */}
                    {providerData?.website && (
                      <a
                        href={providerData.website.startsWith('http') ? providerData.website : `https://${providerData.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                        </svg>
                        Website
                      </a>
                    )}

                    {/* LinkedIn */}
                    {providerData?.social_links?.linkedin && (
                      <a
                        href={providerData.social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                        LinkedIn
                      </a>
                    )}

                    {/* Facebook */}
                    {providerData?.social_links?.facebook && (
                      <a
                        href={providerData.social_links.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </a>
                    )}

                    {/* Instagram */}
                    {providerData?.social_links?.instagram && (
                      <a
                        href={providerData.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-pink-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                        </svg>
                        Instagram
                      </a>
                    )}

                    {/* Twitter/X */}
                    {providerData?.social_links?.twitter && (
                      <a
                        href={providerData.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-black transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        X (Twitter)
                      </a>
                    )}

                    {/* YouTube */}
                    {providerData?.social_links?.youtube && (
                      <a
                        href={providerData.social_links.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        YouTube
                      </a>
                    )}

                    {/* Google Business */}
                    {providerData?.google_business_url && (
                      <a
                        href={providerData.google_business_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google Reviews
                      </a>
                    )}
                    
                    {/* Show message if no social links */}
                    {!providerData?.website && 
                     !providerData?.social_links?.linkedin && 
                     !providerData?.social_links?.facebook && 
                     !providerData?.social_links?.instagram && 
                     !providerData?.social_links?.twitter && 
                     !providerData?.social_links?.youtube && 
                     !providerData?.google_business_url && (
                      <span className="text-sm text-gray-500 italic">
                        {canEdit && isEditMode ? 'Click "Edit Social Links" to add your online presence' : 'No social links added yet'}
                      </span>
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Services */}
            <Card>
              <CardBody>
                <EditableServiceSection 
                  services={provider.services}
                  currentLang={currentLang}
                />
              </CardBody>
            </Card>

            {/* Business Gallery */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Our Space
                    {provider.media && provider.media.length > 0 && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({provider.media.length} photo{provider.media.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </h2>
                  {canEdit && isEditMode && (
                    <button
                      onClick={() => setGalleryModalOpen(true)}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Manage Gallery
                    </button>
                  )}
                </div>
                
                {provider.media && provider.media.length > 0 ? (
                  <>
                    {(() => {
                      const imageCount = provider.media.length;
                    
                    if (imageCount === 1) {
                      // Single photo: Full width
                      return (
                        <div className="cursor-pointer" onClick={() => openLightbox(0)}>
                          <img
                            src={provider.media[0].url}
                            alt={`${provider.name} - Business photo`}
                            className="w-full h-64 md:h-80 object-cover rounded-lg hover:opacity-95 transition-opacity"
                          />
                        </div>
                      );
                    } else if (imageCount === 2) {
                      // Two photos: Side by side
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          {provider.media.map((image, index) => (
                            <div key={index} className="cursor-pointer" onClick={() => openLightbox(index)}>
                              <img
                                src={image.url}
                                alt={`${provider.name} - Photo ${index + 1}`}
                                className="w-full h-48 md:h-64 object-cover rounded-lg hover:opacity-95 transition-opacity"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      // 3+ photos: Grid layout with first photo larger (Airbnb style)
                      return (
                        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-80">
                          {/* Main large photo */}
                          <div className="col-span-2 row-span-2 cursor-pointer" onClick={() => openLightbox(0)}>
                            <img
                              src={provider.media[0].url}
                              alt={`${provider.name} - Main photo`}
                              className="w-full h-full object-cover rounded-lg hover:opacity-95 transition-opacity"
                            />
                          </div>
                          
                          {/* Smaller photos */}
                          {provider.media.slice(1, 5).map((image, index) => (
                            <div 
                              key={index + 1} 
                              className="col-span-1 row-span-1 cursor-pointer relative" 
                              onClick={() => openLightbox(index + 1)}
                            >
                              <img
                                src={image.url}
                                alt={`${provider.name} - Photo ${index + 2}`}
                                className="w-full h-full object-cover rounded-lg hover:opacity-95 transition-opacity"
                              />
                              
                              {/* "View all" overlay for last visible image if there are more */}
                              {index === 3 && provider.media.length > 5 && (
                                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-lg flex items-center justify-center">
                                  <div className="text-white text-center">
                                    <div className="text-xl font-bold">+{provider.media.length - 5}</div>
                                    <div className="text-sm">more photos</div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    })()}
                  
                    {/* Photo caption/description */}
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Click any photo to view larger • See our professional environment and facilities
                    </p>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No photos uploaded yet</h3>
                    <p className="text-gray-500 mb-4">
                      {canEdit && isEditMode 
                        ? 'Upload images to showcase your business environment and facilities'
                        : 'Photos will appear here once uploaded'
                      }
                    </p>
                    {canEdit && isEditMode && (
                      <button
                        onClick={() => setGalleryModalOpen(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                      >
                        Upload Photos
                      </button>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Team Languages Emphasis */}
            <Card>
              <CardBody>
                <EditableStaffSection 
                  staff={provider.staff}
                  triggerConfetti={triggerConfetti}
                />
              </CardBody>
            </Card>

            {/* Get in Touch */}
            <Card>
              <CardBody>
                <h3 className="text-xl font-bold text-gray-900 mb-5">Get in Touch</h3>
                
                {/* Contact Buttons */}
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl"
                    onClick={() => {
                      setContactModalOpen(true);
                      triggerConfetti();
                    }}
                  >
                    <span className="font-semibold">💬 Send Message</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full hover:scale-105 active:scale-95 transition-all duration-200 border-2 hover:border-primary-300 hover:bg-primary-50"
                    onClick={() => {
                      setContactInfoModalOpen(true);
                      // Small celebration for viewing contact info
                      setTimeout(() => triggerConfetti(), 500);
                    }}
                  >
                    <span className="font-medium">📞 View Contact Info</span>
                  </Button>
                </div>
              </CardBody>
            </Card>

            {/* Location */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">Location</h3>
                  {canEdit && isEditMode && (
                    <button
                      onClick={() => setLocationModalOpen(true)}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Details
                    </button>
                  )}
                </div>
                
                {providerData && (
                  <div className="space-y-4">
                    {/* Interactive Map Preview */}
                    <div 
                      className="w-full h-48 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg flex items-center justify-center cursor-pointer hover:from-blue-100 hover:to-green-100 hover:shadow-md transition-all duration-200 border border-blue-100 hover:border-blue-200 group"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(providerData.address + ', ' + providerData.city)}`, '_blank')}
                      title="Click to open in Google Maps"
                    >
                      <div className="text-center">
                        <svg className="w-12 h-12 text-primary-500 mx-auto mb-3 group-hover:scale-110 group-hover:text-primary-600 transition-all duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-sm font-semibold text-gray-700 mb-1 group-hover:text-gray-900 transition-colors duration-200">📍 View Interactive Map</p>
                        <p className="text-xs text-gray-500 mb-1">{providerData.city}, Netherlands</p>
                        <p className="text-xs text-primary-600 font-medium group-hover:text-primary-700 transition-colors duration-200">Click to explore neighborhood →</p>
                      </div>
                    </div>

                    {/* Address Details - Clean display */}
                    <div>
                      <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div className="text-sm w-full">
                          {/* Street Address */}
                          <div className="font-medium text-gray-900 mb-1">
                            {providerData?.address || 'No address provided'}
                          </div>
                          
                          {/* Postal Code & City */}
                          <div className="text-gray-600 mb-3">
                            <span>
                              {providerData?.postal_code} {providerData?.city}
                              {(!providerData?.postal_code && !providerData?.city) && 'Location details not provided'}
                            </span>
                          </div>
                          
                          {/* Action Links */}
                          <div className="flex items-center gap-3">
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((providerData?.address || '') + ', ' + (providerData?.city || ''))}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center hover:scale-105 transition-all duration-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002 2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              Get directions
                            </a>
                            <a 
                              href={`https://www.google.com/maps/@${providerData?.latitude || '52.3676'},${providerData?.longitude || '4.9041'},17z`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-secondary-600 hover:text-secondary-800 text-sm font-medium inline-flex items-center hover:scale-105 transition-all duration-200"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              Street view
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Accessibility Info - Placeholder for future implementation */}
                    {providerData.accessibility_info && (
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-start space-x-2">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 mb-1">Accessibility</div>
                            <div className="text-gray-600">{providerData.accessibility_info}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Opening Hours */}
            <Card>
              <CardBody>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">Opening Hours</h3>
                  {canEdit && isEditMode && (
                    <button
                      onClick={() => setOpeningHoursModalOpen(true)}
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Hours
                    </button>
                  )}
                </div>
                
                {provider.opening_hours && Object.keys(provider.opening_hours).length > 0 ? (
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
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">
                      {canEdit && isEditMode 
                        ? 'No opening hours set yet. Click "Edit Hours" to add your schedule.'
                        : 'Opening hours not available'
                      }
                    </p>
                  </div>
                )}
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

      {/* Location Edit Modal */}
      {providerData && (
        <LocationEditModal
          isOpen={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          locationData={{
            address: providerData.address || '',
            postal_code: providerData.postal_code || '',
            city: providerData.city || ''
          }}
          onSave={handleLocationSave}
        />
      )}

      {/* Social Links Edit Modal */}
      {providerData && (
        <SocialLinksModal
          isOpen={socialLinksModalOpen}
          onClose={() => setSocialLinksModalOpen(false)}
          socialData={{
            website: providerData.website || '',
            linkedin: providerData.social_links?.linkedin || '',
            facebook: providerData.social_links?.facebook || '',
            instagram: providerData.social_links?.instagram || '',
            twitter: providerData.social_links?.twitter || '',
            youtube: providerData.social_links?.youtube || '',
            google_business_url: providerData.google_business_url || ''
          }}
          onSave={handleSocialLinksSave}
        />
      )}

      {/* Opening Hours Edit Modal */}
      {provider && (
        <OpeningHoursEditModal
          isOpen={openingHoursModalOpen}
          onClose={() => setOpeningHoursModalOpen(false)}
          openingHoursData={provider.opening_hours || {
            monday: { isOpen: false, slots: [] },
            tuesday: { isOpen: false, slots: [] },
            wednesday: { isOpen: false, slots: [] },
            thursday: { isOpen: false, slots: [] },
            friday: { isOpen: false, slots: [] },
            saturday: { isOpen: false, slots: [] },
            sunday: { isOpen: false, slots: [] }
          }}
          onSave={handleOpeningHoursSave}
        />
      )}

      {/* Gallery Management Modal */}
      {provider && (
        <GalleryManagementModal
          isOpen={galleryModalOpen}
          onClose={() => setGalleryModalOpen(false)}
          media={provider.media || []}
          onSave={handleGallerySave}
        />
      )}

      {/* Logo Upload Modal */}
      {providerData && (
        <LogoUploadModal
          isOpen={logoModalOpen}
          onClose={() => setLogoModalOpen(false)}
          currentLogoUrl={providerData.logo_url}
          businessName={providerData.business_name || ''}
          onSave={handleLogoSave}
        />
      )}

      {/* Lightbox Modal */}
      {lightboxOpen && provider?.media && provider.media.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold z-10"
          >
            ×
          </button>
          
          {/* Navigation arrows */}
          {provider.media.length > 1 && (
            <>
              <button
                onClick={prevLightboxImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-3xl font-bold z-10"
              >
                ‹
              </button>
              <button
                onClick={nextLightboxImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 text-3xl font-bold z-10"
              >
                ›
              </button>
            </>
          )}
          
          {/* Main image */}
          <div className="max-w-full max-h-full flex items-center justify-center">
            <img
              src={provider.media[lightboxImageIndex].url}
              alt={`${provider.name} - Photo ${lightboxImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Image counter */}
          {provider.media.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
              {lightboxImageIndex + 1} of {provider.media.length}
            </div>
          )}
          
          {/* Click outside to close */}
          <div
            className="absolute inset-0 -z-10"
            onClick={() => setLightboxOpen(false)}
          />
        </div>
      )}

      {/* 🎉 Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 animate-confetti"
                style={{
                  backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][i % 7],
                  left: `${Math.random() * 100 - 50}px`,
                  top: `${Math.random() * 100 - 50}px`,
                  animationDelay: `${Math.random() * 1000}ms`,
                  animationDuration: `${2000 + Math.random() * 1000}ms`,
                  transform: `rotate(${Math.random() * 360}deg)`
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Edit Mode Components */}
      <EditModeIndicator />
      <EditModeToggle />
    </div>
  );
};

// Wrapper that fetches provider data first, then provides it to EditModeProvider
const WrappedProviderPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [providerOwnershipData, setProviderOwnershipData] = useState<{id: number, user_id: number, slug: string} | null>(null);
  
  // Fetch minimal provider data for ownership detection
  useEffect(() => {
    const fetchOwnershipData = async () => {
      if (!slug) return;
      
      try {
        const response = await fetch(`/api/providers/${slug}`);
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          if (data) {
            setProviderOwnershipData({
              id: data.id,
              user_id: data.user_id,
              slug: data.slug
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch provider ownership data:', err);
      }
    };

    fetchOwnershipData();
  }, [slug]);

  return (
    <EditModeProvider providerData={providerOwnershipData || undefined}>
      <ProviderPage />
    </EditModeProvider>
  );
};

export default WrappedProviderPage;