import { useState } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';
import ServicesEditModal from './ServicesEditModal';

interface Service {
  id: number;
  title: string;
  description_i18n: {
    nl: string;
    en: string;
  };
  price_min: number;
  price_max: number;
  currency: string;
  mode: string;
}

interface EditableServiceSectionProps {
  services: Service[];
  currentLang: 'nl' | 'en';
}

const EditableServiceSection: React.FC<EditableServiceSectionProps> = ({
  services,
  currentLang
}) => {
  const { isEditMode, canEdit, autoSave } = useEditMode();
  const [localServices, setLocalServices] = useState(services);
  const [servicesModalOpen, setServicesModalOpen] = useState(false);


  const handleServicesSave = async (updatedServices: Service[]): Promise<boolean> => {
    try {
      console.log('Saving services data:', updatedServices);
      
      // Update local state immediately for instant feedback
      setLocalServices(updatedServices);
      
      // Save each service to the backend using autoSave functionality
      // This is a simplified approach - in a real app, you'd likely have a bulk update endpoint
      const savePromises = updatedServices.map((service, index) => {
        return Promise.all([
          autoSave(`service_${service.id}_title`, service.title),
          autoSave(`service_${service.id}_description_${currentLang}`, service.description_i18n[currentLang])
        ]);
      });
      
      const results = await Promise.all(savePromises);
      console.log('Backend services save results:', results);
      
      return true;
    } catch (error) {
      console.error('Failed to save services data:', error);
      return false;
    }
  };

  return (
    <>
      <div className="edit-section">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Services</h2>
          {canEdit && isEditMode && (
            <button
              onClick={() => setServicesModalOpen(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Services
            </button>
          )}
        </div>

        <div className="space-y-4">
          {localServices.map((service, index) => (
            <div 
              key={service.id} 
              className="pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
            >
              {/* Service Title */}
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {service.title}
              </h3>

              {/* Service Description */}
              <p className="text-gray-600 leading-relaxed">
                {service.description_i18n[currentLang] || service.description_i18n.en}
              </p>
            </div>
          ))}

          {/* Empty State */}
          {localServices.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2zM9 11h6" />
              </svg>
              <p className="text-gray-500 mb-4">
                {canEdit && isEditMode 
                  ? 'No services added yet. Click "Edit Services" to add your first service.'
                  : 'No services listed'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Services Edit Modal */}
      <ServicesEditModal
        isOpen={servicesModalOpen}
        onClose={() => setServicesModalOpen(false)}
        services={localServices}
        onSave={handleServicesSave}
        currentLang={currentLang}
      />
    </>
  );
};

export default EditableServiceSection;