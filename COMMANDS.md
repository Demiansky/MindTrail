# Getting Started - Step by Step Commands

This guide provides the exact commands to run the application from scratch.

## Prerequisites Check

```powershell
# Windows PowerShell
docker --version
# Should show: Docker version 20.x.x or higher

docker compose version
# Should show: Docker Compose version v2.x.x or higher

git --version
# Should show: git version 2.x.x or higher
```

## Complete Setup (First Time)

### Step 1: Clone Repository

```powershell
# Navigate to where you want the project
cd C:\Dev  # or your preferred location

# Clone (replace with your actual repo URL)
git clone https://github.com/yourusername/branching-study-tree.git
cd branching-study-tree
```

### Step 2: Environment Setup

```powershell
# Copy environment template
copy .env.example .env

# Optional: Edit .env if you want to change any settings
notepad .env
```

### Step 3: Build and Start Services

```powershell
# Build all containers and start services
docker compose up -d --build

# This will:
# - Pull base images (postgres, redis, python, node)
# - Build Django, FastAPI, and Web containers
# - Start all services
# - Create networks and volumes
# First time will take 5-10 minutes depending on internet speed
```

### Step 4: Check Services Status

```powershell
# View running containers
docker compose ps

# You should see:
# - bst_postgres    (healthy)
# - bst_redis       (healthy)
# - bst_django      (running)
# - bst_fastapi     (running)
# - bst_celery      (running)
# - bst_web         (running)
```

### Step 5: Wait for Services

```powershell
# Watch logs to see when everything is ready
docker compose logs -f

# Wait until you see:
# - django: "Watching for file changes with StatReloader"
# - fastapi: "Application startup complete"
# - web: "ready in X ms"

# Press Ctrl+C to stop watching logs (services keep running)
```

### Step 6: Initialize Database

```powershell
# Run migrations
docker compose exec django python manage.py migrate

# You should see:
# Applying contenttypes.0001_initial... OK
# Applying auth.0001_initial... OK
# ... etc ...
# Applying core.0001_initial... OK
```

### Step 7: Create Admin User

```powershell
# Create superuser
docker compose exec django python manage.py createsuperuser

# You'll be prompted:
Username: admin
Email address: admin@example.com
Password: admin123  # (choose something secure)
Password (again): admin123
# Superuser created successfully.
```

### Step 8: Create Sample Data (Optional)

```powershell
# Create sample trees and nodes
docker compose exec django python manage.py create_sample_data

# You should see:
# Created tree: Machine Learning Fundamentals
# Sample data created successfully!
# Trees created: 2
# Nodes created: 14
```

### Step 9: Access the Application

Open your browser and go to:
- **Web App**: http://localhost:5173
- **Django Admin**: http://localhost:8000/admin
- **FastAPI Docs**: http://localhost:8001/docs

Login with the credentials you created (username: `admin`, password: what you chose).

## Verify Everything Works

### Test 1: Login to Web App
1. Go to http://localhost:5173
2. Enter your username and password
3. You should see your trees list

### Test 2: Create a Tree
1. Click "Create New Tree"
2. Enter title "Test Tree"
3. Click "Create Tree"
4. You should see the tree in your list

### Test 3: Create a Node
1. Click on your tree to open it
2. Click "+ Add" button
3. Enter title "Test Node"
4. The node should appear in the left panel

### Test 4: Test AI Features
1. Select your node
2. Add some text in "Your Notes"
3. Click "Explain" button
4. You should see a stub AI response
5. Click "Save to AI Notes"
6. The AI response should appear in AI Notes section

### Test 5: Check APIs
1. Go to http://localhost:8001/docs
2. You should see FastAPI interactive documentation
3. Try the `/` endpoint to verify it's working

## Daily Development Commands

### Start Services (After First Setup)

```powershell
# Start all services
docker compose up -d

# Or start and watch logs
docker compose up
```

### Stop Services

```powershell
# Stop all services (preserves data)
docker compose down

# Stop and remove volumes (deletes data)
docker compose down -v
```

### View Logs

```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f django
docker compose logs -f fastapi
docker compose logs -f web
```

### Restart a Service

```powershell
# Restart Django (e.g., after code changes)
docker compose restart django

# Rebuild and restart
docker compose up -d --build django
```

### Database Commands

```powershell
# Make migrations after model changes
docker compose exec django python manage.py makemigrations

# Apply migrations
docker compose exec django python manage.py migrate

# Open Django shell
docker compose exec django python manage.py shell

# Access PostgreSQL directly
docker compose exec postgres psql -U studytree -d studytree
```

### Frontend Development

```powershell
# Install new npm packages (web)
docker compose exec web npm install <package-name>

# Rebuild web container after package.json changes
docker compose up -d --build web

# Or develop locally (faster hot reload)
cd apps/web
npm install
npm run dev  # Runs on localhost:5173
```

## Cleanup Commands

### Clean Everything

```powershell
# Stop and remove containers, volumes, networks
docker compose down -v

# Remove images too
docker compose down -v --rmi all

# Remove node_modules (if running locally)
cd apps/web
rm -rf node_modules

cd ../mobile
rm -rf node_modules

cd ../../packages/shared
rm -rf node_modules
```

### Start Fresh

```powershell
# Complete reset
docker compose down -v --rmi all
docker compose up -d --build
docker compose exec django python manage.py migrate
docker compose exec django python manage.py createsuperuser
docker compose exec django python manage.py create_sample_data
```

## Troubleshooting Commands

### Check Service Health

```powershell
# Service status
docker compose ps

# Detailed service info
docker inspect bst_django
docker inspect bst_postgres
```

### View Resource Usage

```powershell
# Container stats
docker stats
```

### Check Networks

```powershell
# List networks
docker network ls

# Inspect network
docker network inspect branching-study-tree_bst_network
```

### Test Service Connectivity

```powershell
# From Django to PostgreSQL
docker compose exec django ping postgres

# From FastAPI to Django
docker compose exec fastapi ping django

# From FastAPI to Redis
docker compose exec fastapi ping redis
```

### View Environment Variables

```powershell
# Check Django environment
docker compose exec django env | grep DJANGO

# Check FastAPI environment
docker compose exec fastapi env | grep FASTAPI
```

### Check Port Availability

```powershell
# Windows
netstat -ano | findstr :5173
netstat -ano | findstr :8000
netstat -ano | findstr :8001

# If ports are in use, either:
# 1. Stop the conflicting service
# 2. Change ports in docker-compose.yml
```

## Installing Additional Dependencies

### Python (Django/FastAPI)

```powershell
# Add to requirements.txt
docker compose exec django bash
echo "new-package==1.0.0" >> requirements.txt
pip install new-package
exit

# Or rebuild
docker compose up -d --build django
```

### JavaScript (Web)

```powershell
# Add to package.json
docker compose exec web npm install new-package

# Or locally
cd apps/web
npm install new-package
docker compose restart web
```

## Production Deployment

```powershell
# Build production images
docker compose -f docker-compose.prod.yml build

# Start production services
docker compose -f docker-compose.prod.yml up -d

# Initialize
docker compose -f docker-compose.prod.yml exec django python manage.py migrate
docker compose -f docker-compose.prod.yml exec django python manage.py collectstatic --noinput
docker compose -f docker-compose.prod.yml exec django python manage.py createsuperuser

# View production logs
docker compose -f docker-compose.prod.yml logs -f
```

## Mobile App Commands

```powershell
# Navigate to mobile app
cd apps/mobile

# Install dependencies
npm install

# Start Expo development server
npm start

# Press 'w' for web
# Press 'a' for Android emulator
# Press 'i' for iOS simulator
# Scan QR code for physical device
```

## Quick Reference

```powershell
# Most common commands
docker compose up -d                    # Start services
docker compose down                     # Stop services
docker compose logs -f                  # View logs
docker compose exec django python manage.py migrate  # Run migrations
docker compose exec django python manage.py shell    # Django shell
docker compose restart django           # Restart Django
docker compose ps                       # Service status
```

## Next Steps

1. Read [README.md](README.md) for full documentation
2. Check [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions
3. Review [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
4. Start building your study trees!

Happy coding!
