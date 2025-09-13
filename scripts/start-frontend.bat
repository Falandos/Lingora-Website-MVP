@echo off
:: Safe Frontend Starter Script
:: This script safely starts the React/Vite development server without environment interference
setlocal EnableDelayedExpansion

:: Color definitions for Windows
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

echo %BLUE%=== Lingora Frontend Development Server Startup ===%NC%
echo.

:: Set frontend path
set "FRONTEND_ROOT=C:\Cursor\Lingora\frontend"

:: Check if frontend directory exists
if not exist "%FRONTEND_ROOT%" (
    echo %RED%❌ Frontend directory not found at %FRONTEND_ROOT%%NC%
    exit /b 1
)

:: Change to frontend directory
cd /d "%FRONTEND_ROOT%"

:: Check if package.json exists
if not exist "package.json" (
    echo %RED%❌ package.json not found in %FRONTEND_ROOT%%NC%
    echo %YELLOW%This doesn't appear to be a Node.js project%NC%
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo %YELLOW%⚠️  node_modules not found, installing dependencies...%NC%
    npm install
    if !errorlevel! neq 0 (
        echo %RED%❌ Failed to install dependencies%NC%
        exit /b 1
    )
)

:: Kill any existing Node.js processes (prevents port conflicts)
echo %YELLOW%🔍 Checking for existing Node.js processes...%NC%
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo %YELLOW%⚠️  Stopping existing Node.js processes to prevent port conflicts...%NC%
    taskkill /F /IM node.exe >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Start frontend development server with proper background execution (Windows safe)
echo %YELLOW%🚀 Starting Frontend Development Server...%NC%
echo %YELLOW%   Server will run on: http://localhost:5173%NC%

:: Use PowerShell to start server in background (safer than batch background methods)
powershell -Command "Start-Process -FilePath 'npm' -ArgumentList 'run','dev' -WindowStyle Hidden -RedirectStandardOutput 'frontend.log' -RedirectStandardError 'frontend_error.log'" -WorkingDirectory "%FRONTEND_ROOT%"

:: Wait for frontend server to initialize
echo %YELLOW%⏱️  Waiting for server initialization...%NC%
timeout /t 10 /nobreak >nul

:: Health check with timeout protection
echo %YELLOW%🔍 Testing frontend server...%NC%
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 8 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ Frontend server responding%NC%
) else (
    echo %YELLOW%⚠️  Frontend server not yet responding (may need more time)%NC%
    echo %YELLOW%   Manual check: http://localhost:5173%NC%
    
    :: Additional check for Vite server startup time
    echo %YELLOW%   Vite servers can take 15-30 seconds to fully start%NC%
    echo %YELLOW%   Check frontend.log for detailed startup information%NC%
)

echo.
echo %GREEN%🎉 Frontend startup complete%NC%
echo %BLUE%📝 Server details:%NC%
echo    - URL: http://localhost:5173
echo    - Development server: Vite
echo    - Logs: frontend.log, frontend_error.log
echo    - Hot reload: Enabled
echo.
exit /b 0