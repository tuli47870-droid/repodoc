# REPO DOCTOR — COMPLETE FRONTEND UI BUILD PROMPT

You are building the complete frontend UI for a product called **Repo Doctor**.

Repo Doctor is an AI-powered repository diagnosis and repair platform for developers.

IMPORTANT:
This task is ONLY for building the frontend/UI.
Do NOT implement real GitHub authentication, repository cloning, LLM APIs, sandbox execution, database, backend, or real code analysis yet.

Use realistic mock data and mock interactions so the UI feels like a real production product.

---

# 1. PRODUCT CONCEPT

Repo Doctor is NOT a normal chatbot.

Do NOT design it like ChatGPT.

The primary experience is:

Repository
→ Scan
→ Diagnose
→ Understand Root Cause
→ Inspect Evidence
→ Generate Fix
→ Verify Fix
→ Create Pull Request

The UI should feel like a combination of:

* GitHub
* Sentry
* modern developer IDE
* security dashboard
* AI diagnostic system

The product should communicate:

"Your repository has symptoms. Repo Doctor diagnoses the underlying problems."

---

# 2. DESIGN DIRECTION

Create a premium, modern developer SaaS interface.

Visual style:

* Clean
* Technical
* Professional
* Minimal
* High information density
* Excellent typography
* Subtle borders
* Subtle shadows
* Rounded but not excessively rounded
* Strong visual hierarchy
* Dark developer-console aesthetic as the primary theme

Avoid:

* Cartoon UI
* Excessive gradients
* Huge decorative illustrations
* Generic AI chatbot appearance
* Excessive glassmorphism
* Excessive animations
* Excessive rounded cards
* "AI magic" visual clichés

The product should look like serious developer infrastructure.

---

# 3. TECH STACK

Use:

* React
* TypeScript
* Tailwind CSS
* shadcn/ui if already available
* Lucide icons
* Recharts for charts if needed

Use the existing project setup if one already exists.

Do NOT unnecessarily replace the existing framework.

Keep components modular and reusable.

---

# 4. RESPONSIVE DESIGN

Support:

* Desktop
* Laptop
* Tablet
* Mobile

Desktop is the primary target.

The application should work well around:

1440 × 900
1280 × 800
1024 × 768
768 × 1024
390 × 844

On mobile:

* Sidebar becomes a drawer
* Tables become cards or horizontally scrollable
* Code panels remain usable
* Dashboard cards stack vertically

---

# 5. GLOBAL APPLICATION SHELL

Create a reusable application shell.

Desktop:

┌─────────────────────────────────────────────────────────────┐
│ Repo Doctor | Repository | Branch | Search | Scan | Avatar │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│ Sidebar      │ Main Content                                 │
│              │                                              │
│ Overview     │                                              │
│ Findings     │                                              │
│ Security     │                                              │
│ Architecture │                                              │
│ Dependencies │                                              │
│ Build        │                                              │
│ Tests        │                                              │
│ Runtime      │                                              │
│              │                                              │
│──────────────│                                              │
│ Scan History │                                              │
│ Settings     │                                              │
└──────────────┴──────────────────────────────────────────────┘

Header:

LEFT:

* Repo Doctor logo
* Repository selector

CENTER/LEFT:

* repository name
* branch selector
* scan status

RIGHT:

* search
* notifications
* "New Scan" button
* user avatar

Sidebar:

Overview
Findings
Security
Architecture
Dependencies
Build
Tests
Runtime

separator

Scan History
Settings

Bottom:

Current repository
branch
last scan time

---

# 6. BRANDING

Product name:

Repo Doctor

Logo concept:

A minimal medical cross combined with a code bracket or terminal symbol.

Do not create a childish medical logo.

Use a simple developer-oriented icon.

Example conceptual logo:

< /> + +

or

code brackets + medical cross.

Use the logo consistently.

---

# 7. LANDING / EMPTY STATE

Create a first-use page for users who have not connected a repository.

Center the experience.

Headline:

"Diagnose your repository."

Subheadline:

"Find bugs, security risks, architecture problems, build failures, and their root causes."

Main input:

"Paste GitHub repository URL"

Buttons:

"Start Diagnosis"

"Upload ZIP"

"Connect GitHub"

Below input:

"Public repositories can be analyzed instantly."

Create a small example area:

Try an example repository →

Do not make this look like a chatbot prompt box.

---

# 8. REPOSITORY DASHBOARD

This is the main page.

Header:

Repository name:

"we0"

Branch:

"main"

Last scan:

"Today, 10:42 AM"

Button:

"Run New Scan"

---

# 9. HEALTH SCORE

Create a prominent health score section.

Example:

REPOSITORY HEALTH

64 / 100

NEEDS TREATMENT

Use a circular or semi-circular health visualization.

Below it:

3 Critical
8 High
14 Medium
22 Low

Do not use only color to communicate severity.
Include icons and labels.

---

# 10. HEALTH CATEGORY CARDS

Create cards:

Security
81 / 100

Architecture
72 / 100

Build
92 / 100

Tests
47 / 100

Dependencies
43 / 100

Runtime
74 / 100

Maintainability
57 / 100

Documentation
61 / 100

Each card should have:

* score
* trend
* short status
* click interaction

Example:

Security
81
+6 from previous scan
Healthy

Tests
47
-4 from previous scan
Needs attention

---

# 11. TOP PROBLEMS SECTION

Title:

"Top Problems"

Each issue should look like a serious diagnostic finding.

Example:

CRITICAL

"Preview system fails without WebContainer"

Confidence: 96%

Root Cause:
"Preview lifecycle is tightly coupled to the WebContainer runtime."

Evidence:

src/runtime/container.ts:41
src/preview/server.ts:82

Buttons:

View Evidence
Explain
Generate Fix

---

Another issue:

HIGH

"Authentication logic duplicated across 4 modules"

Another:

HIGH

"Vulnerable dependency detected"

Another:

MEDIUM

"Circular dependency detected"

---

# 12. FINDINGS PAGE

Create a full findings management page.

Header:

Findings

"47 issues detected"

Controls:

* Search
* Severity filter
* Category filter
* Status filter
* Sort

Tabs:

All
Critical
High
Medium
Low
Resolved

Create a professional table:

Severity
Finding
Category
File
Confidence
Status

Example:

CRITICAL
Preview runtime dependency
Architecture
src/runtime/container.ts
96%
Open

HIGH
Authentication duplication
Architecture
src/auth/*
91%
Open

HIGH
Outdated vulnerable package
Security
package.json
99%
Open

Rows must be clickable.

---

# 13. FINDING DETAIL PAGE

This is one of the most important screens.

Header:

← Back to Findings

CRITICAL

Preview system fails without WebContainer

Confidence: 96%

Buttons:

Generate Fix
Mark Resolved
Ignore

---

SECTION:

WHY THIS HAPPENS

"The preview service assumes that WebContainer is responsible for starting and maintaining the runtime."

---

SECTION:

ROOT CAUSE

Create a visual dependency diagram:

Preview UI
↓
Preview Runtime
↓
WebContainer Lifecycle
↓
Preview Server

Highlight the problematic dependency.

---

SECTION:

IMPACT

"Removing WebContainer prevents the preview service from starting."

Use a small impact card.

---

SECTION:

EVIDENCE

Create code editor panels.

File:

src/runtime/container.ts

Line 41

Show realistic code:

await container.start();
previewServer.attach(container);

Highlight relevant lines.

Another evidence block:

src/preview/server.ts

Line 82

Use syntax highlighting.

Add buttons:

Open File
Copy
Explain This Line

---

SECTION:

REPRODUCTION

Show:

1. Start application
2. Remove WebContainer runtime
3. Start preview
4. Preview fails

Status:

Reproduced ✓

---

SECTION:

RECOMMENDED FIX

"Decouple preview lifecycle from WebContainer."

Buttons:

Generate Patch
View Proposed Architecture

---

# 14. ARCHITECTURE PAGE

Create a visual architecture dashboard.

Header:

Architecture

"Repository structure and dependency relationships"

Main visualization:

Frontend
↓
API Layer
↓
Services
↓
Database

Show nodes and connections.

Use interactive node cards.

Example:

Frontend
18 modules

API
24 endpoints

Services
12 modules

Database
8 models

---

Architecture problems panel:

CRITICAL
Tightly coupled runtime

HIGH
Circular dependency

MEDIUM
Large service boundary

---

Add:

"Architecture Health: 72/100"

---

# 15. DEPENDENCIES PAGE

Create a dependency dashboard.

Top cards:

Total Dependencies
184

Outdated
23

Vulnerable
4

Unused
17

Sections:

Vulnerable Dependencies

Package
Current
Recommended
Severity

Example:

lodash
4.17.19
4.17.21
HIGH

axios
0.21.1
1.x
HIGH

---

Create dependency relationship visualization.

---

# 16. SECURITY PAGE

Security dashboard.

Header:

Security

"4 vulnerabilities require attention"

Cards:

Critical
1

High
3

Medium
8

Low
12

Security findings table.

Include:

Secrets
Dependencies
Authentication
Authorization
Injection
Configuration

Create a "Security posture" visualization.

---

# 17. BUILD PAGE

Build dashboard.

Show:

Build Status

PASS / FAIL

Example:

✓ Dependencies installed
✓ Type checking
✓ Compilation
✗ Production build

Show terminal-like output:

$ npm run build

Compiling...
src/runtime/container.ts:41

Error:
Module dependency unavailable

Exit code: 1

Buttons:

View Error
Ask Doctor
Retry Build

---

# 18. TESTS PAGE

Dashboard:

Tests

47% coverage

Cards:

Passing
184

Failing
12

Skipped
8

Coverage
47%

Create test result list.

Example:

✓ Authentication test
✓ API health test
✗ Preview runtime test
✗ Payment callback test

Each test should be expandable.

---

# 19. RUNTIME PAGE

Create runtime monitoring UI.

Show:

Application Status
Degraded

Services:

API
Healthy

Database
Healthy

Preview
Failed

Worker
Healthy

Show:

CPU
Memory
Requests
Errors

Use Recharts for small charts.

---

# 20. SCAN PROGRESS PAGE

When user clicks "Run New Scan", show a detailed live scan experience.

Title:

"Diagnosing repository..."

Progress:

82%

Stages:

✓ Repository mapped
✓ Dependencies analyzed
✓ Security scan
✓ Build analysis
✓ Tests executed
● Architecture analysis
○ Root cause analysis
○ Final diagnosis

Show live activity log:

10:41:02
Repository indexed

10:41:18
184 dependencies detected

10:41:42
Security analysis completed

10:42:01
3 critical findings detected

10:42:13
Analyzing architecture...

Do NOT make this a fake chatbot conversation.

It should feel like an engineering diagnostic pipeline.

---

# 21. FIX WORKSPACE

Create a dedicated repair interface.

Header:

Fix Workspace

Issue:

"Preview system fails without WebContainer"

LEFT:

Original

src/runtime/container.ts

RIGHT:

Proposed Fix

src/runtime/preview-runtime.ts

Show side-by-side code diff.

Use realistic diff styling.

Below:

FIX STRATEGY

"Decouple preview lifecycle from WebContainer."

Then verification:

Build
✓ Passed

Tests
✓ 196 passed

Preview
✓ Passed

Security
✓ No new issues

Buttons:

Apply Fix

Create Pull Request

Reject

---

# 22. PULL REQUEST SCREEN

Create a PR preparation screen.

Title:

"Create Pull Request"

Branch:

repo-doctor/fix-preview-runtime

Title input:

"Fix preview runtime dependency"

Description:

Automatically generated summary.

Sections:

Problem
Root cause
Changes
Tests
Risk

Button:

Create Pull Request

---

# 23. DOCTOR CHAT

Chat exists, but it is NOT the primary application.

Create a collapsible right-side "Ask Doctor" panel.

Header:

🩺 Ask Repo Doctor

Example quick questions:

"Why is this critical?"

"What happens if I ignore it?"

"Explain this architecture."

"Can you fix this safely?"

Input:

"Ask about this repository..."

The chat should be contextual to the current page.

For example, on a finding page:

"What does this finding mean?"

On architecture page:

"Why is this dependency dangerous?"

---

# 24. SEARCH

Create global repository search.

Search files, symbols, findings, dependencies.

Search placeholder:

"Search repository..."

Results:

Files
Symbols
Findings
Dependencies
Commits

Keyboard shortcut:

⌘ K

or

Ctrl K

---

# 25. SCAN HISTORY

Create a scan history page.

Example:

Scan #184
Today
64/100

Scan #183
Yesterday
61/100

Scan #182
Sep 8
58/100

Show health trend chart.

Allow clicking each scan.

---

# 26. SETTINGS

Create settings UI.

Sections:

Repository

Analysis

Security

AI Models

Notifications

GitHub

Team

Billing

For AI Models, use mock provider configuration:

Primary Model
GPT-5 Mini

Reasoning Model
Gemini 2.5 Flash

Chief Doctor
Claude Sonnet

Do not implement real API keys.

Use placeholder inputs.

---

# 27. NOTIFICATION SYSTEM

Create toast notifications.

Examples:

"Scan completed"

"3 critical findings detected"

"Fix verified successfully"

"Pull request created"

"Build failed"

---

# 28. MODALS

Create reusable modals for:

* Start scan
* Generate fix
* Confirm apply fix
* Create PR
* Ignore finding
* Delete scan
* Connect repository

---

# 29. MOCK DATA

Create centralized mock data.

Do NOT scatter fake data throughout components.

Example:

/src/data/mockRepository.ts

Include:

repository
health
findings
security
dependencies
build
tests
runtime
architecture
scanHistory

Make the UI behave as though it is connected to a real backend.

---

# 30. COMPONENT ARCHITECTURE

Create reusable components.

Suggested structure:

src/
components/
layout/
AppShell
Sidebar
Header
MobileNav

```
dashboard/
  HealthScore
  HealthCard
  TopProblems
  FindingCard
  HealthTrend

findings/
  FindingsTable
  FindingSeverity
  FindingDetail
  EvidencePanel
  CodeViewer
  RootCauseGraph

architecture/
  ArchitectureGraph
  ArchitectureNode
  ArchitectureIssue

security/
  SecurityOverview
  SecurityFindingTable

dependencies/
  DependencyTable
  DependencyGraph

build/
  BuildStatus
  TerminalOutput

tests/
  TestOverview
  TestResult

runtime/
  RuntimeStatus
  RuntimeChart

scan/
  ScanProgress
  ScanActivity

repair/
  DiffViewer
  FixWorkspace
  VerificationPanel

chat/
  DoctorChat

common/
  StatusBadge
  SeverityBadge
  EmptyState
  LoadingState
  ErrorState
  SearchCommand
```

---

# 31. ROUTES

Create routes:

/

/dashboard

/findings

/findings/:id

/security

/architecture

/dependencies

/build

/tests

/runtime

/scan

/history

/fix/:id

/settings

---

# 32. INTERACTION REQUIREMENTS

The UI must NOT be static.

Implement mock interactions.

Examples:

Click:

"Run New Scan"

→ Scan progress page

→ simulated progress

→ Dashboard

Click finding:

→ Finding detail

Click:

"Generate Fix"

→ Fix Workspace

Click:

"Apply Fix"

→ verification state

→ success state

Click:

"Create Pull Request"

→ PR modal

→ success toast

Click sidebar:

→ route changes

Filters must work.

Search must work.

Tabs must work.

Dropdowns must work.

Modals must work.

Mobile sidebar must work.

---

# 33. LOADING STATES

Every major page should have a polished loading state.

Use skeleton loaders.

Do not use blank screens.

---

# 34. ERROR STATES

Create useful error states.

Example:

"Repository analysis failed."

Reason:

"Build environment could not be initialized."

Buttons:

Retry
View Logs

---

# 35. EMPTY STATES

Example:

"No security issues detected."

Icon:

Shield check

Text:

"Your repository currently has no detected security findings."

---

# 36. ACCESSIBILITY

Implement:

* keyboard navigation
* visible focus states
* semantic buttons
* proper labels
* sufficient contrast
* screen-reader-friendly labels

Do not rely only on color.

---

# 37. VISUAL DETAILS

Use:

* monospace font for code and technical identifiers
* normal UI font for general text
* subtle borders
* compact spacing
* consistent icon sizes
* consistent severity badges
* consistent status indicators

Severity:

CRITICAL
HIGH
MEDIUM
LOW
INFO

Statuses:

OPEN
INVESTIGATING
FIXED
VERIFIED
IGNORED

---

# 38. IMPORTANT UX PRINCIPLE

Every diagnosis must answer:

1. What is wrong?
2. How serious is it?
3. Why is it happening?
4. Where is the evidence?
5. What is the impact?
6. How can it be fixed?
7. Was the fix verified?

Design the interface around this exact sequence.

---

# 39. DO NOT BUILD

Do NOT implement:

* real GitHub OAuth
* real GitHub API
* real LLM calls
* real API key storage
* real sandbox execution
* real Docker execution
* real repository cloning
* real vulnerability scanning
* real database
* real PR creation

Use mocks.

Architecture should make future backend integration easy.

---

# 40. QUALITY BAR

The final UI should look like a product that could realistically be launched as a developer SaaS.

It should NOT look like:

* a template
* a student project
* a generic AI dashboard
* a ChatGPT clone

It should look like:

"An experienced engineering team built an AI-powered repository diagnostics platform."

Pay particular attention to:

* spacing
* typography
* information hierarchy
* code viewer
* finding detail
* health score
* architecture graph
* scan progress
* repair workflow

These are the core product surfaces.

---

# 41. FINAL DEMO FLOW

After implementation, make sure this complete demo works:

1. Open Repo Doctor
2. Landing/empty state appears
3. Enter mock GitHub URL
4. Click "Start Diagnosis"
5. Scan progress animation starts
6. Scan completes
7. Dashboard appears
8. Health score = 64/100
9. Top critical finding visible
10. Click finding
11. Finding detail opens
12. Root cause graph visible
13. Evidence code visible
14. Click "Generate Fix"
15. Fix Workspace opens
16. Diff visible
17. Click "Apply Fix"
18. Verification runs
19. Build ✓
20. Tests ✓
21. Preview ✓
22. Click "Create Pull Request"
23. PR modal appears
24. Mock PR created
25. Success notification appears

Everything should feel connected.

---

# 42. FINAL INSTRUCTION

Before finishing:

* Inspect the existing project.
* Reuse existing dependencies where reasonable.
* Do not destroy working project configuration.
* Build the UI incrementally.
* Keep components reusable.
* Keep mock data centralized.
* Ensure all routes work.
* Ensure there are no broken buttons.
* Ensure there are no console errors.
* Ensure responsive behavior works.
* Ensure the final visual result is polished.

Do not stop after creating a dashboard mockup.

Build the complete interactive frontend prototype described above.
