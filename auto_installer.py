#!/usr/bin/env python3
"""
Engineering Estimation System - Automatic Installer
===================================================
Automatically downloads and helps install missing prerequisites
"""

import os
import sys
import subprocess
import platform
import urllib.request
import webbrowser
from pathlib import Path

# Colors for terminal output
class Colors:
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
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(70)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*70}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

def get_system_info():
    """Get detailed system information"""
    system = platform.system()
    machine = platform.machine()

    return {
        'os': system,
        'arch': machine,
        'is_64bit': sys.maxsize > 2**32,
        'platform': platform.platform()
    }

def get_installer_urls():
    """Get installer URLs based on system"""
    system_info = get_system_info()

    installers = {}

    # Python installers
    if system_info['os'] == 'Windows':
        if system_info['is_64bit']:
            installers['python'] = {
                'name': 'Python 3.12.1 (64-bit)',
                'url': 'https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe',
                'filename': 'python-3.12.1-amd64.exe',
                'install_cmd': 'python-3.12.1-amd64.exe /passive PrependPath=1 Include_test=0',
                'notes': [
                    'Will install with "Add to PATH" enabled',
                    'Silent installation with recommended options',
                    'Installation takes 2-3 minutes'
                ]
            }
        else:
            installers['python'] = {
                'name': 'Python 3.12.1 (32-bit)',
                'url': 'https://www.python.org/ftp/python/3.12.1/python-3.12.1.exe',
                'filename': 'python-3.12.1.exe',
                'install_cmd': 'python-3.12.1.exe /passive PrependPath=1 Include_test=0'
            }

    # Node.js installers
    if system_info['os'] == 'Windows':
        if system_info['is_64bit']:
            installers['nodejs'] = {
                'name': 'Node.js 20.11.0 LTS (64-bit)',
                'url': 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi',
                'filename': 'node-v20.11.0-x64.msi',
                'install_cmd': 'msiexec /i node-v20.11.0-x64.msi /passive',
                'notes': [
                    'Includes npm package manager',
                    'Will be added to PATH automatically',
                    'Installation takes 2-3 minutes'
                ]
            }
        else:
            installers['nodejs'] = {
                'name': 'Node.js 20.11.0 LTS (32-bit)',
                'url': 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x86.msi',
                'filename': 'node-v20.11.0-x86.msi',
                'install_cmd': 'msiexec /i node-v20.11.0-x86.msi /passive'
            }

    # Docker Desktop
    if system_info['os'] == 'Windows':
        installers['docker'] = {
            'name': 'Docker Desktop',
            'url': 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
            'filename': 'DockerDesktopInstaller.exe',
            'install_cmd': None,  # Docker requires manual installation
            'notes': [
                'Must be installed manually (requires restart)',
                'After install, start Docker Desktop application',
                'Wait for it to show "Running" before continuing',
                'Includes Docker Compose automatically'
            ]
        }

    return installers

def download_file(url, filename, download_dir):
    """Download a file with progress indication"""
    filepath = download_dir / filename

    try:
        print_info(f"Downloading {filename}...")
        print(f"  From: {url}")
        print(f"  To: {filepath}")
        print()

        def reporthook(block_num, block_size, total_size):
            """Progress callback"""
            if total_size > 0:
                percent = min(block_num * block_size * 100 / total_size, 100)
                downloaded = min(block_num * block_size / (1024*1024), total_size / (1024*1024))
                total = total_size / (1024*1024)

                # Print progress bar
                bar_length = 40
                filled = int(bar_length * percent / 100)
                bar = '█' * filled + '░' * (bar_length - filled)

                print(f"\r  [{bar}] {percent:.1f}% ({downloaded:.1f}/{total:.1f} MB)", end='', flush=True)

        urllib.request.urlretrieve(url, filepath, reporthook=reporthook)
        print()  # New line after progress
        print_success(f"Downloaded: {filename}")
        return filepath

    except Exception as e:
        print()
        print_error(f"Download failed: {e}")
        return None

def install_software(installer_path, install_cmd):
    """Install software using the downloaded installer"""
    if not install_cmd:
        print_warning("This software must be installed manually")
        print_info(f"Please run: {installer_path}")

        # Offer to open the installer
        response = input("\nOpen installer now? (y/n) [y]: ").strip().lower()
        if response != 'n':
            try:
                if platform.system() == 'Windows':
                    os.startfile(installer_path)
                else:
                    subprocess.run(['open', installer_path])
                print_success("Installer opened")
            except Exception as e:
                print_error(f"Could not open installer: {e}")
        return False

    try:
        print_info("Running installer...")
        print(f"  Command: {install_cmd}")
        print()
        print_warning("Installation may take a few minutes...")
        print_warning("Please do not close this window")
        print()

        result = subprocess.run(
            install_cmd,
            shell=True,
            capture_output=True,
            text=True
        )

        if result.returncode == 0:
            print_success("Installation completed!")
            return True
        else:
            print_error(f"Installation failed with code {result.returncode}")
            if result.stderr:
                print(f"Error: {result.stderr}")
            return False

    except Exception as e:
        print_error(f"Installation error: {e}")
        return False

def check_missing_software():
    """Check what software is missing"""
    def run_command(command):
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except:
            return False

    missing = []

    # Check Python
    if not (run_command("python --version") or run_command("python3 --version")):
        missing.append('python')

    # Check Node.js
    if not run_command("node --version"):
        missing.append('nodejs')

    # Check Docker
    if not run_command("docker --version"):
        missing.append('docker')

    return missing

def main():
    """Main auto-installer"""
    print(f"{Colors.BOLD}{Colors.HEADER}")
    print("╔════════════════════════════════════════════════════════════════════╗")
    print("║                                                                    ║")
    print("║        ENGINEERING ESTIMATION SYSTEM                              ║")
    print("║        Automatic Installer                                        ║")
    print("║                                                                    ║")
    print("╚════════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")

    print_info("Checking for missing software...")
    print()

    # Get system info
    system_info = get_system_info()
    print(f"{Colors.BOLD}System Information:{Colors.ENDC}")
    print(f"  OS: {system_info['os']}")
    print(f"  Architecture: {system_info['arch']} ({'64-bit' if system_info['is_64bit'] else '32-bit'})")
    print(f"  Platform: {system_info['platform']}")
    print()

    # Check missing software
    missing = check_missing_software()

    if not missing:
        print_success("All required software is already installed!")
        print()
        print_info("You can now run the setup wizard")
        return 0

    print_warning(f"Missing {len(missing)} software package(s): {', '.join(missing)}")
    print()

    # Get installer URLs
    installers = get_installer_urls()

    # Create downloads directory
    downloads_dir = Path(__file__).parent / "downloads"
    downloads_dir.mkdir(exist_ok=True)

    print(f"{Colors.BOLD}Available installers for your system:{Colors.ENDC}")
    print()

    available_installers = []
    for key in missing:
        if key in installers:
            installer = installers[key]
            available_installers.append((key, installer))
            print(f"{Colors.BOLD}{len(available_installers)}. {installer['name']}{Colors.ENDC}")
            print(f"   URL: {installer['url']}")
            print(f"   Size: ~50-100 MB")
            if installer.get('notes'):
                print(f"   Notes:")
                for note in installer['notes']:
                    print(f"     • {note}")
            print()

    if not available_installers:
        print_error("No installers available for your system")
        print_info("Please install software manually:")
        print("  • Python: https://www.python.org/downloads/")
        print("  • Node.js: https://nodejs.org/")
        print("  • Docker: https://docker.com/products/docker-desktop")
        return 1

    print(f"{Colors.BOLD}What would you like to do?{Colors.ENDC}")
    print()
    print(f"  A. Download and install ALL missing software")
    print(f"  D. Download ALL (install manually later)")
    print(f"  1-{len(available_installers)}. Download/install specific software")
    print(f"  O. Open download pages in browser")
    print(f"  N. No, I'll install manually")
    print()

    choice = input(f"{Colors.OKCYAN}Your choice: {Colors.ENDC}").strip().upper()
    print()

    if choice == 'N':
        print_info("Opening download pages in browser...")
        for key, installer in available_installers:
            webbrowser.open(installer['url'])
        print_success("Download pages opened")
        return 0

    if choice == 'O':
        print_info("Opening download pages in browser...")
        for key, installer in available_installers:
            # Open the main product page instead of direct download
            if key == 'python':
                webbrowser.open('https://www.python.org/downloads/')
            elif key == 'nodejs':
                webbrowser.open('https://nodejs.org/')
            elif key == 'docker':
                webbrowser.open('https://www.docker.com/products/docker-desktop')
        print_success("Download pages opened")
        return 0

    # Download and/or install
    to_process = []

    if choice == 'A' or choice == 'D':
        to_process = available_installers
    elif choice.isdigit():
        idx = int(choice) - 1
        if 0 <= idx < len(available_installers):
            to_process = [available_installers[idx]]
        else:
            print_error("Invalid choice")
            return 1
    else:
        print_error("Invalid choice")
        return 1

    # Download files
    print_header("Downloading Installers")

    downloaded = []
    for key, installer in to_process:
        filepath = download_file(
            installer['url'],
            installer['filename'],
            downloads_dir
        )

        if filepath and filepath.exists():
            downloaded.append((key, installer, filepath))
        print()

    if not downloaded:
        print_error("No files were downloaded successfully")
        return 1

    print_success(f"Downloaded {len(downloaded)} installer(s)")
    print_info(f"Files saved to: {downloads_dir}")
    print()

    # Install if user chose 'A'
    if choice == 'A':
        print_header("Installing Software")

        for key, installer, filepath in downloaded:
            print(f"{Colors.BOLD}Installing: {installer['name']}{Colors.ENDC}")
            print()

            if install_software(filepath, installer.get('install_cmd')):
                print_success(f"{installer['name']} installed successfully!")
            else:
                print_warning(f"Please install {installer['name']} manually")
                print_info(f"Installer location: {filepath}")

            print()

        print_header("Installation Complete")
        print_warning("IMPORTANT: You must restart your terminal/command prompt!")
        print()
        print_info("After restarting:")
        print("  1. Run the prerequisite checker to verify")
        print("  2. Run the setup wizard")
        print()

    else:  # choice == 'D'
        print_header("Downloads Complete")
        print_info("Installers downloaded to:")
        print(f"  {downloads_dir}")
        print()
        print(f"{Colors.BOLD}To install:{Colors.ENDC}")
        for key, installer, filepath in downloaded:
            print(f"  • {installer['name']}")
            print(f"    Run: {filepath}")
            if installer.get('notes'):
                for note in installer['notes']:
                    print(f"      {note}")
        print()

    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print()
        print_warning("Installer cancelled by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)