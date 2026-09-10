# Repo Doctor Backend - Phase 1

Backend API and worker system for Repo Doctor.

## 🏗️ Architecture

```
Fastify API Server (Port 4000)
       ↓
PostgreSQL Database
       +
Redis Queue
       ↓
BullMQ Worker Process
       ↓
Repository Services
```

## 📦 Components

### API Server (`src/server.ts`)
- Fastify HTTP server
- REST API endpoints
- CORS enabled
- Request validation
- Error handling

### Database (`prisma/schema.prisma`)
- PostgreSQL with Prisma ORM
- Repository, RepositoryScan, ScanArtifact tables
- Indexes for performance
- Cascade deletes

### Queue (`src/jobs/scanQueue.ts`)
- Redis-backed BullMQ queue
- Job retry with exponential backoff
- Job retention policies

### Worker (`src/workers/scanWorker.ts`)
- Background scan processing
- Concurrency control
- Error handling
- Workspace cleanup

### Services

**RepositoryIntakeService**
- Clones public GitHub repositories
- Creates isolated workspaces
- Security: No code execution
- Timeout protection

**RepositoryMapperService**
- Analyzes repository structure
- Detects languages and frameworks
- Generates manifest JSON
- Enforces size limits

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start database (requires Docker)
cd .. && docker compose up -d

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Start API server (Terminal 1)
npm run dev

# Start worker (Terminal 2)
npm run worker
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- tests/unit/schemas.test.ts
```

## 📡 API Reference

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "ok",
  "service": "repo-doctor-api",
  "database": "ok",
  "redis": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Create Repository
```http
POST /api/repositories
Content-Type: application/json

{
  "url": "https://github.com/owner/repo"
}
```

Response:
```json
{
  "id": "clx...",
  "provider": "github",
  "owner": "owner",
  "name": "repo",
  "fullName": "owner/repo",
  "url": "https://github.com/owner/repo",
  "defaultBranch": "main",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Create Scan
```http
POST /api/scans
Content-Type: application/json

{
  "repositoryId": "clx...",
  "branch": "main"
}
```

Response:
```json
{
  "id": "clx...",
  "repositoryId": "clx...",
  "status": "QUEUED",
  "currentStage": "QUEUED",
  "progress": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Get Scan Progress
```http
GET /api/scans/:id/progress
```

Response:
```json
{
  "scanId": "clx...",
  "status": "RUNNING",
  "stage": "MAPPING",
  "progress": 75,
  "message": "Analyzing repository structure..."
}
```

## 🔧 Configuration

Environment variables (`.env`):

```bash
# Server
NODE_ENV=development
PORT=4000
HOST=0.0.0.0

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/repo_doctor

# Redis
REDIS_URL=redis://localhost:6379

# Repository
REPOSITORY_WORKSPACE=/tmp/repo-doctor

# CORS
CORS_ORIGIN=http://localhost:5173

# Limits
MAX_REPOSITORY_FILES=100000
MAX_FILE_SIZE_BYTES=5242880        # 5MB
MAX_TOTAL_SIZE_BYTES=524288000     # 500MB
CLONE_TIMEOUT_MS=300000            # 5 minutes
```

## 🗃️ Database Schema

### Repository
```prisma
model Repository {
  id            String   @id @default(cuid())
  provider      String
  owner         String
  name          String
  fullName      String   @unique
  url           String
  defaultBranch String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  scans         RepositoryScan[]
}
```

### RepositoryScan
```prisma
model RepositoryScan {
  id              String    @id @default(cuid())
  repositoryId    String
  commitSha       String?
  branch          String?
  status          String    # QUEUED, RUNNING, COMPLETED, FAILED
  currentStage    String?   # CLONING, MAPPING, READY
  progress        Int       @default(0)
  progressMessage String?
  startedAt       DateTime?
  completedAt     DateTime?
  errorMessage    String?
  healthScore     Int?
  repository      Repository @relation(...)
  artifacts       ScanArtifact[]
}
```

### ScanArtifact
```prisma
model ScanArtifact {
  id        String   @id @default(cuid())
  scanId    String
  type      String   # REPOSITORY_MANIFEST
  path      String?
  metadata  Json
  scan      RepositoryScan @relation(...)
}
```

## 🔒 Security

**Phase 1 Security Measures:**

✅ **No Code Execution**
- Repositories are never executed
- No npm install, pip install, etc.
- No build scripts run
- Only safe file reading

✅ **Input Validation**
- Zod schema validation
- URL format checking
- GitHub-only URLs

✅ **Workspace Isolation**
- Each scan in separate directory
- Path validation
- Cleanup after completion

✅ **Resource Limits**
- Clone timeout: 5 minutes
- Max file size: 5MB
- Max total size: 500MB
- Max file count: 100,000

✅ **Error Handling**
- No stack traces in production
- Safe error messages
- Worker doesn't crash on job failure

**Not Yet Implemented:**
- Authentication
- Authorization
- Rate limiting
- GitHub OAuth
- Private repository access

## 📊 Monitoring

### Logs
Structured logging with Pino:
```bash
# View API logs
npm run dev

# View worker logs
npm run worker
```

### Database
```bash
# Open Prisma Studio
npm run db:studio
```

### Queue
Monitor with BullBoard (not yet implemented) or Redis CLI:
```bash
redis-cli

# View queue
KEYS *bull*

# View job details
HGETALL bull:repository-scan:1
```

## 🐛 Debugging

### Check Database Connection
```bash
npx prisma db execute --sql "SELECT 1"
```

### Check Redis Connection
```bash
redis-cli ping
# Expected: PONG
```

### View Queue Jobs
```typescript
import { scanQueue } from './src/jobs/scanQueue.js';

const jobs = await scanQueue.getJobs(['waiting', 'active', 'completed', 'failed']);
console.log(jobs);
```

### Manual Scan Test
```bash
# Create repository
curl -X POST http://localhost:4000/api/repositories \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/facebook/react"}'

# Note the returned ID, then create scan
curl -X POST http://localhost:4000/api/scans \
  -H "Content-Type: application/json" \
  -d '{"repositoryId":"clx123..."}'

# Check progress
curl http://localhost:4000/api/scans/clx456.../progress
```

## 📈 Performance

**Phase 1 Characteristics:**
- Clone time: 5-60 seconds (depends on repo size)
- Mapping time: 1-10 seconds
- Total scan time: 10-120 seconds
- Worker concurrency: 2 parallel scans
- Rate limit: 10 jobs/minute

## 🚧 Known Limitations

**Phase 1 Scope:**
- Public GitHub repositories only
- No authentication
- No AI analysis
- No vulnerability scanning
- Health score always null
- No build execution
- No test execution
- Manual cleanup of old workspaces

## 🔜 Phase 2 Preview

Next phase will add:
- AI provider integration (OpenAI, Anthropic, etc.)
- Static code analysis
- Vulnerability detection
- Health score calculation
- Root cause analysis
- Evidence gathering

## 🛠️ Development

### Database Migrations
```bash
# Create new migration
npm run db:migrate

# Reset database
npx prisma migrate reset

# View migrations
ls prisma/migrations/
```

### Code Generation
```bash
# Regenerate Prisma client
npm run db:generate
```

### Clean Start
```bash
# Stop all services
docker compose down -v

# Remove workspaces
rm -rf /tmp/repo-doctor

# Reset database
npm run db:migrate reset

# Restart
docker compose up -d
npm run db:migrate
npm run dev
```

## 📝 Contributing

Phase 1 is feature-complete. Contributions should focus on:
- Bug fixes
- Test coverage
- Documentation
- Performance improvements

Do not add Phase 2+ features yet.

## 📄 License

MIT
