<?php

class SupportTicket {
    private $db;
    private $schemaAdapter;

    public function __construct($database) {
        $this->db = $database;
        $this->schemaAdapter = SchemaAdapter::getInstance($database);
    }

    /**
     * Create a new support ticket
     */
    public function create($data) {
        $ticketNumber = $this->generateTicketNumber();
        
        $query = "INSERT INTO support_tickets (
            ticket_number, user_id, provider_id, user_email, user_name, 
            subject, message, priority, category, ip_address, user_agent,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([
            $ticketNumber,
            $data['user_id'],
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

        if ($success) {
            $ticketId = $this->db->lastInsertId();
            
            // Log activity
            $this->logActivity($ticketId, $data['user_id'], 'user', 'created', 
                "Ticket created: {$data['subject']}", null, null, $data);
            
            return [
                'success' => true,
                'ticket_id' => $ticketId,
                'ticket_number' => $ticketNumber
            ];
        }
        
        return ['success' => false, 'error' => 'Failed to create ticket'];
    }

    /**
     * Get ticket by ID with full details
     */
    public function getById($ticketId, $userId = null, $userRole = null) {
        $query = "SELECT t.*, 
                         u.email as creator_email, u.role as creator_role,
                         p.business_name as provider_name";
        
        // Only add assigned admin join if column exists
        if ($this->schemaAdapter->getCapabilities()['columns']['support_tickets_assigned_to'] ?? false) {
            $query .= ", a.email as assigned_admin_email";
        } else {
            $query .= ", NULL as assigned_admin_email";
        }
        
        $query .= " FROM support_tickets t
                   LEFT JOIN users u ON t.user_id = u.id
                   LEFT JOIN providers p ON t.provider_id = p.id";
        
        // Only add assigned admin join if column exists
        if ($this->schemaAdapter->getCapabilities()['columns']['support_tickets_assigned_to'] ?? false) {
            $query .= " LEFT JOIN users a ON t.assigned_to = a.id";
        }
        
        $query .= " WHERE t.id = ?";
        
        // Add access control
        if ($userRole === 'provider' && $userId) {
            $query .= " AND (t.user_id = ? OR t.provider_id = (SELECT id FROM providers WHERE user_id = ?))";
        } elseif ($userRole !== 'admin' && $userId) {
            $query .= " AND t.user_id = ?";
        }

        $stmt = $this->db->prepare($query);
        
        if ($userRole === 'provider' && $userId) {
            $stmt->execute([$ticketId, $userId, $userId]);
        } elseif ($userRole !== 'admin' && $userId) {
            $stmt->execute([$ticketId, $userId]);
        } else {
            $stmt->execute([$ticketId]);
        }

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get tickets list with filtering and pagination
     */
    public function getList($filters = [], $userId = null, $userRole = null) {
        $conditions = ['1=1'];
        $params = [];

        // Base query with conditional joins based on schema
        $responseTable = $this->schemaAdapter->getResponseTable();
        
        $query = "SELECT t.*, 
                         u.email as creator_email,
                         p.business_name as provider_name";
        
        // Only add assigned admin if column exists
        if ($this->schemaAdapter->getCapabilities()['columns']['support_tickets_assigned_to'] ?? false) {
            $query .= ", a.email as assigned_admin_email";
        } else {
            $query .= ", NULL as assigned_admin_email";
        }
        
        // Add response count if table exists
        if ($responseTable) {
            $query .= ", (SELECT COUNT(*) FROM {$responseTable} r WHERE r.ticket_id = t.id) as response_count,
                         (SELECT MAX(r.created_at) FROM {$responseTable} r WHERE r.ticket_id = t.id) as last_response_at";
        } else {
            $query .= ", 0 as response_count, NULL as last_response_at";
        }
        
        $query .= " FROM support_tickets t
                   LEFT JOIN users u ON t.user_id = u.id
                   LEFT JOIN providers p ON t.provider_id = p.id";
        
        // Only add assigned admin join if column exists
        if ($this->schemaAdapter->getCapabilities()['columns']['support_tickets_assigned_to'] ?? false) {
            $query .= " LEFT JOIN users a ON t.assigned_to = a.id";
        }

        // Apply access control
        if ($userRole === 'provider' && $userId) {
            // Provider can see tickets they created or tickets for their business
            $conditions[] = "(t.user_id = ? OR t.provider_id = (SELECT id FROM providers WHERE user_id = ?))";
            $params[] = $userId;
            $params[] = $userId;
        } elseif ($userRole !== 'admin' && $userId) {
            // Regular users can only see their own tickets
            $conditions[] = "t.user_id = ?";
            $params[] = $userId;
        }

        // Apply filters
        if (!empty($filters['status'])) {
            $conditions[] = "t.status = ?";
            $params[] = $filters['status'];
        }

        if (!empty($filters['priority'])) {
            $conditions[] = "t.priority = ?";
            $params[] = $filters['priority'];
        }

        if (!empty($filters['category'])) {
            $conditions[] = "t.category = ?";
            $params[] = $filters['category'];
        }

        if (!empty($filters['assigned_to'])) {
            $conditions[] = "t.assigned_to = ?";
            $params[] = $filters['assigned_to'];
        }

        if (!empty($filters['search'])) {
            $conditions[] = "(t.subject LIKE ? OR t.message LIKE ? OR t.ticket_number LIKE ?)";
            $searchTerm = '%' . $filters['search'] . '%';
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $query .= " WHERE " . implode(' AND ', $conditions);
        $query .= " ORDER BY t.created_at DESC";

        // Add pagination
        $limit = $filters['limit'] ?? 50;
        $offset = (($filters['page'] ?? 1) - 1) * $limit;
        $query .= " LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;

        $stmt = $this->db->prepare($query);
        $result = $stmt->execute($params);
        
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return $tickets;
    }

    /**
     * Update ticket status
     */
    public function updateStatus($ticketId, $newStatus, $userId, $userType, $notes = null) {
        // Get current status
        $currentTicket = $this->getById($ticketId);
        if (!$currentTicket) {
            return ['success' => false, 'error' => 'Ticket not found'];
        }

        $oldStatus = $currentTicket['status'];
        if ($oldStatus === $newStatus) {
            return ['success' => false, 'error' => 'Status unchanged'];
        }

        // Update the ticket
        $updateFields = ['status = ?', 'updated_at = NOW()'];
        $params = [$newStatus];

        // Set resolution/closure timestamps
        if ($newStatus === 'resolved') {
            $updateFields[] = 'resolved_at = NOW()';
        } elseif ($newStatus === 'closed') {
            $updateFields[] = 'closed_at = NOW()';
            // Calculate resolution time if not already calculated
            if (!$currentTicket['actual_resolution_time'] && $currentTicket['created_at']) {
                $updateFields[] = 'actual_resolution_time = TIMESTAMPDIFF(MINUTE, created_at, NOW())';
            }
        }

        $query = "UPDATE support_tickets SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $params[] = $ticketId;

        $stmt = $this->db->prepare($query);
        $success = $stmt->execute($params);

        if ($success) {
            // Log activity
            $description = "Status changed from '{$oldStatus}' to '{$newStatus}'";
            if ($notes) {
                $description .= ": {$notes}";
            }
            
            $this->logActivity($ticketId, $userId, $userType, 'status_changed', 
                $description, $oldStatus, $newStatus);

            return ['success' => true];
        }

        return ['success' => false, 'error' => 'Failed to update status'];
    }

    /**
     * Assign ticket to admin
     */
    public function assignTicket($ticketId, $adminId, $assignedBy, $assignedByType) {
        $query = "UPDATE support_tickets SET assigned_to = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([$adminId, $ticketId]);

        if ($success) {
            // Get admin name for activity log
            $adminQuery = "SELECT email FROM users WHERE id = ?";
            $adminStmt = $this->db->prepare($adminQuery);
            $adminStmt->execute([$adminId]);
            $admin = $adminStmt->fetch(PDO::FETCH_ASSOC);
            
            $this->logActivity($ticketId, $assignedBy, $assignedByType, 'assigned', 
                "Ticket assigned to {$admin['email']}", null, $adminId);

            return ['success' => true];
        }

        return ['success' => false, 'error' => 'Failed to assign ticket'];
    }

    /**
     * Get ticket statistics
     */
    public function getStatistics($userId = null, $userRole = null) {
        $conditions = ['1=1'];
        $params = [];

        // Apply access control for statistics
        if ($userRole === 'provider' && $userId) {
            $conditions[] = "(user_id = ? OR provider_id = (SELECT id FROM providers WHERE user_id = ?))";
            $params[] = $userId;
            $params[] = $userId;
        } elseif ($userRole !== 'admin' && $userId) {
            $conditions[] = "user_id = ?";
            $params[] = $userId;
        }

        $whereClause = implode(' AND ', $conditions);

        try {
            $query = $this->schemaAdapter->getStatisticsQuery($whereClause);
            $stmt = $this->db->prepare($query);
            $stmt->execute($params);
            
            $stats = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Convert averages to more readable format if available
            if (isset($stats['avg_resolution_time_minutes']) && $stats['avg_resolution_time_minutes']) {
                $stats['avg_resolution_time_hours'] = round($stats['avg_resolution_time_minutes'] / 60, 2);
            }
            
            if (isset($stats['avg_satisfaction_rating']) && $stats['avg_satisfaction_rating']) {
                $stats['avg_satisfaction_rating'] = round($stats['avg_satisfaction_rating'], 1);
            }
            
        } catch (Exception $e) {
            error_log("Statistics query failed: " . $e->getMessage());
            $stats = $this->schemaAdapter->getDefaultStatistics();
        }

        return $stats;
    }

    /**
     * Generate unique ticket number
     */
    private function generateTicketNumber() {
        $date = date('Ymd');
        $counter = 1;
        
        // Get the highest counter for today
        $query = "SELECT MAX(CAST(SUBSTRING(ticket_number, -4) AS UNSIGNED)) as max_counter 
                  FROM support_tickets 
                  WHERE ticket_number LIKE ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute(["TKT-{$date}-%"]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result && $result['max_counter']) {
            $counter = $result['max_counter'] + 1;
        }
        
        return sprintf("TKT-%s-%04d", $date, $counter);
    }

    /**
     * Log ticket activity
     */
    private function logActivity($ticketId, $userId, $userType, $activityType, $description, $oldValue = null, $newValue = null, $metadata = null) {
        $query = "INSERT INTO support_ticket_activity (
            ticket_id, user_id, user_type, activity_type, description, 
            old_value, new_value, metadata, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $ticketId,
            $userId,
            $userType,
            $activityType,
            $description,
            $oldValue,
            $newValue,
            $metadata ? json_encode($metadata) : null,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    }

    /**
     * Get ticket activity history
     */
    public function getActivity($ticketId) {
        $query = "SELECT a.*, u.email as user_email 
                  FROM support_ticket_activity a
                  LEFT JOIN users u ON a.user_id = u.id
                  WHERE a.ticket_id = ?
                  ORDER BY a.created_at DESC";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$ticketId]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}