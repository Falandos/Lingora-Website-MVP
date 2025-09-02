@echo off
echo Starting Lingora AI Embedding Service...
echo.

REM Change to the AI services directory
cd /d "%~dp0"

REM Activate virtual environment
call ai_search_env\Scripts\activate.bat

REM Check if activation was successful
if not exist "ai_search_env\Scripts\python.exe" (
    echo ERROR: Virtual environment not found or activated
    echo Please run setup_environment.bat first
    pause
    exit /b 1
)

REM Start the embedding service
echo Starting Flask service on http://localhost:5001
echo Press Ctrl+C to stop the service
echo.

python.exe embedding_service.py

pause