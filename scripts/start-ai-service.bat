@echo off
:: Safe AI Service Starter Script
:: This script safely starts the AI embedding service without environment interference
setlocal EnableDelayedExpansion

:: Color definitions for Windows
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

echo %BLUE%=== Lingora AI Embedding Service Startup ===%NC%
echo.

:: Set paths
set "AI_SERVICES_ROOT=C:\xampp\htdocs\lingora\backend\ai_services"
set "PYTHON_EXE=%AI_SERVICES_ROOT%\ai_search_env\Scripts\python.exe"

:: Check if AI services directory exists
if not exist "%AI_SERVICES_ROOT%" (
    echo %RED%❌ AI services directory not found at %AI_SERVICES_ROOT%%NC%
    exit /b 1
)

:: Check if virtual environment exists
if not exist "%PYTHON_EXE%" (
    echo %RED%❌ Python virtual environment not found%NC%
    echo %YELLOW%Expected: %PYTHON_EXE%%NC%
    echo %YELLOW%Please ensure the virtual environment is created%NC%
    exit /b 1
)

:: Change to AI services directory
cd /d "%AI_SERVICES_ROOT%"

:: Check if embedding_service.py exists
if not exist "embedding_service.py" (
    echo %RED%❌ embedding_service.py not found in %AI_SERVICES_ROOT%%NC%
    exit /b 1
)

:: Kill any existing Python processes (prevents conflicts)
echo %YELLOW%🔍 Checking for existing Python processes...%NC%
tasklist /FI "IMAGENAME eq python.exe" 2>NUL | find /I /N "python.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo %YELLOW%⚠️  Stopping existing Python processes to prevent conflicts...%NC%
    taskkill /F /IM python.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Start AI service with proper background execution (Windows safe)
echo %YELLOW%🚀 Starting AI Embedding Service...%NC%
echo %YELLOW%   Service will run on: http://127.0.0.1:5001%NC%

:: Use PowerShell to start service in background (safer than batch background methods)
powershell -Command "Start-Process -FilePath '%PYTHON_EXE%' -ArgumentList 'embedding_service.py' -WindowStyle Hidden -RedirectStandardOutput 'ai_service.log' -RedirectStandardError 'ai_service_error.log'"

:: Wait for service to initialize
echo %YELLOW%⏱️  Waiting for service initialization...%NC%
timeout /t 8 /nobreak >nul

:: Health check with timeout protection
echo %YELLOW%🔍 Testing AI service health...%NC%
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://127.0.0.1:5001/health' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ AI service health check passed%NC%
) else (
    echo %YELLOW%⚠️  AI service not yet responding (may need more time)%NC%
    echo %YELLOW%   Manual check: http://127.0.0.1:5001/health%NC%
)

echo.
echo %GREEN%🎉 AI service startup complete%NC%
echo %BLUE%📝 Service details:%NC%
echo    - Endpoint: http://127.0.0.1:5001
echo    - Health check: http://127.0.0.1:5001/health
echo    - Search endpoint: http://127.0.0.1:5001/search
echo    - Logs: ai_service.log, ai_service_error.log
echo.
exit /b 0