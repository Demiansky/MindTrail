# Branching Study Tree + AI

A full-stack monorepo application for creating study trees with AI-powered learning assistance.

## Features

- **Study Trees**: Organize knowledge as hierarchical tree structures
- **Nodes**: Create notes with parent-child relationships
- **AI Assistant**: Generate explanations, quizzes, and summaries for any node
- **Collaboration**: Share trees with others (owner/editor/viewer roles)
- **Multi-platform**: Web app (React) and Mobile app (React Native/Expo)
- **Real-time AI**: Streaming AI responses with FastAPI
- **Background Jobs**: Celery workers for async processing
- **Secure**: JWT authentication, RBAC permissions, CORS protection

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Web App   │────▶│   Django     │────▶│ PostgreSQL  │
│  (React)    │     │   + DRF      │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           │
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Mobile App │────▶│   FastAPI    │────▶│   Redis     │
│   (Expo)    │     │  AI Service  │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────────────┐
                    │    Celery    │
                    │   Workers    │
                    └──────────────┘
```

### Tech Stack

- **Frontend**: React 18 + Vite, React Native + Expo
- **Backend**: Django 4.2 + DRF, FastAPI
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7
- **Task Queue**: Celery
- **AI**: Pluggable LLM interface (stub/OpenAI/Anthropic)
- **Auth**: JWT (djangorestframework-simplejwt)
- **Containerization**: Docker + Docker Compose

## Project Structure

```
branching-study-tree/
├── apps/
│   ├── web/                    # React web app (Vite)
│   │   ├── src/
│   │   │   ├── pages/         # Login, TreeList, TreeEditor
│   │   │   ├── api.ts         # API client wrapper
│   │   │   └── App.tsx
│   │   └── Dockerfile
│   └── mobile/                 # React Native Expo app
│       ├── app/               # Expo Router pages
│       └── package.json
├── services/
│   ├── django/                # Django + DRF backend
│   │   ├── backend/          # Project settings
│   │   │   ├── settings.py
│   │   │   ├── urls.py
│   │   │   └── celery.py
│   │   ├── core/             # Main app
│   │   │   ├── models.py     # Tree, Node, AIMessage
│   │   │   ├── views.py      # ViewSets
│   │   │   ├── serializers.py
│   │   │   ├── permissions.py
│   │   │   └── tasks.py      # Celery tasks
│   │   └── requirements.txt
│   └── fastapi/              # FastAPI AI service
│       ├── main.py           # AI endpoints
│       ├── llm_client.py     # LLM abstraction
│       ├── dependencies.py   # Auth, rate limiting
│       └── config.py
├── packages/
│   └── shared/               # Shared TypeScript types & API client
│       └── src/
│           ├── types.ts      # DTOs
│           └── api-client.ts
├── infra/
│   └── docker/
│       └── Caddyfile         # Reverse proxy config
├── docker-compose.yml        # Development
├── docker-compose.prod.yml   # Production
├── .env.example
└── README.md
```

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development without Docker)
- Python 3.11+ (for local development without Docker)

### 1. Clone and Setup

```bash
git clone <your-repo>
cd branching-study-tree

# Copy environment variables
cp .env.example .env

# Edit .env if needed (defaults work for local dev)
```

### 2. Start All Services

```bash
docker compose up --build
```

This will start:
- PostgreSQL (port 5432)
- Redis (port 6379)
- Django (port 8000)
- FastAPI (port 8001)
- Celery worker
- Web app (port 5173)

Wait for all services to start (check logs for "Application startup complete").

### 3. Initialize Database

In a new terminal:

```bash
# Run migrations
docker compose exec django python manage.py migrate

# Create superuser
docker compose exec django python manage.py createsuperuser
# Enter: username, email, password (remember these for login)

# Optional: Create sample data
docker compose exec django python manage.py shell
```

```python
from django.contrib.auth.models import User
from core.models import Tree, Node

user = User.objects.first()  # Your superuser
tree = Tree.objects.create(owner=user, title="Machine Learning", visibility="private")
from core.models import TreeMember
TreeMember.objects.create(tree=tree, user=user, role="owner")

root = Node.objects.create(tree=tree, title="Neural Networks", user_notes="Deep learning fundamentals", created_by=user)
child1 = Node.objects.create(tree=tree, parent=root, title="CNNs", user_notes="Convolutional Neural Networks", created_by=user)
child2 = Node.objects.create(tree=tree, parent=root, title="RNNs", user_notes="Recurrent Neural Networks", created_by=user)
exit()
```

### 4. Access the Application

- **Web App**: http://localhost:5173
- **Django Admin**: http://localhost:8000/admin
- **Django API**: http://localhost:8000/api/
- **FastAPI Docs**: http://localhost:8001/docs

Login with your superuser credentials.

## Mobile App Setup

The mobile app is a basic shell. To run it:

```bash
cd apps/mobile

# Install dependencies
npm install

# Start Expo
npm start

# Update API URLs in app/login.tsx and app/trees.tsx
# Replace 'localhost' with your computer's IP for device testing
```

## Development

### Running Individual Services

```bash
# Django only
docker compose up postgres redis django

# FastAPI only
docker compose up redis fastapi

# Web only
docker compose up web
```

### Local Development (without Docker)

**Django:**
```bash
cd services/django
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql://studytree:studytree_dev@localhost:5432/studytree
export REDIS_URL=redis://localhost:6379/0

python manage.py migrate
python manage.py runserver
```

**FastAPI:**
```bash
cd services/fastapi
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

export REDIS_URL=redis://localhost:6379/0
uvicorn main:app --reload --port 8001
```

**Web:**
```bash
cd apps/web
npm install
npm run dev
```

### Shared Package Changes

When modifying the shared package:

```bash
cd packages/shared
npm run build

# In apps/web or apps/mobile
npm install  # Re-link the package
```

## Testing the AI Features

1. Create a tree and add nodes via web app
2. Select a node and click "Explain", "Quiz", or "Summarize"
3. The stub AI will generate a response
4. Click "Save to AI Notes" to persist it

### Using Real AI Providers

Edit `.env`:

```bash
AI_PROVIDER=openai  # or anthropic
AI_API_KEY=sk-...
```

Then implement the provider in `services/fastapi/llm_client.py`:

```python
# TODO: Add real OpenAI/Anthropic implementation
```

## Security

- JWT tokens expire after 1 hour (configurable in Django settings)
- Refresh tokens valid for 7 days
- CORS restricted to specified origins
- Service token for internal FastAPI→Django communication
- Rate limiting: 10 requests/minute per user (configurable)

### Production Checklist

- [ ] Change all secrets in `.env`
- [ ] Set `DEBUG=False` in Django
- [ ] Configure `ALLOWED_HOSTS`
- [ ] Use strong `DJANGO_SECRET_KEY` and `JWT_SECRET_KEY`
- [ ] Set up HTTPS with Caddy
- [ ] Configure database backups
- [ ] Set up monitoring (Sentry, etc.)
- [ ] Review CORS settings

## Production Deployment

```bash
# Build and start production services
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec django python manage.py migrate

# Collect static files
docker compose -f docker-compose.prod.yml exec django python manage.py collectstatic --noinput

# Create superuser
docker compose -f docker-compose.prod.yml exec django python manage.py createsuperuser
```

Configure your domain in `infra/docker/Caddyfile` and update `CORS_ALLOWED_ORIGINS`.

## Database Schema

### Key Models

**Tree**
- owner (FK User)
- title
- visibility (private/shared/public)

**TreeMember**
- tree (FK Tree)
- user (FK User, nullable)
- email (for invites)
- role (owner/editor/viewer)

**Node**
- tree (FK Tree)
- parent (FK Node, nullable)
- title
- user_notes (Text)
- ai_notes (Text)
- sibling_order (Int)

**AIMessage**
- node (FK Node)
- type (explain/quiz/summarize)
- prompt, response
- tokens_in, tokens_out
- request_id (for idempotency)

## Troubleshooting

### Docker Issues

**Containers won't start:**
```bash
docker compose down -v  # Remove volumes
docker compose up --build
```

**Port conflicts:**
```bash
# Check what's using the port
netstat -ano | findstr :8000  # Windows
lsof -i :8000                 # Mac/Linux

# Change ports in docker-compose.yml
```

### Database Issues

**Connection errors:**
```bash
# Check postgres is healthy
docker compose ps
docker compose logs postgres

# Reset database
docker compose down -v
docker compose up -d postgres
docker compose exec django python manage.py migrate
```

### FastAPI can't reach Django

```bash
# Check network
docker compose exec fastapi ping django

# Check service token matches in both .env and Django settings
echo $FASTAPI_SERVICE_TOKEN
```

### Web app can't connect

- Check `VITE_API_URL` in browser console
- Verify CORS settings in Django
- Check Django logs: `docker compose logs django`

## API Endpoints

### Django (http://localhost:8000)

**Auth:**
- POST `/api/auth/token/` - Login (get JWT)
- POST `/api/auth/refresh/` - Refresh token
- GET `/api/me/` - Current user info

**Trees:**
- GET/POST `/api/trees/`
- GET/PATCH/DELETE `/api/trees/{id}/`
- POST `/api/trees/{id}/invite/` - Invite user
- GET `/api/trees/{id}/nodes/` - Get tree nodes (nested)

**Nodes:**
- GET/POST `/api/nodes/`
- GET/PATCH/DELETE `/api/nodes/{id}/`

**AI Messages:**
- GET `/api/ai-messages/`
- GET `/api/ai-messages/{id}/`

### FastAPI (http://localhost:8001)

**AI Generation:**
- POST `/ai/nodes/{node_id}/explain`
- POST `/ai/nodes/{node_id}/quiz`
- POST `/ai/nodes/{node_id}/summarize`

Request body:
```json
{
  "additional_context": "Focus on practical examples",
  "stream": false
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT

## Acknowledgments

Built with modern best practices for full-stack development:
- Monorepo structure for code sharing
- Microservices architecture
- Container-first deployment
- Type safety with TypeScript
- Comprehensive API documentation

---

**Need help?** Check the issues or create a new one!
