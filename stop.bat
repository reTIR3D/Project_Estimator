@echo off
echo ========================================
echo Project Estimation Tool - Shutdown
echo ========================================
echo.

echo [1/2] Stopping database container...
docker-compose down
echo Database stopped.
echo.

echo [2/3] Stopping server processes...
REM Kill backend server (uvicorn)
taskkill /FI "WINDOWTITLE eq Backend Server*" /T /F >nul 2>&1

REM Kill frontend server (npm)
taskkill /FI "WINDOWTITLE eq Frontend Server*" /T /F >nul 2>&1

echo Servers stopped.
echo.

echo [3/3] Cleaning up ports...
REM Kill any process on port 8000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /PID %%a /F >nul 2>&1

REM Kill any process on port 3000
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1

echo Ports cleaned.
echo.
echo ========================================
echo Shutdown Complete!
echo ========================================
echo.
pause
