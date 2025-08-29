# Documentation Reorganization Plan - Lingora Project
*Detailed implementation plan for documentation cleanup*
*Created: 2025-08-29*

## 🎯 Reorganization Overview

**Goal**: Transform scattered documentation into organized, maintainable structure  
**Principle**: Preserve ALL historical information while creating clear navigation  
**Approach**: Create new structure, migrate content, update references

---

## 📁 New Folder Structure to Create

### **1. Create `/active/` Folder**
**Purpose**: Files updated frequently during development

**Files to Create**:
- ✅ `project-status.md` - **CREATED** (extracted from FEATURE_PROGRESS.md)
- ✅ `work-in-progress.md` - **CREATED** (new tracking system)  
- 📋 `bugs-found.md` - Extract active bugs from BUG_MANAGEMENT.md
- 📋 `session-notes.md` - Extract recent handovers from HANDOVERS.md

### **2. Create `/agents/` Folder**  
**Purpose**: AI agent instruction files

**Files to Move**:
- 🔄 `pm-agent-instructions.md` → `/agents/pm-agent-instructions.md`
- 🔄 `GIT_WORKFLOW.md` → `/agents/github-agent-instructions.md`  
- ✅ `agent-registry.md` - **CREATED** (new coordination system)

### **3. Create `/archive/` Folder**
**Purpose**: Historical documentation preserved for reference

**Files to Move**:
- 📦 `FEATURE_PROGRESS.md` → `/archive/feature-progress-history.md`
- 📦 `BUG_MANAGEMENT.md` → `/archive/bug-management-history.md`  
- 📦 `HANDOVERS.md` → `/archive/session-handovers-history.md`
- 📦 `TRANSLATION_ARCHITECTURE_ADDENDUM.md` → `/archive/`
- 📦 `TRANSLATION_QUICK_START.md` → `/archive/`

---

## 📋 Detailed Migration Plan

### **Phase 1: Extract Active Information** ⚠️ **REQUIRES USER APPROVAL**

#### **Create `/active/bugs-found.md`**
**Source**: BUG_MANAGEMENT.md (lines focusing on current issues)  
**Extract**:
- Any "HIGH PRIORITY" or "CRITICAL" items still unresolved
- Any "🔧 Active" status items
- Current testing procedures
- **Exclude**: Historical "✅ RESOLVED" sections (those go to archive)

#### **Create `/active/session-notes.md`** 
**Source**: HANDOVERS.md (recent session summaries)
**Extract**:
- "Current Session Status" section
- Latest handover (Aug 28, 2025) 
- Immediate next priorities
- Development environment status
- **Exclude**: Historical handover archives (those stay in archive)

### **Phase 2: Move Agent Files** ⚠️ **REQUIRES USER APPROVAL**

```bash
# File movements (when approved):
mv pm-agent-instructions.md /agents/pm-agent-instructions.md
mv GIT_WORKFLOW.md /agents/github-agent-instructions.md
```

**Update Required**: 
- Update references in CLAUDE.md to new agent file locations
- Update DEVELOPMENT_GUIDE.md references to git workflow

### **Phase 3: Archive Historical Files** ⚠️ **REQUIRES USER APPROVAL**

```bash
# File movements (when approved):
mv FEATURE_PROGRESS.md /archive/feature-progress-history.md  
mv BUG_MANAGEMENT.md /archive/bug-management-history.md
mv HANDOVERS.md /archive/session-handovers-history.md
mv TRANSLATION_ARCHITECTURE_ADDENDUM.md /archive/
mv TRANSLATION_QUICK_START.md /archive/
```

**Metadata Addition**: Add archive note to top of each moved file explaining current location and purpose.

---

## 🔗 Cross-Reference Updates Required

### **Files Needing Reference Updates**:

#### **CLAUDE.md** 
- Update documentation structure section
- Point to new `/active/project-status.md` instead of FEATURE_PROGRESS.md
- Update agent instruction file paths to `/agents/` folder

#### **DEVELOPMENT_GUIDE.md**
- Update "Git Workflow" reference to `/agents/github-agent-instructions.md`
- Update handover procedure to reference `/active/session-notes.md`
- Update documentation structure guide

#### **PROJECT_OVERVIEW.md**
- Minimal updates - add note about new documentation organization
- Reference new project-status.md for current progress

### **New Navigation Pattern**:
```
Start Here → CLAUDE.md (master instructions)
Current Work → /active/ folder (project-status.md, work-in-progress.md)
Setup/Reference → Root files (PROJECT_OVERVIEW.md, DEVELOPMENT_GUIDE.md, TECHNICAL_NOTES.md)
Agent Instructions → /agents/ folder
Historical Context → /archive/ folder
```

---

## ✅ Benefits of New Structure

### **For Development Workflow**:
- **Clear Current Status**: `/active/project-status.md` shows exactly what's happening now
- **Real-time Tracking**: `/active/work-in-progress.md` tracks uncommitted work
- **Agent Coordination**: `/agents/` folder organizes AI agent instructions
- **Historical Reference**: `/archive/` preserves context without clutter

### **For PM Agent Efficiency**:
- **Single Source Files**: Each type of information has one current location
- **Reduced File Scanning**: PM knows exactly where to look for current status
- **Clear Ownership**: Active files are PM-managed, reference files are static
- **Version Control**: Clear separation between living documents and historical records

### **For New Developers**:
- **Starting Point**: CLAUDE.md points to current active status
- **Quick Navigation**: Folder names indicate content purpose and update frequency  
- **Complete Context**: All historical decisions preserved in accessible archive
- **Clear Workflow**: Obvious path from setup → current work → next actions

---

## ⚠️ Risk Mitigation

### **Data Preservation**:
- ✅ **No Information Loss**: Everything preserved in archive
- ✅ **Full History**: All session records and progress tracking maintained
- ✅ **Link Integrity**: All references updated to maintain navigation
- ✅ **Rollback Possible**: Original files preserved until confirmation

### **Workflow Continuity**:
- ✅ **PM Agent Training**: Knows new file locations and purposes
- ✅ **User Guidance**: Clear documentation of new structure
- ✅ **Reference Updates**: All internal links updated to new locations
- ✅ **Gradual Migration**: Can be done incrementally with user approval

---

## 🎯 Implementation Steps

### **Step 1: User Approval** (REQUIRED FIRST)
User must approve:
1. Overall reorganization approach
2. Specific file movements proposed  
3. Content extraction from historical files
4. New active file creation

### **Step 2: Create Folders & Extract Content**
```bash
mkdir active agents archive
# Create active/bugs-found.md (extract from BUG_MANAGEMENT.md)
# Create active/session-notes.md (extract from HANDOVERS.md)  
```

### **Step 3: Move Files**
```bash
# Move agent files
mv pm-agent-instructions.md agents/
mv GIT_WORKFLOW.md agents/github-agent-instructions.md

# Archive historical files  
mv FEATURE_PROGRESS.md archive/feature-progress-history.md
mv BUG_MANAGEMENT.md archive/bug-management-history.md
mv HANDOVERS.md archive/session-handovers-history.md
mv TRANSLATION_ARCHITECTURE_ADDENDUM.md archive/
mv TRANSLATION_QUICK_START.md archive/
```

### **Step 4: Update Cross-References**
- Update CLAUDE.md with new structure
- Update DEVELOPMENT_GUIDE.md references
- Test all navigation paths

### **Step 5: Verify & Commit**
- User tests new structure navigation
- PM Agent verifies all tracking files functional
- Commit reorganization as single change set

---

## 📊 Success Criteria

### **Structure Success**:
- ✅ All files in logical folders based on update frequency  
- ✅ Current work immediately accessible in `/active/`
- ✅ Agent coordination clear in `/agents/`
- ✅ Historical context preserved in `/archive/`

### **Workflow Success**:
- ✅ PM Agent can quickly find and update all tracking files
- ✅ New developers can navigate from setup to current work  
- ✅ No information loss during migration
- ✅ All cross-references functional

### **Maintenance Success**: 
- ✅ Clear separation between frequently-updated and static files
- ✅ Reduced file scanning for status updates
- ✅ Logical organization supporting long-term project growth
- ✅ Easy addition of new documentation without clutter

---

**⚠️ USER DECISION REQUIRED**: Should we proceed with this reorganization plan? All changes can be implemented incrementally with approval at each step.

---

*This reorganization plan provides detailed implementation steps for transforming the current documentation structure into an organized, maintainable system that supports effective PM agent coordination and development workflow.*