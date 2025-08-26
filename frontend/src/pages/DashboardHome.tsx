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

const DashboardHome = () => {
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [providerStats, setProviderStats] = useState<ProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        if (user?.role === 'admin') {
          const stats = await DashboardService.getAdminStats();
          setAdminStats(stats);
        } else {
          const stats = await DashboardService.getProviderStats();
          setProviderStats(stats);
        }
      } catch (err) {
        setError('Failed to load dashboard statistics');
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const renderAdminStats = () => {
    if (!adminStats) return null;

    return (
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
          color="yellow"
          loading={loading}
        />
        <StatCard
          title="Total Messages"
          value={adminStats.messages.total}
          icon={MessageIcon}
          color="green"
          loading={loading}
        />
        <StatCard
          title="New Messages"
          value={adminStats.messages.new}
          icon={ChartIcon}
          color="purple"
          loading={loading}
        />
      </div>
    );
  };

  const renderProviderStats = () => {
    if (!providerStats) return null;

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
          value={providerStats.messages_count}
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
        <StatCard
          title="Staff Members"
          value={providerStats.staff_count}
          icon={StaffIcon}
          color="yellow"
          loading={loading}
        />
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

      {/* Recent Activity Placeholder */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
        <div className="text-gray-600 text-sm">
          Recent activity feed will be implemented in future subtasks.
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;