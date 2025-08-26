import { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

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

interface CityAutocompleteProps {
  value: string;
  onChange: (city: City | null, cityName: string) => void;
  placeholder?: string;
  className?: string;
  showGeolocation?: boolean;
}

const CityAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Type city name...", 
  className = "",
  showGeolocation = true 
}: CityAutocompleteProps) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        searchCities(query);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Update input when value prop changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const searchCities = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/cities?q=${encodeURIComponent(searchQuery)}&limit=10&major_only=false`);
      
      if (response.ok) {
        const result = await response.json();
        setSuggestions(result.data.cities || []);
        setIsOpen(result.data.cities?.length > 0);
        setSelectedIndex(-1);
      }
    } catch (error) {
      console.error('City search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    
    // If user cleared the input, notify parent
    if (!newValue) {
      onChange(null, '');
    }
  };

  const selectCity = (city: City) => {
    setQuery(city.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onChange(city, city.name);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectCity(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Get user's current location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Find closest city by comparing coordinates
          // For now, we'll use a simple search for major cities and let user refine
          const response = await fetch(`/api/cities?major_only=true&limit=20`);
          
          if (response.ok) {
            const result = await response.json();
            const cities = result.data.cities || [];
            
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
              selectCity(closestCity);
            }
          }
        } catch (error) {
          console.error('Error finding closest city:', error);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get your location. Please select a city manually.');
        setLoading(false);
      }
    );
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

  return (
    <div className={`relative ${className}`}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => query.length >= 2 && setSuggestions.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
            autoComplete="off"
          />
          
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
            </div>
          )}
        </div>
        
        {showGeolocation && (
          <Button
            type="button"
            variant="outline"
            onClick={getUserLocation}
            disabled={loading}
            className="px-3 py-2 whitespace-nowrap"
          >
            📍 My Location
          </Button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((city, index) => (
            <li
              key={city.id}
              onClick={() => selectCity(city)}
              className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-primary-50 text-primary-900'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{city.name}</span>
                  <span className="text-sm text-gray-500 ml-2">{city.province}</span>
                  {city.is_major_city && (
                    <span className="inline-block ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Major City
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {city.population.toLocaleString()} inh.
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      {/* No results message */}
      {isOpen && !loading && query.length >= 2 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
          <p className="text-gray-500 text-sm">No cities found for "{query}"</p>
        </div>
      )}
    </div>
  );
};

export default CityAutocomplete;