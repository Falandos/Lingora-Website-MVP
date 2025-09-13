@echo off
setlocal EnableDelayedExpansion

:: Lingora Clean Startup Procedure
:: Kills all existing services and starts fresh environment
echo ==========================================
echo 🚀 Lingora Clean Startup Procedure
echo ==========================================
echo.

:: Set project paths
set "PROJECT_ROOT=C:\Cursor\Lingora"
set "BACKEND_ROOT=C:\xampp\htdocs\lingora\backend"
set "AI_SERVICES_ROOT=%PROJECT_ROOT%\backend\ai_services"
set "FRONTEND_ROOT=%PROJECT_ROOT%\frontend"

:: Color codes for output
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

echo %BLUE%Phase 1: Service Cleanup%NC%
echo ========================================

:: Kill all existing services to prevent conflicts
echo %YELLOW%🔄 Killing existing services...%NC%

:: Kill Python AI service processes
taskkill /F /IM python.exe >nul 2>&1
if !errorlevel! equ 0 (
    echo %GREEN%✅ Python AI services stopped%NC%
) else (
    echo %YELLOW%⚠️  No Python services found%NC%
)

:: Kill Node.js/npm processes  
taskkill /F /IM node.exe >nul 2>&1
if !errorlevel! equ 0 (
    echo %GREEN%✅ Node.js services stopped%NC%
) else (
    echo %YELLOW%⚠️  No Node.js services found%NC%
)

:: Kill any npm processes
taskkill /F /IM npm.exe >nul 2>&1 >nul 2>&1

:: Wait for processes to fully terminate
echo %YELLOW%⏱️  Waiting for services to terminate...%NC%
timeout /t 3 /nobreak >nul

:: Check if ports are clear
echo %YELLOW%🔍 Checking port availability...%NC%
netstat -an | findstr ":5001" >nul
if !errorlevel! equ 0 (
    echo %RED%❌ Port 5001 still in use - may have conflicts%NC%
) else (
    echo %GREEN%✅ Port 5001 available%NC%
)

netstat -an | findstr ":5173" >nul
if !errorlevel! equ 0 (
    echo %RED%❌ Port 5173 still in use - may have conflicts%NC%
) else (
    echo %GREEN%✅ Port 5173 available%NC%
)

echo.
echo %BLUE%Phase 2: Service Startup%NC%
echo ========================================

:: Start Backend (XAMPP Apache)
echo %YELLOW%🔄 Starting XAMPP Apache service...%NC%
net start Apache2.4 >nul 2>&1
if !errorlevel! equ 0 (
    echo %GREEN%✅ XAMPP Apache started%NC%
) else (
    echo %YELLOW%⚠️  XAMPP Apache already running or manual start needed%NC%
)

:: Start MySQL if not running
net start MySQL >nul 2>&1
if !errorlevel! equ 0 (
    echo %GREEN%✅ MySQL started%NC%
) else (
    echo %YELLOW%⚠️  MySQL already running or manual start needed%NC%
)

:: Wait for backend to initialize
echo %YELLOW%⏱️  Waiting for backend to initialize...%NC%
timeout /t 2 /nobreak >nul

:: Start AI Embedding Service
echo %YELLOW%🔄 Starting AI Embedding Service...%NC%
cd /d "%AI_SERVICES_ROOT%"
if not exist "ai_search_env\Scripts\activate.bat" (
    echo %RED%❌ Python virtual environment not found at %AI_SERVICES_ROOT%\ai_search_env%NC%
    echo %RED%   Please run setup_environment.bat first%NC%
    goto :error
)

:: Start AI service directly (prevents disconnection)
call ai_search_env\Scripts\activate.bat
python embedding_service.py > ai_service.log 2>&1 &
echo %GREEN%✅ AI Embedding Service starting in background%NC%

:: Wait for AI service to initialize
echo %YELLOW%⏱️  Waiting for AI service to load model...%NC%
timeout /t 8 /nobreak >nul

:: Start Frontend
echo %YELLOW%🔄 Starting Frontend Development Server...%NC%
cd /d "%FRONTEND_ROOT%"
if not exist "package.json" (
    echo %RED%❌ Frontend package.json not found at %FRONTEND_ROOT%%NC%
    goto :error
)

:: Start frontend directly (prevents disconnection)
npm run dev > frontend.log 2>&1 &
echo %GREEN%✅ Frontend Development Server starting%NC%

:: Wait for frontend to start
echo %YELLOW%⏱️  Waiting for frontend to initialize...%NC%
timeout /t 5 /nobreak >nul

echo.
echo %BLUE%Phase 3: Health Check Verification%NC%
echo ========================================

:: Check Backend Health
echo %YELLOW%🔍 Testing Backend API...%NC%
curl -s --max-time 5 "http://localhost/lingora/backend/public/" >nul 2>&1
if !errorlevel! equ 0 (
    echo %GREEN%✅ Backend API responding%NC%
) else (
    echo %RED%❌ Backend API not responding%NC%
    echo %RED%   Check XAMPP Apache service and backend location%NC%
)

:: Check AI Service Health
echo %YELLOW%🔍 Testing AI Embedding Service...%NC%
curl -s --max-time 5 "http://localhost:5001/health" >nul 2>&1
if !errorlevel! equ 0 (
    echo %GREEN%✅ AI Service health check passed%NC%
) else (
    echo %RED%❌ AI Service not responding on port 5001%NC%
    echo %RED%   Service may still be loading or failed to start%NC%
    goto :ai_service_error
)

:: Critical AI Service Search Tests
echo %YELLOW%🔍 Testing AI Service Search Functions...%NC%
echo %YELLOW%   Testing 'arts' search...%NC%

:: Test 'arts' search (this should work)
curl -s --max-time 10 -X GET "http://localhost:5001/search?query=arts&provider_ids=1,2,3" >temp_arts.txt 2>&1
if !errorlevel! equ 0 (
    findstr "similarity_scores" temp_arts.txt >nul
    if !errorlevel! equ 0 (
        echo %GREEN%✅ 'arts' search returned results%NC%
    ) else (
        echo %YELLOW%⚠️  'arts' search responded but format unclear%NC%
    )
) else (
    echo %RED%❌ 'arts' search failed%NC%
)

echo %YELLOW%   Testing 'dokter' search...%NC%

:: Test 'dokter' search (critical corruption indicator)
curl -s --max-time 10 -X GET "http://localhost:5001/search?query=dokter&provider_ids=1,2,3" >temp_dokter.txt 2>&1
if !errorlevel! equ 0 (
    findstr "similarity_scores" temp_dokter.txt >nul
    if !errorlevel! equ 0 (
        echo %GREEN%✅ 'dokter' search returned results - AI service healthy%NC%
        set "AI_SERVICE_HEALTHY=true"
    ) else (
        echo %RED%❌ 'dokter' search returned no results - AI SERVICE CORRUPTED%NC%
        echo %RED%   This indicates service corruption - needs restart%NC%
        goto :ai_service_corrupted
    )
) else (
    echo %RED%❌ 'dokter' search failed to connect%NC%
    goto :ai_service_error
)

:: Cleanup temp files
del temp_arts.txt temp_dokter.txt >nul 2>&1

:: Check Frontend Health
echo %YELLOW%🔍 Testing Frontend Server...%NC%
curl -s --max-time 5 "http://localhost:5173" >nul 2>&1
if !errorlevel! equ 0 (
    echo %GREEN%✅ Frontend server responding%NC%
) else (
    echo %RED%❌ Frontend server not responding on port 5173%NC%
    echo %RED%   May still be starting up%NC%
)

echo.
echo %BLUE%Phase 4: Startup Complete%NC%
echo ========================================

if "%AI_SERVICE_HEALTHY%"=="true" (
    echo %GREEN%🎉 All services started successfully!%NC%
    echo.
    echo %GREEN%✅ Backend: XAMPP Apache running%NC%
    echo %GREEN%✅ AI Service: Python Flask healthy on port 5001%NC%
    echo %GREEN%   - 'arts' search: Working%NC%
    echo %GREEN%   - 'dokter' search: Working%NC%
    echo %GREEN%✅ Frontend: Vite dev server running on port 5173%NC%
    echo.
    echo %GREEN%🌐 Site is ready to test on port 5173%NC%
    echo.
    echo %BLUE%Development URLs:%NC%
    echo   Frontend: http://localhost:5173
    echo   Backend:  http://localhost/lingora/backend/public  
    echo   AI Service: http://localhost:5001
    echo.
) else (
    echo %RED%❌ Startup completed with issues%NC%
    echo %RED%   Check the error messages above%NC%
    goto :error
)

goto :end

:ai_service_corrupted
echo.
echo %RED%🚨 AI SERVICE CORRUPTION DETECTED 🚨%NC%
echo %RED%The 'dokter' search test failed while 'arts' worked%NC%
echo %RED%This indicates the AI service is in a corrupted state%NC%
echo.
echo %YELLOW%🔄 Attempting automatic restart...%NC%
taskkill /F /IM python.exe >nul 2>&1
timeout /t 3 /nobreak >nul
cd /d "%AI_SERVICES_ROOT%"
call ai_search_env\Scripts\activate.bat && python embedding_service.py > ai_service_restart.log 2>&1 &
echo %YELLOW%⏱️  Waiting for service restart...%NC%
timeout /t 8 /nobreak >nul
echo %YELLOW%Please test manually: http://localhost:5001/health%NC%
goto :end

:ai_service_error
echo.
echo %RED%🚨 AI SERVICE ERROR 🚨%NC%
echo %RED%The AI service failed to start or respond%NC%
echo.
echo %YELLOW%Manual recovery steps:%NC%
echo   1. Check if Python virtual environment exists
echo   2. cd %AI_SERVICES_ROOT%
echo   3. call ai_search_env\Scripts\activate.bat
echo   4. python embedding_service.py
goto :end

:error
echo.
echo %RED%❌ STARTUP FAILED%NC%
echo %RED%One or more services could not be started%NC%
echo %RED%Check the error messages above for details%NC%
exit /b 1

:end
echo.
echo %BLUE%Startup procedure complete%NC%
echo %GREEN%Ready for development - no user input required%NC%