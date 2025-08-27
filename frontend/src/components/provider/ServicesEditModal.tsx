import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useEditMode } from '../../contexts/EditModeContext';

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
  category_id?: number;
}

interface ServicesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  onSave: (updatedServices: Service[]) => Promise<boolean>;
  currentLang: 'nl' | 'en';
}

const ServicesEditModal: React.FC<ServicesEditModalProps> = ({
  isOpen,
  onClose,
  services,
  onSave,
  currentLang
}) => {
  const [formData, setFormData] = useState<Service[]>(services);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { autoSave } = useEditMode();
  
  // Track if there are any changes from original data
  const hasChanges = () => {
    if (formData.length !== services.length) return true;
    
    return formData.some((service, index) => {
      const original = services[index];
      if (!original) return true;
      
      return (
        service.title !== original.title ||
        service.description_i18n.nl !== original.description_i18n.nl ||
        service.description_i18n.en !== original.description_i18n.en
      );
    });
  };

  // Initialize form data ONLY when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData([...services]);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSaving(false);
      setValidationError('');
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const invalidServices = [];
    
    formData.forEach((service, index) => {
      if (!service.title.trim()) {
        invalidServices.push(`Service ${index + 1}: Title is required`);
      }
      if (!service.description_i18n[currentLang]?.trim()) {
        invalidServices.push(`Service ${index + 1}: Description is required`);
      }
    });

    if (invalidServices.length > 0) {
      setValidationError(invalidServices.join('; '));
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setValidationError('');
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save services:', error);
      setValidationError('Failed to save services. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addNewService = () => {
    const newService: Service = {
      id: Date.now(), // Temporary ID for new services
      title: '',
      description_i18n: {
        nl: '',
        en: ''
      },
      price_min: 0,
      price_max: 0,
      currency: 'EUR'
    };
    
    setFormData(prev => [...prev, newService]);
    
    // Clear validation error when user adds a service
    if (validationError) {
      setValidationError('');
    }
  };

  const removeService = (index: number) => {
    setFormData(prev => prev.filter((_, i) => i !== index));
    
    // Clear validation error when user removes a service
    if (validationError) {
      setValidationError('');
    }
  };

  const updateService = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const updated = [...prev];
      if (field.includes('description_')) {
        const lang = field.split('_')[1] as 'nl' | 'en';
        updated[index] = {
          ...updated[index],
          description_i18n: {
            ...updated[index].description_i18n,
            [lang]: value
          }
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value
        };
      }
      return updated;
    });
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2zM9 11h6" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Services</h2>
                <p className="text-sm text-gray-500">Manage your service offerings and descriptions</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              disabled={saving}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Validation Error Message */}
          {validationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm font-medium">{validationError}</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {formData.map((service, index) => (
              <div key={service.id || index} className="p-4 border border-gray-200 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Service {index + 1}
                  </h3>
                  {formData.length > 1 && (
                    <button
                      onClick={() => removeService(index)}
                      className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                      disabled={saving}
                      title="Remove service"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Service Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => updateService(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. General Medical Consultation"
                    disabled={saving}
                  />
                </div>

                {/* Service Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description ({currentLang.toUpperCase()}) *
                  </label>
                  <textarea
                    value={service.description_i18n[currentLang]}
                    onChange={(e) => updateService(index, `description_${currentLang}`, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`Describe this service in ${currentLang === 'nl' ? 'Dutch' : 'English'}...`}
                    rows={3}
                    disabled={saving}
                  />
                </div>
              </div>
            ))}

            {/* Add Service Button */}
            <button
              onClick={addNewService}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 flex items-center justify-center"
              disabled={saving}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Another Service
            </button>

            {/* Empty State */}
            {formData.length === 0 && (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2zM9 11h6" />
                </svg>
                <p className="text-gray-500 mb-4">No services added yet</p>
                <button
                  onClick={addNewService}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  disabled={saving}
                >
                  Add Your First Service
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
          <Button
            onClick={onClose}
            disabled={saving}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || !hasChanges()}
            className={`${hasChanges() ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            {saving ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </div>
            ) : (
              hasChanges() ? 'Save Changes' : 'No Changes'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServicesEditModal;