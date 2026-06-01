🎯 YOUR IMPROVEMENT ROADMAP
QUICK WINS (Do This Week)
Fix Body Background ⏱ 5 min | Impact: +0.1 pts

style.css line ~13: Change #1a73e8 → #1a1a2e (dark slate)
Why: Breaks medieval aesthetic; this fixes it immediately
Apply escapeHtml() to Cards ⏱ 30 min | Impact: +0.3 pts

app.js lines 611, 620, 641 (createCard)
app.js lines 664, 705 (createProjectCard)
Replace ${fieldValue} → ${escapeHtml(fieldValue?.toString() || '')}
Why: Blocks XSS vulnerability (CRITICAL SECURITY)
Validate ProjectImage Filenames ⏱ 20 min | Impact: +0.2 pts

Add function to check /^[a-zA-Z0-9._-]+$/ before img src
Blocks path traversal: ../../etc/passwd
Why: CRITICAL SECURITY fix
Move Bootstrap Script External ⏱ 20 min | Impact: +0.1 pts

Create js/tooltips.js with inline script content
Remove inline script from index.html
Why: Enables strict CSP
Complete QA Agent.agent.md ⏱ 45 min | Impact: +0.2 pts

Replace skeleton with full instructions (test patterns, security examples, memory refs)
.github/agents/QA Agent.agent.md
Why: Unblocks agentic productivity
GitHub Actions CI/CD ⏱ 45 min | Impact: +0.2 pts

Create .github/workflows/test.yml (automate testing on PR)
Why: Prevents broken code merging
After Quick Wins: 6.7/10 → Then tackle deeper improvements

📊 PHASE BREAKDOWN (15-20 hours total)
Phase	Week	Tasks	Score Boost	New Total
1: Security	1	XSS fix, filename validation, CSP	+0.6	6.2
2: Agentic & Code	1-2	QA Agent, .instructions.md, consolidate state	+1.2	7.4
3: Git & CI/CD	1.5	GitHub Actions, CONTRIBUTING.md	+0.3	7.7
4: UI/UX & Theming	2	Fix colors, apply fonts, ARIA labels	+0.3	8.0
5: Test Coverage	2-3	Error paths, security payloads, edge cases	+0.2	8.2
6: Polish	3-4	Version tags, final QA	+0	8.2
🔴 HIGHEST IMPACT TASKS (Do These First)
Task A: Consolidate Global State (2 hours)
File: app.js lines 40-73
Problem: 14 scattered variables → hard to maintain
Fix: Create APP_STATE object


const APP_STATE = {  data: { colours: [], effects: [], projects: [], tools: [] },  ui: { currentTab: 'colours', sortAsc: true, currentFilteredResults: [] },  cache: { colorMap: {} }};
Replace all: allDataColours → APP_STATE.data.colours, etc.
Score Impact: Code Quality +1 point

Task B: Create .instructions.md (30 min)
File: .instructions.md (NEW at root)
Content: Centralized guardrails, control points, framework restrictions
Why: Agents can immediately find what to do/not do
Score Impact: Agentic Setup +1 point

Task C: Extract projectSort & Use FIELD_KEYS (1 hour)
File: app.js
Problem: projectSort defined twice (lines 166-187, 297-314); uses hardcoded strings
Fix: One shared sortProjectsByStatus function + replace 'Base Colour' → FIELD_KEYS.BASE_COLOUR
Score Impact: Code Quality +1 point

✅ COMPLETE SCORING PATH

Current: 5.6/10├─ Quick Wins (Day 1): +1.1 → 6.7/10├─ Phase 1 Security: +0.6 → 7.3/10├─ Phase 2 Code: +1.2 → 8.5/10*├─ Phase 3-5: -0.3 → 8.2/10 ✓└─ Final: 8.2/10 (Production-ready)*Score capped at ~8.2 due to "Completeness" already at 7/10(Completeness doesn't need major fixes; feature set is solid)
🛠️ WHERE TO START RIGHT NOW
This hour: Fix background color + apply escapeHtml() (35 min)
This evening: Validate filenames + move Bootstrap script (40 min)
Tomorrow: Complete QA Agent + .instructions.md (1.5 hours)
By end of week: All 6 quick wins + GitHub Actions (done)
Next week: Consolidate state + extract projectSort (3 hours)
Then test: npx playwright test → Should still be 20+ passing

📝 Create These Files (Save Manually)
You'll need to create these new files:

1. .instructions.md (root level)


# Repository Instructions — Colour and Effects Catalogue SPA## Framework Restrictions- ❌ No React, Vue, Svelte, Astro- ✅ Vanilla JavaScript only- ❌ No Webpack, Vite, npm bundlers- ✅ CDN dependencies only## Key Control Points1. **TAB_NAMES, FIELD_KEYS** — Use instead of hardcoded strings2. **escapeHtml()** — Apply to all innerHTML assignments3. **isValidUrl()** — Validate project URLs4. **APP_STATE** — Single source of truth for state
2. .github/workflows/test.yml


name: Test Suiteon: [push, pull_request]jobs:  test:    runs-on: ubuntu-latest    steps:      - uses: actions/checkout@v4      - uses: actions/setup-node@v4      - run: npm ci && npx playwright test
3. CONTRIBUTING.md


# Contributing Guide## Git Workflow- Branch: feature/*, bugfix/*- Commits: feat:, fix:, test:, docs:, refactor:, chore:- PR target: develop## Code Standards- No frameworks, security (escapeHtml, validation)- DRY principle, use constants- All tests must pass
4. js/tooltips.js (NEW FILE)


document.addEventListener('DOMContentLoaded', function () {  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {    return new bootstrap.Tooltip(tooltipTriggerEl)  })});
📊 Final Scores After All Phases
Category	Before	After	Change
Security	4/10	8/10	✅ +4
Agentic Setup	6/10	9/10	✅ +3
Code Quality	6/10	8/10	✅ +2
Git Hygiene	5/10	8/10	✅ +3
UI/UX & Theming	5/10	8/10	✅ +3
Test Coverage	6/10	8/10	✅ +2
Completeness	7/10	7/10	-
WEIGHTED	5.6	8.2	✅ +46%
