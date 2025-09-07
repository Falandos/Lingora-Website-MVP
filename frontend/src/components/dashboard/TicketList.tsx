import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface Ticket {
  id: number;
  ticket_number: string;
  user_email: string;
  user_name: string | null;
  subject: string;
  message: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  response_count: number;
  last_response_at: string | null;
  created_at: string;
}

interface TicketStats {
  total_tickets: number;
  open_tickets: number;
  pending_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  urgent_tickets: number;
  high_priority_tickets: number;
}

interface TicketListProps {
  onTicketSelect: (ticket: Ticket) => void;
}

export const TicketList: React.FC<TicketListProps> = ({ onTicketSelect }) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const url = new URL('/api/support/list', 'http://localhost:8000');
      
      if (statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }

      const data = await response.json();
      setTickets(data.tickets || []);
      setStats(data.statistics || null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchTickets} className="bg-blue-600 hover:bg-blue-700 text-white">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{stats.total_tickets}</div>
            <div className="text-sm text-gray-500">Total Tickets</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.open_tickets}</div>
            <div className="text-sm text-gray-500">Open Tickets</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.resolved_tickets}</div>
            <div className="text-sm text-gray-500">Resolved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.urgent_tickets + stats.high_priority_tickets}</div>
            <div className="text-sm text-gray-500">High Priority</div>
          </div>
        </div>
      )}

      {/* Ticket List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Support Tickets</h3>
            <div className="flex space-x-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <Button
                onClick={fetchTickets}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
              >
                Refresh
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500">No tickets found</p>
              <p className="text-sm text-gray-400 mt-1">
                {statusFilter !== 'all' ? `No ${statusFilter} tickets to display.` : 'You have no support tickets yet.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onTicketSelect(ticket)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <span className="text-sm font-medium text-blue-600">
                            #{ticket.ticket_number}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(ticket.status)}`}>
                            {ticket.status}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(ticket.priority)}`}>
                            {ticket.priority}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {ticket.subject}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          From: {ticket.user_name || ticket.user_email}
                        </p>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {ticket.message}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm text-gray-500">
                        {formatDate(ticket.created_at)}
                      </div>
                      {ticket.response_count > 0 && (
                        <div className="text-xs text-blue-600 mt-1">
                          {ticket.response_count} response{ticket.response_count !== 1 ? 's' : ''}
                        </div>
                      )}
                      {ticket.last_response_at && (
                        <div className="text-xs text-gray-400 mt-1">
                          Last: {formatDate(ticket.last_response_at)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketList;