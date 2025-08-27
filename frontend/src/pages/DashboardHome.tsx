import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import StatCard from '../components/dashboard/StatCard';
import DashboardService from '../services/dashboardService';

// Local type definitions
interface AdminStats {
  providers: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    trial: number;
    frozen: number;
  };
  messages: {
    total: number;
    new: number;
    last_week: number;
  };
}

interface ProviderStats {
  profile_completion: number;
  messages_count: number;
  services_count: number;
  staff_count: number;
}

// Icons for stats
const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ServicesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4v8a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2zM9 11h6" />
  </svg>
);

const StaffIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const DashboardHome = () => {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [providerStats, setProviderStats] = useState<ProviderStats | null>(null);
  const [provider, setProvider] = useState<any>(null);
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (user?.role === 'admin') {
          const stats = await DashboardService.getAdminStats();
          setAdminStats(stats);
        } else {
          // Fetch provider stats and additional data
          const stats = await DashboardService.getProviderStats();
          setProviderStats(stats);
          
          // Fetch provider data
          const providerResponse = await fetch('/api/providers/my', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (providerResponse.ok) {
            const providerData = await providerResponse.json();
            setProvider(providerData.data || providerData);
          }
          
          // Fetch recent messages
          const messagesResponse = await fetch('/api/messages', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            const messages = messagesData.data?.messages || messagesData.messages || messagesData.data || messagesData;
            setRecentMessages(Array.isArray(messages) ? messages.slice(0, 5) : []);
          }
        }
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard data error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const renderAdminStats = () => {
    if (!adminStats) return null;

    return (
      <div className="space-y-6">
        {/* Primary Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Providers"
            value={adminStats.providers.total}
            icon={UsersIcon}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Pending Approvals"
            value={adminStats.providers.pending}
            icon={ClockIcon}
            color={adminStats.providers.pending > 0 ? "red" : "yellow"}
            loading={loading}
          />
          <StatCard
            title="Active Providers"
            value={adminStats.providers.approved}
            icon={ProfileIcon}
            color="green"
            loading={loading}
          />
          <StatCard
            title="New Messages"
            value={`${adminStats.messages.new} today`}
            icon={MessageIcon}
            color="green"
            loading={loading}
          />
        </div>
        
        {/* Secondary Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard
            title="Trial Accounts"
            value={adminStats.providers.trial}
            icon={ChartIcon}
            color="purple"
            loading={loading}
          />
          <StatCard
            title="Frozen Accounts"
            value={adminStats.providers.frozen}
            icon={StaffIcon}
            color="gray"
            loading={loading}
          />
          <StatCard
            title="Total Messages"
            value={adminStats.messages.total}
            icon={MessageIcon}
            color="blue"
            loading={loading}
          />
        </div>
      </div>
    );
  };

  const renderProviderStats = () => {
    if (!providerStats) return null;

    const trialDaysLeft = provider?.trial_expires_at 
      ? Math.ceil((new Date(provider.trial_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Profile Completion"
          value={`${providerStats.profile_completion}%`}
          icon={ProfileIcon}
          color="blue"
          loading={loading}
        />
        <StatCard
          title="Messages Received"
          value={`${providerStats.messages_count} total`}
          icon={MessageIcon}
          color="green"
          loading={loading}
        />
        <StatCard
          title="Active Services"
          value={providerStats.services_count}
          icon={ServicesIcon}
          color="purple"
          loading={loading}
        />
        {provider?.subscription_status === 'trial' && provider?.trial_expires_at ? (
          <StatCard
            title="Trial Days Left"
            value={trialDaysLeft > 0 ? trialDaysLeft : 'Expired'}
            icon={ClockIcon}
            color={trialDaysLeft > 7 ? "green" : trialDaysLeft > 0 ? "yellow" : "red"}
            loading={loading}
          />
        ) : (
          <StatCard
            title="Staff Members"
            value={providerStats.staff_count}
            icon={StaffIcon}
            color="yellow"
            loading={loading}
          />
        )}
      </div>
    );
  };

  const renderAdminQuickActions = () => {
    if (user?.role !== 'admin') return null;
    
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/dashboard/providers"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2">
              <UsersIcon />
            </div>
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
              Manage Providers
            </span>
          </a>
          <a
            href="/dashboard/messages"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-8 h-8 text-gray-400 group-hover:text-green-500 mb-2">
              <MessageIcon />
            </div>
            <span className="text-sm font-medium text-gray-900 group-hover:text-green-600">
              View Messages
            </span>
          </a>
          <a
            href="/dashboard/settings"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mb-2">
              <ProfileIcon />
            </div>
            <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600">
              System Settings
            </span>
          </a>
          <a
            href="/dashboard/stats"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-2">
              <ChartIcon />
            </div>
            <span className="text-sm font-medium text-gray-900 group-hover:text-orange-600">
              Analytics
            </span>
          </a>
        </div>
      </div>
    );
  };

  const renderQuickActions = () => {
    if (user?.role === 'admin') return null;
    
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {provider?.slug && (
            <>
              <a
                href={`/provider/${provider.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-2">
                  <EyeIcon />
                </div>
                <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                  View Public Page
                </span>
              </a>
              <a
                href={`/provider/${provider.slug}?edit=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-2">
                  <EditIcon />
                </div>
                <span className="text-sm font-medium text-gray-900 group-hover:text-orange-600">
                  Edit Public Page
                </span>
              </a>
            </>
          )}
          <a
            href="/dashboard/services"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mb-2">
              <PlusIcon />
            </div>
            <span className="text-sm font-medium text-gray-900 group-hover:text-purple-600">
              Add Service
            </span>
          </a>
          <a
            href="/dashboard/staff"
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-8 h-8 text-gray-400 group-hover:text-green-500 mb-2">
              <PlusIcon />
            </div>
            <span className="text-sm font-medium text-gray-900 group-hover:text-green-600">
              Add Staff Member
            </span>
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          {user?.role === 'admin' 
            ? 'System overview and key metrics' 
            : 'Welcome back! Here\'s your business overview'
          }
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      {/* Statistics */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Overview</h2>
        {user?.role === 'admin' ? renderAdminStats() : renderProviderStats()}
      </div>

      {/* Quick Actions */}
      {renderAdminQuickActions()}
      {renderQuickActions()}

      {/* Admin Alerts */}
      {user?.role === 'admin' && adminStats && (
        <div className="space-y-4">
          {adminStats.providers.pending > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>{adminStats.providers.pending} provider{adminStats.providers.pending !== 1 ? 's' : ''} pending approval.</strong> 
                    <a href="/dashboard/providers" className="ml-2 font-medium underline text-yellow-700 hover:text-yellow-600">
                      Review now
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {adminStats.providers.frozen > 0 && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>{adminStats.providers.frozen} provider{adminStats.providers.frozen !== 1 ? 's' : ''} account{adminStats.providers.frozen !== 1 ? 's are' : ' is'} frozen.</strong>
                    <a href="/dashboard/providers" className="ml-2 font-medium underline text-red-700 hover:text-red-600">
                      Manage accounts
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {adminStats.messages.new > 5 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    <strong>High message volume:</strong> {adminStats.messages.new} new messages today.
                    <a href="/dashboard/messages" className="ml-2 font-medium underline text-blue-700 hover:text-blue-600">
                      View messages
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        {user?.role === 'provider' && (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
              <a href="/dashboard/messages" className="text-sm text-blue-600 hover:text-blue-500">
                View all
              </a>
            </div>
            {recentMessages.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.map((message, index) => (
                  <div key={message.id || index} className="border-l-4 border-blue-400 pl-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {message.sender_name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {message.subject || 'No subject'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(message.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto text-gray-300 mb-4">
                  <MessageIcon />
                </div>
                <p className="text-sm text-gray-500">No messages yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Messages from potential clients will appear here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Account Status */}
        {user?.role === 'provider' && provider && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Verification</p>
                  <p className="text-xs text-gray-500">
                    {provider.status === 'approved' ? 'Your account is verified' :
                     provider.status === 'pending' ? 'Pending admin approval' : 
                     'Account needs verification'}
                  </p>
                </div>
                <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  provider.status === 'approved' ? 'bg-green-100 text-green-800' :
                  provider.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {provider.status}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Subscription</p>
                  <p className="text-xs text-gray-500">
                    {provider.subscription_status === 'trial' ? `Free trial (${Math.ceil((new Date(provider.trial_expires_at || '').getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left)` :
                     provider.subscription_status === 'active' ? 'Pro plan active' :
                     'Inactive subscription'}
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

              {provider.profile_completeness_score < 80 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm font-medium text-orange-800">Complete Your Profile</p>
                  <p className="text-xs text-orange-600 mt-1">
                    Your profile is {provider.profile_completeness_score}% complete. 
                    Add more information to attract more clients.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Admin Quick Stats */}
        {user?.role === 'admin' && adminStats && (
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{adminStats.providers.approved}</p>
                <p className="text-xs text-blue-600">Active Providers</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">{adminStats.providers.pending}</p>
                <p className="text-xs text-yellow-600">Pending Review</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{adminStats.messages.last_week}</p>
                <p className="text-xs text-green-600">Messages This Week</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{adminStats.providers.trial}</p>
                <p className="text-xs text-purple-600">Trial Accounts</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;