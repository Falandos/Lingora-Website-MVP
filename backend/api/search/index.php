<?php
// Search API endpoint

// Include config for global functions and constants
if (!defined('ROOT_PATH')) {
    require_once dirname(__DIR__, 2) . '/config/config.php';
}

global $method, $action, $database, $jwt, $config;

// Include EmbeddingService for semantic search
require_once dirname(__DIR__, 2) . '/services/EmbeddingService.php';

// Include LanguageDetector for comprehensive language detection
require_once dirname(__DIR__, 2) . '/services/LanguageDetector.php';


// Route to suggestions endpoint if action is 'suggestions'
if ($action === 'suggestions') {
    require_once 'suggestions/index.php';
    return;
}

// Function to get coordinates for a city name
function getCityCoordinates($city) {
    // Simple coordinate lookup for major Dutch cities
    $cityCoordinates = [
        'amsterdam' => ['lat' => 52.3676, 'lng' => 4.9041],
        'rotterdam' => ['lat' => 51.9244, 'lng' => 4.4777],
        'den haag' => ['lat' => 52.0705, 'lng' => 4.3007],
        'the hague' => ['lat' => 52.0705, 'lng' => 4.3007],
        'utrecht' => ['lat' => 52.0907, 'lng' => 5.1214],
        'eindhoven' => ['lat' => 51.4416, 'lng' => 5.4697],
        'tilburg' => ['lat' => 51.5555, 'lng' => 5.0913],
        'groningen' => ['lat' => 53.2194, 'lng' => 6.5665],
        'almere' => ['lat' => 52.3508, 'lng' => 5.2647],
        'breda' => ['lat' => 51.5719, 'lng' => 4.7683],
        'nijmegen' => ['lat' => 51.8426, 'lng' => 5.8518],
        'enschede' => ['lat' => 52.2215, 'lng' => 6.8937],
        'haarlem' => ['lat' => 52.3874, 'lng' => 4.6462],
        'arnhem' => ['lat' => 51.9851, 'lng' => 5.8987],
        'zaanstad' => ['lat' => 52.4389, 'lng' => 4.8289],
        'maastricht' => ['lat' => 50.8514, 'lng' => 5.6910],
    ];
    
    $cityLower = strtolower(trim($city));
    return $cityCoordinates[$cityLower] ?? null;
}

if ($method !== 'GET') {
    error_response('Method not allowed', 405);
}

// Get search parameters
$languages = isset($_GET['languages']) ? explode(',', $_GET['languages']) : [];
$categories = isset($_GET['categories']) ? array_map('intval', explode(',', $_GET['categories'])) : [];
$city = $_GET['city'] ?? '';
$radius = isset($_GET['radius']) ? (int)$_GET['radius'] : 0; // Default to 0 = show all providers
$mode = $_GET['mode'] ?? '';
$keyword = $_GET['keyword'] ?? '';
$ui_lang = $_GET['ui_lang'] ?? 'nl'; // Current UI language for detection
$lat = isset($_GET['lat']) ? (float)$_GET['lat'] : null;
$lng = isset($_GET['lng']) ? (float)$_GET['lng'] : null;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? min((int)$_GET['limit'], 50) : 20;
$offset = ($page - 1) * $limit;

// Language detection and auto-application
$languageDetection = null;
$autoAppliedLanguages = [];

if ($keyword) {
    try {
        $languageDetector = new LanguageDetector();
        $detectionResult = $languageDetector->detectLanguageFromQuery($keyword, $ui_lang);
        
        // 1. AUTO-APPLY LANGUAGE FILTERS (e.g., "turkse dokter" -> apply Turkish filter)
        if ($detectionResult && !empty($detectionResult['detected_languages'])) {
            $detectedLanguages = $detectionResult['detected_languages'];
            
            // Auto-apply detected language filters if not already applied by user
            if (empty($languages)) {
                $autoAppliedLanguages = $detectedLanguages;
                // Apply the language filter to the search
                $languages = $detectedLanguages;
            }
        }
        
        // 1.5. AUTO-APPLY CITY FILTER (e.g., "turkse dokter amsterdam" -> apply Amsterdam filter)
        $autoAppliedCity = null;
        if ($detectionResult && !empty($detectionResult['detected_city'])) {
            $detectedCity = $detectionResult['detected_city'];
            
            // Auto-apply detected city if not already set by user
            if (empty($city)) {
                $autoAppliedCity = $detectedCity;
                $city = $detectedCity;
            }
        }
        
        // 2. UI LANGUAGE SWITCH SUGGESTION (e.g., "lekarz" -> suggest Polish UI)
        $typedLanguage = isset($detectionResult['typed_language']) ? $detectionResult['typed_language'] : null;
        if ($typedLanguage && $typedLanguage !== $ui_lang) {
            $languageDetection = [
                'typed_language' => $typedLanguage,
                'current_ui_language' => $ui_lang,
                'confidence' => $detectionResult['confidence'] ?? null
            ];
        }
        
        // 3. AUTO-APPLICATION INFO (languages and city)
        if (!empty($autoAppliedLanguages) || !empty($autoAppliedCity)) {
            if (!$languageDetection) {
                $languageDetection = [];
            }
            $languageDetection['auto_applied'] = true;
            
            if (!empty($autoAppliedLanguages)) {
                $languageDetection['detected_languages'] = $autoAppliedLanguages;
            }
            
            if (!empty($autoAppliedCity)) {
                $languageDetection['detected_city'] = $autoAppliedCity;
            }
        }
        
    } catch (Exception $e) {
        // Fallback: no language detection if service fails
        error_log("LanguageDetector error: " . $e->getMessage());
    }
}

// Build search query
$sql = "SELECT p.id, p.business_name, p.slug, p.city, p.address,
                p.bio_nl, p.bio_en, p.latitude, p.longitude,
                p.profile_completeness_score, p.gallery";

$joins = " FROM providers p";
$where = " WHERE p.status = 'approved' AND p.subscription_status != 'frozen'";
$params = [];

// Join tables as needed
if (!empty($languages)) {
    // Use AND logic to find providers with ALL of the selected languages
    $placeholders = str_repeat('?,', count($languages) - 1) . '?';
    $languageCount = count($languages);
    $where .= " AND p.id IN (
        SELECT pl.provider_id 
        FROM provider_languages pl 
        WHERE pl.language_code IN ($placeholders)
        GROUP BY pl.provider_id
        HAVING COUNT(DISTINCT pl.language_code) = ?
    )";
    $params = array_merge($params, $languages);
    $params[] = $languageCount;
}

if (!empty($categories)) {
    $joins .= " LEFT JOIN services s ON p.id = s.provider_id";
    $placeholders = str_repeat('?,', count($categories) - 1) . '?';
    $where .= " AND s.category_id IN ($placeholders) AND s.is_active = TRUE";
    $params = array_merge($params, $categories);
}

// Service mode filter
if ($mode && in_array($mode, ['in_person', 'online', 'both'])) {
    if (!strpos($joins, 'services s')) {
        $joins .= " LEFT JOIN services s ON p.id = s.provider_id";
        $where .= " AND s.is_active = TRUE";
    }
    $where .= " AND (s.service_mode = ? OR s.service_mode = 'both')";
    $params[] = $mode;
}

// Semantic + Traditional hybrid search
if ($keyword) {
    try {
        $embeddingService = new EmbeddingService($database);
        
        // Try semantic search first
        if ($embeddingService->isServiceAvailable()) {
            $semanticResponse = $embeddingService->semanticSearch($keyword, ['limit' => $limit * 2]);
            
            // If semantic search succeeds and has results
            if ($semanticResponse && $semanticResponse['success'] && !empty($semanticResponse['results'])) {
                // Extract provider IDs from semantic results
                $providerIds = array_column($semanticResponse['results'], 'provider_id');
                if (!empty($providerIds)) {
                    $placeholders = str_repeat('?,', count($providerIds) - 1) . '?';
                    $where .= " AND p.id IN ($placeholders)";
                    $params = array_merge($params, $providerIds);
                } else {
                    // No semantic results, fallback to SQL search
                    $keyword = '%' . $keyword . '%';
                    $where .= " AND (p.business_name LIKE ? OR p.bio_nl LIKE ? OR p.bio_en LIKE ?)";
                    $params[] = $keyword;
                    $params[] = $keyword;
                    $params[] = $keyword;
                }
            } else {
                // Semantic search returned no results, fallback to SQL search
                $keyword = '%' . $keyword . '%';
                $where .= " AND (p.business_name LIKE ? OR p.bio_nl LIKE ? OR p.bio_en LIKE ?)";
                $params[] = $keyword;
                $params[] = $keyword;
                $params[] = $keyword;
            }
        } else {
            // AI service not available, fallback to SQL search
            $keyword = '%' . $keyword . '%';
            $where .= " AND (p.business_name LIKE ? OR p.bio_nl LIKE ? OR p.bio_en LIKE ?)";
            $params[] = $keyword;
            $params[] = $keyword;
            $params[] = $keyword;
        }
    } catch (Exception $e) {
        // Error with semantic search, fallback to SQL search
        error_log("Semantic search failed: " . $e->getMessage());
        $keyword = '%' . $keyword . '%';
        $where .= " AND (p.business_name LIKE ? OR p.bio_nl LIKE ? OR p.bio_en LIKE ?)";
        $params[] = $keyword;
        $params[] = $keyword;
        $params[] = $keyword;
    }
}

// Handle city-based search with radius
$useDistanceFilter = false;
$distanceParams = [];

if ($city && $lat === null && $lng === null) {
    // Try to get coordinates for the city for radius filtering
    $cityCoords = getCityCoordinates($city);
    if ($cityCoords) {
        $lat = $cityCoords['lat'];
        $lng = $cityCoords['lng'];
        // Only use distance filtering if radius > 0
        $useDistanceFilter = ($radius > 0);
    } else {
        // Fallback to city name matching if geocoding fails
        $where .= " AND p.city LIKE ?";
        $params[] = '%' . $city . '%';
    }
} elseif ($lat !== null && $lng !== null && $radius > 0) {
    // Only use distance filtering if radius > 0
    $useDistanceFilter = true;
}

// Add distance calculation if using geographic filtering
$selectDistance = "";
$having = "";
if ($useDistanceFilter) {
    $selectDistance = ", (6371 * acos(cos(radians(?)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(?)) + sin(radians(?)) * sin(radians(p.latitude)))) AS distance";
    $where .= " AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL";
    $having = " HAVING distance <= ?";
    
    // Store distance parameters (first 3 are for SELECT, last 1 is for HAVING)
    $distanceParams = [$lat, $lng, $lat];
}

// Build final query
$orderBy = " ORDER BY p.profile_completeness_score DESC";
if ($useDistanceFilter) {
    $orderBy = " ORDER BY distance ASC, p.profile_completeness_score DESC";
}

$finalSql = $sql . $selectDistance . $joins . $where;

// Always use GROUP BY when we have JOINs or distance calculations to avoid duplicates
$needsGroupBy = !empty($languages) || !empty($categories) || $useDistanceFilter;
if ($needsGroupBy) {
    $finalSql .= " GROUP BY p.id";
    if ($having) {
        $finalSql .= $having;
    }
}
$finalSql .= $orderBy . " LIMIT ? OFFSET ?";

// Build parameters in correct order
$finalParams = [];

// Add distance calculation parameters first (if using distance filtering)
if ($useDistanceFilter) {
    $finalParams = array_merge($finalParams, $distanceParams);
}

// Add WHERE clause parameters  
$finalParams = array_merge($finalParams, $params);

// Add radius for HAVING clause (if using distance filtering)
if ($useDistanceFilter) {
    $finalParams[] = $radius;
}

// Add LIMIT and OFFSET last
$finalParams[] = $limit;
$finalParams[] = $offset;

try {
    $results = $database->fetchAll($finalSql, $finalParams);
    
    // Get additional data for each provider
    foreach ($results as &$provider) {
        // Parse gallery JSON
        $provider['gallery'] = json_decode($provider['gallery'] ?? '[]', true);
        
        // Get languages
        $langSql = "SELECT pl.language_code, pl.cefr_level, l.name_en, l.name_native
                    FROM provider_languages pl
                    LEFT JOIN languages l ON pl.language_code = l.code
                    WHERE pl.provider_id = ?";
        $provider['languages'] = $database->fetchAll($langSql, [$provider['id']]);
        
        // Get sample services
        $serviceSql = "SELECT s.title, s.service_mode, c.name_en as category_name
                       FROM services s
                       LEFT JOIN categories c ON s.category_id = c.id
                       WHERE s.provider_id = ? AND s.is_active = TRUE
                       LIMIT 3";
        $provider['services'] = $database->fetchAll($serviceSql, [$provider['id']]);
    }
    
    // Get total count for pagination - include distance filtering if used
    $countSql = "SELECT COUNT(DISTINCT p.id) as total" . $joins . $where;
    $countParams = $params; // Use original WHERE parameters
    
    // If using distance filtering or have JOINs, use subquery to handle GROUP BY + HAVING
    if ($needsGroupBy) {
        $countSql = "SELECT COUNT(*) as total FROM (
            SELECT p.id
            " . $selectDistance . " " . $joins . $where . "
            GROUP BY p.id";
        
        if ($having) {
            $countSql .= $having;
        }
        
        $countSql .= ") as filtered_results";
        
        // Build count parameters with distance calculation parameters
        $countParams = [];
        if ($useDistanceFilter) {
            $countParams = array_merge($countParams, $distanceParams);
        }
        $countParams = array_merge($countParams, $params);
        if ($useDistanceFilter) {
            $countParams[] = $radius;
        }
    }
    
    $totalResult = $database->fetchOne($countSql, $countParams);
    
    
    response([
        'results' => $results,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $totalResult['total'],
            'totalPages' => ceil($totalResult['total'] / $limit)
        ],
        'filters' => [
            'languages' => $languages,
            'categories' => $categories,
            'city' => $city,
            'radius' => $radius,
            'mode' => $mode,
            'keyword' => $keyword,
            'coordinates' => $lat && $lng ? ['lat' => $lat, 'lng' => $lng] : null
        ],
        'language_detection' => $languageDetection
    ]);
    
} catch (Exception $e) {
    error_log("Search error: " . $e->getMessage());
    error_response('Search failed', 500);
}
?>