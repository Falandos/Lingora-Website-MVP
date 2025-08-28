import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import LanguageSelector from '../components/ui/LanguageSelector';
import SearchBar from '../components/ui/SearchBar';
import StatisticsBar from '../components/home/StatisticsBar';
import HeroSearchBar from '../components/home/HeroSearchBar';
import DiscoverSection from '../components/home/DiscoverSection';
import RecentProvidersCarousel from '../components/home/RecentProvidersCarousel';
import TrustSignalsSection from '../components/home/TrustSignalsSection';
import StickySearchBar from '../components/home/StickySearchBar';
import BackToTopButton from '../components/ui/BackToTopButton';
import LanguageCarousel from '../components/home/LanguageCarousel';

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
  const navigate = useNavigate();
  const [languages, setLanguages] = useState<Language[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchForm, setSearchForm] = useState({
    languages: [] as string[],
    query: '',
    location: '',
  });

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

  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (searchForm.languages.length > 0) {
      params.set('languages', searchForm.languages.join(','));
    }
    
    if (searchForm.query) {
      params.set('keyword', searchForm.query);
    }
    
    if (searchForm.location) {
      params.set('city', searchForm.location);
    }

    navigate(`/search?${params.toString()}`);
  };

  const currentLang = i18n.language;

  return (
    <div className="min-h-screen">
      {/* Sticky Search Bar */}
      <StickySearchBar />
      
      {/* Statistics Bar */}
      <StatisticsBar />
      
      {/* Hero Section */}
      <section className="relative bg-white">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233B82F6'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="pt-20 pb-32 sm:pt-24 sm:pb-40">
            <div className="text-center">
              {/* Main Headline */}
              <div className="animate-fade-in mb-12">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
                  Find Professionals Who Speak
                  <span className="block mt-4">
                    <LanguageCarousel className="language-text-shadow" />
                  </span>
                </h1>
              </div>

              {/* Hero Search Bar */}
              <div className="animate-slide-up mb-16">
                <HeroSearchBar />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Providers */}
      <RecentProvidersCarousel />

      {/* Discover Section with Tabs */}
      <DiscoverSection />

      {/* Trust Signals & CTA */}
      <TrustSignalsSection />
      
      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
};

export default HomePage;