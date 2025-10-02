@echo off
REM Engineering Estimation System - Setup Wizard for Windows
REM ==========================================================

title Engineering Estimation System - Setup Wizard

echo.
echo ============================================================
echo    ENGINEERING ESTIMATION SYSTEM - SETUP WIZARD
echo ============================================================
echo.
echo This will set up the complete system for you...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found! Please install Python 3.11+
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [OK] Python found
echo.

REM Run the Python setup wizard
python setup_wizard.py

if errorlevel 1 (
    echo.
    echo [ERROR] Setup failed!
    pause
    exit /b 1
)

echo.
echo ============================================================
echo                    SETUP COMPLETE!
echo ============================================================
echo.
echo Press any key to exit...
pause >nul