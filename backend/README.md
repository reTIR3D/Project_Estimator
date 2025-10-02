# Engineering Estimation System - Backend

A production-ready FastAPI backend for engineering project estimation with complex calculations, resource optimization, risk analysis, and financial planning.

## Features

- **FastAPI Framework**: Modern, async REST API with automatic OpenAPI documentation
- **Estimation Engine**: Complex project estimation with compounding multipliers
- **Database**: PostgreSQL with async SQLAlchemy ORM
- **Caching**: Redis for performance optimization
- **Authentication**: JWT-based authentication and authorization
- **Docker**: Fully containerized development environment

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   ├── core/             # Core functionality (auth, db, security)
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic services
│   ├── crud/             # Database operations
│   └── main.py           # Application entry point
├── migrations/           # Database migrations
├── tests/                # Test suite
├── requirements/         # Python dependencies
├── docker/               # Docker configuration
└── docker-compose.yml    # Docker Compose setup
```

## Quick Start

### Prerequisites

- Python 3.11+
- Docker and Docker Compose
- PostgreSQL 15+ (if running without Docker)
- Redis 7+ (if running without Docker)

### Installation

1. **Clone and navigate to backend directory**

2. **Copy environment file**
```bash
cp .env.example .env
```

3. **Start services with Docker**
```bash
docker-compose up -d
```

4. **Run database migrations**
```bash
docker-compose exec api alembic upgrade head
```

5. **Access the API**
- API: http://localhost:8000
- Documentation: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc

### Local Development (without Docker)

1. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements/dev.txt
```

3. **Start PostgreSQL and Redis**
```bash
# Using Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15
docker run -d -p 6379:6379 redis:7
```

4. **Run migrations**
```bash
alembic upgrade head
```

5. **Start development server**
```bash
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

### Projects
- `POST /api/v1/projects` - Create project
- `GET /api/v1/projects` - List projects
- `GET /api/v1/projects/{id}` - Get project details
- `PUT /api/v1/projects/{id}` - Update project
- `DELETE /api/v1/projects/{id}` - Delete project

### Estimation
- `POST /api/v1/estimation/{project_id}/estimate` - Calculate project estimate
- `POST /api/v1/estimation/quick-estimate` - Quick estimation without saving
- `GET /api/v1/estimation/complexity-factors` - Get available complexity factors

## Estimation Engine

The core estimation engine calculates project hours using:

**Formula:**
```
Total Hours = Base Hours × Complexity Multiplier × Client Factor + Contingency
Duration = Base Duration × (100/Availability%) × (1 + (Complexity-1) × 0.3)
```

**Project Sizes:**
- Small: < 500 hours (3-person team, 8 weeks)
- Medium: 500-2000 hours (5-person team, 16 weeks)
- Large: > 2000 hours (8-person team, 32+ weeks)

**Complexity Factors:**
- Multidiscipline: +20%
- Fast-track: +30%
- Brownfield: +25%
- Regulatory: +15%
- International: +20%
- Incomplete Requirements: +35%

**Client Profiles:**
- Type A: +40% (Heavy oversight)
- Type B: Baseline (Standard process)
- Type C: -15% (Minimal oversight)
- New Client: +25% (Conservative)

## Development

### Running Tests
```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific test file
pytest tests/unit/test_estimation_engine.py
```

### Code Quality
```bash
# Format code
black app/ tests/

# Lint
flake8 app/ tests/

# Type checking
mypy app/
```

### Database Migrations
```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Configuration

All configuration is managed through environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `SECRET_KEY` - Application secret key

## Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Run migrations in container
docker-compose exec api alembic upgrade head
```

## Production Deployment

See `docker-compose.prod.yml` for production configuration.

Key considerations:
- Use environment-specific `.env` files
- Enable HTTPS/TLS
- Configure proper database backups
- Set up monitoring and logging
- Use secrets management
- Configure auto-scaling

## License

Proprietary - All rights reserved

## Support

For support, please contact the development team.