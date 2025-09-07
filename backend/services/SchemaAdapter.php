<?php

class SchemaAdapter {
    private $db;
    private $capabilities;
    private static $instance;

    public function __construct($database) {
        $this->db = $database;
        $this->capabilities = $this->detectCapabilities();
    }

    /**
     * Singleton pattern for performance
     */
    public static function getInstance($database = null) {
        if (!self::$instance) {
            $database = $database ?: new Database();
            self::$instance = new self($database);
        }
        return self::$instance;
    }

    /**
     * Detect what features the current schema supports
     */
    private function detectCapabilities() {
        $capabilities = [
            'tables' => [],
            'columns' => [],
            'features' => []
        ];

        // Check tables
        $tables = ['support_tickets', 'support_ticket_responses', 'support_ticket_attachments', 
                  'support_ticket_activity', 'support_notifications', 'ticket_responses'];
        
        foreach ($tables as $table) {
            $capabilities['tables'][$table] = $this->tableExists($table);
        }

        // Check support_tickets columns
        if ($capabilities['tables']['support_tickets']) {
            $columns = ['user_id', 'assigned_to', 'actual_resolution_time', 
                       'customer_satisfaction_rating', 'resolution_notes', 'tags', 'metadata'];
            
            foreach ($columns as $column) {
                $capabilities['columns']['support_tickets_' . $column] = $this->columnExists('support_tickets', $column);
            }
        }

        // Determine feature availability
        $capabilities['features'] = [
            'enhanced_statistics' => $capabilities['columns']['support_tickets_actual_resolution_time'] ?? false,
            'satisfaction_rating' => $capabilities['columns']['support_tickets_customer_satisfaction_rating'] ?? false,
            'file_attachments' => $capabilities['tables']['support_ticket_attachments'] ?? false,
            'activity_logging' => $capabilities['tables']['support_ticket_activity'] ?? false,
            'notifications' => $capabilities['tables']['support_notifications'] ?? false,
            'response_system' => $capabilities['tables']['support_ticket_responses'] || $capabilities['tables']['ticket_responses'],
            'basic_tickets' => $capabilities['tables']['support_tickets'] ?? false
        ];

        return $capabilities;
    }

    /**
     * Check if table exists
     */
    private function tableExists($tableName) {
        try {
            $stmt = $this->db->prepare("SHOW TABLES LIKE ?");
            $stmt->execute([$tableName]);
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Check if column exists in table
     */
    private function columnExists($tableName, $columnName) {
        try {
            $stmt = $this->db->prepare("SHOW COLUMNS FROM `{$tableName}` LIKE ?");
            $stmt->execute([$columnName]);
            return $stmt->rowCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Get feature capability
     */
    public function hasFeature($featureName) {
        return $this->capabilities['features'][$featureName] ?? false;
    }

    /**
     * Get all capabilities
     */
    public function getCapabilities() {
        return $this->capabilities;
    }

    /**
     * Get statistics query based on available columns
     */
    public function getStatisticsQuery($whereClause = '1=1') {
        $baseQuery = "SELECT 
            COUNT(*) as total_tickets,
            SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
            SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tickets,
            SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
            SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets,
            SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent_tickets,
            SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_tickets";

        // Add enhanced statistics if columns exist
        if ($this->hasFeature('enhanced_statistics')) {
            $baseQuery .= ",
                AVG(actual_resolution_time) as avg_resolution_time_minutes";
        }

        if ($this->hasFeature('satisfaction_rating')) {
            $baseQuery .= ",
                AVG(customer_satisfaction_rating) as avg_satisfaction_rating";
        }

        $baseQuery .= " FROM support_tickets WHERE {$whereClause}";

        return $baseQuery;
    }

    /**
     * Get ticket detail query with available joins
     */
    public function getTicketDetailQuery() {
        $query = "SELECT t.* FROM support_tickets t";
        
        // Add joins based on available tables and columns
        if ($this->capabilities['columns']['support_tickets_assigned_to'] ?? false) {
            $query .= " LEFT JOIN users admin ON t.assigned_to = admin.id";
        }

        return $query;
    }

    /**
     * Get response table name (handles both legacy and new)
     */
    public function getResponseTable() {
        if ($this->capabilities['tables']['support_ticket_responses']) {
            return 'support_ticket_responses';
        } elseif ($this->capabilities['tables']['ticket_responses']) {
            return 'ticket_responses';
        }
        return null;
    }

    /**
     * Create default statistics if enhanced features not available
     */
    public function getDefaultStatistics() {
        return [
            'total_tickets' => 0,
            'open_tickets' => 0,
            'pending_tickets' => 0,
            'resolved_tickets' => 0,
            'closed_tickets' => 0,
            'urgent_tickets' => 0,
            'high_priority_tickets' => 0,
            'avg_resolution_time_minutes' => null,
            'avg_resolution_time_hours' => null,
            'avg_satisfaction_rating' => null
        ];
    }
}