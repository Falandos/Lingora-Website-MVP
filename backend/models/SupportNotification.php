<?php

class SupportNotification {
    private $db;

    public function __construct($database) {
        $this->db = $database;
    }

    /**
     * Create a new notification
     */
    public function create($data) {
        $query = "INSERT INTO support_notifications (
            ticket_id, user_id, notification_type, title, message, 
            metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([
            $data['ticket_id'],
            $data['user_id'],
            $data['notification_type'],
            $data['title'],
            $data['message'],
            isset($data['metadata']) ? json_encode($data['metadata']) : null
        ]);

        if ($success) {
            $notificationId = $this->db->lastInsertId();
            
            // Auto-send email if enabled
            if ($this->isEmailNotificationEnabled()) {
                $this->sendEmailNotification($notificationId);
            }

            return [
                'success' => true,
                'notification_id' => $notificationId
            ];
        }
        
        return ['success' => false, 'error' => 'Failed to create notification'];
    }

    /**
     * Create notifications for ticket events
     */
    public function createForTicketEvent($ticketId, $eventType, $triggerUserId, $eventData = []) {
        // Get ticket details
        $ticket = $this->getTicketDetails($ticketId);
        if (!$ticket) {
            return ['success' => false, 'error' => 'Ticket not found'];
        }

        $notifications = [];
        $recipientIds = $this->getNotificationRecipients($ticket, $eventType, $triggerUserId);

        foreach ($recipientIds as $userId) {
            $notificationData = $this->buildNotificationData($ticket, $eventType, $userId, $eventData);
            if ($notificationData) {
                $result = $this->create($notificationData);
                if ($result['success']) {
                    $notifications[] = $result['notification_id'];
                }
            }
        }

        return [
            'success' => true,
            'notifications_created' => count($notifications),
            'notification_ids' => $notifications
        ];
    }

    /**
     * Get notifications for a user
     */
    public function getForUser($userId, $filters = []) {
        $conditions = ['user_id = ?'];
        $params = [$userId];

        if (isset($filters['is_read'])) {
            $conditions[] = 'is_read = ?';
            $params[] = $filters['is_read'];
        }

        if (isset($filters['notification_type'])) {
            $conditions[] = 'notification_type = ?';
            $params[] = $filters['notification_type'];
        }

        if (isset($filters['ticket_id'])) {
            $conditions[] = 'ticket_id = ?';
            $params[] = $filters['ticket_id'];
        }

        $whereClause = implode(' AND ', $conditions);
        $orderBy = $filters['order_by'] ?? 'created_at DESC';
        $limit = $filters['limit'] ?? 50;

        $query = "SELECT n.*, t.ticket_number, t.subject as ticket_subject,
                         t.status as ticket_status, t.priority as ticket_priority
                  FROM support_notifications n
                  LEFT JOIN support_tickets t ON n.ticket_id = t.id
                  WHERE {$whereClause}
                  ORDER BY {$orderBy}
                  LIMIT ?";
        
        $params[] = $limit;

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead($notificationId, $userId) {
        $query = "UPDATE support_notifications 
                  SET is_read = TRUE, read_at = NOW() 
                  WHERE id = ? AND user_id = ?";
        
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([$notificationId, $userId]);

        return ['success' => $success];
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead($userId, $ticketId = null) {
        $query = "UPDATE support_notifications 
                  SET is_read = TRUE, read_at = NOW() 
                  WHERE user_id = ? AND is_read = FALSE";
        
        $params = [$userId];
        
        if ($ticketId) {
            $query .= " AND ticket_id = ?";
            $params[] = $ticketId;
        }

        $stmt = $this->db->prepare($query);
        $success = $stmt->execute($params);

        return ['success' => $success];
    }

    /**
     * Get notification counts for a user
     */
    public function getCounts($userId) {
        $query = "SELECT 
                    COUNT(*) as total_notifications,
                    SUM(CASE WHEN is_read = FALSE THEN 1 ELSE 0 END) as unread_count,
                    SUM(CASE WHEN notification_type = 'new_response' AND is_read = FALSE THEN 1 ELSE 0 END) as unread_responses,
                    SUM(CASE WHEN notification_type = 'status_changed' AND is_read = FALSE THEN 1 ELSE 0 END) as unread_status_changes,
                    SUM(CASE WHEN notification_type = 'ticket_assigned' AND is_read = FALSE THEN 1 ELSE 0 END) as unread_assignments
                  FROM support_notifications 
                  WHERE user_id = ?";

        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Delete old notifications
     */
    public function cleanup($olderThanDays = 90) {
        $query = "DELETE FROM support_notifications 
                  WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)
                  AND is_read = TRUE";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$olderThanDays]);
        
        return ['success' => true, 'deleted_count' => $stmt->rowCount()];
    }

    /**
     * Send email notification
     */
    private function sendEmailNotification($notificationId) {
        $notification = $this->getNotificationById($notificationId);
        if (!$notification || $notification['is_email_sent']) {
            return false;
        }

        // Get user email
        $userQuery = "SELECT email FROM users WHERE id = ?";
        $userStmt = $this->db->prepare($userQuery);
        $userStmt->execute([$notification['user_id']]);
        $user = $userStmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) {
            return false;
        }

        // Prepare email content
        $subject = "[Lingora Support] " . $notification['title'];
        $body = $this->buildEmailBody($notification);
        
        // Send email (using your existing email system)
        $emailSent = $this->sendEmail($user['email'], $subject, $body);

        if ($emailSent) {
            // Update notification record
            $updateQuery = "UPDATE support_notifications 
                           SET is_email_sent = TRUE, email_sent_at = NOW() 
                           WHERE id = ?";
            $updateStmt = $this->db->prepare($updateQuery);
            $updateStmt->execute([$notificationId]);
        }

        return $emailSent;
    }

    /**
     * Get notification by ID
     */
    private function getNotificationById($notificationId) {
        $query = "SELECT n.*, t.ticket_number, t.subject as ticket_subject
                  FROM support_notifications n
                  LEFT JOIN support_tickets t ON n.ticket_id = t.id
                  WHERE n.id = ?";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$notificationId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Get ticket details for notifications
     */
    private function getTicketDetails($ticketId) {
        $query = "SELECT t.*, u.email as creator_email, p.business_name as provider_name,
                         a.email as assigned_admin_email
                  FROM support_tickets t
                  LEFT JOIN users u ON t.user_id = u.id
                  LEFT JOIN providers p ON t.provider_id = p.id
                  LEFT JOIN users a ON t.assigned_to = a.id
                  WHERE t.id = ?";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$ticketId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Determine who should receive notifications for a ticket event
     */
    private function getNotificationRecipients($ticket, $eventType, $triggerUserId) {
        $recipients = [];

        switch ($eventType) {
            case 'ticket_created':
                // Notify all admins
                $recipients = $this->getAdminUserIds();
                break;

            case 'new_response':
                // Notify ticket creator, assigned admin, and provider (but not the responder)
                $recipients[] = $ticket['user_id'];
                if ($ticket['assigned_to'] && $ticket['assigned_to'] !== $triggerUserId) {
                    $recipients[] = $ticket['assigned_to'];
                }
                if ($ticket['provider_id']) {
                    $providerUserId = $this->getProviderUserId($ticket['provider_id']);
                    if ($providerUserId && $providerUserId !== $triggerUserId) {
                        $recipients[] = $providerUserId;
                    }
                }
                break;

            case 'status_changed':
                // Notify ticket creator and provider
                $recipients[] = $ticket['user_id'];
                if ($ticket['provider_id']) {
                    $providerUserId = $this->getProviderUserId($ticket['provider_id']);
                    if ($providerUserId) {
                        $recipients[] = $providerUserId;
                    }
                }
                break;

            case 'ticket_assigned':
                // Notify the assigned admin and ticket creator
                if ($ticket['assigned_to']) {
                    $recipients[] = $ticket['assigned_to'];
                }
                $recipients[] = $ticket['user_id'];
                break;

            case 'ticket_resolved':
            case 'ticket_closed':
                // Notify ticket creator and provider
                $recipients[] = $ticket['user_id'];
                if ($ticket['provider_id']) {
                    $providerUserId = $this->getProviderUserId($ticket['provider_id']);
                    if ($providerUserId) {
                        $recipients[] = $providerUserId;
                    }
                }
                break;
        }

        // Remove duplicates and the trigger user (they don't need to be notified of their own actions)
        $recipients = array_unique($recipients);
        $recipients = array_filter($recipients, function($id) use ($triggerUserId) {
            return $id !== $triggerUserId;
        });

        return array_values($recipients);
    }

    /**
     * Build notification data for specific event and recipient
     */
    private function buildNotificationData($ticket, $eventType, $userId, $eventData) {
        $data = [
            'ticket_id' => $ticket['id'],
            'user_id' => $userId,
            'notification_type' => $eventType,
            'metadata' => $eventData
        ];

        switch ($eventType) {
            case 'ticket_created':
                $data['title'] = "New Support Ticket: #{$ticket['ticket_number']}";
                $data['message'] = "A new support ticket has been created: {$ticket['subject']}";
                break;

            case 'new_response':
                $responderName = $eventData['responder_name'] ?? $eventData['responder_email'] ?? 'Someone';
                $data['title'] = "New Response: #{$ticket['ticket_number']}";
                $data['message'] = "{$responderName} has responded to ticket: {$ticket['subject']}";
                break;

            case 'status_changed':
                $newStatus = $eventData['new_status'] ?? 'unknown';
                $data['title'] = "Status Updated: #{$ticket['ticket_number']}";
                $data['message'] = "Ticket status changed to '{$newStatus}': {$ticket['subject']}";
                break;

            case 'ticket_assigned':
                $assigneeName = $eventData['assigned_to_name'] ?? 'an admin';
                $data['title'] = "Ticket Assigned: #{$ticket['ticket_number']}";
                $data['message'] = "Your ticket has been assigned to {$assigneeName}: {$ticket['subject']}";
                break;

            case 'ticket_resolved':
                $data['title'] = "Ticket Resolved: #{$ticket['ticket_number']}";
                $data['message'] = "Your support ticket has been resolved: {$ticket['subject']}";
                break;

            case 'ticket_closed':
                $data['title'] = "Ticket Closed: #{$ticket['ticket_number']}";
                $data['message'] = "Your support ticket has been closed: {$ticket['subject']}";
                break;

            default:
                return null;
        }

        return $data;
    }

    /**
     * Get all admin user IDs
     */
    private function getAdminUserIds() {
        $query = "SELECT id FROM users WHERE role = 'admin'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        
        return array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'id');
    }

    /**
     * Get provider user ID from provider ID
     */
    private function getProviderUserId($providerId) {
        $query = "SELECT user_id FROM providers WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$providerId]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result ? $result['user_id'] : null;
    }

    /**
     * Check if email notifications are enabled
     */
    private function isEmailNotificationEnabled() {
        $query = "SELECT setting_value FROM site_settings WHERE setting_key = 'support_email_notifications_enabled'";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return $result && $result['setting_value'] === 'true';
    }

    /**
     * Build email body for notification
     */
    private function buildEmailBody($notification) {
        $body = "Hello,\n\n";
        $body .= $notification['message'] . "\n\n";
        
        if ($notification['ticket_number']) {
            $body .= "Ticket Number: #{$notification['ticket_number']}\n";
            $body .= "Subject: {$notification['ticket_subject']}\n\n";
        }
        
        $body .= "You can view and manage this ticket in your dashboard:\n";
        $body .= "https://lingora.nl/dashboard/tickets\n\n";
        $body .= "Best regards,\n";
        $body .= "Lingora Support Team";

        return $body;
    }

    /**
     * Send email (placeholder - integrate with your email system)
     */
    private function sendEmail($to, $subject, $body) {
        // This should integrate with your existing email system
        // For now, return true to simulate successful sending
        
        // Example using PHP mail() function:
        // $headers = "From: support@lingora.nl\r\n";
        // $headers .= "Reply-To: support@lingora.nl\r\n";
        // $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        // 
        // return mail($to, $subject, $body, $headers);

        return true; // Placeholder
    }

    /**
     * Get recent notifications for dashboard
     */
    public function getRecent($userId, $limit = 10) {
        $query = "SELECT n.*, t.ticket_number, t.subject as ticket_subject
                  FROM support_notifications n
                  LEFT JOIN support_tickets t ON n.ticket_id = t.id
                  WHERE n.user_id = ?
                  ORDER BY n.created_at DESC
                  LIMIT ?";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$userId, $limit]);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}