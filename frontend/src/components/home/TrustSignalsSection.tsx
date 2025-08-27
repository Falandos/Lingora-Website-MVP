import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';

interface TrustSignalsSectionProps {
  className?: string;
}

export const TrustSignalsSection = ({ className = '' }: TrustSignalsSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className={`py-20 bg-primary-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Trust Badges */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted by International Communities
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
              We're committed to connecting you with verified, qualified professionals 
              who understand your language and cultural needs.
            </p>

            {/* Trust Badges Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-gray-900">KVK Verified</div>
                <div className="text-xs text-gray-600">All businesses verified</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-gray-900">GDPR Compliant</div>
                <div className="text-xs text-gray-600">Privacy protected</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-gray-900">Lightning Fast</div>
                <div className="text-xs text-gray-600">AI-powered search</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-sm font-semibold text-gray-900">Always Free</div>
                <div className="text-xs text-gray-600">For residents</div>
              </div>
            </div>
          </div>

          {/* Why Choose Lingora */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-xl mb-16">
            <div className="text-center mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Why Choose Lingora?
              </h3>
              <p className="text-gray-600 max-w-2xl mx-auto">
                We're more than a directory - we're your bridge to professional services in your language.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Verified Professionals Only</h4>
                    <p className="text-gray-600 text-sm">Every provider is KVK and BTW verified with manual approval process</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">15+ Languages Supported</h4>
                    <p className="text-gray-600 text-sm">From Dutch and English to Arabic, Chinese, Ukrainian, and more</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI-Powered Understanding</h4>
                    <p className="text-gray-600 text-sm">Search naturally in your language - our AI gets it</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Complete Privacy Protection</h4>
                    <p className="text-gray-600 text-sm">GDPR compliant with secure communication channels</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Netherlands-Wide Coverage</h4>
                    <p className="text-gray-600 text-sm">From Amsterdam to Groningen, Maastricht to Leeuwarden</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Always Free for Residents</h4>
                    <p className="text-gray-600 text-sm">No hidden fees, no subscription - completely free to search and contact</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dual CTA Section */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Residents */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Looking for Professional Services?
              </h3>
              <p className="text-gray-600 mb-6">
                Find healthcare, legal, financial, and educational professionals who speak your language.
              </p>
              <Button
                onClick={() => navigate('/search')}
                size="lg"
                className="w-full mb-4"
              >
                Start Your Search
              </Button>
              <p className="text-sm text-gray-500">
                ✓ Free forever  ✓ 15+ languages  ✓ Verified providers
              </p>
            </div>

            {/* For Providers */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl border-2 border-primary-200">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Are You a Professional?
              </h3>
              <p className="text-gray-600 mb-6">
                Join our platform and connect with international clients who speak your languages.
              </p>
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                variant="outline"
                className="w-full mb-4 border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                List Your Business
              </Button>
              <p className="text-sm text-gray-500">
                ✓ 3-month free trial  ✓ Easy setup  ✓ Verified clients
              </p>
            </div>
          </div>

          {/* Statistics Footer */}
          <div className="text-center mt-16 pt-12 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-2xl font-bold text-primary-600">19</div>
                <div className="text-sm text-gray-600">Active Businesses</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">54</div>
                <div className="text-sm text-gray-600">Professional Staff</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">15+</div>
                <div className="text-sm text-gray-600">Languages</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">44</div>
                <div className="text-sm text-gray-600">Services Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;