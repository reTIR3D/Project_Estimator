# Low Priority Improvements - Project Estimator

**Date:** October 2, 2025
**Reviewer:** Ryan

These are nice-to-haves that improve polish and maintainability but aren't urgent.

---

## LOW-001: Missing API Versioning Strategy

### What It Is
API uses `/api/v1/` prefix but no plan for v2 migration or deprecation.

### Current State
```python
# main.py
app.include_router(api_router, prefix="/api/v1")
```

### Why Document This
Eventually you'll need to:
- Add new features that break backward compatibility
- Deprecate old endpoints
- Support multiple API versions simultaneously
- Migrate clients from v1 to v2

### Recommendations for Future

**Option 1: URL Versioning (current approach)**
```
/api/v1/projects  # Current
/api/v2/projects  # Future - breaking changes
```

**Deprecation headers:**
```python
@app.middleware("http")
async def add_deprecation_headers(request: Request, call_next):
    response = await call_next(request)
    if request.url.path.startswith("/api/v1/"):
        response.headers["Deprecation"] = "true"
        response.headers["Sunset"] = "2026-01-01"  # End of support date
        response.headers["Link"] = '</api/v2/docs>; rel="successor-version"'
    return response
```

**Version negotiation:**
```python
# Support both v1 and v2 simultaneously
app.include_router(api_v1_router, prefix="/api/v1")
app.include_router(api_v2_router, prefix="/api/v2")
```

Not urgent now, but good to plan for.

---

## LOW-002: No Accessibility Attributes

### What It Is
Frontend components lack ARIA labels and semantic HTML.

### Current State
- 0 `aria-label` attributes found
- Buttons without labels
- Forms without proper associations
- No keyboard navigation support

### Why It Matters
- Screen readers can't describe interface
- Keyboard-only users can't navigate
- Fails WCAG 2.1 AA compliance
- May violate accessibility laws (ADA, Section 508)

### Examples of Improvements

**Buttons need labels:**
```typescript
// Before:
<button onClick={createProject}>+</button>

// After:
<button
  onClick={createProject}
  aria-label="Create new project"
>
  +
</button>
```

**Forms need associations:**
```typescript
// Before:
<input
  type="text"
  value={projectName}
  onChange={e => setProjectName(e.target.value)}
/>

// After:
<label htmlFor="project-name">Project Name</label>
<input
  id="project-name"
  type="text"
  value={projectName}
  onChange={e => setProjectName(e.target.value)}
  aria-required="true"
  aria-describedby="project-name-help"
/>
<span id="project-name-help">
  Enter a unique name for this project
</span>
```

**Loading states:**
```typescript
// Before:
{loading && <div>Loading...</div>}

// After:
{loading && (
  <div role="status" aria-live="polite">
    <span className="sr-only">Loading projects</span>
    <LoadingSpinner />
  </div>
)}
```

**Error messages:**
```typescript
// Before:
{error && <div>{error}</div>}

// After:
{error && (
  <div
    role="alert"
    aria-live="assertive"
    className="error-message"
  >
    {error}
  </div>
)}
```

### How to Test
- Use screen reader (NVDA on Windows, VoiceOver on Mac)
- Navigate with keyboard only (no mouse)
- Use browser DevTools > Accessibility tab
- Run automated tools (axe, Lighthouse)

---

## LOW-003: Component Size Guidelines

### What It Is
Some components are very large, making them harder to maintain.

### Current Sizes
- DeliverablesMatrix: 1,050 lines
- WBS: 680 lines
- RACIMatrix: 580 lines
- Dashboard: 450 lines

### Recommendation
Target component sizes:
- **Page components:** <400 lines
- **Feature components:** <300 lines
- **Presentational components:** <200 lines
- **Utility components:** <100 lines

### Benefits of Smaller Components
- Easier to understand at a glance
- Faster to locate bugs
- More reusable
- Better performance (less re-rendering)
- Easier to test

Not urgent to refactor, but good guideline for new code.

---

## LOW-004: Missing Code Documentation

### What It Is
Complex functions lack docstrings explaining their behavior.

### Backend Examples

**Good (has docstring):**
```python
def calculate_estimate(
    self,
    project_size: ProjectSize,
    complexity_factors: Dict[str, bool],
    ...
) -> EstimationResult:
    """
    Calculate comprehensive project estimation.

    Applies complexity multipliers, client factors, and contingency
    to base hours for the given project size.

    Args:
        project_size: Project size category (small/medium/large/phase-gate)
        complexity_factors: Dict of enabled complexity factors
        ...

    Returns:
        EstimationResult with hours, duration, confidence score
    """
```

**Could be better:**
```python
async def get_multi(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 100,
) -> List[Project]:
    # No docstring - what does this return? All projects? User's projects?
    result = await db.execute(
        select(Project).offset(skip).limit(limit)
    )
    return result.scalars().all()
```

### Frontend Examples

**Complex hooks need documentation:**
```typescript
/**
 * Manages deliverable selection and calculations for estimation workflow.
 *
 * @param projectSize - Size category affecting base deliverables
 * @param selectedDisciplines - Engineering disciplines for this project
 * @returns Selection state and calculation methods
 *
 * @example
 * const { deliverables, selectDeliverable } = useDeliverables('medium', ['civil']);
 * selectDeliverable('design-report', true);
 */
export function useDeliverables(
  projectSize: ProjectSize,
  selectedDisciplines: string[]
) {
  // ...
}
```

Not critical, but improves maintainability.

---

## LOW-005: Environment-Specific Logging

### What It Is
Logging is inconsistent - some files use `print()`, others use `logger`, some use nothing.

### Recommendation

Standardize on structured logging:

```python
# Use throughout backend
import logging

logger = logging.getLogger(__name__)  # Get module-specific logger

# Development: Detailed logs
logger.debug("Detailed debug info")
logger.info("Informational message")

# Production: Only important events
logger.warning("Something unexpected")
logger.error("Error occurred", exc_info=True)
logger.critical("System failure")
```

**Structured logging:**
```python
logger.info(
    "Project created",
    extra={
        "project_id": project.id,
        "user_id": current_user.id,
        "company_id": project.company_id
    }
)
```

Benefits:
- Easy to filter logs
- Send to log aggregation service (CloudWatch, Datadog)
- Search by specific fields
- Better debugging

---

## LOW-006: API Response Consistency

### What It Is
Some endpoints return different response formats.

### Examples

**Inconsistent list responses:**
```python
# Some endpoints:
{"items": [...], "total": 100}

# Other endpoints:
[...]  # Just array

# Others:
{"data": [...], "count": 100}
```

**Inconsistent error formats:**
```python
# Some:
{"detail": "Error message"}

# Others:
{"error": "Error message"}

# Others:
{"message": "Error message", "code": "ERROR_CODE"}
```

### Recommendation

Standardize response schemas:

```python
# Success responses
class ListResponse(BaseModel):
    items: List[Any]
    total: int
    skip: int
    limit: int

class SingleResponse(BaseModel):
    data: Any

# Error responses
class ErrorResponse(BaseModel):
    error: str           # Machine-readable error code
    message: str         # Human-readable message
    details: Optional[Dict] = None  # Additional context
```

Not critical but improves API predictability.

---

## LOW-007: Missing Development Scripts

### What It Is
Common development tasks require manual commands.

### Useful Scripts to Add

**Backend tasks:**
```bash
# scripts/reset_db.sh
#!/bin/bash
# Drop database, recreate, run migrations, seed data
cd backend
docker-compose down -v
docker-compose up -d db
sleep 3
alembic upgrade head
python scripts/seed_data.py

# scripts/run_tests.sh
#!/bin/bash
# Run tests with coverage
cd backend
pytest --cov=app --cov-report=html
open htmlcov/index.html
```

**Frontend tasks:**
```bash
# scripts/type_check.sh
#!/bin/bash
# Full type check
cd frontend
npx tsc --noEmit

# scripts/lint_fix.sh
#!/bin/bash
# Auto-fix linting issues
cd frontend
npm run lint -- --fix
```

**Combined tasks:**
```bash
# scripts/full_check.sh
#!/bin/bash
# Run all checks before committing
./scripts/run_tests.sh
./scripts/type_check.sh
./scripts/lint_fix.sh
echo "✓ All checks passed"
```

Convenience feature, not urgent.

---

## LOW-008: Missing Git Hooks

### What It Is
No pre-commit hooks to catch issues before committing.

### Recommendation

Add pre-commit hooks using `pre-commit` framework:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.44.0
    hooks:
      - id: eslint
        files: \.(js|jsx|ts|tsx)$
```

Benefits:
- Catch formatting issues before commit
- Prevent committing secrets
- Enforce code style
- Block large files

---

## LOW-009: API Request/Response Logging

### What It Is
No standardized request logging for debugging API issues.

### Recommendation

Add request logging middleware:

```python
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("api")

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        # Log request
        logger.info(
            f"→ {request.method} {request.url.path}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "client": request.client.host
            }
        )

        # Process request
        response = await call_next(request)

        # Log response
        duration = time.time() - start_time
        logger.info(
            f"← {response.status_code} ({duration:.3f}s)",
            extra={
                "status_code": response.status_code,
                "duration": duration
            }
        )

        return response

app.add_middleware(RequestLoggingMiddleware)
```

Useful for debugging but not critical.

---

## LOW-010: Database Query Performance Monitoring

### What It Is
No visibility into slow database queries.

### Recommendation

Add query logging in development:

```python
# config.py
DATABASE_ECHO: bool = Field(
    default=False,
    env="DATABASE_ECHO"
)

# database.py
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,  # Logs all SQL queries
)
```

In development `.env`:
```bash
DATABASE_ECHO=true  # See all SQL queries in console
```

**Advanced: Log slow queries only:**
```python
import logging
from sqlalchemy import event
from sqlalchemy.engine import Engine

logger = logging.getLogger("sqlalchemy.slow")

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    conn.info.setdefault('query_start_time', []).append(time.time())

@event.listens_for(Engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    total = time.time() - conn.info['query_start_time'].pop()
    if total > 0.1:  # Log queries > 100ms
        logger.warning(
            f"Slow query ({total:.3f}s): {statement}",
            extra={"duration": total, "sql": statement}
        )
```

Helpful for optimization but not urgent.

---

## Summary

These low-priority items improve code quality and developer experience but don't impact core functionality. Good to keep in mind for future refactoring but can be addressed incrementally.

**Quick Wins (1-2 hours each):**
- Add pre-commit hooks
- Standardize error responses
- Add request logging middleware
- Create development scripts

**Longer Term (days/weeks):**
- Improve accessibility (WCAG compliance)
- Add comprehensive docstrings
- Refactor large components
- Plan API versioning strategy
