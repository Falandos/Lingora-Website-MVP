import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Provider {
  id: number;
  business_name: string;
  slug: string;
  email: string;
  phone: string | null;
  kvk_number: string;
  btw_number: string | null;
  status: string;
  subscription_status: string;
  trial_expires_at?: string;
  trial_expired?: boolean;
  profile_completeness_score?: number;
}

const ProfilePage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [provider, setProvider] = useState<Provider | null>(null);

  const [formData, setFormData] = useState({
    business_name: '',
    email: '',
    phone: '',
    kvk_number: '',
    btw_number: '',
  });


  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/providers/my', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const responseData = await response.json();
        
        // The API returns data in a nested structure: { success: true, status: 200, data: {...} }
        const data = responseData.data || responseData;
        
        setProvider(data);
        setFormData({
          business_name: data.business_name || '',
          email: data.email || '',
          phone: data.phone || '',
          kvk_number: data.kvk_number || '',
          btw_number: data.btw_number || '',
        });
      } else {
        const errorData = await response.text();
        setError('Failed to load provider data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Prepare data - exclude fields that can't be updated after approval
      const updateData = { ...formData };
      if (provider?.status === 'approved') {
        delete updateData.kvk_number;
        delete updateData.btw_number;
      }

      const response = await fetch('/api/providers/my', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        loadProviderData(); // Reload data
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your business profile and information.</p>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Profile</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your account information and verification details.</p>
      </div>

      {/* Quick Stats Cards */}
      {provider && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Account Status */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  provider.status === 'approved' ? 'bg-green-400' : 
                  provider.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{provider.status}</p>
              </div>
            </div>
          </div>

          {/* Subscription Status */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  provider.subscription_status === 'active' ? 'bg-green-400' : 
                  provider.subscription_status === 'trial' ? 'bg-blue-400' : 'bg-red-400'
                }`}></div>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Subscription</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{provider.subscription_status}</p>
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white shadow rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-xs font-semibold text-orange-600">
                    {provider.profile_completeness_score || 0}%
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500 uppercase tracking-wide">Profile Complete</p>
                <p className="text-sm font-medium text-gray-900">
                  {provider.profile_completeness_score >= 80 ? 'Excellent' : 
                   provider.profile_completeness_score >= 60 ? 'Good' : 'Needs Work'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trial Warning */}
      {provider && provider.subscription_status === 'trial' && provider.trial_expires_at && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-yellow-400">⏰</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Trial Period Active
              </h3>
              <p className="mt-1 text-xs text-yellow-700">
                You have {Math.ceil((new Date(provider.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days 
                left in your free trial period. 
                {provider.status === 'pending' && ' Your profile will be visible to users once approved.'}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* Account Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Account Information</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="business_name" className="label">
                Business Name
              </label>
              <div className="input-field bg-gray-50 text-gray-500">
                {formData.business_name}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Business name can be edited on your public page (use "Edit Public Page" in sidebar)
              </p>
            </div>

            <div>
              <label htmlFor="email" className="label">
                Contact Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="label">
                Phone Number
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

        {/* Verification Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Verification Information</h2>
          <p className="text-sm text-gray-600 mb-4">
            These details are required for business verification and cannot be changed after approval.
          </p>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="kvk_number" className="label">
                KVK Number *
              </label>
              <input
                type="text"
                id="kvk_number"
                name="kvk_number"
                required
                value={formData.kvk_number}
                onChange={handleInputChange}
                className="input-field"
                disabled={provider?.status === 'approved'}
              />
              {provider?.status === 'approved' && (
                <p className="mt-1 text-xs text-gray-500">
                  ✅ Verified - KVK number cannot be changed after approval
                </p>
              )}
            </div>

            <div>
              <label htmlFor="btw_number" className="label">
                BTW Number
              </label>
              <input
                type="text"
                id="btw_number"
                name="btw_number"
                value={formData.btw_number}
                onChange={handleInputChange}
                className="input-field"
                disabled={provider?.status === 'approved'}
              />
              {provider?.status === 'approved' && (
                <p className="mt-1 text-xs text-gray-500">
                  ✅ Verified - BTW number cannot be changed after approval
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business Profile Editing */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 text-orange-400">📝</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-orange-800 mb-2">
                Edit Your Business Profile
              </h3>
              <p className="text-sm text-orange-700 mb-4">
                To edit your business description, address, opening hours, gallery, and other public information, 
                use the live-edit feature on your public page.
              </p>
              <div className="flex flex-wrap gap-2">
                {provider?.slug && (
                  <>
                    <a
                      href={`/provider/${provider.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-orange-300 shadow-sm text-sm font-medium rounded-md text-orange-700 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Public Page
                    </a>
                    <a
                      href={`/provider/${provider.slug}?edit=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Public Page
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;