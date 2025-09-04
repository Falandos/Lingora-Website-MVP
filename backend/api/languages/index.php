<?php
// Languages API endpoints

global $method, $action, $database, $jwt;

switch ($method) {
    case 'GET':
        if ($action === null) {
            // Use optimized sort_order for Netherlands multilinguals - Explicit ordering
            $sql = "SELECT code, name_en, name_native, sort_order
                    FROM languages 
                    WHERE is_active = TRUE 
                    ORDER BY 
                        CASE code 
                            WHEN 'nl' THEN 1 
                            WHEN 'en' THEN 2 
                            WHEN 'tr' THEN 3 
                            WHEN 'ar' THEN 4 
                            WHEN 'uk' THEN 5 
                            WHEN 'de' THEN 6 
                            WHEN 'pl' THEN 7 
                            WHEN 'fr' THEN 8 
                            WHEN 'es' THEN 9 
                            WHEN 'zh-Hans' THEN 10 
                            WHEN 'hi' THEN 11 
                            WHEN 'pt' THEN 12 
                            WHEN 'it' THEN 13 
                            WHEN 'ru' THEN 14 
                            WHEN 'zgh' THEN 15 
                            WHEN 'so' THEN 16 
                            WHEN 'ti' THEN 17 
                            WHEN 'ur' THEN 18 
                            ELSE 99 
                        END ASC";
            
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