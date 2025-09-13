@echo off
:: Safe Startup Orchestrator Script
:: This script safely starts all Lingora services without causing Claude Code disconnection
setlocal EnableDelayedExpansion

:: Color definitions for Windows
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "NC=[0m"

echo %CYAN%██████████████████████████████████████████████████████████%NC%
echo %CYAN%█                                                        █%NC%
echo %CYAN%█           🚀 Lingora Safe Startup System 🚀           █%NC%
echo %CYAN%█                                                        █%NC%
echo %CYAN%█         Designed to prevent Claude Code               █%NC%
echo %CYAN%█              session disconnections                   █%NC%
echo %CYAN%█                                                        █%NC%
echo %CYAN%██████████████████████████████████████████████████████████%NC%
echo.

:: Set script directory and root paths
set "SCRIPT_DIR=%~dp0"
set "ROOT_DIR=%SCRIPT_DIR%.."

:: Change to Lingora root directory
cd /d "%ROOT_DIR%"

:: Initialize startup tracking
set /a total_steps=4
set /a completed_steps=0
set startup_success=1

echo %BLUE%=== Starting Lingora Development Environment ===%NC%
echo.

:: Step 1: Clean existing processes (safe cleanup)
echo %YELLOW%[1/4] 🧹 Cleaning existing processes...%NC%
echo %YELLOW%   Safely terminating conflicting processes...%NC%

:: Kill processes with error suppression (no cascade failures)
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo %GREEN%   ✅ Process cleanup complete%NC%
set /a completed_steps+=1
echo.

:: Step 2: Start Backend Services (XAMPP)
echo %YELLOW%[2/4] 🏗️  Starting Backend Services (XAMPP)...%NC%
echo %YELLOW%   Executing: scripts\start-backend.bat%NC%

:: Call backend starter (isolated execution)
call "%SCRIPT_DIR%start-backend.bat"
set backend_result=%ERRORLEVEL%

if %backend_result% equ 0 (
    echo %GREEN%   ✅ Backend services started successfully%NC%
    set /a completed_steps+=1
) else (
    echo %RED%   ❌ Backend services failed to start%NC%
    set startup_success=0
)
echo.

:: Step 3: Start AI Embedding Service
echo %YELLOW%[3/4] 🧠 Starting AI Embedding Service...%NC%
echo %YELLOW%   Executing: scriptsstart-ai-service.bat%NC%

:: Call AI service starter (isolated execution)
call "%SCRIPT_DIR%start-ai-service.bat"
set ai_result=%ERRORLEVEL%

if %ai_result% equ 0 (
    echo %GREEN%   ✅ AI service started successfully%NC%
    set /a completed_steps+=1
) else (
    echo %RED%   ❌ AI service failed to start%NC%
    set startup_success=0
)
echo.

:: Step 4: Start Frontend Development Server
echo %YELLOW%[4/4] 🌐 Starting Frontend Development Server...%NC%
echo %YELLOW%   Executing: scripts\start-frontend.bat%NC%

:: Call frontend starter (isolated execution)
call "%SCRIPT_DIR%start-frontend.bat"
set frontend_result=%ERRORLEVEL%

if %frontend_result% equ 0 (
    echo %GREEN%   ✅ Frontend server started successfully%NC%
    set /a completed_steps+=1
) else (
    echo %RED%   ❌ Frontend server failed to start%NC%
    set startup_success=0
)
echo.

:: Wait for all services to fully initialize
echo %YELLOW%⏱️  Waiting for services to fully initialize...%NC%
timeout /t 10 /nobreak >nul

:: Comprehensive Health Check
echo %BLUE%=== Running Comprehensive Health Check ===%NC%
echo.

:: Call health checker (safe, non-hanging)
call "%SCRIPT_DIR%health-check.bat"
set health_result=%ERRORLEVEL%

echo.

:: Final Status Report
echo %CYAN%══════════════════════════════════════════════════════════%NC%
echo %CYAN%                    🏁 STARTUP SUMMARY                    %NC%
echo %CYAN%══════════════════════════════════════════════════════════%NC%
echo.

echo %BLUE%Startup Progress: %completed_steps%/%total_steps% steps completed%NC%
echo.

:: Individual service status
if %backend_result% equ 0 (
    echo %GREEN%✅ Backend (XAMPP):          STARTED%NC%
) else (
    echo %RED%❌ Backend (XAMPP):          FAILED%NC%
)

if %ai_result% equ 0 (
    echo %GREEN%✅ AI Embedding Service:     STARTED%NC%
) else (
    echo %RED%❌ AI Embedding Service:     FAILED%NC%
)

if %frontend_result% equ 0 (
    echo %GREEN%✅ Frontend Server:          STARTED%NC%
) else (
    echo %RED%❌ Frontend Server:          FAILED%NC%
)

echo.

:: Overall status and next steps
if %startup_success% equ 1 if %completed_steps% equ %total_steps% (
    echo %GREEN%🎉 ALL SERVICES STARTED SUCCESSFULLY! 🎉%NC%
    echo %GREEN%✅ Lingora development environment is ready%NC%
    echo.
    echo %CYAN%🌐 Access Your Application:%NC%
    echo %BLUE%   Frontend:    http://localhost:5173%NC%
    echo %BLUE%   Backend API: http://localhost/lingora/backend/public/%NC%
    echo %BLUE%   AI Service:  http://127.0.0.1:5001/health%NC%
    echo.
    echo %CYAN%🚀 Ready for Development!%NC%
    echo %YELLOW%   - Visit http://localhost:5173 to see your application%NC%
    echo %YELLOW%   - Check health status anytime: .\scripts\health-check.bat%NC%
    
) else (
    echo %RED%⚠️  STARTUP INCOMPLETE%NC%
    echo %YELLOW%Some services failed to start. Check individual error messages above.%NC%
    echo.
    echo %CYAN%🔧 Troubleshooting Options:%NC%
    echo %YELLOW%   - Run health check: .\scripts\health-check.bat%NC%
    echo %YELLOW%   - Start services individually:%NC%
    
    if %backend_result% neq 0 (
        echo %YELLOW%     • Backend: .\scripts\start-backend.bat%NC%
    )
    if %ai_result% neq 0 (
        echo %YELLOW%     • AI Service: .\start-ai-service.bat%NC%
    )
    if %frontend_result% neq 0 (
        echo %YELLOW%     • Frontend: .\scripts\start-frontend.bat%NC%
    )
    
    echo %YELLOW%   - Check XAMPP, Python virtual env, and Node.js installation%NC%
)

echo.
echo %CYAN%══════════════════════════════════════════════════════════%NC%
echo %GREEN%✅ Startup process completed safely - no disconnection risk%NC%
echo %CYAN%══════════════════════════════════════════════════════════%NC%
echo.

:: Exit with appropriate code
if %startup_success% equ 1 if %completed_steps% equ %total_steps% (
    exit /b 0
) else (
    exit /b 1
)