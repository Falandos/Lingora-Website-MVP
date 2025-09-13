@echo off
:: Safe Health Check Script
:: This script performs comprehensive health checks without hanging or causing disconnection
setlocal EnableDelayedExpansion

:: Color definitions for Windows
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

echo %BLUE%=== Lingora Services Health Check ===%NC%
echo.

:: Initialize status counters
set /a total_services=0
set /a healthy_services=0

:: Check Backend/XAMPP Health
echo %YELLOW%🔍 Checking Backend (XAMPP)...%NC%
set /a total_services+=1

:: Check Apache process
tasklist /FI "IMAGENAME eq httpd.exe" 2>NUL | find /I /N "httpd.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%  ✅ Apache process running%NC%
    set apache_running=1
) else (
    echo %RED%  ❌ Apache process not found%NC%
    set apache_running=0
)

:: Check MySQL process
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%  ✅ MySQL process running%NC%
    set mysql_running=1
) else (
    echo %RED%  ❌ MySQL process not found%NC%
    set mysql_running=0
)

:: Test backend API endpoint (with safe timeout)
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost/lingora/backend/public/' -TimeoutSec 3 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%  ✅ Backend API responding%NC%
    set backend_api=1
) else (
    echo %RED%  ❌ Backend API not responding%NC%
    set backend_api=0
)

:: Evaluate backend health
if "%apache_running%"=="1" if "%mysql_running%"=="1" if "%backend_api%"=="1" (
    echo %GREEN%✅ Backend: HEALTHY%NC%
    set /a healthy_services+=1
) else (
    echo %RED%❌ Backend: UNHEALTHY%NC%
)

echo.

:: Check AI Service Health
echo %YELLOW%🔍 Checking AI Embedding Service...%NC%
set /a total_services+=1

:: Check Python process
tasklist /FI "IMAGENAME eq python.exe" 2>NUL | find /I /N "python.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%  ✅ Python process running%NC%
    set python_running=1
) else (
    echo %RED%  ❌ Python process not found%NC%
    set python_running=0
)

:: Test AI service health endpoint (with safe timeout)
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://127.0.0.1:5001/health' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%  ✅ AI service health endpoint responding%NC%
    set ai_health=1
) else (
    echo %RED%  ❌ AI service health endpoint not responding%NC%
    set ai_health=0
)

:: Test AI search functionality (critical tests)
if "%ai_health%"=="1" (
    echo %YELLOW%  🧪 Testing search functionality...%NC%
    
    :: Test "arts" search
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://127.0.0.1:5001/search?query=arts&provider_ids=1,2,3' -TimeoutSec 8 -UseBasicParsing; if ($response.Content -like '*similarity_scores*') { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if "%ERRORLEVEL%"=="0" (
        echo %GREEN%  ✅ 'Arts' search working%NC%
        set arts_search=1
    ) else (
        echo %RED%  ❌ 'Arts' search failed%NC%
        set arts_search=0
    )
    
    :: Test "dokter" search (corruption indicator)
    powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://127.0.0.1:5001/search?query=dokter&provider_ids=1,2,3' -TimeoutSec 8 -UseBasicParsing; if ($response.Content -like '*similarity_scores*') { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if "%ERRORLEVEL%"=="0" (
        echo %GREEN%  ✅ 'Dokter' search working%NC%
        set dokter_search=1
    ) else (
        echo %RED%  ❌ 'Dokter' search failed (possible AI service corruption)%NC%
        set dokter_search=0
    )
) else (
    echo %YELLOW%  ⚠️  Skipping search tests (service unreachable)%NC%
    set arts_search=0
    set dokter_search=0
)

:: Evaluate AI service health
if "%python_running%"=="1" if "%ai_health%"=="1" if "%arts_search%"=="1" if "%dokter_search%"=="1" (
    echo %GREEN%✅ AI Service: HEALTHY%NC%
    set /a healthy_services+=1
) else (
    echo %RED%❌ AI Service: UNHEALTHY%NC%
    if "%dokter_search%"=="0" if "%arts_search%"=="1" (
        echo %YELLOW%   🚨 Corruption detected: 'dokter' fails but 'arts' works%NC%
        echo %YELLOW%   Recommendation: Restart AI service%NC%
    )
)

echo.

:: Check Frontend Health
echo %YELLOW%🔍 Checking Frontend Development Server...%NC%
set /a total_services+=1

:: Check Node.js process
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I /N "node.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%  ✅ Node.js process running%NC%
    set node_running=1
) else (
    echo %RED%  ❌ Node.js process not found%NC%
    set node_running=0
)

:: Test frontend server (with safe timeout)
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5173' -TimeoutSec 5 -UseBasicParsing; if ($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
if "%ERRORLEVEL%"=="0" (
    echo %GREEN%  ✅ Frontend server responding%NC%
    set frontend_responding=1
) else (
    echo %RED%  ❌ Frontend server not responding%NC%
    set frontend_responding=0
)

:: Evaluate frontend health
if "%node_running%"=="1" if "%frontend_responding%"=="1" (
    echo %GREEN%✅ Frontend: HEALTHY%NC%
    set /a healthy_services+=1
) else (
    echo %RED%❌ Frontend: UNHEALTHY%NC%
)

echo.

:: Overall Health Summary
echo %BLUE%=== Health Check Summary ===%NC%
echo.
echo Services Status: %healthy_services%/%total_services% healthy

if %healthy_services% equ %total_services% (
    echo %GREEN%🎉 ALL SERVICES HEALTHY%NC%
    echo %GREEN%✅ System ready for development%NC%
    echo.
    echo %BLUE%Access Points:%NC%
    echo   - Frontend: http://localhost:5173
    echo   - Backend API: http://localhost/lingora/backend/public/
    echo   - AI Service: http://127.0.0.1:5001/health
) else (
    echo %RED%⚠️  SOME SERVICES NEED ATTENTION%NC%
    echo.
    echo %YELLOW%Recommended Actions:%NC%
    
    if %healthy_services% lss 1 (
        echo   - Run full startup script: .\scripts\safe-startup.bat
    ) else (
        if "%apache_running%"=="0" (echo   - Start Apache: .\scripts\start-backend.bat)
        if "%mysql_running%"=="0" (echo   - Start MySQL: .\scripts\start-backend.bat)
        if "%python_running%"=="0" (echo   - Start AI service: .\start-ai-service.bat)
        if "%node_running%"=="0" (echo   - Start frontend: .\scripts\start-frontend.bat)
        if "%dokter_search%"=="0" if "%arts_search%"=="1" (echo   - Restart AI service: .\start-ai-service.bat)
    )
)

echo.
exit /b 0
