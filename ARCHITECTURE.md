# Architecture & Design Decisions

## System Architecture

### Microservices Approach

The application is split into distinct services:

1. **Django Backend** - System of record
   - Owns all canonical data (users, trees, nodes)
   - Handles authentication & authorization
   - Provides REST API for CRUD operations
   - Manages permissions and sharing

2. **FastAPI AI Service** - AI operations
   - Handles AI generation (stateless)
   - Streams responses to clients
   - Writes results back to Django
   - Rate limiting per user

3. **PostgreSQL** - Primary data store
   - Relational data (users, trees, nodes, AI messages)
   - ACID compliance for data integrity

4. **Redis** - Cache & message broker
   - Celery task queue
   - Rate limiting counters
   - Session storage (future)

5. **Celery Workers** - Background jobs
   - Async AI generation (optional)
   - Cleanup tasks
   - Email sending (future)

### Why This Architecture?

**Separation of Concerns:**
- Django focuses on data integrity and business logic
- FastAPI focuses on AI/ML performance and streaming
- Each service can scale independently

**Technology Fit:**
- Django: Mature, batteries-included, great ORM
- FastAPI: Fast, async, great for streaming AI responses
- PostgreSQL: Reliable, feature-rich, good for relational data
- Redis: Fast, simple, perfect for queuing and caching

**Future Scalability:**
- Add more AI workers as load increases
- Scale FastAPI horizontally for AI requests
- Django can serve millions of CRUD operations
- Add caching layers as needed

## Data Model

### Tree Structure

We chose a **single-parent tree** (not a graph) for MVP:

**Pros:**
- Simpler to understand and visualize
- Easier to implement recursive queries
- Clear hierarchy for learning
- No circular dependencies

**Cons:**
- Can't model many-to-many relationships
- Some concepts have multiple "parents"

**Future:** Can add multi-parent support later if needed.

### Node Storage

Nodes store both `user_notes` and `ai_notes` separately:

**Why:**
- User maintains control over their content
- AI suggestions don't overwrite user work
- Can compare/merge AI suggestions manually
- Audit trail of what's AI-generated vs. user-written

### AI Message History

We store every AI interaction:

**Why:**
- Audit trail for usage/costs
- Idempotency via `request_id`
- Can replay or review past responses
- Usage analytics

**Future:** Could add retention policies to reduce storage.

## Authentication & Security

### JWT Tokens

- **Access Token**: 1 hour lifetime, used for API calls
- **Refresh Token**: 7 days lifetime, used to get new access tokens

**Why JWT:**
- Stateless (no session storage needed)
- Can be verified by FastAPI without calling Django
- Standard, well-supported

**Security:**
- Tokens stored in localStorage (web) - OK for MVP
- Secure storage on mobile (expo-secure-store)
- httpOnly cookies recommended for production web

### Service-to-Service Auth

FastAPI uses a **service token** to call Django:

**Why:**
- FastAPI needs to write AI results to Django
- Can't use user token (might be expired)
- Simple shared secret for internal communication

**Future:** Use mutual TLS or OAuth2 client credentials for production.

### Permissions Model

**Role-Based Access Control (RBAC):**
- Owner: Full control, can delete tree, invite users
- Editor: Can create/edit nodes, can't delete tree or change members
- Viewer: Read-only access

**Why RBAC:**
- Simple to understand
- Covers most use cases
- Easy to implement with Django permissions

## AI Integration

### Provider Abstraction

`LLMClient` protocol allows swapping providers:

**Why:**
- Not locked into one vendor
- Can test without API keys (stub)
- Can support multiple providers per request (future)
- Easy to mock for testing

### Streaming Responses

AI responses can stream via Server-Sent Events:

**Why:**
- Better UX (immediate feedback)
- Can cancel long requests
- Works well with OpenAI/Anthropic streaming APIs

**Trade-offs:**
- More complex to implement
- Requires persistent connection
- Mobile support varies

### Rate Limiting

10 requests/minute per user (configurable):

**Why:**
- Prevent abuse
- Control costs
- Fair usage
- Simple to implement with Redis

**Future:** Tiered limits, per-plan quotas, burst allowances.

## Development Experience

### Monorepo

All code in one repository:

**Pros:**
- Shared types between frontend/backend
- Atomic commits across services
- Easier to onboard new developers
- Single source of truth

**Cons:**
- Larger repo size
- Need good tooling (workspaces)
- CI/CD slightly more complex

**Worth it:** Yes, for this project size.

### Docker Compose

Everything runs in containers:

**Pros:**
- Consistent environment
- One command to start everything
- Easy to add new services
- Production-like locally

**Cons:**
- Requires Docker knowledge
- Slower on some systems
- Resource-intensive

**Alternative:** Local development possible but requires more setup.

### Shared TypeScript Package

API client and types shared between web/mobile:

**Pros:**
- Type safety across stack
- DRY (don't repeat yourself)
- Refactoring is safer
- Autocomplete in IDE

**Cons:**
- Need to rebuild after changes
- Slightly more setup

**Worth it:** Absolutely, prevents so many bugs.

## Trade-offs & Alternatives

### Django vs. FastAPI for Everything?

**Why not pure FastAPI:**
- Django admin is invaluable
- Django ORM is mature and powerful
- DRF makes REST APIs trivial
- More libraries and integrations

**Why not pure Django:**
- FastAPI is faster for AI streaming
- Async by default (better for I/O)
- Automatic OpenAPI docs
- Modern Python type hints

**Decision:** Use both, let each shine.

### PostgreSQL vs. MongoDB?

**Why PostgreSQL:**
- Tree data is relational (foreign keys)
- Need ACID transactions
- Great support for JSON if needed (jsonb)
- Mature, battle-tested

**MongoDB would be useful if:**
- Completely flexible schema
- Horizontal scaling from day 1
- Working with lots of unstructured data

**Decision:** PostgreSQL is right for this use case.

### REST vs. GraphQL?

**Why REST:**
- Simpler to implement
- DRF provides everything needed
- Standard HTTP methods
- Easy to cache

**GraphQL would be better if:**
- Lots of nested/related data fetching
- Mobile apps need to minimize requests
- API evolves rapidly

**Decision:** REST for MVP, can add GraphQL layer later if needed.

## Future Enhancements

1. **Real-time Collaboration**
   - WebSockets for live editing
   - Operational transforms (CRDTs)

2. **Offline Support**
   - Service workers (web)
   - Local database (mobile)
   - Sync when online

3. **Advanced AI Features**
   - Voice notes → text
   - Diagram generation
   - Spaced repetition scheduling

4. **Analytics**
   - Study time tracking
   - Learning progress
   - Knowledge gaps identification

5. **Export/Import**
   - Markdown export
   - Anki deck generation
   - PDF study guides

6. **Social Features**
   - Public tree marketplace
   - Comments on nodes
   - Forking trees

7. **Integrations**
   - Notion import
   - Google Drive sync
   - Obsidian compatibility

## Questions?

This architecture supports the MVP and can scale to thousands of users. Major rewrites needed only if:
- Millions of concurrent users
- Real-time collaboration at scale
- Complex AI model training

For now, this stack is solid, maintainable, and productive.
