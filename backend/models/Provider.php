<?php
// Provider model for business profiles

class Provider {
    private $db;
    
    public function __construct() {
        $this->db = new Database();
    }
    
    public function create($data) {
        $sql = "INSERT INTO providers (
            user_id, business_name, slug, kvk_number, btw_number,
            address, city, postal_code, trial_started_at, created_at
        ) VALUES (?, ?, ?, ?, ?, '', '', '', NOW(), NOW())";
        
        $slug = $this->generateUniqueSlug($data['business_name']);
        
        $this->db->query($sql, [
            $data['user_id'],
            $data['business_name'],
            $slug,
            $data['kvk_number'],
            $data['btw_number']
        ]);
        
        $providerId = $this->db->lastInsertId();
        return $this->findById($providerId);
    }
    
    public function findById($id) {
        $sql = "SELECT p.*, u.email, u.email_verified 
                FROM providers p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.id = ?";
        return $this->db->fetchOne($sql, [$id]);
    }
    
    public function findByUserId($userId) {
        $sql = "SELECT * FROM providers WHERE user_id = ?";
        return $this->db->fetchOne($sql, [$userId]);
    }
    
    public function findBySlug($slug) {
        $sql = "SELECT p.*, u.email 
                FROM providers p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.slug = ?";
        return $this->db->fetchOne($sql, [$slug]);
    }
    
    public function update($id, $data) {
        $allowedFields = [
            'business_name', 'address', 'city', 'postal_code', 'phone', 'website',
            'bio_nl', 'bio_en', 'bio_de', 'bio_ar', 'bio_zgh', 'bio_uk', 'bio_pl',
            'bio_zh', 'bio_yue', 'bio_es', 'bio_hi', 'bio_tr', 'bio_fr', 'bio_ti', 'bio_so',
            'opening_hours', 'latitude', 'longitude'
        ];
        
        $updates = [];
        $params = [];
        
        foreach ($allowedFields as $field) {
            if (array_key_exists($field, $data)) {
                if ($field === 'opening_hours') {
                    $updates[] = "$field = ?";
                    $params[] = json_encode($data[$field]);
                } else {
                    $updates[] = "$field = ?";
                    $params[] = $data[$field];
                }
            }
        }
        
        if (empty($updates)) {
            return $this->findById($id);
        }
        
        // Update slug if business name changed
        if (isset($data['business_name'])) {
            $newSlug = $this->generateUniqueSlug($data['business_name'], $id);
            $updates[] = "slug = ?";
            $params[] = $newSlug;
        }
        
        $updates[] = "updated_at = NOW()";
        $params[] = $id;
        
        $sql = "UPDATE providers SET " . implode(', ', $updates) . " WHERE id = ?";
        $this->db->query($sql, $params);
        
        // Update profile completeness score
        $this->updateCompletenessScore($id);
        
        return $this->findById($id);
    }
    
    public function updateStatus($id, $status, $rejectionReason = null) {
        $sql = "UPDATE providers SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?";
        $this->db->query($sql, [$status, $rejectionReason, $id]);
        
        return $this->findById($id);
    }
    
    public function updateSubscriptionStatus($id, $status, $endDate = null) {
        $sql = "UPDATE providers SET subscription_status = ?, subscription_end_date = ?, updated_at = NOW() WHERE id = ?";
        $this->db->query($sql, [$status, $endDate, $id]);
        
        return $this->findById($id);
    }
    
    public function getLanguages($providerId) {
        $sql = "SELECT pl.*, l.name_en, l.name_native 
                FROM provider_languages pl
                LEFT JOIN languages l ON pl.language_code = l.code
                WHERE pl.provider_id = ?
                ORDER BY l.sort_order";
        return $this->db->fetchAll($sql, [$providerId]);
    }
    
    public function setLanguages($providerId, $languages) {
        // Remove existing languages
        $this->db->query("DELETE FROM provider_languages WHERE provider_id = ?", [$providerId]);
        
        // Add new languages
        if (!empty($languages)) {
            $sql = "INSERT INTO provider_languages (provider_id, language_code, cefr_level) VALUES (?, ?, ?)";
            
            foreach ($languages as $lang) {
                $this->db->query($sql, [
                    $providerId,
                    $lang['language_code'],
                    $lang['cefr_level']
                ]);
            }
        }
        
        $this->updateCompletenessScore($providerId);
    }
    
    public function getServices($providerId) {
        $sql = "SELECT s.*, c.name_en as category_name
                FROM services s
                LEFT JOIN categories c ON s.category_id = c.id
                WHERE s.provider_id = ? AND s.is_active = TRUE
                ORDER BY s.sort_order, s.created_at";
        $services = $this->db->fetchAll($sql, [$providerId]);
        
        // Get staff associations for each service
        for ($i = 0; $i < count($services); $i++) {
            $service = &$services[$i];
            
            $staffSql = "SELECT st.*, ss.is_primary, sl.language_code, sl.cefr_level, l.name_en as language_name, l.name_native
                         FROM service_staff ss
                         JOIN staff st ON ss.staff_id = st.id
                         LEFT JOIN staff_languages sl ON st.id = sl.staff_id
                         LEFT JOIN languages l ON sl.language_code = l.code
                         WHERE ss.service_id = ? AND st.is_active = TRUE
                         ORDER BY ss.is_primary DESC, st.sort_order, st.created_at";
            
            $staffData = $this->db->fetchAll($staffSql, [$service['id']]);
            
            // Group languages by staff member
            $staffById = [];
            foreach ($staffData as $row) {
                if (!isset($staffById[$row['id']])) {
                    $staffById[$row['id']] = [
                        'id' => $row['id'],
                        'name' => $row['name'],
                        'role' => $row['role'],
                        'bio_nl' => $row['bio_nl'],
                        'bio_en' => $row['bio_en'],
                        'email' => $row['email'],
                        'phone' => $row['phone'],
                        'photo_url' => $row['photo_url'],
                        'is_primary' => $row['is_primary'],
                        'languages' => []
                    ];
                }
                
                if ($row['language_code']) {
                    $staffById[$row['id']]['languages'][] = [
                        'language_code' => $row['language_code'],
                        'cefr_level' => $row['cefr_level'],
                        'name_en' => $row['language_name'],
                        'name_native' => $row['name_native']
                    ];
                }
            }
            
            $services[$i]['staff'] = array_values($staffById);
        }
        
        return $services;
    }
    
    public function getStaff($providerId) {
        $sql = "SELECT * FROM staff WHERE provider_id = ? AND is_public = TRUE ORDER BY sort_order, created_at";
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
    
    public function addGalleryImage($providerId, $imagePath) {
        $provider = $this->findById($providerId);
        $gallery = json_decode($provider['gallery'] ?? '[]', true);
        
        // Check max images limit
        global $config;
        $maxImages = $config['upload']['gallery_max_images'] ?? 6;
        
        if (count($gallery) >= $maxImages) {
            throw new Exception("Maximum of $maxImages images allowed");
        }
        
        $gallery[] = $imagePath;
        
        $sql = "UPDATE providers SET gallery = ?, updated_at = NOW() WHERE id = ?";
        $this->db->query($sql, [json_encode($gallery), $providerId]);
        
        $this->updateCompletenessScore($providerId);
        
        return $gallery;
    }
    
    public function removeGalleryImage($providerId, $imagePath) {
        $provider = $this->findById($providerId);
        $gallery = json_decode($provider['gallery'] ?? '[]', true);
        
        $gallery = array_values(array_filter($gallery, function($img) use ($imagePath) {
            return $img !== $imagePath;
        }));
        
        $sql = "UPDATE providers SET gallery = ?, updated_at = NOW() WHERE id = ?";
        $this->db->query($sql, [json_encode($gallery), $providerId]);
        
        return $gallery;
    }
    
    public function isTrialExpired($providerId) {
        global $config;
        $trialDays = $config['business']['trial_period_days'] ?? 90;
        
        $sql = "SELECT DATEDIFF(NOW(), trial_started_at) as days_since_trial 
                FROM providers WHERE id = ?";
        $result = $this->db->fetchOne($sql, [$providerId]);
        
        return $result && $result['days_since_trial'] > $trialDays;
    }
    
    public function isVisible($provider) {
        // Provider is visible if:
        // 1. Approved by admin
        // 2. Not frozen (subscription active or trial not expired)
        return $provider['status'] === 'approved' && 
               $provider['subscription_status'] !== 'frozen';
    }
    
    public function getPendingApproval($limit = 20, $offset = 0) {
        $sql = "SELECT p.*, u.email, u.created_at as user_created_at
                FROM providers p
                LEFT JOIN users u ON p.user_id = u.id
                WHERE p.status = 'pending'
                ORDER BY p.created_at ASC
                LIMIT ? OFFSET ?";
        
        return $this->db->fetchAll($sql, [$limit, $offset]);
    }
    
    private function generateUniqueSlug($text, $excludeId = null) {
        $baseSlug = generate_slug($text);
        $slug = $baseSlug;
        $counter = 1;
        
        do {
            $sql = "SELECT COUNT(*) as count FROM providers WHERE slug = ?";
            $params = [$slug];
            
            if ($excludeId) {
                $sql .= " AND id != ?";
                $params[] = $excludeId;
            }
            
            $result = $this->db->fetchOne($sql, $params);
            
            if ($result['count'] == 0) {
                break;
            }
            
            $slug = $baseSlug . '-' . $counter;
            $counter++;
            
        } while (true);
        
        return $slug;
    }
    
    private function updateCompletenessScore($providerId) {
        $provider = $this->findById($providerId);
        $languages = $this->getLanguages($providerId);
        $services = $this->getServices($providerId);
        $staff = $this->getStaff($providerId);
        
        $score = 0;
        
        // Basic info (30%)
        if ($provider['business_name']) $score += 5;
        if ($provider['address']) $score += 5;
        if ($provider['city']) $score += 5;
        if ($provider['postal_code']) $score += 5;
        if ($provider['phone']) $score += 5;
        if ($provider['bio_nl'] || $provider['bio_en']) $score += 5;
        
        // Languages (20%)
        if (count($languages) > 0) $score += 10;
        if (count($languages) >= 2) $score += 5;
        if (count($languages) >= 3) $score += 5;
        
        // Services (25%)
        if (count($services) > 0) $score += 15;
        if (count($services) >= 2) $score += 5;
        if (count($services) >= 3) $score += 5;
        
        // Staff (15%)
        if (count($staff) > 0) $score += 10;
        if (count($staff) >= 2) $score += 5;
        
        // Gallery (10%)
        $gallery = json_decode($provider['gallery'] ?? '[]', true);
        if (count($gallery) > 0) $score += 5;
        if (count($gallery) >= 3) $score += 5;
        
        $sql = "UPDATE providers SET profile_completeness_score = ? WHERE id = ?";
        $this->db->query($sql, [$score, $providerId]);
        
        return $score;
    }
    
    public function getAnalytics($providerId, $days = 30) {
        // Calculate date range
        $endDate = date('Y-m-d');
        $startDate = date('Y-m-d', strtotime("-{$days} days"));
        
        // Base query for provider's views within date range
        $dateFilter = "pv.created_at >= ? AND pv.created_at <= CONCAT(?, ' 23:59:59') AND pv.provider_id = ?";
        
        // 1. Overview statistics
        $overviewSql = "SELECT 
            COUNT(*) as total_views,
            COUNT(DISTINCT pv.session_id) as unique_visitors,
            ROUND(COUNT(*) / ?, 1) as avg_views_per_day
            FROM page_views pv 
            WHERE {$dateFilter}";
        
        $overview = $this->db->fetchOne($overviewSql, [$days, $startDate, $endDate, $providerId]);
        
        // 2. Language breakdown
        $languageSql = "SELECT 
            COALESCE(pv.viewer_language, 'unknown') as language,
            COUNT(*) as views,
            ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM page_views WHERE {$dateFilter}), 1) as percentage
            FROM page_views pv 
            WHERE {$dateFilter}
            GROUP BY pv.viewer_language 
            ORDER BY views DESC";
        
        $languageBreakdown = $this->db->fetchAll($languageSql, [$startDate, $endDate, $providerId, $startDate, $endDate, $providerId]);
        
        // 3. Peak times (hourly breakdown)
        $peakTimesSql = "SELECT 
            HOUR(pv.created_at) as hour,
            CONCAT(
                CASE 
                    WHEN HOUR(pv.created_at) = 0 THEN '12 AM'
                    WHEN HOUR(pv.created_at) < 12 THEN CONCAT(HOUR(pv.created_at), ' AM')
                    WHEN HOUR(pv.created_at) = 12 THEN '12 PM'
                    ELSE CONCAT(HOUR(pv.created_at) - 12, ' PM')
                END
            ) as time_label,
            COUNT(*) as views
            FROM page_views pv 
            WHERE {$dateFilter}
            GROUP BY HOUR(pv.created_at)
            ORDER BY views DESC";
            
        $peakTimes = $this->db->fetchAll($peakTimesSql, [$startDate, $endDate, $providerId]);
        
        // 4. Daily trend
        $dailyTrendSql = "SELECT 
            DATE(pv.created_at) as date,
            COUNT(*) as views
            FROM page_views pv 
            WHERE {$dateFilter}
            GROUP BY DATE(pv.created_at)
            ORDER BY date ASC";
            
        $dailyTrend = $this->db->fetchAll($dailyTrendSql, [$startDate, $endDate, $providerId]);
        
        // 5. Section breakdown
        $sectionSql = "SELECT 
            COALESCE(pv.page_section, 'main') as section,
            COUNT(*) as views
            FROM page_views pv 
            WHERE {$dateFilter}
            GROUP BY pv.page_section
            ORDER BY views DESC";
            
        $sectionBreakdown = $this->db->fetchAll($sectionSql, [$startDate, $endDate, $providerId]);
        
        // Format the response
        return [
            'period' => [
                'days' => (int)$days,
                'start_date' => $startDate,
                'end_date' => $endDate
            ],
            'overview' => [
                'total_views' => (int)($overview['total_views'] ?? 0),
                'unique_visitors' => (int)($overview['unique_visitors'] ?? 0),
                'avg_views_per_day' => (float)($overview['avg_views_per_day'] ?? 0)
            ],
            'language_breakdown' => array_map(function($item) {
                return [
                    'language' => $item['language'] ?? 'unknown',
                    'views' => (int)$item['views'],
                    'percentage' => (float)$item['percentage']
                ];
            }, $languageBreakdown),
            'peak_times' => array_map(function($item) {
                return [
                    'hour' => (int)$item['hour'],
                    'time_label' => $item['time_label'],
                    'views' => (int)$item['views']
                ];
            }, $peakTimes),
            'daily_trend' => array_map(function($item) {
                return [
                    'date' => $item['date'],
                    'views' => (int)$item['views']
                ];
            }, $dailyTrend),
            'section_breakdown' => array_map(function($item) {
                return [
                    'section' => $item['section'] ?? 'main',
                    'views' => (int)$item['views']
                ];
            }, $sectionBreakdown)
        ];
    }
}
?>