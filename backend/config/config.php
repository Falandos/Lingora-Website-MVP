<?php
// Main configuration file for Lingora

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set timezone
date_default_timezone_set('Europe/Amsterdam');

// Define constants
define('ROOT_PATH', dirname(__DIR__));
define('API_PATH', ROOT_PATH . '/api');
define('UPLOAD_PATH', ROOT_PATH . '/uploads');
define('MODELS_PATH', ROOT_PATH . '/models');
define('SERVICES_PATH', ROOT_PATH . '/services');

// Create upload directories if they don't exist
$uploadDirs = [
    UPLOAD_PATH,
    UPLOAD_PATH . '/gallery',
    UPLOAD_PATH . '/staff',
    UPLOAD_PATH . '/temp'
];

foreach ($uploadDirs as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
}

// Configuration array
$config = [
    'app' => [
        'name' => 'Lingora',
        'version' => '1.0.0',
        'debug' => $_ENV['APP_DEBUG'] ?? true,
        'url' => $_ENV['APP_URL'] ?? 'http://localhost',
        'timezone' => 'Europe/Amsterdam',
    ],
    'database' => [
        'host' => $_ENV['DB_HOST'] ?? 'localhost',
        'name' => $_ENV['DB_NAME'] ?? 'lingora',
        'user' => $_ENV['DB_USER'] ?? 'root',
        'pass' => $_ENV['DB_PASS'] ?? '',
        'charset' => 'utf8mb4',
    ],
    'jwt' => [
        'secret' => $_ENV['JWT_SECRET'] ?? 'your-secret-key-change-in-production',
        'algorithm' => 'HS256',
        'expiry' => 24 * 60 * 60, // 24 hours in seconds
    ],
    'email' => [
        'smtp_enabled' => $_ENV['SMTP_ENABLED'] ?? true,
        'smtp_host' => $_ENV['SMTP_HOST'] ?? 'localhost',
        'smtp_port' => $_ENV['SMTP_PORT'] ?? 587,
        'smtp_username' => $_ENV['SMTP_USERNAME'] ?? '',
        'smtp_password' => $_ENV['SMTP_PASSWORD'] ?? '',
        'smtp_encryption' => $_ENV['SMTP_ENCRYPTION'] ?? 'tls',
        'from_email' => $_ENV['FROM_EMAIL'] ?? 'noreply@lingora.nl',
        'from_name' => $_ENV['FROM_NAME'] ?? 'Lingora',
        'admin_email' => $_ENV['ADMIN_EMAIL'] ?? 'admin@lingora.nl',
    ],
    'upload' => [
        'max_file_size' => 5 * 1024 * 1024, // 5MB
        'allowed_image_types' => ['image/jpeg', 'image/png', 'image/webp'],
        'gallery_max_images' => 6,
    ],
    'security' => [
        'password_min_length' => 8,
        'rate_limit_window' => 3600, // 1 hour in seconds
        'rate_limits' => [
            'contact' => 5, // per hour
            'auth' => 10, // per hour
            'search' => 100, // per hour
        ],
        'captcha_enabled' => $_ENV['CAPTCHA_ENABLED'] ?? true,
        'captcha_secret' => $_ENV['CAPTCHA_SECRET'] ?? '',
    ],
    'search' => [
        'default_radius' => 250, // kilometers - covers most of Netherlands
        'max_radius' => 500, // kilometers - full national coverage
        'results_per_page' => 20,
        'max_results' => 100,
    ],
    'business' => [
        'trial_period_days' => 90,
        'subscription_monthly_price' => 9.99,
        'subscription_yearly_price' => 99.99,
        'currency' => 'EUR',
    ],
    'geocoding' => [
        'nominatim_url' => 'https://nominatim.openstreetmap.org',
        'cache_duration_days' => 30,
        'rate_limit_delay' => 1, // seconds between requests
    ],
];

// CORS settings for API
$cors = [
    'allowed_origins' => $_ENV['CORS_ORIGINS'] ?? [
        'http://localhost:5173',
        'http://localhost:5174', 
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:5177'
    ], // Vite dev server
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    'allowed_headers' => ['Content-Type', 'Authorization'],
    'credentials' => true,
];

// Auto-load classes
spl_autoload_register(function ($class) {
    $directories = [
        MODELS_PATH,
        SERVICES_PATH,
        ROOT_PATH . '/config',
    ];
    
    foreach ($directories as $directory) {
        $file = $directory . '/' . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            break;
        }
    }
});

// Global functions

function response($data = [], $status = 200, $message = '') {
    http_response_code($status);
    header('Content-Type: application/json');
    
    $response = [
        'success' => $status < 400,
        'status' => $status,
    ];
    
    if ($message) {
        $response['message'] = $message;
    }
    
    if ($data) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

function error_response($message, $status = 400, $errors = []) {
    http_response_code($status);
    header('Content-Type: application/json');
    
    $response = [
        'success' => false,
        'status' => $status,
        'message' => $message,
    ];
    
    if ($errors) {
        $response['errors'] = $errors;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

function validate_required_fields($data, $required_fields) {
    $errors = [];
    
    foreach ($required_fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[$field] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
        }
    }
    
    return $errors;
}

function generate_slug($text) {
    // Remove special characters and convert to lowercase
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $text)));
    return trim($slug, '-');
}

function get_client_ip() {
    $ip_keys = ['HTTP_CF_CONNECTING_IP', 'HTTP_CLIENT_IP', 'HTTP_X_FORWARDED_FOR', 'REMOTE_ADDR'];
    
    foreach ($ip_keys as $key) {
        if (array_key_exists($key, $_SERVER) === true) {
            foreach (array_map('trim', explode(',', $_SERVER[$key])) as $ip) {
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) !== false) {
                    return $ip;
                }
            }
        }
    }
    
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

// Handle CORS for API requests
function handle_cors() {
    global $cors;
    
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if (in_array($origin, $cors['allowed_origins']) || in_array('*', $cors['allowed_origins'])) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header('Access-Control-Allow-Methods: ' . implode(', ', $cors['allowed_methods']));
    header('Access-Control-Allow-Headers: ' . implode(', ', $cors['allowed_headers']));
    
    if ($cors['credentials']) {
        header('Access-Control-Allow-Credentials: true');
    }
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

// Initialize CORS handling for API requests
if (strpos($_SERVER['REQUEST_URI'], '/api/') !== false) {
    handle_cors();
}

return $config;
?>