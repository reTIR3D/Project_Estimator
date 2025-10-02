# 🚀 Engineering Estimation System

A comprehensive full-stack application for engineering project estimation with advanced features including multi-discipline team building, deliverables configuration, work breakdown structure (WBS), RACI matrix, cost analysis, and client-specific rate management.

## ⚡ Quick Start

### Windows Users
**Just double-click:** `start.bat`

This will automatically:
- Check if Docker is running (and start it if needed)
- Start the database
- Run migrations
- Start both frontend and backend servers

### Mac/Linux Users
**Run in terminal:**
```bash
./start.sh
```

That's it! The script handles everything automatically.

## 📋 What the Setup Wizard Does

1. ✅ Checks for required software (Python, Node.js, Docker)
2. ✅ Sets up the backend (FastAPI + PostgreSQL + Redis)
3. ✅ Installs all dependencies
4. ✅ Runs database migrations
5. ✅ Seeds sample data
6. ✅ Sets up the frontend (React + TypeScript)
7. ✅ Provides next steps and URLs

**Setup Time:** 5-10 minutes (depending on internet speed)

## 🎯 After Setup

The system will be available at:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/docs

### Quick Test
1. Click "Quick Estimate"
2. Select "Medium" size
3. Check "Fast-track" + "Multi-discipline"
4. Select "Type A" client
5. See **2,898 hours** calculated instantly! ✅

## 📦 Current Features

### Backend (Python/FastAPI)
- ✅ Advanced estimation engine with complexity calculations
- ✅ PostgreSQL database with comprehensive schema
- ✅ Redis caching for performance
- ✅ JWT authentication and user management
- ✅ REST API with OpenAPI documentation
- ✅ Docker containerization
- ✅ Client management with custom rate structures
- ✅ Cost calculation service with role-based breakdowns
- ✅ Database migrations with Alembic
- ✅ Deliverables and project templates

### Frontend (React/TypeScript)
- ✅ **7-Step Estimation Workflow**:
  1. **Setup** - Project configuration (size, type, disciplines, complexity)
  2. **Team Builder** - Visual role assignment with discipline-specific teams
  3. **Deliverables** - Comprehensive deliverable selection matrix
  4. **WBS** - Work breakdown structure and task planning
  5. **RACI** - Responsibility assignment matrix
  6. **Cost Analysis** - Detailed cost breakdowns by role and deliverable
  7. **Summary** - Final estimation with all metrics
- ✅ Multi-discipline project support (Civil, Mechanical, Electrical, etc.)
- ✅ Client configuration with custom billing rates
- ✅ Real-time calculations and updates
- ✅ Phase-gate project tracking
- ✅ Responsive design with modern UI
- ✅ Protected routes with authentication

## 🔧 Manual Setup (Advanced)

If you prefer manual setup, see:
- **Complete Guide**: `SETUP_GUIDE.md`
- **Quick Start**: `QUICKSTART.md`

## 📚 Documentation

- `SETUP_GUIDE.md` - Complete setup instructions
- `QUICKSTART.md` - 5-minute quick start guide
- `IMPLEMENTATION_COMPLETE.md` - Full system documentation
- `backend/README.md` - Backend documentation
- `frontend/README.md` - Frontend documentation

## 🎓 Key Capabilities

### Estimation Engine
- **Project Sizes**: Small (<500h), Medium (500-2000h), Large (>2000h), Phase-Gate (staged)
- **Complexity Factors**: Multi-discipline, Fast-track, Brownfield, Regulatory, International, Incomplete Requirements
- **Client Profiles**: Type A/B/C/New Client with multipliers
- **Disciplines**: Civil, Mechanical, Electrical, Structural, Chemical, Environmental, Multi-discipline
- **Real-time Calculations**: Instant updates as you configure

### Team Management
- **Visual Role Assignment**: Color-coded buttons (green = assigned, orange = unassigned)
- **Discipline-Specific Teams**: Each discipline has designers, engineers, drafters, specialists
- **Inline Role Addition**: Add custom roles on-the-fly with "+" button
- **Company Employee Integration**: Assign real team members from employee list

### Cost Analysis
- **Role-Based Costing**: Different rates for each engineering role
- **Client-Specific Rates**: Custom billing rates per client
- **RACI Breakdown**: Costs distributed by Responsible, Accountable, Consulted, Informed
- **Deliverable Tracking**: Cost breakdown by deliverable and phase

### Example Calculation
```
Base Hours:        1,200 (Medium project)
× Complexity:      × 1.50 (Multi + Fast-track)
× Client Factor:   × 1.40 (Type A)
= Adjusted:        2,520 hours
+ Contingency 15%: + 378 hours
────────────────────────────
Total:             2,898 hours ✓
Duration:          ~23 weeks
Cost:              Calculated based on role rates
```

## 🔐 Login Credentials

**Your Account:**
- Email: `watson.m.kevin@gmail.com`
- Password: `password123`

**Test Accounts:**
- Admin: `admin@example.com` / `admin123`
- Manager: `manager@example.com` / `manager123`
- Engineer: `engineer@example.com` / `engineer123`

## 🛠️ Requirements

### Automatic Setup (Recommended)
- **Docker Desktop** - Download from https://docker.com
- **Node.js 18+** - Download from https://nodejs.org
- **Python 3.11+** - Download from https://python.org

### Manual Setup
- PostgreSQL 15+
- Redis 7+
- Node.js 18+
- Python 3.11+

## 📞 Troubleshooting

### Setup fails?
1. Make sure Docker Desktop is running
2. Check you have internet connection
3. Try running as administrator
4. Check `SETUP_GUIDE.md` for detailed help

### Can't connect to backend?
1. Check Docker containers: `docker ps`
2. Check logs: `cd backend && docker-compose logs`
3. Restart: `cd backend && docker-compose restart`

### Frontend won't start?
1. Delete node_modules: `rm -rf frontend/node_modules`
2. Reinstall: `cd frontend && npm install`
3. Try again: `npm run dev`

## 🚦 Start/Stop Commands

### Start System
**Windows:** Double-click `start.bat`
**Mac/Linux:** Run `./start.sh`

### Stop System
**Windows:** Double-click `stop.bat`
**Mac/Linux:** Run `./stop.sh`

## 🏗️ Project Structure

```
Project Estimation Tool/
├── setup_wizard.bat/sh      ← One-time setup
├── start.bat/sh             ← Start the application
├── stop.bat/sh              ← Stop all services
├── backend/                 ← Python FastAPI backend
│   ├── app/
│   │   ├── api/            ← API endpoints
│   │   ├── models/         ← Database models
│   │   ├── services/       ← Business logic
│   │   ├── schemas/        ← Pydantic schemas
│   │   ├── crud/           ← Database operations
│   │   └── data/           ← Templates and defaults
│   ├── migrations/         ← Alembic database migrations
│   └── tests/              ← Backend tests
├── frontend/                ← React TypeScript frontend
│   ├── src/
│   │   ├── components/     ← React components
│   │   ├── pages/          ← Page components
│   │   ├── contexts/       ← React contexts
│   │   ├── services/       ← API client
│   │   └── types/          ← TypeScript types
│   └── public/
└── next session instructions/  ← Development roadmap
```

## 🚧 Upcoming Features (Planned)

Based on the development roadmap in "next session instructions":

### Priority 1: Save/Load Projects
- Database persistence for project configurations
- Save/load project states
- Project templates and duplication
- Auto-save functionality

### Priority 2: Excel WBS Export
- Export work breakdown structure to Excel
- Customizable columns and formatting
- Timeline and dependency tracking

### Priority 3: Campaign/Repeat Projects
- Learning curve calculations for repeat projects
- Volume-based pricing optimization
- Campaign project management

### Priority 4: Resource Management Dashboard
- Team member capacity tracking
- Project allocation visualization
- Overallocation warnings
- Gantt-style timeline view

### Priority 5: Proposal Generation
- PDF proposal generation
- Customizable templates
- Version tracking
- Status tracking (Draft → Sent → Approved)

## ✨ Getting Started Guide

After setup, follow this workflow to create your first estimate:

### 1. Login
- Use your credentials or test accounts
- Access the dashboard

### 2. Create a New Estimate
Navigate through the 7-step process:

**Step 1: Setup**
- Select project size (Small/Medium/Large/Phase-Gate)
- Choose disciplines (single or multi-discipline)
- Enable complexity factors (Fast-track, Brownfield, etc.)
- Set client profile and contingency

**Step 2: Team Builder**
- View discipline-specific roles
- Click orange buttons to assign team members
- Add custom roles with "+" button
- All assigned roles turn green

**Step 3: Deliverables**
- Select required deliverables from matrix
- Configure deliverable-specific parameters
- Review hours allocation

**Step 4: Work Breakdown Structure (WBS)**
- Review task breakdown
- Set dependencies and sequencing
- Adjust timeline

**Step 5: RACI Matrix**
- Assign responsibilities (Responsible, Accountable, Consulted, Informed)
- Ensure all deliverables have owners

**Step 6: Cost Analysis**
- Review cost breakdown by role
- See cost breakdown by deliverable
- Compare to client-specific rates

**Step 7: Summary**
- Final review of all estimates
- Total hours, duration, and cost
- Export or save project

### 3. Client Management
- Configure client-specific billing rates
- Compare rates across clients
- Set default rate structures

### 4. Explore API Documentation
- Visit http://localhost:8000/api/docs
- Test endpoints interactively
- Review data schemas

## 🔧 Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT
- **Containerization**: Docker & Docker Compose

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS (assumed from modern UI reference)

## 🎉 Current Status

**Phase**: Active Development
**Version**: In Progress
**Status**: Core features implemented, ready for enhancement phase

The system has a solid foundation with:
- Complete estimation workflow (7 steps)
- Multi-discipline support
- Client rate management
- Cost analysis and breakdowns
- Authentication and user management

**Next Phase**: Implementing project persistence, Excel export, and advanced features per roadmap.

---

## 📞 Support & Troubleshooting

**Need Help?** Check the documentation or review logs:
- **Setup Issues**: See `SETUP_GUIDE.md`
- **Backend Logs**: `cd backend && docker-compose logs`
- **Frontend Logs**: Check terminal running `npm run dev`
- **API Issues**: Visit http://localhost:8000/api/docs to test endpoints
- **Database**: Connect to PostgreSQL at `localhost:5432` (credentials in `.env`)

**Common Issues**:
1. **Port already in use**: Stop other services on ports 3000, 8000, 5432, 6379
2. **Docker not running**: Start Docker Desktop before running start script
3. **Dependencies missing**: Re-run setup wizard or `npm install` / `pip install -r requirements.txt`