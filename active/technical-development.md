# Technical Development Reference - Lingora
*Architecture decisions, implementation patterns, and critical technical knowledge*
*Created: 2025-08-30 | Last Updated: 2025-08-30*

## 🎯 ALPHA 0.1 Architecture Overview

**Status**: ✅ **PRODUCTION-READY** - Complete multilingual platform with AI-powered search  
**Achievement**: Professional homepage translation system with react-i18next hot reload  
**Performance**: AI search <200ms response time, all critical systems operational  
**Next Phase**: Quality improvements and additional language support

---

## 🌐 Translation System Architecture (ALPHA 0.1 - COMPLETE)

### **Complete Homepage Translation Implementation**

**Status**: ✅ 100% IMPLEMENTED - Professional multilingual homepage with react-i18next hot reload

### ✅ **Translation System Technical Details**

**3-Row Hero Title System - Flexible Grammar Support:**
```typescript
// Supports any language grammar structure:
<div className="space-y-4">
  {t('home.hero_title_before') && (
    <div className="text-5xl md:text-6xl lg:text-7xl font-bold">
      {t('home.hero_title_before')}
    </div>
  )}
  <div className="text-5xl md:text-6xl lg:text-7xl font-bold">
    <LanguageCarousel />
  </div>
  {t('home.hero_title_after') && (
    <div className="text-5xl md:text-6xl lg:text-7xl font-bold">
      {t('home.hero_title_after')}
    </div>
  )}
</div>
```

**Complete Translation Key Structure:**
```javascript
// English translations (public/locales/en/translation.json)
{
  "home": {
    "hero_title_before": "Find Professionals Who Speak",
    "hero_title_after": "",
    "hero_subtitle": "Connect with service providers across the Netherlands who speak your language and understand your needs."
  },
  "search": {
    "placeholder_prefix": "I'm searching for a:",
    "location_near": "Near:",
    "my_location": "📍 My location",
    "button_search": "Search"
  },
  "carousel": {
    "title": "Recently Joined Professionals",
    "view_all": "View All Providers"
  },
  "discover": {
    "title": "Discover How It Works",
    "subtitle": "Find the right professional in 3 simple steps",
    "examples": {
      "search": "Search for 'dentist who speaks Arabic'",
      "browse": "Browse verified professionals",
      "connect": "Connect directly with providers"
    }
  },
  "cta": {
    "resident_title": "I need a service provider",
    "resident_subtitle": "Find professionals who speak your language",
    "resident_features": [
      "✓ Search in your native language",
      "✓ Verified professional profiles",
      "✓ Direct contact information",
      "✓ Read reviews and ratings"
    ],
    "provider_title": "I'm a service provider",
    "provider_subtitle": "Connect with clients in your language",
    "provider_features": [
      "✓ Showcase your language skills",
      "✓ Reach diverse communities",
      "✓ Professional profile management",
      "✓ Client inquiry management"
    ],
    "trust_badges": {
      "verified": "✓ Verified Professionals",
      "secure": "🔒 Secure & Private", 
      "support": "🇳🇱 Netherlands-wide"
    }
  },
  "stats": {
    "businesses": "Active Businesses",
    "staff": "Professional Staff",
    "languages": "Languages Supported",
    "services": "Service Categories"
  }
}

// Dutch translations (public/locales/nl/translation.json)
{
  "home": {
    "hero_title_before": "Vind professionals die",
    "hero_title_after": "spreken",
    "hero_subtitle": "Verbind met dienstverleners in heel Nederland die jouw taal spreken en jouw behoeften begrijpen."
  }
  // ... (complete Dutch translations)
}
```

### **Component Integration Pattern**

**All homepage components use consistent translation pattern:**
```typescript
import { useTranslation } from 'react-i18next';

const ComponentName = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('section.key')}</h1>
      {/* Multi-line content */}
      {t('section.multiline_key').split('\n').map((line, index) => (
        <div key={index}>{line}</div>
      ))}
    </div>
  );
};
```

### **Development Workflow**

**Hot Reload Translation Development:**
1. Edit translation files: `public/locales/{lang}/translation.json`
2. Changes appear immediately in development without restart
3. Language switcher persists selection across browser sessions
4. Complete development workflow optimized for translation work

---

## 🔍 AI-Powered Semantic Search System

### **Production-Ready Implementation**

**Performance Metrics:**
- ✅ Response Time: <200ms average
- ✅ Accuracy: Excellent for general concepts
- ✅ Multilingual Support: English/Dutch/Arabic/German/Turkish/Ukrainian
- ✅ Semantic Understanding: Context-aware search results

### **Technical Architecture**

**Backend AI Service (Flask):**
```python
# AI search service running on localhost:5001
# Semantic embeddings with multilingual support
# Integration with PHP backend via API calls
```

**Search API Integration:**
```php
// backend/api/search/index.php
// Hybrid approach: semantic + traditional SQL
// Distance calculations with geographic radius filtering
// Language filtering with proper AND logic
```

**Frontend Search Experience:**
```typescript
// Real-time search with debounced queries
// Map integration with radius visualization
// Advanced filtering: language, category, location, distance
// Results optimization: distance-based sorting by default
```

### **Known AI Enhancement Opportunities**

**Healthcare Terminology Optimization:**
- Current: "kaakchirurg" (oral surgeon) doesn't strongly match "tandartspraktijk" (dental practice)
- Impact: Low priority - system still superior to keyword search
- Potential Solutions:
  1. Custom healthcare synonym mapping
  2. Domain-specific model fine-tuning
  3. Hybrid semantic + keyword approach
  4. Category weighting for medical queries

---

## 🛠️ Development Environment & Setup

### **Current Working Environment**

**Frontend Development:**
```bash
# Vite development server with hot reload
http://localhost:5174

# React + TypeScript + Tailwind CSS
# react-i18next for translations
# Real-time component updates during development
```

**Backend Environment:**
```bash
# XAMPP Apache + MySQL stack
http://localhost/lingora/backend/public

# PHP 8.x with REST API architecture
# MySQL database with comprehensive test data
# 20 providers, 45+ staff, full language coverage
```

**AI Search Service:**
```bash
# Flask service for semantic search
http://localhost:5001

# Multilingual embedding model
# Semantic similarity calculations
# API integration with main backend
```

### **Critical Configuration Details**

**Vite Proxy Configuration (vite.config.js):**
```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost/lingora/backend/public',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  // ... other config
});
```

**Critical Learning: Always target `/public` for proper PHP routing**

---

## 💾 Database Architecture & Relationships

### **Core Tables and Relationships**

**Providers System:**
```sql
-- Core provider information
providers (id, business_name, email, phone, website, address, ...)
  ├── services (provider_id, category_id, name, description)
  ├── staff (provider_id, name, title, bio, languages)
  ├── provider_languages (provider_id, language_code, cefr_level)
  └── provider_categories (provider_id, category_id)

-- Geographic data for search
provider_locations (provider_id, lat, lng, city, postal_code)

-- Service associations
service_staff (service_id, staff_id, is_primary) -- PLANNED
```

**Language Support System:**
```sql
-- Language definitions
languages (code, name_en, name_nl, flag_url)

-- Staff language proficiency  
staff_languages (staff_id, language_code, cefr_level)

-- Provider language aggregation
provider_languages (provider_id, language_code, highest_cefr_level)
```

**Authentication & Admin:**
```sql
-- User management
users (id, email, password_hash, role, provider_id)
  ├── admin_notes (provider_id, admin_id, content, category, created_at)
  └── admin_activity_log (admin_id, action, target_type, target_id, created_at)
```

### **Critical Database Lessons**

**Password Management:**
```php
// ALWAYS use proper PHP password hashing
$hashed = password_hash($password, PASSWORD_DEFAULT);
// NEVER update passwords via MySQL command line (corrupts hashes)
```

**Language Data Integrity:**
- Staff languages must be synced with provider languages for search display
- Use aggregation queries to maintain provider_languages from staff_languages
- Highest CEFR level per language per provider for accurate representation

**Geographic Search:**
```sql
-- Proper distance calculation with HAVING clause
SELECT *, (
    6371 * acos(
        cos(radians(?)) * cos(radians(lat)) * 
        cos(radians(lng) - radians(?)) + 
        sin(radians(?)) * sin(radians(lat))
    )
) AS distance
FROM providers p
GROUP BY p.id  
HAVING distance <= ?
ORDER BY distance;
```

---

## 🔐 Authentication & Security Implementation

### **Current Authentication System**

**Working Test Accounts:**
- **Admin**: admin@lingora.nl / password123
- **Provider**: dr.hassan@medcentrum.nl / password123

**Frontend Auth Service Pattern:**
```typescript
// Always handle both possible API response formats
const data = responseData.data || responseData;

// Check for errors in multiple formats
if (data.error || data.message) {
  throw new Error(data.error || data.message);
}

// Verify expected response structure
if (data.token && data.user) {
  // Success - store token and user data
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
```

**Backend Auth Detection:**
```php
// Proper admin detection in API endpoints
$headers = getallheaders();
$token = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? null;

if ($token && validateAdminToken($token)) {
    // Admin context - return full data
} else {
    // Public context - return filtered data
}
```

### **Security Best Practices**

**API Security:**
- All sensitive endpoints require authentication
- Admin endpoints use token-based authentication
- Input validation on both frontend and backend
- SQL injection prevention with prepared statements

**Data Privacy:**
- No sensitive information logged in console
- Secure token storage in localStorage
- Admin activity logging for audit trails
- Proper error messages without sensitive details

---

## 🔧 Common API Patterns & Debugging

### **Standard API Response Handling**

**Consistent Response Pattern:**
```typescript
// Always use this pattern for API responses
try {
  const response = await fetch('/api/endpoint');
  const responseData = await response.json();
  
  // Handle nested data structure
  const data = responseData.data || responseData;
  
  // Check for API errors
  if (data.error || data.message) {
    throw new Error(data.error || data.message);
  }
  
  return data;
} catch (error) {
  console.error('API call failed:', error);
  throw error;
}
```

**Backend Response Format:**
```php
// Consistent JSON response format
header('Content-Type: application/json');

if ($success) {
    echo json_encode([
        'success' => true,
        'data' => $result,
        'message' => 'Operation completed successfully'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Specific error message',
        'message' => 'User-friendly message'
    ]);
}
```

### **Critical Debugging Patterns**

**Proxy Issues (Most Common):**
```bash
# Check Vite proxy configuration
# Verify target path includes /public
# Monitor proxy logs in browser console
# Test API endpoints directly: curl http://localhost/lingora/backend/public/api/endpoint
```

**Authentication Problems:**
```bash
# Check token in localStorage
# Verify Authorization header in Network tab
# Test with known working credentials
# Check backend token validation logic
```

**Database Query Issues:**
```bash
# Enable MySQL query logging
# Check parameter binding in prepared statements
# Verify foreign key relationships
# Test complex queries in phpMyAdmin first
```

---

## ⚡ Performance Optimizations

### **Frontend Performance**

**React Optimizations:**
- Components use proper key props for list rendering
- Lazy loading for dashboard components
- Debounced search queries to prevent API spam
- Efficient state management with Context API

**Asset Optimization:**
- Vite bundle optimization for production
- Image optimization for provider photos
- Font loading optimization
- CSS purging for smaller bundle size

### **Backend Performance**

**Database Optimization:**
```sql
-- Proper indexing for search queries
CREATE INDEX idx_provider_location ON provider_locations(lat, lng);
CREATE INDEX idx_provider_languages ON provider_languages(language_code, provider_id);
CREATE INDEX idx_services_category ON services(category_id, provider_id);
```

**API Response Optimization:**
- Efficient JOIN queries to reduce API calls
- Pagination for large result sets
- Caching for static data (categories, languages)
- Optimized distance calculations

### **AI Search Performance**

**Response Time Optimization:**
- <200ms average response time achieved
- Efficient embedding calculations
- Optimized similarity scoring
- Integration caching between services

---

## 🧪 Testing Strategies & Patterns

### **Manual Testing Workflow**

**Critical Path Testing (After Any Changes):**
1. **Authentication Flow**: Login with admin@lingora.nl and dr.hassan@medcentrum.nl
2. **Search Functionality**: Test with various language/category combinations
3. **Provider Management**: Create/edit services and staff in dashboard
4. **Public Pages**: Verify provider pages show updated information
5. **Contact System**: Test contact forms and modal functionality

**Browser Testing Priority:**
1. **Chrome**: Primary development and testing browser
2. **Firefox**: Secondary compatibility testing
3. **Safari/Mobile**: Responsive design verification

### **API Testing Patterns**

**Using Browser DevTools:**
```javascript
// Test API endpoints directly in console
fetch('/api/providers', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(console.log);
```

**Backend Endpoint Testing:**
```bash
# Direct API testing with curl
curl -X GET "http://localhost/lingora/backend/public/api/providers" \
     -H "Authorization: Bearer TOKEN_HERE" \
     -H "Content-Type: application/json"
```

---

## 🚨 Critical Implementation Gotchas

### **Most Common Pitfalls**

**1. API Response Format Inconsistency**
```typescript
// WRONG - assumes specific structure
const providers = response.providers;

// CORRECT - handles multiple formats  
const data = response.data || response;
const providers = data.providers || [];
```

**2. Proxy Configuration Errors**
```javascript
// WRONG - missing /public path
target: 'http://localhost/lingora/backend'

// CORRECT - includes PHP entry point
target: 'http://localhost/lingora/backend/public'
```

**3. Database Password Corruption**
```bash
# WRONG - corrupts PHP password hashes
mysql> UPDATE users SET password = 'password123';

# CORRECT - use PHP script for password updates
php update_passwords.php
```

**4. Language Filter Logic**
```sql
-- WRONG - OR logic (any language)
WHERE language_code IN (?, ?, ?)

-- CORRECT - AND logic (all languages)  
HAVING COUNT(DISTINCT language_code) = ?
```

### **Environment-Specific Issues**

**Development vs Production:**
- Always test with XAMPP running (Apache + MySQL)
- Verify Vite dev server on localhost:5174
- Check AI service running on localhost:5001
- Ensure proper CORS configuration for production

**Database Connection:**
- Verify MySQL service running in XAMPP
- Check database credentials in PHP config
- Test database connectivity before API calls
- Monitor connection pooling for performance

---

## 📈 Scalability Considerations

### **Translation System Scaling**

**Adding New Languages:**
```json
// 1. Add language definition to languages table
// 2. Create translation file: public/locales/{lang}/translation.json  
// 3. Add language option to switcher component
// 4. Test grammar compatibility with 3-row hero system
```

**Architecture Ready For:**
- 13 additional planned languages
- Right-to-left language support (Arabic, Hebrew)
- Regional variations (European Portuguese vs Brazilian Portuguese)
- Professional translation review workflow

### **Performance Scaling**

**Database Scaling:**
- Proper indexing already implemented for search queries
- Provider data partitioning possible by geographic region
- Language data optimized with efficient foreign keys
- Admin activity logging with automatic archiving

**AI Search Scaling:**
- Model updates without downtime
- Batch processing for large provider sets
- Caching layer for common search queries
- Load balancing for high-traffic scenarios

---

## 🔄 Deployment & Environment Management

### **Current Environment Status**

**Development Stack (Working):**
- **Frontend**: Vite dev server with hot reload (localhost:5174)
- **Backend**: XAMPP Apache + MySQL (localhost/lingora/backend/public)
- **AI Service**: Flask semantic search (localhost:5001)
- **Database**: MySQL with comprehensive test data

**Production Readiness:**
- ✅ **Code Quality**: TypeScript, error handling, validation
- ✅ **Security**: Authentication, input validation, SQL injection prevention
- ✅ **Performance**: <200ms search, optimized queries, efficient frontend
- ✅ **Testing**: All critical paths verified and documented

### **Deployment Notes**

**Environment Variables:**
- Database credentials for production
- AI service API keys and endpoints
- CORS configuration for production domain
- Email service configuration for contact forms

**Asset Building:**
```bash
# Production build process
npm run build
# Generates optimized static assets
# Includes translation files and optimized bundles
```

---

*📝 This document captures critical technical knowledge for Lingora development. Update after major architectural changes or when discovering important implementation patterns.*