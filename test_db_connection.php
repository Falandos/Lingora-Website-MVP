<?php
// Simple test script to verify database connection
// Run this after setting up MySQL: php test_db_connection.php

require_once 'backend/config/database.php';

echo "Testing Lingora Database Connection...\n";
echo str_repeat("-", 40) . "\n";

try {
    $db = new Database();
    $pdo = $db->connect();
    
    echo "✅ Database connection successful!\n";
    
    // Test basic queries
    $languages = $db->fetchAll("SELECT COUNT(*) as count FROM languages");
    echo "✅ Languages table: " . $languages[0]['count'] . " records\n";
    
    $categories = $db->fetchAll("SELECT COUNT(*) as count FROM categories");  
    echo "✅ Categories table: " . $categories[0]['count'] . " records\n";
    
    $users = $db->fetchAll("SELECT COUNT(*) as count FROM users");
    echo "✅ Users table: " . $users[0]['count'] . " records\n";
    
    // Test a sample search query (simplified)
    $sample = $db->fetchAll("SELECT business_name FROM providers LIMIT 1");
    if (empty($sample)) {
        echo "ℹ️  No providers yet - that's expected for fresh install\n";
    } else {
        echo "✅ Sample provider: " . $sample[0]['business_name'] . "\n";
    }
    
    echo str_repeat("-", 40) . "\n";
    echo "🎉 Database is ready for Lingora backend!\n";
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
    echo "\nPlease check:\n";
    echo "- MySQL service is running\n";
    echo "- Database 'lingora' exists\n"; 
    echo "- Credentials in backend/config/database.php are correct\n";
}
?>