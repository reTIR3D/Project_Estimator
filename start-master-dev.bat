@echo off
REM Master Branch - Auto-Update and Start Development Environment
REM This script pulls latest changes and starts both backend and frontend servers

echo.
echo ========================================
echo   MASTER DEVELOPMENT ENVIRONMENT
echo ========================================
echo.

cd /d "%~dp0"

REM Pull latest changes
echo [1/4] Pulling latest changes from origin/master...
git fetch origin master 2>nul
git pull origin master 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Successfully updated from GitHub!
) else (
    echo Already up to date or pull not needed.
)
echo.

echo.
echo [2/4] Starting Backend Server (Port 8000)...
start "Master Backend :8000" cmd /k "cd backend && python -m uvicorn app.main:app --reload"

echo.
echo [3/4] Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting Frontend Server (Port 3000)...
start "Master Frontend :3000" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   SERVERS STARTING...
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Master branch (no banner) - Stable production code
echo.
echo Press any key to open frontend in browser...
pause >nul

start http://localhost:3000

echo.
echo Development environment is running!
echo Close the server windows to stop.
echo.
pause
