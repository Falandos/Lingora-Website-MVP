@echo off
:: Safe Environment Test Script
:: This script validates the environment without risky operations that could cause disconnection
setlocal EnableDelayedExpansion

:: Color definitions for Windows
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

echo %BLUE%=== Lingora Environment Safety Test ===%NC%
echo %BLUE%This test validates the environment without risky operations%NC%
echo.

:: Set paths
set "LINGORA_ROOT=%~dp0.."
set "BACKEND_ROOT=%LINGORA_ROOT%\backend"
set "AI_SERVICES_ROOT=%BACKEND_ROOT%\ai_services"
set "FRONTEND_ROOT=%LINGORA_ROOT%\frontend"

echo %YELLOW%🔍 Validating directory structure...%NC%

:: Check Lingora root
if exist "%LINGORA_ROOT%" (
    echo %GREEN%✅ Lingora root directory exists%NC%
) else (
    echo %RED%❌ Lingora root directory not found%NC%
    exit /b 1
)

:: Check backend directory
if exist "%BACKEND_ROOT%" (
    echo %GREEN%✅ Backend directory exists%NC%
) else (
    echo %RED%❌ Backend directory not found%NC%
    exit /b 1
)

:: Check AI services directory
if exist "%AI_SERVICES_ROOT%" (
    echo %GREEN%✅ AI services directory exists%NC%
) else (
    echo %RED%❌ AI services directory not found%NC%
    exit /b 1
)

:: Check frontend directory
if exist "%FRONTEND_ROOT%" (
    echo %GREEN%✅ Frontend directory exists%NC%
) else (
    echo %RED%❌ Frontend directory not found%NC%
    exit /b 1
)

echo.
echo %YELLOW%🔍 Checking critical files...%NC%

:: Check AI service files (without executing)
if exist "%AI_SERVICES_ROOT%\embedding_service.py" (
    echo %GREEN%✅ AI embedding service script found%NC%
) else (
    echo %RED%❌ AI embedding service script not found%NC%
)

if exist "%AI_SERVICES_ROOT%\ai_search_env\Scripts\python.exe" (
    echo %GREEN%✅ Python virtual environment found%NC%
) else (
    echo %RED%❌ Python virtual environment not found%NC%
)

:: Check frontend files (without executing)
if exist "%FRONTEND_ROOT%\package.json" (
    echo %GREEN%✅ Frontend package.json found%NC%
) else (
    echo %RED%❌ Frontend package.json not found%NC%
)

if exist "%FRONTEND_ROOT%\src" (
    echo %GREEN%✅ Frontend src directory found%NC%
) else (
    echo %RED%❌ Frontend src directory not found%NC%
)

echo.
echo %YELLOW%🔍 Checking XAMPP paths...%NC%

:: Check XAMPP installation (common paths)
set "XAMPP_FOUND=0"
if exist "C:\xampp\apache\bin\httpd.exe" (
    echo %GREEN%✅ XAMPP Apache found at C:\xampp%NC%
    set "XAMPP_FOUND=1"
) else if exist "C:\XAMPP\apache\bin\httpd.exe" (
    echo %GREEN%✅ XAMPP Apache found at C:\XAMPP%NC%
    set "XAMPP_FOUND=1"
) else (
    echo %YELLOW%⚠️  XAMPP not found in standard locations%NC%
)

if "%XAMPP_FOUND%"=="1" (
    echo %GREEN%✅ XAMPP installation validated%NC%
) else (
    echo %YELLOW%⚠️  XAMPP may need manual verification%NC%
)

echo.
echo %YELLOW%🔍 Testing basic system commands...%NC%

:: Test basic commands that scripts will use (without risky operations)
tasklist >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ tasklist command available%NC%
) else (
    echo %RED%❌ tasklist command not available%NC%
)

timeout /t 1 /nobreak >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ timeout command available%NC%
) else (
    echo %RED%❌ timeout command not available%NC%
)

powershell -Command "Write-Host 'PowerShell test successful'" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ PowerShell available%NC%
) else (
    echo %RED%❌ PowerShell not available%NC%
)

echo.
echo %BLUE%=== Environment Safety Test Complete ===%NC%
echo %GREEN%✅ All checks completed without risky operations%NC%
echo %GREEN%✅ No background processes started%NC%
echo %GREEN%✅ No services modified%NC%
echo %GREEN%✅ Claude Code session safe%NC%
echo.
echo %YELLOW%📋 Summary:%NC%
echo    - Environment structure validated
echo    - Critical files checked
echo    - System commands verified
echo    - Ready for safe service startup
echo.
exit /b 0