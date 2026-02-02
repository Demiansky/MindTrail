# Troubleshooting Guide

Common issues and their solutions when running Branching Study Tree.

## Container Issues

### Containers Won't Start

**Problem:** `docker compose up` fails or containers keep restarting

**Solutions:**

1. **Check Docker is running:**
   ```bash
   docker info
   # Should show Docker version info
   ```

2. **Check port conflicts:**
   ```bash
   # Windows
   netstat -ano | findstr ":5173"
   netstat -ano | findstr ":8000"
   netstat -ano | findstr ":8001"
   
   # Kill the process using the port
   taskkill /PID <PID> /F
   ```

3. **Clean and rebuild:**
   ```bash
   docker compose down -v
   docker compose up --build
   ```

4. **Check logs:**
   ```bash
   docker compose logs django
   docker compose logs postgres
   ```

### PostgreSQL Won't Start

**Problem:** `bst_postgres` shows as unhealthy or restarting

**Solutions:**

1. **Check if port 5432 is in use:**
   ```bash
   netstat -ano | findstr ":5432"
   ```

2. **Remove old volume:**
   ```bash
   docker compose down -v
   docker volume ls
   docker volume rm branching-study-tree_postgres_data
   docker compose up -d
   ```

3. **Check disk space:**
   ```bash
   docker system df
   # If low, clean up:
   docker system prune -a
   ```

### Redis Connection Errors

**Problem:** "Error connecting to Redis"

**Solutions:**

1. **Check Redis is running:**
   ```bash
   docker compose ps redis
   docker compose logs redis
   ```

2. **Verify Redis is healthy:**
   ```bash
   docker compose exec redis redis-cli ping
   # Should return: PONG
   ```

3. **Restart Redis:**
   ```bash
   docker compose restart redis
   ```

## Django Issues

### Migration Errors

**Problem:** "No such table" or migration conflicts

**Solutions:**

1. **Reset migrations (DELETES DATA!):**
   ```bash
   docker compose down -v
   docker compose up -d postgres
   # Wait 5 seconds
   docker compose up -d django
   docker compose exec django python manage.py migrate
   ```

2. **Check migration status:**
   ```bash
   docker compose exec django python manage.py showmigrations
   ```

3. **Make migrations if needed:**
   ```bash
   docker compose exec django python manage.py makemigrations
   docker compose exec django python manage.py migrate
   ```

### "No module named..." Errors

**Problem:** Import errors when Django starts

**Solutions:**

1. **Rebuild container:**
   ```bash
   docker compose up -d --build django
   ```

2. **Check requirements.txt:**
   ```bash
   docker compose exec django pip list
   docker compose exec django pip install -r requirements.txt
   ```

### CORS Errors

**Problem:** "No 'Access-Control-Allow-Origin' header"

**Solutions:**

1. **Check CORS_ALLOWED_ORIGINS in .env:**
   ```
   CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:19006
   ```

2. **Restart Django:**
   ```bash
   docker compose restart django
   ```

3. **Check browser console for actual origin:**
   ```javascript
   console.log(window.location.origin)
   // Add this to CORS_ALLOWED_ORIGINS
   ```

### 401 Unauthorized Errors

**Problem:** API returns 401 even with token

**Solutions:**

1. **Check token expiration:**
   - Access tokens expire after 1 hour
   - Refresh token or login again

2. **Verify JWT secret matches:**
   ```bash
   # In .env, make sure JWT_SECRET_KEY is same in both services
   ```

3. **Check token in browser:**
   ```javascript
   // In browser console
   localStorage.getItem('studytree_tokens')
   ```

4. **Clear and re-login:**
   ```javascript
   localStorage.clear()
   // Then login again
   ```

## FastAPI Issues

### FastAPI Can't Reach Django

**Problem:** "Connection refused" or timeouts

**Solutions:**

1. **Check network connectivity:**
   ```bash
   docker compose exec fastapi ping django
   # Should get responses
   ```

2. **Verify service token:**
   ```bash
   # Check .env
   FASTAPI_SERVICE_TOKEN=service-token-change-in-prod
   
   # Same token should be in both FASTAPI_SERVICE_TOKEN and DJANGO settings
   ```

3. **Check Django is running:**
   ```bash
   docker compose exec fastapi curl http://django:8000/api/
   ```

### AI Endpoints Return Errors

**Problem:** 500 errors when calling /ai/nodes/{id}/explain

**Solutions:**

1. **Check node exists:**
   ```bash
   docker compose exec django python manage.py shell
   ```
   ```python
   from core.models import Node
   Node.objects.all()  # Should show your nodes
   ```

2. **Check FastAPI logs:**
   ```bash
   docker compose logs fastapi
   ```

3. **Verify user has access:**
   - User must be a member of the tree containing the node
   - Check TreeMember table

### Rate Limiting Issues

**Problem:** "Rate limit exceeded"

**Solutions:**

1. **Increase limit in FastAPI config.py:**
   ```python
   rate_limit_per_minute: int = 100  # Increase from 10
   ```

2. **Clear Redis counters:**
   ```bash
   docker compose exec redis redis-cli
   > KEYS rate_limit:*
   > FLUSHDB  # Clears all rate limits
   ```

3. **Restart FastAPI:**
   ```bash
   docker compose restart fastapi
   ```

## Web App Issues

### Web App Won't Load

**Problem:** localhost:5173 doesn't respond

**Solutions:**

1. **Check web container:**
   ```bash
   docker compose ps web
   docker compose logs web
   ```

2. **Check Vite dev server:**
   ```bash
   docker compose exec web ps aux
   # Should see: node ... vite
   ```

3. **Restart web:**
   ```bash
   docker compose restart web
   ```

4. **Try local development:**
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

### API Calls Fail from Web

**Problem:** Network errors or CORS issues

**Solutions:**

1. **Check VITE_API_URL:**
   ```bash
   # In browser console
   console.log(import.meta.env.VITE_API_URL)
   # Should be: http://localhost:8000
   ```

2. **Verify Django is accessible:**
   ```bash
   curl http://localhost:8000/api/
   ```

3. **Check browser console:**
   - Open DevTools (F12)
   - Check Network tab for failed requests
   - Check Console for errors

### Hot Reload Not Working

**Problem:** Changes to code don't reflect in browser

**Solutions:**

1. **Check volumes are mounted:**
   ```bash
   docker compose config
   # Should show volume mounts for ./apps/web:/app
   ```

2. **Use local development:**
   ```bash
   cd apps/web
   npm run dev
   # Faster hot reload outside Docker
   ```

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

## Mobile App Issues

### Expo Won't Start

**Problem:** `npm start` fails in apps/mobile

**Solutions:**

1. **Install dependencies:**
   ```bash
   cd apps/mobile
   rm -rf node_modules
   npm install
   ```

2. **Clear Expo cache:**
   ```bash
   npx expo start -c
   ```

3. **Check Node version:**
   ```bash
   node --version
   # Should be 18+ or 20+
   ```

### Can't Connect to API

**Problem:** Mobile app can't reach localhost:8000

**Solutions:**

1. **Use your computer's IP:**
   ```bash
   # Find your IP
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   
   # Update apps/mobile/app/login.tsx
   const apiClient = createAPIClient(
     'http://192.168.1.100:8000',  # Your IP
     'http://192.168.1.100:8001'
   );
   ```

2. **Check firewall:**
   - Allow ports 8000 and 8001 through Windows Firewall

3. **Test connectivity:**
   ```bash
   # From mobile device browser
   http://YOUR_IP:8000/api/
   ```

## Database Issues

### Database Connection Errors

**Problem:** "could not connect to server"

**Solutions:**

1. **Wait for PostgreSQL to be ready:**
   ```bash
   docker compose exec postgres pg_isready -U studytree
   # Should return: accepting connections
   ```

2. **Check DATABASE_URL:**
   ```bash
   docker compose exec django env | grep DATABASE_URL
   ```

3. **Test connection manually:**
   ```bash
   docker compose exec postgres psql -U studytree -d studytree
   \dt  # List tables
   \q   # Quit
   ```

### Database is Empty

**Problem:** No tables or data

**Solutions:**

1. **Run migrations:**
   ```bash
   docker compose exec django python manage.py migrate
   ```

2. **Create superuser:**
   ```bash
   docker compose exec django python manage.py createsuperuser
   ```

3. **Create sample data:**
   ```bash
   docker compose exec django python manage.py create_sample_data
   ```

## Performance Issues

### Slow Response Times

**Problem:** API calls take too long

**Solutions:**

1. **Check resource usage:**
   ```bash
   docker stats
   ```

2. **Increase Docker resources:**
   - Docker Desktop → Settings → Resources
   - Increase CPU and Memory limits

3. **Check database queries:**
   ```bash
   docker compose exec django python manage.py shell
   ```
   ```python
   from django.db import connection
   from django.db import reset_queries
   # Enable query logging
   from django.conf import settings
   settings.DEBUG = True
   
   # Make a query
   from core.models import Tree
   Tree.objects.all()
   
   # See queries
   print(connection.queries)
   ```

4. **Add database indexes:**
   - Check models.py for fields that need `db_index=True`

### Container Uses Too Much Memory

**Problem:** Docker using all RAM

**Solutions:**

1. **Limit container memory:**
   ```yaml
   # In docker-compose.yml
   services:
     django:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

2. **Stop unused containers:**
   ```bash
   docker ps -a
   docker rm $(docker ps -a -q -f status=exited)
   ```

3. **Clean up Docker:**
   ```bash
   docker system prune -a
   docker volume prune
   ```

## Security Issues

### "Secret key must not be empty"

**Problem:** Django won't start

**Solutions:**

1. **Check .env file exists:**
   ```bash
   cat .env
   ```

2. **Verify DJANGO_SECRET_KEY:**
   ```bash
   # Generate a new one
   docker compose exec django python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
   
   # Add to .env
   DJANGO_SECRET_KEY=generated-key-here
   ```

3. **Restart Django:**
   ```bash
   docker compose restart django
   ```

## Nuclear Options

### Complete Reset (DELETES ALL DATA)

```bash
# Stop everything
docker compose down -v

# Remove all images
docker compose down --rmi all

# Clean Docker system
docker system prune -a -f
docker volume prune -f

# Start fresh
docker compose up --build

# Reinitialize
docker compose exec django python manage.py migrate
docker compose exec django python manage.py createsuperuser
docker compose exec django python manage.py create_sample_data
```

### Reset Just Database

```bash
docker compose down -v
docker volume rm branching-study-tree_postgres_data
docker compose up -d
docker compose exec django python manage.py migrate
docker compose exec django python manage.py createsuperuser
```

### Reset Just Web

```bash
cd apps/web
rm -rf node_modules
rm package-lock.json
npm install
docker compose restart web
```

## Getting Help

If none of these solutions work:

1. **Check logs:**
   ```bash
   docker compose logs > debug.log
   # Review debug.log for errors
   ```

2. **Check Docker status:**
   ```bash
   docker compose ps
   docker compose config
   ```

3. **Verify environment:**
   ```bash
   docker --version
   docker compose version
   node --version
   python --version
   ```

4. **Search for error message:**
   - Copy exact error message
   - Search in project issues
   - Search on Stack Overflow

5. **Create an issue:**
   - Include error message
   - Include logs
   - Include steps to reproduce
   - Include your environment (OS, Docker version, etc.)

## Health Check Commands

Run these to verify everything is working:

```bash
# 1. All containers running
docker compose ps

# 2. PostgreSQL healthy
docker compose exec postgres pg_isready -U studytree

# 3. Redis healthy
docker compose exec redis redis-cli ping

# 4. Django responding
curl http://localhost:8000/api/

# 5. FastAPI responding  
curl http://localhost:8001/

# 6. Web app responding
curl http://localhost:5173/

# 7. Database has tables
docker compose exec django python manage.py showmigrations

# 8. No errors in logs
docker compose logs --tail=50
```

All should return success!
