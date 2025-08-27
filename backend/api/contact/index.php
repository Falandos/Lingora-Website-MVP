<?php
// Contact API endpoint

global $method, $database, $jwt;

if ($method !== 'POST') {
    error_response('Method not allowed', 405);
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];

// Validate required fields
$errors = validate_required_fields($data, [
    'provider_id', 'sender_name', 'sender_email', 
    'preferred_language', 'subject', 'message', 'consent_given'
]);

if ($errors) {
    error_response('Validation failed', 400, $errors);
}

// Additional validation
if (!filter_var($data['sender_email'], FILTER_VALIDATE_EMAIL)) {
    error_response('Invalid email address', 400);
}

if (!$data['consent_given']) {
    error_response('Consent is required to process your message', 400);
}

// Check if provider exists and is visible
$providerModel = new Provider();
$provider = $providerModel->findById($data['provider_id']);

if (!$provider || !$providerModel->isVisible($provider)) {
    error_response('Provider not found', 404);
}

// Check rate limiting
$clientIp = get_client_ip();
$rateLimitSql = "SELECT COUNT(*) as count FROM messages 
                 WHERE ip_address = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)";
$rateResult = $database->fetchOne($rateLimitSql, [$clientIp]);

global $config;
$hourlyLimit = $config['security']['rate_limits']['contact'] ?? 5;

if ($rateResult['count'] >= $hourlyLimit) {
    error_response('Too many messages sent. Please try again later.', 429);
}

try {
    // Insert message
    $insertSql = "INSERT INTO messages (
        provider_id, service_id, sender_name, sender_email, preferred_language,
        subject, message, consent_given, ip_address, user_agent, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())";
    
    $database->query($insertSql, [
        $data['provider_id'],
        $data['service_id'] ?? null,
        $data['sender_name'],
        $data['sender_email'],
        $data['preferred_language'],
        $data['subject'],
        $data['message'],
        $data['consent_given'] ? 1 : 0,
        $clientIp,
        $_SERVER['HTTP_USER_AGENT'] ?? ''
    ]);
    
    $messageId = $database->lastInsertId();
    
    // TODO: Send email to provider
    // TODO: Send BCC to admin
    // TODO: Send auto-reply to sender
    
    response([
        'message' => 'Message sent successfully',
        'message_id' => $messageId
    ], 201);
    
} catch (Exception $e) {
    error_log("Contact message error: " . $e->getMessage());
    error_response('Failed to send message', 500);
}
?>