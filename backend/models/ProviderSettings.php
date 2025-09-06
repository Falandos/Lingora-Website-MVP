<?php
// Provider Settings model for dashboard preferences

class ProviderSettings {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    /**
     * Get settings for a provider
     */
    public function getSettings($providerId) {
        $sql = "SELECT * FROM provider_settings WHERE provider_id = ?";
        $settings = $this->db->fetchOne($sql, [$providerId]);
        
        // If no settings exist, create defaults
        if (!$settings) {
            $this->createDefaults($providerId);
            $settings = $this->db->fetchOne($sql, [$providerId]);
        }
        
        return $settings;
    }
    
    /**
     * Update provider settings (supports partial updates)
     */
    public function updateSettings($providerId, $data) {
        // Get current settings to ensure they exist
        $currentSettings = $this->getSettings($providerId);
        
        // Build dynamic update query for provided fields
        $allowedFields = [
            'email_notifications', 'sms_notifications', 'newsletter_subscription',
            'language', 'timezone', 'date_format', 'currency',
            'dashboard_layout', 'items_per_page', 'show_analytics', 'compact_view',
            'profile_visibility', 'show_contact_info', 'allow_messages'
        ];
        
        $updates = [];
        $params = [];
        
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                $updates[] = "{$field} = ?";
                $params[] = $data[$field];
            }
        }
        
        if (empty($updates)) {
            return $currentSettings; // No valid fields to update
        }
        
        $params[] = $providerId;
        $sql = "UPDATE provider_settings SET " . implode(', ', $updates) . " WHERE provider_id = ?";
        
        $this->db->query($sql, $params);
        
        // Return updated settings
        return $this->getSettings($providerId);
    }
    
    /**
     * Create default settings for a new provider
     */
    public function createDefaults($providerId) {
        $sql = "INSERT INTO provider_settings (provider_id) VALUES (?)";
        $this->db->query($sql, [$providerId]);
        return $this->getSettings($providerId);
    }
    
    /**
     * Reset settings to defaults
     */
    public function resetToDefaults($providerId) {
        $sql = "DELETE FROM provider_settings WHERE provider_id = ?";
        $this->db->query($sql, [$providerId]);
        
        return $this->createDefaults($providerId);
    }
    
    /**
     * Validate settings data
     */
    public function validateSettings($data) {
        $errors = [];
        
        // Language validation
        if (isset($data['language']) && !in_array($data['language'], ['en', 'nl', 'de', 'fr', 'es'])) {
            $errors['language'] = 'Invalid language code';
        }
        
        // Currency validation
        if (isset($data['currency']) && !in_array($data['currency'], ['EUR', 'USD', 'GBP'])) {
            $errors['currency'] = 'Invalid currency code';
        }
        
        // Items per page validation
        if (isset($data['items_per_page'])) {
            $items = (int)$data['items_per_page'];
            if ($items < 5 || $items > 100) {
                $errors['items_per_page'] = 'Items per page must be between 5 and 100';
            }
        }
        
        // Profile visibility validation
        if (isset($data['profile_visibility']) && !in_array($data['profile_visibility'], ['public', 'unlisted', 'private'])) {
            $errors['profile_visibility'] = 'Invalid profile visibility setting';
        }
        
        // Dashboard layout validation
        if (isset($data['dashboard_layout']) && !in_array($data['dashboard_layout'], ['grid', 'list', 'compact'])) {
            $errors['dashboard_layout'] = 'Invalid dashboard layout';
        }
        
        return $errors;
    }
}