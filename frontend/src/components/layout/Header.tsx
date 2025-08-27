import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
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
    { code: 'zgh', name: 'ⵜⴰⵎⴰⵣⵉⵖⵜ', flag: '🇲🇦' },
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'zh-Hans', name: '中文', flag: '🇨🇳' },
    { code: 'yue', name: '廣東話', flag: '🇭🇰' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ti', name: 'ትግርኛ', flag: '🇪🇷' },
    { code: 'so', name: 'Soomaali', flag: '🇸🇴' },
  ];

  const currentLanguage = supportedLanguages.find(lang => lang.code === i18n.language) || supportedLanguages[0];

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-soft border-b border-gray-100 sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-medium group-hover:shadow-glow transition-all duration-300">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                {t('header.title')}
              </div>
              <div className="text-xs text-gray-500 font-medium">
                {t('header.tagline')}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/search"
              className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200 relative group"
            >
              {t('common.search')}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200">
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-large border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right scale-95 group-hover:scale-100">
                <div className="p-2 max-h-80 overflow-y-auto">
                  <div className="text-xs font-medium text-gray-500 px-3 py-2 border-b border-gray-100">
                    Select Language / Taal kiezen
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
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                      {i18n.language === lang.code && (
                        <Badge variant="primary" size="sm">Active</Badge>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="ghost" size="md">
                      {t('header.dashboard')}
                    </Button>
                  </Link>
                  <Button variant="outline" size="md" onClick={handleLogout}>
                    {t('header.logout')}
                  </Button>
                  <div className="text-sm text-gray-600">
                    {user?.email}
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="md">
                      {t('header.login')}
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="primary" size="md">
                      {t('header.register')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 animate-slide-down">
            <div className="flex flex-col space-y-4">
              <Link
                to="/search"
                className="text-gray-600 hover:text-primary-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('common.search')}
              </Link>
              
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-2">
                    <Link to="/dashboard">
                      <Button variant="ghost" size="md" className="w-full justify-center">
                        {t('header.dashboard')}
                      </Button>
                    </Link>
                  </div>
                  <div className="px-4 py-2">
                    <Button 
                      variant="outline" 
                      size="md" 
                      className="w-full justify-center"
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                    >
                      {t('header.logout')}
                    </Button>
                  </div>
                  <div className="px-4 py-2 text-sm text-gray-600 text-center">
                    {user?.email}
                  </div>
                </>
              ) : (
                <>
                  <div className="px-4 py-2">
                    <Link to="/login">
                      <Button variant="ghost" size="md" className="w-full justify-center">
                        {t('header.login')}
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="px-4 py-2">
                    <Link to="/register">
                      <Button variant="primary" size="md" className="w-full justify-center">
                        {t('header.register')}
                      </Button>
                    </Link>
                  </div>
                </>
              )}
              
              {/* Mobile language selector */}
              <div className="border-t border-gray-100 pt-4 px-4">
                <div className="text-sm font-medium text-gray-900 mb-3">Language / Taal</div>
                <div className="grid grid-cols-2 gap-2">
                  {supportedLanguages.slice(0, 8).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setIsMenuOpen(false);
                      }}
                      className={`text-left text-sm p-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                        i18n.language === lang.code
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;