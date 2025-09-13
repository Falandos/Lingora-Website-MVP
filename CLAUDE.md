# CLAUDE.md - Lingora Development System Guide
*Master instruction file for AI-assisted development*
*Last Updated: September 12, 2025*

## 🚀 Clean Startup Procedure - MANDATORY FOR EVERY SESSION

### Single Command Startup
```bash
# Execute from Lingora root directory
.\scripts\start-all-services.bat
```

This script will:
1. **Kill all existing services** (prevents conflicts like double AI services)
2. **Start all 3 services** in proper sequence:
   - Backend (XAMPP Apache)
   - AI embedding service (Python Flask on port 5001)
   - Frontend (Vite dev server on port 5173)
3. **Health check all services** with comprehensive testing
4. **Test AI service** with both "arts" and "dokter" searches
5. **Report ready status**: "Site is ready to test on port 5173"

### Critical Health Check
The AI service test is crucial:
- **"arts" search** must return results
- **"dokter" search** must return results  
- **If "dokter" fails**: AI service is corrupted → automatic restart

---

## 🏗️ System Architecture

### Core Services (3 Required)
1. **Backend API**: PHP server via XAMPP Apache
   - Location: `C:\xampp\htdocs\lingora\backend`
   - Access: `http://localhost/lingora/backend/public`
   - Provides: REST API, database access, search endpoints

2. **AI Embedding Service**: Python Flask server
   - Location: `C:\Cursor\Lingora\backend\ai_services`
   - Access: `http://127.0.0.1:5001`
   - Provides: Semantic search, embedding generation
   - Model: paraphrase-multilingual-MiniLM-L12-v2

3. **Frontend**: React Vite development server
   - Location: `C:\Cursor\Lingora\frontend`
   - Access: `http://localhost:5173`
   - Provides: User interface, proxies to backend API

### Service Dependencies
```
Frontend (5173) → Backend API → AI Service (5001)
                      ↓
                 MySQL Database
```

---

## 🤖 Agent-Based Development System

### PM-First Workflow
**The PM agent is the central brain. It tracks EVERYTHING and controls git commits.**
**No code changes happen without PM awareness. No commits happen without PM approval.**

### Available Agents

#### 1. **project-manager (PM)** - Central Coordinator
- **Role**: Tracks all work, maintains documentation, controls git commits
- **Usage**: "PM agent, start clean development session"
- **Startup**: MUST execute clean startup procedure every session
- **Maintains**: project-status.md, work-in-progress.md, documentation-index.md

#### 2. **solution-architect** - Technical Expert  
- **Role**: Technical solution designs, architecture decisions, troubleshooting
- **Usage**: "Solution architect, I need to implement [feature]. Please clarify approach"
- **Provides**: Solution IDs (SD-001, SD-002), technical documentation

#### 3. **git-repository-manager** - Git Operations  
- **Role**: Handles all git operations - commits, pushes, repository management
- **Usage**: PM agent delegates to git-repository-manager when commit criteria met
- **Expertise**: Proven git workflows, commit message generation, repository operations

---

## 🔄 MANDATORY Development Workflow

### Every Session MUST Follow This Flow:

**START SESSION**
```
"PM agent, start clean development session"
```
→ PM executes startup procedure, health checks all services
→ Reports: "Site is ready to test on port 5173" + project status

**BEFORE IMPLEMENTATION**
1. Get technical guidance from solution architect if needed
2. "PM agent, I'm about to implement [feature]. This will modify [files]"
→ PM logs planned work in work-in-progress.md

**MAKE CHANGES**
After EACH change: "PM agent, I [changed X in location Y]"
→ PM logs in work-in-progress.md

**TEST MANUALLY**
"PM agent, test results: [pass/fail] for [component] - [details]"
→ PM updates test status

**REQUEST COMMIT** (only if ready)
"PM agent, [feature] tested and working, ready for commit"
→ PM verifies criteria → delegates to git-repository-manager

**END SESSION**
"PM agent, ending session, update status"
→ PM saves state for next session

---

## ⚠️ CRITICAL RULES

### ALWAYS:
- ✅ Start EVERY session with PM startup procedure
- ✅ Test AI service with both "arts" and "dokter" searches
- ✅ Report EVERY change to PM immediately  
- ✅ Test manually before declaring "done"
- ✅ Let PM decide when to commit

### NEVER:
- ❌ Skip startup procedure or health checks
- ❌ Allow double AI services to run (causes corruption)
- ❌ Make changes without telling PM
- ❌ Call git-repository-manager directly
- ❌ Commit without PM approval

---

## 🛠️ Troubleshooting

### AI Service Issues
**Symptom**: "dokter" search returns no results, "arts" works
**Cause**: AI service corruption (common with double instances)
**Solution**:
```bash
# Kill corrupted service
taskkill //F //IM python.exe
# Restart clean
cd C:\Cursor\Lingora\backend\ai_services
.\start_service.bat
# Test both arts and dokter searches
```

### Service Conflicts
**Symptom**: Ports in use, services won't start
**Solution**:
```bash
# Clean restart all services
.\scripts\start-all-services.bat
```

### Session Startup Failure
1. Check XAMPP is installed and MySQL service running
2. Verify Python virtual environment exists in ai_services/
3. Ensure Node.js and npm are available for frontend
4. Run startup script again - it handles most conflicts automatically

---

## 🎯 Quick Commands

### Session Management
```bash
# Start clean session
"PM agent, start clean development session"

# After changes
"PM agent, updated [component]: [what changed]"

# After testing  
"PM agent, test results for [component]: [pass/fail] - [details]"

# Ready to commit
"PM agent, [changes] tested and stable. Ready for commit?"

# Session end
"PM agent, ending session. Update status."
```

### Service Management
```bash
# Full clean restart
.\scripts\start-all-services.bat

# Individual service health check
.\scripts\health-check.bat

# Kill all services manually
taskkill //F //IM python.exe && taskkill //F //IM node.exe
```

---

## 📊 Project Context

**Mission**: "Find professionals who speak YOUR language" - Netherlands market  
**Status**: 95% MVP Complete - ALPHA 0.1 ACHIEVED  
**Tech Stack**: PHP backend, React frontend, Python AI service  

**Development Access**:
- Frontend: http://localhost:5173
- Backend: http://localhost/lingora/backend/public  
- AI Service: http://127.0.0.1:5001

**Test Accounts**:
- Admin: admin@lingora.nl / password123
- Provider: dr.hassan@medcentrum.nl / password123

---

## 📁 Project Structure

```
C:\Cursor\Lingora\
├── scripts/                    # Startup and utility scripts
│   ├── start-all-services.bat  # Master startup script
│   └── health-check.bat        # Service health verification
├── agents/                     # Agent instructions
│   ├── pm-agent-instructions.md
│   └── documentation-index.md
├── active/                     # Current session tracking
│   ├── project-status.md       # Sprint progress
│   ├── work-in-progress.md     # Current changes
│   └── session-handovers.md    # Session continuity
├── frontend/                   # React application
├── backend/                    # Located at C:\xampp\htdocs\lingora\backend
└── CLAUDE.md                   # This file - master guide
```

---

## 🚨 Emergency Procedures

### If PM Agent Not Responding
```bash
# Manual service restart
cd C:\Cursor\Lingora
.\scripts\start-all-services.bat
```

### If Startup Script Missing
**Run these manually**:
1. Kill: `taskkill //F //IM python.exe && taskkill //F //IM node.exe`
2. Start XAMPP Apache service
3. Start AI: `cd backend\ai_services && .\start_service.bat`
4. Start frontend: `cd frontend && npm run dev`
5. Test: "arts" and "dokter" searches

### If All Else Fails
1. Restart XAMPP completely
2. Clear all Node.js processes
3. Delete Python __pycache__ directories
4. Run startup script again

---

This guide ensures every development session starts with a clean, tested environment where all three services are verified working before development begins. The PM agent coordinates everything and maintains project awareness throughout the session.