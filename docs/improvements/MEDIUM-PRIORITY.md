# Medium Priority Improvements - Project Estimator

**Date:** October 2, 2025
**Reviewer:** Ryan

These issues impact code quality and maintainability but aren't blocking core functionality.

---

## MED-001: Overly Complex React Components

### What It Is
Several React components exceed 500+ lines with too many responsibilities.

### Files Affected
- `frontend/src/components/DeliverablesMatrix.tsx` - **1,050+ lines, 19 useState hooks**
- `frontend/src/components/WBS.tsx` - 680 lines
- `frontend/src/components/RACIMatrix.tsx` - 580 lines

### The Problem

**DeliverablesMatrix.tsx has too many responsibilities:**
- Template loading and caching
- Deliverable selection logic
- Custom deliverable creation
- RACI breakdown calculations
- Cost calculations
- Hours adjustments
- Discipline expansion state
- Custom hours overrides
- Phase filtering
- Search/filter logic

This creates:
- High cognitive load when reading code
- Difficult to test individual features
- Hard to reuse logic
- Performance issues (unnecessary re-renders)
- Merge conflicts when multiple people edit

### How to Fix

**Extract smaller focused components:**

```
DeliverablesMatrix/ (folder)
├── DeliverablesMatrix.tsx           # Orchestrator (200 lines)
├── DeliverablesHeader.tsx            # Controls, filters (100 lines)
├── DeliverablesByPhase/
│   ├── PhaseSection.tsx              # Phase grouping (150 lines)
│   ├── DisciplineGroup.tsx           # Discipline expansion (100 lines)
│   └── DeliverableRow.tsx            # Individual deliverable (80 lines)
├── CustomDeliverableModal.tsx        # Add custom (150 lines)
├── RACIBreakdownModal.tsx            # RACI details (120 lines)
└── hooks/
    ├── useDeliverablesTemplate.ts    # Template loading
    ├── useDeliverableSelection.ts    # Selection logic
    └── useDeliverableCalculations.ts # Hours/cost math
```

**Extract state to custom hooks:**

```typescript
// hooks/useDeliverablesTemplate.ts
export function useDeliverablesTemplate(projectSize: string) {
  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTemplate(projectSize);
  }, [projectSize]);

  const loadTemplate = async (size: string) => {
    // ... loading logic
  };

  return { template, loading, error, reloadTemplate: loadTemplate };
}

// Then in component:
const { template, loading, error } = useDeliverablesTemplate(projectSize);
```

### Benefits
- Each component under 200 lines
- Easy to test individual features
- Better performance (targeted re-renders)
- Easier to understand and modify
- Reusable logic across pages

---

## MED-002: Excessive TypeScript `any` Usage

### What It Is
40+ occurrences of `any` type throughout frontend code, bypassing type safety.

### Files Affected
- `frontend/src/pages/Dashboard.tsx` (multiple instances)
- `frontend/src/components/DeliverablesMatrix.tsx`
- `frontend/src/components/WBS.tsx`
- Others

### Examples

```typescript
// Dashboard.tsx:416
onChange={(e) => setFormData({
  ...formData,
  size: e.target.value as any  // ⚠️ Should be: as ProjectSize
})}

// DeliverablesMatrix.tsx:93
Object.values(raci).flat().forEach((assignment: any) => {
  // ⚠️ Should define Assignment interface
});

// Multiple files
const [data, setData] = useState<any>(null);  // ⚠️ Should have proper type
```

### Why It Matters
- Loses TypeScript's main benefit (compile-time type checking)
- Runtime errors that could be caught at compile time
- No autocomplete/IntelliSense
- Harder to refactor safely
- Hides bugs

### How to Fix

1. **Define proper interfaces:**
```typescript
// types/project.ts
export enum ProjectSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  PHASE_GATE = 'phase-gate'
}

interface Assignment {
  member: string;
  role: string;
  hours: number;
  responsibility: 'R' | 'A' | 'C' | 'I';
}

interface RACIBreakdown {
  responsible: Assignment[];
  accountable: Assignment[];
  consulted: Assignment[];
  informed: Assignment[];
}
```

2. **Use proper types:**
```typescript
// Before:
onChange={(e) => setFormData({ ...formData, size: e.target.value as any })}

// After:
onChange={(e) => setFormData({ ...formData, size: e.target.value as ProjectSize })}

// Before:
Object.values(raci).flat().forEach((assignment: any) => {

// After:
Object.values(raci).flat().forEach((assignment: Assignment) => {
```

3. **Add type guards where needed:**
```typescript
function isProjectSize(value: string): value is ProjectSize {
  return ['small', 'medium', 'large', 'phase-gate'].includes(value);
}
```

---

## MED-003: Missing Input Validation in API Schemas

### What It Is
Pydantic schemas don't validate business rules - only basic types.

### Files Affected
- `backend/app/schemas/project.py`
- Other schema files

### Missing Validations

```python
class ProjectCreate(BaseModel):
    project_code: str  # No format validation
    contingency_percent: float  # Could be -100 or 1000
    client_complexity: int  # Could be -5 or 99
    selected_disciplines: List[str]  # Could be empty list
```

### How to Fix

```python
from pydantic import validator, Field
import re

class ProjectCreate(BaseModel):
    project_code: Optional[str] = Field(None, max_length=50)
    contingency_percent: float = Field(ge=0, le=100, default=15.0)
    client_complexity: int = Field(ge=1, le=10, default=5)
    selected_disciplines: List[str] = Field(min_items=1)

    @validator('project_code')
    def validate_code_format(cls, v):
        if v and not re.match(r'^[A-Z0-9-]+$', v):
            raise ValueError(
                'Project code must be uppercase alphanumeric with hyphens'
            )
        return v

    @validator('selected_disciplines')
    def validate_disciplines(cls, v):
        valid_disciplines = [
            'civil', 'mechanical', 'electrical', 'structural',
            'chemical', 'environmental', 'instrumentation'
        ]
        invalid = [d for d in v if d not in valid_disciplines]
        if invalid:
            raise ValueError(f'Invalid disciplines: {invalid}')
        return v
```

### Why It Matters
- Better error messages for invalid input
- Prevents garbage data in database
- Catches bugs earlier (API level vs database level)
- Self-documenting (shows valid ranges)

---

## MED-004: No React Error Boundaries

### What It Is
No error boundaries to catch component errors gracefully.

### Files Affected
- `frontend/src/App.tsx` (missing wrapper)

### The Problem
When any React component throws an error:
- Entire application crashes (white screen)
- User sees nothing (no error message)
- Must refresh browser to recover
- No error reporting

### How to Fix

1. **Create ErrorBoundary component:**
```typescript
// components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Send to error tracking service (Sentry, etc)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

2. **Wrap routes in App.tsx:**
```typescript
function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/estimation" element={<EstimationWorkflow />} />
          {/* ... */}
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}
```

3. **Add boundaries around complex components:**
```typescript
<ErrorBoundary fallback={<DeliverableError />}>
  <DeliverablesMatrix {...props} />
</ErrorBoundary>
```

---

## MED-005: Missing CORS Configuration for Production

### What It Is
CORS origins are hardcoded to localhost in configuration.

### Files Affected
- `backend/app/config.py` (lines 74-78)

### The Problem
```python
CORS_ORIGINS: list[str] = [
    "http://localhost:3000",
    "http://localhost:3001"
]
```

Can't deploy to production domains without changing code.

### How to Fix

1. **Update .env.example:**
```bash
# Development (default)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Production
CORS_ORIGINS=https://estimation.company.com,https://app.company.com
```

2. **Parse comma-separated list:**
```python
from pydantic import validator

class Settings(BaseSettings):
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    @validator('CORS_ORIGINS', pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',')]
        return v
```

3. **Environment-specific configs:**
```python
# config.py
import os

class Settings(BaseSettings):
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    @property
    def cors_origins(self) -> list[str]:
        if self.ENVIRONMENT == "production":
            # Strict production domains
            return [
                "https://estimation.company.com",
                "https://app.company.com"
            ]
        else:
            # Permissive development
            return ["http://localhost:3000", "http://localhost:3001"]
```

---

## MED-006: Inconsistent Error Handling Patterns

### What It Is
Mix of exception types and error handling approaches across codebase.

### Examples

**Some endpoints use custom exceptions:**
```python
# services/estimation/engine.py
raise CalculationException("Invalid project size")
```

**Others use generic HTTPException:**
```python
# api/v1/endpoints/projects.py
raise HTTPException(status_code=400, detail="Project not found")
```

**Some return error dicts:**
```python
return {"error": "Something went wrong"}
```

### Why It Matters
- Inconsistent error responses for frontend
- Hard to add global error handling
- Difficult to standardize error logging
- No clear error handling strategy

### How to Fix

1. **Define custom exception hierarchy:**
```python
# core/exceptions.py
class ProjectEstimatorException(Exception):
    """Base exception for all application errors."""
    pass

class ValidationError(ProjectEstimatorException):
    """Input validation failed."""
    pass

class NotFoundError(ProjectEstimatorException):
    """Resource not found."""
    pass

class AuthenticationError(ProjectEstimatorException):
    """Authentication failed."""
    pass

class CalculationError(ProjectEstimatorException):
    """Estimation calculation error."""
    pass
```

2. **Add exception handlers:**
```python
# main.py
from core.exceptions import ProjectEstimatorException

@app.exception_handler(ValidationError)
async def validation_error_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=400,
        content={
            "error": "validation_error",
            "message": str(exc),
            "type": "ValidationError"
        }
    )

@app.exception_handler(NotFoundError)
async def not_found_handler(request: Request, exc: NotFoundError):
    return JSONResponse(
        status_code=404,
        content={
            "error": "not_found",
            "message": str(exc),
            "type": "NotFoundError"
        }
    )
```

3. **Standardize usage:**
```python
# Before:
if not project:
    raise HTTPException(status_code=404, detail="Project not found")

# After:
if not project:
    raise NotFoundError(f"Project {project_id} not found")
```

---

## MED-007: Magic Numbers in Business Logic

### What It Is
Hardcoded multipliers and thresholds in code that business users might want to adjust.

### Files Affected
- `backend/app/services/estimation/complexity.py`

### Examples
```python
COMPLEXITY_FACTORS = {
    'multidiscipline': 0.20,      # +20%
    'fasttrack': 0.30,            # +30%
    'brownfield': 0.15,           # +15%
    'regulatory': 0.25,           # +25%
    'international': 0.20,        # +20%
    'incomplete_requirements': 0.35  # +35%
}
```

### Why It Matters
- Business rules are locked in code
- Changing multipliers requires code deploy
- Can't A/B test different values
- Non-developers can't adjust business logic

### How to Fix

1. **Move to database configuration:**
```python
class ComplexityFactor(Base):
    __tablename__ = "complexity_factors"

    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    multiplier = Column(Float)
    description = Column(String)
    is_active = Column(Boolean, default=True)
```

2. **Load from database:**
```python
async def get_complexity_multipliers(db: AsyncSession) -> Dict[str, float]:
    """Load current complexity multipliers from database."""
    result = await db.execute(
        select(ComplexityFactor).where(ComplexityFactor.is_active == True)
    )
    factors = result.scalars().all()
    return {f.name: f.multiplier for f in factors}
```

3. **Add admin UI to manage:**
```typescript
// Allow admins to adjust multipliers without code changes
<ComplexityFactorEditor
  factors={complexityFactors}
  onUpdate={updateMultipliers}
/>
```

### Benefits
- Business users can tune estimates
- Can experiment with different values
- A/B test estimate accuracy
- No code deploys for business rule changes
