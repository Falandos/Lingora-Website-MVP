<?php
// Staff model for managing individual staff members

class Staff {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function findById($id) {
        $sql = "SELECT * FROM staff WHERE id = ?";
        $staff = $this->db->fetchOne($sql, [$id]);
        
        if ($staff) {
            // Add languages for this staff member
            $langSql = "SELECT sl.*, l.name_en, l.name_native 
                        FROM staff_languages sl 
                        JOIN languages l ON sl.language_code = l.code 
                        WHERE sl.staff_id = ?";
            $staff['languages'] = $this->db->fetchAll($langSql, [$id]);
        }
        
        return $staff;
    }
    
    public function create($data) {
        $sql = "INSERT INTO staff (
            provider_id, name, role, bio_nl, bio_en, email, phone, photo_url,
            is_contact_person, contact_enabled, preferred_contact_method, 
            response_time_hours, availability_note, is_active, is_public, sort_order
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $this->db->query($sql, [
            $data['provider_id'],
            $data['name'],
            $data['role'] ?? null,
            $data['bio_nl'] ?? null,
            $data['bio_en'] ?? null,
            $data['email'] ?? null,
            $data['phone'] ?? null,
            $data['photo_url'] ?? null,
            $data['is_contact_person'] ?? 0,
            $data['contact_enabled'] ?? 1,
            $data['preferred_contact_method'] ?? 'email',
            $data['response_time_hours'] ?? 24,
            $data['availability_note'] ?? null,
            $data['is_active'] ?? 1,
            $data['is_public'] ?? 1,
            $data['sort_order'] ?? 0
        ]);
        
        $staffId = $this->db->lastInsertId();
        return $this->findById($staffId);
    }
    
    public function update($id, $data) {
        $allowedFields = [
            'name', 'role', 'bio_nl', 'bio_en', 'email', 'phone', 'photo_url',
            'is_contact_person', 'contact_enabled', 'preferred_contact_method',
            'response_time_hours', 'availability_note', 'is_active', 'is_public', 'sort_order'
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
            return $this->findById($id);
        }
        
        $updates[] = "updated_at = NOW()";
        $params[] = $id;
        
        $sql = "UPDATE staff SET " . implode(', ', $updates) . " WHERE id = ?";
        $this->db->query($sql, $params);
        
        return $this->findById($id);
    }
    
    public function updateContactConfig($id, $config) {
        $sql = "UPDATE staff SET 
                contact_enabled = ?,
                preferred_contact_method = ?,
                response_time_hours = ?,
                availability_note = ?,
                updated_at = NOW()
                WHERE id = ?";
                
        $this->db->query($sql, [
            $config['contact_enabled'] ?? 1,
            $config['preferred_contact_method'] ?? 'email',
            $config['response_time_hours'] ?? 24,
            $config['availability_note'] ?? null,
            $id
        ]);
        
        return $this->findById($id);
    }
    
    public function setLanguages($staffId, $languages) {
        // Remove existing languages
        $this->db->query("DELETE FROM staff_languages WHERE staff_id = ?", [$staffId]);
        
        // Add new languages
        if (!empty($languages)) {
            $sql = "INSERT INTO staff_languages (staff_id, language_code, cefr_level) VALUES (?, ?, ?)";
            
            foreach ($languages as $lang) {
                $this->db->query($sql, [
                    $staffId,
                    $lang['language_code'],
                    $lang['cefr_level'] ?? 'B2'
                ]);
            }
        }
    }
    
    public function delete($id) {
        // Delete staff languages first (foreign key constraint)
        $this->db->query("DELETE FROM staff_languages WHERE staff_id = ?", [$id]);
        
        // Delete service_staff associations
        $this->db->query("DELETE FROM service_staff WHERE staff_id = ?", [$id]);
        
        // Delete staff member
        $this->db->query("DELETE FROM staff WHERE id = ?", [$id]);
        
        return true;
    }
    
    public function getContactableStaff($providerId) {
        $sql = "SELECT * FROM staff 
                WHERE provider_id = ? 
                AND is_public = TRUE 
                AND is_active = TRUE 
                AND contact_enabled = TRUE
                ORDER BY is_contact_person DESC, sort_order, created_at";
                
        $staff = $this->db->fetchAll($sql, [$providerId]);
        
        // Add languages for each staff member
        foreach ($staff as &$member) {
            $langSql = "SELECT sl.*, l.name_en, l.name_native 
                        FROM staff_languages sl 
                        JOIN languages l ON sl.language_code = l.code 
                        WHERE sl.staff_id = ?";
            $member['languages'] = $this->db->fetchAll($langSql, [$member['id']]);
        }
        
        return $staff;
    }
}
?>