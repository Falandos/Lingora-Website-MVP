# Lingora Startup Scripts

This directory contains automated scripts for managing the Lingora development environment.

## 🚀 Quick Start

**Single Command Startup (Recommended)**
```bash
cd C:\Cursor\Lingora
.\scripts\start-all-services.bat
```

This will:
1. Kill all existing services (prevents conflicts)
2. Start all 3 core services (Backend, AI, Frontend)
3. Perform comprehensive health checks
4. Test AI service with "arts" and "dokter" searches
5. Report: "Site is ready to test on port 5173"

## 📋 Available Scripts

### `start-all-services.bat` - Master Startup Script
**Purpose**: Complete environment setup and verification
- Kills conflicting processes (Python, Node.js)
- Starts XAMPP Apache and MySQL
- Starts AI embedding service with model loading
- Starts frontend development server
- Performs health checks on all services
- Tests AI functionality (critical "dokter" corruption test)

**Usage**: 
```bash
.\scripts\start-all-services.bat
```

**Expected Output**: "Site is ready to test on port 5173" when all services are healthy

### `health-check.bat` - Service Health Verification
**Purpose**: Verify all services are running correctly without restarting
- Checks XAMPP Apache and MySQL services
- Verifies AI service on port 5001 with functionality tests
- Tests frontend server on port 5173
- Validates frontend proxy to backend
- Detects AI service corruption (dokter search failure)

**Usage**:
```bash
.\scripts\health-check.bat
```

## 🩺 Health Check Details

### Backend Checks
- ✅ XAMPP Apache service running
- ✅ Backend API responding on localhost/lingora/backend/public
- ✅ MySQL service active

### AI Service Checks  
- ✅ Port 5001 listening
- ✅ Health endpoint responding
- ✅ "arts" search returns results
- ✅ **"dokter" search returns results** (corruption indicator)

### Frontend Checks
- ✅ Port 5173 listening  
- ✅ Vite dev server responding
- ✅ Proxy to backend API working

## 🚨 Critical AI Service Test

**The "dokter" Search Test**: 
- If "dokter" returns no results while "arts" works → **AI service is corrupted**
- This indicates double service instances or internal corruption
- **Solution**: Kill all Python processes and restart AI service

## 🛠️ Troubleshooting

### Common Issues

**"Port already in use" errors**:
- The startup script automatically kills conflicting processes
- If issues persist, manually run: `taskkill //F //IM python.exe`

**AI service not starting**:
- Verify Python virtual environment exists: `backend\ai_services\ai_search_env\`
- Check if XAMPP MySQL is running (AI service needs database)

**Frontend proxy errors**:
- Ensure backend is running before frontend starts
- Check XAMPP Apache is serving on port 80

### Emergency Manual Recovery

If scripts fail, manually start services:

1. **Kill existing processes**:
   ```cmd
   taskkill //F //IM python.exe
   taskkill //F //IM node.exe
   ```

2. **Start XAMPP services** (Apache, MySQL)

3. **Start AI service**:
   ```cmd
   cd C:\Cursor\Lingora\backend\ai_services
   .\start_service.bat
   ```

4. **Start frontend**:
   ```cmd
   cd C:\Cursor\Lingora\frontend
   npm run dev
   ```

## 🎯 Service URLs

When all services are running:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost/lingora/backend/public
- **AI Service**: http://localhost:5001

## 🔧 Integration with PM Agent

The PM agent uses these scripts for session startup:
```
"PM agent, start clean development session"
→ PM executes .\scripts\start-all-services.bat
→ Reports status and readiness
```

This ensures every development session begins with a verified, clean environment.