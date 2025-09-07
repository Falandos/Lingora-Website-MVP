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
  created_at: string;
  updated_at: string;
}

interface TicketResponse {
  id: number;
  responder_type: 'user' | 'provider' | 'admin';
  responder_email: string;
  responder_name: string | null;
  message: string;
  is_internal: boolean;
  created_at: string;
}

interface TicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  onTicketUpdated: (updatedTicket: Ticket) => void;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ 
  ticket, 
  onBack, 
  onTicketUpdated 
}) => {
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [isResponding, setIsResponding] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/support/detail?id=${ticket.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }

      const data = await response.json();
      setResponses(data.responses || []);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetail();
  }, [ticket.id]);

  const handleAddResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!responseMessage.trim()) {
      return;
    }

    setIsResponding(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/support/respond', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          message: responseMessage.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add response');
      }

      // Refresh the responses
      await fetchTicketDetail();
      setResponseMessage('');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add response');
    } finally {
      setIsResponding(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/support/update-status', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticket_id: ticket.id,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update status');
      }

      // Update the ticket status
      const updatedTicket = { ...ticket, status: newStatus as any };
      onTicketUpdated(updatedTicket);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

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

  const getResponderBadgeColor = (type: string) => {
    switch (type) {
      case 'provider':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2"
            >
              ← Back to Tickets
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">
              Ticket #{ticket.ticket_number}
            </h1>
          </div>
          <div className="flex space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadgeColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
        </div>

        {/* Ticket Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Name:</strong> {ticket.user_name || 'Not provided'}</div>
              <div><strong>Email:</strong> {ticket.user_email}</div>
              <div><strong>Category:</strong> {ticket.category || 'General'}</div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Ticket Details</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Created:</strong> {formatDate(ticket.created_at)}</div>
              <div><strong>Last Updated:</strong> {formatDate(ticket.updated_at)}</div>
              <div><strong>Status:</strong> {ticket.status}</div>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-3">Update Status</h3>
          <div className="flex space-x-2">
            {['open', 'pending', 'resolved', 'closed'].map((status) => (
              <Button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={isUpdatingStatus || ticket.status === status}
                className={`px-4 py-2 text-sm ${
                  ticket.status === status
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isUpdatingStatus ? 'Updating...' : `Mark ${status}`}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Original Message */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-900 mb-4">Original Message</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">{ticket.subject}</h4>
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
          <div className="mt-3 text-sm text-gray-500">
            From {ticket.user_name || ticket.user_email} on {formatDate(ticket.created_at)}
          </div>
        </div>
      </div>

      {/* Responses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-900 mb-4">
          Conversation ({responses.length} response{responses.length !== 1 ? 's' : ''})
        </h3>
        
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : responses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No responses yet. Be the first to respond!</p>
        ) : (
          <div className="space-y-4">
            {responses.map((response) => (
              <div key={response.id} className="border-l-4 border-blue-200 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      {response.responder_name || response.responder_email}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getResponderBadgeColor(response.responder_type)}`}>
                      {response.responder_type}
                    </span>
                    {response.is_internal && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Internal
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(response.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Response */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-medium text-gray-900 mb-4">Add Response</h3>
        
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}
        
        <form onSubmit={handleAddResponse}>
          <div className="mb-4">
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              placeholder="Type your response here..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isResponding}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Your response will be sent to {ticket.user_email}
            </div>
            <Button
              type="submit"
              disabled={isResponding || !responseMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {isResponding ? 'Sending...' : 'Send Response'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketDetail;