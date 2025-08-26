<?php
// Create complete provider schema for Lingora
echo "Creating Provider Database Schema...\n";
echo str_repeat("-", 50) . "\n";

try {
    $pdo = new PDO('mysql:host=localhost;dbname=lingora;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo "✅ Connected to database\n";
    
    // Create providers table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS providers (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id INT UNSIGNED NOT NULL,
            business_name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(50),
            website VARCHAR(255),
            
            -- Address and location
            address VARCHAR(255) NOT NULL,
            city VARCHAR(100) NOT NULL,
            postal_code VARCHAR(20),
            country VARCHAR(100) DEFAULT 'Netherlands',
            latitude DECIMAL(10,8),
            longitude DECIMAL(11,8),
            
            -- Business details
            kvk_number VARCHAR(20) NOT NULL UNIQUE,
            btw_number VARCHAR(20),
            bio_nl TEXT,
            bio_en TEXT,
            
            -- Business hours (JSON format)
            opening_hours JSON,
            
            -- Gallery (JSON array of image URLs)
            gallery JSON,
            
            -- Status and subscription
            status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending',
            subscription_status ENUM('trial', 'active', 'frozen', 'cancelled') DEFAULT 'trial',
            trial_started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            trial_expires_at TIMESTAMP NULL DEFAULT NULL,
            approved_at TIMESTAMP NULL DEFAULT NULL,
            
            -- Metadata
            profile_completeness_score INT DEFAULT 0,
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            INDEX idx_business_name (business_name),
            INDEX idx_slug (slug),
            INDEX idx_city (city),
            INDEX idx_location (latitude, longitude),
            INDEX idx_status (status),
            INDEX idx_kvk (kvk_number)
        )
    ");
    echo "✅ Providers table created\n";
    
    // Create services table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS services (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            provider_id INT UNSIGNED NOT NULL,
            category_id INT UNSIGNED NOT NULL,
            
            title VARCHAR(255) NOT NULL,
            description_nl TEXT,
            description_en TEXT,
            
            price_min DECIMAL(8,2),
            price_max DECIMAL(8,2),
            price_description VARCHAR(255),
            
            service_mode ENUM('in_person', 'online', 'both') DEFAULT 'in_person',
            duration_minutes INT,
            
            is_active BOOLEAN DEFAULT TRUE,
            sort_order INT DEFAULT 0,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id),
            INDEX idx_provider (provider_id),
            INDEX idx_category (category_id),
            INDEX idx_active (is_active)
        )
    ");
    echo "✅ Services table created\n";
    
    // Create staff table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS staff (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            provider_id INT UNSIGNED NOT NULL,
            
            name VARCHAR(255) NOT NULL,
            role VARCHAR(100),
            bio_nl TEXT,
            bio_en TEXT,
            
            email VARCHAR(255),
            phone VARCHAR(50),
            photo_url VARCHAR(500),
            
            is_contact_person BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            sort_order INT DEFAULT 0,
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
            INDEX idx_provider (provider_id),
            INDEX idx_active (is_active)
        )
    ");
    echo "✅ Staff table created\n";
    
    // Create provider_languages table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS provider_languages (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            provider_id INT UNSIGNED NOT NULL,
            language_code VARCHAR(10) NOT NULL,
            cefr_level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native') DEFAULT 'B2',
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
            FOREIGN KEY (language_code) REFERENCES languages(code),
            UNIQUE KEY unique_provider_language (provider_id, language_code),
            INDEX idx_provider (provider_id),
            INDEX idx_language (language_code)
        )
    ");
    echo "✅ Provider languages table created\n";
    
    // Create staff_languages table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS staff_languages (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            staff_id INT UNSIGNED NOT NULL,
            language_code VARCHAR(10) NOT NULL,
            cefr_level ENUM('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native') DEFAULT 'B2',
            
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE,
            FOREIGN KEY (language_code) REFERENCES languages(code),
            UNIQUE KEY unique_staff_language (staff_id, language_code),
            INDEX idx_staff (staff_id),
            INDEX idx_language (language_code)
        )
    ");
    echo "✅ Staff languages table created\n";
    
    // Verify all tables exist
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    echo "✅ Tables created: " . count($tables) . "\n";
    echo "📋 " . implode(", ", $tables) . "\n";
    
    echo str_repeat("-", 50) . "\n";
    echo "🎉 Provider schema setup complete!\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>