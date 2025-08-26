-- Lingora Database Schema
-- MySQL 8.0 compatible

-- Create database (if needed)
-- CREATE DATABASE IF NOT EXISTS lingora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE lingora;

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('provider', 'admin') NOT NULL DEFAULT 'provider',
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_verification_token (email_verification_token),
    INDEX idx_password_reset_token (password_reset_token)
);

-- Languages table (for filtering and labels)
CREATE TABLE IF NOT EXISTS languages (
    code VARCHAR(10) PRIMARY KEY, -- ISO 639-1 code (e.g., 'en', 'nl', 'zh-Hans')
    name_en VARCHAR(100) NOT NULL, -- English name
    name_native VARCHAR(100) NOT NULL, -- Native name
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
);

-- Categories table (hierarchical service categories)
CREATE TABLE IF NOT EXISTS categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    parent_id INT UNSIGNED NULL,
    name_nl VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    name_de VARCHAR(255),
    name_ar VARCHAR(255),
    name_zgh VARCHAR(255),
    name_uk VARCHAR(255),
    name_pl VARCHAR(255),
    name_zh VARCHAR(255),
    name_yue VARCHAR(255),
    name_es VARCHAR(255),
    name_hi VARCHAR(255),
    name_tr VARCHAR(255),
    name_fr VARCHAR(255),
    name_ti VARCHAR(255),
    name_so VARCHAR(255),
    description_nl TEXT,
    description_en TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_parent (parent_id),
    INDEX idx_slug (slug),
    INDEX idx_active (is_active),
    INDEX idx_sort (sort_order)
);

-- Providers table (business profiles)
CREATE TABLE IF NOT EXISTS providers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL UNIQUE,
    business_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    kvk_number VARCHAR(20) NOT NULL UNIQUE,
    btw_number VARCHAR(25) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(10) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    website VARCHAR(255),
    bio_nl TEXT,
    bio_en TEXT,
    bio_de TEXT,
    bio_ar TEXT,
    bio_zgh TEXT,
    bio_uk TEXT,
    bio_pl TEXT,
    bio_zh TEXT,
    bio_yue TEXT,
    bio_es TEXT,
    bio_hi TEXT,
    bio_tr TEXT,
    bio_fr TEXT,
    bio_ti TEXT,
    bio_so TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    trial_start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subscription_status ENUM('trial', 'active', 'frozen') DEFAULT 'trial',
    subscription_end_date TIMESTAMP NULL,
    opening_hours JSON, -- Store opening hours as JSON
    gallery JSON, -- Store gallery image paths as JSON array
    profile_completeness_score INT DEFAULT 0, -- For ranking
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_slug (slug),
    INDEX idx_kvk (kvk_number),
    INDEX idx_btw (btw_number),
    INDEX idx_status (status),
    INDEX idx_subscription_status (subscription_status),
    INDEX idx_location (latitude, longitude),
    INDEX idx_city (city),
    INDEX idx_trial_end (trial_start_date),
    INDEX idx_completeness (profile_completeness_score)
);

-- Provider Languages (many-to-many with CEFR levels)
CREATE TABLE IF NOT EXISTS provider_languages (
    provider_id INT UNSIGNED NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    cefr_level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (provider_id, language_code),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code) ON DELETE CASCADE,
    INDEX idx_language (language_code),
    INDEX idx_level (cefr_level)
);

-- Staff members (team members for each provider)
CREATE TABLE IF NOT EXISTS staff (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider_id INT UNSIGNED NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    linkedin VARCHAR(255),
    photo VARCHAR(255),
    is_public BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    INDEX idx_provider (provider_id),
    INDEX idx_public (is_public),
    INDEX idx_sort (sort_order)
);

-- Staff Languages (many-to-many with CEFR levels)
CREATE TABLE IF NOT EXISTS staff_languages (
    staff_id INT UNSIGNED NOT NULL,
    language_code VARCHAR(10) NOT NULL,
    cefr_level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (staff_id, language_code),
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    FOREIGN KEY (language_code) REFERENCES languages(code) ON DELETE CASCADE,
    INDEX idx_language (language_code),
    INDEX idx_level (cefr_level)
);

-- Services table (specific offerings by providers)
CREATE TABLE IF NOT EXISTS services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider_id INT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description_nl TEXT,
    description_en TEXT,
    description_de TEXT,
    description_ar TEXT,
    description_zgh TEXT,
    description_uk TEXT,
    description_pl TEXT,
    description_zh TEXT,
    description_yue TEXT,
    description_es TEXT,
    description_hi TEXT,
    description_tr TEXT,
    description_fr TEXT,
    description_ti TEXT,
    description_so TEXT,
    price_range_min DECIMAL(10, 2),
    price_range_max DECIMAL(10, 2),
    price_currency VARCHAR(3) DEFAULT 'EUR',
    service_mode ENUM('in_person', 'online', 'both') NOT NULL,
    contact_staff_id INT UNSIGNED,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (contact_staff_id) REFERENCES staff(id) ON DELETE SET NULL,
    INDEX idx_provider (provider_id),
    INDEX idx_category (category_id),
    INDEX idx_active (is_active),
    INDEX idx_mode (service_mode),
    INDEX idx_sort (sort_order)
);

-- Messages table (contact form submissions)
CREATE TABLE IF NOT EXISTS messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider_id INT UNSIGNED NOT NULL,
    service_id INT UNSIGNED,
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(10) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    ip_address VARCHAR(45) NOT NULL, -- IPv6 compatible
    user_agent TEXT,
    status ENUM('new', 'read', 'responded') DEFAULT 'new',
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (preferred_language) REFERENCES languages(code),
    INDEX idx_provider (provider_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at),
    INDEX idx_ip (ip_address)
);

-- Reports table (abuse reports)
CREATE TABLE IF NOT EXISTS reports (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider_id INT UNSIGNED NOT NULL,
    reporter_name VARCHAR(255),
    reporter_email VARCHAR(255),
    reason VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    status ENUM('pending', 'reviewed', 'action_taken', 'dismissed') DEFAULT 'pending',
    reviewed_by INT UNSIGNED,
    reviewed_at TIMESTAMP NULL,
    action_taken TEXT,
    ip_address VARCHAR(45) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_provider (provider_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
);

-- Rate limiting table (anti-abuse)
CREATE TABLE IF NOT EXISTS rate_limits (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    endpoint VARCHAR(100) NOT NULL,
    request_count INT DEFAULT 1,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ip_endpoint (ip_address, endpoint),
    INDEX idx_window (window_start)
);

-- Contact reveals table (click tracking for anti-scrape)
CREATE TABLE IF NOT EXISTS contact_reveals (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    provider_id INT UNSIGNED NOT NULL,
    staff_id INT UNSIGNED,
    contact_type ENUM('email', 'phone', 'whatsapp', 'linkedin', 'website') NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
    INDEX idx_provider (provider_id),
    INDEX idx_staff (staff_id),
    INDEX idx_ip (ip_address),
    INDEX idx_created (created_at)
);

-- Geocoding cache (to reduce API calls)
CREATE TABLE IF NOT EXISTS geocoding_cache (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    address_hash VARCHAR(64) NOT NULL UNIQUE, -- SHA256 of normalized address
    original_address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(10),
    formatted_address TEXT,
    confidence_score DECIMAL(3, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_hash (address_hash),
    INDEX idx_location (latitude, longitude)
);

-- Site settings table (configurable site options)
CREATE TABLE IF NOT EXISTS site_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT,
    setting_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Pages table (legal pages, etc.)
CREATE TABLE IF NOT EXISTS pages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title_nl VARCHAR(255) NOT NULL,
    title_en VARCHAR(255) NOT NULL,
    content_nl LONGTEXT NOT NULL,
    content_en LONGTEXT NOT NULL,
    is_published BOOLEAN DEFAULT TRUE,
    meta_description_nl VARCHAR(160),
    meta_description_en VARCHAR(160),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_published (is_published)
);