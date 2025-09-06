# 🧪 TESTING PLAN - Provider Dashboard Phase 1
*Next Session Execution Plan - September 6, 2025*

## 🎯 OBJECTIVE
Complete final testing of Analytics API and AI Semantic Search to achieve 100% Phase 1 completion.

---

## 👤 TEST USER PROFILE

### Primary Test Account:
- **Email**: dr.hassan@medcentrum.nl
- **Role**: provider
- **Provider ID**: 1
- **Status**: approved
- **Subscription**: active

### Available Test Data:
- **Page Views**: 15 total views
- **Unique Visitors**: 8 unique IPs
- **Language Breakdown**:
  - Dutch: 53% (8 views)
  - English: 20% (3 views) 
  - Arabic: 13% (2 views)
  - Unknown: 14% (2 views)
- **Peak Time**: 10 PM (documented)
- **Sections**: Main profile, services, staff

---

## 🔄 PRE-TESTING SETUP

### 1. Service Initialization (CRITICAL FIRST)
```bash
# Kill any running AI services (REQUIRED)
taskkill /F /IM python.exe

# Start fresh AI embedding service
cd C:\xampp\htdocs\lingora\backend\ai_services
python embedding_service.py

# Wait for "Service initialization complete" message
```

### 2. Environment Verification
```bash
# Verify services are running
curl http://127.0.0.1:5001/health                      # AI service
curl http://localhost/lingora/backend/public/api/      # Backend API
```

### 3. Frontend Access
- **URL**: http://localhost:5178
- **Login**: dr.hassan@medcentrum.nl
- **Expected**: Dashboard loads successfully

---

## 🧪 TEST EXECUTION PLAN

### TEST SUITE A: AI Semantic Search
**Objective**: Verify "dokter" search returns semantic results

#### A1: Baseline Search Test
- [ ] Navigate to homepage search
- [ ] Search term: "arts"
- [ ] **Expected**: Returns providers (baseline functionality)
- [ ] **Result**: ✅ Pass / ❌ Fail

#### A2: Semantic Search Test
- [ ] Search term: "dokter"  
- [ ] **Expected**: Returns healthcare providers semantically
- [ ] **Expected Results Should Include**: Provider(s) with medical services
- [ ] **Result**: ✅ Pass / ❌ Fail

#### A3: Additional Semantic Tests
- [ ] Search term: "tandarts" (dentist)
- [ ] **Expected**: Dental service providers
- [ ] **Result**: ✅ Pass / ❌ Fail

### TEST SUITE B: Analytics Dashboard
**Objective**: Verify analytics widget loads real data

#### B1: Dashboard Access Test
- [ ] Login as dr.hassan@medcentrum.nl
- [ ] Navigate to Dashboard → Overview
- [ ] **Expected**: Dashboard loads without errors
- [ ] **Result**: ✅ Pass / ❌ Fail

#### B2: Analytics Widget Test
- [ ] Locate "Page Analytics" widget on dashboard
- [ ] **Expected**: Shows analytics data (not 404 error)
- [ ] **Expected**: "Last 30 days" label visible
- [ ] **Result**: ✅ Pass / ❌ Fail

#### B3: Data Accuracy Test
- [ ] **Total Views**: Should show 15
- [ ] **Unique Visitors**: Should show 8
- [ ] **Language Breakdown**: Dutch as top language
- [ ] **Peak Time**: Should show time data
- [ ] **Result**: ✅ Pass / ❌ Fail

---

## 🔍 DEBUGGING PROCEDURES

### If AI Search Fails:
1. **Check Service Status**:
   ```bash
   curl http://127.0.0.1:5001/health
   ```
   Should return: `{"status": "healthy", "model": "paraphrase-multilingual-MiniLM-L12-v2"}`

2. **Check Service Logs**:
   - Look for "Service initialization complete" message
   - No ERROR or Exception messages

3. **Restart If Needed** (Known Fix):
   ```bash
   taskkill /F /IM python.exe
   python C:\xampp\htdocs\lingora\backend\ai_services\embedding_service.py
   ```

### If Analytics Fails:
1. **Check Browser Console** (F12):
   - Look for 404 errors on `/api/providers/analytics`
   - Check JWT token in Network tab

2. **Verify Authentication**:
   ```bash
   # Test with sample token
   curl -H "Authorization: Bearer test-token" \
        http://localhost/lingora/backend/public/api/providers/analytics
   ```

3. **Check Backend Logs**:
   - PHP error logs in XAMPP
   - Database connection status

---

## 📊 EXPECTED RESULTS

### Success Criteria:
- **AI Search**: "dokter" returns ≥1 relevant healthcare provider
- **Analytics**: Widget displays without 404, shows 15 page views
- **Performance**: Both features respond in <2 seconds
- **UI/UX**: No console errors, clean presentation

### Failure Patterns to Watch:
- **AI Search**: Returns empty results or only exact matches
- **Analytics**: 404 error or "No analytics data available"
- **Authentication**: JWT token rejection or provider not found errors

---

## 📝 TEST EXECUTION LOG

### Session Date: _________
### Tester: _________

#### AI Search Results:
- [ ] A1: "arts" search → _____ results
- [ ] A2: "dokter" search → _____ results  
- [ ] A3: "tandarts" search → _____ results

#### Analytics Results:
- [ ] B1: Dashboard access → ✅/❌
- [ ] B2: Widget loads → ✅/❌
- [ ] B3: Data shows 15 views → ✅/❌

#### Issues Encountered:
- _________________________________
- _________________________________
- _________________________________

#### Resolution Actions:
- _________________________________
- _________________________________
- _________________________________

### Final Status: ✅ PHASE 1 COMPLETE / ❌ ISSUES REMAINING

---

## 🚀 POST-TESTING ACTIONS

### If All Tests Pass:
1. Update project status to "Phase 1 Complete"
2. Document success in work-in-progress.md
3. Prepare for Phase 2 planning session
4. Update todo list with Phase 2 tasks

### If Tests Fail:
1. Document specific failures in KNOWN_ISSUES.md
2. Escalate to solution-architect immediately
3. Update work-in-progress.md with blocking issues
4. Schedule focused debugging session

---

## 🎯 NEXT SESSION PROMPT (If Issues Found)

```
URGENT: Phase 1 testing revealed issues. Completed testing with dr.hassan@medcentrum.nl on port 5178.

Results:
- AI Search: [PASS/FAIL] - dokter search [working/not working]  
- Analytics: [PASS/FAIL] - dashboard widget [loaded/404 error]

Need immediate solution-architect for debugging. Check active/TESTING_PLAN.md for complete test results.

Priority: Complete Phase 1 before moving to Phase 2.
```

---

*This testing plan should be executed systematically to ensure reliable Phase 1 completion.*