<?php
// Main API entry point
// Routes all API requests to appropriate handlers

require_once '../config/config.php';

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove /api prefix from URI
$uri = preg_replace('/^\/api/', '', $uri);
$uri = trim($uri, '/');

// Split URI into segments
$segments = $uri ? explode('/', $uri) : [];

// Initialize database and JWT service
$config = require '../config/config.php';
$database = new Database();
$jwt = new JWTService($config['jwt']['secret'], $config['jwt']['algorithm']);

// Route the request
try {
    if (empty($segments[0])) {
        response(['message' => 'Lingora API v1.0', 'endpoints' => [
            'auth' => '/api/auth/*',
            'providers' => '/api/providers/*',
            'search' => '/api/search',
            'contact' => '/api/contact',
            'admin' => '/api/admin/*'
        ]]);
    }

    $resource = $segments[0];
    global $action, $id;
    $action = $segments[1] ?? null;
    $id = $segments[2] ?? null;

    switch ($resource) {
        case 'auth':
            require_once 'auth/index.php';
            break;

        case 'providers':
            require_once 'providers/index.php';
            break;

        case 'search':
            require_once 'search/index.php';
            break;

        case 'contact':
            require_once 'contact/index.php';
            break;

        case 'admin':
            require_once 'admin/index.php';
            break;

        case 'services':
            require_once 'services/index.php';
            break;

        case 'categories':
            require_once 'categories/index.php';
            break;

        case 'languages':
            require_once 'languages/index.php';
            break;

        case 'support':
            require_once 'support/index.php';
            break;

        case 'test':
            require_once 'test/index.php';
            break;

        default:
            error_response('Endpoint not found', 404);
    }
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    error_response('Internal server error', 500);
}
?>