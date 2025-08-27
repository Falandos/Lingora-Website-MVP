import { useState } from 'react';
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

export const HeroSearchBar = ({ className = '' }: HeroSearchBarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Featured languages to display in flags
  const featuredLanguages = [
    { code: 'nl', name: 'Dutch' },
    { code: 'en', name: 'English' },
    { code: 'ar', name: 'Arabic' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' }
  ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('keyword', searchQuery.trim());
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
          <div className="flex items-center">
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
            
            <div className="pr-3">
              <Button
                onClick={() => handleSearch()}
                size="lg"
                className="px-8 py-3 text-lg font-semibold"
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