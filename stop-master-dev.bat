@echo off
REM Stop Master Development Environment Servers

echo.
echo ========================================
echo   STOPPING MASTER SERVERS
echo ========================================
echo.

echo Stopping Master Backend (Port 8000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo Stopping Master Frontend (Port 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo.
echo Stopping command windows...
taskkill /FI "WindowTitle eq Master Backend :8000*" /F 2>nul
taskkill /FI "WindowTitle eq Master Frontend :3000*" /F 2>nul

echo.
echo ========================================
echo   MASTER SERVERS STOPPED
echo ========================================
echo.
pause
