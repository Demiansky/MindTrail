#!/bin/bash

# Branching Study Tree - Quick Setup Script
# This script automates the initial setup of the development environment

set -e  # Exit on error

echo "Branching Study Tree - Setup Script"
echo "======================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker and try again."
    exit 1
fi

echo "Docker is running"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ".env file created"
else
    echo ".env file already exists"
fi
echo ""

# Build and start containers
echo "Building and starting Docker containers..."
echo "This may take a few minutes on first run..."
docker compose up -d --build

echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Wait for postgres to be ready
echo "Waiting for PostgreSQL..."
until docker compose exec -T postgres pg_isready -U studytree > /dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo ""
echo "PostgreSQL is ready"

# Run migrations
echo ""
echo "Running database migrations..."
docker compose exec -T django python manage.py migrate

echo ""
echo "Setup complete!"
echo ""
echo "Next steps:"
echo ""
echo "1. Create a superuser:"
echo "   docker compose exec django python manage.py createsuperuser"
echo ""
echo "2. Access the application:"
echo "   - Web App: http://localhost:5173"
echo "   - Django Admin: http://localhost:8000/admin"
echo "   - FastAPI Docs: http://localhost:8001/docs"
echo ""
echo "3. View logs:"
echo "   docker compose logs -f"
echo ""
echo "4. Stop services:"
echo "   docker compose down"
echo ""
echo "Happy studying!"
