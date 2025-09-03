# Agent Registry - Lingora Project
*Catalog of available agents and their capabilities*
*Created: 2025-08-29 | Last Updated: 2025-08-29*

## 🤖 Available Agents

### 1. **project-manager** - Central Coordination Hub
**Status**: ✅ Active  
**Instructions**: `/agents/pm-agent-instructions.md`  
**Model Recommendation**: Claude Opus (complex coordination tasks)

#### **Primary Role**
Central coordination and single source of truth for all development activities. The project's brain and memory.

#### **Core Responsibilities**
- **Documentation Management**: Maintain documentation-index.md, organize all project files
- **Work Tracking**: Real-time updates to work-in-progress.md and project-status.md  
- **Git Commit Control**: ONLY entity authorized to trigger commits after verification
- **Status Reporting**: Provide comprehensive project status and progress updates
- **Agent Coordination**: Route requests to appropriate specialized agents

#### **Key Capabilities**
- Track ALL changes immediately in work-in-progress.md
- Extract project status from historical documents
- Coordinate between multiple agents without losing context
- Maintain absolute awareness of uncommitted work
- Control git commit authorization with strict criteria checking

#### **Usage Pattern**
```
User: "PM agent, [status/update/test results/commit request]"
PM: [Acknowledges, updates tracking, provides status/routes request/controls commits]
```

#### **Maintains These Files**
- project-status.md (current sprint and priorities)
- work-in-progress.md (uncommitted changes tracking)  
- documentation-index.md (complete file mapping)
- agent-registry.md (this file)

---

### 2. **solution-architect** - Technical Architecture & Implementation Specialist
**Status**: ✅ Active  
**Instructions**: `/agents/solution-architect-instructions.md` (technical leadership)  
**Model Recommendation**: Claude Opus (complex technical analysis and architecture decisions)

#### **Primary Role**
Technical leadership for all architecture decisions, debugging, implementation guidance, and system design.

#### **Core Responsibilities**
- **Technical Architecture**: System design decisions, technology selection, implementation patterns
- **Bug Analysis & Resolution**: Root cause analysis, debugging, technical problem solving
- **Performance Optimization**: System performance analysis, optimization strategies
- **Implementation Guidance**: Code review, technical best practices, development patterns
- **System Integration**: API design, database architecture, service coordination
- **Development Environment**: Technical setup, configuration, troubleshooting

#### **Key Capabilities**
- Analyze and resolve complex technical issues (AI service corruption, database problems)
- Design scalable system architecture for multilingual platform
- Provide implementation guidance for React/TypeScript/PHP/MySQL stack
- Debug API integration issues, proxy configuration, authentication flows
- Optimize search functionality, semantic AI integration, database queries
- Guide development best practices and code quality standards

#### **Usage Pattern**
```
PM Agent: "solution-architect, [technical issue/architecture question]"
Solution Architect: [Analyzes, provides technical solution, implementation guidance]
```

#### **Technical Domain Coverage**
- **Frontend**: React + TypeScript + Vite development and optimization
- **Backend**: PHP 8.2 + MySQL architecture and performance
- **AI Integration**: Semantic search service, embedding management
- **DevOps**: XAMPP environment, service management, deployment
- **Database**: MySQL design, query optimization, relationship management
- **Authentication**: Security patterns, token management, authorization

#### **Maintains These Files**
- technical-development.md (primary technical knowledge base)
- bugs-and-issues.md (technical bug analysis and resolution tracking)
- Architecture documentation and technical specifications

#### **Critical Rules**
- ✅ **HANDLES ALL** technical issues routed from PM agent
- ✅ **OWNS** technical decision making and implementation guidance
- ✅ **MAINTAINS** technical knowledge base and troubleshooting guides
- ✅ **COORDINATES** with PM agent on organizational impact of technical decisions

---

### 3. **git-repository-manager** - Git Operations Specialist  
**Status**: ✅ Active  
**Instructions**: `C:/Cursor/.claude/agents/git-repository-manager.md` (formerly GIT_WORKFLOW.md)  
**Model Recommendation**: Any model (straightforward command execution)

#### **Primary Role**
Execute git operations ONLY when triggered by project-manager agent after full verification.

#### **Core Responsibilities**
- **Git Commands**: Execute add, commit, push operations
- **Repository Management**: Handle branching, merging, conflict resolution
- **Commit Message Standards**: Apply consistent formatting and metadata
- **Authentication**: Manage PAT tokens and repository access

#### **Key Capabilities**  
- Execute git workflow procedures from instruction file
- Handle commit message formatting with Claude Code metadata
- Manage repository authentication and access issues
- Provide git status and history information when requested

#### **Usage Pattern**
```
PM Agent: "git-repository-manager, commit verified changes: [detailed list]"
Git Agent: [Executes git operations, reports results]
```

#### **Critical Rules**
- ❌ **NEVER** called directly by user
- ❌ **NEVER** executes commits without PM agent authorization  
- ✅ **ONLY** responds to PM agent commit triggers
- ✅ **ALWAYS** uses proper commit message format with metadata

---

## 🎯 Agent Coordination Workflow

### **Standard Development Flow**
```
1. User makes change → Reports to PM Agent
2. PM Agent → Logs in work-in-progress.md  
3. User tests → Reports results to PM Agent
4. PM Agent → Updates test status, verifies criteria
5. User requests commit → PM Agent verifies ALL criteria
6. PM Agent → Triggers git-repository-manager (if approved)
7. Git Agent → Executes commit, reports success
8. PM Agent → Updates tracking files, confirms completion
```

### **Technical Issue Flow** 🆕
```
User: "[Technical problem/question]"
↓
PM Agent: Routes to → "solution-architect, [technical issue]"
↓
Solution Architect: Analyzes → Provides technical solution
↓
PM Agent: Logs outcome in work-in-progress.md, updates organizational status
```

### **Status Reporting Flow**
```
User: "What's the current status?"
↓
PM Agent: Reads all tracking files, provides comprehensive status
(No other agents involved in status reporting)
```

### **Emergency Procedures**
```
PM Agent Not Responding:
1. Reload from pm-agent-instructions.md
2. Verify work-in-progress.md accessibility
3. Manual status check if needed

Urgent Commit Needed:  
1. Still route through PM Agent
2. Use "URGENT:" prefix for expedited review
3. PM Agent can fast-track if criteria clearly met
```

---

## 📋 Agent Interaction Patterns

### **User → PM Agent** (Primary Interface)
- Status requests and updates
- Change reporting and tracking  
- Test result communication
- Commit authorization requests
- Priority and planning discussions
- **Routes technical issues to solution-architect**

### **PM Agent → Solution Architect** (Technical Coordination) 🆕
- Technical issue routing and escalation
- Architecture decision coordination
- Bug report forwarding and tracking
- Technical implementation guidance requests
- System health monitoring coordination

### **PM Agent → Git Agent** (Internal Coordination)
- Commit execution after verification
- Repository status queries
- Git workflow coordination
- Authentication issue resolution

### **PM Agent → User** (Status & Control)
- Progress reporting and metrics
- Change acknowledgment and tracking
- Commit approval or rejection  
- Priority recommendations
- Session continuity maintenance

---

## 🚫 Anti-Patterns to Avoid

### **DO NOT**
- ❌ Call git-repository-manager directly (bypasses verification)
- ❌ Make changes without reporting to PM Agent
- ❌ Request commits without manual testing
- ❌ Skip PM Agent for status updates
- ❌ Create new .md files without PM tracking
- ❌ Route technical issues incorrectly (always go through PM → solution-architect)

### **ALWAYS**
- ✅ Start session with PM Agent status check
- ✅ Report every change to PM Agent immediately  
- ✅ Provide explicit test results to PM Agent
- ✅ Let PM Agent control commit timing
- ✅ End session with PM Agent status update
- ✅ Route technical issues: User → PM Agent → solution-architect

---

## 🔮 Planned Future Agents

### **code-auditor** (Planned)
**Role**: Bug detection and code quality analysis  
**Usage**: Systematic code review and issue identification  
**Trigger**: PM Agent routes code review requests

### **solution-architect** (ACTIVE) ✅
**Role**: Technical solution design and implementation leadership  
**Usage**: All technical issues, architecture decisions, debugging, implementation planning
**Trigger**: PM Agent routes ALL technical challenges immediately

### **developer** (Planned)
**Role**: Code implementation and feature development  
**Usage**: Execute technical implementations from architect designs  
**Trigger**: PM Agent routes implementation tasks

### **product-owner** (Planned)
**Role**: Product consistency and user experience validation
**Usage**: Feature acceptance and product requirement verification  
**Trigger**: PM Agent routes product decisions

---

## 📊 Agent Effectiveness Metrics

### **PM Agent Performance**
- Changes tracked per session
- Commits approved vs rejected  
- Time from change → test → commit
- Documentation updates maintained
- Session continuity rate
- Cross-reference accuracy

### **Git Agent Performance** 
- Commit success rate
- Authentication issue resolution
- Message formatting consistency  
- Repository synchronization reliability

### **System Integration**
- Agent coordination efficiency
- User workflow smoothness  
- Information preservation rate
- Error prevention effectiveness

---

## 🛠️ Adding New Agents

### **Registration Process**
1. Create `[agent-name]-instructions.md` in `/agents/` folder
2. Request PM Agent to register new agent: "PM agent, register new agent: [name]"  
3. PM Agent updates this registry with capabilities
4. Test coordination patterns with existing agents
5. Document usage patterns and effectiveness metrics

### **Integration Requirements**
- Must coordinate through PM Agent for project awareness
- Must follow established communication patterns
- Must respect PM Agent's tracking and control systems
- Must contribute to overall project organization

---

## 📞 Quick Agent Reference

**Need status?** → PM Agent  
**Made changes?** → Report to PM Agent  
**Ready to commit?** → Request from PM Agent  
**Technical issues?** → PM Agent → solution-architect 🆕  
**Git issues?** → PM Agent → Git Agent  
**Lost context?** → PM Agent (organizational) or solution-architect (technical)

---

*This registry maintains the definitive list of available agents and their coordination patterns. Update when agents are added, modified, or decommissioned.*