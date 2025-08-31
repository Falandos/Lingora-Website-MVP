import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface TrustSignalsSectionProps {
  className?: string;
}

export const TrustSignalsSection = ({ className = '' }: TrustSignalsSectionProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          
          {/* Compact Trust Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t('cta.ready_title')}
            </h2>
            
            {/* Inline Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" />
                  </svg>
                </div>
                <span className="font-medium">{t('cta.kvk_verified')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span className="font-medium">{t('cta.gdpr_compliant')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-medium">{t('cta.ai_powered')}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                  </svg>
                </div>
                <span className="font-medium">{t('cta.always_free')}</span>
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
                {t('cta.looking_for_services')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('cta.find_professionals')}
              </p>
              <Button
                onClick={() => navigate('/search')}
                size="lg"
                className="w-full mb-4"
              >
                {t('cta.start_search')}
              </Button>
              <p className="text-sm text-gray-500">
                {t('cta.free_features')}
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
                {t('cta.are_you_professional')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('cta.join_platform')}
              </p>
              <Button
                onClick={() => navigate('/register')}
                size="lg"
                variant="outline"
                className="w-full mb-4 border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                {t('cta.list_business')}
              </Button>
              <p className="text-sm text-gray-500">
                {t('cta.trial_features')}
              </p>
            </div>
          </div>

          {/* Compact Statistics Footer */}
          <div className="text-center mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary-600">19</span>
                <span>{t('stats.active_businesses')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-blue-600">54</span>
                <span>{t('stats.professional_staff')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">15+</span>
                <span>{t('stats.languages')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-purple-600">44</span>
                <span>{t('stats.services')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;