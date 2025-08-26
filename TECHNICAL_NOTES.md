# Technical Notes & Reference
*Detailed technical analysis and system documentation*
*Last Updated: 2025-08-25*

## 🏗️ System Architecture Deep Dive

### Frontend Architecture (React 19.1)

#### Component Hierarchy
```
App.tsx
├── AuthProvider (Context)
├── Router
    ├── PublicRoutes
    │   ├── HomePage
    │   ├── SearchPage (with map integration)
    │   └── ProviderPage (public profile)
    └── ProtectedRoutes (Role-based)
        ├── DashboardLayout (shared)
        ├── ProviderDashboard
        │   ├── ProfilePage
        │   ├── ServicesPage  
        │   ├── StaffPage
        │   └── MessagesPage
        └── AdminDashboard
            ├── OverviewPage
            ├── ProvidersPage
            ├── MessagesPage
            └── SettingsPage
```

#### State Management Strategy
- **Authentication**: React Context + localStorage for JWT tokens
- **API Data**: Direct useState in components (simple, effective for MVP)
- **Form State**: useState for form data with validation
- **Modal State**: Local component state with React Portal

#### Key Patterns Used
```typescript
// API Error Handling Pattern
const handleApiCall = async () => {
  try {
    setLoading(true);
    const response = await fetch(endpoint);
    const data = await response.json();
    
    if (data.success) {
      setData(data.data);
    } else {
      setError(data.message || 'Operation failed');
    }
  } catch (error) {
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};

// Modal Component Pattern (Prevents Flickering)
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  
  const modalContent = (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative z-10 flex items-center justify-center min-h-full p-4">
        {children}
      </div>
    </div>
  );
  
  return createPortal(modalContent, document.body);
};
```

### Backend Architecture (PHP 8.2)

#### API Structure
```
backend/
├── public/
│   └── index.php (Entry point with routing)
├── api/
│   ├── auth/
│   │   ├── login.php
│   │   └── register.php
│   ├── search/
│   │   └── index.php (Main search endpoint)
│   ├── providers/
│   │   ├── index.php (CRUD operations)
│   │   └── {slug}.php (Public provider data)
│   └── admin/
│       └── stats.php (Admin dashboard data)
├── models/
│   ├── User.php
│   ├── Provider.php
│   └── Database.php (PDO connection)
└── config/
    ├── database.php
    └── config.php (CORS, rate limiting)
```

#### Database Connection Pattern
```php
class Database {
    private static $instance = null;
    private $connection;
    
    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        $config = include 'config/database.php';
        $this->connection = new PDO(
            "mysql:host={$config['host']};dbname={$config['database']};charset=utf8mb4",
            $config['username'],
            $config['password'],
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }
}
```

#### Authentication Flow
1. **Login**: POST /api/auth/login with email/password
2. **Token Generation**: JWT token with user ID and role
3. **Token Storage**: Frontend stores in AuthContext + localStorage
4. **API Protection**: Bearer token in Authorization header
5. **Token Validation**: Backend verifies JWT on protected endpoints

---

## 🗃️ Database Schema Details

### Core Tables with Relationships

```sql
-- Users table (Authentication)
users: 
  id (PK), email (UNIQUE), password_hash, role (provider/admin), 
  email_verified, created_at, updated_at

-- Providers table (Business Profiles)  
providers:
  id (PK), user_id (FK→users.id), business_name, slug (UNIQUE),
  city, address, postal_code, latitude, longitude,
  bio_nl, bio_en, kvk_number, btw_number,
  status (pending/approved/rejected), subscription_status,
  opening_hours (JSON), created_at, updated_at

-- Staff table (Team Members)
staff:
  id (PK), provider_id (FK→providers.id), name, role, 
  email, phone, is_active, is_public, sort_order,
  created_at, updated_at

-- Services table (Service Offerings)
services:
  id (PK), provider_id (FK→providers.id), category_id (FK→categories.id),
  title, description_nl, description_en, price_min, price_max,
  service_mode (online/in_person/both), is_active, sort_order,
  created_at, updated_at

-- Staff-Language Association
staff_languages:
  id (PK), staff_id (FK→staff.id), language_code (FK→languages.code),
  cefr_level (A1/A2/B1/B2/C1/C2), created_at

-- Contact Messages
messages:
  id (PK), provider_id (FK→providers.id), sender_name, sender_email,
  preferred_language, subject, message, consent_given,
  ip_address, created_at
```

### Missing Relationships (To Implement)
```sql
-- Service-Staff Association (Critical Missing Link)
service_staff:
  id (PK), service_id (FK→services.id), staff_id (FK→staff.id),
  is_primary (BOOLEAN), created_at

-- Provider Gallery (Image Management)
provider_gallery:
  id (PK), provider_id (FK→providers.id), image_url,
  image_alt, sort_order, created_at
```

### Data Integrity Constraints
- **User-Provider**: 1:1 relationship (One user account per provider)
- **Provider-Staff**: 1:many (Multiple team members per provider)
- **Provider-Services**: 1:many (Multiple services per provider)
- **Staff-Languages**: many:many (Staff can speak multiple languages)
- **Services-Staff**: many:many (Staff can provide multiple services)

---

## 🔍 Search System Implementation

### Frontend Search Flow
1. **User Input**: Search form with filters (language, category, city, radius)
2. **Coordinate Lookup**: Convert city names to lat/lng coordinates
3. **API Request**: Send search parameters including coordinates
4. **Result Display**: Show providers in list + map view
5. **Distance Calculation**: Display distance from user's selected location

### Backend Search Logic
```php
// Dynamic query building based on filters
$query = "SELECT p.*, 
  CASE WHEN :lat IS NOT NULL AND :lng IS NOT NULL THEN
    6371 * acos(cos(radians(:lat)) * cos(radians(p.latitude)) 
    * cos(radians(p.longitude) - radians(:lng)) 
    + sin(radians(:lat)) * sin(radians(p.latitude)))
  ELSE NULL END as distance
FROM providers p
JOIN staff s ON p.id = s.provider_id
JOIN staff_languages sl ON s.id = sl.staff_id
WHERE p.status = 'approved' AND p.subscription_status != 'frozen'";

// Add filters dynamically
if ($language) {
    $query .= " AND sl.language_code = :language";
}
if ($category) {
    $query .= " AND EXISTS (SELECT 1 FROM services serv WHERE serv.provider_id = p.id AND serv.category_id = :category)";
}
if ($radius && $lat && $lng) {
    $query .= " HAVING distance <= :radius";
}
```

### Geographic Search Details
- **Distance Formula**: Haversine formula for accurate distance calculation
- **Coordinate Sources**: Hardcoded major Dutch cities, expandable to geocoding API
- **Performance**: Indexed on latitude/longitude for fast radius queries
- **Fallback**: City name search when coordinates unavailable

---

## 🔒 Security Implementation

### Authentication Security
```php
// JWT Token Generation
$payload = [
    'user_id' => $user['id'],
    'role' => $user['role'],
    'exp' => time() + (24 * 60 * 60) // 24 hours
];
$token = JWT::encode($payload, $secret_key, 'HS256');

// Password Hashing (Proper Method)
$password_hash = password_hash($password, PASSWORD_DEFAULT);
$is_valid = password_verify($input_password, $stored_hash);
```

### Rate Limiting Implementation
```php
// Contact Form Rate Limiting (5 per hour per IP)
$ip = $_SERVER['REMOTE_ADDR'];
$key = "contact_rate_limit_" . $ip;
$attempts = $cache->get($key) ?: 0;

if ($attempts >= 5) {
    http_response_code(429);
    exit(json_encode(['error' => 'Rate limit exceeded']));
}

$cache->set($key, $attempts + 1, 3600); // 1 hour
```

### Input Validation Pattern
```php
// Comprehensive Input Sanitization
function sanitizeInput($input, $type = 'string') {
    $input = trim($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    
    switch ($type) {
        case 'email':
            return filter_var($input, FILTER_VALIDATE_EMAIL);
        case 'int':
            return filter_var($input, FILTER_VALIDATE_INT);
        case 'float':
            return filter_var($input, FILTER_VALIDATE_FLOAT);
        default:
            return $input;
    }
}
```

---

## 🚀 Performance Optimizations

### Frontend Performance
- **Bundle Splitting**: Vite automatic code splitting
- **Image Optimization**: Lazy loading for gallery images
- **API Caching**: Simple in-memory caching for static data (categories, languages)
- **Component Optimization**: React.memo for expensive renders

### Backend Performance
```sql
-- Database Indexes for Performance
CREATE INDEX idx_providers_location ON providers(latitude, longitude);
CREATE INDEX idx_providers_status ON providers(status, subscription_status);
CREATE INDEX idx_staff_languages_lang ON staff_languages(language_code);
CREATE INDEX idx_services_category ON services(category_id);
```

### Query Optimization Strategies
- **Avoid N+1 Queries**: Use JOINs instead of separate queries
- **Limit Result Sets**: Pagination with LIMIT/OFFSET
- **Index Usage**: Ensure all WHERE clauses use indexed columns
- **Query Caching**: MySQL query cache for repeated searches

---

## 🌐 Internationalization System

### Frontend i18n Structure
```typescript
// Language Configuration
const resources = {
  en: { translation: require('./locales/en.json') },
  nl: { translation: require('./locales/nl.json') },
  de: { translation: require('./locales/de.json') },
  // ... 12 more languages
};

// Usage Pattern
const { t, i18n } = useTranslation();
const currentLang = i18n.language as 'nl' | 'en';

// Database Content Selection
const bio = currentLang === 'nl' ? provider.bio_nl : provider.bio_en;
```

### Database Content Strategy
- **Bilingual Fields**: Most content has `_nl` and `_en` versions
- **Language Codes**: ISO 639-1 standard (nl, en, de, etc.)
- **CEFR Levels**: European language proficiency standard (A1-C2)
- **Flag Images**: Country flags from flagcdn.com for visual language indication

---

## 🛠️ Development Tools & Environment

### Local Development Setup
```bash
# Frontend Development
npm run dev          # Starts Vite dev server on :5174
npm run build        # Production build
npm run preview      # Preview production build

# Backend Development  
XAMPP Control Panel  # Start Apache + MySQL services
phpMyAdmin          # Database management interface
```

### Debugging Tools
- **React DevTools**: Component inspection and state debugging
- **Network Tab**: API request/response analysis
- **Console Logging**: Strategic logging for data flow tracking
- **PHP Error Logs**: XAMPP logs directory for backend errors

### Code Quality Tools
- **TypeScript**: Compile-time error catching
- **ESLint**: Code style and error detection
- **Prettier**: Automatic code formatting
- **PHP_CodeSniffer**: PHP code style checking (when needed)

---

## 📦 Deployment Considerations

### Build Process
```json
// Vite Production Build Configuration
{
  "build": {
    "outDir": "dist",
    "rollupOptions": {
      "output": {
        "manualChunks": {
          "vendor": ["react", "react-dom"],
          "maps": ["react-leaflet", "leaflet"]
        }
      }
    }
  }
}
```

### Environment Variables
```typescript
// Frontend Environment Configuration
const config = {
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  environment: import.meta.env.NODE_ENV || 'development',
  mapTileUrl: import.meta.env.VITE_MAP_TILES || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};
```

### Production Checklist
- [ ] **Environment Variables**: Set production API URLs
- [ ] **Database Migration**: Run migration scripts on production DB
- [ ] **SSL Certificates**: HTTPS configuration
- [ ] **CORS Configuration**: Update allowed origins for production domain
- [ ] **Error Reporting**: Configure error logging and monitoring
- [ ] **Performance**: Enable gzip compression, set cache headers
- [ ] **Security**: Remove debug flags, secure API keys

---

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

#### Frontend Not Loading
```bash
# Check if Vite dev server is running
npm run dev

# Verify port isn't in use
netstat -an | grep 5174

# Clear npm cache if needed
npm cache clean --force
```

#### API Connection Issues
```bash
# Verify XAMPP services running
# Check Apache error logs: C:\xampp\apache\logs\error.log
# Verify PHP version: php --version
# Test API endpoints directly: http://localhost/lingora/backend/public/api/search
```

#### Database Connection Problems
```sql
-- Verify database exists
SHOW DATABASES;

-- Check table structure
USE lingora;
SHOW TABLES;
DESCRIBE providers;

-- Test data exists
SELECT COUNT(*) FROM providers;
```

#### Authentication Failures
```javascript
// Check token in localStorage
console.log(localStorage.getItem('token'));

// Verify token format (JWT has 3 parts separated by dots)
// Check network tab for Authorization header in API calls
```

---

## 📈 Monitoring & Analytics

### Performance Metrics to Track
- **Page Load Time**: First Contentful Paint, Largest Contentful Paint
- **API Response Time**: Average response time per endpoint
- **Search Success Rate**: Percentage of searches returning results
- **Error Rates**: 4xx/5xx responses, JavaScript errors

### Business Metrics to Track
- **User Engagement**: Search usage, provider page views
- **Conversion Rates**: Search → contact, registration → approval
- **Provider Activity**: Profile completion rates, service additions
- **System Health**: Uptime, database performance

### Error Tracking Strategy
- **Frontend Errors**: Console errors, unhandled promise rejections
- **Backend Errors**: PHP errors, database connection failures
- **User Experience**: Failed form submissions, broken workflows

---

## 🗂️ Code Migration Notes

### From Mock to Real API
- ✅ **Authentication**: Switched from mock to real JWT tokens
- ✅ **Search Data**: Using real database instead of JSON files
- ✅ **Contact Forms**: Real email integration instead of console logs
- 🚧 **File Uploads**: Still needs implementation for gallery management

### Legacy Code Removal
When transitioning from development to production:
1. Remove all `PLACEHOLDER` comments and mock data
2. Replace hardcoded URLs with environment variables  
3. Remove development-only console.log statements
4. Update API endpoints from localhost to production URLs

---

**🔄 Update this file when making architectural changes or discovering important technical insights!**