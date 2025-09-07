import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { 
  ArrowLeftIcon, 
  PencilIcon,
  UserIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
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
  created_at: string;
  updated_at: string;
  provider_id?: number;
  provider_name?: string;
}

interface AdminNote {
  id: number;
  note_text: string;
  note_type: string;
  admin_name: string;
  created_at: string;
  context_type: 'provider' | 'ticket';
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

interface AdminTicketDetailProps {
  ticket: Ticket;
  onBack: () => void;
  onTicketUpdated: (updatedTicket: Ticket) => void;
}

export const AdminTicketDetail: React.FC<AdminTicketDetailProps> = ({ 
  ticket, 
  onBack, 
  onTicketUpdated 
}) => {
  const { user } = useAuth();
  const [ticketData, setTicketData] = useState<any>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [adminNotes, setAdminNotes] = useState<AdminNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [isResponding, setIsResponding] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const fetchTicketDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      // Fetch ticket details and admin notes in parallel
      const [ticketResponse, notesResponse] = await Promise.all([
        fetch(`http://localhost:8000/api/support/detail?id=${ticket.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`http://localhost:8000/api/admin/notes/ticket/${ticket.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!ticketResponse.ok) {
        throw new Error('Failed to fetch ticket details');
      }

      const ticketData = await ticketResponse.json();
      if (ticketData.success) {
        setTicketData(ticketData.data.ticket);
        setResponses(ticketData.data.responses || []);
      } else {
        throw new Error(ticketData.error || 'Failed to load ticket details');
      }

      // Load admin notes if API call succeeded
      if (notesResponse.ok) {
        const notesData = await notesResponse.json();
        if (notesData.success) {
          setAdminNotes(notesData.notes || []);
        }
      }
      
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
          is_internal: false // Admin responses are visible to providers
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await fetchTicketDetail();
        setResponseMessage('');
      } else {
        throw new Error(result.error || 'Failed to add response');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add response');
    } finally {
      setIsResponding(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) {
      return;
    }

    setIsAddingNote(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/admin/notes/ticket/${ticket.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          note_text: newNote.trim(),
          note_type: noteType
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        await fetchTicketDetail(); // Reload notes
        setNewNote('');
        setShowNoteForm(false);
        setNoteType('general');
      } else {
        throw new Error(result.error || 'Failed to add admin note');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add admin note');
    } finally {
      setIsAddingNote(false);
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

      const result = await response.json();

      if (response.ok && result.success) {
        const updatedTicket = { ...ticket, status: newStatus as any };
        onTicketUpdated(updatedTicket);
        await fetchTicketDetail();
      } else {
        throw new Error(result.error || 'Failed to update status');
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
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

  const getPriorityUpdateColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-600 hover:bg-red-700';
      case 'high': return 'bg-orange-600 hover:bg-orange-700';
      case 'medium': return 'bg-blue-600 hover:bg-blue-700';
      case 'low': return 'bg-gray-600 hover:bg-gray-700';
      default: return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const getStatusActionColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-yellow-600 hover:bg-yellow-700';
      case 'resolved': return 'bg-green-600 hover:bg-green-700';
      case 'pending': return 'bg-orange-600 hover:bg-orange-700';
      case 'closed': return 'bg-gray-600 hover:bg-gray-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
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
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 flex items-center space-x-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Tickets</span>
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Ticket #{ticket.ticket_number}
              </h1>
              {ticket.provider_name && (
                <p className="text-sm text-gray-600 mt-1">
                  Provider: {ticket.provider_name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(ticket.status)}`}>
              {ticket.status}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityBadgeColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="border-t pt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
              <Button
                onClick={() => handleStatusUpdate('in_progress')}
                disabled={isUpdatingStatus || ticket.status === 'in_progress'}
                className={`px-3 py-1 text-sm ${
                  ticket.status === 'in_progress' 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                Start Working
              </Button>
              <Button
                onClick={() => handleStatusUpdate('resolved')}
                disabled={isUpdatingStatus || ticket.status === 'resolved' || ticket.status === 'closed'}
                className={`px-3 py-1 text-sm ${
                  ticket.status === 'resolved' || ticket.status === 'closed'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <CheckCircleIcon className="w-4 h-4 mr-1" />
                Mark Resolved
              </Button>
              <Button
                onClick={() => handleStatusUpdate('pending')}
                disabled={isUpdatingStatus || ticket.status === 'pending'}
                className={`px-3 py-1 text-sm ${
                  ticket.status === 'pending'
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                Need Info
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Ticket Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Original Ticket */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Original Ticket
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{ticket.subject}</h4>
              <p className="text-gray-700 whitespace-pre-wrap mb-3">{ticket.message}</p>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div>From: {ticket.user_name || ticket.user_email}</div>
                <div>{formatDate(ticket.created_at)}</div>
              </div>
            </div>
          </div>

          {/* Conversation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              Conversation ({responses.length} response{responses.length !== 1 ? 's' : ''})
            </h3>
            
            {responses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No responses yet. Be the first to respond!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {responses.map((response, index) => (
                  <div 
                    key={response.id} 
                    className={`p-4 rounded-lg ${
                      response.responder_type === 'admin' 
                        ? 'bg-purple-50 border-l-4 border-purple-400 ml-4' 
                        : 'bg-gray-50 border-l-4 border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {response.responder_name || response.responder_email}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          response.responder_type === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {response.responder_type}
                        </span>
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

            {/* Quick Response Form */}
            <div className="mt-6 pt-6 border-t">
              <form onSubmit={handleAddResponse}>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Type your response to the provider..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                  disabled={isResponding}
                />
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Response will be sent to {ticket.user_email}
                  </div>
                  <Button
                    type="submit"
                    disabled={isResponding || !responseMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 disabled:opacity-50"
                  >
                    {isResponding ? 'Sending...' : 'Send Response'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Admin Panel */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Ticket Information
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Customer:</span>
                <div className="text-gray-900">{ticket.user_name || 'Not provided'}</div>
                <div className="text-gray-600">{ticket.user_email}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Category:</span>
                <div className="text-gray-900">{ticket.category || 'General'}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <div className="text-gray-900">{formatDate(ticket.created_at)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Last Updated:</span>
                <div className="text-gray-900">{formatDate(ticket.updated_at)}</div>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900 flex items-center">
                <PencilIcon className="w-5 h-5 mr-2" />
                Admin Notes ({adminNotes.length})
              </h3>
              <Button
                onClick={() => setShowNoteForm(!showNoteForm)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 text-sm"
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>

            {/* Add Note Form */}
            {showNoteForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <form onSubmit={handleAddNote}>
                  <div className="mb-3">
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="general">General</option>
                      <option value="resolution">Resolution</option>
                      <option value="followup">Follow-up</option>
                      <option value="escalation">Escalation</option>
                    </select>
                  </div>
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add internal admin note..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                    disabled={isAddingNote}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      onClick={() => setShowNoteForm(false)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 text-sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isAddingNote || !newNote.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
                    >
                      {isAddingNote ? 'Adding...' : 'Add Note'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Notes List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {adminNotes.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No admin notes yet.</p>
              ) : (
                adminNotes.map((note) => (
                  <div key={note.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 uppercase">{note.note_type}</span>
                      <span className="text-xs text-gray-500">{formatDate(note.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note_text}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      By {note.admin_name}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 shadow-lg">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketDetail;