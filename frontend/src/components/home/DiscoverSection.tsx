import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface DiscoverSectionProps {
  className?: string;
}

type TabType = 'try-it' | 'how-it-works' | 'trust';

export const DiscoverSection = ({ className = '' }: DiscoverSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('try-it');
  const [activeExample, setActiveExample] = useState(0);
  const [showAllExamples, setShowAllExamples] = useState(false);
  
  // Whimsical states for delightful interactions
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [clickedExample, setClickedExample] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [easterEggClicks, setEasterEggClicks] = useState(0);
  const [magicMode, setMagicMode] = useState(false);
  
  // Whimsical loading messages for different states
  const loadingMessages = [
    "🔍 Summoning multilingual magic...",
    "🌟 Teaching AI your language...", 
    "🚀 Connecting you to the perfect professional...",
    "✨ Making language barriers disappear...",
    "🎯 Finding your linguistic match..."
  ];
  
  const [currentLoadingMsg, setCurrentLoadingMsg] = useState(0);
  
  // Cycle loading messages for entertainment
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLoadingMsg(prev => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loadingMessages.length]);

  const searchExamples = t('discover.examples', { returnObjects: true });

  const handleExampleClick = (query: string, index: number) => {
    // Whimsical click feedback
    setClickedExample(index);
    setShowConfetti(true);
    
    // Reset visual effects after animation
    setTimeout(() => {
      setClickedExample(null);
      setShowConfetti(false);
    }, 1500);
    
    // Navigate with delightful delay
    setTimeout(() => {
      const params = new URLSearchParams();
      params.set('keyword', query);
      navigate(`/search?${params.toString()}`);
    }, 800);
  };
  
  // Easter egg function - clicking title multiple times activates magic mode
  const handleTitleClick = () => {
    setEasterEggClicks(prev => prev + 1);
    if (easterEggClicks >= 4) {
      setMagicMode(true);
      setEasterEggClicks(0);
      // Reset magic mode after 10 seconds
      setTimeout(() => setMagicMode(false), 10000);
    }
  };

  const tabs = [
    { id: 'try-it', label: t('home.tab_try_search') },
    { id: 'for-providers', label: t('home.tab_for_businesses') },
    { id: 'get-started', label: t('home.tab_get_started') }
  ];

  return (
    <section className={`py-16 bg-green-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header with Easter Egg */}
          <div className="text-center mb-12">
            <h2 
              className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 cursor-pointer select-none transition-all duration-300 ${
                magicMode ? 'animate-pulse bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent' : ''
              }`}
              onClick={handleTitleClick}
              title={easterEggClicks > 0 ? `${5 - easterEggClicks} more clicks for magic ✨` : 'Click me multiple times for a surprise!'}
            >
              {magicMode ? t('discover.title_magic') : t('discover.title')}
              {easterEggClicks > 0 && easterEggClicks < 5 && (
                <span className="inline-block ml-2 animate-bounce">
                  {'✨'.repeat(easterEggClicks)}
                </span>
              )}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {magicMode 
                ? t('discover.subtitle_magic') 
                : t('discover.subtitle')
              }
            </p>
            
            {/* Confetti Effect */}
            {showConfetti && (
              <div className="fixed inset-0 pointer-events-none z-50">
                <div className="absolute inset-0 animate-ping">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="text-6xl animate-spin">🎉</div>
                  </div>
                </div>
                {Array.from({length: 20}).map((_, i) => (
                  <div 
                    key={i}
                    className={`absolute w-2 h-2 rounded-full animate-bounce`}
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${30 + Math.random() * 40}%`,
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)],
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: '1.5s'
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tab Navigation - Properly Centered */}
          <div className="flex justify-center mb-16">
            <div className="bg-white rounded-xl p-2 border border-gray-200 shadow-lg">
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    onMouseEnter={() => setHoveredTab(tab.id)}
                    onMouseLeave={() => setHoveredTab(null)}
                    className={`px-8 py-4 rounded-lg font-semibold text-sm transition-all duration-300 transform ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white scale-105 shadow-lg'
                        : hoveredTab === tab.id
                        ? 'text-gray-900 bg-gradient-to-r from-blue-50 to-purple-50 scale-102 shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                    title={
                      tab.id === 'try-it' ? 'Try our AI search with real examples ✨' :
                      tab.id === 'for-providers' ? 'Join as a service provider 💼' :
                      'Get started as resident or business 🚀'
                    }
                  >
                    {tab.label}
                    {hoveredTab === tab.id && (
                      <span className="ml-2 inline-block animate-bounce">
                        {tab.id === 'try-it' ? '🔍' : tab.id === 'for-providers' ? '💼' : '🚀'}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'try-it' && (
              <div className="animate-fade-in">
                {/* Clean 2x2 Grid of Search Examples */}
                <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
                  {searchExamples.map((example, index) => (
                    <div
                      key={index}
                      className={`group cursor-pointer transition-all duration-500 rounded-xl p-6 border transform hover:scale-[1.02] ${
                        clickedExample === index
                          ? 'bg-gradient-to-br from-green-50 to-blue-50 border-green-300 shadow-xl scale-105'
                          : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
                      }`}
                      onClick={() => {
                        setActiveExample(index);
                        handleExampleClick(example.query, index);
                      }}
                    >
                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                          {example.category}
                        </span>
                        <span className="text-xs text-white bg-gradient-to-r from-blue-500 to-purple-500 px-3 py-1 rounded-full font-medium">
                          {example.language}
                        </span>
                      </div>

                      {/* Search Query */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="text-3xl">
                          {example.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="font-mono font-bold text-lg text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                            "{example.query}"
                          </div>
                          <div className="text-sm text-gray-600 font-medium">
                            {example.description}
                          </div>
                        </div>
                      </div>

                      {/* AI Explanation */}
                      <div className="text-xs text-purple-700 font-medium bg-purple-50 px-3 py-2 rounded-lg mb-4">
                        💡 {example.explanation}
                      </div>

                      {/* Results */}
                      <div className="flex items-center justify-between">
                        <div className={`text-sm font-bold px-4 py-2 rounded-full transition-all duration-300 ${
                          clickedExample === index 
                            ? 'bg-green-500 text-white' 
                            : 'bg-green-100 text-green-700 group-hover:bg-green-200'
                        }`}>
                          {clickedExample === index ? example.whimsicalResult : example.results}
                        </div>
                        {clickedExample === index && (
                          <div className="text-xs text-green-600 animate-pulse">
                            Taking you there! ✨
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Single Call to Action */}
                <div className="text-center">
                  <Button
                    onClick={() => navigate('/search')}
                    size="lg"
                    className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold py-4 px-8 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {t('home.try_your_search')}
                      <span className="text-xl animate-bounce">🚀</span>
                    </span>
                  </Button>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    {magicMode ? "Your linguistic adventure awaits! ✨" : t('home.search_tagline')}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'for-providers' && (
              <div className="animate-fade-in">
                <div className="max-w-4xl mx-auto">
                  {/* Clean Header */}
                  <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Join as a Service Provider
                    </h3>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                      Connect with thousands of residents who need services in their language
                    </p>
                  </div>

                  {/* Benefits for Businesses */}
                  <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Reach New Clients</h4>
                      <p className="text-gray-600">Connect with immigrants and expats who specifically need services in their language</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Verified & Trusted</h4>
                      <p className="text-gray-600">We verify all businesses through KVK and BTW registration for customer trust</p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Easy Setup</h4>
                      <p className="text-gray-600">Simple registration process and manage your profile through our dashboard</p>
                    </div>
                  </div>

                  {/* Simple Process */}
                  <div className="bg-gray-50 rounded-xl p-8 mb-12">
                    <h4 className="text-xl font-bold text-gray-900 mb-8 text-center">How to Get Started</h4>
                    
                    <div className="grid md:grid-cols-4 gap-6 text-center">
                      <div>
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">1</div>
                        <h5 className="font-semibold text-gray-900 mb-1">Register</h5>
                        <p className="text-sm text-gray-600">Create your business account</p>
                      </div>
                      <div>
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">2</div>
                        <h5 className="font-semibold text-gray-900 mb-1">Verify</h5>
                        <p className="text-sm text-gray-600">Submit KVK & BTW details</p>
                      </div>
                      <div>
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">3</div>
                        <h5 className="font-semibold text-gray-900 mb-1">Setup</h5>
                        <p className="text-sm text-gray-600">Add services & languages</p>
                      </div>
                      <div>
                        <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">✓</div>
                        <h5 className="font-semibold text-gray-900 mb-1">Go Live</h5>
                        <p className="text-sm text-gray-600">Start receiving clients</p>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                    <div className="max-w-md mx-auto">
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">Simple Pricing</h4>
                      <div className="text-4xl font-bold text-blue-600 mb-2">€9.99<span className="text-lg text-gray-600">/month</span></div>
                      <p className="text-gray-600 mb-6">3-month free trial • Cancel anytime</p>
                      
                      <ul className="text-left text-sm text-gray-600 mb-8 space-y-2">
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Complete business profile
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Unlimited services & staff
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Direct client messaging
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Analytics dashboard
                        </li>
                      </ul>

                      <Button
                        onClick={() => navigate('/register/provider')}
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        Start Free Trial
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'get-started' && (
              <div className="animate-fade-in">
                <div className="max-w-4xl mx-auto">
                  {/* Header */}
                  <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Ready to Get Started?
                    </h3>
                    <p className="text-lg text-gray-600">
                      Choose your path and join thousands of satisfied users
                    </p>
                  </div>

                  {/* Two Clear Paths */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* For Residents */}
                    <div className="bg-white border border-gray-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow">
                      <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      
                      <h4 className="text-2xl font-bold text-gray-900 mb-4">For Residents</h4>
                      <p className="text-gray-600 mb-8">
                        Find professionals who speak your language. Search for doctors, lawyers, tax advisors, and more.
                      </p>
                      
                      <ul className="text-left text-sm text-gray-600 mb-8 space-y-3">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Search in 15+ languages including Arabic, Turkish, Polish</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>All professionals are KVK & BTW verified</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Direct contact with service providers</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span><strong>Completely free</strong> - no hidden costs ever</span>
                        </li>
                      </ul>
                      
                      <Button
                        onClick={() => navigate('/search')}
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-4"
                      >
                        Start Searching Now
                      </Button>
                      
                      <p className="text-xs text-gray-500">No registration required</p>
                    </div>

                    {/* For Businesses */}
                    <div className="bg-white border-2 border-blue-200 rounded-xl p-8 text-center hover:shadow-lg transition-shadow relative">
                      {/* Popular badge */}
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          POPULAR
                        </span>
                      </div>
                      
                      <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      
                      <h4 className="text-2xl font-bold text-gray-900 mb-4">{t('home.for_businesses_title')}</h4>
                      <p className="text-gray-600 mb-8">
                        {t('home.for_businesses_subtitle')}
                      </p>
                      
                      <div className="text-3xl font-bold text-blue-600 mb-2">€9.99<span className="text-lg text-gray-600">/month</span></div>
                      <p className="text-sm text-gray-600 mb-6">3-month free trial</p>
                      
                      <ul className="text-left text-sm text-gray-600 mb-8 space-y-3">
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Complete business profile with multiple services</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Direct client communication system</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Analytics and performance dashboard</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>KVK & BTW verification for trust</span>
                        </li>
                      </ul>
                      
                      <Button
                        onClick={() => navigate('/register/provider')}
                        size="lg"
                        className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
                      >
                        Start Free Trial
                      </Button>
                      
                      <p className="text-xs text-gray-500">Cancel anytime • No setup fees</p>
                    </div>
                  </div>

                  {/* Simple Trust Indicators */}
                  <div className="mt-16 text-center">
                    <p className="text-gray-600 mb-8">Trusted by professionals and residents across the Netherlands</p>
                    
                    <div className="flex justify-center items-center gap-8 text-gray-500">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm font-medium">KVK Verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-sm font-medium">GDPR Compliant</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-sm font-medium">AI-Powered</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DiscoverSection;