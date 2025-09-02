<?php
// Languages API endpoints

global $method, $action, $database, $jwt;

switch ($method) {
    case 'GET':
        if ($action === null) {
            // Get UI language for dynamic ordering
            $uiLang = $_GET['ui_lang'] ?? 'en';
            
            // Priority languages (most used in Netherlands)
            $priorityLanguages = ['nl', 'en', 'tr', 'ar'];
            $priorityPlaceholders = str_repeat('?,', count($priorityLanguages) - 1) . '?';
            
            // Dynamic ordering: UI language first, then priority languages, then alphabetical
            $sql = "SELECT code, name_en, name_native, sort_order
                    FROM languages 
                    WHERE is_active = TRUE 
                    ORDER BY 
                        CASE WHEN code = ? THEN 0 ELSE 1 END,
                        CASE WHEN code IN ($priorityPlaceholders) THEN 1 ELSE 2 END,
                        name_en";
            
            // Build parameters: UI language first, then priority languages
            $params = array_merge([$uiLang], $priorityLanguages);
            $languages = $database->fetchAll($sql, $params);
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