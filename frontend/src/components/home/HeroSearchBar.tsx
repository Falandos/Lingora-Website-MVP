import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface HeroSearchBarProps {
  className?: string;
}

export const HeroSearchBar = ({ className = '' }: HeroSearchBarProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const searchExamples = [
    { query: 'dokter', description: 'Medical professionals' },
    { query: 'need haircut', description: 'Hair salons & barbers' },
    { query: 'stressed', description: 'Mental health support' },
    { query: 'belasting hulp', description: 'Tax services' },
    { query: 'tandarts', description: 'Dental care' },
    { query: 'immigration lawyer', description: 'Legal services' }
  ];

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    const params = new URLSearchParams();
    params.set('keyword', searchTerm.trim());
    navigate(`/search?${params.toString()}`);
  };

  const handleExampleClick = (example: string) => {
    setSearchQuery(example);
    handleSearch(example);
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
              placeholder="Smart search: try 'dokter', 'stressed', or 'need help'..."
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
                disabled={!searchQuery.trim()}
              >
                Search
              </Button>
            </div>
          </div>
        </div>

      </div>

      {/* Search Examples */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600 mb-3">
          Try searching in any language:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {searchExamples.slice(0, 4).map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example.query)}
              className="
                inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 
                rounded-full text-sm text-gray-700 transition-all duration-200
                hover:shadow-sm border border-transparent hover:border-gray-300
              "
            >
              <span className="font-medium">"{example.query}"</span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span>AI-powered search in Dutch, English, Arabic, German, and 11+ other languages</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSearchBar;