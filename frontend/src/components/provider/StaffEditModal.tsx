import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface Staff {
  id: number;
  name: string;
  role_title?: string;
  role?: string;
  languages: Array<{
    language_code: string;
    cefr_level?: string;
    name_en?: string;
    name_native?: string;
  }> | string[];
  email_public?: string;
  phone_public?: string;
  email?: string;
  phone?: string;
}

interface StaffEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
  onSave: (updatedStaff: Staff) => Promise<boolean>;
  onDelete?: (staffId: number) => Promise<boolean>;
  isLoading?: boolean;
}

const StaffEditModal: React.FC<StaffEditModalProps> = ({
  isOpen,
  onClose,
  staff,
  onSave,
  onDelete,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Staff | null>(null);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Language options with flags
  const languageOptions = [
    { value: 'nl', label: 'Dutch', icon: '🇳🇱' },
    { value: 'en', label: 'English', icon: '🇬🇧' },
    { value: 'de', label: 'German', icon: '🇩🇪' },
    { value: 'ar', label: 'Arabic', icon: '🇸🇦' },
    { value: 'fr', label: 'French', icon: '🇫🇷' },
    { value: 'es', label: 'Spanish', icon: '🇪🇸' },
    { value: 'zh', label: 'Chinese', icon: '🇨🇳' },
    { value: 'hi', label: 'Hindi', icon: '🇮🇳' },
    { value: 'tr', label: 'Turkish', icon: '🇹🇷' },
    { value: 'pl', label: 'Polish', icon: '🇵🇱' },
    { value: 'uk', label: 'Ukrainian', icon: '🇺🇦' },
    { value: 'ru', label: 'Russian', icon: '🇷🇺' },
    { value: 'so', label: 'Somali', icon: '🇸🇴' },
    { value: 'ti', label: 'Tigrinya', icon: '🇪🇷' },
  ];

  // Initialize form data when staff changes
  useEffect(() => {
    if (staff) {
      setFormData({ ...staff });
    }
  }, [staff]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      setSaving(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    if (!formData) return;
    
    setSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save staff:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!staff || !onDelete) return;
    
    setSaving(true);
    try {
      const success = await onDelete(staff.id);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete staff:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    if (!formData) return;
    
    setFormData(prev => prev ? {
      ...prev,
      [field]: value
    } : null);
  };

  const toggleLanguage = (languageCode: string) => {
    if (!formData) return;
    
    const currentLanguages = getLanguageCodes(formData.languages);
    const newLanguages = currentLanguages.includes(languageCode)
      ? currentLanguages.filter(code => code !== languageCode)
      : [...currentLanguages, languageCode];
    
    updateField('languages', newLanguages.map(code => ({ language_code: code, cefr_level: 'B2' })));
  };

  const getLanguageCodes = (languages: Staff['languages']): string[] => {
    if (Array.isArray(languages)) {
      if (languages.length > 0 && typeof languages[0] === 'string') {
        return languages as string[];
      }
      return languages.map((lang: any) => lang.language_code);
    }
    return [];
  };

  const getRoleTitle = (staff: Staff): string => {
    return staff.role_title || staff.role || '';
  };

  const getEmail = (staff: Staff): string => {
    return staff.email_public || staff.email || '';
  };

  const getPhone = (staff: Staff): string => {
    return staff.phone_public || staff.phone || '';
  };

  if (!isOpen || !staff || !formData) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {formData.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Team Member</h2>
                <p className="text-sm text-gray-500">Update information for {formData.name}</p>
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
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name..."
                  disabled={saving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role/Position
                </label>
                <input
                  type="text"
                  value={getRoleTitle(formData)}
                  onChange={(e) => updateField('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Senior Consultant, Doctor, Lawyer..."
                  disabled={saving}
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={getEmail(formData)}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                  disabled={saving}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={getPhone(formData)}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+31 6 12345678"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Languages Spoken
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {languageOptions.map((option) => {
                  const isSelected = getLanguageCodes(formData.languages).includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleLanguage(option.value)}
                      disabled={saving}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      } ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-sm font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Select all languages this team member can speak with clients
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          {/* Delete Button */}
          <div>
            {onDelete && (
              showDeleteConfirm ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-red-600">Delete permanently?</span>
                  <Button
                    onClick={handleDelete}
                    disabled={saving}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 text-xs px-2 py-1"
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={saving}
                    variant="outline"
                    className="text-xs px-2 py-1"
                  >
                    No
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={saving}
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Delete Member
                </Button>
              )
            )}
          </div>

          {/* Save/Cancel Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              onClick={onClose}
              disabled={saving}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !formData.name.trim()}
              className="bg-blue-500 hover:bg-blue-600"
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
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffEditModal;