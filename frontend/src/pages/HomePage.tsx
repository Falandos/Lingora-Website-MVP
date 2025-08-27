import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import LanguageSelector from '../components/ui/LanguageSelector';
import SearchBar from '../components/ui/SearchBar';
import StatisticsBar from '../components/home/StatisticsBar';
import HeroSearchBar from '../components/home/HeroSearchBar';
import LanguageFlags from '../components/home/LanguageFlags';
import AISearchShowcase from '../components/home/AISearchShowcase';
import RecentProvidersCarousel from '../components/home/RecentProvidersCarousel';
import TrustSignalsSection from '../components/home/TrustSignalsSection';
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
          <div className="pt-16 pb-24 sm:pt-20 sm:pb-32">
            <div className="text-center">
              {/* Main Headline */}
              <div className="animate-fade-in mb-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                  Find Professionals Who Speak
                  <span className="block">
                    <LanguageCarousel className="language-text-shadow" />
                  </span>
                </h1>
                <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Connect with verified professionals in healthcare, legal, financial, 
                  and educational services across the Netherlands.
                </p>
              </div>

              {/* Hero Search Bar */}
              <div className="animate-slide-up mb-12">
                <HeroSearchBar />
              </div>

              {/* Language Support */}
              <div className="animate-fade-in">
                <LanguageFlags className="mb-8" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Search Showcase */}
      <AISearchShowcase />

      {/* How it Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Find professionals who speak your language in just three simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
              {/* Step 1: Search */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Search Smart</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Use our AI-powered search to find professionals in any language. 
                  Try "dokter" or "stressed" - our system understands what you need.
                </p>
                <div className="text-sm text-primary-600 bg-primary-50 px-3 py-1 rounded-full inline-block">
                  15+ languages supported
                </div>
              </div>

              {/* Step 2: Browse */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Browse Verified Profiles</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Every provider is KVK verified with detailed profiles showing their 
                  language skills, services, and professional qualifications.
                </p>
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                  19 verified businesses
                </div>
              </div>

              {/* Step 3: Connect */}
              <div className="text-center group">
                <div className="relative mb-8">
                  <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Connect Directly</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Contact professionals directly through our secure platform. 
                  Communicate in your preferred language with confidence.
                </p>
                <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
                  Free for residents
                </div>
              </div>
            </div>

            {/* Success Stories Preview */}
            <div className="mt-16 text-center">
              <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">🇳🇱</div>
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">🇸🇦</div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">🇺🇦</div>
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">🇩🇪</div>
                  </div>
                  <span>Join thousands of satisfied users</span>
                </div>
                <blockquote className="text-lg text-gray-700 italic mb-4">
                  "Finally found a doctor who speaks Arabic! The search was so easy - 
                  I just typed 'dokter' and found exactly what I needed."
                </blockquote>
                <p className="text-sm text-gray-500">— Recent user from Amsterdam</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added Providers */}
      <RecentProvidersCarousel />

      {/* Trust Signals & CTA */}
      <TrustSignalsSection />
    </div>
  );
};

export default HomePage;