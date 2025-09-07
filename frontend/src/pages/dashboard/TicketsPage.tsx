import React, { useState } from 'react';
import TicketList from '../../components/dashboard/TicketList';
import AdminTicketList from '../../components/dashboard/AdminTicketList';
import TicketDetail from '../../components/dashboard/TicketDetail';
import AdminTicketDetail from '../../components/dashboard/AdminTicketDetail';
import CreateTicketModal from '../../components/dashboard/CreateTicketModal';
import { Button } from '../../components/ui/Button';
import { PlusIcon, TicketIcon } from '@heroicons/react/24/outline';
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
}

const TicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const isAdmin = user?.role === 'admin';

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
  };

  const handleBackToList = () => {
    setSelectedTicket(null);
    // Trigger a refresh of the ticket list
    setRefreshKey(prev => prev + 1);
  };

  const handleTicketUpdated = (updatedTicket: Ticket) => {
    setSelectedTicket(updatedTicket);
    // Trigger a refresh of the ticket list
    setRefreshKey(prev => prev + 1);
  };

  const handleCreateTicket = () => {
    setShowCreateModal(true);
  };

  const handleTicketCreated = () => {
    setShowCreateModal(false);
    // Trigger a refresh of the ticket list
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TicketIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isAdmin ? 'Support Center Management' : 'Support Tickets'}
              </h1>
              <p className="text-gray-600 mt-1">
                {selectedTicket 
                  ? `Viewing Ticket #${selectedTicket.ticket_number}`
                  : isAdmin 
                    ? 'Manage provider support requests and inquiries'
                    : 'Manage customer support requests and inquiries'
                }
              </p>
            </div>
          </div>
          
          {!selectedTicket && !isAdmin && (
            <Button
              onClick={handleCreateTicket}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Ticket</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {selectedTicket ? (
        isAdmin ? (
          <AdminTicketDetail 
            ticket={selectedTicket}
            onBack={handleBackToList}
            onTicketUpdated={handleTicketUpdated}
          />
        ) : (
          <TicketDetail 
            ticket={selectedTicket}
            onBack={handleBackToList}
            onTicketUpdated={handleTicketUpdated}
          />
        )
      ) : (
        isAdmin ? (
          <AdminTicketList 
            key={refreshKey}
            onTicketSelect={handleTicketSelect}
          />
        ) : (
          <TicketList 
            key={refreshKey}
            onTicketSelect={handleTicketSelect}
          />
        )
      )}

      {/* Create Ticket Modal - Only for providers */}
      {showCreateModal && !isAdmin && (
        <CreateTicketModal
          onClose={() => setShowCreateModal(false)}
          onTicketCreated={handleTicketCreated}
        />
      )}
    </div>
  );
};

export default TicketsPage;