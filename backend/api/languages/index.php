<?php
// Languages API endpoints

global $method, $action, $database, $jwt;

switch ($method) {
    case 'GET':
        if ($action === null) {
            // Get all active languages
            $sql = "SELECT code, name_en, name_native, sort_order
                    FROM languages 
                    WHERE is_active = TRUE 
                    ORDER BY sort_order, name_en";
            
            $languages = $database->fetchAll($sql);
            response($languages);
            
        } else {
            // Get specific language by code
            $sql = "SELECT * FROM languages WHERE code = ? AND is_active = TRUE";
            $language = $database->fetchOne($sql, [$action]);
            
            if (!$language) {
                error_response('Language not found', 404);
            }
            
            response($language);
        }
        break;
        
    default:
        error_response('Method not allowed', 405);
}
?>