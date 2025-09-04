import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageTransitionContext } from '../contexts/LanguageTransitionContext';
import StatisticsBar from '../components/home/StatisticsBar';
import RecentProvidersCarousel from '../components/home/RecentProvidersCarousel';
import YourPathForwardSection from '../components/home/YourPathForwardSection';
import StickySearchBar from '../components/home/StickySearchBar';
import BackToTopButton from '../components/ui/BackToTopButton';
import HeroSectionV2 from '../components/home/HeroSectionV2';
import HowItWorksModal from '../components/home/HowItWorksModal';
import LanguageSwitchSuggestion from '../components/search/LanguageSwitchSuggestion';

interface Language {
  code: string;
  name_en: string;
  name_native: string;
}

interface Category {
  id: number;
  slug: string;
  name_nl: string;
  name_en: string;
  children?: Category[];
}

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const { triggerLanguageChange } = useLanguageTransitionContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [showLanguageSwitchSuggestion, setShowLanguageSwitchSuggestion] = useState(false);
  const [suggestedLanguage, setSuggestedLanguage] = useState<string>('');

  useEffect(() => {
    // Fetch categories for the popular categories section
    const fetchData = async () => {
      try {
        const categoriesRes = await fetch('/api/categories');
        
        if (categoriesRes.ok) {
          const catResult = await categoriesRes.json();
          // Handle both mock format (direct array) and real API format (wrapped in data)
          const catData = catResult.data || catResult || [];
          setCategories(catData);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);


  const currentLang = i18n.language;

  const handleLanguageClick = (languageCode: string) => {
    // Don't show suggestion if user clicked the same language as UI
    if (languageCode === currentLang) return;
    
    setSuggestedLanguage(languageCode);
    setShowLanguageSwitchSuggestion(true);
  };

  const handleLanguageSwitch = () => {
    if (suggestedLanguage) {
      triggerLanguageChange(suggestedLanguage, () => {
        i18n.changeLanguage(suggestedLanguage);
        localStorage.setItem('lingora-language', suggestedLanguage);
      });
    }
    setShowLanguageSwitchSuggestion(false);
  };

  const handleLanguageSwitchDismiss = () => {
    setShowLanguageSwitchSuggestion(false);
  };

  return (
    <div className="min-h-screen">
      {/* Sticky Search Bar */}
      <StickySearchBar />
      
      {/* Statistics Bar */}
      <StatisticsBar />
      
      {/* Hero Section V2 - Clean, working version */}
      <HeroSectionV2 
        onLanguageClick={handleLanguageClick}
        onShowHowItWorks={() => setShowHowItWorksModal(true)}
      />

      {/* Recently Added Providers */}
      <RecentProvidersCarousel />

      {/* Your Path Forward - Combined User & Provider CTAs */}
      <YourPathForwardSection />
      
      {/* Back to Top Button */}
      <BackToTopButton />
    
    {/* How It Works Modal - Rendered at page level */}
    <HowItWorksModal 
      isOpen={showHowItWorksModal}
      onClose={() => setShowHowItWorksModal(false)}
    />
    
      {/* Language Switch Suggestion - Using top-right placement for homepage */}
      {showLanguageSwitchSuggestion && (
        <LanguageSwitchSuggestion
          detectedLanguage={suggestedLanguage}
          currentUILanguage={currentLang}
          onAccept={handleLanguageSwitch}
          onDismiss={handleLanguageSwitchDismiss}
          placement="top-right"
        />
      )}
    </div>
  );
};

export default HomePage;