@echo off
REM Stop Beetz Development Environment Servers

echo.
echo ========================================
echo   STOPPING BEETZ SERVERS
echo ========================================
echo.

echo Stopping Beetz Backend (Port 8001)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo Stopping Beetz Frontend (Port 3001)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo.
echo Stopping command windows...
taskkill /FI "WindowTitle eq Beetz Backend :8001*" /F 2>nul
taskkill /FI "WindowTitle eq Beetz Frontend :3001*" /F 2>nul

echo.
echo ========================================
echo   BEETZ SERVERS STOPPED
echo ========================================
echo.
pause
