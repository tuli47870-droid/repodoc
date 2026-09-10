# Phase 2 Implementation Plan - AI Integration

## Overview

Phase 2 adds AI-powered analysis capabilities to Repo Doctor, including:
- Multi-provider AI integration (OpenAI, Anthropic, Google)
- Static code analysis
- Security vulnerability detection
- Code quality assessment
- Health score calculation
- Root cause diagnosis
- Evidence gathering

## Architecture

```
Repository Manifest
       ↓
Scanner Registry
       ↓
[Security Scanner] [Quality Scanner] [Dependency Scanner] [Architecture Scanner]
       ↓
Finding Records (Database)
       ↓
Evidence Engine
       ↓
AI Model Router
       ↓
[OpenAI] [Anthropic] [Google] [Local Models]
       ↓
Diagnosis Records (Database)
       ↓
Health Score Calculator
```

## Implementation Steps

### 1. AI Provider Architecture ✅

#### 1.1 Base Provider Interface
```typescript
interface AIProvider {
  name: string;
  chat(messages: ChatMessage[], options: ChatOptions): Promise<ChatResponse>;
  countTokens(text: string): number;
  estimateCost(inputTokens: number, outputTokens: number, model: string): number;
}
```

#### 1.2 Provider Implementations
- OpenAI provider (GPT-4, GPT-3.5)
- Anthropic provider (Claude 3.5, Claude 3)
- Google provider (Gemini)
- Local provider (fallback)

#### 1.3 Model Router
- Route requests to appropriate provider based on:
  - Task complexity
  - Token budget
  - Cost constraints
  - Provider availability
- Fallback chain for reliability

#### 1.4 Token & Cost Tracking
- Track token usage per scan
- Track cost per provider
- Budget enforcement
- Database schema for cost tracking

### 2. Scanner Architecture ✅

#### 2.1 Base Scanner Interface
```typescript
interface Scanner {
  name: string;
  description: string;
  category: ScanCategory;
  scan(context: ScanContext): Promise<Finding[]>;
}
```

#### 2.2 Scanner Categories
- **Security**: Vulnerability detection, secret scanning
- **Quality**: Code smells, complexity, maintainability
- **Dependencies**: Outdated packages, vulnerabilities, license issues
- **Architecture**: Design patterns, structure issues, modularity
- **Build**: Build errors, configuration issues
- **Tests**: Test coverage, failing tests, test quality
- **Runtime**: Performance issues, resource usage

#### 2.3 Scanner Registry
- Register scanners dynamically
- Enable/disable scanners
- Configure scanner priority
- Parallel execution with rate limiting

### 3. Static Analysis Scanners ✅

#### 3.1 Security Scanner
- **Secret Detection**: Scan for API keys, tokens, passwords
- **Dependency Vulnerabilities**: Check npm audit, GitHub advisories
- **Code Vulnerabilities**: SQL injection, XSS patterns
- **Security Best Practices**: Helmet usage, HTTPS, etc.

#### 3.2 Code Quality Scanner
- **Complexity Analysis**: Cyclomatic complexity, nesting depth
- **Code Smells**: Long functions, large classes, duplicated code
- **Best Practices**: Naming conventions, error handling
- **Type Safety**: TypeScript usage, any usage

#### 3.3 Dependency Scanner
- **Outdated Packages**: Compare with latest versions
- **Vulnerability Check**: npm audit, Snyk, GitHub advisories
- **License Compliance**: Check license compatibility
- **Dependency Health**: Maintenance status, alternatives

#### 3.4 Architecture Scanner
- **Module Organization**: Proper separation of concerns
- **Circular Dependencies**: Detect circular imports
- **Layer Violations**: Check architectural boundaries
- **Design Patterns**: Identify anti-patterns

#### 3.5 Build Scanner
- **Build Errors**: Parse build output
- **Configuration Issues**: Check tsconfig, webpack, etc.
- **Missing Dependencies**: Detect import errors

#### 3.6 Test Scanner
- **Test Coverage**: Parse coverage reports
- **Failing Tests**: Identify failing test suites
- **Test Quality**: Check assertions, mocking practices

### 4. Finding Data Model ✅

```prisma
model Finding {
  id          String   @id @default(cuid())
  scanId      String
  category    String   // SECURITY, QUALITY, DEPENDENCY, etc.
  severity    String   // CRITICAL, HIGH, MEDIUM, LOW, INFO
  title       String
  description String
  location    Json     // file, line, column
  evidence    Json     // code snippets, context
  confidence  Float    // 0.0 - 1.0
  fingerprint String   // for deduplication
  scanner     String   // which scanner found it
  createdAt   DateTime @default(now())
  
  scan        RepositoryScan @relation(...)
  diagnoses   Diagnosis[]
}

model Diagnosis {
  id             String   @id @default(cuid())
  findingId      String
  rootCause      String
  explanation    String
  impact         String
  recommendation String
  confidence     Float
  aiModel        String   // which AI model generated it
  tokensUsed     Int
  costUsd        Float
  createdAt      DateTime @default(now())
  
  finding        Finding @relation(...)
}

model AIUsage {
  id            String   @id @default(cuid())
  scanId        String
  provider      String
  model         String
  task          String
  inputTokens   Int
  outputTokens  Int
  totalTokens   Int
  costUsd       Float
  durationMs    Int
  createdAt     DateTime @default(now())
  
  scan          RepositoryScan @relation(...)
}
```

### 5. Evidence Engine ✅

#### 5.1 Evidence Collection
- Collect relevant code snippets
- Gather context around findings
- Extract configuration files
- Collect dependency information

#### 5.2 Evidence Analysis
- AI-powered evidence analysis
- Pattern recognition
- Cross-reference findings
- Identify root causes

### 6. Health Score Calculator ✅

#### 6.1 Scoring Algorithm
```typescript
HealthScore = weighted_average([
  SecurityScore     * 0.30,  // 30% weight
  QualityScore      * 0.25,  // 25% weight
  DependencyScore   * 0.20,  // 20% weight
  ArchitectureScore * 0.10,  // 10% weight
  BuildScore        * 0.10,  // 10% weight
  TestScore         * 0.05,  // 5% weight
])
```

#### 6.2 Category Scoring
Each category scored 0-100 based on:
- Number of findings by severity
- Severity weights (CRITICAL: -20, HIGH: -10, MEDIUM: -5, LOW: -2)
- Baseline: 100
- Minimum: 0

#### 6.3 Trend Tracking
- Compare with previous scans
- Track score changes over time
- Identify improvements/regressions

### 7. Root Cause Analysis ✅

#### 7.1 Pattern Detection
- Group related findings
- Identify common causes
- Detect cascading issues

#### 7.2 AI-Powered Analysis
- Send grouped findings to AI
- Request root cause explanation
- Get impact assessment
- Generate recommendations

#### 7.3 Confidence Scoring
- Score diagnosis confidence (0.0-1.0)
- Based on evidence quality
- Based on finding correlation

## Implementation Order

### Week 1: Foundation
1. ✅ AI provider interface
2. ✅ OpenAI provider implementation
3. ✅ Anthropic provider implementation
4. ✅ Model router skeleton
5. ✅ Token counting utilities
6. ✅ Cost tracking database schema

### Week 2: Scanners
1. ✅ Scanner interface
2. ✅ Scanner registry
3. ✅ Security scanner (secrets, basic vulnerabilities)
4. ✅ Quality scanner (basic code smells)
5. ✅ Dependency scanner (outdated packages)
6. ✅ Finding data model

### Week 3: Analysis
1. ✅ Evidence engine
2. ✅ AI diagnosis integration
3. ✅ Root cause analysis
4. ✅ Health score calculator
5. ✅ Scoring algorithm implementation

### Week 4: Integration
1. ✅ Update scan worker to run scanners
2. ✅ Integrate AI analysis
3. ✅ Store findings and diagnoses
4. ✅ Calculate and store health scores
5. ✅ API endpoints for findings/diagnoses

### Week 5: Testing & Polish
1. ⏳ Integration tests
2. ⏳ End-to-end scan test
3. ⏳ Cost tracking verification
4. ⏳ Performance optimization
5. ⏳ Documentation

## Configuration

### Environment Variables
```bash
# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=...

# AI Configuration
DEFAULT_AI_PROVIDER=openai
AI_MODEL_ROUTER_ENABLED=true
MAX_TOKENS_PER_SCAN=100000
MAX_AI_COST_PER_SCAN_USD=1.00

# Scanner Configuration
SCANNERS_ENABLED=security,quality,dependency,architecture
SCANNER_CONCURRENCY=3
SCANNER_TIMEOUT_MS=60000

# Health Score
HEALTH_SCORE_ENABLED=true
HEALTH_SCORE_WEIGHTS='{"security":0.3,"quality":0.25,"dependency":0.2,"architecture":0.1,"build":0.1,"test":0.05}'
```

## API Endpoints

### Findings
- `GET /api/scans/:id/findings` - List findings with filtering
- `GET /api/findings/:id` - Get finding details
- `GET /api/findings/:id/diagnoses` - Get AI diagnoses

### Health Score
- `GET /api/scans/:id/health` - Get health score breakdown
- `GET /api/repositories/:id/health/trend` - Health score trend

### AI Usage
- `GET /api/scans/:id/ai-usage` - Get AI usage for scan
- `GET /api/ai-usage/stats` - Get AI usage statistics

## Testing Strategy

### Unit Tests
- AI provider implementations
- Scanner implementations
- Health score calculator
- Model router logic

### Integration Tests
- End-to-end scan with scanners
- AI provider integration
- Finding storage and retrieval
- Health score calculation

### Load Tests
- Multiple concurrent scans
- AI provider rate limiting
- Token budget enforcement

## Success Criteria

- ✅ AI providers working (OpenAI, Anthropic)
- ✅ At least 3 scanners implemented
- ✅ Findings stored in database
- ✅ AI diagnosis working
- ✅ Health score calculated
- ✅ Cost tracking accurate
- ✅ Integration tests passing
- ✅ Performance acceptable (<5 min per scan)

## Risks & Mitigation

### Risk: AI Provider Costs
**Mitigation**: 
- Strict token budgets per scan
- Cost monitoring and alerts
- Model router to use cheaper models when possible

### Risk: AI Provider Rate Limits
**Mitigation**:
- Provider fallback chain
- Request queuing and retry logic
- Rate limit monitoring

### Risk: False Positives
**Mitigation**:
- Confidence scoring
- Multiple evidence sources
- Human review workflow (Phase 3)

### Risk: Performance
**Mitigation**:
- Parallel scanner execution
- Caching of analysis results
- Incremental scanning (Phase 4)

## Next Phase Preview

**Phase 3** will add:
- Automated repair generation
- Patch verification
- Git PR workflow
- Fix workspace

