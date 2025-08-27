<?php
// JWT Service for authentication
// Simple JWT implementation without external dependencies

class JWTService {
    private $secret;
    private $algorithm;
    
    public function __construct($secret, $algorithm = 'HS256') {
        $this->secret = $secret;
        $this->algorithm = $algorithm;
    }
    
    public function encode($payload, $expiry = null) {
        $header = json_encode(['typ' => 'JWT', 'alg' => $this->algorithm]);
        
        if ($expiry) {
            $payload['exp'] = time() + $expiry;
        }
        
        $payload = json_encode($payload);
        
        $base64Header = $this->base64UrlEncode($header);
        $base64Payload = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $this->secret, true);
        $base64Signature = $this->base64UrlEncode($signature);
        
        return $base64Header . "." . $base64Payload . "." . $base64Signature;
    }
    
    public function decode($jwt) {
        $parts = explode('.', $jwt);
        
        if (count($parts) !== 3) {
            throw new Exception('Invalid JWT format');
        }
        
        list($base64Header, $base64Payload, $base64Signature) = $parts;
        
        $header = json_decode($this->base64UrlDecode($base64Header), true);
        $payload = json_decode($this->base64UrlDecode($base64Payload), true);
        
        if (!$header || !$payload) {
            throw new Exception('Invalid JWT data');
        }
        
        // Verify signature
        $signature = $this->base64UrlDecode($base64Signature);
        $expectedSignature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $this->secret, true);
        
        if (!hash_equals($expectedSignature, $signature)) {
            throw new Exception('Invalid JWT signature');
        }
        
        // Check expiration
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            throw new Exception('JWT token expired');
        }
        
        return $payload;
    }
    
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    private function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
    
    public function getAuthHeader() {
        $headers = getallheaders();
        
        if (isset($headers['Authorization'])) {
            return $headers['Authorization'];
        }
        
        if (isset($headers['authorization'])) {
            return $headers['authorization'];
        }
        
        return null;
    }
    
    public function getTokenFromHeader() {
        $authHeader = $this->getAuthHeader();
        
        if ($authHeader && preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
        
        return null;
    }
    
    public function getCurrentUser() {
        try {
            $token = $this->getTokenFromHeader();
            
            if (!$token) {
                return null;
            }
            
            $payload = $this->decode($token);
            
            return [
                'id' => $payload['user_id'] ?? null,
                'email' => $payload['email'] ?? null,
                'role' => $payload['role'] ?? null,
            ];
        } catch (Exception $e) {
            return null;
        }
    }
    
    public function requireAuth($requiredRole = null) {
        $user = $this->getCurrentUser();
        
        if (!$user) {
            error_response('Authentication required', 401);
        }
        
        if ($requiredRole && $user['role'] !== $requiredRole) {
            error_response('Insufficient permissions', 403);
        }
        
        return $user;
    }
}
?>