# 🚀 Quick Start - Get Running in 5 Minutes

## The Fastest Way to See It Work

### Step 1: Start Backend (Choose One)

**Option A - Docker (Easiest):**
```bash
cd backend
docker-compose up -d
docker-compose exec api alembic upgrade head
```

**Option B - Manual:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements/base.txt
cp .env.example .env
# Edit .env: Set DATABASE_URL and REDIS_URL if needed
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

Backend running at: **http://localhost:8000**
API Docs: **http://localhost:8000/api/docs**

### Step 2: Start Frontend

```bash
# Open new terminal
cd frontend
npm install
npm run dev
```

Frontend running at: **http://localhost:3000**

### Step 3: Test It!

1. Open http://localhost:3000
2. Click **"Quick Estimate"**
3. Select **Medium** size
4. Check **"Fast-track"** and **"Multi-discipline"** boxes
5. Select **"Type A"** client
6. Watch the hours jump from 1,200 → 1,800 → 2,520 → 2,898!

## What You Should See

```
Base Hours:           1,200 (Medium project)
× Complexity:         × 1.50 (Multi-disc 20% + Fast-track 30%)
× Client:             × 1.40 (Type A heavy oversight)
= Adjusted:           2,520 hours
+ Contingency (15%):  + 378 hours
─────────────────────────────
TOTAL:                2,898 hours
Duration:             ~23 weeks
```

## Test the Full Flow

### Create a Project

1. Go to Dashboard: http://localhost:3000
2. Click **"+ New Project"**
3. Fill in:
   - Name: "Chemical Plant Expansion"
   - Size: Large
   - Discipline: Chemical
   - Client: Type A
4. Click **"Create Project"**

### Configure Estimation

1. On the project page, check these complexity factors:
   - ✅ Multi-discipline
   - ✅ Fast-track
   - ✅ Brownfield
   - ✅ Heavy Regulatory

2. Watch the calculation:
   - Base: 3,500 hours (Large)
   - Complexity: ×1.90 (20+30+25+15%)
   - Client: ×1.40 (Type A)
   - Result: **9,268 hours total!**

3. Click **"Save Project"**

## Test Backend API Directly

```bash
# Quick estimate via API
curl -X POST http://localhost:8000/api/v1/estimation/quick-estimate \
  -H "Content-Type: application/json" \
  -d '{
    "project_size": "medium",
    "complexity_factors": {"multidiscipline": true, "fasttrack": true},
    "client_profile": "type_a",
    "resource_availability": {"engineer": 100},
    "contingency_percent": 15
  }'
```

Expected result:
```json
{
  "total_hours": 2898,
  "duration_weeks": 23,
  "confidence_level": "medium",
  ...
}
```

## Verify Everything Works

✅ Backend health: http://localhost:8000/health
✅ API docs: http://localhost:8000/api/docs
✅ Frontend loads: http://localhost:3000
✅ Quick estimate works
✅ Project creation works
✅ Real-time calculation updates

## Sample Calculation Scenarios

### Scenario 1: Simple Small Project
- Size: Small (300 base hours)
- Factors: None
- Client: Type B (standard)
- Contingency: 15%
- **Result: 345 hours, 11 weeks**

### Scenario 2: Complex Medium Project
- Size: Medium (1,200 base hours)
- Factors: Multi-discipline + Fast-track
- Client: Type A (heavy oversight)
- Contingency: 20%
- **Result: 3,024 hours, 24 weeks**

### Scenario 3: Large Brownfield Project
- Size: Large (3,500 base hours)
- Factors: Brownfield + Regulatory + International
- Client: Type A
- Contingency: 25%
- **Result: 10,781 hours, 46 weeks**

## Troubleshooting

**Backend won't start:**
- Check Python version: `python --version` (need 3.11+)
- Check ports: `netstat -an | grep 8000`
- Check Docker: `docker-compose logs api`

**Frontend won't start:**
- Check Node version: `node --version` (need 18+)
- Delete node_modules: `rm -rf node_modules && npm install`
- Check ports: `netstat -an | grep 3000`

**Can't connect:**
- Backend running? Check http://localhost:8000/health
- Check browser console for errors
- CORS issue? Check backend logs

## What's Working

✅ Estimation calculations with compounding multipliers
✅ Real-time updates as you change parameters
✅ Project creation and management
✅ Complexity factors (6 types)
✅ Client profile adjustments
✅ Contingency slider
✅ Duration calculation
✅ Confidence scoring
✅ Dashboard with project cards
✅ Responsive design

## Next: Explore the Code

**Key Files to Understand:**

Backend Estimation Engine:
- `backend/app/services/estimation/engine.py` - Main calculator
- `backend/app/services/estimation/complexity.py` - Complexity factors
- `backend/app/api/v1/endpoints/estimation.py` - API endpoints

Frontend Components:
- `frontend/src/pages/ProjectEstimation.tsx` - Main estimation page
- `frontend/src/components/EstimationSummary.tsx` - Results display
- `frontend/src/services/api.ts` - API integration

## Stop Everything

```bash
# Stop frontend: Ctrl+C in terminal

# Stop backend:
docker-compose down        # If using Docker
# OR Ctrl+C in terminal    # If manual
```

---

**You're ready!** The system is working end-to-end. Try different combinations of project size, complexity, and client profiles to see how the calculations work.