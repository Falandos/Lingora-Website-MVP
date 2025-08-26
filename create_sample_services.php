<?php
// Create sample services for providers
echo "Creating Sample Services for Providers...\n";
echo str_repeat("-", 50) . "\n";

try {
    $pdo = new PDO('mysql:host=localhost;dbname=lingora;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo "✅ Connected to database\n";
    
    // Services data for each provider
    $services = [
        // Medisch Centrum Al-Shifa (Healthcare)
        'medisch-centrum-al-shifa' => [
            [
                'category_id' => 1,
                'title' => 'Huisartsconsult',
                'description_nl' => 'Algemeen medisch onderzoek en behandeling door meertalige huisarts.',
                'description_en' => 'General medical examination and treatment by multilingual GP.',
                'price_min' => 45, 'price_max' => 65,
                'service_mode' => 'in_person', 'duration_minutes' => 30
            ],
            [
                'category_id' => 1,
                'title' => 'Telehealth Consultatie',
                'description_nl' => 'Online medische consultatie via videobellen in het Arabisch of Nederlands.',
                'description_en' => 'Online medical consultation via video call in Arabic or Dutch.',
                'price_min' => 35, 'price_max' => 45,
                'service_mode' => 'online', 'duration_minutes' => 20
            ]
        ],
        
        // Advocatenkantoor Smit & Partners (Legal)
        'advocatenkantoor-smit-partners' => [
            [
                'category_id' => 2,
                'title' => 'Immigratierecht Advies',
                'description_nl' => 'Juridisch advies voor visa, verblijfsvergunningen en naturalisatie.',
                'description_en' => 'Legal advice for visas, residence permits and naturalization.',
                'price_min' => 150, 'price_max' => 250,
                'service_mode' => 'both', 'duration_minutes' => 60
            ],
            [
                'category_id' => 2,
                'title' => 'Familierecht',
                'description_nl' => 'Hulp bij echtscheiding, voogdij en internationale kinderontvoering.',
                'description_en' => 'Help with divorce, custody and international child abduction.',
                'price_min' => 180, 'price_max' => 300,
                'service_mode' => 'in_person', 'duration_minutes' => 90
            ]
        ],
        
        // Taalschool Europa (Education) 
        'taalschool-europa' => [
            [
                'category_id' => 3,
                'title' => 'Nederlandse Taalles',
                'description_nl' => 'Nederlandse lessen voor beginners tot gevorderde studenten.',
                'description_en' => 'Dutch lessons for beginner to advanced students.',
                'price_min' => 25, 'price_max' => 40,
                'service_mode' => 'both', 'duration_minutes' => 60
            ],
            [
                'category_id' => 3,
                'title' => 'Inburgeringscursus',
                'description_nl' => 'Voorbereiding op het inburgeringsexamen met Oekraïense begeleiding.',
                'description_en' => 'Civic integration exam preparation with Ukrainian guidance.',
                'price_min' => 30, 'price_max' => 50,
                'service_mode' => 'both', 'duration_minutes' => 90
            ]
        ],
        
        // Salon International (Beauty & Wellness)
        'salon-international' => [
            [
                'category_id' => 6,
                'title' => 'Afro Hair Styling',
                'description_nl' => 'Professionele haarstyling voor Afrikaans en kroeshaar.',
                'description_en' => 'Professional hair styling for African and curly hair.',
                'price_min' => 45, 'price_max' => 85,
                'service_mode' => 'in_person', 'duration_minutes' => 120
            ],
            [
                'category_id' => 6,
                'title' => 'Internationale Knippen',
                'description_nl' => 'Haarknippen volgens internationale stijlen en tradities.',
                'description_en' => 'Hair cutting according to international styles and traditions.',
                'price_min' => 35, 'price_max' => 60,
                'service_mode' => 'in_person', 'duration_minutes' => 60
            ]
        ],
        
        // Psycholoogpraktijk Meertalig (Healthcare)
        'psycholoog-meertalig' => [
            [
                'category_id' => 1,
                'title' => 'Psychotherapie',
                'description_nl' => 'Individuele therapie in meerdere talen voor trauma en depressie.',
                'description_en' => 'Individual therapy in multiple languages for trauma and depression.',
                'price_min' => 80, 'price_max' => 120,
                'service_mode' => 'both', 'duration_minutes' => 50
            ]
        ],
        
        // Tandartspraktijk Multi-Cultureel (Healthcare)
        'tandarts-multi-cultureel' => [
            [
                'category_id' => 1,
                'title' => 'Tandheelkunde Controle',
                'description_nl' => 'Routine tandencontrole met uitleg in uw eigen taal.',
                'description_en' => 'Routine dental check-up with explanation in your native language.',
                'price_min' => 55, 'price_max' => 75,
                'service_mode' => 'in_person', 'duration_minutes' => 30
            ]
        ],
        
        // Immigration Law Experts (Legal)
        'immigration-law-experts' => [
            [
                'category_id' => 2,
                'title' => 'Visa Application Support',
                'description_nl' => 'Volledige begeleiding bij visa aanvragen voor Nederland.',
                'description_en' => 'Complete guidance for visa applications to the Netherlands.',
                'price_min' => 200, 'price_max' => 350,
                'service_mode' => 'both', 'duration_minutes' => 90
            ]
        ]
    ];
    
    // Insert services
    foreach ($services as $providerSlug => $providerServices) {
        // Get provider ID
        $providerResult = $pdo->query("SELECT id, business_name FROM providers WHERE slug = '$providerSlug'")->fetch();
        
        if (!$providerResult) {
            echo "⚠️ Provider $providerSlug not found, skipping...\n";
            continue;
        }
        
        $providerId = $providerResult['id'];
        $businessName = $providerResult['business_name'];
        
        foreach ($providerServices as $service) {
            $pdo->exec("INSERT INTO services 
                (provider_id, category_id, title, description_nl, description_en, 
                 price_min, price_max, service_mode, duration_minutes, is_active, sort_order) 
                VALUES 
                ($providerId, {$service['category_id']}, '{$service['title']}', 
                 '{$service['description_nl']}', '{$service['description_en']}',
                 {$service['price_min']}, {$service['price_max']}, '{$service['service_mode']}', 
                 {$service['duration_minutes']}, TRUE, 0)");
        }
        
        echo "✅ Added " . count($providerServices) . " services for $businessName\n";
    }
    
    // Get total counts
    $providerCount = $pdo->query("SELECT COUNT(*) as count FROM providers")->fetch()['count'];
    $serviceCount = $pdo->query("SELECT COUNT(*) as count FROM services")->fetch()['count'];
    $languageCount = $pdo->query("SELECT COUNT(*) as count FROM provider_languages")->fetch()['count'];
    
    echo str_repeat("-", 50) . "\n";
    echo "🎉 Sample services created successfully!\n";
    echo "📊 Database summary:\n";
    echo "   - Providers: $providerCount\n";
    echo "   - Services: $serviceCount\n";
    echo "   - Language associations: $languageCount\n";
    
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>