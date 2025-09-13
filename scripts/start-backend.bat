@echo off
:: Safe Backend (XAMPP) Starter Script
:: This script safely starts only XAMPP services without environment interference
setlocal EnableDelayedExpansion

:: Color definitions for Windows
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

echo %BLUE%=== Lingora Backend (XAMPP) Startup ===%NC%
echo.

:: Set XAMPP path
set "XAMPP_ROOT=C:\xampp"

:: Check if XAMPP directory exists
if not exist "%XAMPP_ROOT%" (
    echo %RED%❌ XAMPP not found at %XAMPP_ROOT%%NC%
    echo %YELLOW%Please ensure XAMPP is installed at the expected location%NC%
    exit /b 1
)

:: Change to XAMPP directory
cd /d "%XAMPP_ROOT%"

:: Start Apache (if not already running)
echo %YELLOW%🔍 Checking Apache status...%NC%
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo %YELLOW%⚠️  Apache already running%NC%
) else (
    echo %YELLOW%🚀 Starting Apache...%NC%
    start /B /MIN "" "%XAMPP_ROOT%\apache\bin\httpd.exe" -D FOREGROUND
    timeout /t 3 /nobreak >nul
    
    :: Verify Apache started
    tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo %GREEN%✅ Apache started successfully%NC%
    ) else (
        echo %RED%❌ Failed to start Apache%NC%
        exit /b 1
    )
)

:: Start MySQL (if not already running)
echo %YELLOW%🔍 Checking MySQL status...%NC%
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo %YELLOW%⚠️  MySQL already running%NC%
) else (
    echo %YELLOW%🚀 Starting MySQL...%NC%
    start /B /MIN "" "%XAMPP_ROOT%\mysql\bin\mysqld.exe" --defaults-file="%XAMPP_ROOT%\mysql\bin\my.ini"
    timeout /t 5 /nobreak >nul
    
    :: Verify MySQL started
    tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
    if "%ERRORLEVEL%"=="0" (
        echo %GREEN%✅ MySQL started successfully%NC%
    ) else (
        echo %RED%❌ Failed to start MySQL%NC%
        exit /b 1
    )
)

:: Quick health check (safe with short timeout)
echo %YELLOW%🔍 Quick health check...%NC%
timeout /t 2 /nobreak >nul

:: Check if backend is responding (with timeout protection)
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost/lingora/backend/public/' -TimeoutSec 3 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ Backend API responding at http://localhost/lingora/backend/public/%NC%
) else (
    echo %YELLOW%⚠️  Backend API not yet responding (may need more time)%NC%
    echo %YELLOW%   Manual check: http://localhost/lingora/backend/public/%NC%
)

echo.
echo %GREEN%🎉 Backend startup complete%NC%
echo %BLUE%📝 Services started:%NC%
echo    - Apache HTTP Server
echo    - MySQL Database Server
echo    - Backend API (Lingora)
echo.
exit /b 0