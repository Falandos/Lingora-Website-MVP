-- Enhanced Support Tickets System
-- Adds comprehensive ticket management with file uploads and notifications
-- MySQL 8.0 compatible

-- Support tickets main table (enhanced from basic version)
CREATE TABLE IF NOT EXISTS support_tickets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_number VARCHAR(20) NOT NULL UNIQUE, -- Format: TKT-YYYYMMDD-XXXX
    user_id INT UNSIGNED NOT NULL, -- References users table
    provider_id INT UNSIGNED, -- NULL for admin-submitted tickets
    user_email VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'open', 'in_progress', 'pending', 'resolved', 'closed') DEFAULT 'new',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    category ENUM(
        'bug_report', 
        'feature_request', 
        'ui_issue', 
        'performance_issue',
        'account_issue',
        'payment_issue',
        'technical_support',
        'general_inquiry',
        'abuse_report'
    ) DEFAULT 'general_inquiry',
    assigned_to INT UNSIGNED, -- Admin user who handles this ticket
    resolution_notes TEXT, -- Final resolution summary
    customer_satisfaction_rating TINYINT UNSIGNED, -- 1-5 rating
    customer_satisfaction_feedback TEXT,
    estimated_resolution_time INT, -- Minutes
    actual_resolution_time INT, -- Minutes from creation to resolution
    tags JSON, -- Array of string tags for categorization
    metadata JSON, -- Additional structured data
    ip_address VARCHAR(45), -- IPv6 compatible
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    
    -- Foreign Keys
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_ticket_number (ticket_number),
    INDEX idx_user_id (user_id),
    INDEX idx_provider_id (provider_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_category (category),
    INDEX idx_assigned_to (assigned_to),
    INDEX idx_created_at (created_at),
    INDEX idx_status_priority (status, priority),
    INDEX idx_user_status (user_id, status),
    INDEX idx_provider_status (provider_id, status)
);

-- Support ticket responses (chat-like messaging)
CREATE TABLE IF NOT EXISTS support_ticket_responses (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT UNSIGNED NOT NULL,
    responder_id INT UNSIGNED, -- User ID of responder
    responder_type ENUM('user', 'provider', 'admin') NOT NULL,
    responder_email VARCHAR(255) NOT NULL,
    responder_name VARCHAR(255),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal admin notes
    is_auto_response BOOLEAN DEFAULT FALSE, -- System-generated response
    response_type ENUM('message', 'status_update', 'assignment', 'resolution') DEFAULT 'message',
    metadata JSON, -- Additional response data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (responder_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_responder_id (responder_id),
    INDEX idx_responder_type (responder_type),
    INDEX idx_created_at (created_at),
    INDEX idx_ticket_created (ticket_id, created_at),
    INDEX idx_internal (is_internal)
);

-- File attachments for tickets and responses
CREATE TABLE IF NOT EXISTS support_ticket_attachments (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT UNSIGNED NOT NULL,
    response_id INT UNSIGNED, -- NULL for initial ticket attachments
    uploader_id INT UNSIGNED,
    uploader_type ENUM('user', 'provider', 'admin') NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL UNIQUE,
    file_path VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED NOT NULL, -- Bytes
    file_type VARCHAR(100) NOT NULL, -- MIME type
    file_extension VARCHAR(10) NOT NULL,
    is_image BOOLEAN DEFAULT FALSE,
    thumbnail_path VARCHAR(500), -- For image files
    upload_status ENUM('uploading', 'completed', 'failed', 'virus_detected', 'deleted') DEFAULT 'uploading',
    virus_scan_result VARCHAR(100), -- Virus scan status
    download_count INT DEFAULT 0,
    metadata JSON, -- Image dimensions, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (response_id) REFERENCES support_ticket_responses(id) ON DELETE CASCADE,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_response_id (response_id),
    INDEX idx_uploader_id (uploader_id),
    INDEX idx_stored_filename (stored_filename),
    INDEX idx_file_type (file_type),
    INDEX idx_upload_status (upload_status),
    INDEX idx_created_at (created_at)
);

-- Activity log for audit trail
CREATE TABLE IF NOT EXISTS support_ticket_activity (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED,
    user_type ENUM('user', 'provider', 'admin', 'system') NOT NULL,
    activity_type ENUM(
        'created',
        'status_changed',
        'priority_changed',
        'category_changed',
        'assigned',
        'unassigned',
        'responded',
        'attachment_added',
        'attachment_removed',
        'resolved',
        'reopened',
        'closed',
        'rated',
        'escalated'
    ) NOT NULL,
    description TEXT NOT NULL, -- Human-readable description
    old_value VARCHAR(255), -- Previous value for changes
    new_value VARCHAR(255), -- New value for changes
    metadata JSON, -- Additional activity data
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at),
    INDEX idx_ticket_activity (ticket_id, activity_type),
    INDEX idx_ticket_created (ticket_id, created_at)
);

-- Notification system for ticket updates
CREATE TABLE IF NOT EXISTS support_notifications (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL, -- Who should receive the notification
    notification_type ENUM(
        'ticket_created',
        'ticket_updated',
        'new_response',
        'status_changed',
        'ticket_assigned',
        'ticket_resolved',
        'ticket_closed',
        'escalation_due',
        'satisfaction_request'
    ) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP NULL,
    read_at TIMESTAMP NULL,
    metadata JSON, -- Additional notification data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_ticket_id (ticket_id),
    INDEX idx_user_id (user_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_is_read (is_read),
    INDEX idx_created_at (created_at),
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_user_created (user_id, created_at)
);

-- Insert default categories and priorities configuration
INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('support_categories', JSON_ARRAY(
    JSON_OBJECT('id', 'bug_report', 'name_en', 'Bug Report', 'name_nl', 'Bug Rapport', 'color', '#ef4444'),
    JSON_OBJECT('id', 'feature_request', 'name_en', 'Feature Request', 'name_nl', 'Functie Verzoek', 'color', '#3b82f6'),
    JSON_OBJECT('id', 'ui_issue', 'name_en', 'UI Issue', 'name_nl', 'UI Probleem', 'color', '#f59e0b'),
    JSON_OBJECT('id', 'performance_issue', 'name_en', 'Performance Issue', 'name_nl', 'Performance Probleem', 'color', '#ef4444'),
    JSON_OBJECT('id', 'account_issue', 'name_en', 'Account Issue', 'name_nl', 'Account Probleem', 'color', '#8b5cf6'),
    JSON_OBJECT('id', 'payment_issue', 'name_en', 'Payment Issue', 'name_nl', 'Betaling Probleem', 'color', '#dc2626'),
    JSON_OBJECT('id', 'technical_support', 'name_en', 'Technical Support', 'name_nl', 'Technische Ondersteuning', 'color', '#059669'),
    JSON_OBJECT('id', 'general_inquiry', 'name_en', 'General Inquiry', 'name_nl', 'Algemene Vraag', 'color', '#6b7280'),
    JSON_OBJECT('id', 'abuse_report', 'name_en', 'Abuse Report', 'name_nl', 'Misbruik Rapport', 'color', '#dc2626')
), 'json', 'Support ticket categories configuration'),
('support_priorities', JSON_ARRAY(
    JSON_OBJECT('id', 'low', 'name_en', 'Low', 'name_nl', 'Laag', 'color', '#6b7280', 'sla_hours', 72),
    JSON_OBJECT('id', 'medium', 'name_en', 'Medium', 'name_nl', 'Gemiddeld', 'color', '#3b82f6', 'sla_hours', 24),
    JSON_OBJECT('id', 'high', 'name_en', 'High', 'name_nl', 'Hoog', 'color', '#f59e0b', 'sla_hours', 8),
    JSON_OBJECT('id', 'urgent', 'name_en', 'Urgent', 'name_nl', 'Urgent', 'color', '#ef4444', 'sla_hours', 2)
), 'json', 'Support ticket priorities configuration'),
('support_file_upload_max_size', '10485760', 'integer', 'Maximum file upload size in bytes (10MB)'),
('support_allowed_file_types', JSON_ARRAY('jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'zip'), 'json', 'Allowed file extensions for ticket attachments'),
('support_auto_assignment_enabled', 'false', 'boolean', 'Enable automatic ticket assignment to least loaded admin'),
('support_email_notifications_enabled', 'true', 'boolean', 'Enable email notifications for ticket updates'),
('support_customer_satisfaction_enabled', 'true', 'boolean', 'Enable customer satisfaction surveys after ticket resolution');

-- Create upload directory structure (requires manual creation)
-- Directory: /backend/uploads/support/tickets/YYYY/MM/
-- Directory: /backend/uploads/support/thumbnails/YYYY/MM/