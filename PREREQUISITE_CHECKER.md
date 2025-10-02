# 🔍 Prerequisite Checker - Installation Guide

## What It Does

The prerequisite checker is a **smart scanner** that:

✅ **Detects** installed software on your computer
✅ **Identifies** what's missing
✅ **Provides** direct download links
✅ **Opens** download pages in your browser
✅ **Guides** you through installation

**Takes:** 10 seconds to run
**Saves:** Hours of troubleshooting later!

---

## How to Run It

### 🪟 Windows Users

**Simply double-click:**
```
check_prerequisites.bat
```

Or from Command Prompt:
```cmd
check_prerequisites.bat
```

### 🍎 Mac/Linux Users

**Run in Terminal:**
```bash
./check_prerequisites.sh
```

Or:
```bash
chmod +x check_prerequisites.sh
./check_prerequisites.sh
```

---

## What It Checks

### Required Software

1. **Python 3.11+**
   - Backend programming language
   - Must be version 3.11 or higher
   - Link: https://www.python.org/downloads/

2. **Node.js 18+**
   - Frontend build tool
   - Must be version 18 or higher (LTS recommended)
   - Link: https://nodejs.org

3. **npm**
   - Node package manager
   - Comes automatically with Node.js

4. **Docker**
   - Container platform for backend
   - Makes setup fully automatic
   - Link: https://docker.com

5. **Docker Compose**
   - Multi-container Docker management
   - Included with Docker Desktop on Windows/Mac

### Optional Software

1. **Git**
   - Version control (helpful but not required)
   - Link: https://git-scm.com

---

## Example Output

### ✅ All Software Installed

```
============================================================
   PREREQUISITE CHECKER
============================================================

Scanning your system for required software...

══════════════════════════════════════════════════════════
                  Required Software
══════════════════════════════════════════════════════════

✓ Python 3.11+: 3.11.5
✓ Node.js 18+: v20.10.0
✓ npm: 10.2.3
✓ Docker: 24.0.7
✓ Docker Compose: 2.23.0

══════════════════════════════════════════════════════════
                  Optional Software
══════════════════════════════════════════════════════════

✓ Git: 2.42.0

══════════════════════════════════════════════════════════

✓ All required software is installed!

You're ready to run the setup wizard!

Next steps:
  1. Double-click: setup_wizard.bat
  2. Wait 5-10 minutes for setup to complete
  3. Follow the on-screen instructions
```

### ❌ Missing Software

```
============================================================
   PREREQUISITE CHECKER
============================================================

Scanning your system for required software...

══════════════════════════════════════════════════════════
                  Required Software
══════════════════════════════════════════════════════════

✓ Python 3.11+: 3.11.5
✗ Node.js 18+: Not found
✓ npm: Not found (comes with Node.js)
✗ Docker: Not found
✗ Docker Compose: Not found

══════════════════════════════════════════════════════════

✗ Missing 3 required software package(s)

You need to install the following before setup:

──────────────────────────────────────────────────────────
Missing: Node.js 18+
──────────────────────────────────────────────────────────

Download from: https://nodejs.org/en/download/

Installation Notes:
  • Download the LTS (Long Term Support) version
  • Includes npm package manager automatically
  • Installation is straightforward, use default options
  • Restart terminal after installation
  • Verify with: node --version

──────────────────────────────────────────────────────────
Missing: Docker
──────────────────────────────────────────────────────────

Download from: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

Installation Notes:
  • Docker Desktop includes Docker Compose
  • Windows/Mac: Download and run installer
  • After install, START Docker Desktop application
  • Verify it's running before continuing setup
  • Check with: docker ps

══════════════════════════════════════════════════════════

Would you like to open download pages in your browser?

  1. Node.js 18+
  2. Docker
  A. Open ALL download pages
  N. No, I'll download manually

Your choice (1-2/A/N):
```

If you choose **A** (All), it will open all download pages automatically!

---

## Interactive Features

### Option 1: Open All Downloads

Type **A** and press Enter:
- Opens all download pages in your browser
- Each page opens in a new tab
- Download everything at once

### Option 2: Open Individual Downloads

Type the number (1, 2, etc.):
- Opens just that specific download page
- Useful if you only need one thing

### Option 3: Manual Download

Type **N**:
- Shows download links in terminal
- You can copy/paste them manually

---

## Installation Instructions Provided

For each missing software, the checker shows:

1. **Download URL** - Direct link to installer
2. **Installation Notes** - Step-by-step guide
3. **Verification Command** - How to check it worked
4. **Common Issues** - What to watch out for

### Example for Python:

```
Missing: Python 3.11+

Download from: https://www.python.org/downloads/

Installation Notes:
  • Download the latest Python 3.11 or 3.12 version
  • During installation, CHECK 'Add Python to PATH'
  • Restart terminal after installation
  • Verify with: python --version
```

### Example for Node.js:

```
Missing: Node.js 18+

Download from: https://nodejs.org/en/download/

Installation Notes:
  • Download the LTS (Long Term Support) version
  • Includes npm package manager automatically
  • Installation is straightforward, use default options
  • Restart terminal after installation
  • Verify with: node --version
```

### Example for Docker:

```
Missing: Docker

Download from: https://docker.com/products/docker-desktop

Installation Notes:
  • Docker Desktop includes Docker Compose
  • Windows/Mac: Download and run installer
  • After install, START Docker Desktop application
  • Verify it's running before continuing setup
  • Check with: docker ps
```

---

## After Installing Software

1. **Restart your terminal/command prompt**
   - Close and reopen it
   - This ensures new software is in PATH

2. **Run the checker again**
   ```
   check_prerequisites.bat    (Windows)
   ./check_prerequisites.sh   (Mac/Linux)
   ```

3. **Verify everything shows ✓**
   - All required software should be green checkmarks

4. **Run the setup wizard**
   ```
   setup_wizard.bat    (Windows)
   ./setup_wizard.sh   (Mac/Linux)
   ```

---

## Common Issues

### "Python not found" but I just installed it

**Solution:**
1. Make sure you checked "Add Python to PATH" during installation
2. Restart your terminal
3. If still not working, reinstall Python with PATH option checked

### "Docker not found" but Docker Desktop is installed

**Solution:**
1. Start Docker Desktop application
2. Wait for it to say "Running" (green icon)
3. Run the checker again

### "npm not found" but Node.js is installed

**Solution:**
1. npm comes with Node.js
2. Restart your terminal
3. If still missing, reinstall Node.js

### Checker script won't run

**Windows:**
- Right-click → "Run as administrator"
- Or open Command Prompt as admin

**Mac/Linux:**
- Make sure it's executable: `chmod +x check_prerequisites.sh`
- Try: `bash check_prerequisites.sh`

---

## Integration with Setup Wizard

The **setup wizard automatically runs the checker** if prerequisites are missing!

When you run `setup_wizard.bat`, it will:
1. Check for prerequisites
2. If something is missing, offer to run the detailed checker
3. After you install missing software, you can re-run the wizard

**Workflow:**
```
setup_wizard.bat
  ↓
Detects missing software
  ↓
"Would you like to run prerequisite checker?"
  ↓
Shows detailed instructions + opens download pages
  ↓
You install software
  ↓
Run setup_wizard.bat again
  ↓
Everything installed - setup proceeds!
```

---

## Benefits of Using the Checker

✅ **Saves Time**
- Find all issues upfront (not halfway through setup)

✅ **Prevents Errors**
- Ensures everything is installed correctly

✅ **Provides Guidance**
- Detailed instructions for each software

✅ **One-Click Downloads**
- Opens pages in browser automatically

✅ **Verifies Installation**
- Confirms software is working

✅ **Cross-Platform**
- Works on Windows, Mac, and Linux

---

## Technical Details

### What It Does Behind the Scenes

1. **Runs version commands** for each software
   ```
   python --version
   node --version
   docker --version
   etc.
   ```

2. **Parses output** to extract version numbers

3. **Compares versions** against minimum requirements

4. **Generates report** with color-coded status

5. **Opens browser** using Python's webbrowser module

### Requirements to Run the Checker

- **Python 3.x** (any version)
- That's it! It's a standalone Python script

If Python is not installed, the checker itself won't run, but the wrapper scripts (.bat/.sh) will tell you to install Python first.

---

## Quick Reference

| Platform | Command |
|----------|---------|
| Windows | `check_prerequisites.bat` |
| Mac | `./check_prerequisites.sh` |
| Linux | `./check_prerequisites.sh` |

**Time:** 10 seconds
**Frequency:** Run once before setup, or anytime you're troubleshooting

---

## Summary

The prerequisite checker is your **first step** to a smooth setup experience:

1. ✅ Run the checker
2. ✅ Install missing software
3. ✅ Verify everything is green
4. ✅ Run setup wizard
5. ✅ Success!

**Don't skip this step!** It takes 10 seconds and saves you from setup failures later.

---

**Ready?** Run it now:

**Windows:** Double-click `check_prerequisites.bat`
**Mac/Linux:** Run `./check_prerequisites.sh`