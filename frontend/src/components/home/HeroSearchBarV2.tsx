import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import useLanguageRotationV2 from '../../hooks/useLanguageRotationV2';
import LanguageSwitchSuggestion from '../search/LanguageSwitchSuggestion';

// Get flag URL for language code
const getFlagUrl = (langCode: string) => {
  const countryCodeMap: Record<string, string> = {
    'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'es': 'es',
    'fr': 'fr', 'pl': 'pl', 'uk': 'ua', 'zh': 'cn', 'tr': 'tr',
    'it': 'it', 'pt': 'pt', 'ru': 'ru', 'hi': 'in', 'ur': 'pk',
    'so': 'so', 'ro': 'ro', 'bg': 'bg'
  };
  const countryCode = countryCodeMap[langCode] || 'un';
  return `https://flagcdn.com/16x12/${countryCode}.png`;
};

interface HeroSearchBarV2Props {
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

export const HeroSearchBarV2 = ({ className = '', onShowHowItWorks }: HeroSearchBarV2Props) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Auto-suggest functionality (from SearchPage.tsx)
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Language detection functionality
  const [detectionInfo, setDetectionInfo] = useState<any>(null);
  const [languageSuggestionDismissed, setLanguageSuggestionDismissed] = useState<Set<string>>(new Set());
  const [lastDetectedQuery, setLastDetectedQuery] = useState('');
  
  // Use V2 language rotation (same timing as V2 carousel)
  const { currentLanguage, isVisible } = useLanguageRotationV2(4500);

  // Simplified language-specific placeholder examples (NO "speaking" qualifiers)
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

  // Auto-suggest functionality (adapted from SearchPage.tsx)
  const fetchSearchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsSearching(true);
    try {
      // Call the smart suggestions API
      const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`);
      
      if (response.ok) {
        const result = await response.json();
        const suggestions = result.suggestions || [];
        
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } else {
        // Fallback to empty suggestions if API fails
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      // Fallback to basic suggestions if API fails
      const basicSuggestions = [
        `turkse advocaat`,
        `nederlandse dokter`,
        `${query} amsterdam`,
        `${query} rotterdam`
      ].filter(suggestion => suggestion !== query).slice(0, 4);
      
      setSearchSuggestions(basicSuggestions);
      setShowSuggestions(basicSuggestions.length > 0);
    } finally {
      setIsSearching(false);
    }
  };

  // Language detection functionality (adapted from SearchPage.tsx)
  const detectLanguage = async (query: string) => {
    if (!query || query.length < 2 || query === lastDetectedQuery) {
      return;
    }
    
    try {
      // Call the search API just for language detection
      const response = await fetch(`/api/search?keyword=${encodeURIComponent(query)}&ui_lang=${i18n.language}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.language_detection) {
          setDetectionInfo(result.language_detection);
          setLastDetectedQuery(query);
        }
      }
    } catch (error) {
      console.error('Language detection error:', error);
    }
  };

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchSuggestions(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Debounced language detection
  useEffect(() => {
    const timer = setTimeout(() => {
      detectLanguage(searchQuery);
    }, 500); // Slightly longer delay than suggestions to avoid conflicts
    
    return () => clearTimeout(timer);
  }, [searchQuery, i18n.language]);
  
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

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Trigger search immediately with the suggestion
    const params = new URLSearchParams();
    params.set('keyword', suggestion.trim());
    if (location.trim()) {
      params.set('city', location.trim());
      params.set('radius', '25');
    }
    navigate(`/search?${params.toString()}`);
  };
  
  // Language suggestion handlers
  const handleLanguageSuggestionAccept = (suggestedLanguage: string) => {
    i18n.changeLanguage(suggestedLanguage);
    setLanguageSuggestionDismissed(prev => new Set([...prev, suggestedLanguage]));
  };

  const handleLanguageSuggestionDismiss = (suggestedLanguage: string) => {
    setLanguageSuggestionDismissed(prev => new Set([...prev, suggestedLanguage]));
  };

  // Hide suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };

    if (showSuggestions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showSuggestions]);

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
              
              {/* Animated Placeholder Overlay - Synced with V2 Carousel */}
              {!searchQuery && !isFocused && (
                <div 
                  className={`
                    absolute left-[72px] top-1/2 -translate-y-1/2 pointer-events-none
                    text-lg text-gray-400 transition-all duration-300 ease-in-out
                    min-h-[28px] flex items-center
                    ${isVisible ? 'opacity-100' : 'opacity-0'}
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

            {/* Auto-suggest Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                {searchSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSuggestionClick(suggestion);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
                  >
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-gray-900 text-base">{suggestion}</span>
                  </button>
                ))}
                {isSearching && (
                  <div className="px-4 py-3 text-center text-gray-500 text-sm">
                    <div className="inline-flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                      <span>Finding suggestions...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

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

      {/* Language Switch Suggestion - Homepage optimized placement */}
      {detectionInfo && 
       detectionInfo.typed_language && 
       detectionInfo.typed_language !== i18n.language && 
       !languageSuggestionDismissed.has(detectionInfo.typed_language) && (
        <LanguageSwitchSuggestion
          detectedLanguage={detectionInfo.typed_language}
          currentUILanguage={i18n.language}
          onAccept={() => handleLanguageSuggestionAccept(detectionInfo.typed_language)}
          onDismiss={() => handleLanguageSuggestionDismiss(detectionInfo.typed_language)}
          placement="top-right"
        />
      )}

    </div>
  );
};

export default HeroSearchBarV2;