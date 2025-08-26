import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DataTable, { type Column } from '../components/dashboard/DataTable';
import ProviderDetailModal from '../components/admin/ProviderDetailModal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';

interface Provider {
  id: number;
  business_name: string;
  city: string;
  status: 'pending' | 'approved' | 'rejected';
  subscription_status: 'trial' | 'active' | 'frozen';
  created_at: string;
  email: string;
  profile_completeness_score?: number;
  kvk_number?: string;
  btw_number?: string;
}

const ProvidersPage = () => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/providers', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const providersData = result.data?.providers || result.providers || result.data || result;
        setProviders(Array.isArray(providersData) ? providersData : []);
      } else {
        setError('Failed to load providers');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const openProviderDetail = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowDetailModal(true);
  };

  const openApproveConfirmation = (provider: Provider) => {
    setSelectedProvider(provider);
    setShowApproveConfirm(true);
  };

  const approveProvider = async (provider: Provider) => {
    if (!isAdmin) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/approve-provider/${provider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadProviders();
        setShowApproveConfirm(false);
        setSelectedProvider(null);
      } else {
        setError('Failed to approve provider');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const rejectProvider = async (provider: Provider, reason: string) => {
    if (!isAdmin) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/reject-provider/${provider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        await loadProviders();
      } else {
        setError('Failed to reject provider');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const columns: Column[] = [
    {
      key: 'business_name',
      label: 'Business Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
          {isAdmin && row.profile_completeness_score && (
            <div className="text-xs text-gray-400">
              Completeness: {row.profile_completeness_score}%
            </div>
          )}
        </div>
      )
    },
    {
      key: 'city',
      label: 'City',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const statusColors = {
          approved: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          rejected: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[value as keyof typeof statusColors]}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'subscription_status',
      label: 'Subscription',
      sortable: true,
      render: (value) => {
        const subColors = {
          trial: 'bg-blue-100 text-blue-800',
          active: 'bg-green-100 text-green-800',
          frozen: 'bg-gray-100 text-gray-800',
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${subColors[value as keyof typeof subColors]}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      }
    },
    ...(isAdmin ? [{
      key: 'kvk_number',
      label: 'KVK',
      sortable: false,
      render: (value: string) => value || 'N/A'
    }] : []),
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  const actions = [
    {
      label: 'View Details',
      onClick: openProviderDetail,
      variant: 'secondary' as const
    },
    ...(isAdmin ? [
      {
        label: 'Approve',
        onClick: openApproveConfirmation,
        variant: 'primary' as const,
        show: (row: Provider) => row.status === 'pending'
      },
      {
        label: 'Edit',
        onClick: (row: Provider) => window.open(`/dashboard/profile?provider_id=${row.id}`, '_blank'),
        variant: 'secondary' as const
      }
    ] : [
      {
        label: 'Edit',
        onClick: (row: Provider) => window.location.href = `/dashboard/profile`,
        variant: 'primary' as const
      }
    ])
  ];


  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Provider Management' : 'Providers'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isAdmin 
              ? `Manage all providers in the system. ${providers.filter(p => p.status === 'pending').length} pending approvals.`
              : 'Manage your provider profile and settings.'
            }
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button 
            onClick={loadProviders}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 mr-2"
          >
            Refresh
          </button>
          {isAdmin && (
            <button className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
              Export Data
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
              <option>All Statuses</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
              <option>All Cities</option>
              <option>Amsterdam</option>
              <option>Rotterdam</option>
              <option>Den Haag</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
            <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm">
              <option>All Subscriptions</option>
              <option>Trial</option>
              <option>Active</option>
              <option>Frozen</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <DataTable
            data={providers}
            columns={columns}
            actions={actions}
            searchable
            searchKeys={['business_name', 'email', 'city']}
            emptyMessage={loading ? "Loading providers..." : "No providers found."}
          />
        </div>
      </div>

      {/* Provider Detail Modal */}
      <ProviderDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProvider(null);
        }}
        onApprove={approveProvider}
        onReject={rejectProvider}
        provider={selectedProvider}
      />

      {/* Approve Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showApproveConfirm}
        onClose={() => {
          setShowApproveConfirm(false);
          setSelectedProvider(null);
        }}
        onConfirm={() => selectedProvider && approveProvider(selectedProvider)}
        title="Approve Provider"
        message={`Are you sure you want to approve ${selectedProvider?.business_name}? This will make their profile visible to users and allow them to receive contact messages.`}
        confirmText="Approve Provider"
        variant="primary"
        loading={actionLoading}
      />
    </div>
  );
};

export default ProvidersPage;