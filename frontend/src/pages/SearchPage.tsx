import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import ProviderCard from '../components/search/ProviderCard';
import SimpleMap from '../components/search/SimpleMap';
import CityAutocomplete from '../components/ui/CityAutocomplete';
import LanguageSwitchSuggestion from '../components/search/LanguageSwitchSuggestion';

interface SearchResult {
  id: number;
  business_name: string;
  slug: string;
  city: string;
  bio_nl?: string;
  bio_en?: string;
  latitude?: number;
  longitude?: number;
  gallery: string[];
  languages: Array<{
    language_code: string;
    cefr_level: string;
    name_en: string;
    name_native: string;
  }>;
  services: Array<{
    title: string;
    service_mode: string;
    category_name: string;
  }>;
  distance?: number;
  opening_hours?: Record<string, { 
    isOpen: boolean; 
    slots: { open: string; close: string }[] 
  }>;
}

interface SearchFilters {
  languages: string[];
  categories: string[];
  city: string;
  radius: number;
  mode: string;
  keyword: string;
  sortBy: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
}

// Get flag URL for language code
const getFlagUrl = (langCode: string) => {
  const countryCodeMap: Record<string, string> = {
    'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'zgh': 'ma',
    'uk': 'ua', 'pl': 'pl', 'zh': 'cn', 'yue': 'hk', 'es': 'es',
    'hi': 'in', 'tr': 'tr', 'fr': 'fr', 'ti': 'er', 'so': 'so'
  };
  const countryCode = countryCodeMap[langCode] || 'un';
  return `https://flagcdn.com/24x18/${countryCode}.png`;
};

const SearchPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allProviders, setAllProviders] = useState<SearchResult[]>([]); // For map display
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [detectionInfo, setDetectionInfo] = useState<any>(null);
  const [languageSuggestionDismissed, setLanguageSuggestionDismissed] = useState<Set<string>>(new Set());
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Search autocomplete state
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize filters with URL params taking priority over localStorage
  const initializeFilters = (): SearchFilters => {
    // Load saved preferences from localStorage
    const savedPreferences = (() => {
      try {
        const stored = localStorage.getItem('lingora_filter_preferences');
        return stored ? JSON.parse(stored) : {};
      } catch {
        return {};
      }
    })();

    return {
      // URL params have highest priority, then localStorage, then defaults
      languages: searchParams.get('languages')?.split(',').filter(Boolean) || 
                 savedPreferences.languages || [],
      categories: searchParams.get('categories')?.split(',').filter(Boolean) || 
                  savedPreferences.categories || [],
      city: searchParams.get('city') || savedPreferences.city || '',
      radius: parseInt(searchParams.get('radius') || savedPreferences.radius?.toString() || '25'),
      mode: searchParams.get('mode') || '',
      keyword: searchParams.get('keyword') || '', // Never persist keyword
      sortBy: searchParams.get('sortBy') || savedPreferences.sortBy || 'best_match',
      coordinates: savedPreferences.coordinates || null
    };
  };

  const [filters, setFilters] = useState<SearchFilters>(initializeFilters());
  
  // Available languages and categories for filters
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  
  // Filter section collapse state for cleaner UI
  const [expandedSections, setExpandedSections] = useState({
    languages: true,
    categories: false
  });

  const toggleSection = (section: 'languages' | 'categories') => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // City coordinates lookup for Netherlands - Returns null for empty cities to show ALL providers
  const getCityCoordinates = (cityName: string): [number, number] | null => {
    const cities: Record<string, [number, number]> = {
      'amsterdam': [52.3676, 4.9041],
      'rotterdam': [51.9244, 4.4777],
      'utrecht': [52.0907, 5.1214],
      'den haag': [52.0705, 4.3007],
      'the hague': [52.0705, 4.3007],
      'groningen': [53.2194, 6.5665],
      'maastricht': [50.8514, 5.6913],
      'breda': [51.5719, 4.7683],
      'tilburg': [51.5555, 5.0913],
      'eindhoven': [51.4416, 5.4697],
    };
    
    const city = cityName.toLowerCase().trim();
    if (!city) return null; // No city = show ALL providers (no distance filter)
    return cities[city] || null; // Return null for unknown cities too
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
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  };

  // Check if a provider is currently open based on opening hours
  const isProviderOpen = (openingHours?: Record<string, { isOpen: boolean; slots: { open: string; close: string }[] }>): boolean | null => {
    if (!openingHours) return null; // No opening hours data
    
    const now = new Date();
    const currentDay = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes from 00:00
    
    const dayHours = openingHours[currentDay];
    if (!dayHours || !dayHours.isOpen) return false; // Closed today
    
    // Check if current time falls within any of the day's time slots
    return dayHours.slots.some(slot => {
      const [openHour, openMin] = slot.open.split(':').map(Number);
      const [closeHour, closeMin] = slot.close.split(':').map(Number);
      const openTime = openHour * 60 + openMin;
      const closeTime = closeHour * 60 + closeMin;
      
      return currentTime >= openTime && currentTime <= closeTime;
    });
  };

  // Fetch all providers for map display
  const fetchAllProviders = async () => {
    try {
      // Fetch all providers without filters for map display
      const response = await fetch('/api/search');
      const result = await response.json();

      if (response.ok && result) {
        const data = result.data || result;
        const apiResults = data.results || data.items || [];
        setAllProviders(apiResults);
      }
    } catch (error) {
      console.error('Failed to fetch all providers:', error);
    }
  };

  // Fetch filter options on mount
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [languagesRes, categoriesRes] = await Promise.all([
          fetch('/api/languages'),
          fetch('/api/categories'),
        ]);

        if (languagesRes.ok) {
          const langResult = await languagesRes.json();
          // Handle both mock format (direct array) and real API format (wrapped in data)
          const langs = langResult.data || langResult || [];
          setAvailableLanguages(langs);
        }

        if (categoriesRes.ok) {
          const catResult = await categoriesRes.json();
          // Handle both mock format (direct array) and real API format (wrapped in data)
          const cats = catResult.data || catResult || [];
          // Remove duplicates based on id
          const uniqueCats = cats.filter((cat: any, index: number, array: any[]) => 
            array.findIndex((c: any) => c.id === cat.id) === index
          );
          setAvailableCategories(uniqueCats);
        }
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      }
    };

    fetchFilterData();
    fetchAllProviders(); // Fetch all providers for map
  }, []);

  // PLACEHOLDER: Mock filtering logic - will be replaced with API calls in production
  const applyLocalFilters = (rawResults: any[]) => {
    let filtered = [...rawResults];
    
    // Get user's location coordinates - ONLY if city is provided
    let userLat: number | null = null;
    let userLng: number | null = null;
    let hasLocation = false;
    
    if (filters.coordinates) {
      userLat = filters.coordinates.lat;
      userLng = filters.coordinates.lng;
      hasLocation = true;
      console.log(`User location: ${filters.city} at [${userLat}, ${userLng}] (from coordinates)`);
    } else if (filters.city) {
      const coords = getCityCoordinates(filters.city);
      if (coords) {
        [userLat, userLng] = coords;
        hasLocation = true;
        console.log(`User location: ${filters.city} at [${userLat}, ${userLng}] (from lookup)`);
      }
    } else {
      console.log('No location provided - showing ALL providers without distance filtering');
    }

    // Calculate distances ONLY if we have a location
    if (hasLocation && userLat !== null && userLng !== null) {
      filtered = filtered.map(result => {
        if (result.provider?.lat && result.provider?.lng) {
          const distance = calculateDistance(userLat!, userLng!, result.provider.lat, result.provider.lng);
          return { ...result, distance_km: distance };
        }
        return result;
      });
    }

    // Language filter
    if (filters.languages.length > 0) {
      filtered = filtered.filter(result => 
        filters.languages.some(lang => result.languages.includes(lang))
      );
    }

    // Distance filter - ONLY apply if we have a location
    if (hasLocation) {
      console.log(`Filtering by distance: ${filters.radius}km from ${filters.city}`);
      const beforeCount = filtered.length;
      filtered = filtered.filter(result => {
        const distance = result.distance_km;
        const withinRange = !distance || distance <= filters.radius;
        console.log(`Provider ${result.provider?.name}: ${distance}km - ${withinRange ? 'INCLUDED' : 'EXCLUDED'}`);
        return withinRange;
      });
      console.log(`Distance filter: ${beforeCount} -> ${filtered.length} results`);
    } else if (!hasLocation) {
      console.log('No distance filtering applied - showing all providers');
    }

    // Service mode filter removed - mode displayed on provider cards only

    // Keyword filter (search in provider name and services)
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(result =>
        result.provider.name.toLowerCase().includes(keyword) ||
        result.services.some((service: any) => 
          service.title.toLowerCase().includes(keyword)
        )
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'distance':
        if (hasLocation) {
          filtered.sort((a, b) => (a.distance_km || 999) - (b.distance_km || 999));
          console.log('Sorted by distance:', filtered.map(r => `${r.provider?.name}: ${r.distance_km}km`));
        } else {
          // No location provided - fall back to best match sort
          console.log('No location for distance sort - using best match order');
        }
        break;
      case 'name':
        filtered.sort((a, b) => (a.provider?.name || '').localeCompare(b.provider?.name || ''));
        break;
      case 'best_match':
      default:
        // Keep original order (best match from API)
        break;
    }

    return filtered;
  };

  const performSearch = async () => {
    setLoading(true);
    setResults([]); // Clear previous results
    setTotal(0); // Reset count
    try {
      const params = new URLSearchParams();
      
      if (filters.languages.length > 0) params.set('languages', filters.languages.join(','));
      if (filters.categories.length > 0) params.set('categories', filters.categories.join(','));
      if (filters.city) {
        params.set('city', filters.city);
        // Use actual selected coordinates or fallback to lookup
        if (filters.coordinates) {
          params.set('lat', filters.coordinates.lat.toString());
          params.set('lng', filters.coordinates.lng.toString());
        } else {
          // Fallback to coordinate lookup if no coordinates stored
          const coords = getCityCoordinates(filters.city);
          if (coords) {
            const [lat, lng] = coords;
            params.set('lat', lat.toString());
            params.set('lng', lng.toString());
          }
        }
      }
      params.set('radius', filters.radius.toString());
      // Service mode filter removed - mode displayed on provider cards only
      if (filters.keyword) params.set('keyword', filters.keyword);
      params.set('page', page.toString());

      const response = await fetch(`/api/search?${params.toString()}`);
      const result = await response.json();

      if (response.ok && result) {
        // Handle both mock format and real API format
        const data = result.data || result;
        // Use real API results or fallback to mock format
        const apiResults = data.results || data.items || [];
        
        // STORE DETECTION INFO (for UI suggestions and display)
        // Always store detection info if we have language detection data
        if (data.language_detection) {
          setDetectionInfo(data.language_detection);
        } else {
          setDetectionInfo(null);
        }
        
        // SYNC FILTERS WITH AUTO-DETECTED VALUES
        // If the backend detected languages or city, update the frontend filters
        if (data.language_detection?.auto_applied) {
          const detection = data.language_detection;
          const updatedFilters: Partial<SearchFilters> = {};
          
          // Sync languages if detected
          if (detection.detected_languages && detection.detected_languages.length > 0) {
            const backendLanguages = data.filters?.languages || [];
            if (JSON.stringify(filters.languages.sort()) !== JSON.stringify(backendLanguages.sort())) {
              updatedFilters.languages = backendLanguages;
            }
          }
          
          // Sync city if detected
          if (detection.detected_city && detection.detected_city !== filters.city) {
            updatedFilters.city = detection.detected_city;
            // Also try to get coordinates for the detected city
            const coords = getCityCoordinates(detection.detected_city);
            if (coords) {
              updatedFilters.coordinates = { lat: coords[0], lng: coords[1] };
            }
          }
          
          // DON'T sync keyword with cleaned version - preserve user's original input
          // The backend uses cleaned_keyword for search, but frontend keeps original for display
          // This ensures user sees what they typed (e.g., "psikolog polski") in the search box
          
          // Apply updates if any
          if (Object.keys(updatedFilters).length > 0) {
            console.log('Syncing filters with backend detection:', updatedFilters);
            setFilters(prev => ({ ...prev, ...updatedFilters }));
            
            // Update URL params to reflect the detection
            const newParams = new URLSearchParams(params);
            if (updatedFilters.languages) {
              newParams.set('languages', updatedFilters.languages.join(','));
            }
            if (updatedFilters.city) {
              newParams.set('city', updatedFilters.city);
            }
            if (updatedFilters.keyword) {
              newParams.set('keyword', updatedFilters.keyword);
            }
            setSearchParams(newParams);
          }
        }
        
        // API now handles all filtering including geographic radius
        setResults(apiResults);
        // Use actual results length since backend count query has a bug
        setTotal(apiResults.length);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch();
  }, [page, filters]);

  // Save filters to localStorage
  const saveFiltersToStorage = (filtersToSave: SearchFilters) => {
    try {
      const filterPreferences = {
        languages: filtersToSave.languages,
        categories: filtersToSave.categories,
        city: filtersToSave.city,
        radius: filtersToSave.radius,
        sortBy: filtersToSave.sortBy,
        coordinates: filtersToSave.coordinates,
        // Don't persist keyword as it's search-specific
      };
      localStorage.setItem('lingora_filter_preferences', JSON.stringify(filterPreferences));
    } catch (error) {
      console.error('Error saving filter preferences:', error);
    }
  };

  // Load filters from localStorage
  const loadFiltersFromStorage = (): Partial<SearchFilters> => {
    try {
      const stored = localStorage.getItem('lingora_filter_preferences');
      if (stored) {
        const preferences = JSON.parse(stored);
        return {
          languages: preferences.languages || [],
          categories: preferences.categories || [],
          city: preferences.city || '',
          radius: preferences.radius || 25,
          sortBy: preferences.sortBy || 'best_match',
          coordinates: preferences.coordinates || null,
        };
      }
    } catch (error) {
      console.error('Error loading filter preferences:', error);
    }
    return {};
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setPage(1);
    
    // Save to localStorage (excluding keyword for privacy)
    saveFiltersToStorage(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (updatedFilters.languages.length > 0) params.set('languages', updatedFilters.languages.join(','));
    if (updatedFilters.categories.length > 0) params.set('categories', updatedFilters.categories.join(','));
    if (updatedFilters.city) params.set('city', updatedFilters.city);
    params.set('radius', updatedFilters.radius.toString());
    if (updatedFilters.sortBy !== 'best_match') params.set('sortBy', updatedFilters.sortBy);
    // Service mode filter removed
    if (updatedFilters.keyword) params.set('keyword', updatedFilters.keyword);
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    const clearedFilters = {
      languages: [],
      categories: [],
      city: '',
      radius: 25,
      mode: '',
      keyword: '',
      sortBy: 'best_match',
      coordinates: null
    };
    
    setFilters(clearedFilters);
    setSearchParams({});
    
    // Clear localStorage preferences as well
    try {
      localStorage.removeItem('lingora_filter_preferences');
    } catch (error) {
      console.error('Error clearing filter preferences:', error);
    }
  };

  // Handle language suggestion acceptance
  const handleLanguageSuggestionAccept = (suggestedLanguage: string) => {
    i18n.changeLanguage(suggestedLanguage);
    setLanguageSuggestionDismissed(prev => new Set([...prev, suggestedLanguage]));
  };

  // Handle language suggestion dismissal
  const handleLanguageSuggestionDismiss = (suggestedLanguage: string) => {
    setLanguageSuggestionDismissed(prev => new Set([...prev, suggestedLanguage]));
  };

  // Quick filter presets
  const handleQuickFilter = (presetType: string) => {
    switch (presetType) {
      case 'near_me':
        // Use geolocation to find user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              
              // Find closest major city
              try {
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
                    updateFilters({ 
                      city: closestCity.name,
                      coordinates: { lat: latitude, lng: longitude },
                      radius: 25,
                      sortBy: 'distance'
                    });
                  }
                }
              } catch (error) {
                console.error('Error finding closest city:', error);
                // Fallback - just set coordinates
                updateFilters({ 
                  coordinates: { lat: latitude, lng: longitude },
                  radius: 25,
                  sortBy: 'distance'
                });
              }
            },
            (error) => {
              console.error('Geolocation error:', error);
              alert('Unable to get your location. Please enable location access or select a city manually.');
            }
          );
        } else {
          alert('Geolocation is not supported by this browser. Please select a city manually.');
        }
        break;
        
      case 'open_now':
        // This would filter for providers that are currently open
        // For now, we'll just sort by best match and add a note
        updateFilters({ sortBy: 'best_match' });
        // In a real implementation, this would add a filter for opening hours
        break;
        
      case 'top_rated':
        // Sort by rating once we have rating data
        updateFilters({ sortBy: 'best_match' });
        break;
        
      case 'recently_added':
        // Sort by newest providers
        updateFilters({ sortBy: 'best_match' });
        break;
    }
  };

  // Search autocomplete functionality
  const fetchSearchSuggestions = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    setIsSearching(true);
    try {
      // For now, generate mock suggestions based on the query
      // In production, this would be an API call to get actual suggestions
      const mockSuggestions = [
        `${query} dokter`,
        `${query} arts`,
        `${query} tandarts`,
        `${query} psycholoog`,
        `${query} fysiotherapeut`,
      ].filter(suggestion => suggestion !== query);
      
      // Also add some popular searches
      const popularSearches = [
        'Nederlandse dokter',
        'Turkse arts',
        'Psycholoog Amsterdam',
        'Tandarts Rotterdam',
        'Huisarts Utrecht'
      ].filter(search => search.toLowerCase().includes(query.toLowerCase()));
      
      const allSuggestions = [...mockSuggestions, ...popularSearches].slice(0, 6);
      
      setSearchSuggestions(allSuggestions);
      setShowSuggestions(allSuggestions.length > 0);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchSuggestions(filters.keyword);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  // Handle search input key navigation
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          selectSuggestion(searchSuggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
    }
  };

  const selectSuggestion = (suggestion: string) => {
    updateFilters({ keyword: suggestion });
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    
    // Store in recent searches (localStorage)
    try {
      const recentSearches = JSON.parse(localStorage.getItem('lingora_recent_searches') || '[]');
      const updatedSearches = [suggestion, ...recentSearches.filter((s: string) => s !== suggestion)].slice(0, 10);
      localStorage.setItem('lingora_recent_searches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Language Switch Suggestion */}
      {detectionInfo && 
       detectionInfo.typed_language && 
       detectionInfo.typed_language !== i18n.language && 
       !languageSuggestionDismissed.has(detectionInfo.typed_language) && (
        <LanguageSwitchSuggestion
          detectedLanguage={detectionInfo.typed_language}
          currentUILanguage={i18n.language}
          onAccept={() => handleLanguageSuggestionAccept(detectionInfo.typed_language)}
          onDismiss={() => handleLanguageSuggestionDismiss(detectionInfo.typed_language)}
        />
      )}
      
      {/* Search Header */}
      <div className="bg-white shadow-soft border-b border-gray-100">
        <div className="container-custom py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('header.search_placeholder')}
                  value={filters.keyword}
                  onChange={(e) => {
                    updateFilters({ keyword: e.target.value });
                    setSelectedSuggestionIndex(-1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  onFocus={() => {
                    if (searchSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow clicking on them
                    setTimeout(() => setShowSuggestions(false), 150);
                  }}
                  className="input-field w-full pl-12 pr-16 lg:pr-4"
                  autoComplete="off"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                
                {/* Loading indicator */}
                {isSearching && (
                  <div className="absolute right-16 lg:right-8 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                  </div>
                )}
                
                {/* Mobile Filter Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 lg:hidden p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                  title="Open filters"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  {/* Active filters indicator */}
                  {(filters.languages.length > 0 || filters.categories.length > 0 || filters.city) && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-600 rounded-full"></span>
                  )}
                </button>

                {/* Search Suggestions Dropdown */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={suggestion}
                        onClick={() => selectSuggestion(suggestion)}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                          index === selectedSuggestionIndex ? 'bg-primary-50 text-primary-700' : 'text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-sm">{suggestion}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:w-1/4">
            <Card className="sticky top-24">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('search.filters')}</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    {t('common.clear')}
                  </Button>
                </div>

                {/* Quick Filter Presets */}
                <div className="mb-6 pb-6 border-b border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h4>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickFilter('near_me')}
                      className="justify-start text-xs px-3 py-2 h-auto"
                    >
                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Near Me
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickFilter('open_now')}
                      className="justify-start text-xs px-3 py-2 h-auto"
                    >
                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Open Now
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickFilter('top_rated')}
                      className="justify-start text-xs px-3 py-2 h-auto"
                    >
                      <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Top Rated
                    </Button>
                  </div>
                </div>

                {/* Location Filter - Clean & Streamlined */}
                <div className="mb-6">
                  <CityAutocomplete
                    value={filters.city}
                    onChange={(city, cityName) => {
                      if (city) {
                        // Use selected city with coordinates
                        updateFilters({ 
                          city: city.name,
                          // Store coordinates for backend API
                          coordinates: city.coordinates
                        });
                      } else {
                        // User cleared or typed custom text
                        updateFilters({ city: cityName, coordinates: null });
                      }
                    }}
                    placeholder="Enter city name..."
                    showGeolocation={true}
                    className="mb-4"
                  />
                
                  <label className="label">{t('search.distance')}</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="5"
                      max="350"
                      step="5"
                      value={filters.radius}
                      onChange={(e) => updateFilters({ radius: parseInt(e.target.value) })}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((filters.radius - 5) / (350 - 5)) * 100}%, #E5E7EB ${((filters.radius - 5) / (350 - 5)) * 100}%, #E5E7EB 100%)`
                      }}
                    />
                    <span className="text-sm font-medium text-gray-700 min-w-[3rem]">{filters.radius} km</span>
                  </div>
                </div>

                {/* Service Mode Filter - Removed as requested, mode shown on provider cards */}

                {/* Language Filter */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => toggleSection('languages')}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-primary-600 transition-colors"
                  >
                    <span className="label flex items-center">
                      {t('search.languages')}
                      {filters.languages.length > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                          {filters.languages.length}
                        </span>
                      )}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedSections.languages ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.languages && (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {availableLanguages
                        .sort((a, b) => {
                          // Sort selected languages to the top
                          const aSelected = filters.languages.includes(a.code);
                          const bSelected = filters.languages.includes(b.code);
                          if (aSelected && !bSelected) return -1;
                          if (!aSelected && bSelected) return 1;
                          // Keep alphabetical order within selected/unselected groups
                          return (i18n.language === 'nl' ? a.name_native : a.name_en)
                            .localeCompare(i18n.language === 'nl' ? b.name_native : b.name_en);
                        })
                        .slice(0, expandedSections.languages ? 15 : 5)
                        .map((lang) => {
                          const isSelected = filters.languages.includes(lang.code);
                          const uiLanguageName = lang.name_en; // Use English name for UI language
                          const nativeName = lang.name_native;
                          
                          return (
                            <label key={lang.code} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    updateFilters({ languages: [...filters.languages, lang.code] });
                                  } else {
                                    updateFilters({ languages: filters.languages.filter(l => l !== lang.code) });
                                  }
                                }}
                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              />
                              <div className="flex items-center space-x-2">
                                <img 
                                  src={getFlagUrl(lang.code)} 
                                  alt={`${lang.name_en} flag`}
                                  className={`w-6 h-4 rounded-sm border border-white shadow-sm transition-all duration-200 ${
                                    isSelected ? 'opacity-100' : 'opacity-40 grayscale'
                                  }`}
                                />
                                <span className="text-sm text-gray-700">
                                  {uiLanguageName} ({nativeName})
                                </span>
                              </div>
                            </label>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => toggleSection('categories')}
                    className="w-full flex items-center justify-between py-2 text-left hover:text-primary-600 transition-colors"
                  >
                    <span className="label flex items-center">
                      {t('search.categories')}
                      {filters.categories.length > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                          {filters.categories.length}
                        </span>
                      )}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.categories && (
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {availableCategories.filter(cat => !cat.parent_id).slice(0, 10).map((category) => (
                      <label key={category.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category.id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilters({ categories: [...filters.categories, category.id.toString()] });
                            } else {
                              updateFilters({ categories: filters.categories.filter(c => c !== category.id.toString()) });
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                          {category.icon && <span className="mr-2">{category.icon}</span>}
                          {i18n.language === 'nl' ? category.name_nl : category.name_en}
                        </span>
                      </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Filters */}
                {(filters.languages.length > 0 || filters.categories.length > 0 || filters.mode || filters.city) && (
                  <div className="pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h4>
                    <div className="flex flex-wrap gap-2">
                      {filters.languages.map((lang) => (
                        <Badge key={lang} variant="primary" size="sm" className="cursor-pointer" onClick={() => updateFilters({ languages: filters.languages.filter(l => l !== lang) })}>
                          {lang}
                          <span className="ml-1">×</span>
                        </Badge>
                      ))}
                      {filters.categories.map((catId) => {
                        const category = availableCategories.find(c => c.id.toString() === catId);
                        return category ? (
                          <Badge key={catId} variant="primary" size="sm" className="cursor-pointer" onClick={() => updateFilters({ categories: filters.categories.filter(c => c !== catId) })}>
                            {i18n.language === 'nl' ? category.name_nl : category.name_en}
                            <span className="ml-1">×</span>
                          </Badge>
                        ) : null;
                      })}
                      {/* Service mode filter removed - shown on provider cards only */}
                      {filters.city && (
                        <Badge variant="secondary" size="sm" className="cursor-pointer" onClick={() => updateFilters({ city: '' })}>
                          {filters.city}
                          <span className="ml-1">×</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:w-3/4">
            {/* Auto-Detection Feedback */}
            {detectionInfo && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-900 mb-1">Smart Search Applied</h4>
                      <p className="text-sm text-blue-800">
                        From "{detectionInfo.original_query}" we detected:
                        {detectionInfo.detected_languages && detectionInfo.detected_languages.length > 0 && (
                          <span className="font-medium"> {detectionInfo.detected_languages.map(lang => {
                            const langObj = availableLanguages.find(l => l.code === lang);
                            return langObj ? langObj.name_en : lang;
                          }).join(', ')} language{detectionInfo.detected_languages.length > 1 ? 's' : ''}</span>
                        )}
                        {detectionInfo.detected_city && (
                          <span className="font-medium"> in {detectionInfo.detected_city}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetectionInfo(null)}
                    className="flex-shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
                    title="Dismiss"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              {/* Left: Results count */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {loading ? 'Searching...' : `${total} providers found`}
                </h2>
                {filters.city && (
                  <p className="text-sm text-gray-500 mt-1">Near {filters.city}</p>
                )}
              </div>
              
              {/* Center: Sort Options (List View Only) */}
              <div className="flex-1 flex justify-center">
                {viewMode === 'list' && (
                  <select 
                    className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={filters.sortBy}
                    onChange={(e) => updateFilters({ sortBy: e.target.value })}
                  >
                    <option value="best_match">{t('search.best_match')}</option>
                    {filters.city && <option value="distance">{t('search.distance_asc')}</option>}
                    <option value="name">Name A-Z</option>
                  </select>
                )}
              </div>

              {/* Right: View Toggle - Clean icon buttons */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="List view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-2 transition-colors border-l border-gray-200 ${
                    viewMode === 'map' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                  title="Map view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Results Content */}
            {loading ? (
              viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardBody className="p-6">
                        <div className="loading-skeleton h-6 w-3/4 mb-2"></div>
                        <div className="loading-skeleton h-4 w-1/2 mb-4"></div>
                        <div className="loading-skeleton h-4 w-full mb-2"></div>
                        <div className="loading-skeleton h-4 w-2/3"></div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="h-[600px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center">
                  <div className="text-gray-400">Loading map...</div>
                </div>
              )
            ) : results.length > 0 ? (
              viewMode === 'list' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {results.map((result) => (
                    <ProviderCard
                      key={result.id || result.provider?.id}
                      id={result.id || result.provider?.id}
                      business_name={result.business_name || result.provider?.name}
                      slug={result.slug || result.provider?.slug}
                      city={result.city || result.provider?.city}
                      latitude={result.latitude || result.provider?.lat}
                      longitude={result.longitude || result.provider?.lng}
                      gallery={result.gallery || result.media?.map(m => m.url) || []}
                      languages={result.languages || result.languages?.map(lang => ({ 
                        language_code: lang, 
                        cefr_level: 'B2', 
                        name_en: lang.toUpperCase(), 
                        name_native: lang.toUpperCase() 
                      })) || []}
                      services={result.services || []}
                      distance={result.distance_km || result.distance}
                      currentLanguage={i18n.language}
                      activeLanguageFilters={filters.languages}
                      openingHours={result.opening_hours}
                      isOpen={isProviderOpen(result.opening_hours)}
                    />
                  ))}
                </div>
              ) : (
                <div className="h-[600px] rounded-xl overflow-hidden">
                  <SimpleMap 
                    providers={allProviders.map(result => ({
                      ...result,
                      provider: result.provider || {
                        id: result.id,
                        name: result.business_name,
                        slug: result.slug,
                        city: result.city,
                        lat: result.latitude,
                        lng: result.longitude
                      }
                    }))}
                    userLocation={filters.city ? (() => {
                      const coords = filters.coordinates || getCityCoordinates(filters.city);
                      return coords ? {
                        lat: coords.lat || coords[0],
                        lng: coords.lng || coords[1],
                        city: filters.city
                      } : null;
                    })() : null}
                    searchRadius={filters.radius}
                  />
                </div>
              )
            ) : (
              <Card>
                <CardBody className="p-12 text-center">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your search criteria or location</p>
                  <Button variant="outline" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </CardBody>
              </Card>
            )}

            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-center mt-8">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {Math.ceil(total / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= Math.ceil(total / 10)}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          ></div>
          
          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl transform transition-transform overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
              <h3 className="text-lg font-semibold text-gray-900">{t('search.filters')}</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  {t('common.clear')}
                </Button>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Drawer Content - Same as sidebar */}
            <div className="p-4">
              {/* Quick Filter Presets */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h4>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter('near_me')}
                    className="justify-start text-xs px-3 py-2 h-auto"
                  >
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Near Me
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter('open_now')}
                    className="justify-start text-xs px-3 py-2 h-auto"
                  >
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Open Now
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter('top_rated')}
                    className="justify-start text-xs px-3 py-2 h-auto"
                  >
                    <svg className="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    Top Rated
                  </Button>
                </div>
              </div>
              
              {/* Location Filter */}
              <div className="mb-6">
                <CityAutocomplete
                  value={filters.city}
                  onChange={(city, cityName) => {
                    if (city) {
                      updateFilters({ 
                        city: city.name,
                        coordinates: city.coordinates
                      });
                    } else {
                      updateFilters({ city: cityName, coordinates: null });
                    }
                  }}
                  placeholder="Enter city name..."
                  showGeolocation={true}
                  className="mb-4"
                />
              
                <label className="label">{t('search.distance')}</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="5"
                    max="350"
                    step="5"
                    value={filters.radius}
                    onChange={(e) => updateFilters({ radius: parseInt(e.target.value) })}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((filters.radius - 5) / (350 - 5)) * 100}%, #E5E7EB ${((filters.radius - 5) / (350 - 5)) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 min-w-[3rem]">{filters.radius} km</span>
                </div>
              </div>

              {/* Language Filter */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => toggleSection('languages')}
                  className="w-full flex items-center justify-between py-2 text-left hover:text-primary-600 transition-colors"
                >
                  <span className="label flex items-center">
                    {t('search.languages')}
                    {filters.languages.length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                        {filters.languages.length}
                      </span>
                    )}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSections.languages ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSections.languages && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {availableLanguages
                      .sort((a, b) => {
                        // Sort selected languages to the top
                        const aSelected = filters.languages.includes(a.code);
                        const bSelected = filters.languages.includes(b.code);
                        if (aSelected && !bSelected) return -1;
                        if (!aSelected && bSelected) return 1;
                        // Keep alphabetical order within selected/unselected groups
                        return (i18n.language === 'nl' ? a.name_native : a.name_en)
                          .localeCompare(i18n.language === 'nl' ? b.name_native : b.name_en);
                      })
                      .slice(0, expandedSections.languages ? 15 : 5)
                      .map((lang) => {
                        const isSelected = filters.languages.includes(lang.code);
                        const uiLanguageName = lang.name_en; // Use English name for UI language
                        const nativeName = lang.name_native;
                        
                        return (
                          <label key={lang.code} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  updateFilters({ languages: [...filters.languages, lang.code] });
                                } else {
                                  updateFilters({ languages: filters.languages.filter(l => l !== lang.code) });
                                }
                              }}
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                            />
                            <div className="flex items-center space-x-2">
                              <img 
                                src={getFlagUrl(lang.code)} 
                                alt={`${lang.name_en} flag`}
                                className={`w-6 h-4 rounded-sm border border-white shadow-sm transition-all duration-200 ${
                                  isSelected ? 'opacity-100' : 'opacity-40 grayscale'
                                }`}
                              />
                              <span className="text-sm text-gray-700">
                                {uiLanguageName} ({nativeName})
                              </span>
                            </div>
                          </label>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => toggleSection('categories')}
                  className="w-full flex items-center justify-between py-2 text-left hover:text-primary-600 transition-colors"
                >
                  <span className="label flex items-center">
                    {t('search.categories')}
                    {filters.categories.length > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-primary-600 rounded-full">
                        {filters.categories.length}
                      </span>
                    )}
                  </span>
                  <svg
                    className={`w-5 h-5 transition-transform ${expandedSections.categories ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedSections.categories && (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {availableCategories.filter(cat => !cat.parent_id).slice(0, 10).map((category) => (
                    <label key={category.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            updateFilters({ categories: [...filters.categories, category.id.toString()] });
                          } else {
                            updateFilters({ categories: filters.categories.filter(c => c !== category.id.toString()) });
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {i18n.language === 'nl' ? category.name_nl : category.name_en}
                      </span>
                    </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Filters */}
              {(filters.languages.length > 0 || filters.categories.length > 0 || filters.mode || filters.city) && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h4>
                  <div className="flex flex-wrap gap-2">
                    {filters.languages.map((lang) => (
                      <Badge key={lang} variant="primary" size="sm" className="cursor-pointer" onClick={() => updateFilters({ languages: filters.languages.filter(l => l !== lang) })}>
                        {lang}
                        <span className="ml-1">×</span>
                      </Badge>
                    ))}
                    {filters.categories.map((catId) => {
                      const category = availableCategories.find(c => c.id.toString() === catId);
                      return category ? (
                        <Badge key={catId} variant="primary" size="sm" className="cursor-pointer" onClick={() => updateFilters({ categories: filters.categories.filter(c => c !== catId) })}>
                          {i18n.language === 'nl' ? category.name_nl : category.name_en}
                          <span className="ml-1">×</span>
                        </Badge>
                      ) : null;
                    })}
                    {filters.city && (
                      <Badge variant="secondary" size="sm" className="cursor-pointer" onClick={() => updateFilters({ city: '' })}>
                        {filters.city}
                        <span className="ml-1">×</span>
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Apply Button */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;