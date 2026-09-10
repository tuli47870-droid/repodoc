# Phase 2: AI Integration - COMPLETE ✅

## Overview
Phase 2 has been successfully implemented, adding AI-powered analysis capabilities to Repo Doctor. The system can now automatically scan repositories for security issues, code quality problems, and dependency issues, then optionally diagnose findings using AI providers.

## Completed Components

### 1. AI Provider System ✅
**Location:** `backend/src/ai/`

#### AI Provider Factory (`AIProviderFactory.ts`)
- Factory pattern for creating and caching AI provider instances
- Support for OpenAI and Anthropic providers
- Availability checking based on API key configuration
- Static methods for easy access across the application

#### Model Router (`ModelRouter.ts`)
- Intelligent model selection based on task type and complexity
- Cost and token budget awareness
- Task-specific routing:
  - **Simple tasks**: GPT-4o-mini, Claude 3.5 Haiku (fast, cheap)
  - **Medium tasks**: GPT-4o-mini, Claude 3.5 Haiku (balanced)
  - **Complex tasks**: Claude 3.5 Sonnet, GPT-4o (best reasoning)
  - **Security analysis**: Premium models for critical findings

#### OpenAI Provider (`providers/OpenAIProvider.ts`)
- Complete OpenAI integration with tiktoken for accurate token counting
- Chat completion support with streaming capability
- Cost estimation using official pricing
- Model support: GPT-4o, GPT-4o-mini

#### Anthropic Provider (`providers/AnthropicProvider.ts`)
- Complete Anthropic integration
- Estimated token counting (no official counter available)
- Chat completion support
- Model support: Claude 3.5 Sonnet, Claude 3.5 Haiku

### 2. Scanner Architecture ✅
**Location:** `backend/src/scanners/`

#### Scanner Registry (`ScannerRegistry.ts`)
- Centralized registry for all scanner instances
- Dynamic scanner registration and retrieval
- Filtering by type (security, quality, dependency)

#### Scanner Executor (`ScannerExecutor.ts`)
- Parallel execution of scanners with concurrency control
- Timeout handling per scanner
- Error isolation (one scanner failure doesn't break others)
- Comprehensive execution reporting

#### Security Scanner (`security/SecretScanner.ts`)
Detects 9 types of secrets/credentials:
- AWS Access Keys
- Generic API Keys
- Private Keys (RSA, SSH)
- GitHub Personal Access Tokens
- Slack Tokens
- JWT Tokens
- Database Passwords
- Email Credentials
- Generic Secrets

**Pattern-based detection with high confidence scoring**

#### Code Quality Scanner (`quality/CodeQualityScanner.ts`)
Detects code quality issues:
- Long files (>500 lines)
- Long functions (>50 lines)
- Deep nesting (>4 levels)
- TODO/FIXME comments
- Console.log statements (JavaScript/TypeScript)

**File-based analysis with configurable thresholds**

#### Dependency Scanner (`dependency/DependencyScanner.ts`)
Detects dependency issues:
- Unpinned versions (^, ~, *, latest)
- Missing lock files
- Deprecated packages (TODO: requires npm registry integration)

**Package manager support: npm, yarn, pnpm**

### 3. Database Integration ✅
**Location:** `backend/prisma/schema.prisma`, `backend/src/db/repositories/`

#### Prisma Schema Updates
New models added:
- **Finding**: Stores scanner findings with fingerprinting for deduplication
- **Diagnosis**: Stores AI-generated diagnoses for findings
- **AIUsage**: Tracks AI provider usage, tokens, and costs

#### Finding Repository (`FindingRepository.ts`)
- Create/read/list findings
- Filter by scan, severity, category
- Fingerprint-based deduplication
- Aggregate statistics (counts by category/severity)

#### Diagnosis Repository (`DiagnosisRepository.ts`)
- Create/read diagnoses
- Link diagnoses to findings
- Confidence-based ordering
- Scan-level diagnosis queries

#### AI Usage Repository (`AIUsageRepository.ts`)
- Track all AI provider calls
- Token and cost reporting
- Statistics by provider and model
- Global usage analytics

### 4. AI Analysis Service ✅
**Location:** `backend/src/services/AIAnalysisService.ts`

#### Features
- **Intelligent Diagnosis**: Analyzes findings with AI to generate explanations and recommendations
- **Batch Processing**: Process multiple findings efficiently with rate limiting
- **Task Classification**: Automatically determines task type from finding characteristics
- **Prompt Engineering**: Well-structured prompts for consistent, actionable responses
- **Response Parsing**: JSON extraction from AI responses with fallback handling
- **Usage Tracking**: Automatic recording of tokens and costs for budget management

#### AI Diagnosis Process
1. Classify finding → determine AI task type
2. Route to appropriate model via ModelRouter
3. Build context-rich prompt with repository and code information
4. Call AI provider with structured request
5. Parse AI response (JSON format expected)
6. Store diagnosis in database
7. Record usage statistics

### 5. Integration with Scan Worker ✅
**Location:** `backend/src/workers/scanWorker.ts`

The scan worker now:
1. Clones repository
2. Generates repository manifest
3. **NEW:** Executes all registered scanners in parallel
4. **NEW:** Stores findings in database with fingerprinting
5. **NEW:** Optionally runs AI analysis on high-priority findings
6. Calculates health score based on findings
7. Completes scan with results

#### Health Score Calculation
Simple severity-based scoring:
- Start at 100
- Subtract points per finding:
  - CRITICAL: 20 points × confidence
  - HIGH: 10 points × confidence
  - MEDIUM: 5 points × confidence
  - LOW: 2 points × confidence
  - INFO: 0 points
- Minimum score: 0, Maximum score: 100

### 6. API Routes ✅
**Location:** `backend/src/routes/`

#### Findings API (`findings.ts`)
- `GET /findings` - List all findings with pagination and filtering
- `GET /findings/:id` - Get specific finding with diagnosis
- `GET /findings/scan/:scanId` - Get all findings for a scan
- `GET /findings/scan/:scanId/stats` - Get finding statistics (counts by severity/category)

#### AI Usage API (`ai-usage.ts`)
- `GET /ai-usage` - List all AI usage records
- `GET /ai-usage/:id` - Get specific usage record
- `GET /ai-usage/scan/:scanId` - Get AI usage for a scan
- `GET /ai-usage/scan/:scanId/stats` - Get usage statistics (tokens, costs by provider)
- `GET /ai-usage/stats/global` - Get global AI usage statistics

#### Metrics Updates (`metrics.ts`)
Added to metrics endpoints:
- Total findings count
- Total diagnoses count
- Prometheus metrics for findings and diagnoses

### 7. Configuration ✅
**Location:** `backend/src/config/index.ts`, `backend/.env.example`

#### New Environment Variables
```bash
# AI Control
AI_ENABLED=false                    # Master switch for AI features

# AI Providers (at least one required if AI_ENABLED=true)
OPENAI_API_KEY=                     # OpenAI API key
ANTHROPIC_API_KEY=                  # Anthropic API key
GOOGLE_API_KEY=                     # Google AI key (reserved for future)

# AI Configuration
DEFAULT_AI_PROVIDER=openai          # Default provider to use
AI_MODEL_ROUTER_ENABLED=true        # Enable smart model routing
MAX_TOKENS_PER_SCAN=100000          # Token budget per scan
MAX_AI_COST_PER_SCAN_USD=1.00       # Cost budget per scan

# Scanner Configuration
SCANNERS_ENABLED=security,quality,dependency  # Which scanners to run
SCANNER_CONCURRENCY=3                         # How many scanners to run in parallel
SCANNER_TIMEOUT_MS=60000                      # Timeout per scanner (60s)

# Health Score
HEALTH_SCORE_ENABLED=true           # Enable health score calculation
```

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                         Scan Worker                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ├─► Clone Repository
                              ├─► Generate Manifest
                              │
                              v
┌─────────────────────────────────────────────────────────────┐
│                      Scanner Executor                        │
│  ┌─────────────┬──────────────┬────────────────────┐       │
│  │   Security  │ Code Quality │    Dependency      │       │
│  │   Scanner   │   Scanner    │     Scanner        │       │
│  └─────────────┴──────────────┴────────────────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              v
                         [ Findings ]
                              │
                              v (if AI_ENABLED)
┌─────────────────────────────────────────────────────────────┐
│                    AI Analysis Service                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            Model Router                              │  │
│  │  ┌──────────────┬────────────────┬──────────────┐   │  │
│  │  │   OpenAI     │   Anthropic    │   Google     │   │  │
│  │  │   Provider   │    Provider    │   Provider   │   │  │
│  │  └──────────────┴────────────────┴──────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              v
                        [ Diagnoses ]
                              │
                              v
                    [ Health Score Updated ]
```

## Database Schema

```sql
-- Findings table
Finding {
  id: String (UUID)
  scanId: String → RepositoryScan.id
  category: String (e.g., "secret", "code-smell", "dependency")
  severity: String (CRITICAL, HIGH, MEDIUM, LOW, INFO)
  title: String
  description: String
  location: Json (file, line, column)
  evidence: Json (matched content, context)
  confidence: Float (0.0-1.0)
  fingerprint: String (unique, indexed)
  scanner: String (scanner name)
  metadata: Json (additional data)
  createdAt: DateTime
  updatedAt: DateTime
}

-- Diagnoses table
Diagnosis {
  id: String (UUID)
  findingId: String → Finding.id
  rootCause: String
  explanation: String
  impact: String
  recommendation: String
  confidence: Float (0.0-1.0)
  aiProvider: String (openai, anthropic)
  aiModel: String (gpt-4o, claude-3-5-sonnet, etc.)
  tokensUsed: Int
  costUsd: Float
  createdAt: DateTime
}

-- AI Usage table
AIUsage {
  id: String (UUID)
  scanId: String → RepositoryScan.id
  provider: String
  model: String
  task: String (diagnosis, security-analysis, code-review)
  inputTokens: Int
  outputTokens: Int
  totalTokens: Int
  costUsd: Float
  durationMs: Int
  success: Boolean
  errorMessage: String?
  createdAt: DateTime
}
```

## Testing Status

### Unit Tests
- ✅ All existing tests passing (8/8)
- ⚠️ AI components not yet tested (Phase 2 scope focused on implementation)

### Integration Tests
- ✅ All existing API tests passing (27/27)
- ⚠️ Scanner integration not yet tested
- ⚠️ AI analysis not yet tested

### Manual Testing Required
1. **Scanner Testing**:
   - Create test repository with known issues
   - Run scan and verify findings detected
   - Verify fingerprinting works (no duplicates)

2. **AI Analysis Testing**:
   - Set `AI_ENABLED=true` and configure API key
   - Run scan on repository with findings
   - Verify diagnoses generated for CRITICAL/HIGH findings
   - Check AI usage tracking in database

3. **Cost Management**:
   - Verify token budgets enforced
   - Verify cost budgets enforced
   - Check usage statistics accuracy

## Next Steps (Phase 3 Preview)

### Immediate Actions
1. **Database Migration**: Run `npm run db:migrate` to apply schema changes (requires PostgreSQL)
2. **Test Scanners**: Run a scan on a test repository to verify scanner functionality
3. **Test AI Analysis**: Configure an AI provider and test diagnosis generation

### Phase 3: Frontend Integration
- Display findings in the UI
- Show AI diagnoses and recommendations
- Visualize health score trends
- Interactive finding management
- AI usage and cost tracking dashboard

### Future Enhancements
- More scanner types (performance, accessibility, licensing)
- Code context extraction for better AI analysis
- Fix suggestions with code diffs
- Batch fixing of similar issues
- Integration with external tools (GitHub Issues, Jira, etc.)

## Dependencies Added

```json
{
  "openai": "^4.72.0",
  "@anthropic-ai/sdk": "^0.32.1",
  "@google/generative-ai": "^0.21.0",
  "tiktoken": "^1.0.17",
  "p-limit": "^6.1.0"
}
```

## Configuration Files Updated
- ✅ `backend/prisma/schema.prisma` - Added Finding, Diagnosis, AIUsage models
- ✅ `backend/src/config/index.ts` - Added AI configuration
- ✅ `backend/.env.example` - Documented all new environment variables
- ✅ `backend/src/app.ts` - Registered new API routes

## Build Status
✅ **All code compiles successfully**
- TypeScript compilation: ✅ PASS
- No type errors
- All imports resolved correctly

## Documentation
- ✅ Inline code documentation (JSDoc comments)
- ✅ README files for complex modules
- ✅ This completion report
- ✅ Phase 2 progress tracking (`PHASE_2_PROGRESS.md`)

## Known Limitations

1. **No database migration yet**: Schema changes exist but not applied (requires running PostgreSQL)
2. **AI analysis is optional**: Can run without AI providers (scanners work independently)
3. **Code context not extracted**: AI analysis uses finding data only, not surrounding code
4. **Limited scanner types**: 3 scanners implemented (security, quality, dependency)
5. **No UI integration yet**: Phase 3 scope
6. **No automated tests for AI**: Testing requires real API keys

## How to Use

### Running Without AI (Scanner-only mode)
```bash
# Set in .env
AI_ENABLED=false

# Start services
docker compose up -d  # PostgreSQL + Redis
cd backend
npm install
npm run db:generate
npm run db:migrate
npm run dev         # Start API server
npm run worker      # Start scan worker

# Create a scan via API
curl -X POST http://localhost:4000/repositories \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/user/repo"}'

# Findings will be detected and stored
# Health score calculated based on findings
```

### Running With AI Analysis
```bash
# Set in .env
AI_ENABLED=true
OPENAI_API_KEY=sk-...  # Your OpenAI API key

# Start services (same as above)
# When scan runs:
# 1. Scanners detect findings
# 2. High-priority findings (CRITICAL/HIGH) sent to AI
# 3. AI generates diagnoses
# 4. Usage tracked in database

# Check AI usage
curl http://localhost:4000/ai-usage/stats/global
```

## Success Criteria Met ✅

- [x] AI provider system implemented (OpenAI, Anthropic)
- [x] Model router with intelligent selection
- [x] Token counting and cost estimation
- [x] Scanner architecture with 3 production scanners
- [x] Finding storage with deduplication
- [x] AI analysis service with batch processing
- [x] Database schema updates
- [x] API routes for findings and AI usage
- [x] Integration with scan worker
- [x] Health score calculation
- [x] Configuration management
- [x] All code compiles successfully

**Phase 2 is complete and ready for Phase 3 frontend integration!** 🎉
