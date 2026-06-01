# Contributing to Colour and Effects Catalogue

Thank you for your interest in contributing! This document outlines the workflow, conventions, and guidelines for contributing to this project.

---

## Git Workflow

### Local Git Configuration

Before committing, set your local git identity:

```bash
git config --local user.name "Your Name"
git config --local user.email "you@example.com"
```

This ensures commits are attributed to you locally without affecting global settings.

### Branch Strategy (GitHub Flow)

- **`main`** — Production-ready code. All PRs merge here. Deployed directly.
- **Feature/fix branches** — Create from `main` with descriptive names: `feature/add-xray-view`, `fix/search-performance`, `chore/update-dependencies`
- **All changes via PR** — No direct commits to `main`. CI/CD tests all PRs automatically.

### Making Your First Contribution

1. Create and switch to feature branch from main
2. Make changes, write/update tests
3. **Run tests locally:** `npx playwright test` (must pass)
4. Commit with conventional format: `git commit -m "feat: add XRay view"`
5. Push: `git push origin feature/your-feature-name`
6. **Open PR on GitHub** — GitHub Actions runs tests automatically
7. If tests ✅ pass and reviewed ✅ approved → Merge
8. Delete feature branch after merge

**⚠️ Important:** Tests must pass before merge. GitHub will block the merge if CI fails.

### Creating a Feature Branch

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### Commit Message Format

Write clear, atomic commits:

```
[type] Short description (50 chars max)

Optional detailed explanation. Keep lines under 72 chars.
Wrap your commits with a blank line at the end.

- Bullet points OK for multiple changes
- Use imperative mood: "add feature" not "added feature"
- Fix #123 (if closing an issue)
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `chore:` — Dependencies, config, tooling
- `docs:` — Documentation
- `test:` — Test additions or fixes
- `refactor:` — Code cleanup without behavior change
- `security:` — Security fixes

**Example:**
```
feat: Add XRay imaging visualization to projects tab

- Load XRay images from ProjectImage URLs
- Add zoom/pan controls using keyboard shortcuts
- Validate image filenames to prevent path traversal
- Add accessibility labels for screen readers

Fixes #45
```

---

## Testing

### Before Pushing

**Always run tests locally before pushing:**

```bash
npx playwright test
```

Ensure all tests pass. If tests fail, fix the code and re-run:

```bash
# Run a single test file
npx playwright test tests/search-form.spec.js

# Run tests matching a pattern
npx playwright test --grep "search"

# Run with UI mode (see test steps)
npx playwright test --ui
```

### Test Coverage

When adding features or fixing bugs, write or update tests:
- **Happy path** — Normal usage scenarios
- **Error paths** — Invalid input, missing data, network errors
- **Edge cases** — Empty arrays, special characters, rapid state changes
- **Security** — XSS payloads, malicious URLs, path traversal attempts

See [QA Agent.agent.md](./.github/agents/QA%20Agent.agent.md) for test patterns and examples.

---

## Code Standards

### Framework Restrictions

This is a **vanilla JavaScript ES6+ SPA** with **no build tools**. Follow these strictly:

- ❌ **Forbidden:** React, Vue, Svelte, Webpack, Vite, Babel, TypeScript
- ✅ **Required:** Vanilla JS (ES6+), HTML5, CSS3, CDN dependencies only

### Security Functions

Always apply these when rendering dynamic content:

1. **`escapeHtml(text)`** — Sanitize HTML before rendering (prevents XSS)
   ```js
   const safeName = escapeHtml(item['Base Colour']);
   ```

2. **`isValidUrl(url)`** — Validate URLs before creating links (blocks malicious URLs)
   ```js
   if (isValidUrl(item[FIELD_KEYS.URL])) {
     // Safe to use in href
   }
   ```

3. **`isValidImageFilename(filename)`** — Validate image filenames (prevents path traversal)
   ```js
   if (isValidImageFilename(imageName)) {
     // Safe to use in img src
   }
   ```

### Constants Over Magic Strings

Use predefined constants instead of hardcoded strings:

- **Tab names:** `TAB_NAMES.COLOURS`, `TAB_NAMES.EFFECTS`, `TAB_NAMES.PUTTY`, `TAB_NAMES.PROJECTS`
- **Field names:** `FIELD_KEYS.BASE_COLOUR`, `FIELD_KEYS.HEX`, `FIELD_KEYS.STATUS`, etc.

❌ **Bad:**
```js
if (tab === 'colours') { ... }
const hex = item['Hex'];
```

✅ **Good:**
```js
if (tab === TAB_NAMES.COLOURS) { ... }
const hex = item[FIELD_KEYS.HEX];
```

### CSS Conventions

- **Dark palette:** `#1a1a2e` (base), `#252632` (sections), `#2c2c3d` (accents)
- **Gold accents:** `#d4af37` (primary), `#ffc107` (secondary)
- **Responsive breakpoint:** Single `@media (max-width: 768px)` for mobile
- **Fonts:** Cinzel Decorative (headers), Cormorant Garamond (body)

---

## Pull Request Process

### Before Creating a PR

1. **Update from main:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```

2. **Run all tests:**
   ```bash
   npx playwright test
   ```

3. **Self-review:** Check your own code before asking others to review.

### Creating a PR

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open PR on GitHub** with a clear title and description:
   - **Title:** `feat:` or `fix:` followed by short description (matches commit convention)
   - **Description:** Explain *what* changed and *why*
   - **Link related issues:** "Closes #123"
   - **GitHub will block merge if tests fail** ❌

3. **Example PR Description:**
   ```markdown
   ## Description
   Add XRay imaging visualization to projects accordion.
   
   ## Changes
   - Load images from ProjectImage URLs with validation
   - Add zoom/pan controls via keyboard shortcuts
   - Validate filenames to prevent path traversal attacks
   - Add ARIA labels for screen readers
   
   ## Testing
   - [x] All 25 tests pass locally
   - [x] Manual testing on Projects tab with XRay images
   - [x] Tested with malicious filenames (blocked correctly)
   
   ## Checklist
   - [x] Tests pass locally
   - [x] No console errors or warnings
   - [x] Code follows vanilla JS conventions (no frameworks)
   - [x] Security functions applied to dynamic content
   ```

### PR Checks

GitHub Actions will automatically:
- Run all Playwright tests
- Upload test results as an artifact

If CI fails:
1. Review the test output
2. Fix the code locally
3. Commit and push — CI runs again automatically

### Review & Merge

Once approved and tests pass:
- Squash-merge for clean history, or
- Regular merge if you prefer commit history

---

## Common Tasks

### Adding a New Data Field

1. Add to the relevant JSON file (e.g., `data/colours.json`)
2. If searchable: Remove from `fieldsToIgnoreEN` in `js/app.js`
3. If special rendering: Add case in `createCard()` or `createProjectCard()`
4. Add mobile CSS override if needed
5. Write tests to verify rendering and search

### Adding a New Tab

1. Add button in `index.html` with `data-tab="<key>"`
2. Handle in `switchTab()`, `updateSearchFields()`, `performSearch()`, `displayResults()`
3. Add CSS styling (dark theme, responsive)
4. Write tests for tab switching and content display

### Debugging Locally

**Browser DevTools:**
```bash
# Run tests in headed mode to see the browser
npx playwright test --headed

# Run with UI mode for step-through debugging
npx playwright test --ui
```

**Check for errors:**
```bash
# Look at console messages in tests
npx playwright test --reporter=verbose
```

---

## Code Review Checklist

When reviewing PRs, verify:

- ✅ Tests pass (no failures, no timeouts)
- ✅ Security functions applied (escapeHtml, isValidUrl, isValidImageFilename)
- ✅ No framework code (React, Vue, TypeScript, bundlers)
- ✅ Constants used instead of magic strings
- ✅ CSS follows dark theme conventions
- ✅ Mobile styles included if layout changed
- ✅ Commits are atomic and clear
- ✅ No console errors or warnings

---

## Questions or Issues?

- Check existing issues and PRs first
- Review test patterns in [tests/search-form.spec.js](tests/search-form.spec.js)
- See [.instructions.md](./.instructions.md) for framework restrictions and control points
- Check [QA Agent.agent.md](./.github/agents/QA%20Agent.agent.md) for testing guidance

---

**Thank you for contributing!** 🎨