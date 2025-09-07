<?php
// Enhanced Support Ticket API endpoints
// Full implementation with file uploads, notifications, and comprehensive ticket management

// Load config and authentication
require_once '../../config/config.php';
require_once '../../services/SupportTicketService.php';

// Initialize dependencies
$database = new Database();
$jwt = new JWTService($config['jwt']['secret'] ?? 'default-secret', $config['jwt']['algorithm'] ?? 'HS256');

// Authentication check
$user = $jwt->getCurrentUser();

if (!$user) {
    error_response('Authentication required', 401);
}

// Initialize services
try {
    $supportService = new SupportTicketService($database->connect());
    $schemaAdapter = SchemaAdapter::getInstance($database);
} catch (Exception $e) {
    error_response('Service initialization failed: ' . $e->getMessage(), 500);
}

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
        // GET /api/support/list - List tickets with filters
        if ($method !== 'GET') {
            error_response('Method not allowed', 405);
        }
        
        $filters = [
            'status' => $_GET['status'] ?? null,
            'priority' => $_GET['priority'] ?? null,
            'category' => $_GET['category'] ?? null,
            'assigned_to' => $_GET['assigned_to'] ?? null,
            'search' => $_GET['search'] ?? null,
            'page' => max(1, (int)($_GET['page'] ?? 1)),
            'limit' => min(100, max(1, (int)($_GET['limit'] ?? 50)))
        ];

        // Remove null values
        $filters = array_filter($filters, function($value) {
            return $value !== null && $value !== '';
        });

        $result = $supportService->getTicketsList($filters, $user['id'], $user['role']);
        
        if ($result['success']) {
            // Add schema capabilities to response
            $result['schema_features'] = [
                'attachments_supported' => $schemaAdapter->hasFeature('file_attachments'),
                'enhanced_features' => $schemaAdapter->hasFeature('enhanced_statistics'),
                'notifications_supported' => $schemaAdapter->hasFeature('notifications')
            ];
            response($result, 200, 'Tickets retrieved successfully');
        } else {
            error_response($result['error'], 500);
        }
        break;

    case 'detail':
        // GET /api/support/detail?id=123 - Get ticket details with responses and attachments
        if ($method !== 'GET') {
            error_response('Method not allowed', 405);
        }
        
        $ticketId = $_GET['id'] ?? null;
        if (!$ticketId) {
            error_response('Ticket ID is required', 400);
        }
        
        $result = $supportService->getTicketDetails($ticketId, $user['id'], $user['role']);
        
        if ($result['success']) {
            response($result, 200, 'Ticket details retrieved successfully');
        } else {
            error_response($result['error'], $result['error'] === 'Ticket not found or access denied' ? 404 : 500);
        }
        break;

    case 'respond':
        // POST /api/support/respond - Add response to ticket (with file upload support)
        if ($method !== 'POST') {
            error_response('Method not allowed', 405);
        }
        
        $ticketId = $_POST['ticket_id'] ?? null;
        $message = $_POST['message'] ?? null;
        $isInternal = ($_POST['is_internal'] ?? 'false') === 'true';
        
        if (!$ticketId || !$message) {
            error_response('Ticket ID and message are required', 400);
        }

        // Determine responder type based on user role
        $responderType = $user['role'] === 'admin' ? 'admin' : 
                        ($user['role'] === 'provider' ? 'provider' : 'user');

        // Get responder name (try to get provider business name if provider)
        $responderName = $user['email'];
        if ($responderType === 'provider') {
            $providerQuery = "SELECT business_name FROM providers WHERE user_id = ?";
            $stmt = $database->connect()->prepare($providerQuery);
            $stmt->execute([$user['id']]);
            $provider = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($provider) {
                $responderName = $provider['business_name'];
            }
        }

        $responseData = [
            'responder_id' => $user['id'],
            'responder_type' => $responderType,
            'responder_email' => $user['email'],
            'responder_name' => $responderName,
            'message' => trim($message),
            'is_internal' => $isInternal && $user['role'] === 'admin', // Only admins can add internal notes
            'user_role' => $user['role']
        ];

        // Handle file uploads
        $uploadedFiles = [];
        if (!empty($_FILES)) {
            foreach ($_FILES as $key => $file) {
                if (is_array($file['name'])) {
                    // Multiple files
                    for ($i = 0; $i < count($file['name']); $i++) {
                        if ($file['error'][$i] === UPLOAD_ERR_OK) {
                            $uploadedFiles[] = [
                                'name' => $file['name'][$i],
                                'type' => $file['type'][$i],
                                'tmp_name' => $file['tmp_name'][$i],
                                'error' => $file['error'][$i],
                                'size' => $file['size'][$i]
                            ];
                        }
                    }
                } else {
                    // Single file
                    if ($file['error'] === UPLOAD_ERR_OK) {
                        $uploadedFiles[] = $file;
                    }
                }
            }
        }

        $result = $supportService->addResponse($ticketId, $responseData, $uploadedFiles);
        
        if ($result['success']) {
            response($result, 201, 'Response added successfully');
        } else {
            error_response($result['error'], 400);
        }
        break;

    case 'update-status':
        // PUT /api/support/update-status - Update ticket status
        if ($method !== 'PUT') {
            error_response('Method not allowed', 405);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $ticketId = $input['ticket_id'] ?? null;
        $status = $input['status'] ?? null;
        $notes = $input['notes'] ?? null;
        
        if (!$ticketId || !$status) {
            error_response('Ticket ID and status are required', 400);
        }
        
        $validStatuses = ['new', 'open', 'in_progress', 'pending', 'resolved', 'closed'];
        if (!in_array($status, $validStatuses)) {
            error_response('Invalid status. Valid statuses: ' . implode(', ', $validStatuses), 400);
        }
        
        $userType = $user['role'] === 'admin' ? 'admin' : 
                   ($user['role'] === 'provider' ? 'provider' : 'user');

        $result = $supportService->updateTicketStatus($ticketId, $status, $user['id'], $userType, $notes);
        
        if ($result['success']) {
            response([
                'ticket_id' => $ticketId,
                'new_status' => $status,
                'message' => 'Ticket status updated successfully'
            ], 200, 'Ticket status updated successfully');
        } else {
            error_response($result['error'], 400);
        }
        break;

    case 'assign':
        // PUT /api/support/assign - Assign ticket to admin (admin only)
        if ($method !== 'PUT') {
            error_response('Method not allowed', 405);
        }
        
        if ($user['role'] !== 'admin') {
            error_response('Admin access required', 403);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $ticketId = $input['ticket_id'] ?? null;
        $adminId = $input['admin_id'] ?? null;
        
        if (!$ticketId || !$adminId) {
            error_response('Ticket ID and admin ID are required', 400);
        }
        
        $result = $supportService->assignTicket($ticketId, $adminId, $user['id'], 'admin');
        
        if ($result['success']) {
            response([
                'ticket_id' => $ticketId,
                'assigned_to' => $adminId,
                'message' => 'Ticket assigned successfully'
            ], 200, 'Ticket assigned successfully');
        } else {
            error_response($result['error'], 400);
        }
        break;

    case 'create':
        // POST /api/support/create - Create new ticket (with file upload support)
        if ($method !== 'POST') {
            error_response('Method not allowed', 405);
        }
        
        // Support both JSON and form data
        $data = [];
        if (!empty($_POST)) {
            $data = $_POST;
        } else {
            $input = json_decode(file_get_contents('php://input'), true);
            $data = $input ?? [];
        }
        
        $required = ['subject', 'message'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                error_response("Field '$field' is required", 400);
            }
        }

        // Get provider ID if user is a provider
        $providerId = null;
        if ($user['role'] === 'provider') {
            $providerQuery = "SELECT id FROM providers WHERE user_id = ?";
            $stmt = $database->connect()->prepare($providerQuery);
            $stmt->execute([$user['id']]);
            $provider = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($provider) {
                $providerId = $provider['id'];
            }
        }

        $ticketData = [
            'user_id' => $user['id'],
            'provider_id' => $providerId,
            'user_email' => $user['email'],
            'user_name' => $data['user_name'] ?? null,
            'subject' => trim($data['subject']),
            'message' => trim($data['message']),
            'priority' => $data['priority'] ?? 'medium',
            'category' => $data['category'] ?? 'general_inquiry',
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
        ];

        // Handle file uploads
        $uploadedFiles = [];
        if (!empty($_FILES)) {
            foreach ($_FILES as $key => $file) {
                if (is_array($file['name'])) {
                    // Multiple files
                    for ($i = 0; $i < count($file['name']); $i++) {
                        if ($file['error'][$i] === UPLOAD_ERR_OK) {
                            $uploadedFiles[] = [
                                'name' => $file['name'][$i],
                                'type' => $file['type'][$i],
                                'tmp_name' => $file['tmp_name'][$i],
                                'error' => $file['error'][$i],
                                'size' => $file['size'][$i]
                            ];
                        }
                    }
                } else {
                    // Single file
                    if ($file['error'] === UPLOAD_ERR_OK) {
                        $uploadedFiles[] = $file;
                    }
                }
            }
        }

        $result = $supportService->createTicket($ticketData, $uploadedFiles);
        
        if ($result['success']) {
            response($result, 201, 'Support ticket created successfully');
        } else {
            error_response($result['error'], 400);
        }
        break;

    case 'dashboard':
        // GET /api/support/dashboard - Get dashboard data
        if ($method !== 'GET') {
            error_response('Method not allowed', 405);
        }
        
        $result = $supportService->getDashboardData($user['id'], $user['role']);
        
        if ($result['success']) {
            response($result, 200, 'Dashboard data retrieved successfully');
        } else {
            error_response($result['error'], 500);
        }
        break;

    case 'download':
        // GET /api/support/download?attachment_id=123 - Download attachment
        if ($method !== 'GET') {
            error_response('Method not allowed', 405);
        }
        
        $attachmentId = $_GET['attachment_id'] ?? null;
        if (!$attachmentId) {
            error_response('Attachment ID is required', 400);
        }
        
        $result = $supportService->downloadAttachment($attachmentId, $user['id'], $user['role']);
        
        if ($result['success']) {
            // Set appropriate headers for file download
            header('Content-Type: ' . $result['file_type']);
            header('Content-Disposition: attachment; filename="' . $result['original_filename'] . '"');
            header('Content-Length: ' . $result['file_size']);
            header('Cache-Control: private, must-revalidate');
            
            // Output file
            readfile($result['file_path']);
            exit;
        } else {
            error_response($result['error'], $result['error'] === 'Access denied' ? 403 : 404);
        }
        break;

    case 'statistics':
        // GET /api/support/statistics - Get comprehensive statistics (admin only)
        if ($method !== 'GET') {
            error_response('Method not allowed', 405);
        }
        
        if ($user['role'] !== 'admin') {
            error_response('Admin access required', 403);
        }
        
        $dateRange = null;
        if (!empty($_GET['from']) || !empty($_GET['to'])) {
            $dateRange = [
                'from' => $_GET['from'] ?? date('Y-m-01'),
                'to' => $_GET['to'] ?? date('Y-m-t')
            ];
        }
        
        $result = $supportService->getAdminStatistics($dateRange);
        
        if ($result['success']) {
            response($result, 200, 'Statistics retrieved successfully');
        } else {
            error_response($result['error'], 500);
        }
        break;

    case 'bulk':
        // POST /api/support/bulk - Bulk operations (admin only)
        if ($method !== 'POST') {
            error_response('Method not allowed', 405);
        }
        
        if ($user['role'] !== 'admin') {
            error_response('Admin access required', 403);
        }
        
        $input = json_decode(file_get_contents('php://input'), true);
        $operation = $input['operation'] ?? null;
        $ticketIds = $input['ticket_ids'] ?? [];
        $data = $input['data'] ?? [];
        
        if (!$operation || empty($ticketIds)) {
            error_response('Operation and ticket IDs are required', 400);
        }
        
        $validOperations = ['assign', 'status_update', 'priority_update'];
        if (!in_array($operation, $validOperations)) {
            error_response('Invalid operation. Valid operations: ' . implode(', ', $validOperations), 400);
        }
        
        $result = $supportService->bulkOperation($operation, $ticketIds, $user['id'], 'admin', $data);
        
        if ($result['success']) {
            response($result, 200, 'Bulk operation completed');
        } else {
            error_response($result['error'], 400);
        }
        break;

    case 'categories':
        // GET /api/support/categories - Get available categories and priorities
        if ($method !== 'GET') {
            error_response('Method not allowed', 405);
        }
        
        try {
            $categoriesQuery = "SELECT setting_value FROM site_settings WHERE setting_key = 'support_categories'";
            $stmt = $database->connect()->prepare($categoriesQuery);
            $stmt->execute();
            $categoriesResult = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $prioritiesQuery = "SELECT setting_value FROM site_settings WHERE setting_key = 'support_priorities'";
            $stmt = $database->connect()->prepare($prioritiesQuery);
            $stmt->execute();
            $prioritiesResult = $stmt->fetch(PDO::FETCH_ASSOC);
            
            response([
                'categories' => $categoriesResult ? json_decode($categoriesResult['setting_value'], true) : [],
                'priorities' => $prioritiesResult ? json_decode($prioritiesResult['setting_value'], true) : []
            ], 200, 'Categories and priorities retrieved successfully');
        } catch (Exception $e) {
            error_response('Failed to retrieve categories: ' . $e->getMessage(), 500);
        }
        break;

    default:
        error_response('Support endpoint not found. Available endpoints: list, detail, respond, update-status, assign, create, dashboard, download, statistics, bulk, categories', 404);
}

?>