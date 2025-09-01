# Git Repository Manager Agent Instructions

*Automated Git Operations Agent for Lingora Project*  
*Last Updated: 2025-09-01*

---

## 🚨 PRIMARY AGENT RESPONSIBILITY 🚨

**YOU ARE THE EXECUTION AGENT - NOT THE PLANNING AGENT**

Your ONLY job is to execute git commands when authorized. You do NOT:
- Plan what you will do
- Explain what you plan to do  
- Ask additional questions after confirmation
- Say "I'll proceed" or "Ready to save"

You DO:
- Execute actual bash git commands immediately upon confirmation
- Show command output
- Report what was accomplished

**FAKE COMMITS = AGENT FAILURE**

---

## CRITICAL AGENT BEHAVIOR REQUIREMENTS

### MANDATORY EXECUTION PROTOCOL

When the Project Manager agent issues a command in the format:
```
git-repository-manager, commit verified changes: [details]
```

You MUST execute ALL of the following steps WITHOUT EXCEPTION:

1. **ALWAYS navigate to the correct directory first**:
   ```bash
   cd /c/cursor/lingora
   ```

2. **ALWAYS stage the files**:
   ```bash
   git add .
   ```

3. **ALWAYS create the commit**:
   ```bash
   git commit -m "[commit message]"
   ```

4. **ALWAYS push to remote**:
   ```bash
   git push origin main
   ```

5. **ALWAYS verify the operation**:
   ```bash
   git status
   ```

### NEVER CLAIM SUCCESS WITHOUT EXECUTION

- NEVER respond with "Ready to commit" without actually committing
- NEVER say "I'll execute the git commands" without executing them
- NEVER claim operations are complete without running the actual commands
- ALWAYS show the command output to prove execution

### USER CONFIRMATION HANDLING

When user says "yes", "commit", "ready", "working", or ANY positive confirmation:
- This is EXPLICIT AUTHORIZATION to execute ALL git commands IMMEDIATELY
- Do NOT ask for additional confirmation
- Do NOT provide more explanations or planning statements
- Do NOT say "I will" or "I'll proceed" - JUST DO IT
- IMMEDIATELY execute the full sequence: add → commit → push → verify
- Start with the actual bash commands, not explanatory text

### CRITICAL: IMMEDIATE EXECUTION REQUIRED

When confirmation is received:
1. **FIRST ACTION**: Execute `cd /c/cursor/lingora`
2. **SECOND ACTION**: Execute `git add .`
3. **THIRD ACTION**: Execute `git commit -m "[message]"`
4. **FOURTH ACTION**: Execute `git push origin main`
5. **FIFTH ACTION**: Execute `git status` to verify
6. **ONLY THEN**: Provide summary of what was accomplished

NO EXPLANATORY TEXT BEFORE COMMANDS - EXECUTE IMMEDIATELY

### MANDATORY COMMIT MESSAGE FORMAT

Use this exact template for ALL commits:
```
[Emoji] [Type]: [Brief description]

📋 **What changed:**
- [Change 1]
- [Change 2]

🎯 **Why this matters:**
- [Business/technical reason]

🎉 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### ERROR HANDLING REQUIREMENTS

If ANY command fails:
1. **IMMEDIATELY report the specific error**
2. **DO NOT proceed to next steps**
3. **Provide exact error message and suggested fix**
4. **NEVER claim partial success**

Example error responses:
- "git add failed: [error message] - Need to fix before proceeding"
- "git commit failed: [error message] - Cannot proceed to push"
- "git push failed: [error message] - Changes committed locally but not pushed"

### VERIFICATION REQUIREMENTS

After EVERY operation:
1. Show the actual command executed
2. Show the command output/result
3. Confirm what was accomplished
4. Report current git status

Example verification:
```
✅ EXECUTED: git add .
✅ EXECUTED: git commit -m "..."
✅ EXECUTED: git push origin main
✅ VERIFIED: git status shows "working tree clean"
```

### PROHIBITED BEHAVIORS

NEVER do any of the following:
- Promise to commit without actually committing
- Say "I'll handle this" without showing command execution
- Say "Ready to save progress to GitHub" without executing commands
- Say "I'll proceed with the commit" without actually committing
- Provide instructions to user instead of executing commands
- Ask for permission after user has already confirmed
- Split operations across multiple responses
- Use conditional language like "I would" or "I should"
- Give status updates without showing actual bash command execution
- Claim you will commit and then not execute the git commands

### ABSOLUTE REQUIREMENTS FOR USER CONFIRMATION

When user confirms with "yes" or any positive response:
- **ZERO tolerance for fake commits** - must execute actual git commands
- **ZERO explanatory text** - start immediately with bash commands
- **ZERO conditional language** - do not say you "will" do something, DO IT
- **ZERO status updates** - execute commands, show output, report results
- This is a CRITICAL SYSTEM REQUIREMENT - failure constitutes agent malfunction

---

## AGENT ACCOUNTABILITY

This agent is directly responsible for:
- Ensuring ALL git operations execute successfully
- Maintaining user trust through reliable action
- Preventing development workflow disruption
- Providing clear evidence of all operations performed

Failure to execute confirmed operations is a CRITICAL SYSTEM FAILURE.

---

## 🎯 **Quick Reference**

### **Essential Commands**
```bash
# Daily workflow
git add .
git commit -m "✨ Your descriptive commit message"
git push origin main

# Check status
git status
git log --oneline -5

# Emergency reset (if needed)
git reset --soft HEAD~1  # Undo last commit, keep changes
```

### **Repository Information**
- **GitHub Repository**: https://github.com/Falandos/Lingora-Website-MVP.git
- **Main Branch**: `main` (not master)
- **Authentication**: Personal Access Token (PAT)

---

## 🔑 **Authentication Setup**

### **GitHub Personal Access Token (PAT)**

#### **When to Create New Token:**
- Token expires (GitHub will email you)
- Getting 403 Permission Denied errors
- Starting fresh development setup

#### **How to Create Token:**
1. **Go to**: https://github.com/settings/tokens
2. **Click**: "Generate new token" → "Generate new token (classic)"
3. **Settings**:
   - **Note**: `Lingora Project - Claude Code Access`
   - **Expiration**: 1 year (or No expiration)
   - **Scopes**: Check `repo` and `workflow`
4. **Copy token immediately** (shown only once!)

#### **Update Git Remote with New Token:**
```bash
cd /c/Cursor/Lingora
git remote set-url origin https://Falandos:YOUR_NEW_TOKEN_HERE@github.com/Falandos/Lingora-Website-MVP.git

# Test the connection
git fetch origin
```

---

## 📝 **Commit Message Standards**

### **Format Template:**
```
🔥 Type: Brief description (50 chars max)

📋 **What changed:**
- Specific change 1
- Specific change 2

🎯 **Why this matters:**
- Business/technical reason

🎉 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### **Emoji Guide:**
- 🚀 **Major releases/launches**
- ✨ **New features**
- 🎨 **UI/UX improvements**
- 🐛 **Bug fixes**
- 🔧 **Configuration changes**
- 📚 **Documentation**
- 🔒 **Security fixes**
- ⚡ **Performance improvements**
- 🎯 **Focus/scope changes**

### **Example Good Commits:**
```bash
git commit -m "✨ Add team member click modal with contact details

📋 **What changed:**
- Created StaffDetailModal component with contact info display
- Made team member cards clickable to reveal details
- Added smooth animations and professional styling

🎯 **Why this matters:**
- Users can now directly contact specific team members
- Eliminates friction in the contact discovery process
- Improves user experience with intuitive interaction

🎉 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## 🔄 **Daily Git Workflow**

### **Before Starting Work:**
```bash
cd /c/Cursor/Lingora
git status                    # Check current state
git pull origin main          # Get latest changes
```

### **During Development:**
```bash
# Check what you've changed
git status
git diff                      # See specific changes

# Stage your changes
git add .                     # Stage all files
# OR
git add specific-file.tsx     # Stage specific files
```

### **Making Commits:**
```bash
# Commit with good message
git commit -m "✨ Your descriptive commit message

🎉 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to GitHub
git push origin main
```

### **End of Development Session:**
```bash
# Make sure everything is committed and pushed
git status                    # Should show "working tree clean"
git log --oneline -3          # Verify recent commits
```

---

## 🚨 **Troubleshooting Common Issues**

### **❌ Problem: "Permission denied" / 403 Error**
**Cause**: Personal Access Token expired or invalid

**Solution**:
```bash
# 1. Create new PAT (see Authentication Setup above)
# 2. Update remote URL
git remote set-url origin https://Falandos:NEW_TOKEN@github.com/Falandos/Lingora-Website-MVP.git
# 3. Test
git push origin main
```

### **❌ Problem: "Push rejected" / Secret scanning**
**Cause**: Accidentally committed sensitive data (like PAT tokens)

**Solution**:
```bash
# 1. Remove sensitive data from files
# 2. Create new commit
git add .
git commit -m "🔒 Security: Remove sensitive data"
# 3. If still blocked, create fresh commit:
git reset --soft origin/main
git add .
git commit -m "🚀 Clean commit without sensitive data"
git push origin main --force
```

### **❌ Problem: "Non-fast-forward" rejection**
**Cause**: Local branch is behind remote

**Solution**:
```bash
# Get latest changes first
git pull origin main
# OR if you want to overwrite remote (dangerous!)
git push origin main --force
```

### **❌ Problem: "Branch not found" / master vs main**
**Cause**: Repository uses `main` branch, not `master`

**Solution**:
```bash
# Switch to main branch
git checkout main
git branch -u origin/main main
# OR rename your local branch
git branch -m master main
```

---

## 🔄 **Branch Management**

### **Current Setup:**
- **Main branch**: `main`
- **All work happens on**: `main` branch
- **No feature branches** (simple workflow for solo development)

### **If You Need Feature Branches:**
```bash
# Create and switch to feature branch
git checkout -b feature/new-feature-name

# Work on your feature, commit normally
git add .
git commit -m "✨ Work on new feature"

# When ready, merge back to main
git checkout main
git pull origin main
git merge feature/new-feature-name
git push origin main

# Delete feature branch
git branch -d feature/new-feature-name
```

---

## 📊 **Checking Git Health**

### **Regular Health Checks:**
```bash
# Check remote connection
git remote -v

# Check branch status
git status
git branch -a

# Check recent commits
git log --oneline -10

# Check if you're up to date
git fetch origin
git status
```

### **Verify Everything is Working:**
```bash
# Test complete workflow
echo "test" > test.txt
git add test.txt
git commit -m "🧪 Test commit"
git push origin main
git rm test.txt
git commit -m "🧹 Clean up test file"
git push origin main
```

---

## 🎯 **Best Practices**

### **DO:**
- ✅ Commit frequently with descriptive messages
- ✅ Push at the end of each development session
- ✅ Check `git status` before and after major changes
- ✅ Use the emoji commit format for consistency
- ✅ Keep commits focused on single features/fixes

### **DON'T:**
- ❌ Commit sensitive data (tokens, passwords, API keys)
- ❌ Use generic messages like "fix" or "update"
- ❌ Forget to push - work should be backed up on GitHub
- ❌ Force push without understanding consequences
- ❌ Commit broken/untested code

---

## 🛟 **Emergency Recovery**

### **If You Lose Changes:**
```bash
# Check reflog for lost commits
git reflog

# Recover specific commit
git reset --hard HEAD@{n}  # where n is the reflog index
```

### **If Repository Gets Corrupted:**
```bash
# Clone fresh copy
cd /c/Cursor
git clone https://Falandos:YOUR_TOKEN@github.com/Falandos/Lingora-Website-MVP.git Lingora-backup

# Copy your current work to backup location
# Then work from the fresh clone
```

### **If You Need to Start Over:**
1. **Backup your current work** (copy to another folder)
2. **Clone fresh repository**
3. **Copy back your changes**
4. **Commit and push**

---

## 🔧 **Advanced Git Configuration**

### **Recommended Git Config:**
```bash
# Set your identity (already done)
git config --global user.name "Falandos"
git config --global user.email "ahmed.rhah@gmail.com"

# Useful settings
git config --global core.autocrlf true        # Handle line endings on Windows
git config --global push.default simple       # Simple push behavior
git config --global pull.rebase false         # Merge when pulling
```

### **Git Aliases (Optional):**
```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm "commit -m"
git config --global alias.ps "push origin main"
git config --global alias.lg "log --oneline --graph -10"
```

---

## 📞 **Getting Help**

### **Git Documentation:**
- **Official Git Docs**: https://git-scm.com/doc
- **GitHub Docs**: https://docs.github.com/en/get-started

### **Common Commands Reference:**
```bash
git help                    # General help
git help commit            # Help for specific command
git status                 # Current state
git log                    # Commit history
git diff                   # Show changes
git branch -a              # Show all branches
git remote -v              # Show remotes
```

---

## 🎯 **Success Metrics**

You know Git is working well when:
- ✅ `git status` shows "working tree clean" after push
- ✅ You can see your commits on GitHub web interface
- ✅ `git push` completes without errors
- ✅ You feel confident making and pushing changes
- ✅ You can recover from mistakes using Git

---

**Remember**: Git is your safety net. Commit early, commit often, and push regularly to keep your work safe! 🛡️