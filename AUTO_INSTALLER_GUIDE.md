# 🚀 Automatic Installer Guide

## What It Does

The **Automatic Installer** is a powerful tool that:

✅ **Detects your system** (Windows 64-bit/32-bit, Mac, Linux)
✅ **Downloads installers** directly from official sources
✅ **Shows progress bars** during downloads
✅ **Can automatically install** software (where possible)
✅ **Saves installers** for future use

**This eliminates multiple steps - instead of:**
1. Opening a browser
2. Finding the right download page
3. Finding the right version for your system
4. Downloading manually
5. Finding the download
6. Running the installer

**You just:**
1. Run `auto_installer.bat`
2. Choose "A" (Download and install ALL)
3. Wait 5-10 minutes
4. Done! ✅

---

## How to Run It

### Quick Start

**Windows:**
```cmd
auto_installer.bat
```

Or double-click: `auto_installer.bat`

---

## Features

### 1. System Detection

Automatically detects:
- **Operating System**: Windows, Mac, Linux
- **Architecture**: 64-bit or 32-bit
- **Platform Details**: Windows 10/11, etc.

Chooses the correct installer for YOUR system!

### 2. Smart Download

- **Direct downloads** from official sources
- **Progress bars** show download status
- **Resumable** if interrupted (downloads to `downloads/` folder)
- **Verifies** file size

### 3. Automatic Installation

For software that supports it:
- **Python**: Silent install with "Add to PATH" enabled
- **Node.js**: Silent install with default options
- **Docker**: Manual install (requires restart)

### 4. Saved Installers

All downloads saved to:
```
Project Estimation Tool/downloads/
├── python-3.12.1-amd64.exe
├── node-v20.11.0-x64.msi
└── DockerDesktopInstaller.exe
```

**Benefits:**
- Keep for future use
- Reinstall without re-downloading
- Share with other computers
- Offline installation

---

## Usage Options

When you run the auto-installer, you see:

```
What would you like to do?

  A. Download and install ALL missing software
  D. Download ALL (install manually later)
  1-3. Download/install specific software
  O. Open download pages in browser
  N. No, I'll install manually

Your choice:
```

### Option A: Full Automation (Recommended)

**Choice: A**

Does everything for you:
1. Downloads all missing software
2. Runs installers automatically (where supported)
3. Uses best installation options
4. Notifies you when done

**Time:** 10-15 minutes
**User action:** Wait, then restart terminal

**Perfect for:** First-time users who want it easy

### Option D: Download Only

**Choice: D**

Downloads everything but doesn't install:
1. Downloads all installers
2. Saves to `downloads/` folder
3. Shows you where files are
4. You install manually later

**Time:** 5-10 minutes (download time)
**User action:** Run installers when ready

**Perfect for:**
- Users who want control
- Installing on multiple computers
- Review installers first

### Option 1-3: Specific Software

**Choice: 1, 2, or 3**

Download/install just one piece of software:
- Useful if you only need Python, for example
- Saves time and bandwidth

**Perfect for:** Already have some prerequisites

### Option O: Browser Mode

**Choice: O**

Opens official download pages:
- Python.org
- Nodejs.org
- Docker.com

**Perfect for:** Users who prefer manual download from browser

### Option N: Manual

**Choice: N**

Shows links but doesn't do anything:
- You copy/paste URLs
- You download manually
- You install manually

**Perfect for:** Advanced users or specific requirements

---

## What Gets Installed

### Python 3.12.1

**Windows 64-bit:**
- File: `python-3.12.1-amd64.exe`
- Size: ~25 MB
- Options: Add to PATH, include pip
- Silent install: Yes

**Installation command:**
```
python-3.12.1-amd64.exe /passive PrependPath=1 Include_test=0
```

**After install:**
- Python added to PATH automatically
- pip included
- IDLE included
- Documentation included

### Node.js 20.11.0 LTS

**Windows 64-bit:**
- File: `node-v20.11.0-x64.msi`
- Size: ~30 MB
- Options: Add to PATH, include npm
- Silent install: Yes

**Installation command:**
```
msiexec /i node-v20.11.0-x64.msi /passive
```

**After install:**
- Node.js added to PATH
- npm included automatically
- npx included

### Docker Desktop

**Windows:**
- File: `DockerDesktopInstaller.exe`
- Size: ~500 MB (large!)
- Options: Requires manual install
- Silent install: No (needs WSL2)

**Installation:**
- Must be installed manually
- Requires system restart
- Includes Docker Compose
- Includes Docker CLI

**Auto-installer will:**
- Download the installer
- Open it for you
- Show installation notes

---

## Example Session

```
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║        ENGINEERING ESTIMATION SYSTEM                              ║
║        Automatic Installer                                        ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

ℹ Checking for missing software...

System Information:
  OS: Windows
  Architecture: AMD64 (64-bit)
  Platform: Windows-10-10.0.19045-SP0

⚠ Missing 2 software package(s): python, docker

Available installers for your system:

1. Python 3.12.1 (64-bit)
   URL: https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe
   Size: ~50-100 MB
   Notes:
     • Will install with "Add to PATH" enabled
     • Silent installation with recommended options
     • Installation takes 2-3 minutes

2. Docker Desktop
   URL: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
   Size: ~50-100 MB
   Notes:
     • Must be installed manually (requires restart)
     • After install, start Docker Desktop application
     • Wait for it to show "Running" before continuing
     • Includes Docker Compose automatically

What would you like to do?

  A. Download and install ALL missing software
  D. Download ALL (install manually later)
  1-2. Download/install specific software
  O. Open download pages in browser
  N. No, I'll install manually

Your choice: A

══════════════════════════════════════════════════════════════
              Downloading Installers
══════════════════════════════════════════════════════════════

ℹ Downloading python-3.12.1-amd64.exe...
  From: https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe
  To: C:\...\downloads\python-3.12.1-amd64.exe

  [████████████████████████████████████████] 100.0% (25.5/25.5 MB)

✓ Downloaded: python-3.12.1-amd64.exe

ℹ Downloading DockerDesktopInstaller.exe...
  From: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe
  To: C:\...\downloads\DockerDesktopInstaller.exe

  [████████████████████████████████████████] 100.0% (512.3/512.3 MB)

✓ Downloaded: DockerDesktopInstaller.exe

✓ Downloaded 2 installer(s)
ℹ Files saved to: C:\...\downloads

══════════════════════════════════════════════════════════════
              Installing Software
══════════════════════════════════════════════════════════════

Installing: Python 3.12.1 (64-bit)

ℹ Running installer...
  Command: python-3.12.1-amd64.exe /passive PrependPath=1 Include_test=0

⚠ Installation may take a few minutes...
⚠ Please do not close this window

✓ Installation completed!

Installing: Docker Desktop

⚠ This software must be installed manually
ℹ Please run: C:\...\downloads\DockerDesktopInstaller.exe

Open installer now? (y/n) [y]: y

✓ Installer opened

══════════════════════════════════════════════════════════════
              Installation Complete
══════════════════════════════════════════════════════════════

⚠ IMPORTANT: You must restart your terminal/command prompt!

ℹ After restarting:
  1. Run the prerequisite checker to verify
  2. Run the setup wizard
```

---

## After Installation

### Step 1: Restart Terminal

**IMPORTANT:** You must restart your terminal/command prompt!

Why? Newly installed software needs to be in your PATH.

**Windows:**
- Close Command Prompt
- Open a new Command Prompt

### Step 2: Verify Installation

Run the prerequisite checker:
```cmd
check_prerequisites.bat
```

You should see:
```
✓ Python 3.11+: 3.12.1
✓ Node.js 18+: v20.11.0
✓ npm: 10.2.3
✓ Docker: 24.0.7
✓ Docker Compose: 2.23.0

✓ All required software is installed!
```

### Step 3: Run Setup Wizard

Now you're ready!
```cmd
setup_wizard.bat
```

---

## Troubleshooting

### Download Fails

**Problem:** Download interrupted or failed

**Solutions:**
1. Check internet connection
2. Try again (downloads to `downloads/` folder)
3. If file exists, delete it and retry
4. Try Option O (browser download) instead

### Installation Fails

**Problem:** Silent installation doesn't work

**Solutions:**
1. Run installer manually from `downloads/` folder
2. Right-click → "Run as administrator"
3. Follow on-screen instructions
4. Restart terminal after install

### "Python not found" to run auto-installer

**Problem:** Can't run auto_installer.bat because no Python

**Solution:**
1. Install Python first (manually)
2. Download from: https://www.python.org/downloads/
3. Check "Add to PATH" during install
4. Then run auto_installer.bat

### Docker requires manual install

**Problem:** Docker can't be installed silently

**Reason:** Docker Desktop requires:
- WSL2 (Windows Subsystem for Linux)
- System restart
- User acceptance of terms

**Solution:**
- Auto-installer downloads it
- You run it manually
- Follow Docker's installer
- Restart computer when prompted

### Installer says "already installed"

**Problem:** Software already there but not detected

**Solution:**
1. Restart terminal
2. Check PATH environment variable
3. Try running: `python --version` manually
4. If still not found, reinstall with "Add to PATH"

---

## Advanced Features

### Custom Download Location

Edit `auto_installer.py`:
```python
downloads_dir = Path(__file__).parent / "downloads"
```

Change to:
```python
downloads_dir = Path("C:/MyDownloads")
```

### Silent Installation Options

Python options in code:
```python
'install_cmd': 'python-3.12.1-amd64.exe /passive PrependPath=1 Include_test=0'
```

- `/passive`: Silent with progress
- `PrependPath=1`: Add to PATH
- `Include_test=0`: Skip tests (smaller)

Node.js options:
```python
'install_cmd': 'msiexec /i node-v20.11.0-x64.msi /passive'
```

- `/passive`: Silent with progress
- `/quiet`: Completely silent

### Adding New Software

To add more software to auto-installer:

1. Edit `auto_installer.py`
2. Add to `get_installer_urls()`:
```python
installers['newsoftware'] = {
    'name': 'New Software 1.0',
    'url': 'https://example.com/installer.exe',
    'filename': 'installer.exe',
    'install_cmd': 'installer.exe /silent',
    'notes': ['Installation notes here']
}
```

---

## Integration with Other Tools

### With Prerequisite Checker

The prerequisite checker now includes the auto-installer:

```
check_prerequisites.bat
  ↓
[Detects missing: Python, Docker]
  ↓
"What would you like to do?"
  A. Open ALL download pages
  I. Run AUTOMATIC INSTALLER  ← NEW!
  N. No, I'll download manually
  ↓
[User chooses I]
  ↓
Auto-installer launches automatically!
```

### With Setup Wizard

The setup wizard checks prerequisites and can suggest auto-installer:

```
setup_wizard.bat
  ↓
[Checks prerequisites]
  ↓
[Missing: Python]
  ↓
"Would you like to run prerequisite checker?"
  ↓
[Checker offers auto-installer]
  ↓
[Downloads and installs]
  ↓
[Run setup wizard again]
  ↓
[Setup proceeds!]
```

---

## Security Notes

### Download Sources

All downloads from **official sources only**:
- ✅ Python: python.org
- ✅ Node.js: nodejs.org
- ✅ Docker: docker.com

**Never** downloads from third-party mirrors!

### Verification

The auto-installer:
- Uses official URLs
- Shows full download URLs
- Saves files locally
- You can inspect before installing

### Silent Installation

Silent installs use:
- Official installer switches
- Recommended options
- No custom modifications

---

## Summary

The auto-installer makes setup **dramatically easier**:

**Before:**
- Open 3 different websites
- Find correct downloads
- Download manually
- Find downloads folder
- Run each installer
- Configure each one
- Time: 30 minutes

**After:**
- Run auto_installer.bat
- Choose "A"
- Wait
- Time: 10 minutes (mostly download time)

**Result:** User goes from nothing to fully installed in 10-15 minutes with minimal effort!

---

## Files Created

- `auto_installer.py` - Main installer (400+ lines)
- `auto_installer.bat` - Windows launcher
- `downloads/` - Downloaded installers folder (auto-created)

---

**Try it now!**

```cmd
auto_installer.bat
```

Choose "A" and watch it work! 🚀