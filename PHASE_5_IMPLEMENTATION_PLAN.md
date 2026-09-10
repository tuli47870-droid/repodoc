# Phase 5 Implementation Plan - Repo Doctor

## Current State Analysis

### ✅ What Exists (Phase 1 Complete)
- **Frontend**: Complete React UI with all pages
- **Backend API**: Fastify REST API with health, repositories, scans endpoints
- **Database**: PostgreSQL with Prisma ORM (Repository, RepositoryScan, ScanArtifact)
- **Queue System**: Redis + BullMQ for async job processing
- **Worker**: Background scan processing
- **Repository Intake**: Public GitHub repository cloning
- **Repository Mapper**: File structure analysis, language/framework detection
- **Tests**: 8 passing unit tests

### ❌ What's Missing (Phases 2-4)

#### Phase 2: AI Integration & Static Analysis
- [ ] AI provider integration (OpenAI, Anthropic, Google, etc.)
- [ ] Model router for cost optimization
- [ ] Static code analysis scanners
- [ ] Vulnerability scanning
- [ ] Code quality analysis
- [ ] Dependency analysis
- [ ] Health score calculation
- [ ] Root cause diagnosis engine
- [ ] Evidence gathering system

#### Phase 3: Autonomous Repair
- [ ] Repair generation with AI
- [ ] Patch creation
- [ ] Sandbox verification system
- [ ] Git branch creation
- [ ] Pull request workflow

#### Phase 4: GitHub Integration
- [ ] GitHub OAuth
- [ ] Private repository access
- [ ] GitHub App
- [ ] Webhooks (push, PR events)
- [ ] Incremental scanning
- [ ] Changed file detection

#### Phase 5: Production Hardening
- [ ] Authentication system
- [ ] Authorization (RBAC)
- [ ] Rate limiting
- [ ] Security hardening
- [ ] Prompt injection defense
- [ ] Token/cost control
- [ ] Observability (metrics, logs, traces)
- [ ] Cleanup system
- [ ] Database optimization
- [ ] Real-time progress (WebSocket/SSE)
- [ ] Report generation
- [ ] Load testing
- [ ] Security audit

---

## Phase 5 Implementation Strategy

Given the massive scope, I'll focus on **production-ready improvements to existing Phase 1 code** and **foundational work for future phases**.

### Priority 1: Production Hardening for Phase 1 Features ✅

#### 1.1 Input Validation & Security
- [x] Fix mapper totalSizeBytes bug (DONE)
- [ ] Add comprehensive input validation
- [ ] Add path traversal protection
- [ ] Add SSRF protection
- [ ] Add request ID tracking
- [ ] Add security headers

#### 1.2 Rate Limiting
- [ ] Add rate limiting middleware
- [ ] Per-IP rate limits
- [ ] Per-endpoint rate limits
- [ ] Cost-aware rate limiting (when AI added)

#### 1.3 Error Handling & Logging
- [ ] Structured error responses
- [ ] Error codes standardization
- [ ] Improved logging
- [ ] Request/response logging
- [ ] Performance logging

#### 1.4 Database Optimization
- [ ] Add missing indexes
- [ ] Add pagination to all list endpoints
- [ ] Add filtering and sorting
- [ ] Connection pooling optimization
- [ ] Query performance monitoring

#### 1.5 API Quality
- [ ] OpenAPI/Swagger documentation
- [ ] Request validation middleware
- [ ] Response validation
- [ ] API versioning strategy
- [ ] Consistent error format

#### 1.6 Testing
- [ ] Integration tests
- [ ] API endpoint tests
- [ ] Worker tests
- [ ] Error scenario tests
- [ ] Load testing

#### 1.7 Observability
- [ ] Metrics collection (Prometheus format)
- [ ] Health check improvements
- [ ] Performance monitoring
- [ ] Queue metrics
- [ ] Database metrics

#### 1.8 Cleanup System
- [ ] Scheduled cleanup worker
- [ ] Old workspace cleanup
- [ ] Scan retention policy
- [ ] Failed job cleanup

### Priority 2: Foundation for Phase 2 (AI Integration) 🔄

#### 2.1 AI Provider Architecture
- [ ] Abstract AI provider interface
- [ ] Provider factory pattern
- [ ] Configuration for multiple providers
- [ ] Model router skeleton
- [ ] Token counting utilities
- [ ] Cost tracking database schema

#### 2.2 Scanner Architecture
- [ ] Scanner plugin interface
- [ ] Scanner registry
- [ ] Scanner execution framework
- [ ] Finding data model
- [ ] Evidence data model

#### 2.3 Sandbox Architecture
- [ ] Sandbox interface design
- [ ] Docker-based sandbox (if available)
- [ ] Process isolation
- [ ] Resource limits
- [ ] Timeout handling

### Priority 3: Foundation for Phase 3 (Repair System) 🔄

#### 3.1 Repair Data Model
- [ ] Repair request schema
- [ ] Repair result schema
- [ ] Verification result schema
- [ ] Git branch tracking

#### 3.2 Git Operations Service
- [ ] Branch creation
- [ ] Commit creation
- [ ] Patch application
- [ ] Diff generation

### Priority 4: Foundation for Phase 4 (GitHub Integration) 🔄

#### 4.1 Authentication Architecture
- [ ] User model
- [ ] Session management
- [ ] JWT/token generation
- [ ] OAuth flow skeleton

#### 4.2 Authorization Architecture
- [ ] Role-based access control
- [ ] Permission system
- [ ] Repository ownership
- [ ] Scan access control

### Priority 5: Frontend Integration 🔄

#### 5.1 Remove Mock Data
- [ ] Connect Dashboard to real API
- [ ] Connect Findings page to real API
- [ ] Connect Scan History to real API
- [ ] Connect Scan Progress to real API

#### 5.2 Real-time Updates
- [ ] Add polling for scan progress
- [ ] WebSocket/SSE skeleton for future
- [ ] Optimistic UI updates
- [ ] Error recovery

---

## Implementation Order

### Week 1: Critical Production Fixes
1. Security hardening (input validation, path traversal, SSRF)
2. Rate limiting
3. Error handling improvements
4. Logging improvements

### Week 2: API Quality & Testing
1. OpenAPI documentation
2. API tests
3. Integration tests
4. Database optimization

### Week 3: Observability & Cleanup
1. Metrics collection
2. Cleanup worker
3. Monitoring dashboard
4. Performance optimization

### Week 4: AI Foundation
1. AI provider interface
2. Scanner architecture
3. Finding data model
4. Token tracking

### Week 5: Authentication Foundation
1. User model
2. Authentication middleware
3. Authorization system
4. OAuth skeleton

### Week 6: Frontend Integration
1. Remove mock data
2. Real-time progress
3. Error handling
4. Loading states

---

## Immediate Actions (This Session)

Given time constraints, I will focus on:

### 1. Security Hardening ✅
- [x] Fix mapper bug (DONE)
- [ ] Add rate limiting
- [ ] Add input validation improvements
- [ ] Add security headers
- [ ] Add request ID tracking

### 2. API Quality ✅
- [ ] Add OpenAPI documentation
- [ ] Improve error responses
- [ ] Add pagination
- [ ] Add filtering

### 3. Testing ✅
- [ ] Add integration tests
- [ ] Add API tests
- [ ] Test error scenarios

### 4. Database Optimization ✅
- [ ] Add pagination support
- [ ] Add indexes review
- [ ] Add query optimization

### 5. Cleanup System ✅
- [ ] Create cleanup worker
- [ ] Add retention policies

### 6. Observability ✅
- [ ] Add metrics endpoint
- [ ] Improve health checks
- [ ] Add performance logging

---

## Acceptance Criteria

### Phase 5 (Minimal Production Ready)
- ✅ All Phase 1 bugs fixed
- ✅ Security vulnerabilities addressed
- ✅ Rate limiting in place
- ✅ Comprehensive error handling
- ✅ API documentation
- ✅ Integration tests passing
- ✅ Cleanup system working
- ✅ Monitoring in place
- ✅ Load tested for expected scale

### Phase 5 (Full - Requires Phases 2-4)
- ❌ AI integration working
- ❌ Static analysis working
- ❌ Repair generation working
- ❌ GitHub OAuth working
- ❌ Webhooks working
- ❌ All security measures in place
- ❌ Production load tested
- ❌ End-to-end test passing

---

## Conclusion

**Current Status**: Phase 1 Complete (Backend Foundation)  
**Phase 5 Requirement**: Requires Phases 2, 3, 4 first  
**Realistic Goal**: Production harden Phase 1 + Create foundations for Phase 2-4  

**This session focus**: Implement critical production improvements to make Phase 1 production-ready.

