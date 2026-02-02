@echo off
REM Branching Study Tree - Quick Setup Script (Windows)
REM This script automates the initial setup of the development environment

echo.
echo Branching Study Tree - Setup Script
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo Docker is running
echo.

REM Check if .env exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo .env file created
) else (
    echo .env file already exists
)
echo.

REM Build and start containers
echo Building and starting Docker containers...
echo This may take a few minutes on first run...
docker compose up -d --build

echo.
echo Waiting for services to be healthy...
timeout /t 10 /nobreak >nul

REM Wait for postgres to be ready
echo Waiting for PostgreSQL...
:wait_postgres
docker compose exec -T postgres pg_isready -U studytree >nul 2>&1
if errorlevel 1 (
    echo|set /p="."
    timeout /t 1 /nobreak >nul
    goto wait_postgres
)
echo.
echo PostgreSQL is ready

REM Run migrations
echo.
echo Running database migrations...
docker compose exec -T django python manage.py migrate

echo.
echo Setup complete!
echo.
echo Next steps:
echo.
echo 1. Create a superuser:
echo    docker compose exec django python manage.py createsuperuser
echo.
echo 2. Access the application:
echo    - Web App: http://localhost:5173
echo    - Django Admin: http://localhost:8000/admin
echo    - FastAPI Docs: http://localhost:8001/docs
echo.
echo 3. View logs:
echo    docker compose logs -f
echo.
echo 4. Stop services:
echo    docker compose down
echo.
echo Happy studying!
echo.
pause
