import { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { useEditMode } from '../../contexts/EditModeContext';
import BusinessIcon from '../ui/BusinessIcon';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogoUrl?: string;
  businessName: string;
  onSave: (logoUrl: string) => Promise<boolean>;
}

const LogoUploadModal: React.FC<LogoUploadModalProps> = ({
  isOpen,
  onClose,
  currentLogoUrl,
  businessName,
  onSave
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { autoSave } = useEditMode();

  const maxFileSize = 2 * 1024 * 1024; // 2MB limit
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!isOpen) return null;

  const validateFile = (file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Only JPG, PNG, and WebP images are allowed.`;
    }
    
    if (file.size > maxFileSize) {
      return `File too large. Maximum file size is 2MB.`;
    }

    return null;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationResult = validateFile(file);
    if (validationResult) {
      setValidationError(validationResult);
      return;
    }

    setValidationError('');
    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setValidationError('');

    try {
      if (selectedFile) {
        // Upload new logo
        setUploading(true);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('logo', selectedFile);
        
        // TODO: Replace with actual upload endpoint
        // For now, we'll simulate the upload and use autoSave
        const mockLogoUrl = `/uploads/logos/${Date.now()}_${selectedFile.name}`;
        
        // Save logo URL to backend
        const success = await autoSave('logo_url', mockLogoUrl);
        if (success && await onSave(mockLogoUrl)) {
          onClose();
        } else {
          setValidationError('Failed to save logo. Please try again.');
        }
      } else if (previewUrl === null && currentLogoUrl) {
        // Remove existing logo
        const success = await autoSave('logo_url', '');
        if (success && await onSave('')) {
          onClose();
        } else {
          setValidationError('Failed to remove logo. Please try again.');
        }
      } else {
        // No changes
        onClose();
      }
    } catch (error) {
      setValidationError('An error occurred while saving the logo.');
      console.error('Logo save error:', error);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const hasChanges = () => {
    if (selectedFile) return true;
    if (previewUrl !== currentLogoUrl) return true;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-90vh overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Business Logo</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Logo Preview */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Current Logo</label>
            <div className="flex items-center justify-center">
              {previewUrl ? (
                <div className="relative">
                  <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-gray-200 shadow-lg">
                    <img 
                      src={previewUrl}
                      alt={`${businessName} logo preview`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center"
                    title="Remove logo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <BusinessIcon size="lg" className="w-32 h-32" />
                  <p className="text-gray-500 text-sm mt-2">No logo uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Upload New Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
                id="logo-upload"
              />
              <label htmlFor="logo-upload" className="cursor-pointer">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-primary-600 hover:text-primary-500">
                    Click to upload
                  </span>
                  <span> or drag and drop</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WebP up to 2MB
                </p>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {validationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{validationError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving || uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || uploading || !hasChanges()}
              className="min-w-20"
            >
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </div>
              ) : saving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                'Save Logo'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoUploadModal;