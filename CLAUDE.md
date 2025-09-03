# CLAUDE.md - Lingora Development System Guide
*Primary instruction file for AI-assisted development with agent system*
*Last Updated: 30-08-2025*

## 🤖 Agent-Based Development System

### Core Principle: PM-First Workflow
**The PM agent is the central brain. It tracks EVERYTHING and controls git commits.**
**No code changes happen without PM awareness. No commits happen without PM approval.**

---

## 📋 Available Agents

### 1. **project-manager (PM)** - Central Coordinator
- **Instructions**: `C:/Cursor/.claude/agents/pm-agent-instructions.md`
- **Role**: Tracks all work, maintains documentation, controls git commits
- **Usage**: "PM agent, [status/update/test results/commit]"
- **Maintains**: 
  - `/active/project-status.md` (sprint progress)
  - `/active/work-in-progress.md` (uncommitted changes)
  - `/agents/documentation-index.md` (file locations)
  - `/agents/agent-registry.md` (agent catalog)
- **Model**: Claude Opus recommended (complex coordination)

### 2. **solution-architect** - Technical Design Expert
- **Instructions**: `C:/Cursor/Lingora/agents/solution-architect-instructions.md`
- **Role**: Provides technical solution designs, clarifies implementation approaches
- **Usage**: "Solution architect, I need to implement [feature/fix]. Please clarify approach in [SD-XXX]"
- **Maintains**: solution-designs.md with detailed technical proposals
- **Always**: Provides solution ID references (SD-001, SD-002, etc.)

### 3. **git-repository-manager** - Git Operations
- **Instructions**: `C:/Cursor/.claude/agents/git-repository-manager.md`
- **Role**: Executes git operations ONLY when PM agent triggers
- **Usage**: Called by PM agent after verification
- **Never**: Called directly by user

---

## 🔄 MANDATORY Development Workflow

### Every Session MUST Follow This Flow:

START SESSION
"PM agent, what's the current status?"
→ PM provides context, uncommitted work, priorities

BEFORE ANY IMPLEMENTATION
1. "Solution architect, I need to implement [feature/fix]. Please clarify the approach in solution [SD-XXX]"
2. "PM agent, I'm about to implement [feature] following solution [SD-XXX]. This will modify [files/components]"
→ PM logs planned work and creates change tracking

MAKE CHANGES
After EACH change: "PM agent, I [changed X in location Y]"
→ PM logs in work-in-progress.md

TEST MANUALLY
"PM agent, test results: [pass/fail] for [component] - [details]"
→ PM updates test status

REQUEST COMMIT (only if ready)
"PM agent, [feature] tested and working, ready for commit"
→ PM verifies criteria → triggers git-repository-manager

END SESSION
"PM agent, ending session, update status"
→ PM saves state for next session


---

## ⚠️ CRITICAL RULES

### ALWAYS (No Exceptions):
- ✅ Start EVERY session with PM status check
- ✅ Report EVERY change to PM immediately
- ✅ Test manually before declaring "done"
- ✅ Give PM explicit test results
- ✅ Let PM decide when to commit
- ✅ End session with PM status update

### NEVER (Will Break System):
- ❌ Make changes without telling PM
- ❌ Call git-repository-manager directly
- ❌ Say "done" without testing
- ❌ Commit without PM approval
- ❌ Create new .md files without PM tracking
- ❌ Skip session start/end with PM

---

## 📊 PM Agent Tracking System

The PM maintains real-time project awareness through the **5-Document Active Development Structure**:
- **/active/project-status.md** - Sprint progress and milestone tracking
- **/active/work-in-progress.md** - Current session changes and test status
- **/active/bugs-and-issues.md** - Active development issues and enhancement opportunities
- **/active/technical-development.md** - Architecture decisions and implementation patterns
- **/active/session-handovers.md** - Development continuity and session context

---

## 🎯 Quick Commands

```bash
# Session Start (MANDATORY)
"PM agent, provide current status and priorities"

# After Changes (MANDATORY)
"PM agent, updated [component]: [what changed]"

# After Testing (MANDATORY)
"PM agent, test results for [component]: [pass/fail] - [details]"

# Ready to Commit
"PM agent, [changes] tested and stable. Ready for commit?"

# Session End (MANDATORY)
"PM agent, ending session. Update status."

# Finding Things
"PM agent, where is [feature/doc/code]?"

# Check Uncommitted Work
"PM agent, what's pending commit?"

🚦 Commit Control Protocol
PM agent ONLY triggers commits when ALL criteria met:

✅ Changes tracked in /active/work-in-progress.md
✅ Manual testing completed
✅ User confirms "working"
✅ No breaking changes
✅ Documentation updated

Any criterion fails → No commit, just track

📚 Documentation Structure (Optimized 5-Document System)
**Current Structure - August 30, 2025:**

**Root Directory (Core References Only):**
- CLAUDE.md - This file - Primary development instructions
- Whimsical.md - UI delight and animation guidelines  
- PITCH.md - Platform capabilities overview

**Agent Instructions:**
- /agents/pm-agent-instructions.md - Project Manager agent
- /agents/github-agent-instructions.md - Git operations agent
- /agents/agent-registry.md - Agent catalog
- /agents/documentation-index.md - Master file index

**Active Development (5-Document Structure):**
- /active/project-status.md - Sprint progress and milestone tracking
- /active/work-in-progress.md - Current session changes and test status
- /active/bugs-and-issues.md - Active development issues and enhancement tracking
- /active/technical-development.md - Architecture patterns and debugging insights
- /active/session-handovers.md - Development continuity and session transitions

**Archived (Historical Reference):**
- /archive/*-2025-08-29.md - All historical documentation timestamped and preserved
- /archive/PROJECT_OVERVIEW-2025-08-29.md - Project scope and MVP requirements
- /archive/DEVELOPMENT_GUIDE-2025-08-29.md - Setup and architecture
- /archive/TECHNICAL_NOTES-2025-08-29.md - Technical reference  
- /archive/BUG_MANAGEMENT-2025-08-29.md - Historical issue tracking  
- /archive/HANDOVERS-2025-08-29.md - Historical session transfers
- /archive/TRANSLATION_*-2025-08-29.md - Translation system documentation

🎯 Lingora Project Context
Mission
"Find professionals who speak YOUR language" - Netherlands market
Current Status (Updated August 29, 2025)

Progress: 95% MVP Complete - ALPHA 0.1 ACHIEVED!
Working: All core systems operational (search, auth, contact, dashboards, AI search, translations)
Achievement: Complete homepage translation system with react-i18next
Next Phase: Quality of life improvements, additional languages, bug fixes

Development Access

Frontend: http://localhost:5174
Backend: http://localhost/lingora/backend/public
Admin: admin@lingora.nl / password123
Provider: dr.hassan@medcentrum.nl / password123

Project Locations

Documentation: C:\Cursor\Lingora\
Frontend Code: C:\Cursor\Lingora\frontend\
Backend Code: C:\xampp\htdocs\lingora\backend\


🔴 Emergency Procedures
PM Agent Not Responding:
bash# Reload instructions
"PM agent, reload from pm-agent-instructions.md"

# Status check
"PM agent, are you tracking /active/work-in-progress.md?"

# Manual verification
- Check /active/work-in-progress.md exists
- Verify /agents/pm-agent-instructions.md present
- Restart if needed
Urgent Commit Needed:
bash# Still use PM, but expedite:
"PM agent, URGENT: [change] tested and critical. Fast-track commit."

📈 System Metrics
PM tracks effectiveness through:

Changes tracked per session
Commits approved vs rejected
Time from change to commit
Documentation updates
Session continuity

Request: "PM agent, show metrics"

🚀 Agent Development Roadmap
✅ Completed

github-repository-manager (Git operations)
project-manager (Organization)

📅 Planned

code-auditor (Bug finding)
solution-architect (Fix design)
developer (Implementation)
product-owner (Product consistency)


🔧 Adding New Agents

Create agent: /agent [description]
Create instructions: [agent-name]-instructions.md
Register: "PM agent, register new agent: [name]"
PM updates /agents/agent-registry.md


⚠️ Important Notes
From Previous System

Consolidated documentation approach being maintained
Git workflow procedures preserved
Session handover system integrated into PM workflow
All technical context preserved in PROJECT_OVERVIEW.md

Key Change

PM agent now controls all documentation updates
No direct file modifications without PM tracking
Git commits only through PM verification