<?php
// Admin Notes API - Supports both providers and tickets
// Extends existing admin notes system to handle support tickets

require_once '../../config/config.php';

// Authentication
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (!$authHeader) {
    response([], 401, 'Authorization header required');
    exit;
}

$token = str_replace('Bearer ', '', $authHeader);
$jwt = new JWTService($config['jwt']['secret'] ?? 'default-secret');
$user = $jwt->getCurrentUser();

if (!$user || $user['role'] !== 'admin') {
    response([], 403, 'Admin access required');
    exit;
}

// Initialize database
$database = new Database();
$pdo = $database->connect();

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Extract endpoint parts
preg_match('/\/api\/admin\/notes\/(.*)/', $uri, $matches);
$contextParam = $matches[1] ?? '';

switch ($method) {
    case 'GET':
        // Parse context - can be provider ID or ticket/{ticket_id}
        if (strpos($contextParam, 'ticket/') === 0) {
            $ticketId = substr($contextParam, 7);
            $notes = getTicketNotes($pdo, $ticketId);
        } else {
            $providerId = $contextParam;
            $notes = getProviderNotes($pdo, $providerId);
        }
        
        response(['notes' => $notes], 200, 'Notes retrieved successfully');
        break;
        
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        
        // Parse context
        if (strpos($contextParam, 'ticket/') === 0) {
            $ticketId = substr($contextParam, 7);
            $result = addTicketNote($pdo, $ticketId, $user['id'], $data);
        } else {
            $providerId = $contextParam;
            $result = addProviderNote($pdo, $providerId, $user['id'], $data);
        }
        
        if ($result['success']) {
            response($result, 200, 'Note added successfully');
        } else {
            response([], 400, $result['error'] ?? 'Failed to add note');
        }
        break;
        
    default:
        response([], 405, 'Method not allowed');
}

/**
 * Get notes for a provider
 */
function getProviderNotes($pdo, $providerId) {
    $query = "SELECT n.*, u.email as admin_name 
              FROM admin_notes n 
              LEFT JOIN users u ON n.admin_user_id = u.id 
              WHERE (n.context_type = 'provider' AND n.context_id = ?) 
                 OR (n.provider_id = ? AND n.context_type IS NULL)
              ORDER BY n.created_at DESC";
              
    $stmt = $pdo->prepare($query);
    $stmt->execute([$providerId, $providerId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Get notes for a ticket
 */
function getTicketNotes($pdo, $ticketId) {
    $query = "SELECT n.*, u.email as admin_name,
                     t.ticket_number, t.subject as ticket_subject,
                     p.business_name as provider_name
              FROM admin_notes n 
              LEFT JOIN users u ON n.admin_user_id = u.id 
              LEFT JOIN support_tickets t ON n.context_id = t.id
              LEFT JOIN providers p ON t.provider_id = p.id
              WHERE n.context_type = 'ticket' AND n.context_id = ?
              ORDER BY n.created_at DESC";
              
    $stmt = $pdo->prepare($query);
    $stmt->execute([$ticketId]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

/**
 * Add note for a provider
 */
function addProviderNote($pdo, $providerId, $adminUserId, $data) {
    try {
        $query = "INSERT INTO admin_notes (provider_id, context_type, context_id, admin_user_id, note_text, note_type, is_internal)
                  VALUES (?, 'provider', ?, ?, ?, ?, 1)";
                  
        $stmt = $pdo->prepare($query);
        $result = $stmt->execute([
            $providerId,
            $providerId,
            $adminUserId,
            $data['note_text'] ?? '',
            $data['note_type'] ?? 'general'
        ]);
        
        if ($result) {
            $noteId = $pdo->lastInsertId();
            return [
                'success' => true,
                'note_id' => $noteId
            ];
        }
        
        return ['success' => false, 'error' => 'Failed to insert note'];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}

/**
 * Add note for a ticket
 */
function addTicketNote($pdo, $ticketId, $adminUserId, $data) {
    try {
        // Get ticket's provider_id for linking
        $ticketQuery = "SELECT provider_id FROM support_tickets WHERE id = ?";
        $stmt = $pdo->prepare($ticketQuery);
        $stmt->execute([$ticketId]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$ticket) {
            return ['success' => false, 'error' => 'Ticket not found'];
        }
        
        $query = "INSERT INTO admin_notes (provider_id, context_type, context_id, admin_user_id, note_text, note_type, is_internal)
                  VALUES (?, 'ticket', ?, ?, ?, ?, 1)";
                  
        $stmt = $pdo->prepare($query);
        $result = $stmt->execute([
            $ticket['provider_id'],
            $ticketId,
            $adminUserId,
            $data['note_text'] ?? '',
            $data['note_type'] ?? 'general'
        ]);
        
        if ($result) {
            $noteId = $pdo->lastInsertId();
            return [
                'success' => true,
                'note_id' => $noteId
            ];
        }
        
        return ['success' => false, 'error' => 'Failed to insert note'];
        
    } catch (Exception $e) {
        return ['success' => false, 'error' => $e->getMessage()];
    }
}
?>