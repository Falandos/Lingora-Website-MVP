import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

interface Ticket {
  id: number;
  ticket_number: string;
  user_email: string;
  user_name: string | null;
  subject: string;
  message: string;
  status: 'new' | 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string | null;
  response_count: number;
  last_response_at: string | null;
  created_at: string;
  updated_at: string;
  provider_id?: number;
  provider_name?: string;
}

interface TicketStats {
  total_tickets: number;
  new_tickets: number;
  open_tickets: number;
  in_progress_tickets: number;
  pending_tickets: number;
  resolved_tickets: number;
  closed_tickets: number;
  urgent_tickets: number;
  high_priority_tickets: number;
}

interface ProviderGroup {
  provider_id: number | null;
  provider_name: string;
  tickets: Ticket[];
  stats: {
    total: number;
    new: number;
    urgent: number;
    high: number;
  };
}

interface AdminTicketListProps {
  onTicketSelect: (ticket: Ticket) => void;
}

export const AdminTicketList: React.FC<AdminTicketListProps> = ({ onTicketSelect }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [providerGroups, setProviderGroups] = useState<ProviderGroup[]>([]);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Group expansion state
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grouped' | 'list'>('grouped');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const url = new URL('/api/support/list', 'http://localhost:8000');
      
      // Apply filters
      if (statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter);
      }
      if (priorityFilter !== 'all') {
        url.searchParams.set('priority', priorityFilter);
      }
      if (searchQuery.trim()) {
        url.searchParams.set('search', searchQuery.trim());
      }
      url.searchParams.set('limit', '200'); // Get more tickets for grouping
      
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
      if (data.success) {
        const fetchedTickets = data.data?.tickets || [];
        setTickets(fetchedTickets);
        setStats(data.data?.statistics || null);
        
        // Group tickets by provider
        groupTicketsByProvider(fetchedTickets);
      } else {
        throw new Error(data.error || 'Failed to load tickets');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tickets');
      setTickets([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const groupTicketsByProvider = (tickets: Ticket[]) => {
    const groups: { [key: string]: ProviderGroup } = {};

    tickets.forEach(ticket => {
      const key = ticket.provider_id?.toString() || 'no_provider';
      const providerName = ticket.provider_name || 'Direct Contact';

      if (!groups[key]) {
        groups[key] = {
          provider_id: ticket.provider_id || null,
          provider_name: providerName,
          tickets: [],
          stats: { total: 0, new: 0, urgent: 0, high: 0 }
        };
      }

      groups[key].tickets.push(ticket);
      groups[key].stats.total++;
      if (ticket.status === 'new') groups[key].stats.new++;
      if (ticket.priority === 'urgent') groups[key].stats.urgent++;
      if (ticket.priority === 'high') groups[key].stats.high++;
    });

    // Sort groups by urgency (urgent tickets first, then by total)
    const sortedGroups = Object.values(groups).sort((a, b) => {
      const aUrgency = a.stats.urgent + a.stats.high;
      const bUrgency = b.stats.urgent + b.stats.high;
      if (aUrgency !== bUrgency) return bUrgency - aUrgency;
      return b.stats.total - a.stats.total;
    });

    // Sort tickets within each group by priority and creation date
    sortedGroups.forEach(group => {
      group.tickets.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority] || 1;
        const bPriority = priorityOrder[b.priority] || 1;
        
        if (aPriority !== bPriority) return bPriority - aPriority;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    });

    setProviderGroups(sortedGroups);
    
    // Auto-expand groups with urgent tickets
    const urgentGroups = sortedGroups
      .filter(group => group.stats.urgent > 0)
      .map(group => `provider_${group.provider_id || 'no_provider'}`);
    setExpandedGroups(new Set(urgentGroups));
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, searchQuery]);

  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const expandAllGroups = () => {
    const allGroupIds = providerGroups.map(group => `provider_${group.provider_id || 'no_provider'}`);
    setExpandedGroups(new Set(allGroupIds));
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  const handleFilterChange = (filterType: 'status' | 'priority', value: string) => {
    if (filterType === 'status') {
      setStatusFilter(value);
    } else {
      setPriorityFilter(value);
    }
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityBadgeColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
          <ExclamationTriangleIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={fetchTickets} 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Try Again</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Statistics */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900">{stats.total_tickets}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.new_tickets}</div>
            <div className="text-sm text-gray-500">New</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats.in_progress_tickets}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.pending_tickets}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.resolved_tickets}</div>
            <div className="text-sm text-gray-500">Resolved</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats.urgent_tickets + stats.high_priority_tickets}</div>
            <div className="text-sm text-gray-500">High Priority</div>
          </div>
        </div>
      )}

      {/* Admin Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <form onSubmit={(e) => e.preventDefault()} className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets, providers..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </form>
          </div>

          {/* Admin Controls */}
          <div className="flex items-center space-x-2">
            {viewMode === 'grouped' && (
              <>
                <Button
                  onClick={expandAllGroups}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 text-sm"
                >
                  Expand All
                </Button>
                <Button
                  onClick={collapseAllGroups}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 text-sm"
                >
                  Collapse All
                </Button>
              </>
            )}
            <Button
              onClick={() => setViewMode(viewMode === 'grouped' ? 'list' : 'grouped')}
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 text-sm"
            >
              {viewMode === 'grouped' ? 'List View' : 'Group View'}
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 flex items-center space-x-2"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </Button>
            <Button
              onClick={fetchTickets}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 flex items-center space-x-2"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="new">New</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ticket Display */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BuildingOfficeIcon className="w-5 h-5 mr-2" />
            Support Tickets - Admin View
            {tickets.length > 0 && ` (${tickets.length} tickets)`}
          </h3>
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
            </div>
          ) : viewMode === 'grouped' ? (
            <div className="space-y-2">
              {providerGroups.map((group) => {
                const groupId = `provider_${group.provider_id || 'no_provider'}`;
                const isExpanded = expandedGroups.has(groupId);
                
                return (
                  <div key={groupId} className="border-b border-gray-100 last:border-b-0">
                    {/* Provider Header */}
                    <div
                      className="px-6 py-4 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                      onClick={() => toggleGroupExpansion(groupId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {isExpanded ? (
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                          )}
                          <div className="flex items-center space-x-2">
                            <BuildingOfficeIcon className="w-5 h-5 text-gray-600" />
                            <h4 className="text-lg font-medium text-gray-900">
                              {group.provider_name}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {group.stats.urgent > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {group.stats.urgent} urgent
                            </span>
                          )}
                          {group.stats.high > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              {group.stats.high} high
                            </span>
                          )}
                          {group.stats.new > 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {group.stats.new} new
                            </span>
                          )}
                          <span className="text-sm text-gray-500">
                            {group.stats.total} ticket{group.stats.total !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Provider Tickets */}
                    {isExpanded && (
                      <div className="divide-y divide-gray-100">
                        {group.tickets.map((ticket) => (
                          <div
                            key={ticket.id}
                            className="px-8 py-4 hover:bg-blue-50 cursor-pointer transition-colors"
                            onClick={() => onTicketSelect(ticket)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0 space-y-2">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-sm font-medium text-blue-600">
                                      #{ticket.ticket_number}
                                    </span>
                                    <div className="flex space-x-2">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(ticket.status)}`}>
                                        {ticket.status}
                                      </span>
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(ticket.priority)}`}>
                                        {ticket.priority}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {formatDate(ticket.created_at)}
                                  </div>
                                </div>

                                {/* Content */}
                                <div>
                                  <h5 className="text-base font-medium text-gray-900 truncate">
                                    {ticket.subject}
                                  </h5>
                                  <p className="text-sm text-gray-600 mt-1">
                                    From: <span className="font-medium">{ticket.user_name || ticket.user_email}</span>
                                    {ticket.category && (
                                      <span className="ml-3">Category: <span className="font-medium">{ticket.category}</span></span>
                                    )}
                                  </p>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between text-sm text-gray-500">
                                  <div className="flex items-center space-x-4">
                                    {ticket.response_count > 0 && (
                                      <div className="flex items-center space-x-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <span>{ticket.response_count} response{ticket.response_count !== 1 ? 's' : ''}</span>
                                      </div>
                                    )}
                                    {ticket.last_response_at && (
                                      <div>Last activity: {formatDate(ticket.last_response_at)}</div>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Updated {formatDate(ticket.updated_at)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onTicketSelect(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-blue-600">
                            #{ticket.ticket_number}
                          </span>
                          <div className="flex space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(ticket.status)}`}>
                              {ticket.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(ticket.priority)}`}>
                              {ticket.priority}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap ml-4">
                          {formatDate(ticket.created_at)}
                        </div>
                      </div>

                      {/* Subject and Details */}
                      <div>
                        <h4 className="text-base font-medium text-gray-900 truncate">
                          {ticket.subject}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          From: <span className="font-medium">{ticket.user_name || ticket.user_email}</span>
                          {ticket.provider_name && (
                            <span className="ml-3">Provider: <span className="font-medium">{ticket.provider_name}</span></span>
                          )}
                          {ticket.category && (
                            <span className="ml-3">Category: <span className="font-medium">{ticket.category}</span></span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {ticket.message}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          {ticket.response_count > 0 && (
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                              </svg>
                              <span>{ticket.response_count} response{ticket.response_count !== 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {ticket.last_response_at && (
                            <div>
                              Last activity: {formatDate(ticket.last_response_at)}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          Updated {formatDate(ticket.updated_at)}
                        </div>
                      </div>
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

export default AdminTicketList;