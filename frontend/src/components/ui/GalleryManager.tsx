import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface GalleryImage {
  id?: string;
  url: string;
  filename: string;
  alt?: string;
}

interface GalleryManagerProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

const GalleryManager = ({ 
  images, 
  onChange, 
  maxImages = 6, 
  disabled = false 
}: GalleryManagerProps) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files || disabled) return;

    const newImages: GalleryImage[] = [];
    const remainingSlots = maxImages - images.length;
    const filesToProcess = Math.min(files.length, remainingSlots);

    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      newImages.push({
        id: `temp_${Date.now()}_${i}`,
        url,
        filename: file.name,
        alt: `Business image ${images.length + newImages.length + 1}`
      });
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    if (disabled) return;
    
    const image = images[index];
    // Revoke object URL to prevent memory leaks
    if (image.url.startsWith('blob:')) {
      URL.revokeObjectURL(image.url);
    }
    
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (disabled || fromIndex === toIndex) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  const canAddMore = images.length < maxImages && !disabled;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Business Gallery</h3>
        <div className="text-sm text-gray-500">
          {images.length}/{maxImages} images
        </div>
      </div>

      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver 
              ? 'border-primary-400 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="space-y-2">
            <div className="text-gray-500">
              📸 Drop images here or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                browse files
              </button>
            </div>
            <div className="text-xs text-gray-400">
              Up to {maxImages - images.length} more images • JPG, PNG • Max 5MB each
            </div>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      )}

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id || index}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <img
                src={image.url}
                alt={image.alt || `Business image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay with controls */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                {/* Move left */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index - 1)}
                    disabled={disabled}
                    className="p-2 bg-white rounded-full text-gray-700 hover:text-gray-900 transition-colors"
                    title="Move left"
                  >
                    ←
                  </button>
                )}
                
                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  disabled={disabled}
                  className="p-2 bg-white rounded-full text-red-600 hover:text-red-700 transition-colors"
                  title="Remove image"
                >
                  ✕
                </button>
                
                {/* Move right */}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(index, index + 1)}
                    disabled={disabled}
                    className="p-2 bg-white rounded-full text-gray-700 hover:text-gray-900 transition-colors"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>
              
              {/* Image number */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <div>💡 First image will be used as your main business photo</div>
        </div>
        <div className="mt-1">
          Drag and drop to reorder images • Hover over images to see controls
        </div>
        {images.length === maxImages && (
          <div className="mt-1 text-amber-600">
            Maximum number of images reached. Remove an image to add new ones.
          </div>
        )}
      </div>

      {/* Upload Status */}
      {uploading && (
        <div className="text-sm text-primary-600 flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Uploading images...</span>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;