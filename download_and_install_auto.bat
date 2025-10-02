@echo off
REM Automatic Installer Downloader (No prompts!)
REM =============================================

title Download and Install All Software

echo.
echo ====================================================================
echo    AUTOMATIC DOWNLOAD AND INSTALL
echo ====================================================================
echo.
echo This will automatically:
echo   1. Download all installers
echo   2. Install Python and Node.js
echo   3. Open Docker installer
echo.

REM Create downloads directory
if not exist "downloads" mkdir downloads

echo System: Windows 64-bit
echo.
echo Downloading:
echo   1. Python 3.12.1 (64-bit) - ~25 MB
echo   2. Node.js 20.11.0 LTS (64-bit) - ~30 MB
echo   3. Docker Desktop - ~500 MB
echo.
echo Starting downloads...
echo.

REM Download Python
echo ====================================================================
echo [1/3] Downloading Python 3.12.1...
echo ====================================================================
powershell -Command "Write-Host 'Downloading from: https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe'; Write-Host ''; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe' -OutFile 'downloads\python-3.12.1-amd64.exe'; Write-Host 'Download complete!'"

if exist "downloads\python-3.12.1-amd64.exe" (
    echo [SUCCESS] Downloaded: python-3.12.1-amd64.exe
) else (
    echo [ERROR] Failed to download Python
)
echo.

REM Download Node.js
echo ====================================================================
echo [2/3] Downloading Node.js 20.11.0...
echo ====================================================================
powershell -Command "Write-Host 'Downloading from: https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi'; Write-Host ''; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile 'downloads\node-v20.11.0-x64.msi'; Write-Host 'Download complete!'"

if exist "downloads\node-v20.11.0-x64.msi" (
    echo [SUCCESS] Downloaded: node-v20.11.0-x64.msi
) else (
    echo [ERROR] Failed to download Node.js
)
echo.

REM Download Docker
echo ====================================================================
echo [3/3] Downloading Docker Desktop...
echo ====================================================================
echo This is large (~500 MB) - may take several minutes...
echo.
powershell -Command "Write-Host 'Downloading from: https://desktop.docker.com/win/main/amd64/Docker Desktop Installer.exe'; Write-Host ''; Write-Host 'This may take 5-10 minutes...'; Write-Host ''; $ProgressPreference = 'SilentlyContinue'; Invoke-WebRequest -Uri 'https://desktop.docker.com/win/main/amd64/Docker Desktop Installer.exe' -OutFile 'downloads\DockerDesktopInstaller.exe'; Write-Host 'Download complete!'"

if exist "downloads\DockerDesktopInstaller.exe" (
    echo [SUCCESS] Downloaded: DockerDesktopInstaller.exe
) else (
    echo [ERROR] Failed to download Docker
)
echo.

REM Summary
echo.
echo ====================================================================
echo    Download Summary
echo ====================================================================
echo.

set downloaded=0
set failed=0

if exist "downloads\python-3.12.1-amd64.exe" (
    echo [OK] python-3.12.1-amd64.exe
    set /a downloaded+=1
) else (
    echo [MISSING] python-3.12.1-amd64.exe
    set /a failed+=1
)

if exist "downloads\node-v20.11.0-x64.msi" (
    echo [OK] node-v20.11.0-x64.msi
    set /a downloaded+=1
) else (
    echo [MISSING] node-v20.11.0-x64.msi
    set /a failed+=1
)

if exist "downloads\DockerDesktopInstaller.exe" (
    echo [OK] DockerDesktopInstaller.exe
    set /a downloaded+=1
) else (
    echo [MISSING] DockerDesktopInstaller.exe
    set /a failed+=1
)

echo.
echo Downloaded: %downloaded%/3
if %failed% GTR 0 (
    echo Failed: %failed%/3
    echo.
    echo [WARNING] Some downloads failed - check your internet connection
)
echo.

REM Install if downloads succeeded
if %downloaded% GTR 0 (
    echo ====================================================================
    echo    Installing Software
    echo ====================================================================
    echo.

    REM Install Python
    if exist "downloads\python-3.12.1-amd64.exe" (
        echo [1/3] Installing Python 3.12.1...
        echo.
        echo Command: downloads\python-3.12.1-amd64.exe /passive PrependPath=1 Include_test=0
        echo.
        echo [INFO] Installing with "Add to PATH" enabled
        echo [INFO] This may take 2-3 minutes - please wait...
        echo.
        start /wait downloads\python-3.12.1-amd64.exe /passive PrependPath=1 Include_test=0
        echo.
        echo [SUCCESS] Python installation completed!
        echo.
    )

    REM Install Node.js
    if exist "downloads\node-v20.11.0-x64.msi" (
        echo [2/3] Installing Node.js 20.11.0...
        echo.
        echo Command: msiexec /i downloads\node-v20.11.0-x64.msi /passive
        echo.
        echo [INFO] This may take 2-3 minutes - please wait...
        echo.
        start /wait msiexec /i "%cd%\downloads\node-v20.11.0-x64.msi" /passive
        echo.
        echo [SUCCESS] Node.js installation completed!
        echo.
    )

    REM Docker info
    if exist "downloads\DockerDesktopInstaller.exe" (
        echo [3/3] Docker Desktop...
        echo.
        echo [INFO] Docker requires manual installation
        echo [INFO] Opening Docker installer...
        echo.
        echo [IMPORTANT] Follow these steps:
        echo   1. Accept the license agreement
        echo   2. Use default settings
        echo   3. Restart computer when prompted
        echo   4. After restart, open Docker Desktop
        echo   5. Wait for "Docker Desktop is running"
        echo.
        timeout /t 3 /nobreak >nul
        start downloads\DockerDesktopInstaller.exe
        echo [OK] Docker installer opened
        echo.
    )
)

echo.
echo ====================================================================
echo    INSTALLATION COMPLETE!
echo ====================================================================
echo.
echo [SUCCESS] Python and Node.js installed!
echo [INFO] Docker installer opened (follow instructions)
echo.
echo ====================================================================
echo    IMPORTANT: NEXT STEPS
echo ====================================================================
echo.
echo 1. RESTART YOUR TERMINAL/COMMAND PROMPT
echo    - Close this window
echo    - Open a NEW Command Prompt
echo.
echo 2. Verify installation:
echo    - Run: python --version
echo    - Run: node --version
echo    - Run: npm --version
echo.
echo 3. After Docker installed and running:
echo    - Run: setup_wizard.bat
echo.
echo 4. Start the system:
echo    - Run: START_HERE.bat
echo.
echo ====================================================================
echo.
echo Installers saved to: downloads\
echo You can reinstall anytime from that folder!
echo.
pause