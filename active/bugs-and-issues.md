# Bugs & Issues Tracking - Lingora
*Active bug tracking, known issues, and enhancement opportunities*
*Created: 2025-08-30 | Last Updated: 2025-08-30*

## 🚨 CRITICAL ISSUES DISCOVERED - ALPHA 0.1 Refinement Phase

**Overall System Health**: ⚠️ **URGENT ATTENTION NEEDED** - Critical search functionality broken  
**User Experience**: Search not working for key terms - immediate fix required  
**Bug Success Rate**: New critical issues discovered requiring immediate resolution  
**Current Focus**: Fix search functionality before any other work

---

## 🧠 AI Search Enhancement Opportunities

**Status**: Core AI semantic search working perfectly! Minor fine-tuning opportunities identified.

### 🔬 **Active Enhancement Research**

| Enhancement | Component | Description | Status | Priority |
|------------|-----------|-------------|--------|----------|
| Dental Search Optimization | AI Semantic Model | "kaakchirurg" (oral surgeon) should better match "tandartspraktijk" (dental practice) | 🔍 **RESEARCH** | LOW |

**Technical Details**: 
- User reported that searching "kaakchirurg" doesn't show dental practices as expected
- This is a domain-specific semantic relationship that may need specialized healthcare terminology training
- Current multilingual model works excellently for general concepts
- **Not a bug**: System is working correctly with current model limitations
- **Enhancement**: Could be improved with healthcare-specific fine-tuning or custom synonym mapping

**Potential Solutions:**
1. **Custom Healthcare Synonyms**: Add manual mapping for medical specialties 
2. **Domain-Specific Fine-tuning**: Train model on Dutch healthcare terminology
3. **Hybrid Approach**: Combine semantic search with medical specialty keyword matching
4. **Provider Category Weighting**: Boost healthcare categories for medical queries

**Impact**: Low priority - current system still significantly better than traditional keyword search

---

## 🚨 CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION

### **Phase 1 Critical Fixes (HIGH PRIORITY) - Started August 30, 2025**

| Issue | Component | Status | Discovered | Reporter |
|-------|-----------|--------|------------|----------|
| **Search returns no results for "dokter"** | AI Service/Location Fallback | 🔧 **FIXING NOW** | Aug 30, 2025 | User |
| **AI semantic search service not running** | Port 5001 Service | 🔧 **FIXING NOW** | Aug 30, 2025 | User |
| **Location fallback missing** | Search API Logic | 📋 **PLANNED** | Aug 30, 2025 | User |
| **City filter incomplete** | Location Data | 📋 **PLANNED** | Aug 30, 2025 | User |
| **MySQL stability concerns** | Database Infrastructure | 📋 **PLANNED** | Aug 30, 2025 | User |

#### **Bug: Search Returns No Results for "dokter"**
**Component**: AI Semantic Search Service + Location Fallback Logic  
**Priority**: CRITICAL  
**Discovered**: August 30, 2025  
**Reporter**: User testing

**Steps to Reproduce**:
1. Go to search page
2. Enter "dokter" in search field
3. Submit search
4. No results returned

**Expected Behavior**: Should return medical providers/doctors

**Actual Behavior**: No search results displayed

**Root Cause Analysis**:
- AI semantic search service likely not running on port 5001
- Location fallback not implemented when no city specified
- SQL keyword search may not be properly configured for medical terms

**Impact**: Blocks core functionality - users cannot find medical providers

**Status**: 🔧 **FIXING NOW** - Priority 1 issue

---

#### **Bug: AI Semantic Search Service Not Running**
**Component**: Flask AI Service (Port 5001)  
**Priority**: CRITICAL  
**Discovered**: August 30, 2025  
**Reporter**: System analysis

**Steps to Reproduce**:
1. Check if service is running on localhost:5001
2. Attempt to access AI search endpoint
3. Service not responding

**Expected Behavior**: AI service should be running and responding to requests

**Actual Behavior**: Service not running, causing semantic search failures

**Impact**: No AI-powered semantic search functionality

**Status**: 🔧 **FIXING NOW** - Fix 1.1 in progress

---

#### **Bug: Location Fallback Missing**
**Component**: Search API Logic  
**Priority**: HIGH  
**Discovered**: August 30, 2025  
**Reporter**: User workflow analysis

**Description**: When user doesn't specify a city, no default location fallback is implemented

**Expected Behavior**: Should provide nationwide results or default to major city

**Actual Behavior**: No results when city field is empty

**Impact**: Users must know to specify location for any search results

**Status**: 📋 **PLANNED** - Fix 1.2

---

#### **Bug: City Filter Incomplete**
**Component**: Location Data/Filter Logic  
**Priority**: HIGH  
**Discovered**: August 30, 2025  
**Reporter**: User testing

**Description**: Missing many Dutch cities like Zaandam in city filter options

**Expected Behavior**: Comprehensive list of Dutch cities for accurate filtering

**Actual Behavior**: Limited city options, missing major Dutch cities

**Impact**: Users in certain cities cannot filter results properly

**Status**: 📋 **PLANNED** - Fix 1.4

---

#### **Issue: MySQL Stability Concerns**
**Component**: Database Infrastructure  
**Priority**: HIGH  
**Discovered**: August 30, 2025  
**Reporter**: System monitoring

**Description**: MySQL database crashed recently, indicating stability issues

**Expected Behavior**: Stable database service with no crashes

**Actual Behavior**: Database crashes affecting system reliability

**Impact**: System downtime and data integrity concerns

**Status**: 📋 **PLANNED** - Investigation needed

### **Deferred Issues (Post-Critical Fix)**

*These issues are deferred until critical search functionality is restored*

| Issue | Component | Description | Status | Priority |
|-------|-----------|-------------|--------|----------|
| Staff-Service Association Missing | Service/Staff Relationship | Staff members not connected to services | 🔄 **DEFERRED** | HIGH |
| Mobile Responsive Testing | DataTable Component | Table layout needs testing | 🔄 **DEFERRED** | MEDIUM |
| Loading States | Dashboard Pages | Missing loading indicators | 🔄 **DEFERRED** | MEDIUM |
| Error Messages | API Error Handling | Generic error messages | 🔄 **DEFERRED** | MEDIUM |

### **Future Enhancements**

| Enhancement | Component | Description | Status | Priority |
|-------------|-----------|-------------|--------|----------|
| Image Upload Interface | Gallery Management | Gallery component exists but needs file upload UI | 📋 **PLANNED** | LOW |
| Accessibility Compliance | All Components | WCAG AA compliance not yet implemented | 📋 **PLANNED** | LOW |

---

## ✅ Recent Success Stories (August 2025)

### **Previous System Restorations (Now Broken Again)**

**🎠 CAROUSEL SYSTEM (Aug 28, 2025):**
- ✅ **Dynamic Data Restored**: Created missing `/api/providers/recent` endpoint
- ✅ **Homepage Carousel Working**: Real-time provider data with auto-rotation
- ✅ **Complete Data Structure**: Languages, KVK verification, primary categories
- ✅ **Performance Optimized**: Efficient SQL queries for provider + language data

**🔐 AUTHENTICATION SYSTEM (Aug 28, 2025):**
- ✅ **Login Functionality Fixed**: Both admin and provider accounts working
- ✅ **API Response Format**: AuthService updated to handle backend `{token, user}` format
- ✅ **Account Access**: admin@lingora.nl and dr.hassan@medcentrum.nl / password123
- ✅ **Error Handling**: Improved to check data.error || data.message

**🚨 SEARCH FUNCTIONALITY (Aug 28, 2025) - NOW BROKEN AGAIN:**
- ❌ **Search Results Broken**: "dokter" search returns no results
- ❌ **AI Service Down**: Semantic search not functioning
- ❌ **Location Issues**: No fallback when city not specified
- ⚠️ **Status**: Previously working, now requires immediate attention
- 🔧 **Action Required**: Complete search system restoration needed

### **Search System Perfected**

**Language Filter Logic Fixed:**
- ✅ Changed from OR logic to proper AND logic for multi-language searches
- ✅ Fixed category assignments (Legal Advice Limburg, Taaldiensten Arnhem)
- ✅ Implemented visual flag display instead of CEFR text
- ✅ Comprehensive testing of all filter combinations

**Geographic Search Accuracy:**
- ✅ Fixed radius filtering with proper SQL HAVING clauses
- ✅ Accurate results count matching displayed providers
- ✅ Optimized radius range (5-100km) for Netherlands geography
- ✅ Provider languages populated for all search results

---

## 🔧 Debugging Reference

### **Common Issue Patterns**

1. **Authentication Issues**: 
   - **Pattern**: Password handling, token management
   - **Solution**: Check API response format consistency
   - **Files**: AuthService, backend auth endpoints

2. **Data Flow Problems**: 
   - **Pattern**: API response mapping, state management  
   - **Solution**: Verify `result.data || result` extraction patterns
   - **Files**: All dashboard pages, API integration points

3. **Proxy Configuration**: 
   - **Pattern**: Frontend-backend communication failures
   - **Solution**: Check Vite proxy target paths and header forwarding
   - **Files**: `vite.config.js`, authorization header handling

4. **Database Relationships**: 
   - **Pattern**: Missing foreign keys, complex queries
   - **Solution**: Review JOIN logic and table relationships
   - **Files**: Backend API endpoints, database schema

### **Quick Diagnostic Steps**

**API Issues:**
1. Check network tab in DevTools for actual API calls
2. Verify proxy configuration in `vite.config.js`
3. Test API endpoints directly via curl/Postman
4. Check backend logs for PHP errors

**Authentication Problems:**
1. Verify token storage in localStorage
2. Check Authorization header forwarding
3. Test with known working credentials: admin@lingora.nl / password123
4. Verify backend user detection logic

**Search/Filter Issues:**
1. Check SQL query parameter binding
2. Verify distance calculation accuracy
3. Test filter combinations systematically
4. Check results count vs displayed count consistency

---

## 🧪 Testing Procedures

### **Critical User Flow Testing**

**After Any Changes, Test:**

#### Provider Flow ✅
- [ ] **Login**: Provider can log in successfully
- [ ] **Dashboard**: Dashboard loads with correct statistics
- [ ] **Profile**: Profile form shows current data and saves correctly
- [ ] **Services**: Service management works (create/edit/delete)
- [ ] **Staff**: Staff management works (create/edit/delete)
- [ ] **Public Page**: Provider public page reflects dashboard changes

#### Consumer Flow ✅
- [ ] **Search**: Search works with all filters (language, category, location)
- [ ] **Map**: Map shows correct providers within radius
- [ ] **Provider Page**: Provider detail page loads with all information
- [ ] **Contact**: Contact modal opens and submits successfully
- [ ] **Contact Info**: Contact info modal shows phone/email/address

#### Admin Flow ✅
- [ ] **Login**: Admin can log in successfully
- [ ] **Dashboard**: Admin dashboard shows system statistics
- [ ] **Providers**: Provider list loads with correct data
- [ ] **Messages**: Message monitoring works
- [ ] **Approval**: Provider approval workflow

### **Browser Compatibility Testing**
- [ ] **Chrome**: Latest version (Primary)
- [ ] **Firefox**: Latest version  
- [ ] **Safari**: Latest version (macOS)
- [ ] **Edge**: Latest version
- [ ] **Mobile Chrome**: Android
- [ ] **Mobile Safari**: iOS

---

## 🚨 Emergency Procedures

### **Critical Bug Response Protocol**
1. **Immediate Assessment**: Determine impact and affected users
2. **Hotfix Implementation**: Create minimal fix for critical functionality
3. **Testing**: Verify fix doesn't break other functionality
4. **Documentation**: Update this file and notify PM agent
5. **Follow-up**: Plan comprehensive solution if hotfix is temporary

### **System Recovery**
**If critical systems go down:**
1. Check authentication system first (admin@lingora.nl / password123)
2. Verify database connection and XAMPP status
3. Check Vite dev server (http://localhost:5174)
4. Review recent changes in work-in-progress.md
5. Rollback to last known working state if needed

---

## 📊 Bug Statistics & Success Metrics

### **Resolution Success Rate: CRITICAL ISSUES ACTIVE** 🚨

**By Priority Level (Updated Aug 30, 2025):**
- **Critical Issues**: 0% resolved (5 critical issues discovered)
- **High Priority**: Pending critical fixes
- **Medium Priority**: Deferred until critical issues resolved
- **Low Priority**: Deferred until system stable

### **Response Times (August 2025)**
- **Critical**: < 2 hours average
- **High**: < 4 hours average  
- **Medium**: < 1 day average
- **Low**: Planned for future sprints

### **System Health Trends (Updated Aug 30, 2025)**
- ✅ **Authentication System**: Still operational
- ❌ **Search Functionality**: BROKEN - "dokter" returns no results
- ❌ **AI Search Service**: NOT RUNNING - requires immediate restart
- ⚠️ **Database Stability**: MySQL crashes reported
- ❌ **Location Handling**: No fallback implementation

---

## 💡 Bug Prevention Strategies

### **Code Quality Measures**
- **TypeScript Strict Mode**: Catch type errors at compile time
- **API Response Validation**: Always check `data.error || data.message`
- **Error Boundaries**: Graceful handling of component failures
- **Input Validation**: Both client and server-side validation

### **Critical Issue Response Protocol**
- **Test Search First**: Always verify "dokter" search returns results
- **Check AI Service**: Ensure port 5001 service is running before testing
- **Verify Location Logic**: Test searches with and without city specification
- **Database Monitoring**: Monitor MySQL stability and performance
- **Document Everything**: Update work-in-progress.md after each fix attempt

---

## 🔍 Bug Report Template

**When discovering new bugs, use this format:**

```markdown
## Bug: [Short Description]
**Component**: [Where it occurs]
**Priority**: [CRITICAL/HIGH/MEDIUM/LOW] 
**Discovered**: [Date]
**Reporter**: [Who found it]

**Steps to Reproduce**:
1. Step 1
2. Step 2  
3. Step 3

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happens

**Screenshots/Code**: [If applicable]

**Environment**:
- Browser: [Chrome/Firefox/Safari/Edge]
- Device: [Desktop/Mobile/Tablet]
- URL: [Specific page where bug occurs]

**Impact**: [How this affects users]

**Status**: 🔧 To Fix / 📋 Planned / ✅ Fixed
```

---

*🔄 Update this file immediately when discovering, fixing, or changing priority of any bugs! Keep PM agent informed of all changes.*