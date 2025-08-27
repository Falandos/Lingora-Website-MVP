<?php
// Authentication API endpoints
// Handles login, register, password reset, etc.

global $method, $action, $database, $jwt, $config;

$userModel = new User();

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        
        switch ($action) {
            case 'register':
                try {
                    // Validate required fields
                    $errors = validate_required_fields($data, ['email', 'password', 'business_name', 'kvk_number', 'btw_number']);
                    if ($errors) {
                        error_response('Validation failed', 400, $errors);
                    }
                    
                    // Additional validation
                    if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
                        error_response('Invalid email address', 400);
                    }
                    
                    if (strlen($data['password']) < 8) {
                        error_response('Password must be at least 8 characters', 400);
                    }
                    
                    // Create user
                    $result = $userModel->create($data['email'], $data['password'], 'provider');
                    
                    // Create provider profile
                    $providerModel = new Provider();
                    $provider = $providerModel->create([
                        'user_id' => $result['user']['id'],
                        'business_name' => $data['business_name'],
                        'kvk_number' => $data['kvk_number'],
                        'btw_number' => $data['btw_number']
                    ]);
                    
                    // TODO: Send verification email
                    
                    response([
                        'user' => $result['user'],
                        'provider' => $provider,
                        'message' => 'Registration successful. Please check your email to verify your account.'
                    ], 201);
                    
                } catch (Exception $e) {
                    error_response($e->getMessage(), 400);
                }
                break;
                
            case 'login':
                try {
                    // Validate required fields
                    $errors = validate_required_fields($data, ['email', 'password']);
                    if ($errors) {
                        error_response('Validation failed', 400, $errors);
                    }
                    
                    // Authenticate user
                    $user = $userModel->authenticate($data['email'], $data['password']);
                    
                    // Generate JWT token
                    $payload = [
                        'user_id' => $user['id'],
                        'email' => $user['email'],
                        'role' => $user['role'],
                    ];
                    
                    $token = $jwt->encode($payload, $config['jwt']['expiry']);
                    
                    response([
                        'token' => $token,
                        'user' => [
                            'id' => $user['id'],
                            'email' => $user['email'],
                            'role' => $user['role'],
                            'email_verified' => (bool)$user['email_verified']
                        ]
                    ]);
                    
                } catch (Exception $e) {
                    error_response($e->getMessage(), 401);
                }
                break;
                
            case 'verify-email':
                try {
                    if (!isset($data['token'])) {
                        error_response('Verification token is required', 400);
                    }
                    
                    $verified = $userModel->verifyEmail($data['token']);
                    
                    if ($verified) {
                        response(['message' => 'Email verified successfully']);
                    } else {
                        error_response('Invalid or expired verification token', 400);
                    }
                    
                } catch (Exception $e) {
                    error_response($e->getMessage(), 400);
                }
                break;
                
            case 'forgot-password':
                try {
                    if (!isset($data['email'])) {
                        error_response('Email is required', 400);
                    }
                    
                    $token = $userModel->generatePasswordResetToken($data['email']);
                    
                    // TODO: Send password reset email
                    
                    response(['message' => 'Password reset link sent to your email']);
                    
                } catch (Exception $e) {
                    error_response($e->getMessage(), 400);
                }
                break;
                
            case 'reset-password':
                try {
                    $errors = validate_required_fields($data, ['token', 'password']);
                    if ($errors) {
                        error_response('Validation failed', 400, $errors);
                    }
                    
                    $userModel->resetPassword($data['token'], $data['password']);
                    
                    response(['message' => 'Password reset successfully']);
                    
                } catch (Exception $e) {
                    error_response($e->getMessage(), 400);
                }
                break;
                
            default:
                error_response('Invalid action', 400);
        }
        break;
        
    case 'GET':
        switch ($action) {
            case 'me':
                $user = $jwt->requireAuth();
                
                $userData = $userModel->findById($user['id']);
                
                if ($userData['role'] === 'provider') {
                    $providerModel = new Provider();
                    $provider = $providerModel->findByUserId($user['id']);
                    $userData['provider'] = $provider;
                }
                
                response($userData);
                break;
                
            default:
                error_response('Invalid action', 400);
        }
        break;
        
    case 'PUT':
        switch ($action) {
            case 'change-password':
                $user = $jwt->requireAuth();
                $data = json_decode(file_get_contents('php://input'), true) ?? [];
                
                try {
                    $errors = validate_required_fields($data, ['current_password', 'new_password']);
                    if ($errors) {
                        error_response('Validation failed', 400, $errors);
                    }
                    
                    $userModel->updatePassword($user['id'], $data['current_password'], $data['new_password']);
                    
                    response(['message' => 'Password updated successfully']);
                    
                } catch (Exception $e) {
                    error_response($e->getMessage(), 400);
                }
                break;
                
            default:
                error_response('Invalid action', 400);
        }
        break;
        
    default:
        error_response('Method not allowed', 405);
}
?>