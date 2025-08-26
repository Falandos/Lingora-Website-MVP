import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface Provider {
  id: number;
  business_name: string;
  email: string;
  phone?: string;
  website?: string;
  address: string;
  city: string;
  postal_code?: string;
  kvk_number: string;
  btw_number?: string;
  bio_nl?: string;
  bio_en?: string;
  status: string;
  subscription_status: string;
  profile_completeness_score?: number;
  created_at: string;
  services?: any[];
  staff?: any[];
  trial_expired?: boolean;
}

interface ProviderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (provider: Provider) => void;
  onReject: (provider: Provider, reason: string) => void;
  provider: Provider | null;
}

const ProviderDetailModal = ({ 
  isOpen, 
  onClose, 
  onApprove, 
  onReject, 
  provider 
}: ProviderDetailModalProps) => {
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [fullProvider, setFullProvider] = useState<Provider | null>(null);

  useEffect(() => {
    if (isOpen && provider) {
      loadFullProviderDetails();
      setShowRejectForm(false);
      setRejectionReason('');
    }
  }, [isOpen, provider]);

  const loadFullProviderDetails = async () => {
    if (!provider) return;
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/providers/${provider.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setFullProvider(result.data || result);
      } else {
        console.error('Failed to load provider details');
        setFullProvider(provider);
      }
    } catch (err) {
      console.error('Network error loading provider details:', err);
      setFullProvider(provider);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!provider) return;
    
    setLoading(true);
    try {
      await onApprove(provider);
      onClose();
    } catch (error) {
      console.error('Failed to approve provider:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!provider || !rejectionReason.trim()) return;
    
    setLoading(true);
    try {
      await onReject(provider, rejectionReason.trim());
      onClose();
    } catch (error) {
      console.error('Failed to reject provider:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !provider) return null;

  const displayProvider = fullProvider || provider;
  const isPending = displayProvider.status === 'pending';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Provider Details: {displayProvider.business_name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {loading && fullProvider === null ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-md ${
              displayProvider.status === 'approved' ? 'bg-green-50 border-green-200' :
              displayProvider.status === 'pending' ? 'bg-yellow-50 border-yellow-200' :
              'bg-red-50 border-red-200'
            } border`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    Status: <span className="capitalize">{displayProvider.status}</span>
                  </h4>
                  <p className="text-sm mt-1">
                    Subscription: <span className="capitalize">{displayProvider.subscription_status}</span>
                    {displayProvider.profile_completeness_score && (
                      <> • Profile: {displayProvider.profile_completeness_score}% complete</>
                    )}
                  </p>
                </div>
                {displayProvider.trial_expired && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Trial Expired
                  </span>
                )}
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Business Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Business Name</label>
                  <p className="text-gray-900">{displayProvider.business_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-900">{displayProvider.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phone</label>
                  <p className="text-gray-900">{displayProvider.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Website</label>
                  <p className="text-gray-900">
                    {displayProvider.website ? (
                      <a href={displayProvider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {displayProvider.website}
                      </a>
                    ) : 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Address</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Street Address</label>
                  <p className="text-gray-900">{displayProvider.address}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">City</label>
                  <p className="text-gray-900">{displayProvider.city}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Postal Code</label>
                  <p className="text-gray-900">{displayProvider.postal_code || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Legal Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">KVK Number</label>
                  <p className="text-gray-900 font-mono">{displayProvider.kvk_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">BTW Number</label>
                  <p className="text-gray-900 font-mono">{displayProvider.btw_number || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Business Description */}
            {(displayProvider.bio_en || displayProvider.bio_nl) && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Business Description</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displayProvider.bio_en && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">English</label>
                      <p className="text-gray-900 text-sm">{displayProvider.bio_en}</p>
                    </div>
                  )}
                  {displayProvider.bio_nl && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Dutch</label>
                      <p className="text-gray-900 text-sm">{displayProvider.bio_nl}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Services Overview */}
            {displayProvider.services && displayProvider.services.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Services ({displayProvider.services.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayProvider.services.map((service: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <h5 className="font-medium text-gray-900">{service.title}</h5>
                      <p className="text-sm text-gray-600">{service.category_name}</p>
                      {service.price_min && (
                        <p className="text-sm text-gray-500">€{service.price_min} - €{service.price_max || service.price_min}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Staff Overview */}
            {displayProvider.staff && displayProvider.staff.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Staff ({displayProvider.staff.length})</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {displayProvider.staff.map((member: any, index: number) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <h5 className="font-medium text-gray-900">{member.name}</h5>
                      <p className="text-sm text-gray-600">{member.role}</p>
                      {member.languages && member.languages.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {member.languages.slice(0, 3).map((lang: any, langIndex: number) => (
                            <span key={langIndex} className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {lang.name_en}
                            </span>
                          ))}
                          {member.languages.length > 3 && (
                            <span className="text-xs text-gray-500">+{member.languages.length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registration Date */}
            <div>
              <label className="text-sm font-medium text-gray-600">Registration Date</label>
              <p className="text-gray-900">{new Date(displayProvider.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            {/* Rejection Form */}
            {showRejectForm && (
              <div className="border-t pt-6">
                <h4 className="font-semibold text-red-900 mb-3">Reject Provider</h4>
                <div>
                  <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700">
                    Reason for Rejection *
                  </label>
                  <textarea
                    id="rejection-reason"
                    rows={4}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejecting this provider application..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                    disabled={loading}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {!loading && isPending && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Close
            </Button>
            
            {!showRejectForm ? (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setShowRejectForm(true)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700"
                >
                  Reject
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApprove}
                  disabled={loading}
                >
                  {loading ? 'Approving...' : 'Approve Provider'}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                  disabled={loading || !rejectionReason.trim()}
                >
                  {loading ? 'Rejecting...' : 'Confirm Rejection'}
                </Button>
              </>
            )}
          </div>
        )}
        
        {!loading && !isPending && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDetailModal;