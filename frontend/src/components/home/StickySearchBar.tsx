import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface StickySearchBarProps {
  className?: string;
}

export const StickySearchBar = ({ className = '' }: StickySearchBarProps) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lingora-language', lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const supportedLanguages = [
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  const currentLanguage = supportedLanguages.find(lang => lang.code === i18n.language) || supportedLanguages[0];

  useEffect(() => {
    const handleScroll = () => {
      // Show the sticky bar when user scrolls past the hero section (approximately 600px)
      const scrolled = window.scrollY > 600;
      setIsVisible(scrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    } ${className}`}>
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            {/* Left: Logo */}
            <div className="flex items-center gap-6 text-sm">
              <div className="font-bold text-primary-600 cursor-pointer" onClick={() => navigate('/')}>
                Lingora
              </div>
            </div>

            {/* Right: Navigation matching main header */}
            <div className="flex items-center gap-4">
              {/* Browse Professionals Link */}
              <Link
                to="/search"
                className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 text-sm"
              >
                {t('common.browse_professionals')}
              </Link>
              
              {/* Language Selector */}
              <div className="relative group">
                <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200">
                  <span className="text-sm">{currentLanguage.flag}</span>
                  <span className="text-xs font-medium">{currentLanguage.code.toUpperCase()}</span>
                  <svg className="w-3 h-3 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                      Select Language
                    </div>
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => changeLanguage(lang.code)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                          i18n.language === lang.code
                            ? 'bg-primary-50 text-primary-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                        {i18n.language === lang.code && (
                          <Badge variant="primary" size="sm">Active</Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Auth Buttons - Same as main header */}
              <div className="flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard">
                      <Button variant="ghost" size="sm">
                        {t('header.dashboard')}
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                      {t('header.logout')}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="ghost" size="sm">
                        {t('header.login')}
                      </Button>
                    </Link>
                    <Link to="/register" className="hidden sm:block">
                      <Button variant="primary" size="sm">
                        {t('header.register')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickySearchBar;