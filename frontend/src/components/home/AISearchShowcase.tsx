import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';

interface AISearchShowcaseProps {
  className?: string;
}

export const AISearchShowcase = ({ className = '' }: AISearchShowcaseProps) => {
  const navigate = useNavigate();
  const [activeExample, setActiveExample] = useState(0);
  const [showAllExamples, setShowAllExamples] = useState(false);

  const searchExamples = [
    {
      query: 'dokter',
      language: 'Dutch',
      description: 'Medical professionals',
      results: '3 providers found',
      explanation: 'AI understands "dokter" = doctor in Dutch'
    },
    {
      query: 'stressed',
      language: 'English',
      description: 'Mental health support',
      results: '2 providers found',
      explanation: 'AI connects emotions to appropriate services'
    },
    {
      query: 'belasting hulp',
      language: 'Dutch',
      description: 'Tax assistance',
      results: '1 provider found',
      explanation: 'Smart matching across service categories'
    },
    {
      query: 'need haircut',
      language: 'English',
      description: 'Hair salons & barbers',
      results: '2 providers found',
      explanation: 'Natural language understanding'
    }
  ];

  const handleExampleClick = (query: string) => {
    const params = new URLSearchParams();
    params.set('keyword', query);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <section className={`py-16 bg-gradient-to-br from-gray-50 to-blue-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              🧠 AI-Powered Search
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Search in Any Language, Get Perfect Results
            </h2>
          </div>

          {/* Interactive Demo */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Example Queries */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                Try these examples:
              </h3>
              
              {searchExamples.slice(0, showAllExamples ? searchExamples.length : 2).map((example, index) => (
                <Card
                  key={index}
                  variant={activeExample === index ? 'interactive' : 'default'}
                  className={`cursor-pointer transition-all duration-300 ${
                    activeExample === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => setActiveExample(index)}
                >
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-flex items-center gap-2 text-lg font-mono font-semibold text-gray-900">
                            "{example.query}"
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {example.language}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          → {example.description}
                        </p>
                        <p className="text-xs text-blue-600 font-medium">
                          {example.explanation}
                        </p>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-sm font-semibold text-green-600 mb-1">
                          {example.results}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExampleClick(example.query);
                          }}
                        >
                          Try it
                        </Button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
              
              {/* Show More/Less Toggle */}
              {searchExamples.length > 2 && (
                <div className="text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllExamples(!showAllExamples)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    {showAllExamples ? (
                      <>
                        Show less examples ↑
                      </>
                    ) : (
                      <>
                        Show more examples ↓ ({searchExamples.length - 2} more)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Compact Features */}
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 shadow-lg text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-8">
                  Why Our AI Search Works Better:
                </h3>
                
                {/* Compact Feature Icons */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="group cursor-help" title="Search in Dutch, English, Arabic, German, or any of our 15+ supported languages">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">15+ Languages</div>
                  </div>

                  <div className="group cursor-help" title="Get results in under 200ms with our optimized AI models">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">Lightning Fast</div>
                  </div>

                  <div className="group cursor-help" title="Understands emotions, needs, and context beyond simple keywords">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">Smart Context</div>
                  </div>

                  <div className="group cursor-help" title="No API costs, no limits - powered by open-source AI models">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">Always Free</div>
                  </div>
                </div>

                <Button
                  onClick={() => navigate('/search')}
                  size="lg"
                  className="w-full"
                >
                  Start Searching Now
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISearchShowcase;