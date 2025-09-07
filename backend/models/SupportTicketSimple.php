<?php

class SupportTicketSimple {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Get list of tickets for a user
     */
    public function getList($filters = [], $userId = null, $userRole = 'provider') {
        $conditions = [];
        $params = [];
        
        // Base query - simplified for existing table structure
        $query = "SELECT 
            id, ticket_number, user_email, user_name, subject, message,
            status, priority, category, created_at, updated_at, resolved_at,
            provider_id
        FROM support_tickets";
        
        // Add user filtering
        if ($userId && $userRole === 'provider') {
            $conditions[] = "provider_id = ?";
            $params[] = $userId;
        }
        
        // Add status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $conditions[] = "status = ?";
            $params[] = $filters['status'];
        }
        
        // Add priority filter
        if (!empty($filters['priority']) && $filters['priority'] !== 'all') {
            $conditions[] = "priority = ?";
            $params[] = $filters['priority'];
        }
        
        // Add search filter
        if (!empty($filters['search'])) {
            $conditions[] = "(subject LIKE ? OR message LIKE ? OR user_email LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }
        
        if (!empty($conditions)) {
            $query .= " WHERE " . implode(' AND ', $conditions);
        }
        
        $query .= " ORDER BY created_at DESC";
        
        // Add pagination
        if (!empty($filters['limit'])) {
            $query .= " LIMIT " . intval($filters['limit']);
            if (!empty($filters['offset'])) {
                $query .= " OFFSET " . intval($filters['offset']);
            }
        }
        
        try {
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error fetching tickets: " . $e->getMessage());
            return [];
        }
    }

    /**
     * Get statistics
     */
    public function getStatistics($userId = null, $userRole = 'provider') {
        $conditions = [];
        $params = [];
        
        if ($userId && $userRole === 'provider') {
            $conditions[] = "provider_id = ?";
            $params[] = $userId;
        }
        
        $whereClause = !empty($conditions) ? 'WHERE ' . implode(' AND ', $conditions) : '';
        
        $query = "SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
            SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
            SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent,
            SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high
        FROM support_tickets $whereClause";
        
        try {
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error fetching statistics: " . $e->getMessage());
            return [
                'total' => 0, 'open' => 0, 'pending' => 0, 
                'resolved' => 0, 'closed' => 0, 'urgent' => 0, 'high' => 0
            ];
        }
    }

    /**
     * Get single ticket by ID
     */
    public function getById($ticketId, $userId = null, $userRole = 'provider') {
        $conditions = ["id = ?"];
        $params = [$ticketId];
        
        if ($userId && $userRole === 'provider') {
            $conditions[] = "provider_id = ?";
            $params[] = $userId;
        }
        
        $query = "SELECT * FROM support_tickets WHERE " . implode(' AND ', $conditions);
        
        try {
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            return $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            error_log("Error fetching ticket: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Create new ticket
     */
    public function create($data) {
        $ticketNumber = $this->generateTicketNumber();
        
        $query = "INSERT INTO support_tickets (
            ticket_number, provider_id, user_email, user_name, 
            subject, message, priority, category, status,
            ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, NOW())";
        
        try {
            $stmt = $this->db->prepare($query);
            $result = $stmt->execute([
                $ticketNumber,
                $data['provider_id'] ?? null,
                $data['user_email'],
                $data['user_name'] ?? null,
                $data['subject'],
                $data['message'],
                $data['priority'] ?? 'medium',
                $data['category'] ?? 'general_inquiry',
                $data['ip_address'] ?? null,
                $data['user_agent'] ?? null
            ]);
            
            if ($result) {
                return [
                    'success' => true,
                    'ticket_id' => $this->db->lastInsertId(),
                    'ticket_number' => $ticketNumber
                ];
            }
            
            return ['success' => false, 'error' => 'Failed to create ticket'];
        } catch (Exception $e) {
            error_log("Error creating ticket: " . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Generate unique ticket number
     */
    private function generateTicketNumber() {
        $date = date('Ymd');
        
        // Get last ticket number for today
        $query = "SELECT ticket_number FROM support_tickets 
                 WHERE ticket_number LIKE ? 
                 ORDER BY ticket_number DESC LIMIT 1";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute(["TKT-{$date}-%"]);
        $lastTicket = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($lastTicket) {
            $parts = explode('-', $lastTicket['ticket_number']);
            $sequence = intval($parts[2] ?? 0) + 1;
        } else {
            $sequence = 1;
        }
        
        return sprintf("TKT-%s-%04d", $date, $sequence);
    }
}