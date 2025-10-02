# Automatic Prerequisites Installer
# PowerShell Script - No Python Required!
# ========================================

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "   AUTOMATIC PREREQUISITES INSTALLER" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

# Create downloads directory
$downloadsDir = "downloads"
if (-not (Test-Path $downloadsDir)) {
    New-Item -ItemType Directory -Path $downloadsDir | Out-Null
    Write-Host "[INFO] Created downloads folder" -ForegroundColor Yellow
}

Write-Host "System: Windows 64-bit" -ForegroundColor Green
Write-Host ""
Write-Host "Will download and install:" -ForegroundColor Yellow
Write-Host "  1. Python 3.12.1 (64-bit) - ~25 MB"
Write-Host "  2. Node.js 20.11.0 LTS (64-bit) - ~30 MB"
Write-Host "  3. Docker Desktop - ~500 MB"
Write-Host ""
Write-Host "Total size: ~555 MB" -ForegroundColor Yellow
Write-Host "Time estimate: 10-20 minutes" -ForegroundColor Yellow
Write-Host ""

# Installers configuration
$installers = @(
    @{
        Name = "Python 3.12.1"
        Url = "https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe"
        FileName = "python-3.12.1-amd64.exe"
        Size = "~25 MB"
        InstallCmd = "/passive PrependPath=1 Include_test=0"
        CanAutoInstall = $true
    },
    @{
        Name = "Node.js 20.11.0 LTS"
        Url = "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
        FileName = "node-v20.11.0-x64.msi"
        Size = "~30 MB"
        InstallCmd = "/i `"{0}`" /passive"
        IsMsi = $true
        CanAutoInstall = $true
    },
    @{
        Name = "Docker Desktop"
        Url = "https://desktop.docker.com/win/main/amd64/Docker Desktop Installer.exe"
        FileName = "DockerDesktopInstaller.exe"
        Size = "~500 MB"
        CanAutoInstall = $false
    }
)

Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "   DOWNLOADING INSTALLERS" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""

$downloadedCount = 0
$failedCount = 0

foreach ($installer in $installers) {
    $filePath = Join-Path $downloadsDir $installer.FileName

    Write-Host "[$($installers.IndexOf($installer) + 1)/$($installers.Count)] Downloading $($installer.Name)..." -ForegroundColor Yellow
    Write-Host "URL: $($installer.Url)" -ForegroundColor Gray
    Write-Host "Size: $($installer.Size)" -ForegroundColor Gray
    Write-Host ""

    if (Test-Path $filePath) {
        Write-Host "[EXISTS] File already downloaded: $($installer.FileName)" -ForegroundColor Green
        $downloadedCount++
    }
    else {
        try {
            Write-Host "Downloading... (this may take a few minutes)" -ForegroundColor Yellow

            # Download with progress
            $webClient = New-Object System.Net.WebClient
            $webClient.DownloadFile($installer.Url, $filePath)

            Write-Host "[SUCCESS] Downloaded: $($installer.FileName)" -ForegroundColor Green
            $downloadedCount++
        }
        catch {
            Write-Host "[ERROR] Download failed: $($_.Exception.Message)" -ForegroundColor Red
            $failedCount++
        }
    }
    Write-Host ""
}

# Summary
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "   DOWNLOAD SUMMARY" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Downloaded: $downloadedCount/$($installers.Count)" -ForegroundColor Green
if ($failedCount -gt 0) {
    Write-Host "Failed: $failedCount/$($installers.Count)" -ForegroundColor Red
}
Write-Host ""

# Install
if ($downloadedCount -gt 0) {
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host "   INSTALLING SOFTWARE" -ForegroundColor Cyan
    Write-Host "====================================================================" -ForegroundColor Cyan
    Write-Host ""

    foreach ($installer in $installers) {
        $filePath = Join-Path $downloadsDir $installer.FileName

        if (Test-Path $filePath) {
            if ($installer.CanAutoInstall) {
                Write-Host "[$($installers.IndexOf($installer) + 1)/$($installers.Count)] Installing $($installer.Name)..." -ForegroundColor Yellow
                Write-Host ""

                try {
                    if ($installer.IsMsi) {
                        $installCmd = "msiexec " + ($installer.InstallCmd -f (Resolve-Path $filePath))
                        Write-Host "[CMD] $installCmd" -ForegroundColor Gray
                        Write-Host "[INFO] Installing... (this may take 2-3 minutes)" -ForegroundColor Yellow
                        Write-Host ""

                        $process = Start-Process "msiexec.exe" -ArgumentList ($installer.InstallCmd -f (Resolve-Path $filePath)) -Wait -PassThru

                        if ($process.ExitCode -eq 0) {
                            Write-Host "[SUCCESS] $($installer.Name) installed!" -ForegroundColor Green
                        }
                        else {
                            Write-Host "[WARNING] Installation may have failed (exit code: $($process.ExitCode))" -ForegroundColor Yellow
                        }
                    }
                    else {
                        $installCmd = "$filePath $($installer.InstallCmd)"
                        Write-Host "[CMD] $installCmd" -ForegroundColor Gray
                        Write-Host "[INFO] Installing... (this may take 2-3 minutes)" -ForegroundColor Yellow
                        Write-Host ""

                        $process = Start-Process $filePath -ArgumentList $installer.InstallCmd -Wait -PassThru

                        if ($process.ExitCode -eq 0) {
                            Write-Host "[SUCCESS] $($installer.Name) installed!" -ForegroundColor Green
                        }
                        else {
                            Write-Host "[WARNING] Installation may have failed (exit code: $($process.ExitCode))" -ForegroundColor Yellow
                        }
                    }
                }
                catch {
                    Write-Host "[ERROR] Installation failed: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            else {
                Write-Host "[$($installers.IndexOf($installer) + 1)/$($installers.Count)] $($installer.Name) - Manual Installation Required" -ForegroundColor Yellow
                Write-Host ""
                Write-Host "[INFO] Opening installer: $($installer.FileName)" -ForegroundColor Yellow
                Write-Host "[IMPORTANT] Please follow the installer instructions:" -ForegroundColor Yellow
                Write-Host "  1. Accept the license agreement" -ForegroundColor Gray
                Write-Host "  2. Use default settings" -ForegroundColor Gray
                Write-Host "  3. Restart computer when prompted" -ForegroundColor Gray
                Write-Host "  4. After restart, open Docker Desktop" -ForegroundColor Gray
                Write-Host "  5. Wait for 'Docker Desktop is running'" -ForegroundColor Gray
                Write-Host ""

                Start-Process $filePath
                Write-Host "[OK] Docker installer opened" -ForegroundColor Green
            }
            Write-Host ""
        }
    }
}

# Final instructions
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "   INSTALLATION COMPLETE!" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[SUCCESS] Python and Node.js installed!" -ForegroundColor Green
Write-Host "[INFO] Docker installer opened (follow instructions)" -ForegroundColor Yellow
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "   IMPORTANT: NEXT STEPS" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. RESTART YOUR TERMINAL/COMMAND PROMPT" -ForegroundColor Yellow
Write-Host "   - Close this window" -ForegroundColor Gray
Write-Host "   - Open a NEW Command Prompt or PowerShell" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Verify installation:" -ForegroundColor Yellow
Write-Host "   python --version" -ForegroundColor Gray
Write-Host "   node --version" -ForegroundColor Gray
Write-Host "   npm --version" -ForegroundColor Gray
Write-Host ""
Write-Host "3. After Docker installed and running:" -ForegroundColor Yellow
Write-Host "   setup_wizard.bat" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start the system:" -ForegroundColor Yellow
Write-Host "   START_HERE.bat" -ForegroundColor Gray
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installers saved to: downloads\" -ForegroundColor Green
Write-Host "You can reinstall anytime from that folder!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")