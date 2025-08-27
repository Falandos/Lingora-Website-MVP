import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardHome from './DashboardHome';
import ProvidersPage from './ProvidersPage';
import ProfilePage from './dashboard/ProfilePage';
import ServicesPage from './dashboard/ServicesPage';
import StaffPage from './dashboard/StaffPage';

// Import auth context for role checking
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import DataTable, { type Column } from '../components/dashboard/DataTable';

interface Message {
  id: number;
  sender_name: string;
  sender_email: string;
  business_name?: string;
  provider_name?: string;
  subject: string;
  message: string;
  created_at: string;
  is_read?: boolean;
}

const MessagesPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      const endpoint = isAdmin ? '/api/admin/messages' : '/api/messages';
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const messagesData = result.data?.messages || result.messages || result.data || result;
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } else {
        setError('Failed to load messages');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const columns: Column[] = [
    {
      key: 'sender_name',
      label: 'Sender',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          <div className="text-sm text-gray-500">{row.sender_email}</div>
        </div>
      )
    },
    ...(isAdmin ? [{
      key: 'business_name',
      label: 'To Provider',
      sortable: true,
      render: (value: string) => value || 'N/A'
    }] : []),
    {
      key: 'subject',
      label: 'Subject',
      sortable: true,
    },
    {
      key: 'created_at',
      label: 'Received',
      sortable: true,
      render: (value: string) => formatDate(value)
    },
    ...(isAdmin ? [{
      key: 'is_read',
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value ? 'Read' : 'New'}
        </span>
      )
    }] : [])
  ];

  const actions = [
    {
      label: 'View',
      onClick: (row: Message) => alert(`From: ${row.sender_name}\n\nMessage:\n${row.message}`),
      variant: 'secondary' as const
    },
    ...(isAdmin ? [{
      label: 'Reply',
      onClick: (row: Message) => window.open(`mailto:${row.sender_email}?subject=Re: ${row.subject}`, '_blank'),
      variant: 'primary' as const
    }] : [])
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'All Messages' : 'Messages'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isAdmin 
            ? `Monitor all contact messages sent through the platform. ${messages.filter(m => !m.is_read).length} unread messages.`
            : 'Messages related to your provider profile.'
          }
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <DataTable
            data={messages}
            columns={columns}
            actions={actions}
            searchable
            searchKeys={['sender_name', 'sender_email', 'subject']}
            emptyMessage={loading ? "Loading messages..." : "No messages found."}
          />
        </div>
      </div>
    </div>
  );
};

const StatsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
      <p className="mt-1 text-sm text-gray-600">Detailed analytics and insights.</p>
    </div>
    <div className="bg-white shadow rounded-lg p-6">
      <div className="text-gray-600 text-sm">
        Advanced statistics and charts coming soon...
      </div>
    </div>
  </div>
);

const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: {
      emailEnabled: true,
      digestFrequency: 'daily', // immediate, daily, weekly
      newMessageAlerts: true,
    },
    privacy: {
      profileVisible: true,
      contactInfoVisible: true,
      staffVisible: true,
    },
    language: {
      dashboardLanguage: 'en',
      defaultVisitorLanguage: 'nl',
    },
    business: {
      timezone: 'Europe/Amsterdam',
      vacationMode: false,
      autoReply: '',
    }
  });
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    if (user?.role === 'provider') {
      loadProviderData();
    }
  }, [user]);

  const loadProviderData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/providers/my', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setProvider(data.data || data);
      }
    } catch (error) {
      console.error('Failed to load provider data:', error);
    }
  };

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    // TODO: Implement actual API call to save settings
    setTimeout(() => {
      setLoading(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const timezones = [
    'Europe/Amsterdam',
    'Europe/London', 
    'Europe/Berlin',
    'America/New_York',
    'America/Los_Angeles',
    'Asia/Tokyo'
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' }
  ];

  if (user?.role === 'admin') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">System administration settings.</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-gray-600 text-sm">
            Admin settings panel coming soon...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-600">Customize your preferences and business configuration.</p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Email Notifications</label>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.emailEnabled}
                onChange={(e) => handleSettingChange('notifications', 'emailEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Digest Frequency</label>
            <select
              value={settings.notifications.digestFrequency}
              onChange={(e) => handleSettingChange('notifications', 'digestFrequency', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">New Message Alerts</label>
              <p className="text-sm text-gray-500">Get notified immediately when you receive new messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.newMessageAlerts}
                onChange={(e) => handleSettingChange('notifications', 'newMessageAlerts', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Privacy & Visibility */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Privacy & Visibility</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Profile Visibility</label>
              <p className="text-sm text-gray-500">Make your profile searchable and visible to users</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.profileVisible}
                onChange={(e) => handleSettingChange('privacy', 'profileVisible', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Contact Information Display</label>
              <p className="text-sm text-gray-500">Show email and phone on your public profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.contactInfoVisible}
                onChange={(e) => handleSettingChange('privacy', 'contactInfoVisible', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Staff Visibility</label>
              <p className="text-sm text-gray-500">Display staff members on your public profile</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.privacy.staffVisible}
                onChange={(e) => handleSettingChange('privacy', 'staffVisible', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Language Preferences</h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-700">Dashboard Language</label>
            <select
              value={settings.language.dashboardLanguage}
              onChange={(e) => handleSettingChange('language', 'dashboardLanguage', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Default Visitor Language</label>
            <select
              value={settings.language.defaultVisitorLanguage}
              onChange={(e) => handleSettingChange('language', 'defaultVisitorLanguage', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">Language shown to visitors when they first visit your page</p>
          </div>
        </div>
      </div>

      {/* Business Configuration */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Business Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Timezone</label>
            <select
              value={settings.business.timezone}
              onChange={(e) => handleSettingChange('business', 'timezone', e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Vacation Mode</label>
              <p className="text-sm text-gray-500">Temporarily hide your profile from search results</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.business.vacationMode}
                onChange={(e) => handleSettingChange('business', 'vacationMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Auto-Reply Message</label>
            <textarea
              value={settings.business.autoReply}
              onChange={(e) => handleSettingChange('business', 'autoReply', e.target.value)}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Optional auto-reply message sent to people who contact you..."
            />
          </div>
        </div>
      </div>

      {/* Billing & Subscription */}
      {provider && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Billing & Subscription</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {provider.subscription_status === 'trial' ? 'Free Trial' : 
                       provider.subscription_status === 'active' ? 'Pro Plan' : 'Inactive'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {provider.subscription_status === 'trial' ? 'Full access during trial period' :
                       provider.subscription_status === 'active' ? '€9.99/month or €99.99/year' : 'Limited access'}
                    </p>
                  </div>
                  <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    provider.subscription_status === 'active' ? 'bg-green-100 text-green-800' :
                    provider.subscription_status === 'trial' ? 'bg-blue-100 text-blue-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {provider.subscription_status}
                  </div>
                </div>
                
                {provider.subscription_status === 'trial' && provider.trial_expires_at && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <strong>Trial expires in {Math.ceil((new Date(provider.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</strong>
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Upgrade to Pro to continue receiving messages and maintain visibility
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Upgrade Options</h3>
                <div className="space-y-2">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Monthly Plan</p>
                        <p className="text-xs text-gray-500">€9.99/month</p>
                      </div>
                      <div className="text-sm text-blue-600">Select</div>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Yearly Plan</p>
                        <p className="text-xs text-gray-500">€99.99/year (Save €20!)</p>
                      </div>
                      <div className="text-sm text-blue-600">Select</div>
                    </div>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Payment processing will be integrated in a future update
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveSettings}
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};



const DashboardPage = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="staff" element={<StaffPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;