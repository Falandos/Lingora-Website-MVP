<?php
// Create realistic sample provider data for Lingora
echo "Creating Sample Provider Data...\n";
echo str_repeat("-", 50) . "\n";

try {
    $pdo = new PDO('mysql:host=localhost;dbname=lingora;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo "✅ Connected to database\n";
    
    // First create test users for providers
    $providerUsers = [
        ['email' => 'dr.hassan@medcentrum.nl', 'password' => 'provider123'],
        ['email' => 'info@advocatenkantoor-smit.nl', 'password' => 'provider123'], 
        ['email' => 'elena@taalschool-europa.nl', 'password' => 'provider123'],
        ['email' => 'contact@salon-international.nl', 'password' => 'provider123'],
        ['email' => 'office@psyholog-amsterdam.nl', 'password' => 'provider123'],
        ['email' => 'info@tandarts-multicultureel.nl', 'password' => 'provider123'],
        ['email' => 'contact@legal-immigration.nl', 'password' => 'provider123'],
        ['email' => 'hello@fitnessstudio-diverse.nl', 'password' => 'provider123'],
        ['email' => 'info@boekhouding-internationaal.nl', 'password' => 'provider123'],
        ['email' => 'contact@kapsalon-wereldwijd.nl', 'password' => 'provider123'],
    ];
    
    $passwordHash = password_hash('provider123', PASSWORD_DEFAULT);
    
    foreach ($providerUsers as $user) {
        $pdo->exec("INSERT IGNORE INTO users (email, password_hash, role, email_verified) 
                    VALUES ('{$user['email']}', '$passwordHash', 'provider', TRUE)");
    }
    echo "✅ Created " . count($providerUsers) . " test provider users\n";
    
    // Sample providers with realistic Dutch data
    $providers = [
        [
            'user_email' => 'dr.hassan@medcentrum.nl',
            'business_name' => 'Medisch Centrum Al-Shifa',
            'slug' => 'medisch-centrum-al-shifa',
            'phone' => '+31 20 123 4567',
            'address' => 'Nieuwezijds Voorburgwal 147',
            'city' => 'Amsterdam',
            'postal_code' => '1012 RJ',
            'lat' => 52.3735103,
            'lng' => 4.8915730,
            'kvk' => '12345678',
            'btw' => 'NL123456789B01',
            'bio_nl' => 'Medisch centrum gespecialiseerd in meertalige zorgverlening. Ons team spreekt Arabisch, Nederlands en Engels.',
            'bio_en' => 'Medical center specialized in multilingual healthcare. Our team speaks Arabic, Dutch, and English.',
            'category_id' => 1,
            'languages' => ['ar' => 'native', 'nl' => 'C1', 'en' => 'B2']
        ],
        [
            'user_email' => 'info@advocatenkantoor-smit.nl',
            'business_name' => 'Advocatenkantoor Smit & Partners',
            'slug' => 'advocatenkantoor-smit-partners',
            'phone' => '+31 10 987 6543',
            'address' => 'Coolsingel 6',
            'city' => 'Rotterdam', 
            'postal_code' => '3011 AD',
            'lat' => 51.9244201,
            'lng' => 4.4777326,
            'kvk' => '23456789',
            'btw' => 'NL234567890B01',
            'bio_nl' => 'Gespecialiseerd in immigratierecht en familierecht. Wij helpen internationale cliënten in hun eigen taal.',
            'bio_en' => 'Specialized in immigration law and family law. We help international clients in their native language.',
            'category_id' => 2,
            'languages' => ['nl' => 'native', 'en' => 'C2', 'de' => 'B2', 'pl' => 'B1']
        ],
        [
            'user_email' => 'elena@taalschool-europa.nl',
            'business_name' => 'Taalschool Europa',
            'slug' => 'taalschool-europa',
            'phone' => '+31 30 555 0123',
            'address' => 'Vredenburg 40',
            'city' => 'Utrecht',
            'postal_code' => '3511 BD',
            'lat' => 52.0907374,
            'lng' => 5.1214201,
            'kvk' => '34567890',
            'btw' => 'NL345678901B01',
            'bio_nl' => 'Nederlandse lessen voor expats en vluchtelingen. Ook Oekraïens en Russisch gesproken.',
            'bio_en' => 'Dutch lessons for expats and refugees. Ukrainian and Russian also spoken.',
            'category_id' => 3,
            'languages' => ['uk' => 'native', 'nl' => 'C2', 'en' => 'C1', 'de' => 'B1']
        ],
        [
            'user_email' => 'contact@salon-international.nl',
            'business_name' => 'Salon International',
            'slug' => 'salon-international',
            'phone' => '+31 70 444 5566',
            'address' => 'Lange Voorhout 74',
            'city' => 'Den Haag',
            'postal_code' => '2514 EH',
            'lat' => 52.0799838,
            'lng' => 4.3113461,
            'kvk' => '45678901',
            'btw' => 'NL456789012B01',
            'bio_nl' => 'Internationale kapsalon met specialisten voor Afrikaans, Aziatisch en Europees haar.',
            'bio_en' => 'International hair salon with specialists for African, Asian and European hair.',
            'category_id' => 6,
            'languages' => ['nl' => 'C2', 'en' => 'B2', 'ar' => 'B1', 'so' => 'native']
        ],
        [
            'user_email' => 'office@psyholog-amsterdam.nl',
            'business_name' => 'Psycholoogpraktijk Meertalig',
            'slug' => 'psycholoog-meertalig',
            'phone' => '+31 20 777 8899',
            'address' => 'Herengracht 168',
            'city' => 'Amsterdam',
            'postal_code' => '1016 BP',
            'lat' => 52.3738007,
            'lng' => 4.8859744,
            'kvk' => '56789012',
            'btw' => 'NL567890123B01',
            'bio_nl' => 'Psychologische hulp in meerdere talen. Gespecialiseerd in trauma en integratie.',
            'bio_en' => 'Psychological help in multiple languages. Specialized in trauma and integration.',
            'category_id' => 1,
            'languages' => ['nl' => 'native', 'en' => 'C2', 'tr' => 'B2', 'ar' => 'B1']
        ],
        [
            'user_email' => 'info@tandarts-multicultureel.nl',
            'business_name' => 'Tandartspraktijk Multi-Cultureel',
            'slug' => 'tandarts-multi-cultureel',
            'phone' => '+31 40 333 2211',
            'address' => 'Stratumseind 40',
            'city' => 'Eindhoven',
            'postal_code' => '5611 ET',
            'lat' => 51.4381481,
            'lng' => 5.4792242,
            'kvk' => '67890123',
            'btw' => 'NL678901234B01',
            'bio_nl' => 'Tandheelkunde voor internationale gemeenschap in Eindhoven. Polen, Hindi en Engels gesproken.',
            'bio_en' => 'Dentistry for international community in Eindhoven. Polish, Hindi and English spoken.',
            'category_id' => 1,
            'languages' => ['nl' => 'C2', 'pl' => 'native', 'hi' => 'B2', 'en' => 'B2']
        ],
        [
            'user_email' => 'contact@legal-immigration.nl',
            'business_name' => 'Immigration Law Experts',
            'slug' => 'immigration-law-experts',
            'phone' => '+31 20 111 2233',
            'address' => 'Damrak 70',
            'city' => 'Amsterdam',
            'postal_code' => '1012 LM',
            'lat' => 52.3764798,
            'lng' => 4.8980649,
            'kvk' => '78901234',
            'btw' => 'NL789012345B01',
            'bio_nl' => 'Gespecialiseerd in immigratierecht voor expats en vluchtelingen uit diverse landen.',
            'bio_en' => 'Specialized in immigration law for expats and refugees from various countries.',
            'category_id' => 2,
            'languages' => ['en' => 'native', 'nl' => 'C2', 'fr' => 'B2', 'es' => 'B1']
        ]
    ];
    
    // Insert providers
    foreach ($providers as $p) {
        // Get user ID
        $userResult = $pdo->query("SELECT id FROM users WHERE email = '{$p['user_email']}'")->fetch();
        $userId = $userResult['id'];
        
        // Calculate trial expiration (90 days from now)
        $trialExpires = date('Y-m-d H:i:s', strtotime('+90 days'));
        
        // Insert provider
        $pdo->exec("INSERT INTO providers 
            (user_id, business_name, slug, email, phone, address, city, postal_code, latitude, longitude, 
             kvk_number, btw_number, bio_nl, bio_en, status, subscription_status, trial_expires_at, profile_completeness_score) 
            VALUES 
            ($userId, '{$p['business_name']}', '{$p['slug']}', '{$p['user_email']}', '{$p['phone']}', 
             '{$p['address']}', '{$p['city']}', '{$p['postal_code']}', {$p['lat']}, {$p['lng']},
             '{$p['kvk']}', '{$p['btw']}', '{$p['bio_nl']}', '{$p['bio_en']}', 
             'approved', 'trial', '$trialExpires', 75)");
        
        $providerId = $pdo->lastInsertId();
        
        // Insert provider languages
        foreach ($p['languages'] as $langCode => $level) {
            $pdo->exec("INSERT INTO provider_languages (provider_id, language_code, cefr_level) 
                        VALUES ($providerId, '$langCode', '$level')");
        }
        
        echo "✅ Created provider: {$p['business_name']} ({$p['city']})\n";
    }
    
    echo str_repeat("-", 50) . "\n";
    echo "🎉 Sample provider data created successfully!\n";
    echo "📊 Created " . count($providers) . " providers across Netherlands\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>