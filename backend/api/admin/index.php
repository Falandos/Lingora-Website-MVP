<?php
// Admin API endpoints

global $method, $action, $id, $database, $jwt;


switch ($method) {
    case 'GET':
        if ($action === 'providers') {
            // Get all providers for admin management
            $user = $jwt->requireAuth('admin');
            
            $sql = "SELECT p.*, u.email, u.email_verified, u.created_at as user_created_at
                    FROM providers p
                    LEFT JOIN users u ON p.user_id = u.id
                    ORDER BY 
                        CASE p.status 
                            WHEN 'pending' THEN 1 
                            WHEN 'approved' THEN 2 
                            WHEN 'rejected' THEN 3 
                            ELSE 4 
                        END,
                        p.created_at DESC";
            
            $providers = $database->fetchAll($sql);
            
            response($providers);
            
        } elseif ($action === 'messages') {
            // Get all contact messages for admin monitoring
            $user = $jwt->requireAuth('admin');
            
            $sql = "SELECT m.*, p.business_name as provider_name
                    FROM messages m
                    LEFT JOIN providers p ON m.provider_id = p.id
                    ORDER BY m.created_at DESC";
            
            $messages = $database->fetchAll($sql);
            
            response($messages);
            
        } else {
            error_response("Invalid admin endpoint: '$action' (expecting 'providers' or 'messages')", 404);
        }
        break;
        
    case 'POST':
        $user = $jwt->requireAuth('admin');
        
        if ($action === 'providers' && $id) {
            if ($id === 'approve') {
                error_response("Use POST /admin/providers/{id}/approve", 400);
            } elseif ($id === 'reject') {
                error_response("Use POST /admin/providers/{id}/reject", 400);
            }
            // This is for the URL pattern: POST /admin/providers/{id}
            error_response("Invalid action for provider", 400);
        } elseif (strpos($action, 'providers/') === 0) {
            // Handle URLs like: POST /admin/providers/1/approve
            $parts = explode('/', $action);
            $providerId = $parts[1] ?? null;
            $subAction = $parts[2] ?? null;
            
            if (!$providerId || !$subAction) {
                error_response("Invalid provider action URL", 400);
            }
            
            if ($subAction === 'approve') {
                $sql = "UPDATE providers SET status = 'approved', updated_at = NOW() WHERE id = ?";
                $database->query($sql, [$providerId]);
                response(['message' => 'Provider approved successfully']);
                
            } elseif ($subAction === 'reject') {
                $data = json_decode(file_get_contents('php://input'), true) ?? [];
                $reason = $data['reason'] ?? 'No reason provided';
                
                $sql = "UPDATE providers SET status = 'rejected', rejection_reason = ?, updated_at = NOW() WHERE id = ?";
                $database->query($sql, [$reason, $providerId]);
                response(['message' => 'Provider rejected successfully']);
                
            } else {
                error_response("Invalid provider action: $subAction", 400);
            }
        } else {
            error_response("Invalid endpoint", 404);
        }
        break;
        
    default:
        error_response("Method not allowed", 405);
}
?>