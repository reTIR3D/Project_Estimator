#!/usr/bin/env python3
"""
Engineering Estimation System - Setup Wizard
============================================
One-click setup for the complete system
"""

import os
import sys
import subprocess
import platform
import time
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
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(60)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*60}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")

def run_command(command, cwd=None, shell=True):
    """Run a command and return success status"""
    try:
        result = subprocess.run(
            command,
            shell=shell,
            cwd=cwd,
            capture_output=True,
            text=True
        )
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        return False, "", str(e)

def check_prerequisites():
    """Check if required software is installed"""
    print_header("Checking Prerequisites")

    checks = {
        'Python': ('python', '--version'),
        'Node.js': ('node', '--version'),
        'npm': ('npm', '--version'),
        'Docker': ('docker', '--version'),
        'Docker Compose': ('docker-compose', '--version'),
    }

    results = {}
    missing = []

    for name, command in checks.items():
        success, stdout, stderr = run_command(f"{command[0]} {command[1]}")
        if success:
            version = stdout.strip().split()[-1] if stdout else "installed"
            print_success(f"{name}: {version}")
            results[name] = True
        else:
            print_error(f"{name}: Not found")
            results[name] = False
            missing.append(name)

    # If anything is missing, offer to run detailed checker
    if missing:
        print()
        print_warning(f"Missing {len(missing)} required package(s): {', '.join(missing)}")
        print()
        print_info("Run the prerequisite checker for detailed installation instructions:")
        if platform.system() == 'Windows':
            print(f"  {Colors.OKCYAN}check_prerequisites.bat{Colors.ENDC}")
        else:
            print(f"  {Colors.OKCYAN}./check_prerequisites.sh{Colors.ENDC}")
        print()
        print("The checker will:")
        print("  • Show detailed installation instructions")
        print("  • Provide direct download links")
        print("  • Open download pages in your browser")
        print()

        response = input("Would you like to run it now? (y/n) [y]: ").strip().lower()
        if response != 'n':
            print()
            print_info("Running prerequisite checker...")
            print()
            checker_path = Path(__file__).parent / "check_prerequisites.py"
            if checker_path.exists():
                subprocess.run([sys.executable, str(checker_path)])
            else:
                print_error("Checker not found. Please run check_prerequisites.bat manually")
            print()
            print_warning("After installing missing software, please run this setup wizard again")
            return results

    return results

def setup_backend_docker():
    """Setup backend using Docker"""
    print_header("Setting Up Backend (Docker)")

    backend_dir = Path(__file__).parent / "backend"

    if not backend_dir.exists():
        print_error("Backend directory not found!")
        return False

    # Check if .env exists, if not copy from .env.example
    env_file = backend_dir / ".env"
    env_example = backend_dir / ".env.example"

    if not env_file.exists() and env_example.exists():
        print_info("Creating .env file from .env.example...")
        import shutil
        shutil.copy(env_example, env_file)
        print_success("Created .env file")

    # Start Docker Compose
    print_info("Starting Docker containers...")
    success, stdout, stderr = run_command(
        "docker-compose up -d",
        cwd=backend_dir
    )

    if not success:
        print_error(f"Failed to start Docker: {stderr}")
        return False

    print_success("Docker containers started")

    # Wait for database to be ready
    print_info("Waiting for database to be ready...")
    time.sleep(10)

    # Run migrations
    print_info("Running database migrations...")
    success, stdout, stderr = run_command(
        "docker-compose exec -T api alembic upgrade head",
        cwd=backend_dir
    )

    if not success:
        print_warning("Migration failed, trying alternative method...")
        # Try without -T flag for Windows
        success, stdout, stderr = run_command(
            "docker-compose exec api alembic upgrade head",
            cwd=backend_dir
        )

    if success:
        print_success("Database migrations completed")
    else:
        print_error(f"Migration failed: {stderr}")
        return False

    # Seed sample data
    print_info("Seeding sample data (optional)...")
    success, stdout, stderr = run_command(
        "docker-compose exec -T api python scripts/seed_data.py",
        cwd=backend_dir
    )

    if success:
        print_success("Sample data seeded")
    else:
        print_warning("Sample data seeding failed (optional)")

    return True

def setup_backend_manual():
    """Setup backend manually without Docker"""
    print_header("Setting Up Backend (Manual)")

    backend_dir = Path(__file__).parent / "backend"

    if not backend_dir.exists():
        print_error("Backend directory not found!")
        return False

    # Create virtual environment
    print_info("Creating Python virtual environment...")
    venv_dir = backend_dir / "venv"

    if not venv_dir.exists():
        success, stdout, stderr = run_command(
            f"python -m venv {venv_dir}",
            cwd=backend_dir
        )

        if not success:
            print_error(f"Failed to create virtual environment: {stderr}")
            return False

        print_success("Virtual environment created")
    else:
        print_info("Virtual environment already exists")

    # Determine pip path
    if platform.system() == "Windows":
        pip_path = venv_dir / "Scripts" / "pip.exe"
    else:
        pip_path = venv_dir / "bin" / "pip"

    # Install dependencies
    print_info("Installing Python dependencies (this may take a few minutes)...")
    success, stdout, stderr = run_command(
        f"{pip_path} install -r requirements/base.txt",
        cwd=backend_dir
    )

    if not success:
        print_error(f"Failed to install dependencies: {stderr}")
        return False

    print_success("Dependencies installed")

    # Create .env file
    env_file = backend_dir / ".env"
    env_example = backend_dir / ".env.example"

    if not env_file.exists() and env_example.exists():
        print_info("Creating .env file...")
        import shutil
        shutil.copy(env_example, env_file)
        print_warning("Please edit backend/.env with your database credentials")
        print_success("Created .env file")

    print_warning("Manual setup requires:")
    print_warning("  1. PostgreSQL running on localhost:5432")
    print_warning("  2. Redis running on localhost:6379")
    print_warning("  3. Edit backend/.env with correct credentials")
    print_warning("  4. Run: cd backend && alembic upgrade head")

    return True

def setup_frontend():
    """Setup frontend"""
    print_header("Setting Up Frontend")

    frontend_dir = Path(__file__).parent / "frontend"

    if not frontend_dir.exists():
        print_error("Frontend directory not found!")
        return False

    # Check if node_modules exists
    node_modules = frontend_dir / "node_modules"

    if node_modules.exists():
        print_info("node_modules already exists, skipping installation")
        return True

    # Install dependencies
    print_info("Installing npm dependencies (this may take a few minutes)...")
    success, stdout, stderr = run_command(
        "npm install",
        cwd=frontend_dir
    )

    if not success:
        print_error(f"Failed to install npm dependencies: {stderr}")
        return False

    print_success("Frontend dependencies installed")
    return True

def print_next_steps(use_docker):
    """Print instructions for next steps"""
    print_header("Setup Complete!")

    print_success("Your Engineering Estimation System is ready!")
    print()

    if use_docker:
        print(f"{Colors.BOLD}Backend Status:{Colors.ENDC}")
        print("  ✓ Docker containers running")
        print("  ✓ Database migrated")
        print("  ✓ Sample data seeded")
        print()
        print(f"{Colors.BOLD}Access Points:{Colors.ENDC}")
        print(f"  • Backend API: {Colors.OKCYAN}http://localhost:8000{Colors.ENDC}")
        print(f"  • API Docs: {Colors.OKCYAN}http://localhost:8000/api/docs{Colors.ENDC}")
    else:
        print(f"{Colors.BOLD}Backend Setup:{Colors.ENDC}")
        print("  • Virtual environment created")
        print("  • Dependencies installed")
        print()
        print(f"{Colors.WARNING}Before starting backend:{Colors.ENDC}")
        print("  1. Make sure PostgreSQL is running")
        print("  2. Make sure Redis is running")
        print("  3. Edit backend/.env with your credentials")
        print("  4. Run migrations: cd backend && alembic upgrade head")

    print()
    print(f"{Colors.BOLD}Frontend Status:{Colors.ENDC}")
    print("  ✓ Dependencies installed")
    print("  ✓ Ready to run")
    print()

    print(f"{Colors.BOLD}To Start the Application:{Colors.ENDC}")
    print()

    if use_docker:
        print(f"{Colors.OKGREEN}Backend is already running!{Colors.ENDC}")
    else:
        print(f"{Colors.BOLD}1. Start Backend (new terminal):{Colors.ENDC}")
        if platform.system() == "Windows":
            print("   cd backend")
            print("   venv\\Scripts\\activate")
            print("   uvicorn app.main:app --reload --port 8000")
        else:
            print("   cd backend")
            print("   source venv/bin/activate")
            print("   uvicorn app.main:app --reload --port 8000")

    print()
    print(f"{Colors.BOLD}2. Start Frontend (new terminal):{Colors.ENDC}")
    print("   cd frontend")
    print("   npm run dev")
    print()
    print(f"{Colors.BOLD}3. Open Browser:{Colors.ENDC}")
    print(f"   {Colors.OKCYAN}http://localhost:3000{Colors.ENDC}")
    print()

    print(f"{Colors.BOLD}Sample Login Credentials (if seeded):{Colors.ENDC}")
    print("   Admin: admin@example.com / admin123456")
    print("   Manager: manager@example.com / manager123456")
    print("   Engineer: engineer@example.com / engineer123456")
    print()

    print(f"{Colors.BOLD}Quick Test:{Colors.ENDC}")
    print("   1. Click 'Quick Estimate'")
    print("   2. Select 'Medium' size")
    print("   3. Check 'Fast-track' + 'Multi-discipline'")
    print("   4. Select 'Type A' client")
    print("   5. See: 2,898 hours calculated instantly! ✓")
    print()

    print(f"{Colors.OKGREEN}Enjoy your Engineering Estimation System!{Colors.ENDC}")

def main():
    """Main setup wizard"""
    print()
    print(f"{Colors.BOLD}{Colors.HEADER}")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║                                                           ║")
    print("║     ENGINEERING ESTIMATION SYSTEM - SETUP WIZARD         ║")
    print("║                                                           ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")

    print_info("This wizard will set up the complete system for you")
    print()

    # Check prerequisites
    prereqs = check_prerequisites()

    # Determine setup method
    use_docker = False
    if prereqs.get('Docker') and prereqs.get('Docker Compose'):
        print()
        print(f"{Colors.BOLD}Setup Method:{Colors.ENDC}")
        print("1. Docker (Recommended - Easiest)")
        print("2. Manual (Requires PostgreSQL and Redis)")
        print()

        choice = input("Choose setup method (1 or 2) [1]: ").strip() or "1"
        use_docker = (choice == "1")
    else:
        print_warning("Docker not available, using manual setup")
        if not (prereqs.get('Python') and prereqs.get('Node.js') and prereqs.get('npm')):
            print_error("Required software not found!")
            print_error("Please install Python, Node.js, and npm")
            return 1
        use_docker = False

    # Setup backend
    if use_docker:
        if not setup_backend_docker():
            print_error("Backend setup failed!")
            return 1
    else:
        if not setup_backend_manual():
            print_error("Backend setup failed!")
            return 1

    # Setup frontend
    if not setup_frontend():
        print_error("Frontend setup failed!")
        return 1

    # Print next steps
    print_next_steps(use_docker)

    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print()
        print_warning("Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"Unexpected error: {e}")
        sys.exit(1)