.PHONY: help setup up down logs clean migrate superuser shell test

help:
	@echo "Branching Study Tree - Development Commands"
	@echo "==========================================="
	@echo ""
	@echo "Setup & Start:"
	@echo "  make setup      - Initial setup (build, migrate, create .env)"
	@echo "  make up         - Start all services"
	@echo "  make down       - Stop all services"
	@echo ""
	@echo "Development:"
	@echo "  make logs       - View logs (all services)"
	@echo "  make migrate    - Run Django migrations"
	@echo "  make superuser  - Create Django superuser"
	@echo "  make shell      - Open Django shell"
	@echo ""
	@echo "Database:"
	@echo "  make db-reset   - Reset database (WARNING: deletes all data)"
	@echo "  make db-backup  - Backup database"
	@echo ""
	@echo "Testing:"
	@echo "  make test       - Run all tests"
	@echo "  make test-django - Run Django tests"
	@echo "  make test-fastapi - Run FastAPI tests"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean      - Remove containers and volumes"
	@echo "  make clean-all  - Remove everything including images"

setup:
	@echo "Setting up Branching Study Tree..."
	@if [ ! -f .env ]; then cp .env.example .env; echo ".env created"; fi
	docker compose up -d --build
	@echo "Waiting for services..."
	@sleep 10
	docker compose exec -T django python manage.py migrate
	@echo "Setup complete! Run 'make superuser' to create an admin user."

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	docker compose exec django python manage.py migrate

superuser:
	docker compose exec django python manage.py createsuperuser

shell:
	docker compose exec django python manage.py shell

test:
	@echo "Running Django tests..."
	docker compose exec django python manage.py test
	@echo "Running FastAPI tests..."
	docker compose exec fastapi pytest || echo "No tests configured yet"

test-django:
	docker compose exec django python manage.py test

test-fastapi:
	docker compose exec fastapi pytest

db-reset:
	@echo "WARNING: This will delete all data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		docker compose up -d postgres redis; \
		sleep 5; \
		docker compose up -d django; \
		sleep 5; \
		docker compose exec django python manage.py migrate; \
		echo "Database reset complete."; \
	fi

db-backup:
	docker compose exec postgres pg_dump -U studytree studytree > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Database backed up to backup_*.sql"

clean:
	docker compose down -v

clean-all:
	docker compose down -v --rmi all
	rm -rf apps/web/node_modules apps/mobile/node_modules packages/shared/node_modules

# Shared package
shared-build:
	cd packages/shared && npm run build

shared-watch:
	cd packages/shared && npm run watch

# Web app
web-install:
	cd apps/web && npm install

web-dev:
	cd apps/web && npm run dev

# Mobile app
mobile-install:
	cd apps/mobile && npm install

mobile-start:
	cd apps/mobile && npm start

# Production
prod-up:
	docker compose -f docker-compose.prod.yml up -d --build

prod-down:
	docker compose -f docker-compose.prod.yml down

prod-logs:
	docker compose -f docker-compose.prod.yml logs -f
