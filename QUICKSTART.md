# Quick Start Guide

Get up and running with Branching Study Tree in 5 minutes!

## Prerequisites

- Docker Desktop installed and running
- Git
- A web browser

## Step 1: Clone & Setup (2 minutes)

### Windows:
```powershell
git clone <your-repo-url> branching-study-tree
cd branching-study-tree
.\setup.bat
```

### Mac/Linux:
```bash
git clone <your-repo-url> branching-study-tree
cd branching-study-tree
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Create `.env` file
- Build Docker containers
- Start all services
- Run database migrations

## Step 2: Create Your Account (1 minute)

```bash
docker compose exec django python manage.py createsuperuser
```

Enter:
- Username: `admin` (or your choice)
- Email: `admin@example.com` (or your choice)
- Password: (choose a password, min 8 characters)

## Step 3: Access the App (1 minute)

Open your browser to: **http://localhost:5173**

Login with the credentials you just created.

## Step 4: Create Your First Tree (1 minute)

1. Click **"Create New Tree"**
2. Enter a title like "Machine Learning Study"
3. Click **"Create Tree"**
4. Click on the tree to open it
5. Click **"+ Add"** to create your first node
6. Enter a title like "Neural Networks"
7. Add some notes in the textarea
8. Click one of the AI buttons (Explain/Quiz/Summarize)
9. See the AI response!
10. Click **"Save to AI Notes"** to keep it

## What's Running?

Check the status:
```bash
docker compose ps
```

View logs:
```bash
docker compose logs -f
```

## Next Steps

- Explore the [full README](README.md) for detailed documentation
- Check out the [Django Admin](http://localhost:8000/admin) (same credentials)
- View the [FastAPI docs](http://localhost:8001/docs) for API reference
- Try the mobile app (see [apps/mobile/README.md](apps/mobile/README.md))

## Stopping the App

```bash
docker compose down
```

## Troubleshooting

**Services won't start?**
```bash
docker compose down -v
docker compose up --build
```

**Can't access localhost:5173?**
- Check Docker Desktop is running
- Check no firewall is blocking ports
- Try http://127.0.0.1:5173

**Database errors?**
```bash
docker compose down -v  # Warning: deletes data
docker compose up -d
docker compose exec django python manage.py migrate
docker compose exec django python manage.py createsuperuser
```

## Need Help?

- Check the main [README.md](README.md)
- Look at [CONTRIBUTING.md](CONTRIBUTING.md)
- Open an issue on GitHub

Happy studying!
