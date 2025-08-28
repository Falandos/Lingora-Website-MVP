<?php
// Providers API endpoints

global $method, $action, $id, $database, $jwt;

$providerModel = new Provider();

switch ($method) {
    case 'GET':
        if ($action === null) {
            // Get provider list (public view)
            $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 50) : 20;
            $offset = ($page - 1) * $limit;
            
            // Check if request is from admin (with fallback methods)
            $isAdmin = false;
            $authToken = null;
            
            // Check Authorization header (use getallheaders for reliability)
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $authToken = $headers['Authorization'];
            }
            elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authToken = $_SERVER['HTTP_AUTHORIZATION'];
            }
            
            if ($authToken) {
                try {
                    // Temporarily set the Authorization header for JWT validation
                    $_SERVER['HTTP_AUTHORIZATION'] = $authToken;
                    $user = $jwt->requireAuth();
                    $isAdmin = $user && $user['role'] === 'admin';
                } catch (Exception $e) {
                    $isAdmin = false;
                }
            }
            
            if ($isAdmin) {
                // Admin view - show all providers with admin fields
                $sql = "SELECT p.*, u.email, u.email_verified, u.created_at as user_created_at,
                        DATEDIFF(p.trial_expires_at, NOW()) as trial_days_remaining
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
                
                $providers = $database->fetchAll($sql, [$limit, $offset]);
                
                // Get total count
                $countSql = "SELECT COUNT(*) as total FROM providers p";
                $totalResult = $database->fetchOne($countSql);
                
            } else {
                // Public view - only approved providers
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
            
            response([
                'providers' => $providers,
                'pagination' => [
                    'page' => $page,
                    'limit' => $limit,
                    'total' => $totalResult['total'],
                    'totalPages' => ceil($totalResult['total'] / $limit)
                ]
            ]);
            
        } elseif ($action === 'recent') {
            // Get recent providers for homepage carousel
            $limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 10) : 6;
            
            $sql = "SELECT p.id, p.business_name, p.slug, p.city, p.bio_en, p.bio_nl, 
                           p.created_at, p.profile_completeness_score,
                           CASE WHEN p.kvk_number IS NOT NULL AND p.btw_number IS NOT NULL THEN 1 ELSE 0 END as kvk_verified
                    FROM providers p
                    WHERE p.status = 'approved' AND p.subscription_status != 'frozen'
                    ORDER BY p.created_at DESC, p.profile_completeness_score DESC
                    LIMIT ?";
            
            $providers = $database->fetchAll($sql, [$limit]);
            
            // Get languages and primary category for each provider
            foreach ($providers as &$provider) {
                $languagesSql = "SELECT DISTINCT pl.language_code 
                                FROM provider_languages pl 
                                WHERE pl.provider_id = ? 
                                ORDER BY pl.language_code";
                $languages = $database->fetchAll($languagesSql, [$provider['id']]);
                $provider['languages'] = array_column($languages, 'language_code');
                
                // Get primary category from most common service category
                $categorySql = "SELECT c.name_en as category_name, COUNT(*) as count
                               FROM services s 
                               JOIN categories c ON s.category_id = c.id 
                               WHERE s.provider_id = ? AND s.is_active = 1
                               GROUP BY c.id, c.name_en 
                               ORDER BY count DESC 
                               LIMIT 1";
                $categoryResult = $database->fetchOne($categorySql, [$provider['id']]);
                $provider['primary_category'] = $categoryResult ? $categoryResult['category_name'] : 'Professional Services';
                $provider['kvk_verified'] = (bool)$provider['kvk_verified'];
            }
            
            response(['providers' => $providers]);
            
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
            
        } elseif ($action === 'gallery') {
            // Upload gallery image
            $user = $jwt->requireAuth('provider');
            $provider = $providerModel->findByUserId($user['id']);
            
            if (!$provider) {
                error_response('Provider profile not found', 404);
            }
            
            if (!isset($_FILES['image'])) {
                error_response('Image file is required', 400);
            }
            
            // TODO: Handle file upload
            
            response(['message' => 'Image upload functionality to be implemented']);
            
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