import React, { useState } from 'react';
import TicketList from '../../components/dashboard/TicketList';
import TicketDetail from '../../components/dashboard/TicketDetail';

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

const TicketsPage: React.FC = () => {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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

  return (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Support Tickets
              </h1>
              <p className="text-gray-600 mt-1">
                Manage customer support requests and inquiries
              </p>
            </div>
            {selectedTicket && (
              <div className="text-sm text-gray-500">
                Viewing Ticket #{selectedTicket.ticket_number}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {selectedTicket ? (
          <TicketDetail 
            ticket={selectedTicket}
            onBack={handleBackToList}
            onTicketUpdated={handleTicketUpdated}
          />
        ) : (
          <TicketList 
            key={refreshKey}
            onTicketSelect={handleTicketSelect}
          />
        )}
      </div>
    );
};

export default TicketsPage;