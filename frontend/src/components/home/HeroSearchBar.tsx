import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

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

export const HeroSearchBar = ({ className = '' }: HeroSearchBarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [locationCoords, setLocationCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationDropdownRef = useRef<HTMLDivElement>(null);

  // Major Dutch cities for dropdown
  const majorCities = [
    'Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven',
    'Tilburg', 'Groningen', 'Almere', 'Breda', 'Nijmegen',
    'Enschede', 'Haarlem', 'Arnhem', 'Zaanstad', 'Amersfoort'
  ];

  // Featured languages to display in flags
  const featuredLanguages = [
    { code: 'nl', name: 'Dutch' },
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' }
  ];

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    if (showLocationDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLocationDropdown]);

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
    setShowLocationDropdown(false);
  };

  const selectCity = (cityName: string) => {
    setLocation(cityName);
    setShowLocationDropdown(false);
    // Don't set locationCoords for manual city selection - let backend handle it
    setLocationCoords(null);
  };

  const handleGeolocation = () => {
    setShowLocationDropdown(false);
    getUserLocation();
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
            <div className="flex items-center flex-1">
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
                placeholder="I'm searching for a: 'dokter', 'طبيب', '律师', 'psikolog'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="
                  flex-1 px-6 py-5 text-lg bg-transparent border-0 outline-none 
                  placeholder-gray-400 text-gray-900
                "
              />
            </div>

            {/* Compact Location Section */}
            <div ref={locationDropdownRef} className="relative flex items-center border-t lg:border-t-0 lg:border-l lg:border-r border-gray-200 px-4 py-3 lg:py-5 lg:w-36">
              <div className="flex items-center w-full">
                <svg className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                
                <button
                  onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors w-full min-w-0"
                >
                  <span className="truncate mr-1">
                    {location ? `Near: ${location}` : 'Near:'}
                  </span>
                  <svg className={`w-3 h-3 flex-shrink-0 transition-transform ${showLocationDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {location && (
                  <button
                    onClick={clearLocation}
                    className="ml-1 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                    title="Clear location"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dropdown Menu */}
              {showLocationDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {/* Geolocation Option */}
                  <button
                    onClick={handleGeolocation}
                    disabled={isGettingLocation}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center disabled:opacity-50"
                  >
                    {isGettingLocation ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-500 mr-2"></div>
                        <span>Getting location...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v4m0 12v4m10-10h-4m-12 0h4"/>
                          <circle cx="12" cy="12" r="2" fill="currentColor"/>
                        </svg>
                        📍 My location
                      </>
                    )}
                  </button>
                  
                  {/* Separator */}
                  <div className="border-t border-gray-100"></div>
                  
                  {/* City Options */}
                  {majorCities.map((city) => (
                    <button
                      key={city}
                      onClick={() => selectCity(city)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center lg:justify-start p-3 border-t lg:border-t-0">
              <Button
                onClick={() => handleSearch()}
                size="lg"
                className="px-8 py-3 text-lg font-semibold w-full lg:w-auto"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Subtle Language Support Indicator */}
      <div className="mt-3 text-center animate-fade-in">
        <div className="text-xs text-gray-500 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>AI-powered</span>
          <span className="text-gray-400">•</span>
          <span>Search in any language</span>
          <span className="text-gray-400">•</span>
          <div className="flex items-center gap-1">
            {featuredLanguages.map((lang, index) => (
              <img
                key={lang.code}
                src={getFlagUrl(lang.code)}
                alt={lang.name}
                className="w-4 h-3 rounded-sm shadow-sm opacity-80 hover:opacity-100 transition-opacity"
                title={lang.name}
              />
            ))}
            <span className="ml-1 text-gray-400">+10 more</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HeroSearchBar;