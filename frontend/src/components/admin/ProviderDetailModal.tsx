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
  trial_expires_at?: string;
  trial_days_remaining?: number;
}

interface ProviderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (provider: Provider) => void;
  onReject: (provider: Provider, reason: string) => void;
  onUnapprove?: (provider: Provider) => void;
  onFreeze?: (provider: Provider) => void;
  onUnfreeze?: (provider: Provider) => void;
  onUpdateSubscription?: (provider: Provider, status: string) => void;
  provider: Provider | null;
}

const ProviderDetailModal = ({ 
  isOpen, 
  onClose, 
  onApprove, 
  onReject, 
  onUnapprove,
  onFreeze,
  onUnfreeze,
  onUpdateSubscription,
  provider 
}: ProviderDetailModalProps) => {
  const [loading, setLoading] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [fullProvider, setFullProvider] = useState<Provider | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('');
  
  // Admin notes state
  const [notes, setNotes] = useState<any[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newNoteType, setNewNoteType] = useState('general');
  const [notesLoading, setNotesLoading] = useState(false);
  
  // Activity log state
  const [activities, setActivities] = useState<any[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'activity'>('notes');

  // Utility function to get trial status
  const getTrialStatus = (provider: Provider) => {
    if (provider.subscription_status !== 'trial' || !provider.trial_expires_at) {
      return null;
    }
    
    const now = new Date();
    const expiryDate = new Date(provider.trial_expires_at);
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      daysRemaining,
      isExpired: daysRemaining <= 0,
      isExpiringSoon: daysRemaining > 0 && daysRemaining <= 7,
      expiryDate: expiryDate.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  };

  useEffect(() => {
    if (isOpen && provider) {
      // Set the provider data immediately for instant loading
      setFullProvider(provider);
      setShowRejectForm(false);
      setRejectionReason('');
      setSubscriptionStatus(provider.subscription_status || '');
      
      // Load admin notes and activity log
      loadNotes();
      loadActivities();
      
      // Reset notes form
      setShowAddNote(false);
      setNewNote('');
      setNewNoteType('general');
      
      // Optionally load additional details in background
      // loadFullProviderDetails();
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
        console.error('Failed to load full provider details:', response.status, response.statusText);
        // Fallback to basic provider data
        setFullProvider(provider);
      }
    } catch (err) {
      console.error('Network error loading provider details:', err);
      // Fallback to basic provider data
      setFullProvider(provider);
    } finally {
      setLoading(false);
    }
  };

  // Admin notes functions
  const loadNotes = async () => {
    if (!provider) return;
    
    try {
      setNotesLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/notes/${provider.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Load notes API response:', result);
        
        // Handle different response structures
        const notesData = result.data?.notes || result.notes || [];
        console.log('Notes data:', notesData);
        
        setNotes(notesData);
      } else {
        const errorText = await response.text();
        console.error('Failed to load notes:', response.status, errorText);
        setNotes([]);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    } finally {
      setNotesLoading(false);
    }
  };

  const addNote = async () => {
    if (!provider || !newNote.trim()) return;
    
    try {
      setNotesLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/notes/${provider.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note_text: newNote.trim(),
          note_type: newNoteType
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Add note API response:', result);
        
        // Handle different response structures
        const newNote = result.data?.note || result.note;
        console.log('New note object:', newNote);
        
        if (newNote && newNote.id) {
          setNotes(prev => [newNote, ...prev]);
          setNewNote('');
          setShowAddNote(false);
        } else {
          console.error('Invalid note response structure:', result);
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to add note:', response.status, errorText);
      }
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  const getNoteTypeColor = (type: string) => {
    switch (type) {
      case 'approval': return 'bg-green-100 text-green-800';
      case 'rejection': return 'bg-red-100 text-red-800';
      case 'subscription': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Activity log functions
  const loadActivities = async () => {
    if (!provider) return;
    
    try {
      setActivitiesLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/admin/activity-log/${provider.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        setActivities(result.activities || []);
      } else {
        console.error('Failed to load activities:', response.status);
        setActivities([]);
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const getActivityColor = (actionType: string) => {
    switch (actionType) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'unapproved': return 'bg-orange-100 text-orange-800';
      case 'subscription_changed': return 'bg-blue-100 text-blue-800';
      case 'frozen': return 'bg-gray-100 text-gray-800';
      case 'unfrozen': return 'bg-green-100 text-green-800';
      case 'created': return 'bg-purple-100 text-purple-800';
      case 'updated': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatActivityMessage = (activity: any) => {
    const details = activity.action_details ? JSON.parse(activity.action_details) : {};
    const oldValues = activity.old_values ? JSON.parse(activity.old_values) : {};
    const newValues = activity.new_values ? JSON.parse(activity.new_values) : {};
    
    switch (activity.action_type) {
      case 'approved':
        return `Provider approved (was: ${oldValues.status || 'unknown'})`;
      case 'rejected':
        return `Provider rejected${details.reason ? `: ${details.reason}` : ''}`;
      case 'unapproved':
        return `Provider reverted to pending (was: ${oldValues.status || 'unknown'})`;
      case 'subscription_changed':
        return `Subscription status changed from ${oldValues.subscription_status || 'unknown'} to ${newValues.subscription_status}`;
      default:
        return details.message || `${activity.action_type.replace('_', ' ')} action performed`;
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

  const handleSubscriptionStatusChange = async (newStatus: string) => {
    if (!provider || !onUpdateSubscription) return;
    
    setLoading(true);
    try {
      await onUpdateSubscription(provider, newStatus);
      setSubscriptionStatus(newStatus);
    } catch (error) {
      console.error('Failed to update subscription status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !provider) return null;


  const displayProvider = fullProvider || provider;
  const isPending = displayProvider?.status === 'pending';
  const trialStatus = displayProvider ? getTrialStatus(displayProvider) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Provider Details: {displayProvider?.business_name || 'Loading...'}
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
                  {trialStatus && (
                    <div className={`text-sm mt-2 p-2 rounded ${
                      trialStatus.isExpired ? 'bg-red-100 text-red-800' :
                      trialStatus.isExpiringSoon ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      <strong>
                        {trialStatus.isExpired 
                          ? `Trial expired ${Math.abs(trialStatus.daysRemaining)} days ago` 
                          : `Trial expires in ${trialStatus.daysRemaining} days`}
                      </strong>
                      <br />
                      <span className="text-xs">Expiry date: {trialStatus.expiryDate}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  {trialStatus?.isExpired && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Trial Expired
                    </span>
                  )}
                  {trialStatus?.isExpiringSoon && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Expires Soon
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 p-4 bg-gray-50 rounded-md">
              <a
                href={`/provider/${displayProvider?.business_name?.toLowerCase()?.replace(/\s+/g, '-') || 'unknown'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Public Page
              </a>
              <a
                href={`mailto:${displayProvider.email}`}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Email
              </a>
              {onUpdateSubscription && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-600">Subscription Status:</label>
                  <select
                    value={subscriptionStatus}
                    onChange={(e) => handleSubscriptionStatusChange(e.target.value)}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="frozen">Frozen</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
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

            {/* Admin Notes & Activity Log Section */}
            <div className="border-t pt-6">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'notes'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Admin Notes ({notes.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'activity'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Activity Log ({activities.length})
                  </button>
                </div>
                
                {activeTab === 'notes' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddNote(!showAddNote)}
                    disabled={notesLoading}
                  >
                    {showAddNote ? 'Cancel' : 'Add Note'}
                  </Button>
                )}
              </div>

              {/* Add Note Form */}
              {activeTab === 'notes' && showAddNote && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note Type
                      </label>
                      <select
                        value={newNoteType}
                        onChange={(e) => setNewNoteType(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={notesLoading}
                      >
                        <option value="general">General</option>
                        <option value="approval">Approval Decision</option>
                        <option value="rejection">Rejection Decision</option>
                        <option value="subscription">Subscription Issue</option>
                        <option value="warning">Warning</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Note
                      </label>
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                        placeholder="Add your admin note here..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={notesLoading}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setShowAddNote(false);
                          setNewNote('');
                          setNewNoteType('general');
                        }}
                        disabled={notesLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={addNote}
                        disabled={notesLoading || !newNote.trim()}
                      >
                        {notesLoading ? 'Adding...' : 'Add Note'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activeTab === 'notes' ? (
                  // Notes List
                  <>
                    {notesLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-pulse text-gray-500">Loading notes...</div>
                      </div>
                    ) : notes.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No admin notes yet.</p>
                    ) : (
                      notes.filter(note => note && note.id).map((note, index) => (
                        <div key={note?.id || `note-${index}`} className="bg-white border rounded-lg p-3 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getNoteTypeColor(note?.note_type || 'general')}`}>
                                {(note?.note_type || 'general').charAt(0).toUpperCase() + (note?.note_type || 'general').slice(1)}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {note?.admin_name || 'Unknown Admin'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {note?.created_at ? new Date(note.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : 'Unknown date'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{note?.note_text || 'No content'}</p>
                        </div>
                      ))
                    )}
                  </>
                ) : (
                  // Activity Log List
                  <>
                    {activitiesLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-pulse text-gray-500">Loading activity log...</div>
                      </div>
                    ) : activities.length === 0 ? (
                      <p className="text-gray-500 text-sm italic">No activity logged yet.</p>
                    ) : (
                      activities.map((activity) => (
                        <div key={activity.id} className="bg-white border rounded-lg p-3 shadow-sm">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getActivityColor(activity.action_type)}`}>
                                {activity.action_type.replace('_', ' ').toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {activity.admin_email || 'System'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{formatActivityMessage(activity)}</p>
                          {activity.ip_address && (
                            <p className="text-xs text-gray-500 mt-1">IP: {activity.ip_address}</p>
                          )}
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
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
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            {displayProvider?.status === 'approved' && onUnapprove && (
              <Button
                variant="outline"
                onClick={() => onUnapprove(displayProvider)}
                disabled={loading}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Revert to Pending
              </Button>
            )}
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