import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import useLanguageRotation from '../../hooks/useLanguageRotation';

// Get flag URL for language code
const getFlagUrl = (langCode: string) => {
  const countryCodeMap: Record<string, string> = {
    'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'es': 'es',
    'fr': 'fr', 'pl': 'pl', 'uk': 'ua', 'zh': 'cn', 'tr': 'tr'
  };
  const countryCode = countryCodeMap[langCode] || 'un';
  return `https://flagcdn.com/16x12/${countryCode}.png`;
};

interface HeroSearchBarProps {
  className?: string;
  onShowHowItWorks?: () => void;
}

interface City {
  id: number;
  name: string;
  province: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  population: number;
  is_major_city: boolean;
}

export const HeroSearchBar = ({ className = '', onShowHowItWorks }: HeroSearchBarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Use shared language rotation (same timing as header)
  const { currentLanguage, isVisible, currentIndex } = useLanguageRotation(4500);

  // Language-specific placeholder examples mapping
  const getPlaceholderForLanguage = (langCode: string): string => {
    const languagePlaceholders: Record<string, string> = {
      'nl': 'turkse advocaat amsterdam',
      'en': 'arabic speaking doctor',
      'ar': 'طبيب يتكلم عربي',
      'de': 'türkischer anwalt amsterdam',
      'es': 'médico que habla árabe',
      'fr': 'médecin parlant arabe',
      'pl': 'arabski mówiący lekarz',
      'uk': 'арабськомовний лікар',
      'zh-Hans': '会说阿拉伯语的医生',
      'tr': 'türkçe konuşan doktor',
      'hi': 'अरबी बोलने वाले डॉक्टर',
      'so': 'dhakhtar ku hadla carabi',
      'ti': 'ዓረባዊ ዝዛረብ ሓኪም',
      'yue': '講阿拉伯文嘅醫生',
      'zgh': 'ⴰⵎⴰⵔ ⵉⵜⵜⵎⴰⵙⵍⴰⵢ ⵜⴰⵄⵔⴰⴱⵜ'
    };
    
    return languagePlaceholders[langCode] || languagePlaceholders['en'];
  };
  
  // 🔥 FIXED: Dynamic height based on language script - Hindi needs most space!
  const getHeightForLanguage = (langCode: string): string => {
    if (langCode === 'hi') return '60px'; // Hindi needs extra height for Devanagari
    const tallScripts = ['ar', 'ti', 'zgh']; // Arabic, Tigrinya, Berber need more space
    return tallScripts.includes(langCode) ? '52px' : '48px';
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Get user's current location
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
            
            // Calculate distances and find closest
            let closestCity = null;
            let minDistance = Infinity;
            
            cities.forEach((city: City) => {
              const distance = calculateDistance(
                latitude, longitude,
                city.coordinates.lat, city.coordinates.lng
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
        alert('Unable to get your location. Please try typing a city name.');
        setIsGettingLocation(false);
      }
    );
  };

  const clearLocation = () => {
    setLocation('');
    setLocationCoords(null);
  };

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

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Main Search Bar */}
      <div className="relative group">
        <div className={`
          relative bg-white rounded-2xl shadow-lg border transition-all duration-300
          ${isFocused ? 'border-primary-500 shadow-xl' : 'border-gray-200 hover:border-gray-300'}
        `}>
          <div className="flex flex-col lg:flex-row">
            {/* Search Input Section */}
            <div className="flex items-center flex-1 relative">
              <div className="pl-6">
                <svg 
                  className={`w-6 h-6 transition-colors duration-300 ${
                    isFocused ? 'text-primary-500' : 'text-gray-400'
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
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
                className="
                  flex-1 px-6 py-5 text-lg bg-transparent border-0 outline-none 
                  text-gray-900 transition-all duration-500 relative z-10
                "
              />
              
              {/* 🔥 COMPLETELY FIXED Placeholder with Dots, Debug & Bright Test Colors */}
              {!searchQuery && !isFocused && (
                <div 
                  key={`language-${currentLanguage.code}-${currentIndex}`}
                  className={`
                    absolute left-[72px] top-1/2 pointer-events-none
                    transition-all duration-500 ease-in-out
                    flex items-center justify-start
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                  `}
                  style={{
                    transform: isVisible ? 'translateY(-50%) translateX(0)' : 'translateY(-50%) translateX(-15px)',
                    minHeight: getHeightForLanguage(currentLanguage.code),
                    height: getHeightForLanguage(currentLanguage.code),
                    whiteSpace: 'nowrap',
                    direction: currentLanguage.rtl ? 'rtl' : 'ltr',
                    width: '450px',
                    overflow: 'hidden',
                    // 🔥 BRIGHT TEST BACKGROUND - IMPOSSIBLE TO MISS
                    backgroundColor: 'rgba(255, 255, 0, 0.6)', // BRIGHT YELLOW
                    border: '3px solid red', // RED BORDER
                    borderRadius: '8px',
                    padding: '8px 12px'
                  }}
                  role="status"
                  aria-live="polite"
                >
                  {/* 🔥 HUGE DEBUG INDICATOR - TOTALLY OBVIOUS */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '-40px', 
                    right: '0', 
                    fontSize: '18px', 
                    color: 'red',
                    backgroundColor: 'yellow',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    border: '3px solid red',
                    boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
                  }}>
                    🔥 FIXED! {currentLanguage.code.toUpperCase()} - {currentIndex + 1}/15
                  </div>
                  
                  <div 
                    className="flex items-center justify-start w-full h-full"
                    style={{ 
                      paddingTop: '4px',
                      paddingBottom: '4px'
                    }}
                  >
                    <span 
                      className="inline-flex items-center"
                      style={{ 
                        lineHeight: '1.8',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: 'black', // BLACK TEXT FOR MAX CONTRAST
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', // WHITE BACKGROUND
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid black'
                      }}
                    >
                      <span style={{ margin: '0 12px', color: 'blue', fontSize: '28px', fontWeight: 'bold' }}>●</span>
                      {getPlaceholderForLanguage(currentLanguage.code)}
                      <span style={{ margin: '0 12px', color: 'blue', fontSize: '28px', fontWeight: 'bold' }}>●</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Compact Location Button */}
            <div className="relative flex items-center justify-center border-t lg:border-t-0 lg:border-l lg:border-r border-gray-200 px-3 py-3 lg:py-5 lg:w-14">
              {location ? (
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-1 flex-shrink-0" viewBox="0 0 24 24" fill="none" title={`${t('search.location_near')} ${location}`}>
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
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#9ca3af"/>
                      <circle cx="12" cy="9" r="2.5" fill="white"/>
                    </svg>
                  )}
                </button>
              )}
            </div>
            
            <div className="flex items-center justify-center lg:justify-start p-3 border-t lg:border-t-0">
              <Button
                onClick={() => handleSearch()}
                size="lg"
                className="px-8 py-3 text-lg font-semibold w-full lg:w-auto"
              >
                {t('search.button_search')}
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Clean Info Bar with Combined Features */}
      <div className="mt-6 text-center animate-fade-in">
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {/* Combined Feature Badge */}
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-full border border-gray-200/50">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
            <span className="font-medium text-sm text-gray-700">
              AI-powered multilingual search
            </span>
          </div>

          {/* How It Works Button - Clear Action */}
          <button
            onClick={onShowHowItWorks}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-medium text-sm transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>See examples</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  );
};

export default HeroSearchBar;