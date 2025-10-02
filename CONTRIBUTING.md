# Engineering Estimation System - Collaborator Guide

Welcome to the Engineering Estimation System! This guide will help you get up and running quickly.

## 📋 What This Project Does

This is a full-stack engineering project estimation tool that helps teams:

- **Estimate project hours & costs** - Calculate accurate project estimates based on size, complexity, and client factors
- **Build multi-discipline teams** - Assign roles across Civil, Mechanical, Electrical, and other engineering disciplines
- **Configure deliverables** - Select and customize project deliverables with built-in templates
- **Create work breakdown structures (WBS)** - Organize tasks and dependencies
- **Assign responsibilities (RACI)** - Define who is Responsible, Accountable, Consulted, and Informed
- **Analyze costs** - Break down costs by role, deliverable, and phase
- **Manage client rates** - Configure client-specific billing rates and compare across clients

### Key Features

**7-Step Estimation Workflow:**
1. **Setup** - Configure project size, disciplines, complexity factors
2. **Team Builder** - Visual role assignment with discipline-specific teams
3. **Deliverables** - Comprehensive deliverable selection matrix
4. **WBS** - Work breakdown structure and task planning
5. **RACI** - Responsibility assignment matrix
6. **Cost Analysis** - Detailed cost breakdowns
7. **Summary** - Final estimation with all metrics

**Example Calculation:**
```
Base Hours:        1,200 (Medium project)
× Complexity:      × 1.50 (Multi-discipline + Fast-track)
× Client Factor:   × 1.40 (Type A client)
= Adjusted:        2,520 hours
+ Contingency 15%: + 378 hours
────────────────────────────
Total:             2,898 hours
Duration:          ~23 weeks
```

## 🚀 Quick Start (5 Minutes)

### Prerequisites

Make sure you have installed:
- **Docker Desktop** - [Download here](https://docker.com) (Required for database)
- **Node.js 18+** - [Download here](https://nodejs.org)
- **Python 3.11+** - [Download here](https://python.org)

### Setup Steps

#### Windows Users
1. Clone the repository
2. Double-click **`start.bat`**
3. Wait for services to start
4. Open http://localhost:3000

#### Mac/Linux Users
1. Clone the repository
2. Run `./start.sh` in terminal
3. Wait for services to start
4. Open http://localhost:3000

That's it! The start script automatically:
- Checks if Docker is running (starts it if needed)
- Starts PostgreSQL database
- Runs database migrations
- Starts the backend API (FastAPI)
- Starts the frontend dev server (React/Vite)

### Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs

### Login Credentials

Use these test accounts to explore:

**Primary Account:**
- Email: `watson.m.kevin@gmail.com`
- Password: `password123`

**Test Accounts:**
- Admin: `admin@example.com` / `admin123`
- Manager: `manager@example.com` / `manager123`
- Engineer: `engineer@example.com` / `engineer123`

## 🏗️ Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT tokens
- **Containerization**: Docker & Docker Compose

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: React Context
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **Charts**: Recharts

## 📂 Project Structure

```
Project Estimation Tool/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── models/         # Database models (SQLAlchemy)
│   │   ├── services/       # Business logic & estimation engine
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── crud/           # Database operations
│   │   └── data/           # Templates and default data
│   ├── migrations/         # Alembic database migrations
│   ├── scripts/            # Utility scripts
│   └── tests/              # Backend tests
│
├── frontend/                # React TypeScript frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript type definitions
│   └── public/
│
├── start.bat / start.sh     # One-command startup script
├── stop.bat / stop.sh       # Stop all services
└── setup_wizard.*           # Initial one-time setup (if needed)
```

## 🛠️ Development Workflow

### Running the Application

**Start everything:**
```bash
# Windows
start.bat

# Mac/Linux
./start.sh
```

**Stop everything:**
```bash
# Windows
stop.bat

# Mac/Linux
./stop.sh
```

### Working with the Backend

```bash
cd backend

# Activate virtual environment (if needed)
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements/dev.txt

# Run migrations
alembic upgrade head

# Create a new migration
alembic revision --autogenerate -m "description"

# Run tests
pytest

# Start backend directly (without Docker)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Working with the Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

### Database Access

Connect to PostgreSQL:
- **Host**: localhost
- **Port**: 5432
- **Database**: estimation_db
- **User**: postgres
- **Password**: postgres

```bash
# Using psql
psql -h localhost -U postgres -d estimation_db

# Using Docker
docker exec -it backend-db-1 psql -U postgres -d estimation_db
```

## 🔍 Using Claude Code

This project is Claude Code friendly! Here are some helpful prompts for Claude:

**Understanding the codebase:**
- "Explain how the estimation engine calculates project hours"
- "Show me where client-specific rates are applied"
- "How does the multi-discipline team builder work?"

**Making changes:**
- "Add a new complexity factor called 'Remote Work' with a 1.2x multiplier"
- "Create a new deliverable template for 'Safety Plan'"
- "Add export to Excel functionality for the WBS"

**Debugging:**
- "Why isn't the cost calculation updating when I change roles?"
- "Debug the client rate comparison feature"
- "Fix the authentication token refresh issue"

**Testing:**
- "Write tests for the complexity calculator"
- "Test the cost breakdown by deliverable"

## 📚 Key Concepts

### Estimation Engine

The core estimation logic is in `backend/app/services/estimation/`:

- **`complexity.py`** - Calculates complexity multipliers based on project factors
- **`hours_calculator.py`** - Computes base and adjusted hours
- **`confidence_scorer.py`** - Scores estimation confidence
- **`duration_optimizer.py`** - Optimizes project timeline

### Client Rate Management

Client-specific rates are managed through a hierarchy:
- **Industry** - Top level grouping
- **Company** - Client companies within industries
- **Rate Sheet** - Billing rates for each company
- **Rate Entries** - Individual role rates (e.g., Senior Engineer: $150/hr)

### Multi-Discipline Projects

Projects can span multiple engineering disciplines:
- Civil
- Mechanical
- Electrical
- Structural
- Chemical
- Environmental
- Instrumentation & Controls

Each discipline has its own set of roles and deliverables.

## 🐛 Troubleshooting

### Setup Issues

**Docker not running:**
```bash
# Start Docker Desktop manually, then run:
./start.sh
```

**Port conflicts (3000, 8000, 5432, 6379):**
```bash
# Stop other services using these ports, then restart:
./stop.sh
./start.sh
```

**Dependencies not installing:**
```bash
# Backend
cd backend
pip install --upgrade pip
pip install -r requirements/dev.txt

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

**Database connection errors:**
```bash
# Check Docker containers
docker ps

# Check backend logs
cd backend
docker-compose logs db
docker-compose logs backend

# Restart database
docker-compose restart db
```

**Migration errors:**
```bash
cd backend
alembic downgrade -1    # Rollback one migration
alembic upgrade head    # Re-run migrations
```

### Frontend Issues

**Build errors:**
```bash
cd frontend
rm -rf dist .vite node_modules
npm install
npm run dev
```

**TypeScript errors:**
```bash
cd frontend
npx tsc --noEmit  # Check for type errors
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest                          # Run all tests
pytest tests/unit              # Run unit tests only
pytest -v                      # Verbose output
pytest --cov=app               # With coverage
```

### Frontend Tests
```bash
cd frontend
npm run test                   # Run tests (if configured)
npm run lint                   # Run ESLint
```

## 📝 Making Contributions

### Before You Start

1. **Pull latest changes**: `git pull origin main`
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make sure tests pass**: Run backend and frontend tests

### Code Style

**Backend (Python):**
- Follow PEP 8 style guide
- Use type hints
- Document functions with docstrings
- Keep functions small and focused

**Frontend (TypeScript):**
- Use functional components with hooks
- Type all props and state
- Use meaningful variable names
- Keep components under 300 lines

### Committing Changes

```bash
git add .
git commit -m "Brief description of changes

More detailed explanation if needed.
- Bullet points for multiple changes
- Reference issue numbers if applicable
"
```

### Pull Requests

1. Push your branch: `git push origin feature/your-feature-name`
2. Create PR on GitHub
3. Add description of changes
4. Request review from team
5. Address feedback
6. Merge when approved

## 🚧 Upcoming Features

See `next session instructions/README.md` for planned features:

**Priority 1: Save/Load Projects**
- Database persistence for project configurations
- Project templates and duplication
- Auto-save functionality

**Priority 2: Excel WBS Export**
- Export work breakdown structure to Excel
- Customizable columns and formatting

**Priority 3: Campaign/Repeat Projects**
- Learning curve calculations for repeat projects
- Volume-based pricing optimization

**Priority 4: Resource Management Dashboard**
- Team capacity tracking
- Project allocation visualization
- Overallocation warnings

**Priority 5: Proposal Generation**
- PDF proposal generation
- Customizable templates
- Version tracking

## 📞 Getting Help

**Documentation:**
- `README.md` - Main project documentation
- `SETUP_GUIDE.md` - Detailed setup instructions
- `QUICKSTART.md` - 5-minute quick start
- `backend/README.md` - Backend-specific docs
- `frontend/README.md` - Frontend-specific docs

**API Documentation:**
- Visit http://localhost:8000/api/docs for interactive API docs
- Test endpoints directly from the browser

**Common Commands:**
```bash
# View all Docker containers
docker ps -a

# View backend logs
cd backend && docker-compose logs -f

# View database
docker exec -it backend-db-1 psql -U postgres -d estimation_db

# Reset database
cd backend && docker-compose down -v && docker-compose up -d
```

## 💡 Tips for Claude Users

When working with Claude Code on this project:

1. **Be specific about the file**: "Edit the complexity calculator in backend/app/services/estimation/complexity.py"

2. **Reference existing patterns**: "Add a new API endpoint following the pattern in backend/app/api/v1/endpoints/projects.py"

3. **Ask for explanations**: "Explain how the RACI matrix component works in frontend/src/components/RACIMatrix.tsx"

4. **Request tests**: "Write unit tests for the new feature I just added"

5. **Debug systematically**: "Check the backend logs and help debug why the cost calculation isn't working"

## 🎉 You're Ready!

You now have everything you need to contribute to the Engineering Estimation System. Start by:

1. Running `./start.bat` (Windows) or `./start.sh` (Mac/Linux)
2. Exploring the app at http://localhost:3000
3. Checking out the API docs at http://localhost:8000/api/docs
4. Reading through the codebase
5. Picking a feature from the roadmap to work on

Welcome to the team! 🚀
