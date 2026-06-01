# GitHub Copilot Instructions — Colour and Effects Catalogue

A dependency-free static SPA for miniature painters to browse paint catalogues, textures, bench-test data and project build logs.

---

## Tech Stack

- **No build tools.** No Webpack, Vite, npm scripts (except Playwright tests). Do not suggest bundlers, transpilers, or framework scaffolding.
- **No frameworks.** Vanilla JS (ES6+), HTML5, CSS3 only. Never suggest React, Vue, Svelte, or Astro.
- **CDN-only external dependencies** (loaded in `index.html`):
  - Bootstrap 5.3 JS (tooltips only — no Bootstrap layout classes)
  - Bootstrap Icons, Font Awesome 6
  - Google Fonts: Cinzel Decorative, Cormorant Garamond
  - Flag Icons
  - GoatCounter analytics

---

## File Layout

```
index.html          ← App shell; all tab buttons and search controls live here
css/style.css       ← All styling — dark theme, grid layout, mobile overrides
js/app.js           ← All application logic (state, search, rendering, events)
data/
  colours.json      ← colours[] array
  effects.json      ← effects[] array
  projects.json     ← projects[] array
  tools.json        ← tools[] array
tests/              ← Playwright specs (JS)
PlaywrightTests/    ← Playwright specs (C# / MSTest — legacy parallel suite)
img/                ← General images
img/projects/       ← Project card images (referenced from projects.json)
sql/                ← Utility SQL scripts for data extraction (not part of the app)
```

---

## Running Tests

```bash
# Run full Playwright suite
npx playwright test

# Run a single spec file
npx playwright test tests/search-form.spec.js

# Run a single test by name
npx playwright test --grep "search by Base Colour"
```

Playwright spins up a bare Node.js HTTP server on port 3000 pointing at the repo root (`playwright.config.js`). Tests use `baseURL: 'http://127.0.0.1:3000'`.

---

## Architecture: How the App Works

### Global State

```js
let currentTab = 'colours';          // active tab key
let currentFilteredResults = [];     // last search results
let sortAsc = true;                  // sort direction toggle
let colorMap = {};                   // { "BASE COLOUR NAME": "#hexcode" }
```

All four datasets are loaded in parallel on `DOMContentLoaded` via `PageLoad()`. Each loader (`loadDataColours`, `loadDataEffects`, `loadDataProjects`, `loadDataTools`) fetches its JSON, sorts it, assigns the global, then calls `buildColorMap()` / `updateSearchFields()` / `updateFilters()` / `displayResults()`.

### Tab Switching Flow

`switchTab(tab)` → sets `currentTab` → updates `window.location.hash` → for **putty** and **projects** tabs, hides search controls and calls `performSearch()` directly. For **colours** and **effects**, shows search controls and calls `displayResults()`.

Hash navigation is restored on load by `syncTabWithHash()`.

### Search & Filter Flow

`performSearch()`:
1. For the **putty** tab: injects the static `htmlPutty` HTML string and returns immediately — no data filtering.
2. For other tabs: reads `searchInput`, `searchField` dropdown, and all checked checkboxes.
3. Filters the active dataset; stores result in `currentFilteredResults`.
4. Calls `sortResults()` then `displayResults()`.

`fieldsToIgnoreEN` is the exclusion list for the search field dropdown — add field names here to hide them from search.

`configFiltros['EN']` drives the checkbox filter groups (Temperature, Phase, Saturation, Manufacturer). Only applies to the colours tab.

### Rendering

- **Colours / Effects** → `createCard(item)`: renders a `.card` div with a colour swatch, hex badge (click-to-copy), dilution rule, and all fields. The `Complementary` field gets special treatment — it looks up the hex from `colorMap` and renders an inline colour chip.
- **Projects** → `createProjectCard(item)`: renders a Bootstrap-style accordion. Active/to-do projects are expanded by default. Materials (`item.Materials.Colours`, `Effects`, `Tools`) are arrays of product codes resolved to names+hex via `getMaterialDetails(subKey, id)`. Project images come from `img/projects/<filename>`.
- **Putty** → static HTML string (`htmlPutty`) injected directly into the results container.

### Data Schemas

**colours.json**
```jsonc
{ "colours": [{ "Base Colour", "Code", "Hex", "Manufacturer", "Temperature",
                "Phase", "Saturation", "Primary Function", "Strategic Use",
                "Complementary", "Role of Complementary", "Keywords", "Owned" }] }
```

**effects.json**
```jsonc
{ "effects": [{ "Product Name", "Code", "Hex", "Manufacturer", "Function" }] }
```

**projects.json**
```jsonc
{ "projects": [{ "ProjectName", "Status", "Pct", "Description", "FinishDate",
                 "URL",   // optional
                 "Materials": { "Colours": ["AK11092"], "Effects": ["V62064"], "Tools": ["X-ACTO-01"] },
                 "ProjectImage": ["filename.png"]  // array
               }] }
```
Valid `Status` values (affect default sort order): `"To Do"`, `"In Progress"`, `"On The Bench"`, `"Done"`, `"Completed"`, `"Parking Lot"`.

**tools.json**
```jsonc
{ "tools": [{ "ID", "Name" }] }
```
Tool `ID` must match the strings used in `projects.json` `Materials.Tools` arrays.

---

## Key Conventions

### Adding a New Data Field
1. Add the property to the relevant JSON file.
2. If it should be searchable, ensure it's **not** in `fieldsToIgnoreEN` (in `app.js`).
3. If it needs special rendering (like `Complementary`), add a case inside `createCard()` or `createProjectCard()`.
4. Add a matching mobile override at the bottom of `css/style.css` if the field adds a new layout element.

### Adding a New Tab
- Add the button in `index.html` with `data-tab="<key>"`.
- Handle the new key in `switchTab()`, `updateSearchFields()`, `performSearch()`, and `displayResults()`.
- Putty is the reference pattern for a "static content" tab; colours is the reference for a "searchable data" tab.

### CSS Conventions
- Dark palette: deep slate backgrounds, amber/gold `#ffc107` for highlights, borders `#3f4052`.
- Single mobile breakpoint: `@media (max-width: 768px)`.
- Putty table → card transformation on mobile uses `display: block !important` on `tr`/`td` with `::before` pseudo-elements for labels.
- Tabs bar: `flex: 1 1 0% !important` on each `.tab-btn` so all four tabs fit side-by-side on 360px screens.

### Defensive Coding Pattern
Access dynamic fields with optional chaining:
```js
fieldValue?.toString().toLowerCase().includes(searchTerm)
```
Check empty objects with `Object.keys(obj).length === 0`, never `obj === {}`.

### Git Config
This repo uses local git identity. When committing, ensure:
```bash
git config --local user.name "Your Name"
git config --local user.email "you@example.com"
```

---

## QA Agent

`.github/agents/QA Agent.agent.md` defines a Playwright QA persona. All test files go in `./tests/`. The agent must not modify source code or delete failing tests.
