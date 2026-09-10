# Phase 2 Quick Start Guide

## What's New in Phase 2? 🎉

Repo Doctor can now:
- 🔍 **Scan repositories** for security issues, code quality problems, and dependency issues
- 🤖 **Analyze findings with AI** to provide detailed explanations and recommendations
- 💰 **Track AI usage and costs** to stay within budget
- 📊 **Calculate health scores** based on scan findings

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment
Copy and configure your environment:
```bash
cp .env.example .env
```

Edit `backend/.env`:
```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/repo_doctor

# Redis
REDIS_URL=redis://localhost:6379

# Optional: Enable AI Analysis
AI_ENABLED=false  # Set to 'true' to enable AI features

# If AI_ENABLED=true, add at least one API key:
OPENAI_API_KEY=sk-...  # Your OpenAI key
# OR
ANTHROPIC_API_KEY=...  # Your Anthropic key
```

### 3. Start Infrastructure
```bash
# From backend directory
docker compose up -d  # Starts PostgreSQL + Redis
```

### 4. Setup Database
```bash
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Apply database migrations
```

### 5. Start Services
```bash
# Terminal 1 - API Server
npm run dev

# Terminal 2 - Scan Worker
npm run worker
```

## Testing the Scanner

### Create a Repository Scan
```bash
curl -X POST http://localhost:4000/repositories \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/facebook/react",
    "provider": "github",
    "owner": "facebook",
    "name": "react"
  }'
```

Response:
```json
{
  "repository": {
    "id": "...",
    "fullName": "facebook/react"
  },
  "scan": {
    "id": "...",
    "status": "QUEUED"
  }
}
```

### Check Scan Status
```bash
curl http://localhost:4000/scans/{scanId}
```

### View Findings
```bash
# List all findings for a scan
curl http://localhost:4000/findings/scan/{scanId}

# Get finding statistics
curl http://localhost:4000/findings/scan/{scanId}/stats
```

### View AI Usage (if enabled)
```bash
# AI usage for a scan
curl http://localhost:4000/ai-usage/scan/{scanId}/stats

# Global AI statistics
curl http://localhost:4000/ai-usage/stats/global
```

## What Gets Scanned?

### 🔐 Security Scanner
Detects secrets and credentials:
- AWS Access Keys
- API Keys
- Private Keys (RSA, SSH)
- GitHub Tokens
- Slack Tokens
- JWT Tokens
- Database Passwords
- And more...

### 📝 Code Quality Scanner
Detects code issues:
- Long files (>500 lines)
- Long functions (>50 lines)
- Deep nesting (>4 levels)
- TODO/FIXME comments
- Console.log statements

### 📦 Dependency Scanner
Detects dependency issues:
- Unpinned versions (^, ~, *, latest)
- Missing lock files
- Deprecated packages

## AI Analysis (Optional)

When `AI_ENABLED=true`:
- **High-priority findings** (CRITICAL, HIGH) are automatically sent to AI
- AI generates:
  - Root cause analysis
  - Impact assessment
  - Specific recommendations
  - Confidence score
- Usage tracked for cost management

### AI Models Used
- **Simple tasks**: GPT-4o-mini, Claude 3.5 Haiku (fast, cheap)
- **Complex security**: Claude 3.5 Sonnet, GPT-4o (best reasoning)

## Health Score

Calculated based on finding severity:
- Start: 100 points
- CRITICAL finding: -20 points
- HIGH finding: -10 points  
- MEDIUM finding: -5 points
- LOW finding: -2 points
- INFO finding: 0 points

Score adjusts based on finding confidence.

## Configuration Options

### Scanner Configuration
```bash
SCANNERS_ENABLED=security,quality,dependency  # Which to run
SCANNER_CONCURRENCY=3                         # Parallel execution
SCANNER_TIMEOUT_MS=60000                      # 60 second timeout
```

### AI Configuration
```bash
AI_ENABLED=true                       # Enable AI features
DEFAULT_AI_PROVIDER=openai            # openai or anthropic
AI_MODEL_ROUTER_ENABLED=true          # Smart model selection
MAX_TOKENS_PER_SCAN=100000            # Token budget
MAX_AI_COST_PER_SCAN_USD=1.00         # Cost budget ($1)
```

## API Endpoints

### Repositories
- `POST /repositories` - Add repository
- `GET /repositories` - List repositories
- `GET /repositories/:id` - Get repository

### Scans
- `POST /repositories/:id/scan` - Start scan
- `GET /scans/:id` - Get scan status
- `GET /scans/:id/progress` - Get progress (SSE)

### Findings (NEW)
- `GET /findings` - List findings
- `GET /findings/:id` - Get finding
- `GET /findings/scan/:scanId` - Scan findings
- `GET /findings/scan/:scanId/stats` - Statistics

### AI Usage (NEW)
- `GET /ai-usage` - List usage
- `GET /ai-usage/scan/:scanId` - Scan usage
- `GET /ai-usage/scan/:scanId/stats` - Statistics
- `GET /ai-usage/stats/global` - Global stats

### Metrics
- `GET /metrics` - System metrics (JSON)
- `GET /metrics/prometheus` - Prometheus format

## Troubleshooting

### Database Connection Failed
```bash
# Check PostgreSQL is running
docker compose ps

# Check connection string in .env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/repo_doctor
```

### Redis Connection Failed
```bash
# Check Redis is running
docker compose ps

# Check connection string
REDIS_URL=redis://localhost:6379
```

### Scan Stuck in QUEUED
```bash
# Check worker is running
npm run worker

# Check worker logs for errors
```

### AI Analysis Not Working
```bash
# Verify AI is enabled
AI_ENABLED=true

# Verify API key is set
OPENAI_API_KEY=sk-...

# Check worker logs for AI errors
```

### No Findings Detected
- Make sure repository has detectable issues
- Check scanner logs in worker terminal
- Verify scanners are enabled: `SCANNERS_ENABLED=security,quality,dependency`

## Example Workflow

1. **Add Repository**
   ```bash
   curl -X POST http://localhost:4000/repositories \
     -H "Content-Type: application/json" \
     -d '{"url": "https://github.com/user/repo"}'
   ```

2. **Wait for Scan** (check status endpoint)

3. **View Findings**
   ```bash
   curl http://localhost:4000/findings/scan/{scanId}
   ```

4. **Check Health Score**
   ```bash
   curl http://localhost:4000/scans/{scanId}
   ```

5. **Review AI Diagnoses** (if AI enabled)
   ```bash
   curl http://localhost:4000/findings/{findingId}
   ```

6. **Monitor Costs**
   ```bash
   curl http://localhost:4000/ai-usage/stats/global
   ```

## Next Steps

- **Phase 3**: Frontend UI for viewing findings and diagnoses
- **Add More Scanners**: Performance, accessibility, licensing
- **Code Context**: Extract surrounding code for better AI analysis
- **Fix Suggestions**: Generate code diffs with fixes
- **Integrations**: GitHub Issues, Jira, Slack notifications

## Need Help?

- See `PHASE_2_COMPLETE.md` for detailed technical documentation
- See `PHASE_2_PROGRESS.md` for implementation details
- Check worker logs for detailed error messages
- Verify all services are running: PostgreSQL, Redis, API, Worker

## Cost Management

When using AI:
- Set `MAX_AI_COST_PER_SCAN_USD` to limit spending per scan
- Set `MAX_TOKENS_PER_SCAN` to limit token usage
- Monitor with `/ai-usage/stats/global` endpoint
- Only CRITICAL/HIGH findings are diagnosed (configurable)

**Estimated costs**: ~$0.01-0.05 per scan depending on findings count and complexity

---

**Phase 2 is ready! Start scanning! 🚀**
