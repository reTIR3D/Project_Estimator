# 🎯 Setup Instructions - Just 2 Clicks!

## For New Users - Super Simple Setup

### Step 1: Install Prerequisites (One-time)

Download and install these (if you don't have them):

1. **Docker Desktop**
   - Windows/Mac: https://www.docker.com/products/docker-desktop
   - ✅ Makes setup automatic
   - ✅ Installs everything for you

2. **Node.js**
   - https://nodejs.org (Download the LTS version)
   - ✅ Needed for the frontend

That's it! Python comes with the setup.

---

## Step 2: Run Setup Wizard

### 🪟 Windows Users

**Just double-click this file:**
```
📁 setup_wizard.bat
```

**Location:** In the "Project Estimation Tool" folder

**What you'll see:**
```
============================================================
   ENGINEERING ESTIMATION SYSTEM - SETUP WIZARD
============================================================

Checking Prerequisites...
✓ Python: 3.11.0
✓ Node.js: v20.10.0
✓ npm: 10.2.3
✓ Docker: 24.0.7
✓ Docker Compose: 2.23.0

Setup Method:
1. Docker (Recommended - Easiest)
2. Manual (Requires PostgreSQL and Redis)

Choose setup method (1 or 2) [1]:
```

**Just press Enter** to use Docker (recommended)

The wizard will:
- ✅ Setup backend with Docker
- ✅ Create database
- ✅ Install frontend dependencies
- ✅ Show you next steps

**Time:** 5-10 minutes

---

### 🍎 Mac/Linux Users

**Open Terminal and run:**
```bash
cd "Project Estimation Tool"
./setup_wizard.sh
```

Or right-click `setup_wizard.sh` → Open With → Terminal

**Same process as Windows** - just press Enter when asked!

---

## Step 3: Start the System

After setup completes:

### 🪟 Windows Users

**Double-click:**
```
📁 START_HERE.bat
```

This will:
1. Start the backend (Docker containers)
2. Start the frontend (in a new window)
3. Open your browser automatically

### 🍎 Mac/Linux Users

**Run:**
```bash
./START_HERE.sh
```

Same result - everything starts automatically!

---

## Step 4: Use It!

Your browser will open to: **http://localhost:3000**

### Quick Test:
1. Click **"Quick Estimate"**
2. Select **"Medium"** size
3. Check **"Fast-track"** ✓
4. Check **"Multi-discipline"** ✓
5. Select **"Type A"** client
6. **Watch the magic!** → **2,898 hours** appears instantly! 🎉

---

## 📍 What Files to Click

**In your "Project Estimation Tool" folder:**

```
Project Estimation Tool/
│
├── 📁 setup_wizard.bat      ← CLICK THIS FIRST (Windows)
├── 📁 setup_wizard.sh       ← or this (Mac/Linux)
│
├── 📁 START_HERE.bat        ← CLICK THIS TO RUN (Windows)
├── 📁 START_HERE.sh         ← or this (Mac/Linux)
│
└── 📄 README.md             ← Read for more info
```

---

## 🎬 What Happens During Setup?

### Setup Wizard (5-10 minutes)
1. ✓ Checks if you have Docker, Node.js, etc.
2. ✓ Starts Docker containers (PostgreSQL, Redis, API)
3. ✓ Creates database tables
4. ✓ Adds sample users (admin, manager, engineer)
5. ✓ Installs frontend dependencies
6. ✓ Shows you success message!

### When You Run START_HERE
1. ✓ Starts backend (already configured)
2. ✓ Starts frontend in new window
3. ✓ Opens browser to http://localhost:3000
4. ✓ You're ready to go!

---

## ✅ Success Looks Like This

After setup completes, you'll see:

```
============================================================
                  SETUP COMPLETE!
============================================================

Your Engineering Estimation System is ready!

Backend Status:
  ✓ Docker containers running
  ✓ Database migrated
  ✓ Sample data seeded

Access Points:
  • Backend API: http://localhost:8000
  • API Docs: http://localhost:8000/api/docs
  • Frontend: http://localhost:3000

To Start the Application:

2. Start Frontend (new terminal):
   cd frontend
   npm run dev

Sample Login Credentials (if seeded):
   Admin: admin@example.com / admin123456
   Manager: manager@example.com / manager123456
   Engineer: engineer@example.com / engineer123456

Quick Test:
   1. Click 'Quick Estimate'
   2. Select 'Medium' size
   3. Check 'Fast-track' + 'Multi-discipline'
   4. Select 'Type A' client
   5. See: 2,898 hours calculated instantly! ✓

Enjoy your Engineering Estimation System!
```

---

## 🆘 Troubleshooting

### "Docker is not running"
**Fix:**
1. Start Docker Desktop application
2. Wait for it to show "Running"
3. Try again

### "Python not found"
**Fix:**
1. Download Python from https://python.org
2. During install, check "Add to PATH"
3. Restart terminal
4. Try again

### "npm not found"
**Fix:**
1. Download Node.js from https://nodejs.org
2. Install it
3. Restart terminal
4. Try again

### Setup takes too long
**Normal!** First time takes 5-10 minutes to:
- Download Docker images
- Install npm packages
- Setup database

### Nothing happens when I double-click
**Windows:** Right-click → "Run as administrator"
**Mac:** Right-click → Open (allow unsigned)

---

## 🎯 The Absolute Simplest Path

1. Install Docker Desktop
2. Install Node.js
3. Double-click `setup_wizard.bat` (Windows) or run `./setup_wizard.sh` (Mac/Linux)
4. Wait 5-10 minutes
5. Double-click `START_HERE.bat` (Windows) or run `./START_HERE.sh` (Mac/Linux)
6. Browser opens automatically
7. **Done!** 🎉

---

## 💡 Pro Tips

- **First time?** Setup takes longer (downloading images)
- **Second time?** Starts in seconds!
- **Need help?** Check `SETUP_GUIDE.md` for details
- **Want to learn?** Read `IMPLEMENTATION_COMPLETE.md`

---

## 🎓 After Setup

### Try These:
1. **Quick Estimate** - Test calculations without saving
2. **Create Project** - Make your first project
3. **Dashboard** - See all your projects
4. **API Docs** - Explore at http://localhost:8000/api/docs

### Learn More:
- `QUICKSTART.md` - Quick start guide
- `SETUP_GUIDE.md` - Detailed setup
- `README.md` - Project overview
- `backend/README.md` - Backend docs
- `frontend/README.md` - Frontend docs

---

**You're all set!** The setup wizard makes everything automatic. Just click and wait! 🚀