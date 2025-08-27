<?php
// Categories API endpoints

global $method, $action, $database, $jwt;

switch ($method) {
    case 'GET':
        if ($action === null) {
            // Get all active categories
            $sql = "SELECT id, slug, parent_id, name_nl, name_en, name_de, name_ar, name_zgh, 
                           name_uk, name_pl, name_zh, name_yue, name_es, name_hi, name_tr, 
                           name_fr, name_ti, name_so, sort_order
                    FROM categories 
                    WHERE is_active = TRUE 
                    ORDER BY parent_id IS NULL DESC, sort_order, name_en";
            
            $categories = $database->fetchAll($sql);
            
            // Organize into tree structure
            $tree = [];
            $lookup = [];
            
            foreach ($categories as $category) {
                $lookup[$category['id']] = $category;
                $lookup[$category['id']]['children'] = [];
            }
            
            foreach ($categories as $category) {
                if ($category['parent_id'] === null) {
                    $tree[] = &$lookup[$category['id']];
                } else {
                    if (isset($lookup[$category['parent_id']])) {
                        $lookup[$category['parent_id']]['children'][] = &$lookup[$category['id']];
                    }
                }
            }
            
            response($tree);
            
        } else {
            // Get specific category by slug
            $sql = "SELECT * FROM categories WHERE slug = ? AND is_active = TRUE";
            $category = $database->fetchOne($sql, [$action]);
            
            if (!$category) {
                error_response('Category not found', 404);
            }
            
            response($category);
        }
        break;
        
    default:
        error_response('Method not allowed', 405);
}
?>