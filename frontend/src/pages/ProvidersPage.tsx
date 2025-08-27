import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../components/ui/DataTable';
import ProviderDetailModal from '../components/admin/ProviderDetailModal';
import ConfirmationDialog from '../components/ui/ConfirmationDialog';

interface Provider {
  id: number;
  business_name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
  city: string;
  postal_code?: string;
  kvk_number?: string;
  btw_number?: string;
  bio_nl?: string;
  bio_en?: string;
  status: 'pending' | 'approved' | 'rejected';
  subscription_status: 'trial' | 'active' | 'frozen';
  profile_completeness_score?: number;
  created_at: string;
  services?: any[];
  staff?: any[];
  trial_expired?: boolean;
  trial_expires_at?: string;
  trial_days_remaining?: number;
}

const ProvidersPage = () => {
  const { user } = useAuth();
  
  // Utility function to calculate trial days remaining
  const getTrialDaysRemaining = (provider: Provider) => {
    if (provider.subscription_status !== 'trial' || !provider.trial_expires_at) return null;
    
    const now = new Date();
    const expiryDate = new Date(provider.trial_expires_at);
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysRemaining;
  };
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Filter states with smart defaults
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  
  // Bulk actions state
  const [selectedProviders, setSelectedProviders] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const isAdmin = user?.role === 'admin';

  // Get unique cities for filter dropdown
  const uniqueCities = [...new Set(providers.map(p => p.city))].sort();

  // Filter providers based on current filters
  const filteredProviders = providers.filter(provider => {
    if (statusFilter !== 'all' && provider.status !== statusFilter) return false;
    if (cityFilter !== 'all' && provider.city !== cityFilter) return false;
    if (subscriptionFilter !== 'all' && provider.subscription_status !== subscriptionFilter) return false;
    return true;
  });

  useEffect(() => {
    loadProviders();
    // Temporarily disabled: checkAndFreezeExpiredTrials();
  }, []);

  const checkAndFreezeExpiredTrials = async () => {
    // Temporarily disabled due to API endpoint issues
    // Will be re-enabled once backend endpoint is properly configured
    return;
  };

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
        const errorData = await response.json().catch(() => ({}));
        setError(`Failed to approve provider: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      console.error('Network error:', err);
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

  const freezeProvider = async (provider: Provider) => {
    if (!isAdmin) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/freeze-provider/${provider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadProviders();
        setShowDetailModal(false);
      } else {
        setError('Failed to freeze provider');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const unfreezeProvider = async (provider: Provider) => {
    if (!isAdmin) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/unfreeze-provider/${provider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadProviders();
        setShowDetailModal(false);
      } else {
        setError('Failed to unfreeze provider');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const unapproveProvider = async (provider: Provider) => {
    if (!isAdmin) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/unapprove-provider/${provider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await loadProviders();
        setShowDetailModal(false);
        setSelectedProvider(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Failed to unapprove provider: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const updateSubscriptionStatus = async (provider: Provider, subscriptionStatus: string) => {
    if (!isAdmin) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/update-subscription/${provider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription_status: subscriptionStatus }),
      });

      if (response.ok) {
        await loadProviders();
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(`Failed to update subscription status: ${errorData.message || response.statusText}`);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk action functions
  const handleSelectProvider = (providerId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedProviders(prev => [...prev, providerId]);
    } else {
      setSelectedProviders(prev => prev.filter(id => id !== providerId));
    }
  };

  const handleSelectAll = () => {
    if (selectedProviders.length === filteredProviders.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders(filteredProviders.map(p => p.id));
    }
  };

  const bulkApprove = async () => {
    if (!isAdmin || selectedProviders.length === 0) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      for (const providerId of selectedProviders) {
        await fetch(`/api/admin/approve-provider/${providerId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      await loadProviders();
      setSelectedProviders([]);
      setShowBulkActions(false);
    } catch (err) {
      setError('Failed to approve providers');
    } finally {
      setActionLoading(false);
    }
  };

  const bulkFreeze = async () => {
    if (!isAdmin || selectedProviders.length === 0) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      for (const providerId of selectedProviders) {
        await fetch(`/api/admin/freeze-provider/${providerId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
      
      await loadProviders();
      setSelectedProviders([]);
      setShowBulkActions(false);
    } catch (err) {
      setError('Failed to freeze providers');
    } finally {
      setActionLoading(false);
    }
  };

  // Update bulk actions visibility when selections change
  React.useEffect(() => {
    setShowBulkActions(selectedProviders.length > 0);
  }, [selectedProviders]);

  const columns: Column[] = [
    // Checkbox column for bulk selection (admin only)
    ...(isAdmin ? [{
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={selectedProviders.length === filteredProviders.length && filteredProviders.length > 0}
          onChange={handleSelectAll}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      ),
      sortable: false,
      render: (item: any) => (
        <input
          type="checkbox"
          checked={selectedProviders.includes(item?.id)}
          onChange={(e) => handleSelectProvider(item?.id, e.target.checked)}
          className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
        />
      )
    }] : []),
    {
      key: 'business_name',
      label: 'Business Name',
      sortable: true,
      render: (item: any) => (
        <div className="min-w-0">
          <div className="font-medium text-gray-900 truncate">{item?.business_name || '-'}</div>
          {isAdmin && item?.profile_completeness_score && (
            <div className="text-xs text-gray-400">
              {item.profile_completeness_score}% complete
            </div>
          )}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item: any) => {
        if (!item?.status) return <span className="text-gray-400">-</span>;
        
        const statusColors = {
          approved: 'bg-green-100 text-green-800',
          pending: 'bg-yellow-100 text-yellow-800',
          rejected: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[item.status as keyof typeof statusColors]}`}>
            {item.status?.charAt(0).toUpperCase() + item.status?.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'subscription_status',
      label: 'Subscription',
      sortable: true,
      render: (item: any) => {
        const daysRemaining = getTrialDaysRemaining(item as Provider);
        
        const getStatusColor = () => {
          if (item.subscription_status === 'trial' && daysRemaining !== null) {
            if (daysRemaining <= 0) return 'bg-red-100 text-red-800';
            if (daysRemaining <= 7) return 'bg-yellow-100 text-yellow-800';
            return 'bg-blue-100 text-blue-800';
          }
          
          const subColors = {
            active: 'bg-green-100 text-green-800',
            frozen: 'bg-gray-100 text-gray-800',
            trial: 'bg-blue-100 text-blue-800',
          };
          return subColors[item.subscription_status as keyof typeof subColors] || 'bg-gray-100 text-gray-800';
        };
        
        return (
          <div className="min-w-0">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor()}`}>
              {item.subscription_status?.charAt(0).toUpperCase() + item.subscription_status?.slice(1) || 'Unknown'}
            </span>
            {item.subscription_status === 'trial' && daysRemaining !== null && (
              <div className="text-xs text-gray-500 mt-1 truncate">
                {daysRemaining <= 0 ? 'Expired' : `${daysRemaining} days`}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'created_at',
      label: 'Registered',
      sortable: true,
      render: (item: any) => {
        if (!item?.created_at) return <span className="text-gray-400">-</span>;
        
        const date = new Date(item.created_at);
        const now = new Date();
        const diffTime = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        return (
          <div className="min-w-0">
            <div className="text-sm text-gray-900">
              {date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric'
              })}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {diffDays === 0 ? 'Today' : 
               diffDays === 1 ? 'Yesterday' : 
               diffDays < 7 ? `${diffDays}d ago` :
               diffDays < 30 ? `${Math.floor(diffDays / 7)}w ago` :
               `${Math.floor(diffDays / 30)}m ago`}
            </div>
          </div>
        );
      }
    }
  ];

  const actions = [
    {
      label: 'Details',
      onClick: openProviderDetail,
      className: 'inline-flex items-center px-2 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50'
    },
    ...(isAdmin ? [
      {
        label: 'Approve',
        onClick: openApproveConfirmation,
        className: 'inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700',
        show: (row: Provider) => row.status === 'pending'
      }
    ] : [])
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
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <select 
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="all">All Cities</option>
              {uniqueCities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
            <select 
              value={subscriptionFilter}
              onChange={(e) => setSubscriptionFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="all">All Subscriptions</option>
              <option value="trial">Trial</option>
              <option value="active">Active</option>
              <option value="frozen">Frozen</option>
            </select>
          </div>
          <div className="flex items-end space-x-2">
            <button 
              onClick={() => {
                setStatusFilter('pending');
                setCityFilter('all');
                setSubscriptionFilter('all');
              }}
              className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Smart Defaults
            </button>
            <button 
              onClick={() => {
                setStatusFilter('all');
                setCityFilter('all');
                setSubscriptionFilter('all');
              }}
              className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Clear All
            </button>
          </div>
        </div>
        
        {/* Filter summary */}
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <span>
            Showing {filteredProviders.length} of {providers.length} providers
            {(statusFilter !== 'all' || cityFilter !== 'all' || subscriptionFilter !== 'all') && (
              <span className="ml-2">
                (filtered by: {[
                  statusFilter !== 'all' && `status: ${statusFilter}`,
                  cityFilter !== 'all' && `city: ${cityFilter}`,
                  subscriptionFilter !== 'all' && `subscription: ${subscriptionFilter}`
                ].filter(Boolean).join(', ')})
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-900">
                {selectedProviders.length} provider{selectedProviders.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={bulkApprove}
                disabled={actionLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {actionLoading ? 'Approving...' : 'Bulk Approve'}
              </button>
              <button
                onClick={bulkFreeze}
                disabled={actionLoading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                </svg>
                {actionLoading ? 'Freezing...' : 'Bulk Freeze'}
              </button>
              <button
                onClick={() => setSelectedProviders([])}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DataTable */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <DataTable
            data={filteredProviders}
            columns={columns}
            actions={actions}
            searchable
            searchKeys={['business_name', 'kvk_number']}
            emptyMessage={loading ? "Loading providers..." : "No providers found."}
            defaultSort={{ key: 'created_at', direction: 'desc' }}
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
        onUnapprove={unapproveProvider}
        onFreeze={freezeProvider}
        onUnfreeze={unfreezeProvider}
        onUpdateSubscription={updateSubscriptionStatus}
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