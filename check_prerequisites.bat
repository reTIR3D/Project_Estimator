@echo off
REM Prerequisite Checker for Windows
REM =================================

title Engineering Estimation System - Prerequisite Checker

echo.
echo ============================================================
echo    PREREQUISITE CHECKER
echo ============================================================
echo.
echo Scanning your system for required software...
echo.

REM Try to run with Python
python check_prerequisites.py
if errorlevel 1 (
    echo.
    echo [ERROR] Python may not be installed correctly
    echo.
    echo Please download Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
)

echo.
pause