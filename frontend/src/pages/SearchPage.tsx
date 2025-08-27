import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import ProviderCard from '../components/search/ProviderCard';
import SimpleMap from '../components/search/SimpleMap';
import CityAutocomplete from '../components/ui/CityAutocomplete';

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

const SearchPage = () => {
  const { t, i18n } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [allProviders, setAllProviders] = useState<SearchResult[]>([]); // For map display
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [filters, setFilters] = useState<SearchFilters>({
    languages: searchParams.get('languages')?.split(',') || [],
    categories: searchParams.get('categories')?.split(',') || [],
    city: searchParams.get('city') || '', // Start empty so user can select
    radius: parseInt(searchParams.get('radius') || '25'),
    mode: searchParams.get('mode') || '',
    keyword: searchParams.get('keyword') || '',
    sortBy: searchParams.get('sortBy') || 'best_match',
    coordinates: null
  });
  
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

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setPage(1);
    
    // Update URL params
    const params = new URLSearchParams();
    if (updatedFilters.languages.length > 0) params.set('languages', updatedFilters.languages.join(','));
    if (updatedFilters.categories.length > 0) params.set('categories', updatedFilters.categories.join(','));
    if (updatedFilters.city) params.set('city', updatedFilters.city);
    params.set('radius', updatedFilters.radius.toString());
    // Service mode filter removed
    if (updatedFilters.keyword) params.set('keyword', updatedFilters.keyword);
    
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      languages: [],
      categories: [],
      city: '',
      radius: 25,
      mode: '',
      keyword: '',
      sortBy: 'distance',
      coordinates: null
    });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                  onChange={(e) => updateFilters({ keyword: e.target.value })}
                  className="input-field w-full pl-12"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-24">
              <CardBody className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('search.filters')}</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    {t('common.clear')}
                  </Button>
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
                      {availableLanguages.slice(0, expandedSections.languages ? 15 : 5).map((lang) => (
                      <label key={lang.code} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.languages.includes(lang.code)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateFilters({ languages: [...filters.languages, lang.code] });
                            } else {
                              updateFilters({ languages: filters.languages.filter(l => l !== lang.code) });
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <img 
                          src={`https://flagcdn.com/24x18/${lang.code === 'en' ? 'gb' : lang.code === 'ar' ? 'sa' : lang.code === 'zgh' ? 'ma' : lang.code === 'uk' ? 'ua' : lang.code === 'zh' ? 'cn' : lang.code === 'yue' ? 'hk' : lang.code === 'ti' ? 'er' : lang.code === 'so' ? 'so' : lang.code === 'hi' ? 'in' : lang.code}.png`}
                          alt={`${lang.code} flag`}
                          className="w-4 h-3 object-cover rounded-sm"
                        />
                        <span className="text-sm text-gray-700">
                          {i18n.language === 'nl' ? lang.name_native : lang.name_en}
                        </span>
                      </label>
                      ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
};

export default SearchPage;