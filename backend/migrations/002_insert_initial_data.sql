-- Initial data for Lingora
-- Languages, Categories, and Site Settings

-- Insert supported languages
INSERT INTO languages (code, name_en, name_native, is_active, sort_order) VALUES
('nl', 'Dutch', 'Nederlands', TRUE, 1),
('en', 'English', 'English', TRUE, 2),
('de', 'German', 'Deutsch', TRUE, 3),
('ar', 'Arabic', 'العربية', TRUE, 4),
('zgh', 'Standard Moroccan Tamazight', 'ⵜⴰⵎⴰⵣⵉⵖⵜ', TRUE, 5),
('uk', 'Ukrainian', 'Українська', TRUE, 6),
('pl', 'Polish', 'Polski', TRUE, 7),
('zh-Hans', 'Chinese (Mandarin)', '中文 (普通话)', TRUE, 8),
('yue', 'Chinese (Cantonese)', '中文 (廣東話)', TRUE, 9),
('es', 'Spanish', 'Español', TRUE, 10),
('hi', 'Hindi', 'हिन्दी', TRUE, 11),
('tr', 'Turkish', 'Türkçe', TRUE, 12),
('fr', 'French', 'Français', TRUE, 13),
('ti', 'Tigrinya', 'ትግርኛ', TRUE, 14),
('so', 'Somali', 'Soomaali', TRUE, 15);

-- Insert main service categories
INSERT INTO categories (slug, name_nl, name_en, name_de, name_ar, name_zgh, name_uk, name_pl, name_zh, name_yue, name_es, name_hi, name_tr, name_fr, name_ti, name_so, is_active, sort_order) VALUES
('healthcare', 'Gezondheidszorg', 'Healthcare', 'Gesundheitswesen', 'الرعاية الصحية', 'ⴰⵙⵖⴰⵏ', 'Охорона здоров''я', 'Opieka zdrowotna', '医疗保健', '醫療保健', 'Atención médica', 'स्वास्थ्य सेवा', 'Sağlık hizmetleri', 'Soins de santé', 'ጥዕና', 'Caafimaad', TRUE, 1),
('legal', 'Juridisch', 'Legal Services', 'Rechtsdienste', 'الخدمات القانونية', 'ⵜⵉⵏⴰⵡⵉⵏ ⵏ ⵓⵣⵔⴼ', 'Юридичні послуги', 'Usługi prawne', '法律服务', '法律服務', 'Servicios legales', 'कानूनी सेवाएं', 'Hukuk hizmetleri', 'Services juridiques', 'ሕጊ', 'Adeeg sharci', TRUE, 2),
('education', 'Onderwijs', 'Education', 'Bildung', 'التعليم', 'ⴰⵙⵙⵍⵎⴷ', 'Освіта', 'Edukacja', '教育', '教育', 'Educación', 'शिक्षा', 'Eğitim', 'Éducation', 'ትምህርቲ', 'Waxbarasho', TRUE, 3),
('finance', 'Financieel', 'Financial Services', 'Finanzdienstleistungen', 'الخدمات المالية', 'ⵜⵉⵏⴰⵡⵉⵏ ⵏ ⵜⵙⵖⴰⵏⵜ', 'Фінансові послуги', 'Usługi finansowe', '金融服务', '金融服務', 'Servicios financieros', 'वित्तीय सेवाएं', 'Finansal hizmetler', 'Services financiers', 'ገንዘባዊ', 'Adeegyo maaliyadeed', TRUE, 4),
('technology', 'Technologie', 'Technology', 'Technologie', 'التكنولوجيا', 'ⵜⵉⵜⵉⴽⵏⵓⵍⵓⵊⵉⵢⵜ', 'Технології', 'Technologia', '技术', '技術', 'Tecnología', 'प्रौद्योगिकी', 'Teknoloji', 'Technologie', 'ቴክኖሎጂ', 'Tignooloji', TRUE, 5),
('beauty-wellness', 'Schoonheid & Wellness', 'Beauty & Wellness', 'Schönheit & Wellness', 'الجمال والعافية', 'ⴰⵛⴽⵓ ⴷ ⵓⵣⴷⵓⵖ', 'Краса та велнес', 'Uroda i wellness', '美容健康', '美容健康', 'Belleza y bienestar', 'सौंदर्य और कल्याण', 'Güzellik ve sağlık', 'Beauté et bien-être', 'ጽባቐን ድሕነትን', 'Qurux iyo caafimaad', TRUE, 6),
('home-services', 'Huis & Tuin', 'Home Services', 'Hausdienstleistungen', 'خدمات المنزل', 'ⵜⵉⵏⴰⵡⵉⵏ ⵏ ⵜⴰⴷⴷⴰⵔⵜ', 'Домашні послуги', 'Usługi domowe', '家庭服务', '家庭服務', 'Servicios del hogar', 'घरेलू सेवाएं', 'Ev hizmetleri', 'Services à domicile', 'ኣገልግሎት ገዛ', 'Adeegyo guriga', TRUE, 7),
('automotive', 'Auto & Transport', 'Automotive', 'Automobil', 'السيارات', 'ⵜⵓⵜⵓⵎⵓⴱⵉⵍ', 'Автомобільні', 'Motoryzacja', '汽车', '汽車', 'Automoción', 'ऑटोमोटिव', 'Otomotiv', 'Automobile', 'መኪና', 'Baabuur', TRUE, 8),
('food-catering', 'Eten & Catering', 'Food & Catering', 'Essen & Catering', 'الطعام والضيافة', 'ⵓⵛⵛⵉ ⴷ ⵓⵙⵏⵓⵍ', 'Їжа та кейтеринг', 'Żywność i catering', '餐饮', '餐飲', 'Comida y catering', 'भोजन और खानपान', 'Yiyecek ve catering', 'Alimentation et traiteur', 'መግቢ', 'Cunto iyo adeegyo', TRUE, 9),
('real-estate', 'Vastgoed', 'Real Estate', 'Immobilien', 'العقارات', 'ⵜⵉⵎⵓⵔⴰ', 'Нерухомість', 'Nieruchomości', '房地产', '房地產', 'Bienes raíces', 'अचल संपत्ति', 'Gayrimenkul', 'Immobilier', 'መሬት', 'Dhul-guri', TRUE, 10);

-- Insert healthcare subcategories
INSERT INTO categories (slug, parent_id, name_nl, name_en, name_de, name_ar, name_zgh, name_uk, name_pl, name_zh, name_yue, name_es, name_hi, name_tr, name_fr, name_ti, name_so, is_active, sort_order) VALUES
('general-medicine', 1, 'Huisartsen', 'General Medicine', 'Allgemeinmedizin', 'الطب العام', 'ⴰⵙⵖⴰⵏ ⴰⵎⴰⵜⴰⵢ', 'Загальна медицина', 'Medycyna ogólna', '全科医学', '全科醫學', 'Medicina general', 'सामान्य चिकित्सा', 'Genel tıp', 'Médecine générale', 'ሓቀኛ ሕክምና', 'Dhaqanka guud', TRUE, 1),
('dentistry', 1, 'Tandheelkunde', 'Dentistry', 'Zahnmedizin', 'طب الأسنان', 'ⴰⵙⵖⴰⵏ ⵏ ⵉⵙⵏⴰⵏ', 'Стоматологія', 'Stomatologia', '牙科', '牙科', 'Odontología', 'दंत चिकित्सा', 'Diş hekimliği', 'Dentisterie', 'ሕክምና ስንኒ', 'Dhaqanka ilkaha', TRUE, 2),
('psychology', 1, 'Psychologie', 'Psychology', 'Psychologie', 'علم النفس', 'ⵜⴰⵡⵏⴳⵉⵎⵜ', 'Психологія', 'Psychologia', '心理学', '心理學', 'Psicología', 'मनोविज्ञान', 'Psikoloji', 'Psychologie', 'ናይ ኣእምሮ ሳይንስ', 'Cilmi-nafsiga', TRUE, 3),
('physiotherapy', 1, 'Fysiotherapie', 'Physiotherapy', 'Physiotherapie', 'العلاج الطبيعي', 'ⴰⵙⴰⴼⵓ ⴰⴳⴰⵎⴰⵏ', 'Фізіотерапія', 'Fizjoterapia', '物理治疗', '物理治療', 'Fisioterapia', 'भौतिक चिकित्सा', 'Fizyoterapi', 'Physiothérapie', 'ሕክምና ኣካላዊ', 'Daaweyn jidheed', TRUE, 4);

-- Insert legal subcategories
INSERT INTO categories (slug, parent_id, name_nl, name_en, name_de, name_ar, name_zgh, name_uk, name_pl, name_zh, name_yue, name_es, name_hi, name_tr, name_fr, name_ti, name_so, is_active, sort_order) VALUES
('immigration-law', 2, 'Immigratierecht', 'Immigration Law', 'Einwanderungsrecht', 'قانون الهجرة', 'ⴰⵣⵔⴼ ⵏ ⵓⵎⵓⴷⴷⵓ', 'Імміграційне право', 'Prawo imigracyjne', '移民法', '移民法', 'Derecho de inmigración', 'आप्रवासन कानून', 'Göçmenlik hukuku', 'Droit de l''immigration', 'ሕጊ ስደት', 'Sharciga socdaalka', TRUE, 1),
('family-law', 2, 'Familierecht', 'Family Law', 'Familienrecht', 'قانون الأسرة', 'ⴰⵣⵔⴼ ⵏ ⵜⴰⵡⴰⵛⵜ', 'Сімейне право', 'Prawo rodzinne', '家庭法', '家庭法', 'Derecho familiar', 'पारिवारिक कानून', 'Aile hukuku', 'Droit de la famille', 'ሕጊ ስድራቤት', 'Sharciga qoyska', TRUE, 2),
('business-law', 2, 'Ondernemingsrecht', 'Business Law', 'Unternehmensrecht', 'قانون الأعمال', 'ⴰⵣⵔⴼ ⵏ ⵜⵙⴱⴱⴰⴱⵜ', 'Підприємницьке право', 'Prawo gospodarcze', '商法', '商法', 'Derecho empresarial', 'व्यापार कानून', 'İş hukuku', 'Droit des affaires', 'ሕጊ ንግዲ', 'Sharciga ganacsiga', TRUE, 3),
('housing-law', 2, 'Huurrecht', 'Housing Law', 'Mietrecht', 'قانون الإسكان', 'ⴰⵣⵔⴼ ⵏ ⵜⵙⴳⴰ', 'Житлове право', 'Prawo mieszkaniowe', '住房法', '住房法', 'Derecho de vivienda', 'आवास कानून', 'Konut hukuku', 'Droit du logement', 'ሕጊ ቤት', 'Sharciga guriga', TRUE, 4);

-- Insert education subcategories
INSERT INTO categories (slug, parent_id, name_nl, name_en, name_de, name_ar, name_zgh, name_uk, name_pl, name_zh, name_yue, name_es, name_hi, name_tr, name_fr, name_ti, name_so, is_active, sort_order) VALUES
('tutoring', 3, 'Bijles', 'Tutoring', 'Nachhilfe', 'الدروس الخصوصية', 'ⴰⵙⵙⵍⵎⴷ ⴰⵎⴰⵢⵏⵓ', 'Репетиторство', 'Korepetycje', '辅导', '補習', 'Tutoría', 'ट्यूटरिंग', 'Özel ders', 'Tutorat', 'ምልምላ', 'Cashar gaarka ah', TRUE, 1),
('language-courses', 3, 'Taallessen', 'Language Courses', 'Sprachkurse', 'دورات اللغة', 'ⵉⵙⵓⵖⴰⵍ ⵏ ⵜⵓⵜⵍⴰⵢⵉⵏ', 'Мовні курси', 'Kursy językowe', '语言课程', '語言課程', 'Cursos de idiomas', 'भाषा कोर्स', 'Dil kursları', 'Cours de langues', 'ኮርስ ቋንቋ', 'Koorsada luqadda', TRUE, 2),
('music-lessons', 3, 'Muzieklessen', 'Music Lessons', 'Musikunterricht', 'دروس الموسيقى', 'ⵉⵙⵓⵖⴰⵍ ⵏ ⵜⵓⵖⴰⵔⵉⵏ', 'Уроки музики', 'Lekcje muzyki', '音乐课', '音樂課', 'Lecciones de música', 'संगीत के पाठ', 'Müzik dersleri', 'Cours de musique', 'ትምህርቲ ሙዚቃ', 'Casharrada muusikada', TRUE, 3),
('driving-lessons', 3, 'Rijlessen', 'Driving Lessons', 'Fahrstunden', 'دروس القيادة', 'ⵉⵙⵓⵖⴰⵍ ⵏ ⵉⵏⵏⴰⵖ', 'Уроки водіння', 'Nauka jazdy', '驾驶课', '駕駛課', 'Lecciones de manejo', 'ड्राइविंग के पाठ', 'Sürücü kursu', 'Cours de conduite', 'ትምህርቲ መዝሕቀት', 'Casharrada wadista', TRUE, 4);

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('site_name', 'Lingora', 'string', 'Site name displayed in header'),
('site_tagline_en', 'Find professionals who speak YOUR language', 'string', 'Site tagline in English'),
('site_tagline_nl', 'Vind professionals die JOUW taal spreken', 'string', 'Site tagline in Dutch'),
('default_search_radius', '25', 'integer', 'Default search radius in kilometers'),
('max_gallery_images', '6', 'integer', 'Maximum number of gallery images per provider'),
('trial_period_days', '90', 'integer', 'Trial period duration in days'),
('contact_rate_limit', '5', 'integer', 'Contact form submissions per hour per IP'),
('admin_email', 'admin@lingora.nl', 'string', 'Admin email for notifications'),
('smtp_enabled', 'true', 'boolean', 'Enable SMTP email sending'),
('site_maintenance', 'false', 'boolean', 'Site maintenance mode'),
('registration_enabled', 'true', 'boolean', 'Allow new provider registrations'),
('geocoding_cache_days', '30', 'integer', 'Geocoding cache duration in days');

-- Create default admin user (password: admin123 - CHANGE IN PRODUCTION!)
-- Password hash for 'admin123' using PHP password_hash()
INSERT INTO users (email, password_hash, role, email_verified) VALUES
('admin@lingora.nl', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', TRUE);

-- Insert default legal pages
INSERT INTO pages (slug, title_nl, title_en, content_nl, content_en, meta_description_nl, meta_description_en) VALUES
('terms', 'Algemene Voorwaarden', 'Terms of Service', 
 '<h1>Algemene Voorwaarden</h1><p>Deze algemene voorwaarden zijn van toepassing op het gebruik van Lingora.</p>', 
 '<h1>Terms of Service</h1><p>These terms and conditions apply to the use of Lingora.</p>',
 'Algemene voorwaarden voor het gebruik van Lingora', 'Terms of service for using Lingora'),
('privacy', 'Privacybeleid', 'Privacy Policy', 
 '<h1>Privacybeleid</h1><p>Dit privacybeleid beschrijft hoe Lingora met uw persoonlijke gegevens omgaat.</p>', 
 '<h1>Privacy Policy</h1><p>This privacy policy describes how Lingora handles your personal data.</p>',
 'Privacybeleid van Lingora', 'Privacy policy of Lingora'),
('cookies', 'Cookiebeleid', 'Cookie Policy', 
 '<h1>Cookiebeleid</h1><p>Dit cookiebeleid legt uit hoe Lingora cookies gebruikt.</p>', 
 '<h1>Cookie Policy</h1><p>This cookie policy explains how Lingora uses cookies.</p>',
 'Cookiebeleid van Lingora', 'Cookie policy of Lingora'),
('impressum', 'Impressum', 'Impressum', 
 '<h1>Impressum</h1><p>Bedrijfsgegevens en contactinformatie van Lingora.</p>', 
 '<h1>Impressum</h1><p>Company information and contact details of Lingora.</p>',
 'Impressum en bedrijfsgegevens van Lingora', 'Impressum and company information of Lingora');