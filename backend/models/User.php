<?php
// User model for authentication and user management

class User {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function create($email, $password, $role = 'provider') {
        $email = strtolower(trim($email));
        
        // Check if email already exists
        if ($this->findByEmail($email)) {
            throw new Exception('Email already exists');
        }
        
        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Invalid email address');
        }
        
        // Validate password
        if (strlen($password) < 8) {
            throw new Exception('Password must be at least 8 characters');
        }
        
        // Hash password
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        // Generate email verification token
        $verificationToken = bin2hex(random_bytes(32));
        
        $sql = "INSERT INTO users (email, password_hash, role, email_verification_token, created_at) 
                VALUES (?, ?, ?, ?, NOW())";
        
        $this->db->query($sql, [$email, $passwordHash, $role, $verificationToken]);
        
        $userId = $this->db->lastInsertId();
        $user = $this->findById($userId);
        
        return [
            'user' => $user,
            'verification_token' => $verificationToken
        ];
    }
    
    public function findByEmail($email) {
        $sql = "SELECT * FROM users WHERE email = ?";
        return $this->db->fetchOne($sql, [strtolower(trim($email))]);
    }
    
    public function findById($id) {
        $sql = "SELECT id, email, role, email_verified, created_at, updated_at, last_login 
                FROM users WHERE id = ?";
        return $this->db->fetchOne($sql, [$id]);
    }
    
    public function verifyEmail($token) {
        $sql = "UPDATE users SET email_verified = TRUE, email_verification_token = NULL 
                WHERE email_verification_token = ? AND email_verified = FALSE";
        
        $stmt = $this->db->query($sql, [$token]);
        return $stmt->rowCount() > 0;
    }
    
    public function authenticate($email, $password) {
        $user = $this->findByEmail($email);
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            throw new Exception('Invalid email or password');
        }
        
        if (!$user['email_verified']) {
            throw new Exception('Please verify your email address first');
        }
        
        // Update last login
        $this->updateLastLogin($user['id']);
        
        return $user;
    }
    
    public function updateLastLogin($userId) {
        $sql = "UPDATE users SET last_login = NOW() WHERE id = ?";
        $this->db->query($sql, [$userId]);
    }
    
    public function generatePasswordResetToken($email) {
        $user = $this->findByEmail($email);
        
        if (!$user) {
            throw new Exception('Email not found');
        }
        
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', time() + 3600); // 1 hour from now
        
        $sql = "UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?";
        $this->db->query($sql, [$token, $expires, $user['id']]);
        
        return $token;
    }
    
    public function resetPassword($token, $newPassword) {
        $sql = "SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()";
        $user = $this->db->fetchOne($sql, [$token]);
        
        if (!$user) {
            throw new Exception('Invalid or expired reset token');
        }
        
        // Validate new password
        if (strlen($newPassword) < 8) {
            throw new Exception('Password must be at least 8 characters');
        }
        
        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $sql = "UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL 
                WHERE id = ?";
        $this->db->query($sql, [$passwordHash, $user['id']]);
        
        return true;
    }
    
    public function updatePassword($userId, $currentPassword, $newPassword) {
        $user = $this->findById($userId);
        
        if (!$user) {
            throw new Exception('User not found');
        }
        
        // Get full user data including password hash
        $fullUser = $this->db->fetchOne("SELECT * FROM users WHERE id = ?", [$userId]);
        
        if (!password_verify($currentPassword, $fullUser['password_hash'])) {
            throw new Exception('Current password is incorrect');
        }
        
        if (strlen($newPassword) < 8) {
            throw new Exception('Password must be at least 8 characters');
        }
        
        $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
        
        $sql = "UPDATE users SET password_hash = ? WHERE id = ?";
        $this->db->query($sql, [$passwordHash, $userId]);
        
        return true;
    }
    
    public function delete($userId) {
        // This will cascade delete providers and related data
        $sql = "DELETE FROM users WHERE id = ?";
        $stmt = $this->db->query($sql, [$userId]);
        
        return $stmt->rowCount() > 0;
    }
    
    public function getAllUsers($role = null, $limit = 50, $offset = 0) {
        $sql = "SELECT id, email, role, email_verified, created_at, last_login FROM users";
        $params = [];
        
        if ($role) {
            $sql .= " WHERE role = ?";
            $params[] = $role;
        }
        
        $sql .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        return $this->db->fetchAll($sql, $params);
    }
}
?>