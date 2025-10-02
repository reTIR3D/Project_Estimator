@echo off
REM Automatic Installer for Windows
REM ================================

title Engineering Estimation System - Auto Installer

echo.
echo ============================================================
echo    AUTO INSTALLER - Download and Install Prerequisites
echo ============================================================
echo.
echo This will automatically download and install missing software
echo.

REM Check if Python is available to run the installer
python --version >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Python not found - needed to run auto installer
    echo.
    echo Would you like to download Python manually?
    echo.
    choice /C YN /M "Open Python download page"
    if errorlevel 2 goto :end
    if errorlevel 1 (
        start https://www.python.org/downloads/windows/
        echo.
        echo After installing Python:
        echo 1. Restart this terminal
        echo 2. Run auto_installer.bat again
        echo.
    )
    goto :end
)

REM Run the Python auto-installer
python auto_installer.py

:end
echo.
pause