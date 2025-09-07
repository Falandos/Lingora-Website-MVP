import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { 
  ArrowLeftIcon, 
  PaperClipIcon, 
  DocumentIcon,
  PhotoIcon,
  ArrowDownTrayIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

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
}

interface TicketResponse {
  id: number;
  responder_type: 'user' | 'provider' | 'admin';
  responder_email: string;
  responder_name: string | null;
  message: string;
  is_internal: boolean;
  created_at: string;
  attachments?: TicketAttachment[];
}

interface TicketAttachment {
  id: number;
  original_filename: string;
  file_size: number;
  file_type: string;
  is_image: boolean;
  thumbnail_path?: string;
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
  const [ticketData, setTicketData] = useState<any>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseFiles, setResponseFiles] = useState<FileList | null>(null);
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
      if (data.success) {
        setTicketData(data.data.ticket);
        setResponses(data.data.responses || []);
        setAttachments(data.data.attachments || []);
      } else {
        throw new Error(data.error || 'Failed to load ticket details');
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
      const formData = new FormData();
      formData.append('ticket_id', ticket.id.toString());
      formData.append('message', responseMessage.trim());

      // Add files if any
      if (responseFiles) {
        for (let i = 0; i < responseFiles.length; i++) {
          formData.append(`file_${i}`, responseFiles[i]);
        }
      }

      const response = await fetch('http://localhost:8000/api/support/respond', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Refresh the ticket details
        await fetchTicketDetail();
        setResponseMessage('');
        setResponseFiles(null);
        // Reset file input
        const fileInput = document.getElementById('response-files') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        throw new Error(result.error || 'Failed to add response');
      }

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

      const result = await response.json();

      if (response.ok && result.success) {
        // Update the ticket status
        const updatedTicket = { ...ticket, status: newStatus as any };
        onTicketUpdated(updatedTicket);
        
        // Refresh ticket details
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

  const handleFileDownload = async (attachmentId: number, filename: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/support/download?attachment_id=${attachmentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to download file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download file');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  const getResponderBadgeColor = (type: string) => {
    switch (type) {
      case 'provider': return 'bg-blue-100 text-blue-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={onBack}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 flex items-center space-x-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Tickets</span>
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
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <UserIcon className="w-5 h-5 mr-2" />
              Customer Information
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Name:</strong> {ticket.user_name || 'Not provided'}</div>
              <div><strong>Email:</strong> {ticket.user_email}</div>
              <div><strong>Category:</strong> {ticket.category || 'General'}</div>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <ClockIcon className="w-5 h-5 mr-2" />
              Ticket Details
            </h3>
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
          <div className="flex flex-wrap gap-2">
            {['new', 'open', 'in_progress', 'pending', 'resolved', 'closed'].map((status) => (
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
                {isUpdatingStatus ? 'Updating...' : `Mark ${status.replace('_', ' ')}`}
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
          <p className="text-gray-700 whitespace-pre-wrap mb-3">{ticket.message}</p>
          
          {/* Original attachments */}
          {attachments.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h5>
              <div className="space-y-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between bg-white p-2 rounded border"
                  >
                    <div className="flex items-center space-x-2">
                      {attachment.is_image ? (
                        <PhotoIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <DocumentIcon className="w-5 h-5 text-blue-500" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {attachment.original_filename}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatFileSize(attachment.file_size)}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleFileDownload(attachment.id, attachment.original_filename)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
        
        {responses.length === 0 ? (
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
                
                {/* Response attachments */}
                {response.attachments && response.attachments.length > 0 && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="text-sm text-gray-600 space-y-2">
                      {response.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            {attachment.is_image ? (
                              <PhotoIcon className="w-4 h-4 text-green-500" />
                            ) : (
                              <DocumentIcon className="w-4 h-4 text-blue-500" />
                            )}
                            <span className="text-sm">{attachment.original_filename}</span>
                          </div>
                          <Button
                            onClick={() => handleFileDownload(attachment.id, attachment.original_filename)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1 text-xs"
                          >
                            <ArrowDownTrayIcon className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attach Files (Optional)
            </label>
            <div className="flex items-center space-x-2">
              <input
                id="response-files"
                type="file"
                multiple
                onChange={(e) => setResponseFiles(e.target.files)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip"
              />
            </div>
            {responseFiles && responseFiles.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {Array.from(responseFiles).map(f => f.name).join(', ')}
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Your response will be sent to {ticket.user_email}
            </div>
            <Button
              type="submit"
              disabled={isResponding || !responseMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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