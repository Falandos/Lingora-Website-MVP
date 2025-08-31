import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface YourPathForwardSectionProps {
  className?: string;
}

export const YourPathForwardSection = ({ className = '' }: YourPathForwardSectionProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className={`py-20 bg-green-50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {t('path_forward.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('path_forward.subtitle')}
            </p>
          </div>

          {/* Dual Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Left Card - For Users */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="text-center">
                {/* Icon */}
                <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('path_forward.find_professional.title')}
                </h3>

                {/* Steps */}
                <div className="space-y-4 mb-8 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">1</span>
                    </div>
                    <span className="text-gray-700"><strong>{t('path_forward.find_professional.step_1').split(' ')[0]}</strong> {t('path_forward.find_professional.step_1').split(' ').slice(1).join(' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">2</span>
                    </div>
                    <span className="text-gray-700"><strong>{t('path_forward.find_professional.step_2').split(' ')[0]}</strong> {t('path_forward.find_professional.step_2').split(' ').slice(1).join(' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">3</span>
                    </div>
                    <span className="text-gray-700"><strong>{t('path_forward.find_professional.step_3').split(' ')[0]}</strong> {t('path_forward.find_professional.step_3').split(' ').slice(1).join(' ')}</span>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => navigate('/search')}
                  size="lg"
                  className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4"
                >
                  {t('path_forward.find_professional.cta')}
                </Button>
                
                <p className="text-sm text-gray-500 font-medium">
                  {t('path_forward.find_professional.free_note')}
                </p>
              </div>
            </div>

            {/* Right Card - For Providers */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-primary-200 hover:shadow-2xl transition-shadow duration-300 relative overflow-hidden">
              {/* Popular Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-6 py-2 rounded-bl-2xl text-sm font-bold">
                {t('path_forward.grow_business.popular')}
              </div>
              
              <div className="text-center pt-4">
                {/* Icon */}
                <div className="w-20 h-20 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m8 6V8a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2z" />
                  </svg>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {t('path_forward.grow_business.title')}
                </h3>

                {/* Benefits */}
                <div className="space-y-4 mb-8 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700"><strong>{t('path_forward.grow_business.benefit_1').split(' ')[0]}</strong> {t('path_forward.grow_business.benefit_1').split(' ').slice(1).join(' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700"><strong>{t('path_forward.grow_business.benefit_2').split(' ').slice(0,2).join(' ')}</strong> {t('path_forward.grow_business.benefit_2').split(' ').slice(2).join(' ')}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <span className="text-gray-700"><strong>{t('path_forward.grow_business.benefit_3').split(' ').slice(0,2).join(' ')}</strong> {t('path_forward.grow_business.benefit_3').split(' ').slice(2).join(' ')}</span>
                  </div>
                </div>

                {/* Pricing highlight */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-1">{t('path_forward.grow_business.trial_offer')}</div>
                  <div className="text-sm text-gray-600">{t('path_forward.grow_business.trial_subtitle')}</div>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => navigate('/provider/register')}
                  size="lg"
                  className="w-full mb-4 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold py-4 transform hover:scale-105 transition-all duration-200"
                >
                  {t('path_forward.grow_business.cta')}
                </Button>
                
                <p className="text-sm text-gray-500">
                  {t('path_forward.grow_business.pricing')}
                </p>
              </div>
            </div>
          </div>

          {/* Trust Indicators - Compact Row */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-green-200">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <span className="text-sm font-medium">{t('path_forward.trust.kvk_verified')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{t('path_forward.trust.gdpr_compliant')}</span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{t('path_forward.trust.ai_powered')}</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default YourPathForwardSection;