import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import LanguageSelector from '../components/ui/LanguageSelector';
import SearchBar from '../components/ui/SearchBar';

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
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-bg">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230ea5e9' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container-custom relative z-10">
          <div className="section-padding">
            <div className="text-center max-w-4xl mx-auto">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 text-balance">
                  {t('home.hero_title')}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
                  {t('home.hero_subtitle')}
                </p>
              </div>

              {/* Modern Search Form */}
              <div className="animate-slide-up">
                <Card className="max-w-6xl mx-auto shadow-large border-0">
                  <CardBody className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
                      {/* Language Selection - 3 columns */}
                      <div className="lg:col-span-3 space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('home.search_language')}
                        </label>
                        <LanguageSelector
                          selectedLanguages={searchForm.languages}
                          onLanguageChange={(languages) => setSearchForm(prev => ({ ...prev, languages }))}
                        />
                      </div>

                      {/* Google-Style Search Bar - 6 columns */}
                      <div className="lg:col-span-6 space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          What are you looking for?
                        </label>
                        <SearchBar
                          value={searchForm.query}
                          onChange={(query) => setSearchForm(prev => ({ ...prev, query }))}
                          placeholder="Search for services, businesses, professionals..."
                          onSearch={handleSearch}
                        />
                      </div>

                      {/* Location - 3 columns */}
                      <div className="lg:col-span-3 space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('home.search_location')}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder={t('home.search_location')}
                            value={searchForm.location}
                            onChange={(e) => setSearchForm(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full px-4 py-4 pl-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-gray-700"
                          />
                          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <Button
                        onClick={handleSearch}
                        size="xl"
                        className="px-16 py-4 text-lg font-semibold"
                        leftIcon={
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        }
                      >
                        {t('home.search_button')}
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.how_it_works')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find professionals who speak your language in just three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.step_1')}</h3>
              <p className="text-gray-600 leading-relaxed">Use our advanced filters to find professionals who speak your language and offer the services you need.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.step_2')}</h3>
              <p className="text-gray-600 leading-relaxed">Browse verified professionals with detailed profiles showing their qualifications and language skills.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{t('home.step_3')}</h3>
              <p className="text-gray-600 leading-relaxed">Contact professionals directly through our platform and communicate in your preferred language.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our most popular service categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.filter(cat => !cat.parent_id).slice(0, 10).map((category, index) => (
              <Card
                key={`category-${category.id}-${index}`}
                variant="interactive"
                className="text-center group"
                onClick={() => navigate(`/search?categories=${category.id}`)}
              >
                <CardBody className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-primary-200 group-hover:to-secondary-200 transition-all duration-300">
                    <span className="text-2xl">{category.icon || '🏢'}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                    {currentLang === 'nl' ? category.name_nl : category.name_en}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;