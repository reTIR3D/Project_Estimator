#!/usr/bin/env python3
"""
Create Offline Installer Package
=================================

This script creates a complete offline installer package that:
1. Downloads all required installers (Python, Node.js, Docker)
2. Packages them with the setup wizard
3. Creates a single-run installer that works offline
4. Can be copied to USB drives or other computers

Usage:
    python create_offline_installer.py

The result is a 'offline_installer/' folder containing everything needed.
"""

import os
import sys
import platform
import subprocess
import urllib.request
import shutil
from pathlib import Path


class Colors:
    """ANSI color codes for terminal output"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'


def print_header(text):
    """Print a formatted header"""
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(70)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'=' * 70}{Colors.ENDC}\n")


def print_success(text):
    """Print success message"""
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")


def print_error(text):
    """Print error message"""
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")


def print_info(text):
    """Print info message"""
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")


def print_warning(text):
    """Print warning message"""
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")


def get_system_info():
    """Detect system information"""
    system = platform.system()
    machine = platform.machine()
    is_64bit = sys.maxsize > 2**32

    return {
        'os': system,
        'machine': machine,
        'is_64bit': is_64bit,
        'platform': platform.platform()
    }


def get_installer_urls():
    """Get installer URLs based on system"""
    system_info = get_system_info()
    installers = {}

    if system_info['os'] == 'Windows':
        if system_info['is_64bit']:
            installers['python'] = {
                'name': 'Python 3.12.1 (64-bit)',
                'url': 'https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe',
                'filename': 'python-3.12.1-amd64.exe',
                'size': '~25 MB'
            }
            installers['nodejs'] = {
                'name': 'Node.js 20.11.0 LTS (64-bit)',
                'url': 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi',
                'filename': 'node-v20.11.0-x64.msi',
                'size': '~30 MB'
            }
        else:
            installers['python'] = {
                'name': 'Python 3.12.1 (32-bit)',
                'url': 'https://www.python.org/ftp/python/3.12.1/python-3.12.1.exe',
                'filename': 'python-3.12.1.exe',
                'size': '~25 MB'
            }
            installers['nodejs'] = {
                'name': 'Node.js 20.11.0 LTS (32-bit)',
                'url': 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x86.msi',
                'filename': 'node-v20.11.0-x86.msi',
                'size': '~30 MB'
            }

        installers['docker'] = {
            'name': 'Docker Desktop',
            'url': 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
            'filename': 'DockerDesktopInstaller.exe',
            'size': '~500 MB'
        }

    elif system_info['os'] == 'Darwin':  # macOS
        if 'arm' in system_info['machine'].lower():
            installers['python'] = {
                'name': 'Python 3.12.1 (Apple Silicon)',
                'url': 'https://www.python.org/ftp/python/3.12.1/python-3.12.1-macos11.pkg',
                'filename': 'python-3.12.1-macos11.pkg',
                'size': '~40 MB'
            }
            installers['nodejs'] = {
                'name': 'Node.js 20.11.0 LTS (Apple Silicon)',
                'url': 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-darwin-arm64.tar.gz',
                'filename': 'node-v20.11.0-darwin-arm64.tar.gz',
                'size': '~40 MB'
            }
            installers['docker'] = {
                'name': 'Docker Desktop (Apple Silicon)',
                'url': 'https://desktop.docker.com/mac/main/arm64/Docker.dmg',
                'filename': 'Docker.dmg',
                'size': '~500 MB'
            }
        else:
            installers['python'] = {
                'name': 'Python 3.12.1 (Intel)',
                'url': 'https://www.python.org/ftp/python/3.12.1/python-3.12.1-macos11.pkg',
                'filename': 'python-3.12.1-macos11.pkg',
                'size': '~40 MB'
            }
            installers['nodejs'] = {
                'name': 'Node.js 20.11.0 LTS (Intel)',
                'url': 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-darwin-x64.tar.gz',
                'filename': 'node-v20.11.0-darwin-x64.tar.gz',
                'size': '~40 MB'
            }
            installers['docker'] = {
                'name': 'Docker Desktop (Intel)',
                'url': 'https://desktop.docker.com/mac/main/amd64/Docker.dmg',
                'filename': 'Docker.dmg',
                'size': '~500 MB'
            }

    else:  # Linux
        print_warning("Linux detected - package managers recommended for installation")
        print_info("This script will create a guide instead of downloading installers")

    return installers


def download_file(url, filename, download_dir):
    """Download a file with progress indication"""
    filepath = download_dir / filename

    if filepath.exists():
        print_info(f"File already exists: {filename}")
        response = input(f"{Colors.OKCYAN}Re-download? (y/n) [n]: {Colors.ENDC}").strip().lower()
        if response != 'y':
            print_success(f"Using existing: {filename}")
            return True

    print_info(f"Downloading {filename}...")
    print_info(f"From: {url}")
    print_info(f"To: {filepath}")
    print()

    try:
        def reporthook(block_num, block_size, total_size):
            """Progress callback"""
            if total_size > 0:
                downloaded = block_num * block_size
                percent = min(downloaded * 100 / total_size, 100)
                downloaded_mb = downloaded / (1024 * 1024)
                total_mb = total_size / (1024 * 1024)

                bar_length = 40
                filled = int(bar_length * downloaded / total_size)
                bar = '█' * filled + '░' * (bar_length - filled)

                print(f"\r  [{bar}] {percent:.1f}% ({downloaded_mb:.1f}/{total_mb:.1f} MB)", end='')

        urllib.request.urlretrieve(url, filepath, reporthook=reporthook)
        print()  # New line after progress
        print_success(f"Downloaded: {filename}")
        return True

    except Exception as e:
        print()
        print_error(f"Download failed: {e}")
        return False


def create_offline_package():
    """Create the offline installer package"""
    print_header("OFFLINE INSTALLER PACKAGE CREATOR")

    # Get system info
    system_info = get_system_info()
    print_info("System Information:")
    print(f"  OS: {system_info['os']}")
    print(f"  Architecture: {system_info['machine']} ({'64-bit' if system_info['is_64bit'] else '32-bit'})")
    print(f"  Platform: {system_info['platform']}")
    print()

    # Create offline installer directory
    project_root = Path(__file__).parent
    offline_dir = project_root / "offline_installer"
    installers_dir = offline_dir / "installers"

    print_info(f"Creating offline installer package at: {offline_dir}")
    offline_dir.mkdir(exist_ok=True)
    installers_dir.mkdir(exist_ok=True)

    # Get installer URLs
    installers = get_installer_urls()

    if not installers:
        print_warning("No installers available for this platform")
        return False

    print()
    print_info(f"Will download {len(installers)} installer(s):")
    for key, info in installers.items():
        print(f"  • {info['name']} ({info['size']})")
    print()

    total_size_estimate = sum([
        25 if 'python' in key else 30 if 'nodejs' in key else 500
        for key in installers.keys()
    ])

    print_warning(f"Total download size: ~{total_size_estimate} MB")
    print_warning("This may take 10-20 minutes depending on your connection")
    print()

    response = input(f"{Colors.OKCYAN}Continue? (y/n) [y]: {Colors.ENDC}").strip().lower()
    if response == 'n':
        print_info("Cancelled")
        return False

    # Download all installers
    print_header("Downloading Installers")

    downloaded = []
    failed = []

    for key, info in installers.items():
        if download_file(info['url'], info['filename'], installers_dir):
            downloaded.append(info['filename'])
        else:
            failed.append(info['filename'])
        print()

    # Summary
    print_header("Download Summary")

    if downloaded:
        print_success(f"Successfully downloaded {len(downloaded)} installer(s):")
        for filename in downloaded:
            print(f"  ✓ {filename}")

    if failed:
        print()
        print_error(f"Failed to download {len(failed)} installer(s):")
        for filename in failed:
            print(f"  ✗ {filename}")

    # Copy setup files
    print()
    print_info("Copying setup files to offline package...")

    files_to_copy = [
        'setup_wizard.py',
        'setup_wizard.bat',
        'setup_wizard.sh',
        'check_prerequisites.py',
        'check_prerequisites.bat',
        'check_prerequisites.sh',
        'START_HERE.bat',
        'START_HERE.sh',
        'README.md',
        'SETUP_GUIDE.md',
        'QUICKSTART.md',
    ]

    for filename in files_to_copy:
        src = project_root / filename
        if src.exists():
            dst = offline_dir / filename
            shutil.copy2(src, dst)
            print(f"  ✓ Copied: {filename}")

    # Create offline installer runner
    print()
    print_info("Creating offline installer runner...")

    create_offline_runner(offline_dir, installers_dir, installers)

    # Create README
    create_offline_readme(offline_dir, installers)

    # Final summary
    print()
    print_header("OFFLINE PACKAGE READY!")

    print_success(f"Package created at: {offline_dir}")
    print()
    print_info("Package contents:")
    print(f"  • installers/ - All downloaded installers")
    print(f"  • INSTALL_OFFLINE.bat - Run this to install everything")
    print(f"  • OFFLINE_README.md - Instructions")
    print(f"  • Setup and start scripts")
    print()
    print_info("To use:")
    print(f"  1. Copy entire 'offline_installer' folder to target computer")
    print(f"  2. Run INSTALL_OFFLINE.bat")
    print(f"  3. Follow on-screen instructions")
    print()
    print_success("You can now use this package on any computer without internet!")

    return True


def create_offline_runner(offline_dir, installers_dir, installers):
    """Create the offline installer runner script"""

    # Python script
    runner_py = offline_dir / "install_offline.py"

    runner_content = f'''#!/usr/bin/env python3
"""
Offline Installer Runner
========================

Installs all required software from pre-downloaded installers.
No internet connection required!
"""

import os
import sys
import subprocess
from pathlib import Path


def run_command(command):
    """Run a command and return success status"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=300
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)


def print_header(text):
    print("\\n" + "=" * 70)
    print(text.center(70))
    print("=" * 70 + "\\n")


def install_from_offline_package():
    """Install all software from offline package"""
    print_header("OFFLINE INSTALLER")

    installers_dir = Path(__file__).parent / "installers"

    if not installers_dir.exists():
        print("[ERROR] Installers directory not found!")
        print(f"Expected: {{installers_dir}}")
        return False

    print("[INFO] Installing from offline package...")
    print(f"[INFO] Installers location: {{installers_dir}}\\n")

    # Check what's already installed
    checks = {{
        'python': ['python', '--version'],
        'node': ['node', '--version'],
        'npm': ['npm', '--version'],
        'docker': ['docker', '--version']
    }}

    installed = []
    missing = []

    for name, command in checks.items():
        success, stdout, stderr = run_command(f"{{command[0]}} {{command[1]}}")
        if success and stdout:
            installed.append(name)
            print(f"[OK] {{name}} already installed")
        else:
            missing.append(name)

    if not missing:
        print("\\n[SUCCESS] All software already installed!")
        return True

    print(f"\\n[INFO] Will install: {{', '.join(missing)}}\\n")

    # Install Python
    if 'python' in missing:
        python_installers = list(installers_dir.glob("python-*.exe")) + list(installers_dir.glob("python-*.pkg"))
        if python_installers:
            print("[INFO] Installing Python...")
            installer = python_installers[0]
            if installer.suffix == '.exe':
                cmd = f'"{{installer}}" /passive PrependPath=1 Include_test=0'
            else:
                cmd = f'sudo installer -pkg "{{installer}}" -target /'

            print(f"[CMD] {{cmd}}")
            success, stdout, stderr = run_command(cmd)
            if success:
                print("[SUCCESS] Python installed!")
            else:
                print("[ERROR] Python installation failed")
                print(f"Please run manually: {{installer}}")

    # Install Node.js
    if 'node' in missing:
        node_installers = list(installers_dir.glob("node-*.msi")) + list(installers_dir.glob("node-*.pkg"))
        if node_installers:
            print("\\n[INFO] Installing Node.js...")
            installer = node_installers[0]
            if installer.suffix == '.msi':
                cmd = f'msiexec /i "{{installer}}" /passive'
            else:
                cmd = f'sudo installer -pkg "{{installer}}" -target /'

            print(f"[CMD] {{cmd}}")
            success, stdout, stderr = run_command(cmd)
            if success:
                print("[SUCCESS] Node.js installed!")
            else:
                print("[ERROR] Node.js installation failed")
                print(f"Please run manually: {{installer}}")

    # Install Docker
    if 'docker' in missing:
        docker_installers = list(installers_dir.glob("Docker*.exe")) + list(installers_dir.glob("Docker*.dmg"))
        if docker_installers:
            print("\\n[INFO] Docker requires manual installation")
            installer = docker_installers[0]
            print(f"[INFO] Opening installer: {{installer}}")

            if sys.platform == 'win32':
                os.startfile(installer)
            elif sys.platform == 'darwin':
                subprocess.run(['open', installer])
            else:
                subprocess.run(['xdg-open', installer])

            print("[INFO] Please follow Docker installer instructions")
            print("[INFO] After installation, restart your computer")

    print("\\n" + "=" * 70)
    print("INSTALLATION COMPLETE")
    print("=" * 70)
    print("\\n[IMPORTANT] Restart your terminal/command prompt!")
    print("\\nNext steps:")
    print("  1. Close and reopen terminal")
    print("  2. Run: setup_wizard.bat (Windows) or ./setup_wizard.sh (Mac/Linux)")
    print("  3. Then run: START_HERE.bat (Windows) or ./START_HERE.sh (Mac/Linux)")

    return True


if __name__ == '__main__':
    try:
        install_from_offline_package()
    except KeyboardInterrupt:
        print("\\n\\n[CANCELLED] Installation cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\\n[ERROR] Installation failed: {{e}}")
        sys.exit(1)

    input("\\nPress Enter to exit...")
'''

    runner_py.write_text(runner_content, encoding='utf-8')
    print(f"  ✓ Created: {runner_py.name}")

    # Windows batch file
    runner_bat = offline_dir / "INSTALL_OFFLINE.bat"

    bat_content = '''@echo off
REM Offline Installer Runner for Windows
title Offline Installer

echo.
echo ====================================================================
echo    OFFLINE INSTALLER - No Internet Required
echo ====================================================================
echo.

python install_offline.py

if errorlevel 1 (
    echo.
    echo [ERROR] Installation failed!
    echo.
    echo Please check the installers/ folder and run installers manually.
    echo.
)

echo.
pause
'''

    runner_bat.write_text(bat_content, encoding='utf-8')
    print(f"  ✓ Created: {runner_bat.name}")

    # Unix shell script
    runner_sh = offline_dir / "install_offline.sh"

    sh_content = '''#!/bin/bash
# Offline Installer Runner for Mac/Linux

echo ""
echo "===================================================================="
echo "   OFFLINE INSTALLER - No Internet Required"
echo "===================================================================="
echo ""

python3 install_offline.py

if [ $? -ne 0 ]; then
    echo ""
    echo "[ERROR] Installation failed!"
    echo ""
    echo "Please check the installers/ folder and run installers manually."
    echo ""
fi

echo ""
read -p "Press Enter to exit..."
'''

    runner_sh.write_text(sh_content, encoding='utf-8')
    os.chmod(runner_sh, 0o755)
    print(f"  ✓ Created: {runner_sh.name}")


def create_offline_readme(offline_dir, installers):
    """Create README for offline package"""

    readme = offline_dir / "OFFLINE_README.md"

    installers_list = "\n".join([f"- {info['name']} (`{info['filename']}`)" for info in installers.values()])

    content = f'''# 🚀 Offline Installer Package

## What This Is

This is a **complete offline installation package** for the Engineering Estimation System.

✅ **No internet connection required**
✅ **All installers included**
✅ **One-click installation**
✅ **Portable - copy to USB drive**

## What's Included

This package contains all required software installers:

{installers_list}

## How to Use

### Windows Users

1. **Copy this entire folder** to the target computer
2. **Double-click**: `INSTALL_OFFLINE.bat`
3. **Follow on-screen instructions**
4. **Restart terminal** when done
5. **Run**: `setup_wizard.bat`
6. **Start system**: `START_HERE.bat`

### Mac/Linux Users

1. **Copy this entire folder** to the target computer
2. **Open Terminal** in this folder
3. **Run**: `./install_offline.sh`
4. **Follow on-screen instructions**
5. **Restart terminal** when done
6. **Run**: `./setup_wizard.sh`
7. **Start system**: `./START_HERE.sh`

## Installation Time

- **Python**: 2-3 minutes (automatic)
- **Node.js**: 2-3 minutes (automatic)
- **Docker**: 5-10 minutes (manual installation required)
- **Total**: ~10-15 minutes

## After Installation

1. **Restart your terminal/command prompt** (important!)
2. **Run the setup wizard**:
   - Windows: `setup_wizard.bat`
   - Mac/Linux: `./setup_wizard.sh`
3. **Start the system**:
   - Windows: `START_HERE.bat`
   - Mac/Linux: `./START_HERE.sh`

## Manual Installation (If Needed)

If automatic installation fails, you can install manually:

1. Go to `installers/` folder
2. Run each installer:
   - Double-click (Windows)
   - Open (Mac)
   - Follow installer instructions
3. Make sure to check "Add to PATH" for Python and Node.js

## Troubleshooting

### "Python not found" after installation
- **Solution**: Restart terminal, or reinstall Python with "Add to PATH" checked

### "Docker requires restart"
- **Reason**: Docker needs WSL2 (Windows) or system privileges (Mac/Linux)
- **Solution**: Follow Docker installer instructions, restart computer

### Installers won't run
- **Windows**: Right-click → "Run as administrator"
- **Mac**: Right-click → "Open" (to allow unsigned apps)

## Package Contents

```
offline_installer/
├── installers/               ← Pre-downloaded installers
│   ├── python-3.12.1-amd64.exe
│   ├── node-v20.11.0-x64.msi
│   └── DockerDesktopInstaller.exe
├── INSTALL_OFFLINE.bat       ← Run this (Windows)
├── install_offline.sh        ← Run this (Mac/Linux)
├── install_offline.py        ← Installation script
├── setup_wizard.bat/sh       ← Setup after install
├── START_HERE.bat/sh         ← Start system
└── OFFLINE_README.md         ← This file
```

## Sharing This Package

✅ **You can copy this entire folder to:**
- USB drives
- Network drives
- Other computers
- Cloud storage

✅ **This package is fully portable and self-contained!**

## System Requirements

- **Windows**: Windows 10/11 (64-bit recommended)
- **Mac**: macOS 11+ (Big Sur or later)
- **Linux**: Ubuntu 20.04+, Debian 11+, or similar
- **Disk Space**: ~10 GB free (for Docker and dependencies)
- **RAM**: 8 GB minimum, 16 GB recommended

## Support

For detailed documentation, see:
- `SETUP_GUIDE.md` - Complete setup guide
- `QUICKSTART.md` - Quick start guide
- `README.md` - System overview

---

**Created by Offline Installer Package Creator**
**Package includes everything needed - no internet required!** 🚀
'''

    readme.write_text(content, encoding='utf-8')
    print(f"  ✓ Created: {readme.name}")


def main():
    """Main entry point"""
    try:
        success = create_offline_package()
        if success:
            print()
            input(f"{Colors.OKCYAN}Press Enter to exit...{Colors.ENDC}")
        else:
            print()
            input(f"{Colors.WARNING}Press Enter to exit...{Colors.ENDC}")
            sys.exit(1)

    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}Cancelled by user{Colors.ENDC}")
        sys.exit(1)

    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        input(f"\n{Colors.FAIL}Press Enter to exit...{Colors.ENDC}")
        sys.exit(1)


if __name__ == '__main__':
    main()