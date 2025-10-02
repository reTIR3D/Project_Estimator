@echo off
REM Simple Installer Downloader (No Python Required!)
REM ==================================================

title Download All Installers

echo.
echo ====================================================================
echo    DOWNLOAD ALL INSTALLERS
echo ====================================================================
echo.
echo This will download all required installers to the downloads\ folder
echo No Python required!
echo.

REM Create downloads directory
if not exist "downloads" mkdir downloads

echo System detected: Windows 64-bit
echo.
echo Will download:
echo   1. Python 3.12.1 (64-bit) - ~25 MB
echo   2. Node.js 20.11.0 LTS (64-bit) - ~30 MB
echo   3. Docker Desktop - ~500 MB
echo.
echo Total: ~555 MB
echo Time: 10-20 minutes depending on connection
echo.

set /p continue="Continue? (y/n) [y]: "
if /i "%continue%"=="n" (
    echo Cancelled
    pause
    exit /b 0
)

echo.
echo ====================================================================
echo    Downloading Installers
echo ====================================================================
echo.

REM Download Python
echo [1/3] Downloading Python 3.12.1...
echo URL: https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe
echo.
powershell -Command "& {$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe' -OutFile 'downloads\python-3.12.1-amd64.exe'}"

if exist "downloads\python-3.12.1-amd64.exe" (
    echo [OK] Downloaded: python-3.12.1-amd64.exe
) else (
    echo [ERROR] Failed to download Python
)
echo.

REM Download Node.js
echo [2/3] Downloading Node.js 20.11.0...
echo URL: https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi
echo.
powershell -Command "& {$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile 'downloads\node-v20.11.0-x64.msi'}"

if exist "downloads\node-v20.11.0-x64.msi" (
    echo [OK] Downloaded: node-v20.11.0-x64.msi
) else (
    echo [ERROR] Failed to download Node.js
)
echo.

REM Download Docker
echo [3/3] Downloading Docker Desktop...
echo URL: https://desktop.docker.com/win/main/amd64/Docker Desktop Installer.exe
echo This is large (~500 MB) - may take several minutes...
echo.
powershell -Command "& {$ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker Desktop Installer.exe' -OutFile 'downloads\DockerDesktopInstaller.exe'}"

if exist "downloads\DockerDesktopInstaller.exe" (
    echo [OK] Downloaded: DockerDesktopInstaller.exe
) else (
    echo [ERROR] Failed to download Docker
)
echo.

REM Summary
echo ====================================================================
echo    Download Complete!
echo ====================================================================
echo.
echo Installers saved to: downloads\
echo.

if exist "downloads\python-3.12.1-amd64.exe" (
    echo [OK] python-3.12.1-amd64.exe
) else (
    echo [MISSING] python-3.12.1-amd64.exe
)

if exist "downloads\node-v20.11.0-x64.msi" (
    echo [OK] node-v20.11.0-x64.msi
) else (
    echo [MISSING] node-v20.11.0-x64.msi
)

if exist "downloads\DockerDesktopInstaller.exe" (
    echo [OK] DockerDesktopInstaller.exe
) else (
    echo [MISSING] DockerDesktopInstaller.exe
)

echo.
echo ====================================================================
echo    Next Steps
echo ====================================================================
echo.
echo 1. Run the installers from downloads\ folder:
echo.
echo    a. python-3.12.1-amd64.exe
echo       - Check "Add Python to PATH"
echo       - Use recommended settings
echo.
echo    b. node-v20.11.0-x64.msi
echo       - Use default settings
echo.
echo    c. DockerDesktopInstaller.exe
echo       - Follow installer instructions
echo       - Restart computer when prompted
echo.
echo 2. After all installed, restart terminal
echo.
echo 3. Run: setup_wizard.bat
echo.
echo 4. Run: START_HERE.bat
echo.
echo ====================================================================
echo.

set /p install="Would you like to start installing now? (y/n) [y]: "
if /i "%install%"=="n" (
    echo.
    echo You can install later from the downloads\ folder
    echo.
    pause
    exit /b 0
)

echo.
echo ====================================================================
echo    Installing Software
echo ====================================================================
echo.

REM Install Python silently
if exist "downloads\python-3.12.1-amd64.exe" (
    echo [1/3] Installing Python...
    echo Command: downloads\python-3.12.1-amd64.exe /passive PrependPath=1 Include_test=0
    echo.
    echo This may take 2-3 minutes...
    echo Please wait...
    echo.
    start /wait downloads\python-3.12.1-amd64.exe /passive PrependPath=1 Include_test=0
    echo [OK] Python installation completed!
    echo.
)

REM Install Node.js silently
if exist "downloads\node-v20.11.0-x64.msi" (
    echo [2/3] Installing Node.js...
    echo Command: msiexec /i downloads\node-v20.11.0-x64.msi /passive
    echo.
    echo This may take 2-3 minutes...
    echo Please wait...
    echo.
    start /wait msiexec /i "%cd%\downloads\node-v20.11.0-x64.msi" /passive
    echo [OK] Node.js installation completed!
    echo.
)

REM Install Docker (manual)
if exist "downloads\DockerDesktopInstaller.exe" (
    echo [3/3] Docker requires manual installation...
    echo.
    echo Opening Docker installer...
    echo Please follow the on-screen instructions
    echo.
    set /p opendocker="Open Docker installer now? (y/n) [y]: "
    if /i not "%opendocker%"=="n" (
        start downloads\DockerDesktopInstaller.exe
        echo [OK] Docker installer opened
    )
)

echo.
echo ====================================================================
echo    Installation Complete!
echo ====================================================================
echo.
echo IMPORTANT: You must restart your terminal/command prompt!
echo.
echo After restarting:
echo   1. Close this window
echo   2. Open a NEW Command Prompt
echo   3. Run: setup_wizard.bat
echo   4. Then run: START_HERE.bat
echo.
echo ====================================================================
echo.
pause