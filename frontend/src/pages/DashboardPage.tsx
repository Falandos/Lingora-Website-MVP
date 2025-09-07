import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardHome from './DashboardHome';
import ProvidersPage from './ProvidersPage';
import ProfilePage from './dashboard/ProfilePage';
import ServicesPage from './dashboard/ServicesPage';
import StaffPage from './dashboard/StaffPage';
import Settings from './dashboard/Settings';
import SecuritySettings from './dashboard/SecuritySettings';
import EmailTemplates from './dashboard/EmailTemplates';
import TicketsPage from './dashboard/TicketsPage';

// Import auth context for role checking
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import DataTable, { type Column } from '../components/dashboard/DataTable';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
        setError(t('messages.failed_to_load'));
      }
    } catch (err) {
      setError(t('messages.network_error'));
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
      label: t('messages.sender'),
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
      label: t('messages.to_provider'),
      sortable: true,
      render: (value: string) => value || 'N/A'
    }] : []),
    {
      key: 'subject',
      label: t('messages.subject'),
      sortable: true,
    },
    {
      key: 'created_at',
      label: t('messages.received'),
      sortable: true,
      render: (value: string) => formatDate(value)
    },
    ...(isAdmin ? [{
      key: 'is_read',
      label: t('messages.status'),
      sortable: true,
      render: (value: boolean) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
        }`}>
          {value ? t('messages.read') : t('messages.new')}
        </span>
      )
    }] : [])
  ];

  const actions = [
    {
      label: t('messages.view'),
      onClick: (row: Message) => alert(`From: ${row.sender_name}\n\nMessage:\n${row.message}`),
      variant: 'secondary' as const
    },
    ...(isAdmin ? [{
      label: t('messages.reply'),
      onClick: (row: Message) => window.open(`mailto:${row.sender_email}?subject=Re: ${row.subject}`, '_blank'),
      variant: 'primary' as const
    }] : [])
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdmin ? t('messages.all_messages_title') : t('messages.title')}
        </h1>
        <p className="mt-1 text-gray-600">
          {isAdmin 
            ? `${t('messages.admin_description')} ${messages.filter(m => !m.is_read).length} ${t('messages.unread_messages')}.`
            : t('messages.description')
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
            emptyMessage={loading ? t('messages.loading_messages') : t('messages.no_messages')}
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




const DashboardPage = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route index element={<DashboardHome />} />
        <Route path="providers" element={<ProvidersPage />} />
        <Route path="messages" element={<MessagesPage />} />
        <Route path="email-templates" element={<EmailTemplates />} />
        <Route path="stats" element={<StatsPage />} />
        <Route path="settings" element={<Settings />} />
        <Route path="security" element={<SecuritySettings />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="tickets" element={<TicketsPage />} />
      </Routes>
    </DashboardLayout>
  );
};

export default DashboardPage;