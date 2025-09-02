<?php
// Search suggestions API endpoint
// Provides intelligent autocomplete suggestions based on the search trinity:
// Language + Profession + Location

global $method, $database, $jwt;

if ($method !== 'GET') {
    error_response('Method not allowed', 405);
}

// Get query parameter
$query = trim($_GET['q'] ?? '');

if (empty($query) || strlen($query) < 2) {
    response(['suggestions' => []]);
}

// Convert query to lowercase for matching
$queryLower = strtolower($query);

try {
    // Initialize suggestion service
    $suggestionService = new SearchSuggestionService($database);
    $suggestions = $suggestionService->generateSuggestions($queryLower);
    
    response([
        'suggestions' => $suggestions,
        'query' => $query,
        'components_detected' => $suggestionService->getDetectedComponents()
    ]);
    
} catch (Exception $e) {
    error_log("Suggestions API error: " . $e->getMessage());
    error_response('Failed to generate suggestions', 500);
}

/**
 * Search Suggestion Service
 * Implements the search trinity logic: Language + Profession + Location
 */
class SearchSuggestionService {
    private $database;
    private $detectedComponents;
    
    // Language keywords mapping
    private $languageKeywords = [
        'nederlands' => 'nl', 'nederlandse' => 'nl', 'holland' => 'nl', 'dutch' => 'nl',
        'engels' => 'en', 'engelse' => 'en', 'english' => 'en',
        'turks' => 'tr', 'turkse' => 'tr', 'turkish' => 'tr',
        'arabisch' => 'ar', 'arabische' => 'ar', 'arabic' => 'ar',
        'marokkaans' => 'ar', 'marokkaanse' => 'ar', 'moroccan' => 'ar',
        'pools' => 'pl', 'poolse' => 'pl', 'polish' => 'pl',
        'spaans' => 'es', 'spaanse' => 'es', 'spanish' => 'es',
        'frans' => 'fr', 'franse' => 'fr', 'french' => 'fr',
        'duits' => 'de', 'duitse' => 'de', 'german' => 'de',
        'chinees' => 'zh', 'chinese' => 'zh'
    ];
    
    // Common profession synonyms
    private $professionKeywords = [
        'dokter' => ['dokter', 'arts', 'physician', 'doctor'],
        'advocaat' => ['advocaat', 'lawyer', 'attorney'],
        'tandarts' => ['tandarts', 'dentist'],
        'psycholoog' => ['psycholoog', 'psychologist', 'therapist'],
        'fysiotherapeut' => ['fysiotherapeut', 'fysio', 'physiotherapist'],
        'huisarts' => ['huisarts', 'gp', 'family doctor'],
        'specialist' => ['specialist', 'specialisme'],
        'coach' => ['coach', 'coaching'],
        'adviseur' => ['adviseur', 'consultant', 'advisor']
    ];
    
    public function __construct($database) {
        $this->database = $database;
        $this->detectedComponents = [
            'language' => null,
            'profession' => null,
            'location' => null
        ];
    }
    
    public function generateSuggestions($query) {
        // Detect components in the query
        $this->detectComponents($query);
        
        // Generate suggestions based on missing components
        $suggestions = [];
        
        $hasLanguage = !empty($this->detectedComponents['language']);
        $hasProfession = !empty($this->detectedComponents['profession']);
        $hasLocation = !empty($this->detectedComponents['location']);
        
        if (!$hasLanguage && $hasProfession && $hasLocation) {
            // Missing language: suggest popular languages for this profession/location combo
            $suggestions = $this->suggestLanguages($query);
        } elseif (!$hasProfession && $hasLanguage && $hasLocation) {
            // Missing profession: suggest popular professions for this language/location combo
            $suggestions = $this->suggestProfessions($query);
        } elseif (!$hasLocation && $hasLanguage && $hasProfession) {
            // Missing location: suggest popular cities for this language/profession combo
            $suggestions = $this->suggestLocations($query);
        } elseif (!$hasLanguage && !$hasProfession && $hasLocation) {
            // Only location: suggest language+profession combinations
            $suggestions = $this->suggestLanguageAndProfession($query);
        } elseif (!$hasLocation && !$hasProfession && $hasLanguage) {
            // Only language: suggest profession combinations first, then add locations
            $suggestions = $this->suggestProfessionAndLocation($query);
        } elseif (!$hasLanguage && !$hasLocation && $hasProfession) {
            // Only profession: suggest language+location combinations
            $suggestions = $this->suggestLanguageAndLocation($query);
        } else {
            // Partial words or no clear components: suggest completions
            $suggestions = $this->suggestCompletions($query);
        }
        
        // Limit to 6 suggestions max
        return array_slice($suggestions, 0, 6);
    }
    
    private function detectComponents($query) {
        $words = explode(' ', $query);
        
        // Detect language
        foreach ($words as $word) {
            $word = trim($word);
            if (isset($this->languageKeywords[$word])) {
                $this->detectedComponents['language'] = $this->languageKeywords[$word];
                break;
            }
        }
        
        // Detect profession
        foreach ($this->professionKeywords as $profession => $keywords) {
            foreach ($keywords as $keyword) {
                if (strpos($query, $keyword) !== false) {
                    $this->detectedComponents['profession'] = $profession;
                    break 2;
                }
            }
        }
        
        // Detect location (check against cities database)
        $this->detectLocation($query);
    }
    
    private function detectLocation($query) {
        try {
            // Check against major cities first for performance
            $sql = "SELECT name FROM cities WHERE LOWER(name) = ? OR LOWER(name) LIKE ? LIMIT 1";
            $words = explode(' ', $query);
            
            foreach ($words as $word) {
                $word = trim($word);
                if (strlen($word) >= 3) {
                    $result = $this->database->fetchOne($sql, [$word, "%$word%"]);
                    if ($result) {
                        $this->detectedComponents['location'] = $result['name'];
                        return;
                    }
                }
            }
        } catch (Exception $e) {
            // Fallback to hardcoded major cities
            $majorCities = ['amsterdam', 'rotterdam', 'utrecht', 'den haag', 'eindhoven', 'groningen', 'tilburg', 'almere', 'breda', 'nijmegen'];
            foreach ($majorCities as $city) {
                if (strpos($query, $city) !== false) {
                    $this->detectedComponents['location'] = ucfirst($city);
                    return;
                }
            }
        }
    }
    
    private function suggestLanguages($query) {
        $suggestions = [];
        
        // Get popular languages from database
        try {
            $sql = "SELECT DISTINCT l.code, l.name_native, COUNT(pl.provider_id) as provider_count
                    FROM languages l
                    JOIN provider_languages pl ON l.code = pl.language_code
                    JOIN providers p ON pl.provider_id = p.id
                    WHERE p.status = 'approved' AND p.subscription_status != 'frozen'
                    GROUP BY l.code, l.name_native
                    ORDER BY provider_count DESC
                    LIMIT 8";
            
            $languages = $this->database->fetchAll($sql);
            
            foreach ($languages as $lang) {
                $languageName = strtolower($lang['name_native'] ?? $lang['code']);
                if ($lang['code'] === 'nl') $languageName = 'nederlandse';
                if ($lang['code'] === 'en') $languageName = 'engelse';
                if ($lang['code'] === 'tr') $languageName = 'turkse';
                if ($lang['code'] === 'ar') $languageName = 'arabische';
                if ($lang['code'] === 'pl') $languageName = 'poolse';
                
                $suggestions[] = $languageName . ' ' . $query;
            }
        } catch (Exception $e) {
            // Fallback to hardcoded popular languages
            $popularLanguages = ['nederlandse', 'engelse', 'turkse', 'arabische', 'poolse', 'spaanse'];
            foreach ($popularLanguages as $lang) {
                $suggestions[] = $lang . ' ' . $query;
            }
        }
        
        return array_unique($suggestions);
    }
    
    private function suggestProfessions($query) {
        $suggestions = [];
        
        // Get popular professions/categories from database
        try {
            $sql = "SELECT DISTINCT c.name_nl, COUNT(s.provider_id) as provider_count
                    FROM categories c
                    JOIN services s ON c.id = s.category_id
                    JOIN providers p ON s.provider_id = p.id
                    WHERE p.status = 'approved' AND p.subscription_status != 'frozen'
                    AND s.is_active = TRUE AND c.parent_id IS NULL
                    GROUP BY c.id, c.name_nl
                    ORDER BY provider_count DESC
                    LIMIT 8";
            
            $categories = $this->database->fetchAll($sql);
            
            foreach ($categories as $cat) {
                $profession = strtolower($cat['name_nl']);
                $suggestion = str_replace($this->detectedComponents['location'] ?? '', '', $query);
                $suggestion = trim($suggestion) . ' ' . $profession;
                if ($this->detectedComponents['location']) {
                    $suggestion .= ' ' . strtolower($this->detectedComponents['location']);
                }
                $suggestions[] = trim($suggestion);
            }
        } catch (Exception $e) {
            // Fallback to hardcoded popular professions
            $popularProfessions = ['advocaat', 'dokter', 'tandarts', 'psycholoog', 'fysiotherapeut', 'huisarts'];
            foreach ($popularProfessions as $profession) {
                $suggestion = str_replace($this->detectedComponents['location'] ?? '', '', $query);
                $suggestion = trim($suggestion) . ' ' . $profession;
                if ($this->detectedComponents['location']) {
                    $suggestion .= ' ' . strtolower($this->detectedComponents['location']);
                }
                $suggestions[] = trim($suggestion);
            }
        }
        
        return array_unique($suggestions);
    }
    
    private function suggestLocations($query) {
        $suggestions = [];
        
        // Get popular cities from database
        try {
            $sql = "SELECT DISTINCT p.city, COUNT(p.id) as provider_count
                    FROM providers p
                    WHERE p.status = 'approved' AND p.subscription_status != 'frozen'
                    AND p.city IS NOT NULL AND p.city != ''
                    GROUP BY p.city
                    ORDER BY provider_count DESC
                    LIMIT 8";
            
            $cities = $this->database->fetchAll($sql);
            
            foreach ($cities as $city) {
                $suggestions[] = $query . ' ' . strtolower($city['city']);
            }
        } catch (Exception $e) {
            // Fallback to hardcoded major cities
            $majorCities = ['amsterdam', 'rotterdam', 'utrecht', 'den haag', 'eindhoven', 'groningen'];
            foreach ($majorCities as $city) {
                $suggestions[] = $query . ' ' . $city;
            }
        }
        
        return array_unique($suggestions);
    }
    
    private function suggestLanguageAndProfession($query) {
        $suggestions = [];
        $location = $this->detectedComponents['location'];
        
        // Popular language + profession combinations
        $combinations = [
            'turkse advocaat', 'nederlandse dokter', 'engelse psycholoog',
            'arabische huisarts', 'turkse tandarts', 'poolse fysiotherapeut'
        ];
        
        foreach ($combinations as $combo) {
            $suggestions[] = $combo . ' ' . strtolower($location);
        }
        
        return array_unique($suggestions);
    }
    
    private function suggestProfessionAndLocation($query) {
        $suggestions = [];
        $language = $this->detectedComponents['language'];
        
        // Get language name
        $langName = array_search($language, $this->languageKeywords);
        if (!$langName) {
            if ($language === 'nl') $langName = 'nederlandse';
            if ($language === 'en') $langName = 'engelse';
            if ($language === 'tr') $langName = 'turkse';
            if ($language === 'ar') $langName = 'arabische';
        }
        
        // Popular combinations
        $professions = ['advocaat', 'dokter', 'tandarts', 'psycholoog'];
        $cities = ['rotterdam', 'amsterdam', 'utrecht'];
        
        foreach ($professions as $profession) {
            $suggestions[] = $langName . ' ' . $profession;
        }
        
        // Add some with locations
        foreach (array_slice($cities, 0, 2) as $city) {
            $suggestions[] = $langName . ' advocaat ' . $city;
        }
        
        return array_unique($suggestions);
    }
    
    private function suggestLanguageAndLocation($query) {
        $suggestions = [];
        $profession = $this->detectedComponents['profession'];
        
        $languages = ['turkse', 'nederlandse', 'engelse', 'arabische'];
        $cities = ['rotterdam', 'amsterdam', 'utrecht'];
        
        foreach ($languages as $lang) {
            $suggestions[] = $lang . ' ' . $profession;
        }
        
        // Add some with locations
        foreach (array_slice($cities, 0, 2) as $city) {
            $suggestions[] = 'turkse ' . $profession . ' ' . $city;
        }
        
        return array_unique($suggestions);
    }
    
    private function suggestCompletions($query) {
        $suggestions = [];
        
        // Try to complete partial words
        if (strlen($query) >= 3) {
            // Check if it's a partial language
            foreach ($this->languageKeywords as $keyword => $code) {
                if (strpos($keyword, $query) === 0) {
                    $suggestions[] = $keyword . ' advocaat';
                    $suggestions[] = $keyword . ' dokter';
                    break;
                }
            }
            
            // Check if it's a partial profession
            foreach ($this->professionKeywords as $profession => $keywords) {
                foreach ($keywords as $keyword) {
                    if (strpos($keyword, $query) === 0) {
                        $suggestions[] = 'turkse ' . $keyword;
                        $suggestions[] = 'nederlandse ' . $keyword;
                        $suggestions[] = $keyword . ' rotterdam';
                        break 2;
                    }
                }
            }
        }
        
        // If no specific completions, provide popular searches
        if (empty($suggestions)) {
            $suggestions = [
                'turkse advocaat rotterdam',
                'nederlandse dokter amsterdam',
                'engelse psycholoog utrecht',
                'arabische tandarts den haag',
                'poolse fysiotherapeut eindhoven'
            ];
        }
        
        return array_unique($suggestions);
    }
    
    public function getDetectedComponents() {
        return $this->detectedComponents;
    }
}
?>