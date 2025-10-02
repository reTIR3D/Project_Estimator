.PHONY: help install dev test clean docker-up docker-down migrate

help:
	@echo "Available commands:"
	@echo "  install       Install dependencies"
	@echo "  dev           Run development server"
	@echo "  test          Run tests"
	@echo "  clean         Clean up files"
	@echo "  docker-up     Start Docker services"
	@echo "  docker-down   Stop Docker services"
	@echo "  migrate       Run database migrations"

install:
	pip install -r requirements/dev.txt
	pre-commit install

dev:
	uvicorn app.main:app --reload --port 8000

test:
	pytest tests/ -v --cov=app --cov-report=html

test-watch:
	ptw tests/ -- -v

lint:
	black app/ tests/
	flake8 app/ tests/
	mypy app/

clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".coverage" -delete

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

migrate:
	alembic upgrade head

migrate-create:
	alembic revision --autogenerate -m "$(message)"

seed:
	python scripts/seed_data.py

backup-db:
	python scripts/backup_db.py

run-worker:
	celery -A app.workers.celery_app worker --loglevel=info

run-scheduler:
	celery -A app.workers.celery_app beat --loglevel=info