import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Category {
  id: number;
  name_en: string;
  name_nl: string;
}

interface Service {
  id?: number;
  title: string;
  category_id: number;
  description_nl?: string;
  description_en?: string;
  is_active: boolean;
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (service: Service) => Promise<void>;
  service?: Service | null;
  categories: Category[];
}

const ServiceFormModal = ({
  isOpen,
  onClose,
  onSave,
  service,
  categories
}: ServiceFormModalProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Service>({
    title: '',
    category_id: categories[0]?.id || 1,
    description_nl: '',
    description_en: '',
    is_active: true,
  });

  useEffect(() => {
    if (isOpen) {
      if (service) {
        // Edit mode
        setFormData({
          id: service.id,
          title: service.title,
          category_id: service.category_id,
          description_nl: service.description_nl || '',
          description_en: service.description_en || '',
          is_active: service.is_active,
        });
      } else {
        // Add mode
        setFormData({
          title: '',
          category_id: categories[0]?.id || 1,
          description_nl: '',
          description_en: '',
          is_active: true,
        });
      }
      setError('');
    }
  }, [isOpen, service, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Service title is required');
      }

      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number' 
          ? (value === '' ? undefined : parseFloat(value))
          : value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {service ? 'Edit Service' : 'Add New Service'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-semibold"
            >
              ×
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="label">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="e.g., General Consultation"
                  />
                </div>

                <div>
                  <label htmlFor="category_id" className="label">
                    Category *
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    required
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Service is active</span>
                </label>
              </div>
            </div>


            {/* Descriptions */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Service Description</h4>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="description_en" className="label">
                    Description (English)
                  </label>
                  <textarea
                    id="description_en"
                    name="description_en"
                    rows={3}
                    value={formData.description_en}
                    onChange={handleInputChange}
                    className="input-field resize-none"
                    placeholder="Describe your service in English..."
                  />
                </div>

                <div>
                  <label htmlFor="description_nl" className="label">
                    Description (Dutch)
                  </label>
                  <textarea
                    id="description_nl"
                    name="description_nl"
                    rows={3}
                    value={formData.description_nl}
                    onChange={handleInputChange}
                    className="input-field resize-none"
                    placeholder="Beschrijf uw dienst in het Nederlands..."
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormModal;