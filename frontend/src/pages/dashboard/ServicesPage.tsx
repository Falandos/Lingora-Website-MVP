import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DataTable, { type Column } from '../../components/dashboard/DataTable';
import ServiceFormModal from '../../components/ui/ServiceFormModal';
import { Button } from '../../components/ui/Button';

interface Service {
  id: number;
  title: string;
  description_nl?: string;
  description_en?: string;
  category_id: number;
  category_name: string;
  price_min?: number;
  price_max?: number;
  price_description?: string;
  service_mode: 'in_person' | 'online' | 'both';
  duration_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name_en: string;
  name_nl: string;
}

const ServicesPage = () => {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [provider, setProvider] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    loadServices();
    loadCategories();
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/providers/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProvider(data.data || data);
      }
    } catch (error) {
      console.error('Failed to fetch provider data:', error);
    }
  };

  const loadServices = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setServices(result.data || result);
      } else {
        setError('Failed to load services');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || result);
      }
    } catch (err) {
      // Categories not loading shouldn't block the page
      console.error('Failed to load categories:', err);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setModalOpen(true);
  };

  const handleDeleteService = async (service: Service) => {
    if (!confirm(`Are you sure you want to delete "${service.title}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        loadServices(); // Reload the list
      } else {
        setError('Failed to delete service');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const toggleServiceStatus = async (service: Service) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/services/${service.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_active: !service.is_active
        }),
      });

      if (response.ok) {
        loadServices(); // Reload the list
      } else {
        setError('Failed to update service status');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  const handleSaveService = async (serviceData: any) => {
    const token = localStorage.getItem('token');
    const url = serviceData.id 
      ? `/api/services/${serviceData.id}`
      : '/api/services';
    
    const method = serviceData.id ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serviceData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save service');
    }

    loadServices(); // Reload the list
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingService(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const columns: Column[] = [
    {
      key: 'title',
      label: 'Service',
      sortable: true,
      render: (value: string, row: Service) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {row.description_en && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {row.description_en.length > 60 
                ? `${row.description_en.substring(0, 60)}...` 
                : row.description_en}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'category_name',
      label: 'Category',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {value}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-500">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (value: boolean, row: Service) => (
        <button
          onClick={() => toggleServiceStatus(row)}
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full transition-colors ${
            value 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={`Click to ${value ? 'deactivate' : 'activate'} this service`}
        >
          <div className={`w-2 h-2 rounded-full mr-1 ${
            value ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          {value ? 'Active' : 'Inactive'}
        </button>
      ),
    },
  ];


  const handleEditInLiveMode = (service: Service) => {
    if (provider?.slug) {
      window.open(`/provider/${provider.slug}?edit=true#services`, '_blank');
    }
  };

  const actions = [
    {
      label: 'Edit Details',
      onClick: handleEditInLiveMode,
      variant: 'primary' as const,
      title: 'Edit service details in live mode'
    },
    {
      label: 'Quick Edit',
      onClick: handleEditService,
      variant: 'secondary' as const,
      title: 'Edit basic service info'
    },
    {
      label: 'Delete',
      onClick: handleDeleteService,
      variant: 'secondary' as const,
      className: 'text-red-600 hover:text-red-700',
      title: 'Delete this service'
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your services and offerings.</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your services and offerings.</p>
        </div>
        <Button
          onClick={handleAddService}
          variant="primary"
        >
          Add Service
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        {services.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500 mb-4">
              <div className="text-4xl mb-2">🛍️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Start by adding your first service to showcase what you offer.
              </p>
              <Button
                onClick={handleAddService}
                variant="primary"
              >
                Add Your First Service
              </Button>
            </div>
          </div>
        ) : (
          <DataTable
            data={services}
            columns={columns}
            actions={actions}
            searchable
            searchKeys={['title', 'category_name']}
            emptyMessage="No services found matching your search."
          />
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 text-blue-400">💡</div>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Service Management Tips</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div>• <strong>Edit Details</strong>: Use live-edit mode for prices, descriptions, and detailed service information</div>
              <div>• <strong>Quick Edit</strong>: Update basic info like title and category quickly</div>
              <div>• <strong>Status Toggle</strong>: Click Active/Inactive badges to control service visibility</div>
              <div>• <strong>Organization</strong>: Services are sorted by creation date - newest first</div>
            </div>
          </div>
        </div>
      </div>

      <ServiceFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveService}
        service={editingService}
        categories={categories}
      />
    </div>
  );
};

export default ServicesPage;