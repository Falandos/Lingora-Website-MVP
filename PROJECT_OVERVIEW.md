# Lingora - Project Overview
*Complete project reference and status tracker*
*Last Updated: 2025-08-26 (COMPREHENSIVE MOCK DATA COMPLETE)*

## 🎯 Mission & Value Proposition
"Find professionals who speak YOUR language." Launch market: Netherlands.

Connect residents with service providers who speak their native language, focusing on healthcare, legal, financial, and educational services.

---

## 📋 MVP Scope & Requirements

### User Roles
- **Resident/Seeker**: Search, filter, view provider pages, send contact messages. No account required.
- **Provider/Professional**: Register/login, create/edit profile, add service listings, add staff members, optional opening hours; visible only after admin approval (KVK & BTW).
- **Admin**: Approve/reject providers, edit listings, manage categories/languages/pages, view contact logs.

### Core Features (In MVP)
- **Discovery**: List + Map view (OSM) results with filters (Language, Category, City + Radius, Mode)
- **Provider Pages**: Business info, services, staff cards, opening hours, gallery (max 6 images)
- **Contact System**: Form → email relay to provider; Admin BCC; Auto-reply to resident
- **Verification**: Manual KVK & BTW verification by Admin before publish
- **Trials**: 3 months free per provider, then €9.99/mo or €99.99/yr

### Out of Scope (Post-MVP)
- Reviews & ratings
- Booking/calendar integration
- Payment processing beyond freeze/unfreeze
- SMS/WhatsApp integration

---

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: React 19.1 + TypeScript + Vite 7.1
- **Styling**: Tailwind CSS with custom design tokens
- **Routing**: React Router v6
- **State**: Context API for auth, React Query for data
- **Maps**: React Leaflet + OpenStreetMap
- **i18n**: react-i18next (15 languages supported)

### Backend Stack
- **Language**: PHP 8.2 
- **Database**: MySQL 8.0
- **Authentication**: JWT tokens
- **API**: RESTful endpoints with PDO prepared statements
- **Server**: Apache via XAMPP (development)

### Development Environment
- **Frontend**: http://localhost:5174 (Vite dev server)
- **Backend**: http://localhost/lingora/backend/public
- **Database**: MySQL via XAMPP
- **API Proxy**: Vite proxy `/api/*` → backend

---

## 📊 Current Status

### Overall Progress: ~87% MVP Complete ⚠️ (Admin Issues Blocking)

#### ✅ **Completed Systems (100%)**
- **Search & Discovery**: Full search with filters, map integration, distance calculation, language flags  
- **Authentication**: JWT-based auth for providers/admin
- **Provider Pages**: Complete public profiles with services, staff, contact info
- **Contact System**: Working contact forms with email relay and admin monitoring
- **Provider Dashboard**: Profile management, service management forms (WORKING PERFECTLY)
- **Database**: Complete schema with realistic test data (10 providers, 15 staff, full language sync)
- **Language Sync Fix**: Provider languages correctly sync with staff languages, search filters working with AND logic

#### 🚨 **CRITICAL ISSUES (Aug 26 Session Findings)**
- **Admin Provider Count Mismatch**: Dashboard shows 5, Admin Panel shows 0, Database has 10 providers
- **Vite Proxy Authorization**: Headers not forwarding to backend, breaking admin API authentication
- **Dual Dashboard Confusion**: Admin has both "Dashboard" and "Admin Panel" menus with different data
- **Admin API Authentication Failure**: `$_SERVER['HTTP_AUTHORIZATION']` not set due to proxy issue

#### 🚧 **Partially Working** 
- **Admin Dashboard Interface**: Loads and renders but shows inconsistent data (5 vs 0 vs 10 providers)
- **Staff-Service Association**: Database design ready, UI needed
- **Services Management**: Basic CRUD exists, needs form integration

#### 📋 **Ready for Next Session**
- **UI Translations**: 13 languages need content (structure complete)
- **Unified Admin Dashboard**: Architecture planned, ready for implementation

---

## 🎯 Critical Path to MVP

### ✅ **ADMIN DASHBOARD: COMPLETE (Aug 26 Session)**
1. ✅ **Vite Proxy Fixed** - Authorization headers now forward correctly using `getallheaders()`
2. ✅ **Provider Count Fixed** - All 20 providers showing correctly in unified dashboard  
3. ✅ **Unified Admin Interface** - Single dashboard with role-based functionality
4. ✅ **Database Consistency** - All providers accessible via admin APIs with proper data parsing

### Phase 1: Complete Core Functionality  
1. **Staff-Service Association** - Connect staff members to specific services
2. **Admin Provider Management** - Complete approval/rejection workflow
3. **Services Management Integration** - Connect CRUD operations to dashboard forms

### Phase 2: Business Logic (Next)
1. **Trial/Subscription UI** - Account status management
2. **Legal Compliance** - GDPR, Terms, Privacy pages
3. **Email Verification** - Complete registration flow

### Phase 3: Launch Preparation
1. **Performance Optimization** - Bundle size, caching, SEO  
2. **Security Hardening** - CAPTCHA, rate limiting, input sanitization
3. **Production Deployment** - Hosting, SSL, monitoring

---

## 🗃️ Database Summary

### ✅ **COMPREHENSIVE DATA (Aug 26 Session - COMPLETE)**
- **Providers**: 20 verified businesses across ALL Netherlands cities (Amsterdam to Groningen to Maastricht)  
- **Staff**: 45 team members with realistic diverse cultural backgrounds
- **Services**: 48 specialized services across healthcare, legal, education, professional sectors
- **Categories**: 11 service categories with proper assignments
- **Languages**: 15 supported languages with 153 staff-language associations
- **Provider Languages**: 98 auto-generated language capabilities from staff expertise
- **Geographic Coverage**: Complete Netherlands coverage - perfect for extensive testing
- **Language Distribution**: Dutch/English (90% coverage), Arabic (60%), German (65%), French (50%)

### Key Relationships
- Users → Providers (1:1)
- Providers → Staff (1:many)
- Providers → Services (1:many) 
- Staff → Languages (many:many with CEFR levels)
- **MISSING**: Services ↔ Staff association (needs design)

---

## 🚨 Known Issues & Limitations

### 🔥 **CRITICAL (Aug 26 Session - Admin Functionality Blocked)**
- **Admin Provider Count Mismatch**: Dashboard shows 5 providers, Admin Panel shows 0, Database has 10 total
- **Vite Proxy Authorization Headers**: Not forwarding from frontend to backend, breaking admin authentication
- **Dual Dashboard Interface**: Admin users confused by having both "Dashboard" and "Admin Panel" with different data
- **Admin API Authentication**: Backend `$_SERVER['HTTP_AUTHORIZATION']` not set, admin detection fails

### High Priority
- **Staff-Service Association**: Staff members not connected to services
- **Admin Unified Interface**: Need single comprehensive admin dashboard
- **Provider Approval Workflow**: Complete approval/rejection functionality

### Medium Priority  
- **Mobile Optimization**: Some components need mobile testing
- **Performance**: Bundle size optimization needed
- **Accessibility**: WCAG AA compliance not implemented

### Low Priority
- **Language Switching**: Minor UI issues in some components
- **Error Messages**: Could be more specific/helpful

---

## 🌐 Internationalization Status

### UI Languages (Complete Structure)
Dutch (nl), English (en), German (de), Arabic (ar), Amazigh/Berber (zgh), Ukrainian (uk), Polish (pl), Chinese Mandarin (zh), Chinese Cantonese (yue), Spanish (es), Hindi (hi), Turkish (tr), French (fr), Tigrinya (ti), Somali (so)

### Implementation Status
- **Fully Translated**: English, Dutch
- **Structure Ready**: All 15 languages configured in i18next
- **Needs Translation**: 13 languages need content translation

---

## 📞 Quick Start Guide

### For New Developers
1. Read `DEVELOPMENT_GUIDE.md` for setup instructions
2. Check `FEATURE_PROGRESS.md` for current sprint status  
3. Review `BUG_MANAGEMENT.md` for known issues
4. Update documentation after each feature completion

### For Testing
- **Admin Login**: admin@lingora.nl / password123
- **Provider Login**: dr.hassan@medcentrum.nl / password123  
- **Frontend**: http://localhost:5174
- **Backend**: XAMPP Apache + MySQL

### For Handovers
1. Update relevant consolidated documentation files
2. Mark completed features in `FEATURE_PROGRESS.md`
3. Add any new issues to `BUG_MANAGEMENT.md`
4. Update this overview with current status

---

**🔄 Remember: Update this file after major feature completions or architectural changes!**