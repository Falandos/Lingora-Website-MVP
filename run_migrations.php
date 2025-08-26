<?php
// Run database migrations for Lingora
echo "Running Lingora Database Migrations...\n";
echo str_repeat("-", 50) . "\n";

try {
    // Connect to database
    $pdo = new PDO('mysql:host=localhost;dbname=lingora;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo "✅ Connected to database\n";
    
    // Read and execute schema file
    $schemaFile = 'backend/migrations/001_create_database_schema.sql';
    if (file_exists($schemaFile)) {
        $sql = file_get_contents($schemaFile);
        
        // Split by semicolons and execute each statement
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        foreach ($statements as $statement) {
            if (!empty($statement) && !str_starts_with(trim($statement), '--')) {
                $pdo->exec($statement);
            }
        }
        echo "✅ Schema created successfully\n";
    }
    
    // Read and execute data file
    $dataFile = 'backend/migrations/002_insert_initial_data.sql';
    if (file_exists($dataFile)) {
        $sql = file_get_contents($dataFile);
        
        // Split by semicolons and execute each statement
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        foreach ($statements as $statement) {
            if (!empty($statement) && !str_starts_with(trim($statement), '--')) {
                try {
                    $pdo->exec($statement);
                } catch (PDOException $e) {
                    // Skip if data already exists
                    if (!str_contains($e->getMessage(), 'Duplicate entry')) {
                        throw $e;
                    }
                }
            }
        }
        echo "✅ Initial data inserted successfully\n";
    }
    
    // Verify setup
    $languages = $pdo->query("SELECT COUNT(*) as count FROM languages")->fetch();
    echo "✅ Languages: " . $languages['count'] . "\n";
    
    $categories = $pdo->query("SELECT COUNT(*) as count FROM categories")->fetch(); 
    echo "✅ Categories: " . $categories['count'] . "\n";
    
    $users = $pdo->query("SELECT COUNT(*) as count FROM users")->fetch();
    echo "✅ Users: " . $users['count'] . "\n";
    
    echo str_repeat("-", 50) . "\n";
    echo "🎉 Database setup complete!\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>