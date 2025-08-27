import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Badge } from './Badge';

interface Language {
  code: string;
  name_en: string;
  name_native: string;
  flag: string;
  country: string;
}

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguageChange: (languages: string[]) => void;
  className?: string;
}

const LanguageSelector = ({ selectedLanguages, onLanguageChange, className = '' }: LanguageSelectorProps) => {
  const { t, i18n } = useTranslation();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = i18n.language;

  // Fetch languages from API
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        const result = await response.json();
        // Handle both mock format (direct array) and real API format (wrapped in data)
        const data = result.data || result || [];
        setLanguages(data);
      } catch (error) {
        console.error('Failed to fetch languages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleLanguage = (langCode: string) => {
    if (selectedLanguages.includes(langCode)) {
      onLanguageChange(selectedLanguages.filter(l => l !== langCode));
    } else {
      onLanguageChange([...selectedLanguages, langCode]);
    }
  };

  const getDisplayName = (lang: Language) => {
    return currentLang === 'nl' ? lang.name_native : lang.name_en;
  };

  // Get flag SVG URL for country code
  const getFlagUrl = (langCode: string) => {
    const countryCodeMap: Record<string, string> = {
      'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'zgh': 'ma',
      'uk': 'ua', 'pl': 'pl', 'zh': 'cn', 'yue': 'hk', 'es': 'es',
      'hi': 'in', 'tr': 'tr', 'fr': 'fr', 'ti': 'er', 'so': 'so'
    };
    const countryCode = countryCodeMap[langCode] || 'un';
    return `https://flagcdn.com/24x18/${countryCode}.png`;
  };

  // Get the primary flag to show in the button
  const primaryFlagCode = selectedLanguages.length > 0 
    ? selectedLanguages[0]
    : null;

  const buttonText = selectedLanguages.length === 0 
    ? t('home.search_language')
    : selectedLanguages.length === 1
    ? getDisplayName(languages.find(l => l.code === selectedLanguages[0]) || languages[0])
    : `${selectedLanguages.length} languages`;

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-12 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          {primaryFlagCode ? (
            <img 
              src={getFlagUrl(primaryFlagCode)} 
              alt={`${primaryFlagCode} flag`}
              className="w-6 h-4 object-cover rounded-sm"
            />
          ) : (
            <div className="w-6 h-4 bg-gray-200 rounded-sm flex items-center justify-center">
              <span className="text-xs">🌍</span>
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 truncate">
            {buttonText}
          </span>
        </div>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Selected Language Badges */}
      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedLanguages.map((langCode) => {
            const lang = languages.find(l => l.code === langCode);
            if (!lang) return null;
            return (
              <Badge 
                key={langCode} 
                variant="primary" 
                className="cursor-pointer hover:bg-primary-200 transition-colors flex items-center"
                onClick={() => toggleLanguage(langCode)}
              >
                <img 
                  src={getFlagUrl(langCode)} 
                  alt={`${langCode} flag`}
                  className="w-4 h-3 object-cover rounded-sm mr-2"
                />
                {getDisplayName(lang)}
                <span className="ml-2">×</span>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="grid grid-cols-1 gap-1">
              {languages.map((lang) => (
                <label 
                  key={lang.code} 
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(lang.code)}
                    onChange={() => toggleLanguage(lang.code)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <img 
                    src={getFlagUrl(lang.code)} 
                    alt={`${lang.code} flag`}
                    className="w-6 h-4 object-cover rounded-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {getDisplayName(lang)}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {lang.country}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;