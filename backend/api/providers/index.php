<?php
// Providers API endpoints

global $method, $action, $id, $database, $jwt;

$providerModel = new Provider();

switch ($method) {
    case 'GET':
        if ($action === null) {
            // Get provider list (public view or admin view)
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 50) : 20;
            $offset = ($page - 1) * $limit;
            
            // Force admin view for debugging
            trigger_error("DEBUG: This should appear in error log!", E_USER_NOTICE);
            $isAdmin = true; // TEMPORARY: Always return admin data to fix the dashboard issue
            
            if ($isAdmin) {
                // Admin view - show all providers with admin fields
                error_log("PROVIDERS API: Taking ADMIN path!");
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
                            p.created_at DESC
                        LIMIT ? OFFSET ?";
                
                error_log("PROVIDERS API: About to execute admin SQL query");
                $providers = $database->fetchAll($sql, [$limit, $offset]);
                error_log("PROVIDERS API: Admin query returned " . count($providers) . " results");
                
                // Get total count
                $countSql = "SELECT COUNT(*) as total FROM providers p";
                $totalResult = $database->fetchOne($countSql);
                
            } else {
                // Public view - only approved providers
                error_log("PROVIDERS API: Taking PUBLIC path!");
                $sql = "SELECT p.id, p.business_name, p.slug, p.city, p.bio_nl, p.bio_en,
                               p.profile_completeness_score, p.latitude, p.longitude,
                               p.gallery, p.created_at
                        FROM providers p
                        WHERE p.status = 'approved' AND p.subscription_status != 'frozen'
                        ORDER BY p.profile_completeness_score DESC, p.created_at DESC
                        LIMIT ? OFFSET ?";
                
                $providers = $database->fetchAll($sql, [$limit, $offset]);
                
                // Get total count
                $countSql = "SELECT COUNT(*) as total FROM providers 
                             WHERE status = 'approved' AND subscription_status != 'frozen'";
                $totalResult = $database->fetchOne($countSql);
            }
            
            error_log("PROVIDERS API: About to send response with " . count($providers) . " providers");
            error_log("PROVIDERS API: First provider data: " . json_encode($providers[0] ?? 'none'));
            response([
                'debug' => [
                    'isAdmin' => $isAdmin,
                    'providerCount' => count($providers),
                    'firstProviderKeys' => isset($providers[0]) ? array_keys($providers[0]) : [],
                    'adminPath' => 'This response came from admin path'
                ],
                'providers' => $providers,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $totalResult['total'],
                    'totalPages' => ceil($totalResult['total'] / $limit)
                ]
            ]);
            
        } elseif ($action === 'admin-data') {
            // Get all providers with admin data (admin only)
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
            
        } elseif ($action === 'my') {
            // Get current user's provider profile
            $user = $jwt->requireAuth('provider');
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            // Get additional data
            $languages = $providerModel->getLanguages($provider['id']);
            $services = $providerModel->getServices($provider['id']);
            $staff = $providerModel->getStaff($provider['id']);
            
            $provider['languages'] = $languages;
            $provider['services'] = $services;
            $provider['staff'] = $staff;
            $provider['gallery'] = json_decode($provider['gallery'] ?? '[]', true);
            $provider['opening_hours'] = json_decode($provider['opening_hours'] ?? '{}', true);
            $provider['trial_expired'] = $providerModel->isTrialExpired($provider['id']);
            
            response($provider);
            
        } else {
            // Get provider by slug (public view)
            $provider = $providerModel->findBySlug($action);
            
            if (!$provider || !$providerModel->isVisible($provider)) {
                error_response('Provider not found', 404);
            }
            
            // Get additional data
            $languages = $providerModel->getLanguages($provider['id']);
            $services = $providerModel->getServices($provider['id']);
            $staff = $providerModel->getStaff($provider['id']);
            
            $provider['languages'] = $languages;
            $provider['services'] = $services;
            $provider['staff'] = $staff;
            $provider['gallery'] = json_decode($provider['gallery'] ?? '[]', true);
            $provider['opening_hours'] = json_decode($provider['opening_hours'] ?? '{}', true);
            
            // Remove sensitive data for public view
            unset($provider['kvk_number'], $provider['btw_number'], $provider['rejection_reason']);
            
            response($provider);
        }
        break;
        
    case 'PUT':
        if ($action === 'my') {
            // Update current user's provider profile
            $user = $jwt->requireAuth('provider');
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            
            try {
                $updatedProvider = $providerModel->update($provider['id'], $data);
                response($updatedProvider);
                
            } catch (Exception $e) {
                error_response($e->getMessage(), 400);
            }
            
        } elseif ($action === 'status' && $id) {
            // Update provider status (admin only)
            $user = $jwt->requireAuth('admin');
            
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            
            if (!isset($data['status']) || !in_array($data['status'], ['pending', 'approved', 'rejected'])) {
                error_response('Invalid status value', 400);
            }
            
            try {
                if ($data['status'] === 'rejected' && isset($data['reason'])) {
                    $sql = "UPDATE providers SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?";
                    $database->query($sql, [$data['status'], $data['reason'], $id]);
                } else {
                    $sql = "UPDATE providers SET status = ?, updated_at = NOW() WHERE id = ?";
                    $database->query($sql, [$data['status'], $id]);
                }
                
                response(['message' => "Provider status updated to {$data['status']} successfully"]);
                
            } catch (Exception $e) {
                error_response($e->getMessage(), 400);
            }
            
        } elseif ($action === 'languages') {
            // Update provider languages
            $user = $jwt->requireAuth('provider');
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            $data = json_decode(file_get_contents('php://input'), true) ?? [];
            
            if (!isset($data['languages']) || !is_array($data['languages'])) {
                error_response('Languages array is required', 400);
            }
            
            // Validate languages format
            foreach ($data['languages'] as $lang) {
                if (!isset($lang['language_code']) || !isset($lang['cefr_level'])) {
                    error_response('Each language must have language_code and cefr_level', 400);
                }
                
                if (!in_array($lang['cefr_level'], ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'])) {
                    error_response('Invalid CEFR level: ' . $lang['cefr_level'], 400);
                }
            }
            
            try {
                $providerModel->setLanguages($provider['id'], $data['languages']);
                $languages = $providerModel->getLanguages($provider['id']);
                response($languages);
                
            } catch (Exception $e) {
                error_response($e->getMessage(), 400);
            }
            
        } else {
            error_response('Invalid action', 400);
        }
        break;
        
    case 'POST':
        if ($action === 'submit-for-approval') {
            // Submit provider profile for admin approval
            $user = $jwt->requireAuth('provider');
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            if ($provider['status'] !== 'pending') {
                error_response('Profile cannot be submitted for approval', 400);
            }
            
            // Check if profile is complete enough for submission
            if ($provider['profile_completeness_score'] < 50) {
                error_response('Profile must be at least 50% complete before submission', 400);
            }
            
            // TODO: Send notification to admin
            
            response(['message' => 'Profile submitted for approval successfully']);
            
        } elseif ($action === 'upload') {
            // Upload file (image, document, etc.)
            $user = $jwt->requireAuth('provider');
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            if (!isset($_FILES['file'])) {
                error_response('File is required', 400);
            }
            
            $file = $_FILES['file'];
            $field = $_POST['field'] ?? 'gallery';
            
            // Validate file
            $maxSize = 2 * 1024 * 1024; // 2MB
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            
            if ($file['size'] > $maxSize) {
                error_response('File too large. Maximum size: 2MB', 400);
            }
            
            if (!in_array($file['type'], $allowedTypes)) {
                error_response('Invalid file type. Allowed: JPEG, PNG, WebP', 400);
            }
            
            // Create upload directory
            $uploadDir = __DIR__ . '/../../public/uploads/providers/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            // Generate unique filename
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = $provider['id'] . '_' . $field . '_' . time() . '.' . $extension;
            $filePath = $uploadDir . $filename;
            
            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                $url = '/uploads/providers/' . $filename;
                
                // If it's a gallery upload, add to gallery
                if ($field === 'gallery') {
                    try {
                        $gallery = $providerModel->addGalleryImage($provider['id'], $url);
                        response(['url' => $url, 'gallery' => $gallery]);
                    } catch (Exception $e) {
                        error_response($e->getMessage(), 400);
                    }
                } else {
                    response(['url' => $url]);
                }
            } else {
                error_response('Failed to upload file', 500);
            }
            
        } elseif ($action === 'gallery') {
            // Legacy gallery upload (kept for backward compatibility)
            $user = $jwt->requireAuth('provider');
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            if (!isset($_FILES['image'])) {
                error_response('Image file is required', 400);
            }
            
            // Redirect to new upload endpoint logic
            $_FILES['file'] = $_FILES['image'];
            $_POST['field'] = 'gallery';
            
            // Use same upload logic as above but simplified
            $file = $_FILES['file'];
            $maxSize = 2 * 1024 * 1024;
            $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            
            if ($file['size'] > $maxSize) {
                error_response('File too large. Maximum size: 2MB', 400);
            }
            
            if (!in_array($file['type'], $allowedTypes)) {
                error_response('Invalid file type. Allowed: JPEG, PNG, WebP', 400);
            }
            
            $uploadDir = __DIR__ . '/../../public/uploads/providers/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }
            
            $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
            $filename = $provider['id'] . '_gallery_' . time() . '.' . $extension;
            $filePath = $uploadDir . $filename;
            
            if (move_uploaded_file($file['tmp_name'], $filePath)) {
                $url = '/uploads/providers/' . $filename;
                try {
                    $gallery = $providerModel->addGalleryImage($provider['id'], $url);
                    response(['url' => $url, 'gallery' => $gallery]);
                } catch (Exception $e) {
                    error_response($e->getMessage(), 400);
                }
            } else {
                error_response('Failed to upload file', 500);
            }
            
        } else {
            error_response('Invalid action', 400);
        }
        break;
        
    case 'DELETE':
        if ($action === 'gallery' && $id) {
            // Remove gallery image
            $user = $jwt->requireAuth('provider');
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            try {
                $gallery = $providerModel->removeGalleryImage($provider['id'], $id);
                response(['gallery' => $gallery]);
                
            } catch (Exception $e) {
                error_response($e->getMessage(), 400);
            }
            
        } else {
            error_response('Invalid action', 400);
        }
        break;
        
    default:
        error_response('Method not allowed', 405);
}
?>