# Complete Setup Guide - Engineering Estimation System

This guide will help you get both the backend and frontend running.

## Prerequisites

- **Python 3.11+** (for backend)
- **Node.js 18+** and npm (for frontend)
- **Docker & Docker Compose** (optional but recommended)
- **PostgreSQL 15+** (if not using Docker)
- **Redis 7+** (if not using Docker)

## Quick Start (Easiest Method)

### Option 1: Using Docker Compose (Recommended)

This starts the entire backend stack with one command:

```bash
# Navigate to backend directory
cd backend

# Start all services (PostgreSQL, Redis, API)
docker-compose up -d

# Check logs
docker-compose logs -f api

# Run database migrations
docker-compose exec api alembic upgrade head

# (Optional) Seed sample data
docker-compose exec api python scripts/seed_data.py
```

Backend will be available at: http://localhost:8000
API Docs: http://localhost:8000/api/docs

### Option 2: Manual Setup

#### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements/dev.txt

# Copy environment file
cp .env.example .env

# Edit .env file with your database credentials
# Make sure PostgreSQL and Redis are running

# Run migrations
alembic upgrade head

# (Optional) Seed sample users
python scripts/seed_data.py

# Start development server
uvicorn app.main:app --reload --port 8000
```

## Frontend Setup

```bash
# Navigate to frontend directory (open new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

## Testing the System

### 1. Test Backend API

Open http://localhost:8000/api/docs in your browser.

Try these endpoints:

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Quick Estimation (No Auth Required for Testing):**
```bash
curl -X POST http://localhost:8000/api/v1/estimation/quick-estimate \
  -H "Content-Type: application/json" \
  -d '{
    "project_size": "medium",
    "complexity_factors": {
      "multidiscipline": true,
      "fasttrack": true
    },
    "client_profile": "type_a",
    "resource_availability": {"engineer": 100},
    "contingency_percent": 15
  }'
```

Expected response:
```json
{
  "base_hours": 1200,
  "complexity_multiplier": 1.5,
  "client_multiplier": 1.4,
  "adjusted_hours": 2520,
  "contingency_hours": 378,
  "total_hours": 2898,
  "duration_weeks": 23,
  "confidence_level": "medium",
  "confidence_score": 72.5
}
```

### 2. Test Frontend → Backend Integration

1. **Open Frontend**: http://localhost:3000
2. **Click "Quick Estimate"**
3. **Configure Project**:
   - Select "Medium" size
   - Check "Fast-track" and "Multi-discipline"
   - Select "Type A" client
4. **See Results**: Should show ~2898 hours instantly

### 3. Create Full Project

1. **Click "New Project"** on dashboard
2. **Fill Form**:
   - Name: "Test Chemical Plant Expansion"
   - Size: Large
   - Discipline: Chemical
   - Client Profile: Type A
3. **Click "Create Project"**
4. **Configure Estimation**: Check complexity factors
5. **See Real-time Updates**: Hours calculate automatically
6. **Click "Save Project"** to persist

## Project Structure

```
Project Estimation Tool/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # REST API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic (estimation engine)
│   ├── migrations/         # Database migrations
│   ├── tests/              # Test suite
│   └── docker-compose.yml  # Docker setup
│
└── frontend/               # React TypeScript frontend
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── pages/          # Page components
    │   ├── services/       # API service layer
    │   └── types/          # TypeScript types
    └── package.json
```

## Common Issues & Solutions

### Backend Issues

**Issue: Database connection error**
```
Solution:
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env file
- For Docker: docker-compose logs postgres
```

**Issue: Redis connection error**
```
Solution:
- Make sure Redis is running
- Check REDIS_URL in .env file
- For Docker: docker-compose logs redis
```

**Issue: Module not found**
```
Solution:
- Activate virtual environment
- pip install -r requirements/dev.txt
```

### Frontend Issues

**Issue: Cannot connect to backend (CORS error)**
```
Solution:
- Check backend is running on port 8000
- Check vite.config.ts proxy configuration
- Verify CORS_ORIGINS in backend config.py
```

**Issue: npm install fails**
```
Solution:
- Delete node_modules and package-lock.json
- npm install again
- Check Node.js version (need 18+)
```

**Issue: Page is blank**
```
Solution:
- Check browser console for errors
- Check backend API is accessible
- Try npm run dev --force
```

## Development Workflow

### Backend Development

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app --cov-report=html

# Format code
black app/ tests/

# Type checking
mypy app/

# Create database migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Frontend Development

```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login

### Projects
- `GET /api/v1/projects/` - List projects
- `POST /api/v1/projects/` - Create project
- `GET /api/v1/projects/{id}` - Get project
- `PUT /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

### Estimation
- `POST /api/v1/estimation/quick-estimate` - Quick calculation
- `POST /api/v1/estimation/{project_id}/estimate` - Calculate for project
- `GET /api/v1/estimation/complexity-factors` - Get factors info

## Sample Test Data

After seeding, you can login with:

- **Admin**: admin@example.com / admin123456
- **Manager**: manager@example.com / manager123456
- **Engineer**: engineer@example.com / engineer123456

## Next Steps

1. **Create your first project** via the frontend
2. **Experiment with complexity factors** and see calculations update
3. **Explore the API** at http://localhost:8000/api/docs
4. **Review the code** to understand the estimation engine
5. **Add new features** like risk analysis or resource optimization

## Stopping the System

### Docker:
```bash
cd backend
docker-compose down
```

### Manual:
- Press Ctrl+C in both terminal windows (backend and frontend)
- Deactivate Python virtual environment: `deactivate`

## Production Deployment

See individual README files:
- `backend/README.md` - Backend deployment guide
- `frontend/README.md` - Frontend deployment guide

## Support

For issues or questions:
1. Check the logs: `docker-compose logs` or terminal output
2. Review the README files in backend/ and frontend/
3. Check the API documentation at /api/docs

## Key Features Implemented

✅ **Backend**:
- FastAPI REST API
- Async PostgreSQL with SQLAlchemy
- JWT authentication
- Estimation engine with complexity calculations
- Database migrations with Alembic
- Docker containerization

✅ **Frontend**:
- React 18 with TypeScript
- Real-time estimation calculations
- Project management dashboard
- Responsive design with Tailwind CSS
- API integration with Axios

## What's Working

1. **Quick Estimation**: Test calculations without saving
2. **Project Creation**: Create and manage projects
3. **Real-time Calculations**: See results update instantly
4. **Complexity Factors**: Multi-discipline, fast-track, brownfield, etc.
5. **Client Profiles**: Type A/B/C with different multipliers
6. **Contingency Adjustment**: Slider for 0-50% contingency
7. **Dashboard**: View all projects with status

The system is fully functional for core estimation features!