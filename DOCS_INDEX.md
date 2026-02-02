# Documentation Index

Welcome to the Branching Study Tree documentation! This guide will help you find the right documentation for your needs.

## Quick Navigation

### I want to...

- **Get started in 5 minutes** → [QUICKSTART.md](QUICKSTART.md)
- **Understand the full project** → [README.md](README.md)
- **See all commands** → [COMMANDS.md](COMMANDS.md)
- **Understand design decisions** → [ARCHITECTURE.md](ARCHITECTURE.md)
- **Fix a problem** → [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Contribute code** → [CONTRIBUTING.md](CONTRIBUTING.md)
- **See what was built** → [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

## Documentation Files

### Essential (Start Here)

| File | Purpose | When to Read |
|------|---------|--------------|
| [README.md](README.md) | Main project documentation | First time setup, comprehensive reference |
| [QUICKSTART.md](QUICKSTART.md) | 5-minute setup guide | Want to get running ASAP |
| [COMMANDS.md](COMMANDS.md) | Complete command reference | Daily development, looking up commands |

### Reference

| File | Purpose | When to Read |
|------|---------|--------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Design decisions, trade-offs | Understanding why things work this way |
| [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) | Complete file listing, features | Overview of what was built |
| [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | Common issues and solutions | Something's not working |

### Contributing

| File | Purpose | When to Read |
|------|---------|--------------|
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute | Want to add features or fix bugs |

### Service-Specific

| File | Purpose | When to Read |
|------|---------|--------------|
| [apps/mobile/README.md](apps/mobile/README.md) | Mobile app setup | Working on React Native app |
| [services/django/core/management/commands/README.md](services/django/core/management/commands/README.md) | Django commands | Using management commands |
| [apps/mobile/assets/README.md](apps/mobile/assets/README.md) | Mobile assets | Adding app icons/images |

## Documentation by Role

### I'm a Developer (New to Project)

1. Start: [QUICKSTART.md](QUICKSTART.md)
2. Setup environment
3. Read: [README.md](README.md) (Technology Stack section)
4. Read: [ARCHITECTURE.md](ARCHITECTURE.md)
5. Reference: [COMMANDS.md](COMMANDS.md) as needed

### I'm a Frontend Developer

1. [README.md](README.md) - Web App section
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Frontend decisions
3. `apps/web/` - React code
4. `packages/shared/` - Shared types
5. [apps/mobile/README.md](apps/mobile/README.md) - Mobile setup

### I'm a Backend Developer

1. [README.md](README.md) - Django & FastAPI sections
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Backend decisions
3. `services/django/` - Django code
4. `services/fastapi/` - FastAPI code
5. [COMMANDS.md](COMMANDS.md) - Database commands

### I'm DevOps/SRE

1. [README.md](README.md) - Production Deployment section
2. `docker-compose.yml` - Dev setup
3. `docker-compose.prod.yml` - Prod setup
4. `infra/docker/` - Infrastructure config
5. [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Debug issues

### I'm a Project Manager

1. [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - What's been built
2. [README.md](README.md) - Features section
3. [ARCHITECTURE.md](ARCHITECTURE.md) - Future Enhancements

## Documentation by Topic

### Setup & Installation

- [QUICKSTART.md](QUICKSTART.md) - Fast setup (5 min)
- [README.md](README.md) - Complete setup
- [COMMANDS.md](COMMANDS.md) - Setup commands
- `.env.example` - Environment configuration

### Development

- [COMMANDS.md](COMMANDS.md) - Development commands
- [Makefile](Makefile) - Task automation
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide
- `studytree.code-workspace` - VS Code setup

### Architecture

- [ARCHITECTURE.md](ARCHITECTURE.md) - Design decisions
- [README.md](README.md) - System architecture
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - Technology stack

### API Reference

- [README.md](README.md) - API Endpoints section
- Django: http://localhost:8000/admin (after setup)
- FastAPI: http://localhost:8001/docs (after setup)
- `packages/shared/src/api-client.ts` - TypeScript client

### Troubleshooting

- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues
- [COMMANDS.md](COMMANDS.md) - Debug commands
- [README.md](README.md) - Troubleshooting section

### Deployment

- [README.md](README.md) - Production Deployment
- `docker-compose.prod.yml` - Prod config
- [COMMANDS.md](COMMANDS.md) - Production commands

## Learning Path

### Day 1: Get Running
1. [QUICKSTART.md](QUICKSTART.md)
2. Create account and sample data
3. Play with the app

### Day 2: Understand the Stack
1. [README.md](README.md)
2. [ARCHITECTURE.md](ARCHITECTURE.md)
3. Browse code structure

### Day 3: Make Changes
1. [CONTRIBUTING.md](CONTRIBUTING.md)
2. [COMMANDS.md](COMMANDS.md)
3. Try modifying a component

### Week 2: Deep Dive
1. Read all service code
2. Understand data flow
3. Make substantial changes

## External Resources

### Django
- [Django Docs](https://docs.djangoproject.com/)
- [DRF Docs](https://www.django-rest-framework.org/)
- [JWT Docs](https://django-rest-framework-simplejwt.readthedocs.io/)

### FastAPI
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Pydantic Docs](https://docs.pydantic.dev/)

### Frontend
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [TanStack Query](https://tanstack.com/query/)
- [React Router](https://reactrouter.com/)

### Mobile
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)

### DevOps
- [Docker Docs](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Caddy Docs](https://caddyserver.com/docs/)

## Documentation Standards

All documentation in this project follows:

- **Markdown format** for readability
- **Clear headings** for navigation
- **Code examples** for clarity
- **Step-by-step instructions** where appropriate
- **Cross-references** to related docs

## Improving Documentation

Found an issue or want to improve docs?

1. Check [CONTRIBUTING.md](CONTRIBUTING.md)
2. Open an issue describing the improvement
3. Submit a PR with changes

Good documentation is crucial for project success. Thank you for helping improve it!

## Need Help?

Can't find what you're looking for?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Search all docs with your code editor
3. Open an issue on GitHub
4. Ask in project discussions

---

**Happy reading!**
