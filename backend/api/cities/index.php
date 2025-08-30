<?php
/**
 * Cities API Endpoint
 * Provides city search and autocomplete functionality
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Load configuration and database classes

$database = new Database();

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        
        // Get query parameters
        $query = $_GET['q'] ?? $_GET['query'] ?? '';
        $limit = min((int)($_GET['limit'] ?? 20), 50); // Max 50 results
        $majorOnly = filter_var($_GET['major_only'] ?? false, FILTER_VALIDATE_BOOLEAN);
        
        // Build SQL query with alias support
        $sql = "SELECT DISTINCT
                    c.id,
                    c.name,
                    c.name_normalized,
                    c.province,
                    c.latitude,
                    c.longitude,
                    c.population,
                    c.is_major_city
                FROM cities c
                LEFT JOIN city_aliases ca ON c.id = ca.city_id";
        
        $params = [];
        $conditions = [];
        
        // Search by name or alias if query provided
        if (!empty($query)) {
            $searchQuery = '%' . strtolower(trim($query)) . '%';
            $conditions[] = "(LOWER(c.name) LIKE ? OR LOWER(c.name_normalized) LIKE ? OR LOWER(ca.alias) LIKE ? OR LOWER(ca.alias_normalized) LIKE ?)";
            $params[] = $searchQuery;
            $params[] = $searchQuery;
            $params[] = $searchQuery;
            $params[] = $searchQuery;
        }
        
        // Filter by major cities only if requested
        if ($majorOnly) {
            $conditions[] = "c.is_major_city = 1";
        }
        
        // Add WHERE clause if conditions exist
        if (!empty($conditions)) {
            $sql .= " WHERE " . implode(" AND ", $conditions);
        }
        
        // Add ordering and limit
        $sql .= " ORDER BY c.population DESC, c.name ASC LIMIT ?";
        $params[] = $limit;
        
        // Execute query
        $cities = $database->fetchAll($sql, $params);
        
        // Format response
        $results = [];
        foreach ($cities as $city) {
            $results[] = [
                'id' => (int)$city['id'],
                'name' => $city['name'],
                'province' => $city['province'],
                'coordinates' => [
                    'lat' => (float)$city['latitude'],
                    'lng' => (float)$city['longitude']
                ],
                'population' => (int)$city['population'],
                'is_major_city' => (bool)$city['is_major_city']
            ];
        }
        
        // Metadata for debugging and frontend use
        $metadata = [
            'query' => $query,
            'total_results' => count($results),
            'major_only' => $majorOnly,
            'limit' => $limit
        ];
        
        response([
            'cities' => $results,
            'metadata' => $metadata
        ]);
        
    } else {
        
        error_response('Method not allowed', 405);
    }
    
} catch (Exception $e) {
    error_log("Cities API error: " . $e->getMessage());
    
    error_response('Internal server error', 500);
}
?>