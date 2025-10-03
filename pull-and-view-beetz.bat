@echo off
REM Pull and View Beetz Branch - Quick teammate collaboration script
REM This script pulls the latest beetz changes and opens the beetz version in your browser

echo.
echo ========================================
echo   PULL AND VIEW BEETZ BRANCH
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Checking git status...
git status --short
echo.

echo [2/3] Pulling latest beetz changes...
git pull origin beetz
echo.

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to pull changes!
    echo Please resolve any conflicts and try again.
    pause
    exit /b 1
)

echo [3/3] Showing what changed...
echo.
echo Latest commits on beetz:
git log --oneline -5
echo.

REM Check if beetz frontend is running
curl -s http://localhost:3001/ >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo SUCCESS! Beetz frontend is running on http://localhost:3001
    echo.
    echo Opening beetz version in your browser...
    timeout /t 2 /nobreak >nul
    start http://localhost:3001
    echo.
    echo TIP: Compare with master at http://localhost:3000
) else (
    echo.
    echo NOTE: Beetz frontend is not currently running.
    echo To start beetz environment:
    echo   1. Backend:  cd backend ^&^& python -m uvicorn app.main:app --reload --port 8001
    echo   2. Frontend: cd frontend ^&^& npm run dev
    echo.
    echo Then run this script again to open the browser.
)

echo.
echo ========================================
echo.
pause
