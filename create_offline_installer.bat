@echo off
REM Create Offline Installer Package
REM ==================================

title Create Offline Installer Package

echo.
echo ====================================================================
echo    CREATE OFFLINE INSTALLER PACKAGE
echo ====================================================================
echo.
echo This will download all required installers and create a portable
echo offline package that can be used without internet connection.
echo.
echo Package will be created at: offline_installer\
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo.
    echo You need Python to create the offline package.
    echo Download from: https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo [OK] Python found
echo.

REM Run the offline package creator
python create_offline_installer.py

if errorlevel 1 (
    echo.
    echo [ERROR] Package creation failed!
    pause
    exit /b 1
)

echo.
echo ====================================================================
echo                OFFLINE PACKAGE CREATED!
echo ====================================================================
echo.
pause