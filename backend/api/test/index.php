<?php
// Test API endpoint

global $method, $action, $id, $database, $jwt;

response([
    'message' => 'Test endpoint working',
    'method' => $method,
    'action' => $action,
    'id' => $id
]);
?>