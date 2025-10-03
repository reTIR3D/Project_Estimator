# Branch Workflow & Dual Environment Setup

## Branch Structure

The project uses two main branches for development and testing:

- **`master`** - Main production branch with stable, reviewed code
- **`beetz`** - Collaborative development branch for testing and experimentation

Both branches can be run simultaneously for comparison testing using different ports.

## Dual Environment Setup

Team members can run both master and beetz versions side-by-side for comparison:

### Clone Repository Twice

**Master version:**
```bash
git clone <repo-url> Project_Estimator_master
cd Project_Estimator_master
# Run on default ports (3000 frontend, 8000 backend)
./start.sh  # or start.bat on Windows
```

**Beetz version:**
```bash
git clone <repo-url> Project_Estimator_beetz
cd Project_Estimator_beetz
git checkout beetz
# Modify ports in config files (see below)
./start.sh  # or start.bat on Windows
```

### Port Configuration

| Branch | Frontend | Backend | Database | Redis |
|--------|----------|---------|----------|-------|
| master | 3000     | 8000    | 5432     | 6379  |
| beetz  | 3001     | 8001    | 5433     | 6380  |

### Configuring Ports for Beetz Branch

**Frontend (`frontend/vite.config.ts`):**
```typescript
export default defineConfig({
  server: {
    port: 3001,  // Change from 3000 to 3001
    // ...
  }
})
```

**Backend (`backend/docker-compose.yml`):**
```yaml
services:
  db:
    ports:
      - "5433:5432"  # Change from 5432:5432
  redis:
    ports:
      - "6380:6379"  # Change from 6379:6379
  backend:
    ports:
      - "8001:8000"  # Change from 8000:8000
```

**Backend API URL (`frontend/.env` or `frontend/src/config.ts`):**
```
VITE_API_URL=http://localhost:8001
```

## Workflow

### Working on Master Branch

```bash
cd Project_Estimator_master
git pull origin master
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "Your changes"
git push origin feature/your-feature
# Create pull request to master
```

### Working on Beetz Branch

```bash
cd Project_Estimator_beetz
git pull origin beetz
git checkout -b experiment/your-experiment
# Make changes
git add .
git commit -m "Your experimental changes"
git push origin experiment/your-experiment
# Create pull request to beetz
```

### Comparing Versions

1. Start master version: `cd Project_Estimator_master && ./start.sh`
2. Start beetz version: `cd Project_Estimator_beetz && ./start.sh`
3. Access master at http://localhost:3000
4. Access beetz at http://localhost:3001
5. Compare features side-by-side

## Benefits

- **Safe Experimentation**: Test new features without affecting stable code
- **Direct Comparison**: Run both versions simultaneously to compare behavior
- **Independent Development**: Multiple team members can work on different branches
- **Easy Rollback**: Master branch remains stable while beetz evolves

## Merging Between Branches

### From Beetz to Master (After Testing)

```bash
cd Project_Estimator_master
git checkout master
git pull origin master
git merge origin/beetz
# Resolve any conflicts
git push origin master
```

### From Master to Beetz (Sync Latest Stable)

```bash
cd Project_Estimator_beetz
git checkout beetz
git pull origin beetz
git merge origin/master
# Resolve any conflicts
git push origin beetz
```
