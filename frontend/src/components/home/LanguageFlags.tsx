import { useState, useEffect } from 'react';

// Get flag URL for language code (reusing from ProviderCard)
const getFlagUrl = (langCode: string) => {
  const countryCodeMap: Record<string, string> = {
    'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'zgh': 'ma',
    'uk': 'ua', 'pl': 'pl', 'zh-Hans': 'cn', 'yue': 'hk', 'es': 'es',
    'hi': 'in', 'tr': 'tr', 'fr': 'fr', 'ti': 'er', 'so': 'so'
  };
  const countryCode = countryCodeMap[langCode] || 'un';
  return `https://flagcdn.com/32x24/${countryCode}.png`;
};

interface Language {
  code: string;
  name_en: string;
  name_native: string;
}

interface LanguageFlagsProps {
  className?: string;
  animated?: boolean;
}

export const LanguageFlags = ({ className = '', animated = true }: LanguageFlagsProps) => {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Featured languages to display (most common ones)
  const featuredLanguages = [
    { code: 'nl', name_en: 'Dutch', name_native: 'Nederlands' },
    { code: 'en', name_en: 'English', name_native: 'English' },
    { code: 'de', name_en: 'German', name_native: 'Deutsch' },
    { code: 'ar', name_en: 'Arabic', name_native: 'العربية' },
    { code: 'es', name_en: 'Spanish', name_native: 'Español' },
    { code: 'fr', name_en: 'French', name_native: 'Français' },
    { code: 'pl', name_en: 'Polish', name_native: 'Polski' },
    { code: 'uk', name_en: 'Ukrainian', name_native: 'Українська' },
    { code: 'zh-Hans', name_en: 'Chinese', name_native: '中文' },
    { code: 'hi', name_en: 'Hindi', name_native: 'हिन्दी' },
    { code: 'tr', name_en: 'Turkish', name_native: 'Türkçe' },
    { code: 'ti', name_en: 'Tigrinya', name_native: 'ትግርኛ' }
  ];

  useEffect(() => {
    setLanguages(featuredLanguages);
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    if (!animated || languages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % languages.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [animated, languages.length]);

  if (languages.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-sm text-gray-600 mr-3 hidden sm:block">
        Languages we support:
      </div>
      
      {/* Static flag grid for larger screens */}
      <div className="hidden md:flex items-center gap-2 flex-wrap justify-center">
        {languages.slice(0, 8).map((lang, index) => (
          <div
            key={lang.code}
            className={`inline-block opacity-80 hover:opacity-100 transition-opacity duration-300`}
            style={{ animationDelay: `${index * 100}ms` }}
            title={`${lang.name_en} (${lang.name_native})`}
          >
            <img
              src={getFlagUrl(lang.code)}
              alt={lang.name_en}
              className="w-6 h-4 rounded shadow-sm"
              loading="lazy"
            />
          </div>
        ))}
        <div className="text-xs text-gray-500 ml-2">
          +{languages.length - 8} more
        </div>
      </div>

      {/* Animated carousel for mobile/tablet */}
      <div className="md:hidden flex items-center gap-3">
        <div className="flex items-center gap-1 overflow-hidden">
          {languages.slice(currentIndex, currentIndex + 4).concat(
            currentIndex + 4 > languages.length 
              ? languages.slice(0, (currentIndex + 4) - languages.length)
              : []
          ).map((lang, index) => (
            <div
              key={`${lang.code}-${currentIndex}`}
              className="inline-block transition-all duration-500 ease-in-out transform"
              style={{ 
                transform: `translateX(${index * -100}%)`,
                animation: animated ? 'slideIn 0.5s ease-out' : 'none'
              }}
            >
              <img
                src={getFlagUrl(lang.code)}
                alt={lang.name_en}
                className="w-6 h-4 rounded shadow-sm"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-500">
          & more
        </div>
      </div>
    </div>
  );
};

export default LanguageFlags;