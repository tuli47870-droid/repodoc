# Repo Doctor - AI-Powered Repository Diagnostics

An AI-powered repository diagnosis and repair platform for developers. Currently in **Phase 1 (Production Ready)** with production hardening complete.

## 🎯 Project Status

### ✅ Phase 1 Complete: Backend Foundation + Production Hardening
- REST API server (Fastify + TypeScript)
- PostgreSQL database with Prisma ORM
- Redis + BullMQ queue system
- Background worker for async processing
- GitHub repository intake (public repos)
- Repository manifest generation
- Full frontend UI (React + TypeScript)
- **Production Security**: Rate limiting, security headers, request logging
- **API Quality**: Pagination, filtering, search
- **Observability**: Metrics endpoints (JSON + Prometheus)
- **Operational**: Automated cleanup worker
- **Testing**: 8 unit tests, 27 integration tests

### 🚧 Future Phases
- **Phase 2**: AI integration and static analysis
- **Phase 3**: Autonomous repair system
- **Phase 4**: GitHub OAuth and webhooks
- **Phase 5**: Full production hardening (requires Phases 2-4)

## 🏗️ Architecture

```
Frontend (React)
       ↓
REST API (Fastify)
       ↓
PostgreSQL + Redis
       ↓
BullMQ Queue
       ↓
Background Worker
       ↓
Repository Intake → Repository Mapper
       ↓
Database (Scan Results)
```

## ✨ Features

### Frontend (Complete)
- 🏥 **Repository Health Dashboard** - Visual health scores with circular progress
- 🔍 **Findings Management** - Issue tracking with filters and search
- 🔒 **Security Analysis** - Vulnerability detection UI
- 🏗️ **Architecture Visualization** - System diagrams
- 📦 **Dependency Management** - Package analysis
- ⚙️ **Build & Test Monitoring** - Real-time logs
- 🔧 **AI-Powered Fixes** - Fix generation UI (Phase 2)
- 📊 **Historical Tracking** - Scan history
- 💬 **AI Assistant** - Chat panel (Phase 2)
- 🔎 **Global Search** - Command palette (⌘K / Ctrl+K)

### Backend (Phase 1 + Production Hardening)
- ✅ Repository intake from GitHub URLs
- ✅ Asynchronous scan processing
- ✅ Repository manifest generation
- ✅ Language and framework detection
- ✅ Package manager detection
- ✅ Progress tracking
- ✅ Error handling and logging
- ✅ **Rate limiting** (100 req/min global, 5 req/min for scans)
- ✅ **Security headers** (helmet)
- ✅ **Request ID tracking**
- ✅ **Pagination** on all list endpoints
- ✅ **Search & filtering** (repositories, scans)
- ✅ **Metrics endpoints** (JSON + Prometheus)
- ✅ **Automated cleanup** worker

## 🚀 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Recharts
- Lucide Icons

### Backend
- Node.js + TypeScript
- Fastify
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- simple-git
- Zod validation
- Pino logging

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 16
- Redis 7
- Docker (recommended for database services)
- Git

## 🚀 Getting Started

### 1. Start Database Services

**With Docker (Recommended):**
```bash
docker compose up -d
```

**Manual Setup:**
- Install PostgreSQL 16 and create database `repo_doctor`
- Install Redis 7
- Update connection strings in `backend/.env`

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Start API server (Terminal 1)
npm run dev

# Start worker (Terminal 2)
npm run worker
```

The API server will run on `http://localhost:4000`

### 3. Frontend Setup

```bash
# In project root
npm install

# Copy environment variables
cp .env.example .env

# Start frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### 4. Verify Installation

```bash
# Check backend health
curl http://localhost:4000/health

# Expected response:
# {"status":"ok","service":"repo-doctor-api","database":"ok","redis":"ok"}
```

## 📡 API Endpoints

### Health & Monitoring
- `GET /health` - Service health check (database + Redis)
- `GET /metrics` - System metrics (JSON format)
- `GET /metrics/prometheus` - Prometheus-format metrics

### Repositories
- `POST /api/repositories` - Create or get repository
  ```json
  { "url": "https://github.com/owner/repo" }
  ```
- `GET /api/repositories` - List repositories (paginated, searchable)
  - Query params: `limit`, `offset`, `search`
- `GET /api/repositories/:id` - Get repository by ID
- `GET /api/repositories/:id/scans` - Get repository scans (paginated)
  - Query params: `limit`, `offset`, `status`

### Scans
- `POST /api/scans` - Create scan
  ```json
  { "repositoryId": "...", "branch": "main" }
  ```
- `GET /api/scans` - List all scans (paginated, filterable)
  - Query params: `limit`, `offset`, `status`, `repositoryId`
- `GET /api/scans/:id` - Get scan details
- `GET /api/scans/:id/progress` - Get scan progress
- `GET /api/scans/:id/artifacts` - Get scan artifacts (manifest, etc.)

## 🧪 Testing

```bash
# Backend unit tests (8 tests)
cd backend
npm test

# Backend integration tests (27 tests - requires database)
npm test -- tests/integration/api.test.ts

# Frontend build test
npm run build
```

**Test Coverage**:
- Unit tests: Schemas, repository mapper, services
- Integration tests: All API endpoints, error handling, security headers, rate limiting

## 📊 Database Schema

### Repository
- Stores GitHub repository metadata
- Links to multiple scans

### RepositoryScan
- Tracks scan status and progress
- Stores results and artifacts

### ScanArtifact
- Stores scan outputs (manifests, etc.)
- JSON metadata storage

## 🔒 Security Notes

**Phase 1 Security:**
- ✅ Only public GitHub repositories
- ✅ No code execution
- ✅ Validated inputs with Zod
- ✅ Isolated workspaces
- ✅ Timeout protection
- ✅ Size limits enforced
- ✅ **Rate limiting** (global + per-endpoint)
- ✅ **Security headers** (XSS, clickjacking protection)
- ✅ **Request logging** (IP tracking, user agent)
- ✅ **Structured error handling** (no sensitive data leakage)
- ✅ **CORS** configuration
- ✅ **Request ID tracking** for audit trails

**Not Yet Implemented:**
- ❌ GitHub OAuth
- ❌ Private repository access
- ❌ Code execution/sandbox
- ❌ Authentication/Authorization
- ❌ RBAC

## 📊 Monitoring & Observability

### Metrics Endpoints

**JSON Metrics** (`GET /metrics`):
- Database metrics (repositories, scans by status)
- Queue metrics (waiting, active, completed, failed)
- Performance metrics (avg scan duration)
- System metrics (uptime, memory usage)

**Prometheus Metrics** (`GET /metrics/prometheus`):
- Text format compatible with Prometheus
- Metrics: repositories_total, scans_total, scans_running, queue_waiting, etc.
- Ready for Grafana dashboards

### Health Check

`GET /health` returns:
```json
{
  "status": "ok",
  "service": "repo-doctor-api",
  "database": "ok",
  "redis": "ok",
  "timestamp": "2026-09-10T..."
}
```

### Cleanup System

Automated cleanup worker runs hourly:
- Deletes completed scans older than 30 days
- Deletes failed scans older than 7 days
- Removes orphaned workspaces after 24 hours
- Validates workspace integrity

Start cleanup worker: `cd backend && npm run cleanup`

## 🚦 Current Limitations

**Phase 1 Scope:**
- Only public GitHub repositories supported
- No AI diagnosis yet (Phase 2)
- No security vulnerability scanning
- No automated repairs
- No PR creation
- No build/test execution
- Health score always `null`
- Mock data still in frontend

**What Works:**
- Repository cloning
- File structure analysis
- Language detection
- Package manager detection
- Progress tracking
- Error handling

## 🛠️ Development

### Project Structure

```
repo-doctor/
├── src/                    # Frontend source
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── data/             # Mock data
│   └── lib/              # Utilities & API client
│
├── backend/
│   ├── src/
│   │   ├── config/       # Configuration
│   │   ├── db/           # Database repositories
│   │   ├── jobs/         # Queue management
│   │   ├── routes/       # API routes
│   │   ├── schemas/      # Validation schemas
│   │   ├── services/     # Business logic
│   │   ├── workers/      # Background workers
│   │   └── types/        # TypeScript types
│   │
│   ├── prisma/           # Database schema
│   └── tests/            # Backend tests
│
├── docker-compose.yml     # Database services
└── README.md
```

### Environment Variables

**Backend:**
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `REPOSITORY_WORKSPACE` - Clone directory
- `CORS_ORIGIN` - Frontend URL
- `MAX_REPOSITORY_FILES` - File count limit
- `MAX_FILE_SIZE_BYTES` - Single file limit
- `CLONE_TIMEOUT_MS` - Clone timeout

**Frontend:**
- `VITE_API_URL` - Backend API URL

## 📝 Common Tasks

### Run Full Stack
```bash
# Terminal 1: Database
docker compose up

# Terminal 2: Backend API
cd backend && npm run dev

# Terminal 3: Worker
cd backend && npm run worker

# Terminal 4: Cleanup Worker (optional)
cd backend && npm run cleanup

# Terminal 5: Frontend
npm run dev
```

### Database Operations
```bash
cd backend

# Create migration
npm run db:migrate

# View database
npm run db:studio

# Reset database
npx prisma migrate reset
```

### Trigger a Scan
```bash
# Create repository
curl -X POST http://localhost:4000/api/repositories \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/facebook/react"}'

# Create scan (use repositoryId from above)
curl -X POST http://localhost:4000/api/scans \
  -H "Content-Type: application/json" \
  -d '{"repositoryId":"<id>"}'

# Check progress
curl http://localhost:4000/api/scans/<scanId>/progress
```

## 🐛 Troubleshooting

**Database connection failed:**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `backend/.env`
- Verify port 5432 is not in use

**Redis connection failed:**
- Ensure Redis is running
- Check `REDIS_URL` in `backend/.env`
- Verify port 6379 is not in use

**Frontend can't connect to backend:**
- Check backend is running on port 4000
- Verify `VITE_API_URL` in `.env`
- Check CORS configuration

**Worker not processing jobs:**
- Ensure worker process is running
- Check Redis connection
- View worker logs for errors

## 📚 Next Steps

**Phase 2 - AI Integration:**
- OpenAI/Anthropic integration
- Static code analysis
- Vulnerability scanning
- Health score calculation
- Root cause analysis

**Phase 3 - Autonomous Repair:**
- Patch generation
- Sandbox verification
- PR creation

**Phase 4 - GitHub Integration:**
- OAuth authentication
- Webhooks
- Private repositories
- Incremental scanning

## 📄 License

MIT

## 🙏 Notes

This is **Phase 1** - Backend Foundation. The system can:
- Accept GitHub repository URLs
- Clone public repositories safely
- Generate repository manifests
- Track scan progress
- Store results in database

The system **cannot yet**:
- Analyze code for vulnerabilities
- Generate AI diagnoses
- Create automated repairs
- Access private repositories
- Execute builds or tests

Frontend UI is complete but still uses mock data. Backend integration is minimal (API client created but not fully connected to UI).
