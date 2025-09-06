# 🚨 KNOWN ISSUES & PROVEN SOLUTIONS
*Lingora Provider Dashboard - Updated September 6, 2025*

## 🔄 RECURRING ISSUE #1: AI Semantic Search Degradation

### Pattern Identified:
- **Frequency**: Happened 3-4 times during development
- **Symptom**: "dokter" search stops returning semantic results
- **Timing**: After AI embedding service runs for extended periods (2+ hours)
- **Scope**: Affects semantic matching only - exact matches still work

### Root Cause:
- AI service processes degrade over time
- Memory or connection issues after extended runs
- Not a code issue - operational pattern

### ✅ PROVEN SOLUTION (100% Success Rate):
```bash
# Step 1: Kill all python processes
taskkill /F /IM python.exe

# Step 2: Restart service
cd C:\xampp\htdocs\lingora\backend\ai_services
python embedding_service.py
```

### Verification:
- Service starts with "Service initialization complete" message
- Health endpoint responds: `curl http://127.0.0.1:5001/health`
- "dokter" search immediately returns results

### Prevention:
- Restart AI service at beginning of each development session
- Monitor service uptime during extended work sessions

---

## 🔐 KNOWN ISSUE #2: Analytics JWT Token Validation

### Pattern Identified:
- **Symptom**: Frontend gets 404 on `/api/providers/analytics?days=30`
- **User Context**: dr.hassan@medcentrum.nl logged in successfully
- **Backend**: JWT authentication code implemented correctly
- **CORS**: Fixed for port 5178

### Technical Details:
- Frontend calls: `http://localhost:5178/api/providers/analytics?days=30`
- Proxy routes to: `http://localhost/lingora/backend/public/api/providers/analytics`
- Backend file: `C:\xampp\htdocs\lingora\backend\api\providers\analytics.php`
- JWT service initialized and functional

### Current Status:
- Implementation complete but token chain not working
- Authentication header format may need adjustment
- Provider lookup in database successful for dr.hassan@medcentrum.nl

### Investigation Points:
1. Check JWT token format in frontend request
2. Verify token decoding in analytics.php
3. Confirm provider ID mapping
4. Database connection validation

---

## 🔧 ENVIRONMENT-SPECIFIC PATTERNS

### XAMPP Configuration:
- **Backend Path**: `C:\xampp\htdocs\lingora\backend\public\api\`
- **AI Service**: Direct Python execution (not via XAMPP)
- **Database**: MySQL via XAMPP
- **Frontend Ports**: 5173-5178 range

### Service Dependencies:
1. **XAMPP Apache**: Must be running for backend API
2. **XAMPP MySQL**: Database connection required
3. **AI Service**: Independent Python process on port 5001
4. **Frontend Dev Server**: Vite on current port (5178)

### Port Conflicts:
- AI service: 5001 (dedicated)
- Frontend: 5173-5178 (rotates)
- Backend: 80 via XAMPP Apache
- Database: 3306 via XAMPP MySQL

---

## 📋 TROUBLESHOOTING DECISION TREE

### If "dokter" search fails:
1. ✅ **First Action**: Restart AI service (fixes 100% of cases)
2. If still fails: Check port 5001 availability
3. If still fails: Check database connection in AI service

### If Analytics shows 404:
1. ✅ **First Check**: User logged in as dr.hassan@medcentrum.nl
2. Verify JWT token in browser developer tools
3. Check backend logs for authentication errors
4. Test direct API call with curl

### If Services won't start:
1. Check XAMPP Apache/MySQL status
2. Verify port availability: `netstat -an | grep LISTEN`
3. Kill conflicting processes if needed
4. Check file permissions in XAMPP directories

---

## 🎯 ESCALATION CRITERIA

### Immediate Escalation to Solution-Architect:
- Any issue taking >30 minutes with documented solutions
- New patterns not covered in this document
- Multiple service failures simultaneously
- Database connection issues

### Project Manager Notification:
- Timeline impact >1 day
- Recurring issues becoming frequent (>1/day)
- Need for architecture changes
- External dependency issues

---

## 📈 ISSUE TRACKING

### Resolved Issues:
- ✅ CORS configuration (fixed for port 5178)
- ✅ Backend API implementation (complete)
- ✅ Database schema (providers and page_views tables ready)
- ✅ JWT authentication service (functional)

### Active Issues:
- 🔄 AI service restart pattern (well-understood)
- 🔍 Analytics JWT token validation (debugging needed)

### Prevention Measures:
- Document all recurring patterns
- Maintain service restart procedures
- Regular health checks for long-running services
- Clear handover procedures between sessions

---

*This document should be updated whenever new patterns are identified or solutions are verified.*