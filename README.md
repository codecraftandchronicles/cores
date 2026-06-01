# Colour and Effects Catalogue

A dependency-free static SPA for browsing paint catalogues, textures, bench-test data, and project build logs.

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Styling**: Bootstrap 5.3 (tooltips only), custom CSS, dark theme
- **Data**: JSON files (colours.json, effects.json, projects.json, tools.json)
- **Testing**: Playwright (Node.js + bare HTTP server on port 3000)
- **Analytics**: GoatCounter
- **Icons**: Bootstrap Icons, Font Awesome 6
- **Fonts**: Cinzel Decorative, Cormorant Garamond (Google Fonts)
- **Build**: None — no bundlers, transpilers, or framework scaffolding

## Architecture Overview

Single-page application with four main tabs (state-driven routing via `window.location.hash`):

| Tab | Content | Behaviour |
|-----|---------|-----------|
| **Colours** | Searchable colour index | Filters by temperature, phase, saturation, manufacturer |
| **Effects** | Searchable texture/effect index | Global search + field-specific filters |
| **Projects** | Accordion-style project log | Links materials to colour/effect/tool codes; images from `img/projects/` |
| **Putty** | Static utility reference | Injected HTML; no filtering |

**Core state** (`js/app.js`):
- `currentTab`: active tab key
- `currentFilteredResults`: last search results
- `colorMap`: lookup table for hex codes by colour name
- All datasets loaded in parallel on `DOMContentLoaded` via `PageLoad()`

**Data flow**: `performSearch()` → filter active dataset → `sortResults()` → `displayResults()`

## How to Run

Start a bare HTTP server (Playwright's built-in):

```bash
npx playwright test --grep "search by Base"
```

For manual browsing, open `index.html` directly in a browser (file:// protocol; some features may be restricted).

## Running Tests

**Full E2E test suite:**
```bash
npx playwright test
```

**Single test file:**
```bash
npx playwright test tests/search-form.spec.js
```

**Single test by name:**
```bash
npx playwright test --grep "search by Base Colour"
```

Tests run against `http://127.0.0.1:3000` (configured in `playwright.config.js`).

## CI/CD Pipeline

### GitHub Actions

Every push to `main` or `develop`, and every pull request, triggers the **Test Suite** workflow (`.github/workflows/test.yml`):

```yaml
Trigger: push (main, develop) + pull_request (main, develop)
Steps:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies (npm ci)
  4. Install Playwright browsers
  5. Run all tests (npx playwright test)
  6. Upload test results artifact
```

**Test results are archived** (30-day retention) and visible in PR checks.

### Workflow File

Location: `.github/workflows/test.yml`

To modify CI/CD (e.g., add new test patterns, change Node version, add linting):
1. Edit `.github/workflows/test.yml`
2. Commit and push
3. Workflow runs on next push/PR

### Passing Checks

PRs can only merge when:
- ✅ All Playwright tests pass
- ✅ No console errors
- ✅ Code review approved

To debug CI failures:
1. Review **Test Results** artifact in Actions tab
2. Run failed tests locally: `npx playwright test --grep "failed test name"`
3. Fix code and push — CI re-runs automatically

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Git workflow (branch strategy, commit conventions)
- Local testing requirements
- Code standards (security, constants, CSS)
- PR process and review checklist

Key points:
- Set local git identity before committing: `git config --local user.name "Your Name"`
- Always run `npx playwright test` before pushing
- Use constants (`FIELD_KEYS`, `TAB_NAMES`) instead of magic strings
- Apply security functions (`escapeHtml`, `isValidUrl`, `isValidImageFilename`) to all dynamic content
- Write tests for new features and bug fixes

### QA Agent (Testing)

This repo includes a custom **QA Agent** persona for writing and validating tests.

**Use the QA Agent to:**
- Write new Playwright E2E tests for feature scenarios
- Add security payload tests (XSS, URL validation, filename validation)
- Cover error paths and edge cases
- Run test suite and analyze results
- Report test coverage gaps

**The QA Agent will NOT:**
- Modify source code (js/app.js, css/style.css, index.html)
- Delete or modify failing tests
- Skip security validation

**To invoke:**
```
@QA Agent: Add error path tests for missing colour data
@QA Agent: Write security payload tests for XSS in Complementary field
```

See `.github/agents/QA Agent.agent.md` for full test patterns and examples.

### Default Dev Agent (Development)

The default agent handles feature work, refactoring, and bug fixes.

**Key control points to reference:**
- `.instructions.md` — Centralized guardrails, security requirements, code standards
- `FIELD_KEYS`, `TAB_NAMES` constants (js/app.js lines 8-37) — use instead of magic strings
- `escapeHtml()` function (js/app.js line 863) — required for all HTML rendering
- `isValidUrl()` function (js/app.js line 875) — validates http(s) only
- `isValidImageFilename()` function (js/app.js line 883) — blocks path traversal

**Framework restrictions:**
- ❌ No React, Vue, Svelte, Astro, frameworks
- ❌ No Webpack, Vite, bundlers, transpilers
- ✅ Vanilla JavaScript (ES6+) only
- ✅ CDN dependencies only

**To invoke:**
```
Consolidate global state into APP_STATE object
Extract duplicate projectSort function
Add semantic HTML/ARIA to index.html
```

See `.instructions.md` for complete code standards and conventions.

## Adding a New Data Field

1. Add property to relevant JSON file (`data/colours.json`, etc.)
2. If searchable: ensure it is **not** in `fieldsToIgnoreEN` (`js/app.js`)
3. If custom rendering: add case in `createCard()` or `createProjectCard()`
4. Add mobile override to `css/style.css` if new layout element

