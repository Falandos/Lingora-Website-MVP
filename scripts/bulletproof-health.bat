@echo off
:: Bulletproof Health Monitor Script
:: This script safely monitors service health without causing disconnection
setlocal EnableDelayedExpansion

:: Color definitions for Windows
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "CYAN=[96m"
set "NC=[0m"

echo %BLUE%=== Lingora Services Health Monitor ===%NC%
echo %BLUE%Safe monitoring without disconnection risk%NC%
echo.

:: Track overall health status
set "OVERALL_HEALTH=HEALTHY"

echo %YELLOW%🔍 Monitoring XAMPP Services...%NC%

:: Check Apache (safe method - no process killing)
set "APACHE_STATUS=STOPPED"
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I "httpd.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ Apache HTTP Server: RUNNING%NC%
    set "APACHE_STATUS=RUNNING"
) else (
    echo %RED%❌ Apache HTTP Server: STOPPED%NC%
    set "OVERALL_HEALTH=DEGRADED"
)

:: Check MySQL (safe method - no process killing)
set "MYSQL_STATUS=STOPPED"
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I "mysqld.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ MySQL Database: RUNNING%NC%
    set "MYSQL_STATUS=RUNNING"
) else (
    echo %RED%❌ MySQL Database: STOPPED%NC%
    set "OVERALL_HEALTH=DEGRADED"
)

echo.
echo %YELLOW%🔍 Monitoring AI Embedding Service...%NC%

:: Check AI Service Process (safe method)
set "AI_PROCESS_STATUS=STOPPED"
tasklist /FI "IMAGENAME eq python.exe" 2>NUL | find /I "python.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ Python Process: DETECTED%NC%
    set "AI_PROCESS_STATUS=DETECTED"
) else (
    echo %RED%❌ Python Process: NOT FOUND%NC%
    set "OVERALL_HEALTH=DEGRADED"
)

:: Test AI Service Endpoint (with timeout protection)
set "AI_ENDPOINT_STATUS=OFFLINE"
echo %CYAN%   Testing http://127.0.0.1:5001/health...%NC%
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://127.0.0.1:5001/health' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host 'ONLINE'; exit 0 } else { Write-Host 'OFFLINE'; exit 1 } } catch { Write-Host 'OFFLINE'; exit 1 }" 2>NUL | findstr /C:"ONLINE" >NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ AI Service Endpoint: ONLINE%NC%
    set "AI_ENDPOINT_STATUS=ONLINE"
) else (
    echo %RED%❌ AI Service Endpoint: OFFLINE%NC%
    set "OVERALL_HEALTH=DEGRADED"
)

echo.
echo %YELLOW%🔍 Monitoring Frontend Development Server...%NC%

:: Check Node.js Process (safe method)
set "NODE_PROCESS_STATUS=STOPPED"
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I "node.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ Node.js Process: DETECTED%NC%
    set "NODE_PROCESS_STATUS=DETECTED"
) else (
    echo %RED%❌ Node.js Process: NOT FOUND%NC%
    set "OVERALL_HEALTH=DEGRADED"
)

:: Test Frontend Endpoint (with timeout protection)
set "FRONTEND_ENDPOINT_STATUS=OFFLINE"
echo %CYAN%   Testing http://localhost:5173...%NC%
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host 'ONLINE'; exit 0 } else { Write-Host 'OFFLINE'; exit 1 } } catch { Write-Host 'OFFLINE'; exit 1 }" 2>NUL | findstr /C:"ONLINE" >NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ Frontend Server: ONLINE%NC%
    set "FRONTEND_ENDPOINT_STATUS=ONLINE"
) else (
    echo %RED%❌ Frontend Server: OFFLINE%NC%
    set "OVERALL_HEALTH=DEGRADED"
)

echo.
echo %YELLOW%🔍 Testing Backend API...%NC%

:: Test Backend API (with timeout protection)
set "BACKEND_API_STATUS=OFFLINE"
echo %CYAN%   Testing http://localhost/lingora/backend/public/...%NC%
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost/lingora/backend/public/' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host 'ONLINE'; exit 0 } else { Write-Host 'OFFLINE'; exit 1 } } catch { Write-Host 'OFFLINE'; exit 1 }" 2>NUL | findstr /C:"ONLINE" >NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%✅ Backend API: ONLINE%NC%
    set "BACKEND_API_STATUS=ONLINE"
) else (
    echo %RED%❌ Backend API: OFFLINE%NC%
    set "OVERALL_HEALTH=DEGRADED"
)

echo.
echo %BLUE%=== Health Summary Report ===%NC%

:: Display overall status
if "%OVERALL_HEALTH%"=="HEALTHY" (
    echo %GREEN%🎉 OVERALL STATUS: ALL SYSTEMS HEALTHY%NC%
) else (
    echo %YELLOW%⚠️  OVERALL STATUS: SOME SERVICES NEED ATTENTION%NC%
)

echo.
echo %CYAN%📊 Detailed Service Status:%NC%
echo    🌐 Apache HTTP Server: %APACHE_STATUS%
echo    🗄️  MySQL Database: %MYSQL_STATUS%
echo    🤖 AI Process: %AI_PROCESS_STATUS%
echo    🔗 AI Endpoint: %AI_ENDPOINT_STATUS%
echo    ⚛️  Node.js Process: %NODE_PROCESS_STATUS%
echo    🚀 Frontend Server: %FRONTEND_ENDPOINT_STATUS%
echo    🔧 Backend API: %BACKEND_API_STATUS%

echo.
echo %YELLOW%📋 Quick Actions:%NC%
if "%APACHE_STATUS%"=="STOPPED" echo    • Start XAMPP Apache
if "%MYSQL_STATUS%"=="STOPPED" echo    • Start XAMPP MySQL
if "%AI_ENDPOINT_STATUS%"=="OFFLINE" echo    • Start AI service: .\scripts\start-ai-service.bat
if "%FRONTEND_ENDPOINT_STATUS%"=="OFFLINE" echo    • Start frontend: .\scripts\start-frontend.bat
if "%BACKEND_API_STATUS%"=="OFFLINE" echo    • Check XAMPP and backend configuration

echo.
echo %BLUE%=== Safe Health Check Complete ===%NC%
echo %GREEN%✅ No risky operations performed%NC%
echo %GREEN%✅ No services modified%NC%
echo %GREEN%✅ Claude Code session safe%NC%
echo.

:: Set exit code based on overall health
if "%OVERALL_HEALTH%"=="HEALTHY" (
    exit /b 0
) else (
    exit /b 1
)