import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { XMarkIcon, PaperClipIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name_en: string;
  name_nl: string;
  color: string;
}

interface Priority {
  id: string;
  name_en: string;
  name_nl: string;
  color: string;
  sla_hours: number;
}

interface SchemaFeatures {
  attachments_supported: boolean;
  enhanced_features: boolean;
  notifications_supported: boolean;
}

interface CreateTicketModalProps {
  onClose: () => void;
  onTicketCreated: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ onClose, onTicketCreated }) => {
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    category: 'general_inquiry',
    priority: 'medium'
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [schemaFeatures, setSchemaFeatures] = useState<SchemaFeatures | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategoriesAndPriorities();
  }, []);

  const fetchCategoriesAndPriorities = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/support/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.data?.categories || []);
        setPriorities(data.data?.priorities || []);
        setSchemaFeatures(data.data?.schema_features || { 
          attachments_supported: false, 
          enhanced_features: false, 
          notifications_supported: false 
        });
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('priority', formData.priority);

      // Add files if any and if supported
      if (files && schemaFeatures?.attachments_supported) {
        for (let i = 0; i < files.length; i++) {
          formDataToSend.append(`file_${i}`, files[i]);
        }
      }

      const response = await fetch('http://localhost:8000/api/support/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onTicketCreated();
      } else {
        setError(result.error || 'Failed to create ticket');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6b7280';
  };

  const getPriorityColor = (priorityId: string) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority?.color || '#6b7280';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Support Ticket</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of your issue"
            />
          </div>

          {/* Category and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name_en}
                  </option>
                ))}
              </select>
              {formData.category && (
                <div className="mt-2">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getCategoryColor(formData.category) }}
                  >
                    {categories.find(c => c.id === formData.category)?.name_en}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {priorities.map((priority) => (
                  <option key={priority.id} value={priority.id}>
                    {priority.name_en} ({priority.sla_hours}h SLA)
                  </option>
                ))}
              </select>
              {formData.priority && (
                <div className="mt-2">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: getPriorityColor(formData.priority) }}
                  >
                    {priorities.find(p => p.id === formData.priority)?.name_en}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Please describe your issue in detail..."
            />
          </div>

          {/* File Upload - Only show if supported */}
          {schemaFeatures?.attachments_supported && (
            <div>
              <label htmlFor="files" className="block text-sm font-medium text-gray-700 mb-2">
                Attachments
              </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <PaperClipIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="files"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload files</span>
                    <input
                      id="files"
                      name="files"
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="sr-only"
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF, DOC up to 10MB each
                </p>
              </div>
            </div>
            {files && files.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-700">Selected files:</p>
                <ul className="mt-1 text-sm text-gray-600">
                  {Array.from(files).map((file, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <PaperClipIcon className="w-4 h-4" />
                      <span>{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.subject.trim() || !formData.message.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicketModal;