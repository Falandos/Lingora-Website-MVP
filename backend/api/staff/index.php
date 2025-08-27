<?php
// Staff API endpoints

global $method, $action, $id, $database, $jwt;

$staffModel = new Staff();

switch ($method) {
    case 'GET':
        if ($action === 'contactable' && $id) {
            // Get contactable staff for a specific provider (public view)
            $staff = $staffModel->getContactableStaff($id);
            response($staff);
            
        } elseif ($id) {
            // Get specific staff member
            $staff = $staffModel->findById($id);
            
            if (!$staff) {
                error_response('Staff member not found', 404);
            }
            
            response($staff);
            
        } else {
            error_response('Invalid request', 400);
        }
        break;
        
    case 'PUT':
        if ($action === 'contact-config' && $id) {
            // Update staff member contact configuration (provider only)
            $user = $jwt->requireAuth('provider');
            
            // Verify the staff member belongs to this provider
            $staff = $staffModel->findById($id);
            if (!$staff) {
                error_response('Staff member not found', 404);
            }
            
            // Get provider to verify ownership
            $providerModel = new Provider();
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider || $staff['provider_id'] != $provider['id']) {
                error_response('Access denied', 403);
            }
            
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            
            // Validate contact configuration
            $allowedContactMethods = ['email', 'phone', 'both'];
            if (isset($data['preferred_contact_method']) && 
                !in_array($data['preferred_contact_method'], $allowedContactMethods)) {
                error_response('Invalid contact method', 400);
            }
            
            if (isset($data['response_time_hours']) && 
                (!is_numeric($data['response_time_hours']) || $data['response_time_hours'] < 1 || $data['response_time_hours'] > 168)) {
                error_response('Response time must be between 1 and 168 hours', 400);
            }
            
            try {
                $updatedStaff = $staffModel->updateContactConfig($id, $data);
                response($updatedStaff);
                
            } catch (Exception $e) {
                error_response($e->getMessage(), 400);
            }
            
        } elseif ($id) {
            // Update general staff member info (provider only)
            $user = $jwt->requireAuth('provider');
            
            // Verify the staff member belongs to this provider
            $staff = $staffModel->findById($id);
            if (!$staff) {
                error_response('Staff member not found', 404);
            }
            
            // Get provider to verify ownership
            $providerModel = new Provider();
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider || $staff['provider_id'] != $provider['id']) {
                error_response('Access denied', 403);
            }
            
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            
            try {
                $updatedStaff = $staffModel->update($id, $data);
                response($updatedStaff);
                
            } catch (Exception $e) {
                error_response($e->getMessage(), 400);
            }
            
        } else {
            error_response('Invalid request', 400);
        }
        break;
        
    case 'POST':
        if ($action === null) {
            // Create new staff member (provider only)
            $user = $jwt->requireAuth('provider');
            
            // Get provider
            $providerModel = new Provider();
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            $data['provider_id'] = $provider['id'];
            
            // Validate required fields
            if (empty($data['name'])) {
                error_response('Name is required', 400);
            }
            
            try {
                $staff = $staffModel->create($data);
                
                // Set languages if provided
                if (isset($data['languages']) && is_array($data['languages'])) {
                    $staffModel->setLanguages($staff['id'], $data['languages']);
                    $staff = $staffModel->findById($staff['id']); // Reload with languages
                }
                
                response($staff, 201);
                
            } catch (Exception $e) {
                error_response($e->getMessage(), 400);
            }
            
        } else {
            error_response('Invalid action', 400);
        }
        break;
        
    case 'DELETE':
        if ($id) {
            // Delete staff member (provider only)
            $user = $jwt->requireAuth('provider');
            
            // Verify the staff member belongs to this provider
            $staff = $staffModel->findById($id);
            if (!$staff) {
                error_response('Staff member not found', 404);
            }
            
            // Get provider to verify ownership
            $providerModel = new Provider();
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider || $staff['provider_id'] != $provider['id']) {
                error_response('Access denied', 403);
            }
            
            try {
                $staffModel->delete($id);
                response(['message' => 'Staff member deleted successfully']);
                
            } catch (Exception $e) {
                error_response($e->getMessage(), 400);
            }
            
        } else {
            error_response('Invalid request', 400);
        }
        break;
        
    default:
        error_response('Method not allowed', 405);
}
?>