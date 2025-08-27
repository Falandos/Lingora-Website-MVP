<?php
// Simple database setup for Lingora - creates tables step by step
echo "Setting up Lingora Database (Step by Step)...\n";
echo str_repeat("-", 50) . "\n";

try {
    $pdo = new PDO('mysql:host=localhost;dbname=lingora;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo "✅ Connected to database\n";
    
    // Create categories table
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS categories (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            slug VARCHAR(100) NOT NULL UNIQUE,
            parent_id INT UNSIGNED NULL,
            name_nl VARCHAR(255) NOT NULL,
            name_en VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            sort_order INT DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
            INDEX idx_slug (slug),
            INDEX idx_parent (parent_id),
            INDEX idx_active (is_active)
        )
    ");
    echo "✅ Categories table created\n";
    
    // Create users table
    $pdo->exec("
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
        )
    ");
    echo "✅ Users table created\n";
    
    // Insert languages
    $pdo->exec("
        INSERT IGNORE INTO languages (code, name_en, name_native, is_active, sort_order) VALUES
        ('nl', 'Dutch', 'Nederlands', TRUE, 1),
        ('en', 'English', 'English', TRUE, 2),
        ('de', 'German', 'Deutsch', TRUE, 3),
        ('ar', 'Arabic', 'العربية', TRUE, 4),
        ('zgh', 'Standard Moroccan Tamazight', 'ⵜⴰⵎⴰⵣⵉⵖⵜ', TRUE, 5),
        ('uk', 'Ukrainian', 'Українська', TRUE, 6),
        ('pl', 'Polish', 'Polski', TRUE, 7),
        ('zh-Hans', 'Chinese (Mandarin)', '中文 (普通话)', TRUE, 8),
        ('yue', 'Chinese (Cantonese)', '中文 (廣東話)', TRUE, 9),
        ('es', 'Spanish', 'Español', TRUE, 10),
        ('hi', 'Hindi', 'हिन्दी', TRUE, 11),
        ('tr', 'Turkish', 'Türkçe', TRUE, 12),
        ('fr', 'French', 'Français', TRUE, 13),
        ('ti', 'Tigrinya', 'ትግርኛ', TRUE, 14),
        ('so', 'Somali', 'Soomaali', TRUE, 15)
    ");
    echo "✅ Languages inserted\n";
    
    // Insert main categories
    $pdo->exec("
        INSERT IGNORE INTO categories (slug, name_nl, name_en, is_active, sort_order) VALUES
        ('healthcare', 'Gezondheidszorg', 'Healthcare', TRUE, 1),
        ('legal', 'Juridisch', 'Legal Services', TRUE, 2),
        ('education', 'Onderwijs', 'Education', TRUE, 3),
        ('finance', 'Financieel', 'Financial Services', TRUE, 4),
        ('technology', 'Technologie', 'Technology', TRUE, 5),
        ('beauty-wellness', 'Schoonheid & Wellness', 'Beauty & Wellness', TRUE, 6),
        ('home-services', 'Huis & Tuin', 'Home Services', TRUE, 7),
        ('automotive', 'Auto & Transport', 'Automotive', TRUE, 8),
        ('food-catering', 'Eten & Catering', 'Food & Catering', TRUE, 9),
        ('real-estate', 'Vastgoed', 'Real Estate', TRUE, 10)
    ");
    echo "✅ Categories inserted\n";
    
    // Create admin user (password: admin123)
    $pdo->exec("
        INSERT IGNORE INTO users (email, password_hash, role, email_verified) VALUES
        ('admin@lingora.nl', '\$2y\$10\$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE)
    ");
    echo "✅ Admin user created\n";
    
    // Verify setup
    $languages = $pdo->query("SELECT COUNT(*) as count FROM languages")->fetch();
    echo "✅ Languages: " . $languages['count'] . "\n";
    
    $categories = $pdo->query("SELECT COUNT(*) as count FROM categories")->fetch(); 
    echo "✅ Categories: " . $categories['count'] . "\n";
    
    $users = $pdo->query("SELECT COUNT(*) as count FROM users")->fetch();
    echo "✅ Users: " . $users['count'] . "\n";
    
    echo str_repeat("-", 50) . "\n";
    echo "🎉 Basic database setup complete!\n";
    echo "📝 Note: This is a minimal setup - providers and services tables will be created when needed\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>