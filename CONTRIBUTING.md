# Contributing to Branching Study Tree

Thank you for your interest in contributing! This document provides guidelines and instructions.

## Development Setup

1. Fork and clone the repository
2. Run the setup script: `./setup.sh` (Linux/Mac) or `setup.bat` (Windows)
3. Create a branch: `git checkout -b feature/your-feature-name`

## Project Structure

- `apps/web` - React web application
- `apps/mobile` - React Native mobile application
- `services/django` - Django REST API backend
- `services/fastapi` - FastAPI AI service
- `packages/shared` - Shared TypeScript types and API client

## Coding Standards

### Python (Django/FastAPI)

- Follow PEP 8
- Use type hints where possible
- Write docstrings for functions and classes
- Run tests before committing

### TypeScript/React

- Use functional components and hooks
- Follow React best practices
- Use TypeScript strict mode
- Keep components small and focused

### Git Commits

- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc.
- Write clear, descriptive commit messages
- Keep commits atomic and focused

## Testing

### Backend Tests

```bash
# Django
docker compose exec django python manage.py test

# FastAPI
docker compose exec fastapi pytest
```

### Frontend Tests

```bash
cd apps/web
npm test
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update the README if needed
5. Request review from maintainers

## Feature Requests and Bugs

- Use GitHub Issues
- Provide detailed descriptions
- Include steps to reproduce for bugs
- Suggest solutions when possible

## Code Review

All submissions require review. We use GitHub pull requests for this purpose.

## Questions?

Open an issue or reach out to the maintainers.

Thank you for contributing!
