<?php
// Public entry point for Lingora backend

// Redirect all requests to the API
if (strpos($_SERVER['REQUEST_URI'], '/api/') === 0) {
    require_once '../api/index.php';
} else {
    // Serve uploaded files or show API info
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    
    if (strpos($uri, '/uploads/') === 0) {
        // Serve uploaded files
        $filePath = '../' . ltrim($uri, '/');
        
        if (file_exists($filePath) && is_file($filePath)) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mimeType = finfo_file($finfo, $filePath);
            finfo_close($finfo);
            
            header('Content-Type: ' . $mimeType);
            readfile($filePath);
            exit;
        } else {
            http_response_code(404);
            echo 'File not found';
            exit;
        }
    } else {
        // Show API information
        header('Content-Type: application/json');
        echo json_encode([
            'name' => 'Lingora API',
            'version' => '1.0.0',
            'endpoints' => [
                'auth' => '/api/auth/*',
                'providers' => '/api/providers/*',
                'search' => '/api/search',
                'contact' => '/api/contact',
                'admin' => '/api/admin/*',
                'categories' => '/api/categories',
                'languages' => '/api/languages'
            ]
        ], JSON_PRETTY_PRINT);
    }
}
?>