import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSearch?: () => void;
}

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder,
  className = '',
  onSearch 
}: SearchBarProps) => {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const defaultPlaceholder = placeholder || "Search for services, businesses, professionals...";

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`relative flex items-center bg-white border-2 rounded-full transition-all duration-300 hover:shadow-md ${
          focused 
            ? 'border-primary-500 shadow-lg' 
            : 'border-gray-200'
        }`}
      >
        {/* Search Icon */}
        <div className="flex items-center pl-5 pr-3">
          <svg 
            className="w-5 h-5 text-gray-400" 
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

        {/* Search Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyPress={handleKeyPress}
          placeholder={defaultPlaceholder}
          className="flex-1 py-4 pr-5 text-lg bg-transparent outline-none placeholder-gray-400 text-gray-700"
        />

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="flex items-center justify-center w-8 h-8 mr-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Voice Search Button (Future Enhancement) */}
        <button
          type="button"
          className="flex items-center justify-center w-8 h-8 mr-4 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors duration-200"
          title="Voice search (coming soon)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
      </div>

      {/* Search Suggestions (Future Enhancement) */}
      {focused && value.length > 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg">
          <div className="p-2">
            <div className="text-sm text-gray-500 px-3 py-2">
              Search suggestions will appear here in a future update
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;