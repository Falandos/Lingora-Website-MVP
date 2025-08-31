import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowItWorksModal = ({ isOpen, onClose }: HowItWorksModalProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [clickedExample, setClickedExample] = useState<number | null>(null);

  const searchExamples = t('discover.examples', { returnObjects: true });

  const handleExampleClick = (query: string, index: number) => {
    setClickedExample(index);
    
    // Navigate with a short delay for visual feedback
    setTimeout(() => {
      const params = new URLSearchParams();
      params.set('keyword', query);
      navigate(`/search?${params.toString()}`);
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {t('home.how_it_works')}
                </h2>
                <p className="text-gray-600 mt-1">
                  Try these examples to see our AI-powered multilingual search in action
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Examples Grid */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {searchExamples.map((example, index) => (
                <div
                  key={index}
                  className={`group cursor-pointer transition-all duration-500 rounded-xl p-6 border transform hover:scale-[1.02] ${
                    clickedExample === index
                      ? 'bg-gradient-to-br from-green-50 to-blue-50 border-green-300 shadow-xl scale-105'
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-gray-50 hover:to-blue-50'
                  }`}
                  onClick={() => handleExampleClick(example.query, index)}
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

            {/* Call to Action */}
            <div className="text-center border-t border-gray-200 pt-8">
              <Button
                onClick={() => {
                  navigate('/search');
                  onClose();
                }}
                size="lg"
                className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold py-4 px-8 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  {t('home.try_your_search')}
                  <span className="text-xl animate-bounce">🚀</span>
                </span>
              </Button>
              
              <p className="text-sm text-gray-500 mt-4">
                {t('home.search_tagline')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksModal;