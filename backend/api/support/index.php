<?php
// Support Ticket API endpoints
// Handles all support ticket operations: create, list, detail, respond, update-status

// Load config and global functions
require_once '../../config/config.php';

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('/^\/lingora\/backend\/public\/api/', '', $uri);
$uri = preg_replace('/^\/api/', '', $uri);
$uri = trim($uri, '/');
$segments = $uri ? explode('/', $uri) : [];

// Get the remaining URI segments after /support
$supportSegments = array_slice($segments, 1);
$endpoint = $supportSegments[0] ?? '';

switch ($endpoint) {
    case 'list':
        // GET /api/support/list - List tickets for authenticated provider
        if ($method !== 'GET') {
            error_response('Method not allowed', 405);
        }
        
        // For now, return mock data - this will be replaced with real implementation
        response([
            'tickets' => [
                [
                    'id' => 1,
                    'ticket_number' => 'TK-001',
                    'user_email' => 'customer@example.com',
                    'user_name' => 'John Doe',
                    'subject' => 'Question about services',
                    'message' => 'I would like to know more about your services.',
                    'status' => 'open',
                    'priority' => 'medium',
                    'category' => 'general',
                    'response_count' => 0,
                    'last_response_at' => null,
                    'created_at' => '2025-09-07 13:00:00',
                    'updated_at' => '2025-09-07 13:00:00'
                ],
                [
                    'id' => 2,
                    'ticket_number' => 'TK-002',
                    'user_email' => 'patient@example.com',
                    'user_name' => 'Sarah Smith',
                    'subject' => 'Appointment inquiry',
                    'message' => 'Can I schedule an appointment for next week?',
                    'status' => 'pending',
                    'priority' => 'high',
                    'category' => 'appointment',
                    'response_count' => 1,
                    'last_response_at' => '2025-09-07 13:30:00',
                    'created_at' => '2025-09-07 12:00:00',
                    'updated_at' => '2025-09-07 13:30:00'
                ]
            ],
            'statistics' => [
                'total_tickets' => 2,
                'open_tickets' => 1,
                'pending_tickets' => 1,
                'resolved_tickets' => 0,
                'closed_tickets' => 0,
                'urgent_tickets' => 0,
                'high_priority_tickets' => 1
            ]
        ], 200, 'Tickets retrieved successfully');
        break;

    case 'detail':
        // GET /api/support/detail?id=123 - Get ticket details and responses
        if ($method !== 'GET') {
            error_response('Method not allowed', 405);
        }
        
        $ticketId = $_GET['id'] ?? null;
        if (!$ticketId) {
            error_response('Ticket ID is required', 400);
        }
        
        // Mock response - this will be replaced with real implementation
        response([
            'ticket' => [
                'id' => $ticketId,
                'ticket_number' => 'TK-' . str_pad($ticketId, 3, '0', STR_PAD_LEFT),
                'user_email' => 'customer@example.com',
                'user_name' => 'John Doe',
                'subject' => 'Question about services',
                'message' => 'I would like to know more about your services.',
                'status' => 'open',
                'priority' => 'medium',
                'category' => 'general',
                'created_at' => '2025-09-07 13:00:00',
                'updated_at' => '2025-09-07 13:00:00'
            ],
            'responses' => [
                [
                    'id' => 1,
                    'responder_type' => 'provider',
                    'responder_email' => 'provider@example.com',
                    'responder_name' => 'Dr. Example',
                    'message' => 'Thank you for your inquiry. I would be happy to help you.',
                    'is_internal' => false,
                    'created_at' => '2025-09-07 13:30:00'
                ]
            ]
        ], 200, 'Ticket details retrieved successfully');
        break;

    case 'respond':
        // POST /api/support/respond - Add response to ticket
        if ($method !== 'POST') {
            error_response('Method not allowed', 405);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $ticketId = $input['ticket_id'] ?? null;
        $message = $input['message'] ?? null;
        
        if (!$ticketId || !$message) {
            error_response('Ticket ID and message are required', 400);
        }
        
        // Mock response - this will be replaced with real implementation
        response([
            'response_id' => rand(1, 1000),
            'message' => 'Response added successfully'
        ], 201, 'Response added successfully');
        break;

    case 'update-status':
        // PUT /api/support/update-status - Update ticket status
        if ($method !== 'PUT') {
            error_response('Method not allowed', 405);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $ticketId = $input['ticket_id'] ?? null;
        $status = $input['status'] ?? null;
        
        if (!$ticketId || !$status) {
            error_response('Ticket ID and status are required', 400);
        }
        
        if (!in_array($status, ['open', 'pending', 'resolved', 'closed'])) {
            error_response('Invalid status', 400);
        }
        
        // Mock response - this will be replaced with real implementation
        response([
            'ticket_id' => $ticketId,
            'new_status' => $status,
            'message' => 'Ticket status updated successfully'
        ], 200, 'Ticket status updated successfully');
        break;

    case 'create':
        // POST /api/support/create - Create new ticket (for contact form)
        if ($method !== 'POST') {
            error_response('Method not allowed', 405);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $required = ['user_email', 'subject', 'message'];
        
        foreach ($required as $field) {
            if (empty($input[$field])) {
                error_response("Field '$field' is required", 400);
            }
        }
        
        // Mock response - this will be replaced with real implementation
        $ticketNumber = 'TK-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT);
        response([
            'ticket_id' => rand(1, 1000),
            'ticket_number' => $ticketNumber,
            'message' => 'Support ticket created successfully'
        ], 201, 'Support ticket created successfully');
        break;

    default:
        error_response('Support endpoint not found', 404);
}
?>