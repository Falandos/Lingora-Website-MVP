<?php

require_once __DIR__ . '/../models/SupportTicket.php';
require_once __DIR__ . '/../models/SupportTicketResponse.php';
require_once __DIR__ . '/../models/SupportTicketAttachment.php';
require_once __DIR__ . '/../models/SupportNotification.php';

class SupportTicketService {
    private $db;
    private $ticketModel;
    private $responseModel;
    private $attachmentModel;
    private $notificationModel;

    public function __construct($database) {
        $this->db = $database;
        $this->ticketModel = new SupportTicket($database);
        $this->responseModel = new SupportTicketResponse($database);
        $this->attachmentModel = new SupportTicketAttachment($database);
        $this->notificationModel = new SupportNotification($database);
    }

    /**
     * Create a new support ticket with full processing
     */
    public function createTicket($data, $files = []) {
        try {
            $this->db->beginTransaction();

            // Create the ticket
            $ticketResult = $this->ticketModel->create($data);
            if (!$ticketResult['success']) {
                throw new Exception($ticketResult['error']);
            }

            $ticketId = $ticketResult['ticket_id'];

            // Handle file uploads if any
            $attachmentResults = [];
            if (!empty($files)) {
                foreach ($files as $file) {
                    if ($file['error'] === UPLOAD_ERR_OK) {
                        $uploadResult = $this->attachmentModel->upload(
                            $file, $ticketId, $data['user_id'], 'user'
                        );
                        if ($uploadResult['success']) {
                            $attachmentResults[] = $uploadResult;
                        }
                    }
                }
            }

            // Create notifications
            $this->notificationModel->createForTicketEvent($ticketId, 'ticket_created', $data['user_id'], [
                'attachments_count' => count($attachmentResults)
            ]);

            // Auto-assign if enabled
            $this->autoAssignTicket($ticketId);

            $this->db->commit();

            return [
                'success' => true,
                'ticket_id' => $ticketId,
                'ticket_number' => $ticketResult['ticket_number'],
                'attachments' => $attachmentResults
            ];

        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get ticket details with responses and attachments
     */
    public function getTicketDetails($ticketId, $userId, $userRole) {
        $ticket = $this->ticketModel->getById($ticketId, $userId, $userRole);
        if (!$ticket) {
            return ['success' => false, 'error' => 'Ticket not found or access denied'];
        }

        // Get responses
        $includeInternal = ($userRole === 'admin');
        $responses = $this->responseModel->getByTicketId($ticketId, $includeInternal);

        // Get attachments for each response and the main ticket
        $mainAttachments = $this->attachmentModel->getByTicket($ticketId);
        
        foreach ($responses as &$response) {
            $response['attachments'] = $this->attachmentModel->getByTicket($ticketId, $response['id']);
        }

        // Get activity history (admin only or ticket owner)
        $activity = [];
        if ($userRole === 'admin' || $ticket['user_id'] == $userId) {
            $activity = $this->ticketModel->getActivity($ticketId);
        }

        return [
            'success' => true,
            'ticket' => $ticket,
            'responses' => $responses,
            'attachments' => $mainAttachments,
            'activity' => $activity
        ];
    }

    /**
     * Add response to ticket with full processing
     */
    public function addResponse($ticketId, $data, $files = []) {
        try {
            $this->db->beginTransaction();

            // Validate ticket access
            $ticket = $this->ticketModel->getById($ticketId, $data['responder_id'], $data['user_role']);
            if (!$ticket) {
                throw new Exception('Ticket not found or access denied');
            }

            // Create response
            $responseData = [
                'ticket_id' => $ticketId,
                'responder_id' => $data['responder_id'],
                'responder_type' => $data['responder_type'],
                'responder_email' => $data['responder_email'],
                'responder_name' => $data['responder_name'] ?? null,
                'message' => $data['message'],
                'is_internal' => $data['is_internal'] ?? false,
                'response_type' => $data['response_type'] ?? 'message'
            ];

            $responseResult = $this->responseModel->create($responseData);
            if (!$responseResult['success']) {
                throw new Exception($responseResult['error']);
            }

            $responseId = $responseResult['response_id'];

            // Handle file uploads
            $attachmentResults = [];
            if (!empty($files)) {
                foreach ($files as $file) {
                    if ($file['error'] === UPLOAD_ERR_OK) {
                        $uploadResult = $this->attachmentModel->upload(
                            $file, $ticketId, $data['responder_id'], $data['responder_type'], $responseId
                        );
                        if ($uploadResult['success']) {
                            $attachmentResults[] = $uploadResult;
                        }
                    }
                }
            }

            // Create notifications (only for non-internal responses)
            if (!($data['is_internal'] ?? false)) {
                $this->notificationModel->createForTicketEvent($ticketId, 'new_response', $data['responder_id'], [
                    'responder_name' => $data['responder_name'],
                    'responder_email' => $data['responder_email'],
                    'attachments_count' => count($attachmentResults)
                ]);
            }

            // Auto-update status if needed
            if ($data['responder_type'] === 'admin' && $ticket['status'] === 'new') {
                $this->ticketModel->updateStatus($ticketId, 'open', $data['responder_id'], 'admin', 
                    'Status automatically updated when admin responded');
            }

            $this->db->commit();

            return [
                'success' => true,
                'response_id' => $responseId,
                'attachments' => $attachmentResults
            ];

        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Update ticket status with full processing
     */
    public function updateTicketStatus($ticketId, $newStatus, $userId, $userType, $notes = null) {
        try {
            $this->db->beginTransaction();

            $result = $this->ticketModel->updateStatus($ticketId, $newStatus, $userId, $userType, $notes);
            if (!$result['success']) {
                throw new Exception($result['error']);
            }

            // Create notification
            $this->notificationModel->createForTicketEvent($ticketId, 'status_changed', $userId, [
                'new_status' => $newStatus,
                'notes' => $notes
            ]);

            // Special handling for resolved status
            if ($newStatus === 'resolved') {
                $this->handleTicketResolution($ticketId, $userId, $userType);
            }

            $this->db->commit();
            return ['success' => true];

        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Assign ticket to admin
     */
    public function assignTicket($ticketId, $adminId, $assignedBy, $assignedByType) {
        try {
            $this->db->beginTransaction();

            $result = $this->ticketModel->assignTicket($ticketId, $adminId, $assignedBy, $assignedByType);
            if (!$result['success']) {
                throw new Exception($result['error']);
            }

            // Get admin name for notification
            $adminQuery = "SELECT email FROM users WHERE id = ?";
            $stmt = $this->db->prepare($adminQuery);
            $stmt->execute([$adminId]);
            $admin = $stmt->fetch(PDO::FETCH_ASSOC);

            // Create notification
            $this->notificationModel->createForTicketEvent($ticketId, 'ticket_assigned', $assignedBy, [
                'assigned_to_id' => $adminId,
                'assigned_to_name' => $admin['email'] ?? 'Admin'
            ]);

            $this->db->commit();
            return ['success' => true];

        } catch (Exception $e) {
            $this->db->rollBack();
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Get tickets list with full filtering
     */
    public function getTicketsList($filters, $userId, $userRole) {
        $tickets = $this->ticketModel->getList($filters, $userId, $userRole);
        $statistics = $this->ticketModel->getStatistics($userId, $userRole);

        return [
            'success' => true,
            'tickets' => $tickets,
            'statistics' => $statistics,
            'pagination' => [
                'current_page' => $filters['page'] ?? 1,
                'per_page' => $filters['limit'] ?? 50,
                'total_tickets' => $statistics['total_tickets']
            ]
        ];
    }

    /**
     * Get dashboard data for user
     */
    public function getDashboardData($userId, $userRole) {
        $statistics = $this->ticketModel->getStatistics($userId, $userRole);
        $recentTickets = $this->ticketModel->getList(['limit' => 5], $userId, $userRole);
        $recentResponses = $this->responseModel->getRecent(5, $userId, $userRole);
        $notifications = $this->notificationModel->getRecent($userId, 10);
        $notificationCounts = $this->notificationModel->getCounts($userId);

        return [
            'success' => true,
            'statistics' => $statistics,
            'recent_tickets' => $recentTickets,
            'recent_responses' => $recentResponses,
            'notifications' => $notifications,
            'notification_counts' => $notificationCounts
        ];
    }

    /**
     * Handle file download with access control
     */
    public function downloadAttachment($attachmentId, $userId, $userRole) {
        return $this->attachmentModel->download($attachmentId, $userId, $userRole);
    }

    /**
     * Delete attachment
     */
    public function deleteAttachment($attachmentId, $userId, $userType) {
        return $this->attachmentModel->delete($attachmentId, $userId, $userType);
    }

    /**
     * Get comprehensive ticket statistics for admin
     */
    public function getAdminStatistics($dateRange = null) {
        if (!$dateRange) {
            $dateRange = [
                'from' => date('Y-m-01'), // First day of current month
                'to' => date('Y-m-t')     // Last day of current month
            ];
        }

        $ticketStats = $this->ticketModel->getStatistics();
        $responseStats = $this->responseModel->getStatistics();
        $attachmentStats = $this->attachmentModel->getStatistics();

        // Additional admin-specific metrics
        $adminMetricsQuery = "SELECT 
                                AVG(CASE WHEN resolved_at IS NOT NULL THEN 
                                    TIMESTAMPDIFF(HOUR, created_at, resolved_at) 
                                END) as avg_resolution_time_hours,
                                COUNT(CASE WHEN created_at >= ? THEN 1 END) as tickets_this_period,
                                COUNT(CASE WHEN resolved_at >= ? AND resolved_at <= ? THEN 1 END) as resolved_this_period,
                                AVG(customer_satisfaction_rating) as avg_satisfaction,
                                COUNT(CASE WHEN priority IN ('high', 'urgent') THEN 1 END) as high_priority_tickets
                              FROM support_tickets 
                              WHERE created_at >= ?";
        
        $stmt = $this->db->prepare($adminMetricsQuery);
        $stmt->execute([$dateRange['from'], $dateRange['from'], $dateRange['to'], $dateRange['from']]);
        $adminMetrics = $stmt->fetch(PDO::FETCH_ASSOC);

        return [
            'success' => true,
            'ticket_statistics' => $ticketStats,
            'response_statistics' => $responseStats,
            'attachment_statistics' => $attachmentStats,
            'admin_metrics' => $adminMetrics,
            'date_range' => $dateRange
        ];
    }

    /**
     * Auto-assign ticket to least loaded admin
     */
    private function autoAssignTicket($ticketId) {
        // Check if auto-assignment is enabled
        $settingQuery = "SELECT setting_value FROM site_settings WHERE setting_key = 'support_auto_assignment_enabled'";
        $stmt = $this->db->prepare($settingQuery);
        $stmt->execute();
        $setting = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$setting || $setting['setting_value'] !== 'true') {
            return;
        }

        // Find admin with least assigned tickets
        $adminQuery = "SELECT u.id, u.email, COUNT(t.id) as ticket_count
                       FROM users u
                       LEFT JOIN support_tickets t ON u.id = t.assigned_to AND t.status NOT IN ('resolved', 'closed')
                       WHERE u.role = 'admin'
                       GROUP BY u.id, u.email
                       ORDER BY ticket_count ASC
                       LIMIT 1";
        
        $stmt = $this->db->prepare($adminQuery);
        $stmt->execute();
        $admin = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($admin) {
            $this->ticketModel->assignTicket($ticketId, $admin['id'], null, 'system');
        }
    }

    /**
     * Handle ticket resolution
     */
    private function handleTicketResolution($ticketId, $userId, $userType) {
        // Create resolution notification
        $this->notificationModel->createForTicketEvent($ticketId, 'ticket_resolved', $userId);

        // Schedule customer satisfaction survey if enabled
        $settingQuery = "SELECT setting_value FROM site_settings WHERE setting_key = 'support_customer_satisfaction_enabled'";
        $stmt = $this->db->prepare($settingQuery);
        $stmt->execute();
        $setting = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($setting && $setting['setting_value'] === 'true') {
            // Create notification for satisfaction request after 1 hour
            $this->scheduleCustomerSatisfactionRequest($ticketId);
        }
    }

    /**
     * Schedule customer satisfaction request
     */
    private function scheduleCustomerSatisfactionRequest($ticketId) {
        // Get ticket details
        $ticket = $this->ticketModel->getById($ticketId);
        if (!$ticket) return;

        // Create a delayed notification (this would typically use a queue system)
        $notificationData = [
            'ticket_id' => $ticketId,
            'user_id' => $ticket['user_id'],
            'notification_type' => 'satisfaction_request',
            'title' => "Rate Your Experience: #{$ticket['ticket_number']}",
            'message' => "How satisfied were you with the resolution of your support ticket? Your feedback helps us improve our service.",
            'metadata' => [
                'scheduled_for' => date('Y-m-d H:i:s', strtotime('+1 hour')),
                'survey_url' => "https://lingora.nl/feedback/{$ticketId}"
            ]
        ];

        $this->notificationModel->create($notificationData);
    }

    /**
     * Search tickets with advanced filters
     */
    public function searchTickets($searchQuery, $filters, $userId, $userRole) {
        $extendedFilters = array_merge($filters, ['search' => $searchQuery]);
        return $this->getTicketsList($extendedFilters, $userId, $userRole);
    }

    /**
     * Bulk operations on tickets (admin only)
     */
    public function bulkOperation($operation, $ticketIds, $userId, $userType, $data = []) {
        if ($userType !== 'admin') {
            return ['success' => false, 'error' => 'Admin access required'];
        }

        $results = [];
        $successCount = 0;

        foreach ($ticketIds as $ticketId) {
            switch ($operation) {
                case 'assign':
                    $result = $this->assignTicket($ticketId, $data['admin_id'], $userId, $userType);
                    break;
                case 'status_update':
                    $result = $this->updateTicketStatus($ticketId, $data['status'], $userId, $userType, $data['notes'] ?? null);
                    break;
                case 'priority_update':
                    $result = $this->updateTicketPriority($ticketId, $data['priority'], $userId, $userType);
                    break;
                default:
                    $result = ['success' => false, 'error' => 'Unknown operation'];
            }

            $results[$ticketId] = $result;
            if ($result['success']) {
                $successCount++;
            }
        }

        return [
            'success' => true,
            'total_processed' => count($ticketIds),
            'successful' => $successCount,
            'failed' => count($ticketIds) - $successCount,
            'results' => $results
        ];
    }

    /**
     * Update ticket priority
     */
    private function updateTicketPriority($ticketId, $priority, $userId, $userType) {
        $query = "UPDATE support_tickets SET priority = ?, updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([$priority, $ticketId]);

        if ($success) {
            // Log activity
            $this->ticketModel->logActivity($ticketId, $userId, $userType, 'priority_changed', 
                "Priority changed to '{$priority}'", null, $priority);
        }

        return ['success' => $success];
    }
}