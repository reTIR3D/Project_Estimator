@echo off
REM Quick Start Script for Windows
REM Double-click this file to start both backend and frontend

title Engineering Estimation System

echo.
echo ============================================================
echo      ENGINEERING ESTIMATION SYSTEM - QUICK START
echo ============================================================
echo.

REM Check if setup has been run
if not exist "backend\.env" (
    echo [WARNING] System not set up yet!
    echo.
    echo Please run setup_wizard.bat first
    echo.
    pause
    exit /b 1
)

REM Check if Docker is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo.
    echo Please start Docker Desktop and try again
    echo.
    pause
    exit /b 1
)

echo [1/3] Starting Backend (Docker)...
cd backend
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Failed to start backend
    pause
    exit /b 1
)
echo [OK] Backend started
echo.

echo [2/3] Waiting for services to be ready...
timeout /t 5 /nobreak >nul
echo [OK] Services ready
echo.

echo [3/3] Starting Frontend...
cd ..\frontend
start cmd /k "npm run dev"
echo [OK] Frontend starting in new window
echo.

cd ..

echo ============================================================
echo                     SYSTEM STARTED!
echo ============================================================
echo.
echo Backend API:  http://localhost:8000
echo API Docs:     http://localhost:8000/api/docs
echo Frontend:     http://localhost:3000
echo.
echo The frontend will open in a new window
echo Wait a few seconds for it to start...
echo.
echo Press any key to open the browser...
pause >nul

start http://localhost:3000

echo.
echo ============================================================
echo.
echo To stop the system:
echo   1. Close the frontend window (Ctrl+C)
echo   2. Run: cd backend ^&^& docker-compose down
echo.
echo Press any key to exit...
pause >nul