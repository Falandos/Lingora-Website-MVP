<?php
/**
 * Setup Dutch Cities Database
 * Comprehensive list of all major Dutch cities and towns
 * Based on CBS (Dutch Statistics) and GeoNames data
 */

require_once 'C:/xampp/htdocs/lingora/backend/config/database.php';

try {
    // Initialize database connection
    $database = new Database();
    
    // Create cities table
    $createTableSql = "
    CREATE TABLE IF NOT EXISTS cities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        name_normalized VARCHAR(100) NOT NULL,
        province VARCHAR(50) NOT NULL,
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        population INT DEFAULT 0,
        is_major_city BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_normalized (name_normalized),
        INDEX idx_province (province),
        INDEX idx_major (is_major_city)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";
    
    $database->query($createTableSql);
    echo "✅ Cities table created successfully\n";
    
    // Clear existing data
    $database->query("DELETE FROM cities");
    echo "✅ Cleared existing city data\n";
    
    // Comprehensive Dutch cities data (Major cities + all provinces)
    $cities = [
        // Major cities (population > 100k)
        ['Amsterdam', 'amsterdam', 'Noord-Holland', 52.3676, 4.9041, 921402, true],
        ['Rotterdam', 'rotterdam', 'Zuid-Holland', 51.9244, 4.4777, 655468, true],
        ['Den Haag', 'den haag', 'Zuid-Holland', 52.0705, 4.3007, 548320, true],
        ['Utrecht', 'utrecht', 'Utrecht', 52.0907, 5.1214, 361966, true],
        ['Eindhoven', 'eindhoven', 'Noord-Brabant', 51.4416, 5.4697, 238326, true],
        ['Groningen', 'groningen', 'Groningen', 53.2194, 6.5665, 235287, true],
        ['Tilburg', 'tilburg', 'Noord-Brabant', 51.5555, 5.0913, 224702, true],
        ['Almere', 'almere', 'Flevoland', 52.3508, 5.2647, 218096, true],
        ['Breda', 'breda', 'Noord-Brabant', 51.5719, 4.7683, 185072, true],
        ['Nijmegen', 'nijmegen', 'Gelderland', 51.8426, 5.8518, 179073, true],
        ['Enschede', 'enschede', 'Overijssel', 52.2215, 6.8937, 159734, true],
        ['Haarlem', 'haarlem', 'Noord-Holland', 52.3874, 4.6462, 162961, true],
        ['Arnhem', 'arnhem', 'Gelderland', 51.9851, 5.8987, 161368, true],
        ['Zaanstad', 'zaanstad', 'Noord-Holland', 52.4391, 4.8278, 156711, true],
        ['s-Hertogenbosch', 's-hertogenbosch', 'Noord-Brabant', 51.6856, 5.3036, 155113, true],
        ['Den Bosch', 'den bosch', 'Noord-Brabant', 51.6856, 5.3036, 155113, true],
        ['Apeldoorn', 'apeldoorn', 'Gelderland', 52.2112, 5.9699, 164292, true],
        ['Zwolle', 'zwolle', 'Overijssel', 52.5168, 6.0830, 130592, true],
        ['Leeuwarden', 'leeuwarden', 'Friesland', 53.2012, 5.7999, 124058, true],
        ['Maastricht', 'maastricht', 'Limburg', 50.8514, 5.6913, 121565, true],
        
        // Medium cities (population 50k-100k)
        ['Amersfoort', 'amersfoort', 'Utrecht', 52.1561, 5.3878, 158231, false],
        ['Dordrecht', 'dordrecht', 'Zuid-Holland', 51.8133, 4.6901, 119300, false],
        ['Leiden', 'leiden', 'Zuid-Holland', 52.1601, 4.4970, 125174, false],
        ['Haarlemmermeer', 'haarlemmermeer', 'Noord-Holland', 52.3007, 4.6910, 156039, false],
        ['Zoetermeer', 'zoetermeer', 'Zuid-Holland', 52.0575, 4.4937, 125283, false],
        ['Emmen', 'emmen', 'Drenthe', 52.7791, 6.9095, 107055, false],
        ['Venlo', 'venlo', 'Limburg', 51.3704, 6.1724, 101797, false],
        ['Hilversum', 'hilversum', 'Noord-Holland', 52.2242, 5.1762, 92382, false],
        ['Heerlen', 'heerlen', 'Limburg', 50.8878, 5.9806, 86762, false],
        ['Purmerend', 'purmerend', 'Noord-Holland', 52.5051, 4.9593, 81233, false],
        ['Oss', 'oss', 'Noord-Brabant', 51.7655, 5.5176, 91932, false],
        ['Roosendaal', 'roosendaal', 'Noord-Brabant', 51.5308, 4.4653, 77725, false],
        ['Schiedam', 'schiedam', 'Zuid-Holland', 51.9172, 4.3889, 78739, false],
        ['Spijkenisse', 'spijkenisse', 'Zuid-Holland', 51.8447, 4.3289, 74988, false],
        ['Alphen aan den Rijn', 'alphen aan den rijn', 'Zuid-Holland', 52.1301, 4.6581, 111889, false],
        ['Hoorn', 'hoorn', 'Noord-Holland', 52.6425, 5.0597, 73259, false],
        ['Vlaardingen', 'vlaardingen', 'Zuid-Holland', 51.9122, 4.3419, 73445, false],
        ['Alkmaar', 'alkmaar', 'Noord-Holland', 52.6319, 4.7519, 109896, false],
        ['Delft', 'delft', 'Zuid-Holland', 52.0116, 4.3571, 103659, false],
        ['Deventer', 'deventer', 'Overijssel', 52.2553, 6.1639, 100718, false],
        
        // Important regional centers
        ['Gouda', 'gouda', 'Zuid-Holland', 52.0115, 4.7107, 73395, false],
        ['Kampen', 'kampen', 'Overijssel', 52.5554, 5.9113, 54340, false],
        ['Bergen op Zoom', 'bergen op zoom', 'Noord-Brabant', 51.4950, 4.2903, 67489, false],
        ['Lelystad', 'lelystad', 'Flevoland', 52.5184, 5.4750, 78619, false],
        ['Nieuwegein', 'nieuwegein', 'Utrecht', 52.0292, 5.0808, 63461, false],
        ['Doetinchem', 'doetinchem', 'Gelderland', 51.9654, 6.2886, 58270, false],
        ['Hoofddorp', 'hoofddorp', 'Noord-Holland', 52.3020, 4.6890, 76660, false],
        ['Middelburg', 'middelburg', 'Zeeland', 51.5000, 3.6144, 48810, false],
        ['Vlissingen', 'vlissingen', 'Zeeland', 51.4426, 3.5736, 44485, false],
        ['Assen', 'assen', 'Drenthe', 52.9925, 6.5649, 68606, false],
        ['Weert', 'weert', 'Limburg', 51.2517, 5.7061, 50107, false],
        ['Sittard', 'sittard', 'Limburg', 50.9979, 5.8689, 92422, false],
        ['Helmond', 'helmond', 'Noord-Brabant', 51.4816, 5.6561, 92432, false],
        ['Harderwijk', 'harderwijk', 'Gelderland', 52.3428, 5.6178, 47400, false],
        ['Meppel', 'meppel', 'Drenthe', 52.6956, 6.1947, 33902, false],
        ['Hoogeveen', 'hoogeveen', 'Drenthe', 52.7219, 6.4767, 55697, false],
        ['Coevorden', 'coevorden', 'Drenthe', 52.6611, 6.7425, 35296, false],
        
        // Additional important towns
        ['IJsselstein', 'ijsselstein', 'Utrecht', 52.0203, 5.0428, 34110, false],
        ['Veenendaal', 'veenendaal', 'Utrecht', 52.0283, 5.5547, 66491, false],
        ['Baarn', 'baarn', 'Utrecht', 52.2125, 5.2856, 24873, false],
        ['Soest', 'soest', 'Utrecht', 52.1736, 5.2914, 46607, false],
        ['Zeist', 'zeist', 'Utrecht', 52.0886, 5.2317, 64932, false],
        ['Woerden', 'woerden', 'Utrecht', 52.0853, 4.8831, 52294, false],
        ['Cuijk', 'cuijk', 'Noord-Brabant', 51.7297, 5.8756, 25139, false],
        ['Venray', 'venray', 'Limburg', 51.5247, 5.9747, 43604, false],
        ['Roermond', 'roermond', 'Limburg', 51.1942, 5.9873, 58254, false],
        
        // Friesland towns
        ['Sneek', 'sneek', 'Friesland', 53.0333, 5.6581, 33512, false],
        ['Heerenveen', 'heerenveen', 'Friesland', 52.9608, 5.9197, 50697, false],
        ['Drachten', 'drachten', 'Friesland', 53.1125, 6.0989, 45181, false],
        ['Franeker', 'franeker', 'Friesland', 53.1875, 5.5403, 12781, false],
        ['Harlingen', 'harlingen', 'Friesland', 53.1742, 5.4231, 15720, false],
        
        // Zeeland
        ['Goes', 'goes', 'Zeeland', 51.5042, 3.8881, 38080, false],
        ['Terneuzen', 'terneuzen', 'Zeeland', 51.3347, 3.8397, 54438, false],
        
        // Additional Noord-Holland
        ['Beverwijk', 'beverwijk', 'Noord-Holland', 52.4831, 4.6567, 41613, false],
        ['Heerhugowaard', 'heerhugowaard', 'Noord-Holland', 52.6744, 4.8503, 57592, false],
        ['Den Helder', 'den helder', 'Noord-Holland', 52.9597, 4.7739, 56305, false],
        ['Enkhuizen', 'enkhuizen', 'Noord-Holland', 52.7034, 5.2903, 18592, false],
        
        // Alternative names and spellings
        ['The Hague', 'the hague', 'Zuid-Holland', 52.0705, 4.3007, 548320, true], // English name
        ['s-Gravenhage', 's-gravenhage', 'Zuid-Holland', 52.0705, 4.3007, 548320, true], // Official name
    ];
    
    // Insert cities data
    $insertSql = "INSERT INTO cities (name, name_normalized, province, latitude, longitude, population, is_major_city) VALUES (?, ?, ?, ?, ?, ?, ?)";
    
    $insertedCount = 0;
    foreach ($cities as $city) {
        $database->query($insertSql, $city);
        $insertedCount++;
    }
    
    echo "✅ Inserted {$insertedCount} Dutch cities\n";
    
    // Verify data
    $totalCities = $database->fetchOne("SELECT COUNT(*) as total FROM cities");
    $majorCities = $database->fetchOne("SELECT COUNT(*) as total FROM cities WHERE is_major_city = 1");
    
    echo "✅ Total cities in database: {$totalCities['total']}\n";
    echo "✅ Major cities: {$majorCities['total']}\n";
    
    // Show some examples
    $examples = $database->fetchAll("SELECT name, province, population FROM cities WHERE is_major_city = 1 ORDER BY population DESC LIMIT 10");
    echo "\n📊 Top 10 major cities:\n";
    foreach ($examples as $city) {
        echo "   - {$city['name']} ({$city['province']}) - {$city['population']} inhabitants\n";
    }
    
    echo "\n🎉 Dutch cities database setup complete!\n";
    
} catch (Exception $e) {
    echo "❌ Error setting up cities database: " . $e->getMessage() . "\n";
    exit(1);
}
?>