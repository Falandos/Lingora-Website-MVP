<?php
// Services API endpoints

global $method, $action, $id, $database, $jwt;

switch ($method) {
    case 'GET':
        if ($action === null) {
            // Get services for current provider
            $user = $jwt->requireAuth('provider');
            
            // Get provider ID
            $providerSql = "SELECT id FROM providers WHERE user_id = ?";
            $provider = $database->fetchOne($providerSql, [$user['id']]);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 50) : 20;
            $offset = ($page - 1) * $limit;
            
            $sql = "SELECT s.*, c.name_en as category_name, c.name_nl as category_name_nl
                    FROM services s
                    LEFT JOIN categories c ON s.category_id = c.id
                    WHERE s.provider_id = ?
                    ORDER BY s.sort_order ASC, s.created_at DESC
                    LIMIT ? OFFSET ?";
            
            $services = $database->fetchAll($sql, [$provider['id'], $limit, $offset]);
            
            // Get total count
            $countSql = "SELECT COUNT(*) as total FROM services WHERE provider_id = ?";
            $totalResult = $database->fetchOne($countSql, [$provider['id']]);
            
            response([
                'services' => $services,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $totalResult['total'],
                    'totalPages' => ceil($totalResult['total'] / $limit)
                ]
            ]);
            
        } else {
            // Get specific service
            $user = $jwt->requireAuth('provider');
            
            // Get provider ID
            $providerSql = "SELECT id FROM providers WHERE user_id = ?";
            $provider = $database->fetchOne($providerSql, [$user['id']]);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            $sql = "SELECT s.*, c.name_en as category_name, c.name_nl as category_name_nl
                    FROM services s
                    LEFT JOIN categories c ON s.category_id = c.id
                    WHERE s.id = ? AND s.provider_id = ?";
                    
            $service = $database->fetchOne($sql, [$action, $provider['id']]);
            
            if (!$service) {
                error_response('Service not found', 404);
            }
            
            response($service);
        }
        break;
        
    case 'POST':
        // Create new service
        $user = $jwt->requireAuth('provider');
        
        // Get provider ID
        $providerSql = "SELECT id FROM providers WHERE user_id = ?";
        $provider = $database->fetchOne($providerSql, [$user['id']]);
        
        if (!$provider) {
            error_response('Provider profile not found', 404);
        }
        
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        
        // Validate required fields
        $required = ['title', 'category_id', 'service_mode'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                error_response("Field '$field' is required", 400);
            }
        }
        
        // Validate service mode
        if (!in_array($data['service_mode'], ['in_person', 'online', 'both'])) {
            error_response('Invalid service mode', 400);
        }
        
        // Validate category exists
        $categorySql = "SELECT id FROM categories WHERE id = ? AND is_active = TRUE";
        $category = $database->fetchOne($categorySql, [$data['category_id']]);
        if (!$category) {
            error_response('Invalid category', 400);
        }
        
        try {
            $sql = "INSERT INTO services (
                provider_id, title, description_nl, description_en, category_id, 
                price_min, price_max, price_description, service_mode, 
                duration_minutes, sort_order, is_active, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            
            $database->query($sql, [
                $provider['id'],
                $data['title'],
                $data['description_nl'] ?? null,
                $data['description_en'] ?? null,
                $data['category_id'],
                !empty($data['price_min']) ? $data['price_min'] : null,
                !empty($data['price_max']) ? $data['price_max'] : null,
                $data['price_description'] ?? null,
                $data['service_mode'],
                !empty($data['duration_minutes']) ? $data['duration_minutes'] : null,
                $data['sort_order'] ?? 0,
                isset($data['is_active']) ? (bool)$data['is_active'] : true
            ]);
            
            $serviceId = $database->lastInsertId();
            
            // Get the created service with category info
            $sql = "SELECT s.*, c.name_en as category_name, c.name_nl as category_name_nl
                    FROM services s
                    LEFT JOIN categories c ON s.category_id = c.id
                    WHERE s.id = ?";
                    
            $service = $database->fetchOne($sql, [$serviceId]);
            
            response($service, 201);
            
        } catch (Exception $e) {
            error_response('Failed to create service: ' . $e->getMessage(), 500);
        }
        break;
        
    case 'PUT':
        // Update service
        if (!$action) {
            error_response('Service ID required', 400);
        }
        
        $user = $jwt->requireAuth('provider');
        
        // Get provider ID
        $providerSql = "SELECT id FROM providers WHERE user_id = ?";
        $provider = $database->fetchOne($providerSql, [$user['id']]);
        
        if (!$provider) {
            error_response('Provider profile not found', 404);
        }
        
        // Verify service belongs to provider
        $serviceSql = "SELECT id FROM services WHERE id = ? AND provider_id = ?";
        $service = $database->fetchOne($serviceSql, [$action, $provider['id']]);
        
        if (!$service) {
            error_response('Service not found', 404);
        }
        
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        
        // Validate service mode if provided
        if (isset($data['service_mode']) && !in_array($data['service_mode'], ['in_person', 'online', 'both'])) {
            error_response('Invalid service mode', 400);
        }
        
        // Validate category if provided
        if (!empty($data['category_id'])) {
            $categorySql = "SELECT id FROM categories WHERE id = ? AND is_active = TRUE";
            $category = $database->fetchOne($categorySql, [$data['category_id']]);
            if (!$category) {
                error_response('Invalid category', 400);
            }
        }
        
        try {
            $allowedFields = [
                'title', 'description_nl', 'description_en', 'category_id', 
                'price_min', 'price_max', 'price_description', 'service_mode', 
                'duration_minutes', 'sort_order', 'is_active'
            ];
            
            $updates = [];
            $params = [];
            
            foreach ($allowedFields as $field) {
                if (array_key_exists($field, $data)) {
                    $updates[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
            
            if (empty($updates)) {
                error_response('No valid fields to update', 400);
            }
            
            $updates[] = "updated_at = NOW()";
            $params[] = $action; // service ID
            
            $sql = "UPDATE services SET " . implode(', ', $updates) . " WHERE id = ?";
            $database->query($sql, $params);
            
            // Get the updated service with category info
            $sql = "SELECT s.*, c.name_en as category_name, c.name_nl as category_name_nl
                    FROM services s
                    LEFT JOIN categories c ON s.category_id = c.id
                    WHERE s.id = ?";
                    
            $updatedService = $database->fetchOne($sql, [$action]);
            
            response($updatedService);
            
        } catch (Exception $e) {
            error_response('Failed to update service: ' . $e->getMessage(), 500);
        }
        break;
        
    case 'DELETE':
        // Delete service
        if (!$action) {
            error_response('Service ID required', 400);
        }
        
        $user = $jwt->requireAuth('provider');
        
        // Get provider ID
        $providerSql = "SELECT id FROM providers WHERE user_id = ?";
        $provider = $database->fetchOne($providerSql, [$user['id']]);
        
        if (!$provider) {
            error_response('Provider profile not found', 404);
        }
        
        // Verify service belongs to provider
        $serviceSql = "SELECT id FROM services WHERE id = ? AND provider_id = ?";
        $service = $database->fetchOne($serviceSql, [$action, $provider['id']]);
        
        if (!$service) {
            error_response('Service not found', 404);
        }
        
        try {
            // Soft delete - mark as inactive instead of hard delete to preserve data integrity
            $sql = "UPDATE services SET is_active = FALSE, updated_at = NOW() WHERE id = ?";
            $database->query($sql, [$action]);
            
            response(['message' => 'Service deleted successfully']);
            
        } catch (Exception $e) {
            error_response('Failed to delete service: ' . $e->getMessage(), 500);
        }
        break;
        
    default:
        error_response('Method not allowed', 405);
}
?>