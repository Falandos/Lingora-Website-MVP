import { useState, useRef } from 'react';
import { useEditMode } from '../../contexts/EditModeContext';

interface EditableImageProps {
  src?: string;
  alt: string;
  field: string;
  className?: string;
  placeholder?: string;
  maxSizeKB?: number;
  allowedTypes?: string[];
  children?: React.ReactNode;
}

const EditableImage: React.FC<EditableImageProps> = ({
  src,
  alt,
  field,
  className = '',
  placeholder = 'Click to upload image...',
  maxSizeKB = 2048, // 2MB default
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  children
}) => {
  const { isEditMode, canEdit, autoSave } = useEditMode();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [previewSrc, setPreviewSrc] = useState<string>(src || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (canEdit && isEditMode && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Please upload: ${allowedTypes.join(', ')}`;
    }

    // Check file size
    if (file.size > maxSizeKB * 1024) {
      return `File too large. Maximum size: ${maxSizeKB}KB`;
    }

    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (validation) {
      setUploadError(validation);
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreviewSrc(result);
      };
      reader.readAsDataURL(file);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('field', field);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/providers/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const imageUrl = result.url || result.data?.url;
        
        if (imageUrl) {
          setPreviewSrc(imageUrl);
          await autoSave(field, imageUrl);
        } else {
          setUploadError('Upload failed: No URL returned');
        }
      } else {
        const error = await response.text();
        setUploadError(`Upload failed: ${error}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Upload failed: Network error');
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getEditableStyles = () => {
    if (!canEdit || !isEditMode) return '';
    
    return `
      editable-field
      transition-all duration-200 cursor-pointer
      hover:ring-2 hover:ring-blue-200 hover:ring-opacity-50
      border-2 border-dashed border-transparent hover:border-blue-200
    `;
  };

  const renderPlaceholder = () => (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors">
      <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-gray-500 text-sm">{placeholder}</p>
      {canEdit && isEditMode && (
        <p className="text-gray-400 text-xs mt-2">
          Max size: {maxSizeKB}KB • {allowedTypes.join(', ').replace(/image\//g, '')}
        </p>
      )}
    </div>
  );

  const renderImage = () => (
    <div className="relative group">
      <img 
        src={previewSrc} 
        alt={alt}
        className={`w-full h-auto object-cover rounded-lg ${className}`}
      />
      {/* Upload overlay */}
      {canEdit && isEditMode && (
        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-white text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-sm">Upload new image</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`relative ${getEditableStyles()}`}>
      <div onClick={handleClick}>
        {previewSrc ? renderImage() : renderPlaceholder()}
        {children}
      </div>

      {/* File input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload status */}
      {isUploading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
          </div>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="absolute -bottom-8 left-0 right-0 bg-red-100 border border-red-300 rounded-lg p-2">
          <p className="text-red-700 text-xs">{uploadError}</p>
        </div>
      )}

      {/* Edit indicator */}
      {canEdit && isEditMode && previewSrc && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default EditableImage;