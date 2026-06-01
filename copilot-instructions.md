# GitHub Copilot Instructions - Colour and Effects Catalogue

Welcome to the **Colour and Effects Catalogue & Workbench Dashboard**. This is a highly custom, optimized Single Page Application (SPA) designed for miniature painters, hobbyists, and makers to manage paint inventories, document technical bench tests for fillers (Putty), and track diorama/electronics project logs.

## 1. Tech Stack & Architecture

This is a clean, dependency-free frontend-only architecture. Do NOT generate backend, node modules, or modern framework boilerplate.

- **Frontend Core:** Standard HTML5, Semantic Elements, and CSS3.
- **Interactivity:** Vanilla JavaScript (ES6+), standard DOM manipulation, and dynamic component rendering via client-side scripts.
- **Styles:** Custom Dark/Medieval Theme (`style.css`), relying heavily on Flexbox, CSS Grid, and custom `@media (max-width: 768px)` blocks for strict mobile responsiveness.
- **Data Layer:** Static local `.json` files representing data models for:
  - `colours`: Paint inventory metadata (Manufacturer, Code, Base Colour).
  - `effects`: Textures and technical washes.
  - `putty`: Mechanical and chemical behavior observed in bench tests.
  - `projects`: Build logs, including multi-column material dependencies and image carousels.

---

## 2. Project Structure

Ensure all file paths and modifications adhere strictly to this lean layout:
- `/` (Root)
  - `index.html` : The core application layout containing search controls, tab navigation, and results grid container.
  - `style.css` : Pure CSS stylesheets managing the dark UI, hover effects, medieval accents, and mobile-first overrides.
  - `app.js` : Main application engine handling state, dynamic query filtering, tab-switching synchronization via hash URLs (`syncTabWithHash`), and view rendering.
  - `projects.json`, `colours.json`, `effects.json`, `putty.json` : Pure JSON data stores.

---

## 3. Strict Coding Guidelines & Patterns

When modifying or refactoring code in this repository, follow these rules blindly:

### JavaScript (`app.js`)
- **No Frameworks:** Never suggest React, Vue, Svelte, or Astro. Use pure Vanilla JS.
- **Programming Style:** Defensive programming (inspired by .NET/C#). Always validate object existence, check for nulls/undefined, and safely parse string criteria using safely scoped variables (`?.toString().toLowerCase().includes()`).
- **State Management:** Tabs and searches must read directly from the global active context variables (`currentTab`, `currentFilteredResults`).
- **Object Validation:** To check if a dynamic object or dependency mapping is empty, use `Object.keys(obj).length === 0`. Do not use direct equivalence checks like `obj === {}`.
- **Search & Filters Sync (`performSearch`):** - When switching tabs or executing cross-tab validation, ensure filters or checkboxes belonging to a previous tab are safely handled.
  - If `currentTab === 'projects'`, defensively ensure search dropdown fields (`searchField`) or checkboxes that don't exist in the project schema do not break the iterator loop (`continue` or ignore safely).

### CSS & Layout (`style.css`)
- **Theme Integrity:** Maintain the customized dark palette (deep slate backgrounds, amber/gold accents `#ffc107` for critical highlights, and clean borders `#3f4052`).
- **Component Rules:**
  - **Tables to Cards Transformation:** For tabular technical logs (like the Putty matrix) under mobile displays (`@media (max-width: 768px)`), convert standard table rows (`<tr>` and `<td>`) into standalone vertical cards (`display: block !important`). The first columns (e.g., photos or names) must act as card headers, and pseudo-elements (`::before`) must inject dynamic text labels (e.g., `Type:`, `Drying Time:`).
  - **Ultra-Compact Tabs Menu:** The navigation tab control bar (`.tabs`) must never wrap text into multiple rows or force a clunky hamburger/sandwich menu. Divide the width symmetrically using flex auto layouts (`flex: 1 1 0% !important`) with tiny padding limits to cleanly fit all tabs (Colours, Effects, Putty, Projects) side-by-side on displays down to 360px wide.

---

## 4. Workarounds and Technical Debt Notes
- **No Build Tools:** There are no compilers, bundlers (Webpack/Vite), or linters configured. Do not run `npm run` or install external packages unless explicitly requested.
- **Image Overflows:** Images embedded in dynamic project lists or tables must be explicitly bounded to the viewport width using safety rules (`width: 100% !important; height: auto !important`) inside the `.placeholder-image` and `.table-img` structural wrappers.
- **Local Git Scope:** When executing commits, always verify your directory scope. Project configurations should be localized to avoid cross-account credential issues (`git config --local user.name` and `user.email`).

---

## 5. Typical Workflows for the Agent

1. **Adding a Paint or Material Detail:** Update the corresponding JSON file, then check `app.js` to ensure the property mapping exists inside `getMaterialDetails` or the dynamic string template builders.
2. **Refactoring Layouts:** Ensure any element added inside `createProjectCard` or `performSearch` has a matching mobile override block at the very bottom of `style.css`.
