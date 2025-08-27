import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type Column } from '../../components/dashboard/DataTable';
import { Button } from '../../components/ui/Button';

interface Language {
  language_code: string;
  name_en: string;
  name_native: string;
}

interface Staff {
  id: number;
  provider_id: number;
  name: string;
  role: string;
  bio_nl?: string;
  bio_en?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  is_contact_person: boolean;
  is_active: boolean;
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  languages: Language[];
}

interface StaffFormData {
  name: string;
  role: string;
  bio_nl: string;
  bio_en: string;
  email: string;
  phone: string;
  is_contact_person: boolean;
  is_active: boolean;
  is_public: boolean;
  languages: Language[];
}

interface AvailableLanguage {
  code: string;
  name_en: string;
  name_native: string;
}

const StaffFormModal = ({ 
  isOpen, 
  onClose, 
  staff, 
  onSave 
}: {
  isOpen: boolean;
  onClose: () => void;
  staff?: Staff;
  onSave: (data: StaffFormData) => void;
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<AvailableLanguage[]>([]);
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    role: '',
    bio_nl: '',
    bio_en: '',
    email: '',
    phone: '',
    is_contact_person: false,
    is_active: true,
    is_public: true,
    languages: []
  });

  useEffect(() => {
    if (isOpen) {
      loadAvailableLanguages();
      
      if (staff) {
        // Edit mode - populate form
        setFormData({
          name: staff.name,
          role: staff.role,
          bio_nl: staff.bio_nl || '',
          bio_en: staff.bio_en || '',
          email: staff.email || '',
          phone: staff.phone || '',
          is_contact_person: staff.is_contact_person,
          is_active: staff.is_active,
          is_public: staff.is_public,
          languages: staff.languages || []
        });
      } else {
        // Add mode - reset form
        setFormData({
          name: '',
          role: '',
          bio_nl: '',
          bio_en: '',
          email: '',
          phone: '',
          is_contact_person: false,
          is_active: true,
          is_public: true,
          languages: []
        });
      }
    }
  }, [isOpen, staff]);

  const loadAvailableLanguages = async () => {
    try {
      const response = await fetch('/api/languages');
      if (response.ok) {
        const result = await response.json();
        const languages = result.data || result.languages || result || [];
        setAvailableLanguages(languages);
      }
    } catch (err) {
      console.error('Failed to load languages:', err);
      setAvailableLanguages([]); // Set empty array on error to prevent crashes
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Failed to save staff member:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const addLanguage = () => {
    // Ensure languages are loaded before adding
    if (availableLanguages.length === 0) {
      loadAvailableLanguages();
    }
    
    setFormData(prev => ({
      ...prev,
      languages: [
        ...prev.languages,
        { language_code: '', name_en: '', name_native: '' }
      ]
    }));
  };

  const updateLanguage = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const languages = [...prev.languages];
      languages[index] = { ...languages[index], [field]: value };
      
      // Update name fields when language_code changes
      if (field === 'language_code' && availableLanguages && availableLanguages.length > 0) {
        const lang = availableLanguages.find(l => l.code === value);
        if (lang) {
          languages[index].name_en = lang.name_en;
          languages[index].name_native = lang.name_native;
        }
      }
      
      return { ...prev, languages };
    });
  };

  const removeLanguage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {staff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="label">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label htmlFor="role" className="label">
                    Role/Position *
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g., General Practitioner, Nurse, Translator"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Contact Information</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="email" className="label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="label">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+31 20 123 4567"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Bio/Description */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Description</h4>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="bio_en" className="label">
                    Bio (English)
                  </label>
                  <textarea
                    id="bio_en"
                    name="bio_en"
                    rows={3}
                    value={formData.bio_en}
                    onChange={handleInputChange}
                    placeholder="Brief professional description..."
                    className="input-field resize-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="bio_nl" className="label">
                    Bio (Dutch)
                  </label>
                  <textarea
                    id="bio_nl"
                    name="bio_nl"
                    rows={3}
                    value={formData.bio_nl}
                    onChange={handleInputChange}
                    placeholder="Korte professionele beschrijving..."
                    className="input-field resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Languages */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-900">Languages</h4>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addLanguage}
                >
                  Add Language
                </Button>
              </div>
              
              {formData.languages.length === 0 ? (
                <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-300 rounded-md">
                  No languages added yet. Click "Add Language" to specify which languages this staff member speaks.
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.languages.map((lang, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                      <div className="flex-1">
                        <select
                          value={lang.language_code}
                          onChange={(e) => updateLanguage(index, 'language_code', e.target.value)}
                          className="input-field"
                          required
                        >
                          <option value="">Select Language</option>
                          {availableLanguages.map((availLang) => (
                            <option key={availLang.code} value={availLang.code}>
                              {availLang.name_en} ({availLang.name_native})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => removeLanguage(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Settings */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_contact_person"
                    checked={formData.is_contact_person}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Primary contact person</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_public"
                    checked={formData.is_public}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Show on public provider page</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active staff member</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 mt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (staff ? 'Update Staff Member' : 'Add Staff Member')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StaffPage = () => {
  const { t } = useTranslation();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | undefined>(undefined);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/staff/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const staffData = result.data?.staff || result.staff || result.data || result;
        setStaff(Array.isArray(staffData) ? staffData : []);
      } else {
        setError('Failed to load staff members');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = () => {
    setEditingStaff(undefined);
    setShowModal(true);
  };

  const handleEditStaff = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setShowModal(true);
  };

  const handleDeleteStaff = async (staffMember: Staff) => {
    if (!confirm(`Are you sure you want to remove ${staffMember.name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/staff/${staffMember.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadStaff(); // Reload the list
      } else {
        alert('Failed to delete staff member');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    }
  };

  const handleSaveStaff = async (formData: StaffFormData) => {
    try {
      const token = localStorage.getItem('token');
      const isEditing = !!editingStaff;
      
      const url = isEditing ? `/api/staff/${editingStaff.id}` : '/api/staff';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        loadStaff(); // Reload the list
        setShowModal(false);
        setEditingStaff(undefined);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save staff member');
      }
    } catch (err) {
      console.error('Failed to save staff member:', err);
      alert(err instanceof Error ? err.message : 'Failed to save staff member');
      throw err; // Re-throw to prevent modal from closing
    }
  };

  const columns: Column[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (value, row: Staff) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.role}</div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Contact',
      render: (value, row: Staff) => (
        <div>
          {row.email && <div className="text-sm text-gray-900">{row.email}</div>}
          {row.phone && <div className="text-sm text-gray-500">{row.phone}</div>}
          {!row.email && !row.phone && <span className="text-gray-400">No contact info</span>}
        </div>
      )
    },
    {
      key: 'languages',
      label: 'Languages',
      render: (value: Language[]) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.slice(0, 3).map((lang, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {lang.name_en}
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">No languages</span>
          )}
          {value && value.length > 3 && (
            <span className="text-xs text-gray-500">+{value.length - 3} more</span>
          )}
        </div>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value: boolean, row: Staff) => (
        <div className="space-y-1">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {value ? 'Active' : 'Inactive'}
          </span>
          {row.is_contact_person && (
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
              Contact Person
            </div>
          )}
          {!row.is_public && (
            <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
              Private
            </div>
          )}
        </div>
      )
    }
  ];

  const actions = [
    {
      label: 'Edit',
      onClick: handleEditStaff,
      variant: 'secondary' as const
    },
    {
      label: 'Delete',
      onClick: handleDeleteStaff,
      variant: 'secondary' as const,
      className: 'text-red-600 hover:text-red-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your team members, their roles, and language skills. Staff members can be displayed on your public provider page.
          </p>
        </div>
        <Button
          onClick={handleAddStaff}
          variant="primary"
        >
          Add Staff Member
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <DataTable
            data={staff}
            columns={columns}
            actions={actions}
            searchable
            searchKeys={['name', 'role', 'email']}
            emptyMessage={loading ? "Loading staff..." : "No staff members found. Click 'Add Staff Member' to get started."}
          />
        </div>
      </div>

      <StaffFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingStaff(undefined);
        }}
        staff={editingStaff}
        onSave={handleSaveStaff}
      />
    </div>
  );
};

export default StaffPage;