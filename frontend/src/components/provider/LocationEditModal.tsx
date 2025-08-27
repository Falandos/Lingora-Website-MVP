import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import CityAutocomplete from '../ui/CityAutocomplete';
import { useEditMode } from '../../contexts/EditModeContext';

interface LocationData {
  address: string;
  postal_code: string;
  city: string;
}

interface LocationEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  locationData: LocationData;
  onSave: (updatedData: LocationData) => Promise<boolean>;
  isLoading?: boolean;
}

const LocationEditModal: React.FC<LocationEditModalProps> = ({
  isOpen,
  onClose,
  locationData,
  onSave,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<LocationData>(locationData);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { autoSave } = useEditMode();
  
  // Track if there are any changes from original data
  const hasChanges = () => {
    return (
      formData.address !== locationData.address ||
      formData.postal_code !== locationData.postal_code ||
      formData.city !== locationData.city
    );
  };
  
  // Check if form is valid (all required fields filled) - only for actual saving
  const isFormValid = () => {
    return formData.address.trim() && formData.postal_code.trim() && formData.city.trim();
  };

  // Initialize form data ONLY when modal opens, not when locationData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...locationData });
    }
  }, [isOpen]);  // Remove locationData dependency to prevent resets during editing

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSaving(false);
      setValidationError(''); // Clear validation errors when closing
    }
  }, [isOpen]);

  const handleSave = async () => {
    // Clear any previous validation errors
    setValidationError('');
    
    // Validate required fields before saving
    if (!isFormValid()) {
      const missingFields = [];
      if (!formData.address.trim()) missingFields.push('Address');
      if (!formData.postal_code.trim()) missingFields.push('Postal Code');
      if (!formData.city.trim()) missingFields.push('City');
      
      setValidationError(`Please fill in the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save location:', error);
      setValidationError('Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof LocationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  // Smart defaults for Netherlands
  const applyDutchDefaults = () => {
    setFormData(prev => ({
      ...prev,
      postal_code: prev.postal_code || '1012 AB',
      city: prev.city || 'Amsterdam'  // Only default if truly empty
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Location Details</h2>
                <p className="text-sm text-gray-500">Update your business address information</p>
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
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Hoofdstraat 123"
                disabled={saving}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  type="text"
                  value={formData.postal_code}
                  onChange={(e) => updateField('postal_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1012 AB"
                  disabled={saving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <CityAutocomplete
                  value={formData.city}
                  onChange={(city, cityName) => updateField('city', cityName)}
                  placeholder="Type city name..."
                  showGeolocation={false}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={applyDutchDefaults}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                disabled={saving}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Use Dutch defaults
              </button>
            </div>
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

export default LocationEditModal;