import { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/Button';
import { useEditMode } from '../../contexts/EditModeContext';

interface MediaItem {
  url: string;
  alt: string;
  w: number;
  h: number;
  id?: string;
}

interface GalleryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  onSave: (updatedMedia: MediaItem[]) => Promise<boolean>;
}

const GalleryManagementModal: React.FC<GalleryManagementModalProps> = ({
  isOpen,
  onClose,
  media,
  onSave
}) => {
  const [formData, setFormData] = useState<MediaItem[]>(media);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { autoSave } = useEditMode();
  
  const maxImages = 6; // MVP limit as specified in handover
  const maxFileSize = 5 * 1024 * 1024; // 5MB limit
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  // Track if there are any changes from original data
  const hasChanges = () => {
    if (formData.length !== media.length) return true;
    
    return formData.some((item, index) => {
      const original = media[index];
      if (!original) return true;
      
      return (
        item.url !== original.url ||
        item.alt !== original.alt
      );
    });
  };

  // Initialize form data ONLY when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData([...media]);
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSaving(false);
      setUploading(false);
      setValidationError('');
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  }, [isOpen]);

  const validateFiles = (files: FileList): string | null => {
    if (formData.length + files.length > maxImages) {
      return `Maximum ${maxImages} images allowed. You can add ${maxImages - formData.length} more images.`;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!allowedTypes.includes(file.type)) {
        return `Invalid file type: ${file.name}. Only JPG, PNG, and WebP images are allowed.`;
      }
      
      if (file.size > maxFileSize) {
        return `File too large: ${file.name}. Maximum file size is 5MB.`;
      }
    }

    return null;
  };

  const handleFileUpload = async (files: FileList) => {
    const validationResult = validateFiles(files);
    if (validationResult) {
      setValidationError(validationResult);
      return;
    }

    setUploading(true);
    setValidationError('');

    try {
      const newImages: MediaItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Create a temporary URL for preview (in a real app, you'd upload to your server)
        const tempUrl = URL.createObjectURL(file);
        
        // Get image dimensions
        const { width, height } = await getImageDimensions(file);
        
        const newImage: MediaItem = {
          url: tempUrl,
          alt: `Gallery image ${formData.length + newImages.length + 1}`,
          w: width,
          h: height,
          id: `temp_${Date.now()}_${i}`
        };
        
        newImages.push(newImage);
      }

      setFormData(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Failed to process uploaded files:', error);
      setValidationError('Failed to process some files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const newFormData = [...formData];
      const draggedItem = newFormData[draggedIndex];
      
      // Remove dragged item
      newFormData.splice(draggedIndex, 1);
      
      // Insert at new position
      const insertIndex = draggedIndex < dragOverIndex ? dragOverIndex - 1 : dragOverIndex;
      newFormData.splice(insertIndex, 0, draggedItem);
      
      setFormData(newFormData);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Handle file drops
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
    
    // Handle image reordering
    handleDragEnd();
  };

  const removeImage = (index: number) => {
    const imageToRemove = formData[index];
    
    // Revoke object URL if it's a temporary URL
    if (imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    
    setFormData(prev => prev.filter((_, i) => i !== index));
  };

  const updateImageAlt = (index: number, alt: string) => {
    setFormData(prev => prev.map((item, i) => 
      i === index ? { ...item, alt } : item
    ));
  };

  const handleSave = async () => {
    setValidationError('');
    
    setSaving(true);
    try {
      const success = await onSave(formData);
      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save gallery:', error);
      setValidationError('Failed to save gallery. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Gallery Management</h2>
                <p className="text-sm text-gray-500">Upload, organize, and manage your business photos (max {maxImages} images)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              disabled={saving || uploading}
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

          {/* Upload Area */}
          <div 
            className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
            onClick={triggerFileInput}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={allowedTypes.join(',')}
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              disabled={uploading || formData.length >= maxImages}
            />
            
            {uploading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin w-8 h-8 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-blue-600 font-medium">Uploading images...</span>
              </div>
            ) : formData.length >= maxImages ? (
              <div className="text-gray-500">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>Maximum of {maxImages} images reached</p>
                <p className="text-sm">Remove an image to add more</p>
              </div>
            ) : (
              <div>
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-600 mb-2">
                  <strong>Click to upload</strong> or drag and drop images here
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, WebP up to 5MB • {formData.length}/{maxImages} images
                </p>
              </div>
            )}
          </div>

          {/* Image Gallery */}
          {formData.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.map((image, index) => (
                <div
                  key={image.id || index}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                    dragOverIndex === index ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-32 object-cover"
                  />
                  
                  {/* Image Controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all flex space-x-2">
                      <button
                        onClick={() => removeImage(index)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                        title="Remove image"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <div className="p-2 bg-gray-500 text-white rounded-full cursor-move" title="Drag to reorder">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Image Index */}
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>

                  {/* Alt Text Input */}
                  <div className="p-2 bg-white">
                    <input
                      type="text"
                      value={image.alt}
                      onChange={(e) => updateImageAlt(index, e.target.value)}
                      placeholder="Image description..."
                      className="w-full text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={saving}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {formData.length === 0 && (
            <div className="text-center py-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No images uploaded yet</h3>
              <p className="text-gray-500 mb-4">Upload images to showcase your business environment and facilities</p>
              <Button
                onClick={triggerFileInput}
                className="bg-blue-500 hover:bg-blue-600"
                disabled={uploading}
              >
                Upload Your First Images
              </Button>
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for great gallery images:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use high-quality, well-lit photos</li>
              <li>• Show your workspace, team, and facilities</li>
              <li>• Keep images professional and relevant to your services</li>
              <li>• Drag images to reorder them (first image appears as main photo)</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {formData.length} of {maxImages} images
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              disabled={saving || uploading}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || uploading || !hasChanges()}
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
    </div>
  );
};

export default GalleryManagementModal;