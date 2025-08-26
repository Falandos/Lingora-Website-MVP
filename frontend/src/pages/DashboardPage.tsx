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

const SettingsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="mt-1 text-sm text-gray-600">Manage system settings and configuration.</p>
    </div>
    <div className="bg-white shadow rounded-lg p-6">
      <div className="text-gray-600 text-sm">
        Settings page coming soon...
      </div>
    </div>
  </div>
);



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