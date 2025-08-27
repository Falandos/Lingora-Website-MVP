import { useTranslation } from 'react-i18next';

interface LegalPageProps {
  type: 'terms' | 'privacy' | 'cookies' | 'impressum';
}

const LegalPage = ({ type }: LegalPageProps) => {
  const { t } = useTranslation();

  const getTitle = () => {
    return t(`legal.${type}_title`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{getTitle()}</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-6">
            Legal content for {type} will be implemented here.
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-sm text-gray-500">
              This is a placeholder for the {type} page. The actual legal content will be provided 
              and implemented before launch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;