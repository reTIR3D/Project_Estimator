#!/usr/bin/env python3
"""
Engineering Estimation System - Prerequisite Checker
====================================================
Scans system for required software and provides download links
"""

import os
import sys
import subprocess
import platform
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

def clear_screen():
    """Clear terminal screen"""
    os.system('cls' if platform.system() == 'Windows' else 'clear')

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

def run_command(command):
    """Run a command and return success status and output"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=5
        )
        return result.returncode == 0, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return False, "", "Command timed out"
    except Exception as e:
        return False, "", str(e)

class Prerequisite:
    """Represents a prerequisite software"""

    def __init__(self, name, commands, min_version=None, download_urls=None, notes=None):
        self.name = name
        self.commands = commands if isinstance(commands, list) else [commands]
        self.min_version = min_version
        self.download_urls = download_urls or {}
        self.notes = notes
        self.installed = False
        self.version = None
        self.status_message = ""

    def check(self):
        """Check if prerequisite is installed"""
        for command in self.commands:
            success, stdout, stderr = run_command(command)
            if success:
                self.installed = True
                # Try to extract version from output
                self.version = self._extract_version(stdout)
                return True
        return False

    def _extract_version(self, output):
        """Extract version number from command output"""
        # Common version patterns
        import re

        # Try to find version patterns like: 3.11.0, v20.10.0, 1.2.3
        patterns = [
            r'(\d+\.\d+\.\d+)',
            r'v(\d+\.\d+\.\d+)',
            r'version\s+(\d+\.\d+\.\d+)',
        ]

        for pattern in patterns:
            match = re.search(pattern, output, re.IGNORECASE)
            if match:
                return match.group(1)

        # Return first line if no version found
        return output.split('\n')[0] if output else "installed"

    def get_download_url(self):
        """Get appropriate download URL for current OS"""
        system = platform.system().lower()
        if 'windows' in system:
            return self.download_urls.get('windows')
        elif 'darwin' in system:
            return self.download_urls.get('mac')
        elif 'linux' in system:
            return self.download_urls.get('linux')
        return self.download_urls.get('all')

    def print_status(self):
        """Print the status of this prerequisite"""
        if self.installed:
            print_success(f"{self.name}: {self.version}")
        else:
            print_error(f"{self.name}: Not found")

    def print_install_instructions(self):
        """Print installation instructions"""
        print(f"\n{Colors.BOLD}{Colors.WARNING}{'─'*70}{Colors.ENDC}")
        print(f"{Colors.BOLD}{Colors.FAIL}Missing: {self.name}{Colors.ENDC}")
        print(f"{Colors.WARNING}{'─'*70}{Colors.ENDC}")

        url = self.get_download_url()
        if url:
            print(f"\n{Colors.OKBLUE}Download from: {Colors.UNDERLINE}{url}{Colors.ENDC}")

        if self.notes:
            print(f"\n{Colors.OKCYAN}Installation Notes:{Colors.ENDC}")
            for note in self.notes:
                print(f"  • {note}")

        print()

def check_all_prerequisites():
    """Check all required prerequisites"""

    system = platform.system()

    # Define all prerequisites
    prerequisites = [
        Prerequisite(
            name="Python 3.11+",
            commands=["python --version", "python3 --version"],
            min_version="3.11.0",
            download_urls={
                'all': 'https://www.python.org/downloads/',
                'windows': 'https://www.python.org/downloads/windows/',
                'mac': 'https://www.python.org/downloads/macos/',
                'linux': 'https://www.python.org/downloads/source/'
            },
            notes=[
                "Download the latest Python 3.11 or 3.12 version",
                "During installation, CHECK 'Add Python to PATH'",
                "Restart terminal after installation",
                "Verify with: python --version"
            ]
        ),
        Prerequisite(
            name="Node.js 18+",
            commands=["node --version"],
            min_version="18.0.0",
            download_urls={
                'all': 'https://nodejs.org/en/download/',
                'windows': 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi',
                'mac': 'https://nodejs.org/dist/v20.11.0/node-v20.11.0.pkg'
            },
            notes=[
                "Download the LTS (Long Term Support) version",
                "Includes npm package manager automatically",
                "Installation is straightforward, use default options",
                "Restart terminal after installation",
                "Verify with: node --version"
            ]
        ),
        Prerequisite(
            name="npm",
            commands=["npm --version"],
            download_urls={
                'all': 'https://nodejs.org/en/download/'
            },
            notes=[
                "npm comes with Node.js installation",
                "If missing, reinstall Node.js"
            ]
        ),
        Prerequisite(
            name="Docker",
            commands=["docker --version"],
            download_urls={
                'windows': 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
                'mac': 'https://desktop.docker.com/mac/main/amd64/Docker.dmg',
                'linux': 'https://docs.docker.com/engine/install/'
            },
            notes=[
                "Docker Desktop includes Docker Compose",
                "Windows/Mac: Download and run installer",
                "Linux: Follow distribution-specific instructions",
                "After install, START Docker Desktop application",
                "Verify it's running before continuing setup",
                "Check with: docker ps"
            ]
        ),
        Prerequisite(
            name="Docker Compose",
            commands=["docker-compose --version", "docker compose version"],
            download_urls={
                'all': 'https://docs.docker.com/compose/install/'
            },
            notes=[
                "Comes with Docker Desktop on Windows/Mac",
                "Linux: May need separate installation",
                "See: https://docs.docker.com/compose/install/"
            ]
        ),
    ]

    # Optional but recommended
    optional_prerequisites = [
        Prerequisite(
            name="Git",
            commands=["git --version"],
            download_urls={
                'windows': 'https://git-scm.com/download/win',
                'mac': 'https://git-scm.com/download/mac',
                'linux': 'https://git-scm.com/download/linux'
            },
            notes=[
                "Optional but recommended for version control",
                "Not required to run the system"
            ]
        ),
    ]

    return prerequisites, optional_prerequisites

def open_download_page(url):
    """Open download page in browser"""
    try:
        webbrowser.open(url)
        return True
    except Exception as e:
        print_error(f"Could not open browser: {e}")
        return False

def main():
    """Main prerequisite checker"""
    clear_screen()

    print(f"{Colors.BOLD}{Colors.HEADER}")
    print("╔════════════════════════════════════════════════════════════════════╗")
    print("║                                                                    ║")
    print("║        ENGINEERING ESTIMATION SYSTEM                              ║")
    print("║        Prerequisite Checker                                       ║")
    print("║                                                                    ║")
    print("╚════════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")

    print_info("Scanning your system for required software...")
    print()

    # Check all prerequisites
    prerequisites, optional_prerequisites = check_all_prerequisites()

    # Run checks
    print_header("Required Software")

    all_installed = True
    missing = []

    for prereq in prerequisites:
        if prereq.check():
            prereq.print_status()
        else:
            prereq.print_status()
            all_installed = False
            missing.append(prereq)

    # Check optional
    print_header("Optional Software")

    for prereq in optional_prerequisites:
        prereq.check()
        prereq.print_status()

    # Summary
    print()
    print(f"{Colors.BOLD}{'='*70}{Colors.ENDC}")

    if all_installed:
        print()
        print(f"{Colors.OKGREEN}{Colors.BOLD}✓ All required software is installed!{Colors.ENDC}")
        print()
        print(f"{Colors.OKGREEN}You're ready to run the setup wizard!{Colors.ENDC}")
        print()
        print(f"{Colors.BOLD}Next steps:{Colors.ENDC}")
        if platform.system() == 'Windows':
            print(f"  1. Double-click: {Colors.OKCYAN}setup_wizard.bat{Colors.ENDC}")
        else:
            print(f"  1. Run: {Colors.OKCYAN}./setup_wizard.sh{Colors.ENDC}")
        print(f"  2. Wait 5-10 minutes for setup to complete")
        print(f"  3. Follow the on-screen instructions")
        print()

    else:
        print()
        print(f"{Colors.FAIL}{Colors.BOLD}✗ Missing {len(missing)} required software package(s){Colors.ENDC}")
        print()
        print(f"{Colors.WARNING}You need to install the following before setup:{Colors.ENDC}")

        # Print detailed instructions for each missing prerequisite
        for prereq in missing:
            prereq.print_install_instructions()

        # Offer to open download pages
        print(f"{Colors.BOLD}{'='*70}{Colors.ENDC}")
        print()
        print(f"{Colors.BOLD}Would you like to open download pages in your browser?{Colors.ENDC}")
        print()

        for i, prereq in enumerate(missing, 1):
            url = prereq.get_download_url()
            if url:
                print(f"  {i}. {prereq.name}")

        print(f"  A. Open ALL download pages")
        print(f"  I. Run AUTOMATIC INSTALLER (downloads & installs for you!)")
        print(f"  N. No, I'll download manually")
        print()

        choice = input(f"{Colors.OKCYAN}Your choice (1-{len(missing)}/A/I/N): {Colors.ENDC}").strip().upper()

        if choice == 'I':
            # Run the auto-installer
            print()
            print_info("Launching automatic installer...")
            print()
            auto_installer_path = Path(__file__).parent / "auto_installer.py"
            if auto_installer_path.exists():
                try:
                    import subprocess
                    subprocess.run([sys.executable, str(auto_installer_path)])
                except Exception as e:
                    print_error(f"Could not run auto-installer: {e}")
                    print_info("Try running: auto_installer.bat")
            else:
                print_error("Auto-installer not found")
                print_info("Please download manually")

        elif choice == 'A':
            print()
            print_info("Opening download pages...")
            for prereq in missing:
                url = prereq.get_download_url()
                if url:
                    print(f"  Opening: {prereq.name}")
                    open_download_page(url)
            print()
            print_success("Download pages opened in browser")
        elif choice.isdigit():
            idx = int(choice) - 1
            if 0 <= idx < len(missing):
                url = missing[idx].get_download_url()
                if url:
                    print()
                    print_info(f"Opening: {missing[idx].name}")
                    open_download_page(url)
                    print_success("Download page opened")

        print()
        print(f"{Colors.WARNING}After installing missing software:{Colors.ENDC}")
        print(f"  1. Restart your terminal/command prompt")
        print(f"  2. Run this checker again to verify")
        print(f"  3. Then run the setup wizard")
        print()

    # System info
    print(f"{Colors.BOLD}{'─'*70}{Colors.ENDC}")
    print(f"{Colors.OKCYAN}System Information:{Colors.ENDC}")
    print(f"  OS: {platform.system()} {platform.release()}")
    print(f"  Architecture: {platform.machine()}")
    print(f"  Python: {platform.python_version()}")
    print(f"{Colors.BOLD}{'─'*70}{Colors.ENDC}")
    print()

    return 0 if all_installed else 1

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print()
        print_warning("Checker cancelled by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)