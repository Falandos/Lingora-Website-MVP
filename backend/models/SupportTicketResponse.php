<?php

class SupportTicketResponse {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Add a response to a ticket
     */
    public function create($data) {
        $query = "INSERT INTO support_ticket_responses (
            ticket_id, responder_id, responder_type, responder_email, responder_name,
            message, is_internal, is_auto_response, response_type, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([
            $data['ticket_id'],
            $data['responder_id'] ?? null,
            $data['responder_type'],
            $data['responder_email'],
            $data['responder_name'] ?? null,
            $data['message'],
            $data['is_internal'] ?? false,
            $data['is_auto_response'] ?? false,
            $data['response_type'] ?? 'message',
            isset($data['metadata']) ? json_encode($data['metadata']) : null
        ]);

        if ($success) {
            $responseId = $this->db->lastInsertId();
            
            // Update ticket's updated_at timestamp
            $this->updateTicketTimestamp($data['ticket_id']);
            
            // Log activity if not an internal note
            if (!($data['is_internal'] ?? false)) {
                $this->logTicketActivity($data['ticket_id'], $data['responder_id'], 
                    $data['responder_type'], 'responded', 
                    "New response added by {$data['responder_email']}");
            }

            return [
                'success' => true,
                'response_id' => $responseId
            ];
        }
        
        return ['success' => false, 'error' => 'Failed to add response'];
    }

    /**
     * Get all responses for a ticket
     */
    public function getByTicketId($ticketId, $includeInternal = false) {
        $query = "SELECT r.*, u.email as user_email 
                  FROM support_ticket_responses r
                  LEFT JOIN users u ON r.responder_id = u.id
                  WHERE r.ticket_id = ?";
        
        $params = [$ticketId];
        
        if (!$includeInternal) {
            $query .= " AND r.is_internal = FALSE";
        }
        
        $query .= " ORDER BY r.created_at ASC";

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get response by ID
     */
    public function getById($responseId) {
        $query = "SELECT r.*, u.email as user_email,
                         t.ticket_number, t.subject as ticket_subject
                  FROM support_ticket_responses r
                  LEFT JOIN users u ON r.responder_id = u.id
                  LEFT JOIN support_tickets t ON r.ticket_id = t.id
                  WHERE r.id = ?";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$responseId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Update a response
     */
    public function update($responseId, $data, $updatedBy, $updatedByType) {
        $updateFields = [];
        $params = [];

        if (isset($data['message'])) {
            $updateFields[] = 'message = ?';
            $params[] = $data['message'];
        }

        if (isset($data['is_internal'])) {
            $updateFields[] = 'is_internal = ?';
            $params[] = $data['is_internal'];
        }

        if (isset($data['metadata'])) {
            $updateFields[] = 'metadata = ?';
            $params[] = json_encode($data['metadata']);
        }

        if (empty($updateFields)) {
            return ['success' => false, 'error' => 'No fields to update'];
        }

        $updateFields[] = 'updated_at = NOW()';
        $params[] = $responseId;

        $query = "UPDATE support_ticket_responses SET " . 
                 implode(', ', $updateFields) . " WHERE id = ?";

        $stmt = $this->db->prepare($query);
        $success = $stmt->execute($params);

        if ($success) {
            // Get response info for activity log
            $response = $this->getById($responseId);
            if ($response) {
                $this->logTicketActivity($response['ticket_id'], $updatedBy, $updatedByType, 
                    'response_updated', "Response updated by {$updatedByType}");
            }

            return ['success' => true];
        }

        return ['success' => false, 'error' => 'Failed to update response'];
    }

    /**
     * Delete a response
     */
    public function delete($responseId, $deletedBy, $deletedByType) {
        // Get response info before deletion
        $response = $this->getById($responseId);
        if (!$response) {
            return ['success' => false, 'error' => 'Response not found'];
        }

        $query = "DELETE FROM support_ticket_responses WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([$responseId]);

        if ($success) {
            // Log activity
            $this->logTicketActivity($response['ticket_id'], $deletedBy, $deletedByType, 
                'response_deleted', "Response deleted by {$deletedByType}");

            return ['success' => true];
        }

        return ['success' => false, 'error' => 'Failed to delete response'];
    }

    /**
     * Get response statistics for a user
     */
    public function getStatistics($userId = null, $userType = null, $dateRange = null) {
        $conditions = ['1=1'];
        $params = [];

        if ($userId && $userType) {
            $conditions[] = "responder_id = ? AND responder_type = ?";
            $params[] = $userId;
            $params[] = $userType;
        }

        if ($dateRange) {
            if (isset($dateRange['from'])) {
                $conditions[] = "created_at >= ?";
                $params[] = $dateRange['from'];
            }
            if (isset($dateRange['to'])) {
                $conditions[] = "created_at <= ?";
                $params[] = $dateRange['to'];
            }
        }

        $whereClause = implode(' AND ', $conditions);

        $query = "SELECT 
                    COUNT(*) as total_responses,
                    COUNT(DISTINCT ticket_id) as tickets_responded_to,
                    SUM(CASE WHEN is_internal = TRUE THEN 1 ELSE 0 END) as internal_responses,
                    SUM(CASE WHEN response_type = 'message' THEN 1 ELSE 0 END) as message_responses,
                    SUM(CASE WHEN response_type = 'status_update' THEN 1 ELSE 0 END) as status_updates,
                    AVG(CHAR_LENGTH(message)) as avg_message_length
                  FROM support_ticket_responses 
                  WHERE {$whereClause}";

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get recent responses for dashboard
     */
    public function getRecent($limit = 10, $userId = null, $userType = null) {
        $conditions = ['1=1'];
        $params = [];

        if ($userId && $userType) {
            if ($userType === 'provider') {
                // Provider can see responses to their tickets
                $conditions[] = "t.provider_id = (SELECT id FROM providers WHERE user_id = ?)";
                $params[] = $userId;
            } elseif ($userType !== 'admin') {
                // Regular users can only see responses to their tickets
                $conditions[] = "t.user_id = ?";
                $params[] = $userId;
            }
        }

        $whereClause = implode(' AND ', $conditions);

        $query = "SELECT r.*, t.ticket_number, t.subject as ticket_subject,
                         u.email as responder_user_email
                  FROM support_ticket_responses r
                  LEFT JOIN support_tickets t ON r.ticket_id = t.id
                  LEFT JOIN users u ON r.responder_id = u.id
                  WHERE {$whereClause} AND r.is_internal = FALSE
                  ORDER BY r.created_at DESC
                  LIMIT ?";
        
        $params[] = $limit;

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Mark response as read by user
     */
    public function markAsRead($responseId, $userId) {
        // This could be extended to track which users have read each response
        // For now, we'll just track in metadata
        $response = $this->getById($responseId);
        if (!$response) {
            return ['success' => false, 'error' => 'Response not found'];
        }

        $metadata = json_decode($response['metadata'] ?? '{}', true);
        $metadata['read_by'] = $metadata['read_by'] ?? [];
        
        if (!in_array($userId, $metadata['read_by'])) {
            $metadata['read_by'][] = $userId;
            $metadata['read_at_' . $userId] = date('Y-m-d H:i:s');
        }

        $query = "UPDATE support_ticket_responses SET metadata = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([json_encode($metadata), $responseId]);

        return ['success' => $success];
    }

    /**
     * Update ticket timestamp when response is added
     */
    private function updateTicketTimestamp($ticketId) {
        $query = "UPDATE support_tickets SET updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$ticketId]);
    }

    /**
     * Log activity in ticket activity table
     */
    private function logTicketActivity($ticketId, $userId, $userType, $activityType, $description, $metadata = null) {
        $query = "INSERT INTO support_ticket_activity (
            ticket_id, user_id, user_type, activity_type, description, 
            metadata, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $ticketId,
            $userId,
            $userType,
            $activityType,
            $description,
            $metadata ? json_encode($metadata) : null,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    }
}