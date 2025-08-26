import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import OpeningHours from '../../components/ui/OpeningHours';
import GalleryManager from '../../components/ui/GalleryManager';

interface Provider {
  id: number;
  business_name: string;
  email: string;
  phone: string | null;
  website: string | null;
  address: string;
  city: string;
  postal_code: string | null;
  country: string;
  kvk_number: string;
  btw_number: string | null;
  bio_nl: string | null;
  bio_en: string | null;
  opening_hours: any;
  gallery: any[];
  status: string;
  subscription_status: string;
  trial_expires_at?: string;
  trial_expired?: boolean;
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
    website: '',
    address: '',
    city: '',
    postal_code: '',
    kvk_number: '',
    btw_number: '',
    bio_nl: '',
    bio_en: '',
    opening_hours: {},
    gallery: [] as any[],
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
          website: data.website || '',
          address: data.address || '',
          city: data.city || '',
          postal_code: data.postal_code || '',
          kvk_number: data.kvk_number || '',
          btw_number: data.btw_number || '',
          bio_nl: data.bio_nl || '',
          bio_en: data.bio_en || '',
          opening_hours: data.opening_hours || {},
          gallery: data.gallery || [],
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

  const handleOpeningHoursChange = (hours: any) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: hours
    }));
  };

  const handleGalleryChange = (images: any[]) => {
    setFormData(prev => ({
      ...prev,
      gallery: images
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
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-600">Manage your business profile and information.</p>
      </div>

      {provider && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-5 h-5 text-blue-400">ℹ️</div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Account Status: {provider.status} | Subscription: {provider.subscription_status}
                {provider.subscription_status === 'trial' && provider.trial_expires_at && (
                  <span>
                    {' '}(ends on {new Date(provider.trial_expires_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })})
                  </span>
                )}
              </h3>
              {provider.status === 'pending' && (
                <p className="mt-1 text-xs text-blue-700">
                  Your profile is pending approval. You can edit your information, but it won't be visible to users until approved.
                </p>
              )}
              {provider.subscription_status === 'trial' && provider.trial_expires_at && (
                <p className="mt-1 text-xs text-blue-700">
                  You have {Math.ceil((new Date(provider.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days 
                  left in your free trial period.
                </p>
              )}
              {provider.trial_expired && (
                <p className="mt-1 text-xs text-red-700">
                  Your trial period has expired. Please upgrade to continue receiving contact messages.
                </p>
              )}
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

        {/* Business Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Business Information</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="business_name" className="label">
                Business Name *
              </label>
              <input
                type="text"
                id="business_name"
                name="business_name"
                required
                value={formData.business_name}
                onChange={handleInputChange}
                className="input-field"
              />
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

            <div>
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

            <div>
              <label htmlFor="website" className="label">
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="address" className="label">
                Street Address *
              </label>
              <input
                type="text"
                id="address"
                name="address"
                required
                value={formData.address}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="city" className="label">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="postal_code" className="label">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postal_code"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  placeholder="1012 AB"
                  className="input-field"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Legal Information</h2>
          
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
                  KVK number cannot be changed after approval
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
                  BTW number cannot be changed after approval
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Business Description */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Business Description</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="bio_en" className="label">
                Description (English)
              </label>
              <textarea
                id="bio_en"
                name="bio_en"
                rows={4}
                value={formData.bio_en}
                onChange={handleInputChange}
                placeholder="Describe your business and services in English..."
                className="input-field resize-none"
              />
            </div>

            <div>
              <label htmlFor="bio_nl" className="label">
                Description (Dutch)
              </label>
              <textarea
                id="bio_nl"
                name="bio_nl"
                rows={4}
                value={formData.bio_nl}
                onChange={handleInputChange}
                placeholder="Beschrijf uw bedrijf en diensten in het Nederlands..."
                className="input-field resize-none"
              />
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-white shadow rounded-lg p-6">
          <OpeningHours
            value={formData.opening_hours}
            onChange={handleOpeningHoursChange}
            disabled={saving}
          />
        </div>

        {/* Gallery */}
        <div className="bg-white shadow rounded-lg p-6">
          <GalleryManager
            images={formData.gallery}
            onChange={handleGalleryChange}
            maxImages={6}
            disabled={saving}
          />
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