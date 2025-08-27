# Development Guide
*Setup, architecture, and development workflow*
*Last Updated: 2025-08-26 (COMPREHENSIVE MOCK DATA COMPLETE)*

## 🚀 Quick Setup

### Prerequisites
- XAMPP (Apache + MySQL + PHP 8.2)
- Node.js 18+ 
- Git

### Installation Steps
1. **Clone Repository**
   ```bash
   git clone https://github.com/Falandos/Lingora-Website-MVP.git
   cd Lingora-Website-MVP
   ```

2. **Backend Setup**
   ```bash
   # Start XAMPP services (Apache + MySQL)
   # Copy backend files to C:\xampp\htdocs\lingora\backend\
   # Import database: lingora.sql
   ```

3. **Frontend Setup** 
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost/lingora/backend/public
   - Database: phpMyAdmin at http://localhost/phpmyadmin

---

## 🏗️ Project Architecture

### Folder Structure
```
lingora/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── ui/         # Basic components (Button, Card, etc.)
│   │   │   ├── search/     # Search-related components
│   │   │   ├── provider/   # Provider-specific components
│   │   │   └── dashboard/  # Dashboard components
│   │   ├── pages/          # Route components
│   │   ├── services/       # API service functions
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   └── types/          # TypeScript interfaces
│   └── public/             # Static assets
├── backend/                 # PHP API
│   ├── public/             # Public API entry point
│   ├── api/                # API endpoints
│   ├── models/             # Database models
│   ├── config/             # Configuration files
│   └── migrations/         # Database migrations
└── *.md                    # Documentation files (consolidated)
```

### Component Architecture

#### UI Components (Reusable)
- `Button`, `Card`, `Badge`: Basic UI building blocks
- `DataTable`: Advanced table with sorting, pagination, actions
- `Modal`: Portal-based modals to prevent z-index issues
- `Layout`: Page layouts with navigation

#### Feature Components (Specific)
- `SearchPage`: Main search interface with filters
- `ProviderCard`: Provider display in search results
- `ContactModal`: Contact form modal
- `DashboardLayout`: Role-based dashboard layout

---

## 🔌 API Integration

### Authentication
```typescript
// JWT tokens stored in AuthContext
const { token, user, login, logout } = useAuth();

// API calls include Authorization header
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### Key Endpoints
```
Auth:
POST /api/auth/login          # User login
POST /api/auth/register       # Provider registration

Search:
GET /api/search              # Search providers
GET /api/categories          # Service categories
GET /api/languages           # Supported languages

Providers:
GET /api/providers/{slug}     # Public provider profile
GET /api/providers/my         # Current provider data (authenticated)
PUT /api/providers/my         # Update provider profile

Contact:
POST /api/contact            # Send contact message

Admin:
GET /api/admin/stats         # Admin dashboard stats
GET /api/admin/pending-providers  # Providers awaiting approval
```

### Error Handling
```typescript
// Standard API response format
{
  success: boolean,
  data?: any,
  message?: string,
  error?: string
}
```

---

## 🗃️ Database Design

### Core Tables (Complete Data)
```sql
users: 5 records - Admin and provider authentication
providers: 20 records - Complete Netherlands coverage (Amsterdam to Groningen to Maastricht)  
staff: 45 records - 3 diverse team members per provider
services: 48 records - Specialized offerings across all categories
staff_languages: 153 records - Multilingual coverage (15 languages)
provider_languages: 98 records - Auto-generated from staff expertise
categories: 11 records - Healthcare, Legal, Education, Professional
languages: 15 records - Dutch, English, Arabic, German, French, Spanish, etc.
messages: Contact form history with admin monitoring
```

### Key Relationships
- Users (1) ↔ Providers (1): One user per provider account
- Providers (1) ↔ Staff (many): Multiple team members per provider
- Providers (1) ↔ Services (many): Multiple services per provider
- Staff (many) ↔ Languages (many): Staff speak multiple languages

### Missing Relationships (To Implement)
- **Services ↔ Staff**: Need junction table to connect staff to specific services

---

## 🛠️ Development Workflow

### 🔄 Git Workflow & Version Control

#### Repository Information
- **GitHub Repository**: https://github.com/Falandos/Lingora-Website-MVP.git
- **Main Branch**: `main` (not master)
- **Authentication**: Personal Access Token (PAT)

#### Daily Git Workflow
```bash
# Before starting work
git status                    # Check current state
git pull origin main          # Get latest changes

# During development
git add .                     # Stage changes
git commit -m "✨ Descriptive commit message"  # Commit with good message
git push origin main          # Push to GitHub

# End of session
git status                    # Verify clean working tree
```

#### Git Authentication Setup
**If you get 403/Permission Denied errors:**
1. **Create new Personal Access Token**: https://github.com/settings/tokens
2. **Update remote URL**:
   ```bash
   git remote set-url origin https://Falandos:YOUR_NEW_TOKEN@github.com/Falandos/Lingora-Website-MVP.git
   ```
3. **Test connection**: `git push origin main`

**📋 For complete Git procedures, see:** `GIT_WORKFLOW.md`

#### Automatic Commit Strategy
**When to Commit:**
1. ✅ After completing any task marked in TodoWrite
2. ✅ After fixing any critical bug or error
3. ✅ Before switching between major features
4. ✅ At the end of each development session
5. ✅ Never commit broken/non-functional code

#### Commit Message Standards
```bash
# Feature additions
feat: add staff-service association system

# Bug fixes  
fix: resolve language modal crash in staff management

# Documentation updates
docs: update deployment guide with Docker steps

# Code improvements
refactor: optimize search query performance

# UI/styling changes
style: improve responsive design for mobile devices
```

#### Repository Details
- **GitHub**: https://github.com/Falandos/Lingora-Website-MVP.git
- **Authentication**: HTTPS with Personal Access Token
- **Auto-sync**: All commits automatically pushed to GitHub
- **Credential Storage**: Git credential helper (secure)

#### Git Commands Reference
```bash
# Check repository status
git status

# View commit history  
git log --oneline -10

# Stage specific files
git add frontend/src/pages/dashboard/StaffPage.tsx

# Commit with descriptive message
git commit -m "fix: resolve staff language modal crash"

# Push to GitHub (automatic)
git push origin master

# Pull latest changes (if working with team)
git pull origin master
```

### Feature Development Process
1. **Plan**: Update `FEATURE_PROGRESS.md` with new feature
2. **Design**: Consider UI/UX and API requirements
3. **Implement**: Build frontend + backend components
4. **Test**: Manual testing + verify all user flows
5. **Document**: Update relevant .md files
6. **Commit**: Automatic Git commit with descriptive message
7. **Review**: Check for code quality and security

### Code Standards
- **TypeScript**: Strict mode, proper typing
- **React**: Functional components with hooks
- **PHP**: PDO prepared statements, proper error handling
- **CSS**: Tailwind utility classes, responsive design
- **Security**: Input validation, SQL injection prevention

### Testing Approach
- **Manual Testing**: All user flows (resident, provider, admin)
- **Integration Testing**: Frontend ↔ Backend API calls
- **Cross-browser**: Chrome, Firefox, Safari, Edge
- **Mobile**: Responsive design on various screen sizes

---

## 🔒 Security Guidelines

### Authentication
- JWT tokens with expiration
- Password hashing with PHP `password_hash()`
- Role-based access control (provider/admin)
- Route protection in frontend

### API Security  
- Input validation and sanitization
- SQL injection prevention (PDO prepared statements)
- Rate limiting on contact forms (5 per hour per IP)
- CORS configuration for multiple development ports

### Data Protection
- Sensitive contact info hidden until clicked (anti-scraping)
- Admin BCC on all contact messages
- Proper error messages (don't leak system info)

---

## 🐛 Debugging Guide

### Common Issues

#### Frontend Not Connecting to Backend
```bash
# Check Vite proxy configuration in vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost/lingora/backend/public'
  }
}
```

#### Authentication Failures
```bash
# Check CORS headers in backend config
# Verify JWT token format in network tab
# Check user role in AuthContext
```

#### Database Connection Issues
```bash
# Verify XAMPP MySQL service is running
# Check database credentials in backend/config/database.php
# Import lingora.sql schema if missing tables
```

#### Modal Flickering Issues
```typescript
// Use React Portal for modals to prevent parent interference
import { createPortal } from 'react-dom';
return createPortal(modalContent, document.body);
```

### Development Tools
- **Browser DevTools**: Network tab for API calls, Console for errors
- **React DevTools**: Component state and props debugging  
- **phpMyAdmin**: Database query and data inspection
- **Vite DevTools**: Hot reload and build analysis

---

## 📱 Mobile Development

### Responsive Breakpoints
```css
/* Tailwind CSS breakpoints used */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
```

### Mobile-Specific Components
- Collapsible navigation menu
- Touch-friendly buttons and inputs
- Optimized map interaction
- Modal sizing for small screens

---

## 🚀 Production Deployment

### Build Process
```bash
cd frontend
npm run build  # Creates optimized production build
```

### Environment Configuration
- Update API endpoints from localhost to production URLs
- Configure proper CORS origins
- Set up SSL certificates
- Configure email service (SMTP)

### Performance Optimization
- Bundle splitting and lazy loading
- Image optimization and compression
- CDN integration for static assets
- Database query optimization

---

## 🤝 Handover Guidelines

### Before Ending Session
1. **Commit Changes**: Push all code changes to repository
2. **Update Documentation**: Refresh relevant .md files
3. **Note Issues**: Add any discovered bugs to `BUG_MANAGEMENT.md`
4. **Update Status**: Mark completed features in `FEATURE_PROGRESS.md`

### For Next Developer
1. **Start Here**: Read `PROJECT_OVERVIEW.md` for current status
2. **Check Progress**: Review `FEATURE_PROGRESS.md` for active sprint
3. **Known Issues**: Check `BUG_MANAGEMENT.md` for critical problems
4. **Technical Details**: Reference this guide for setup/architecture

### Session Handover Template
```markdown
## Session Summary (Date)
**Completed**: [List of features/fixes completed]
**In Progress**: [Current task status]  
**Blockers**: [Any issues preventing progress]
**Next Steps**: [Recommended next actions]
**Notes**: [Important decisions or discoveries]
```

---

## 📚 Key Resources

### Documentation Files
- `PROJECT_OVERVIEW.md`: Overall status and requirements
- `FEATURE_PROGRESS.md`: Feature implementation tracking
- `BUG_MANAGEMENT.md`: Issues and fix procedures
- `TECHNICAL_NOTES.md`: Detailed technical analysis

### External Resources
- [React 18 Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [PHP 8.2 Documentation](https://php.net/docs.php)
- [MySQL 8.0 Reference](https://dev.mysql.com/doc/)

---

**🔄 Update this guide when adding new development patterns or changing architecture!**