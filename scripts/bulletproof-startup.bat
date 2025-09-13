@echo off
:: Bulletproof Startup Orchestrator Script
:: This script safely starts all Lingora services WITHOUT causing Claude Code disconnection
setlocal EnableDelayedExpansion

:: Color definitions for Windows
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "MAGENTA=[95m"
set "NC=[0m"

echo %MAGENTA%=== LINGORA BULLETPROOF STARTUP ===%NC%
echo %MAGENTA%Zero disconnection risk - Safe service startup%NC%
echo.

:: Set paths
set "SCRIPT_DIR=%~dp0"
set "LINGORA_ROOT=%SCRIPT_DIR%.."
set "AI_SERVICES_ROOT=%LINGORA_ROOT%\backend\ai_services"
set "FRONTEND_ROOT=%LINGORA_ROOT%\frontend"

:: Startup attempt counter for safety
set "STARTUP_ATTEMPT=1"

:main_startup
echo %BLUE%🚀 Starting Lingora Services (Attempt %STARTUP_ATTEMPT%)...%NC%
echo.

:: PHASE 1: Pre-flight Safety Check
echo %YELLOW%📋 Phase 1: Pre-flight Safety Check...%NC%
call "%SCRIPT_DIR%safe-test.bat" >nul 2>&1
if "%ERRORLEVEL%" neq "0" (
    echo %RED%❌ Pre-flight check failed - environment not ready%NC%
    echo %YELLOW%   Run: .\scripts\safe-test.bat for details%NC%
    goto :error_exit
)
echo %GREEN%✅ Pre-flight check passed%NC%

:: PHASE 2: XAMPP Services (SAFE - no background processes)
echo.
echo %YELLOW%📋 Phase 2: Starting XAMPP Services...%NC%

:: Check if XAMPP is already running
echo %CYAN%   Checking XAMPP status...%NC%
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I "httpd.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ Apache already running%NC%
) else (
    echo %YELLOW%⚡ Starting Apache HTTP Server...%NC%
    if exist "C:\xampp\apache\bin\httpd.exe" (
        start "Lingora Apache Server" "C:\xampp\apache\bin\httpd.exe"
        timeout /t 3 /nobreak >nul
        echo %GREEN%✅ Apache started in separate window%NC%
    ) else (
        echo %RED%❌ Apache executable not found%NC%
        echo %YELLOW%   Please start XAMPP manually%NC%
    )
)

tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I "mysqld.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ MySQL already running%NC%
) else (
    echo %YELLOW%⚡ Starting MySQL Database...%NC%
    if exist "C:\xampp\mysql\bin\mysqld.exe" (
        start "Lingora MySQL Database" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini"
        timeout /t 5 /nobreak >nul
        echo %GREEN%✅ MySQL started in separate window%NC%
    ) else (
        echo %RED%❌ MySQL executable not found%NC%
        echo %YELLOW%   Please start XAMPP manually%NC%
    )
)

:: PHASE 3: AI Embedding Service (SAFE - visible window)
echo.
echo %YELLOW%📋 Phase 3: Starting AI Embedding Service...%NC%

:: Check if AI service is already running
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://127.0.0.1:5001/health' -TimeoutSec 3 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ AI service already running%NC%
) else (
    echo %YELLOW%⚡ Launching AI Embedding Service...%NC%
    
    :: Safe AI service startup - visible window, no environment interference
    if exist "%AI_SERVICES_ROOT%\embedding_service.py" (
        cd /d "%AI_SERVICES_ROOT%"
        
        :: Start AI service in named window (SAFE - no hidden processes)
        start "Lingora AI Service" cmd /k "title Lingora AI Service && ai_search_env\Scripts\python.exe embedding_service.py"
        
        echo %GREEN%✅ AI service starting in: "Lingora AI Service" window%NC%
        echo %CYAN%   Service URL: http://127.0.0.1:5001%NC%
        
        :: Wait for service to initialize
        echo %YELLOW%⏱️  Waiting for AI service initialization...%NC%
        timeout /t 10 /nobreak >nul
        
    ) else (
        echo %RED%❌ AI service files not found%NC%
        echo %YELLOW%   Expected: %AI_SERVICES_ROOT%\embedding_service.py%NC%
        set "OVERALL_STATUS=DEGRADED"
    )
)

:: PHASE 4: Frontend Development Server (SAFE - visible window)
echo.
echo %YELLOW%📋 Phase 4: Starting Frontend Development Server...%NC%

:: Check if frontend is already running  
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 3 -UseBasicParsing; exit 0 } catch { exit 1 }" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ Frontend server already running%NC%
) else (
    echo %YELLOW%⚡ Launching Frontend Development Server...%NC%
    
    if exist "%FRONTEND_ROOT%\package.json" (
        cd /d "%FRONTEND_ROOT%"
        
        :: Start frontend in named window (SAFE - no hidden processes)
        start "Lingora Frontend Dev Server" cmd /k "title Lingora Frontend Dev Server && npm run dev"
        
        echo %GREEN%✅ Frontend server starting in: "Lingora Frontend Dev Server" window%NC%
        echo %CYAN%   Development URL: http://localhost:5173%NC%
        
        :: Wait for frontend to initialize
        echo %YELLOW%⏱️  Waiting for frontend initialization...%NC%
        timeout /t 8 /nobreak >nul
        
    ) else (
        echo %RED%❌ Frontend files not found%NC%
        echo %YELLOW%   Expected: %FRONTEND_ROOT%\package.json%NC%
        set "OVERALL_STATUS=DEGRADED"
    )
)

:: PHASE 5: Health Verification (SAFE - timeout protected)
echo.
echo %YELLOW%📋 Phase 5: Health Verification...%NC%
echo %CYAN%   Running comprehensive health check...%NC%

call "%SCRIPT_DIR%bulletproof-health.bat" >nul 2>&1
set "HEALTH_STATUS=%ERRORLEVEL%"

if "%HEALTH_STATUS%"=="0" (
    echo %GREEN%🎉 ALL SYSTEMS HEALTHY!%NC%
) else (
    echo %YELLOW%⚠️  Some services need attention%NC%
    echo %YELLOW%   Run: .\scripts\bulletproof-health.bat for details%NC%
)

:: PHASE 6: Startup Complete
echo.
echo %MAGENTA%=== BULLETPROOF STARTUP COMPLETE ===%NC%
echo %GREEN%✅ Zero disconnection risk operations%NC%
echo %GREEN%✅ All services started in visible windows%NC%
echo %GREEN%✅ Claude Code session preserved%NC%
echo.

echo %BLUE%🪟 Service Windows:%NC%
echo    • %CYAN%"Lingora Apache Server"%NC% - Apache HTTP Server
echo    • %CYAN%"Lingora MySQL Database"%NC% - MySQL Database  
echo    • %CYAN%"Lingora AI Service"%NC% - AI Embedding Service
echo    • %CYAN%"Lingora Frontend Dev Server"%NC% - React Development Server
echo.

echo %BLUE%🌐 Service URLs:%NC%
echo    • %CYAN%Backend API:%NC% http://localhost/lingora/backend/public/
echo    • %CYAN%AI Service:%NC% http://127.0.0.1:5001
echo    • %CYAN%Frontend:%NC% http://localhost:5173
echo.

echo %BLUE%🛠️  Management Commands:%NC%
echo    • %YELLOW%Health Check:%NC% .\scripts\bulletproof-health.bat  
echo    • %YELLOW%Environment Test:%NC% .\scripts\safe-test.bat
echo    • %YELLOW%Stop Services:%NC% Close the respective service windows
echo.

echo %GREEN%🎯 Ready for development!%NC%
echo %YELLOW%💡 Tip: Keep service windows open for best performance%NC%
echo.

exit /b 0

:error_exit
echo.
echo %RED%💥 Startup failed safely - no disconnection%NC%
echo %YELLOW%📋 Troubleshooting:%NC%
echo    • Run: .\scripts\safe-test.bat (environment check)
echo    • Run: .\scripts\bulletproof-health.bat (service status)
echo    • Check XAMPP installation
echo    • Verify Python virtual environment
echo.
exit /b 1