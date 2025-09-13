# Archived Scripts

This directory contains legacy startup scripts that have been replaced by the new safe startup system.

## Files in this archive:

- **start-all-services.bat** - Original startup script that caused Claude Code disconnection issues
- **start-all-services.bat.backup** - Backup copy of the original script

## Why these were archived:

These scripts contained problematic patterns that caused Claude Code session disconnections:
- Unix-style background syntax (`&`) in Windows batch
- Virtual environment activation that corrupted execution context  
- Blocking operations without proper timeout handling
- `pause` commands that froze execution waiting for user input
- Process management issues that interfered with Claude Code

## New Safe System:

The replacement system is located in `/scripts/` and consists of:
- `safe-startup.bat` - Main orchestrator (disconnection-safe)
- `start-backend.bat` - Isolated XAMPP starter
- `start-ai-service.bat` - Isolated AI service starter (moved from root)  
- `start-frontend.bat` - Isolated frontend server starter
- `health-check.bat` - Comprehensive health verification

## Usage:

To start all services safely:
```bash
.\scripts\safe-startup.bat
```

To check service health:
```bash
.\scripts\health-check.bat
```

---
*Archived on: September 12, 2025*  
*Reason: Replaced with disconnection-safe startup system*