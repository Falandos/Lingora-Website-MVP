import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import useLanguageRotationV2 from '../../hooks/useLanguageRotationV2';
import { UI_LANGUAGES, getFlagUrl } from '../../constants/languages';


interface StickySearchBarProps {
  className?: string;
}

export const StickySearchBar = ({ className = '' }: StickySearchBarProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  
  // Search functionality state
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Use V2 language rotation (same timing as V2 carousel)
  const { currentLanguage, isVisible: isPlaceholderVisible } = useLanguageRotationV2(4500);
  
  // Simplified V2 language-specific placeholder examples (same as HeroSearchBarV2)
  const getPlaceholderForLanguage = (langCode: string): string => {
    const languagePlaceholders: Record<string, string> = {
      'nl': 'Turkse advocaat Rotterdam',        // Turkish lawyer (cross-language)
      'en': 'English lawyer Utrecht',           // Simple and direct
      'tr': 'Türk doktor Amsterdam',           // Turkish doctor
      'ar': 'طبيب عربي روتردام',                // Arabic doctor Rotterdam
      'de': 'Deutscher Anwalt Den Haag',       // German lawyer
      'fr': 'Médecin français Eindhoven',      // French doctor
      'es': 'Dentista español Breda',          // Spanish dentist
      'pl': 'Polski lekarz Tilburg',           // Polish doctor
      'it': 'Avvocato italiano Utrecht',       // Italian lawyer
      'pt': 'Dentista português Nijmegen',     // Portuguese dentist
      'ru': 'Русский врач Гронинген',          // Russian doctor Groningen
      'uk': 'Український юрист Арнем',         // Ukrainian lawyer Arnhem
      'zh': '中国会计师阿姆斯特丹',               // Chinese accountant Amsterdam
      'hi': 'हिंदी शिक्षक रॉटरडैम',            // Hindi teacher Rotterdam
      'ur': 'اردو ڈاکٹر ہیگ',                  // Urdu doctor The Hague
      'so': 'Dhakhtar Soomaali Utrecht',       // Somali doctor
      'ro': 'Avocat român Eindhoven',          // Romanian lawyer
      'bg': 'Български зъболекар Бреда'        // Bulgarian dentist Breda
    };
    
    return languagePlaceholders[langCode] || languagePlaceholders['en'];
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lingora-language', lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Location detection functionality
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Find closest city by comparing coordinates
          const response = await fetch(`/api/cities?major_only=true&limit=20`);
          
          if (response.ok) {
            const result = await response.json();
            const cities = result.cities || [];
            
            // Find closest city
            let closestCity = null;
            let minDistance = Infinity;
            
            cities.forEach((city: any) => {
              const distance = Math.sqrt(
                Math.pow(latitude - city.coordinates.lat, 2) +
                Math.pow(longitude - city.coordinates.lng, 2)
              );
              
              if (distance < minDistance) {
                minDistance = distance;
                closestCity = city;
              }
            });
            
            if (closestCity) {
              setLocation(closestCity.name);
              setLocationCoords({ lat: latitude, lng: longitude });
            }
          }
        } catch (error) {
          console.error('Error finding closest city:', error);
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        alert('Unable to get your location. Please try again.');
      }
    );
  };

  const clearLocation = () => {
    setLocation('');
    setLocationCoords(null);
  };

  // Search handling
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchQuery.trim()) {
      params.set('keyword', searchQuery.trim());
    }
    
    if (location.trim()) {
      params.set('city', location.trim());
      params.set('radius', '25'); // Default 25km radius when location is provided
    }
    
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const currentUILanguage = UI_LANGUAGES.find(lang => lang.code === i18n.language) || UI_LANGUAGES[0];

  useEffect(() => {
    const handleScroll = () => {
      // Show the sticky bar when user scrolls past the hero section (approximately 600px)
      const scrolled = window.scrollY > 600;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    } ${className}`}>
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center py-3">
            {/* Left: Logo - More consistent spacing */}
            <div className="flex items-center mr-6">
              <div className="font-bold text-primary-600 cursor-pointer text-xl" onClick={() => navigate('/')}>
                Lingora
              </div>
            </div>

            {/* Center: Search Bar - Extended to push right nav further right */}
            <div className="hidden md:block flex-1 max-w-5xl mx-6" ref={searchRef}>
              <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 hover:border-gray-300 transition-all duration-300">
                <div className="flex flex-row">
                  {/* Search Input Section - Matching Hero */}
                  <div className="flex items-center flex-1 relative">
                    <div className="pl-4">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    <input
                      type="text"
                      placeholder="" /* Remove static placeholder */
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      className="flex-1 px-4 py-2 text-base bg-transparent border-0 outline-none text-gray-900 transition-all duration-300 relative z-10"
                    />
                    
                    {/* Animated Placeholder Overlay - V2 Synced with RTL support */}
                    {!searchQuery && !isFocused && (
                      <div 
                        className={`
                          absolute left-[52px] top-1/2 -translate-y-1/2 pointer-events-none
                          text-base text-gray-400 transition-all duration-300 ease-in-out
                          min-h-[24px] flex items-center
                          ${isPlaceholderVisible ? 'opacity-100' : 'opacity-0'}
                        `}
                        style={{
                          transform: 'translateY(-50%)',
                          lineHeight: '1.2',
                          direction: currentLanguage.rtl ? 'rtl' : 'ltr' // RTL support for Arabic/Urdu
                        }}
                      >
                        <span className="block">{getPlaceholderForLanguage(currentLanguage.code)}</span>
                      </div>
                    )}
                  </div>

                  {/* Location Button Section - Compact */}
                  <div className="relative flex items-center justify-center border-l border-gray-200 px-3 py-2 w-12">
                    {location ? (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" title={`${t('search.location_near')} ${location}`}>
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#dc2626"/>
                          <circle cx="12" cy="9" r="2.5" fill="white"/>
                        </svg>
                        <button
                          onClick={clearLocation}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title={`Clear location (${location})`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={getUserLocation}
                        disabled={isGettingLocation}
                        className="text-gray-400 hover:text-primary-500 transition-colors disabled:opacity-50 p-1"
                        title={t('search.my_location')}
                      >
                        {isGettingLocation ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                        ) : (
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#9ca3af"/>
                            <circle cx="12" cy="9" r="2.5" fill="white"/>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                  
                  {/* Search Button Section - Compact */}
                  <div className="flex items-center justify-center p-2">
                    <Button
                      onClick={handleSearch}
                      size="sm" 
                      className="px-4 py-2 text-sm font-medium"
                    >
                      {t('search.button_search')}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Navigation - Pushed further right */}
            <div className="flex items-center ml-6 space-x-4">
              {/* Mobile Search Button */}
              <div className="md:hidden">
                <Link to="/search">
                  <button className="p-2 text-gray-600 hover:text-primary-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-all duration-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </Link>
              </div>
              
              {/* Language Selector */}
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200">
                  <img 
                    src={getFlagUrl(currentUILanguage.code)} 
                    alt={`${currentUILanguage.countryCode} flag`} 
                    className="w-4 h-3 rounded-sm" 
                    loading="lazy" 
                  />
                  <span className="text-xs font-medium">{currentUILanguage.countryCode}</span>
                  <svg className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                      Select Language
                    </div>
                    {UI_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                          i18n.language === lang.code
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <img 
                          src={getFlagUrl(lang.code, '16x12')} 
                          alt={`${lang.countryCode} flag`} 
                          className="w-3 h-2 rounded-sm" 
                          loading="lazy" 
                        />
                        <span>{lang.name}</span>
                        {i18n.language === lang.code && (
                          <Badge variant="primary" size="sm">Active</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Auth Buttons - Tighter spacing */}
              <div className="flex items-center space-x-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm">
                        {t('header.dashboard')}
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      {t('header.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm">
                        {t('header.login')}
                      </Button>
                    </Link>
                    <Link to="/register" className="hidden sm:block">
                      <Button variant="primary" size="sm">
                        {t('header.register')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickySearchBar;