import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { useEditMode } from '../../contexts/EditModeContext';

interface SocialLinksData {
  website: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  google_business_url: string;
}

interface SocialLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  socialData: SocialLinksData;
  onSave: (updatedData: SocialLinksData) => Promise<boolean>;
}

const SocialLinksModal: React.FC<SocialLinksModalProps> = ({
  isOpen,
  onClose,
  socialData,
  onSave
}) => {
  const [formData, setFormData] = useState<SocialLinksData>(socialData);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const { autoSave } = useEditMode();
  
  // Track if there are any changes from original data
  const hasChanges = () => {
    return (
      formData.website !== socialData.website ||
      formData.linkedin !== socialData.linkedin ||
      formData.facebook !== socialData.facebook ||
      formData.instagram !== socialData.instagram ||
      formData.twitter !== socialData.twitter ||
      formData.youtube !== socialData.youtube ||
      formData.google_business_url !== socialData.google_business_url
    );
  };

  // Initialize form data ONLY when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({ ...socialData });
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSaving(false);
      setValidationError('');
    }
  }, [isOpen]);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URLs are allowed
    
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    setValidationError('');
    
    // Validate all URLs
    const invalidFields = [];
    if (!validateUrl(formData.website)) invalidFields.push('Website');
    if (!validateUrl(formData.linkedin)) invalidFields.push('LinkedIn');
    if (!validateUrl(formData.facebook)) invalidFields.push('Facebook');
    if (!validateUrl(formData.instagram)) invalidFields.push('Instagram');
    if (!validateUrl(formData.twitter)) invalidFields.push('Twitter/X');
    if (!validateUrl(formData.youtube)) invalidFields.push('YouTube');
    if (!validateUrl(formData.google_business_url)) invalidFields.push('Google Business');

    if (invalidFields.length > 0) {
      setValidationError(`Please enter valid URLs for: ${invalidFields.join(', ')}`);
      return;
    }
    
    setSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save social links:', error);
      setValidationError('Failed to save social links. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof SocialLinksData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  if (!isOpen) return null;

  const socialPlatforms = [
    {
      key: 'website' as keyof SocialLinksData,
      label: 'Website',
      placeholder: 'https://www.yourwebsite.com',
      icon: (
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
        </svg>
      )
    },
    {
      key: 'linkedin' as keyof SocialLinksData,
      label: 'LinkedIn',
      placeholder: 'https://linkedin.com/company/yourcompany',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    {
      key: 'facebook' as keyof SocialLinksData,
      label: 'Facebook',
      placeholder: 'https://facebook.com/yourpage',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      key: 'instagram' as keyof SocialLinksData,
      label: 'Instagram',
      placeholder: 'https://instagram.com/yourhandle',
      icon: (
        <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      key: 'twitter' as keyof SocialLinksData,
      label: 'X (Twitter)',
      placeholder: 'https://x.com/yourhandle',
      icon: (
        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      key: 'youtube' as keyof SocialLinksData,
      label: 'YouTube',
      placeholder: 'https://youtube.com/@yourchannel',
      icon: (
        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    {
      key: 'google_business_url' as keyof SocialLinksData,
      label: 'Google Business',
      placeholder: 'https://g.co/kgs/yourbusiness',
      icon: (
        <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Edit Social Links</h2>
                <p className="text-sm text-gray-500">Update your online presence and social media links</p>
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
            {socialPlatforms.map((platform) => (
              <div key={platform.key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center">
                    {platform.icon}
                    <span className="ml-2">{platform.label}</span>
                  </div>
                </label>
                <input
                  type="url"
                  value={formData[platform.key]}
                  onChange={(e) => updateField(platform.key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={platform.placeholder}
                  disabled={saving}
                />
              </div>
            ))}
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

export default SocialLinksModal;