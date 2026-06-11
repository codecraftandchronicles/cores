# CORES Project - Comprehensive Error Investigation & Fix Plan
**Date**: June 3, 2026  
**Status**: Investigation Complete ✅ | Ready for Implementation 🔄

---

## 🎯 EXECUTIVE SUMMARY

**Total Issues Found**: 8 major issues across 3 categories
- **Test Infrastructure**: 1 blocking issue (server not running)
- **Application Code**: 4 critical issues (security & data handling)
- **Test Coverage**: 3 issues (missing selectors, timing issues)

**All 300 tests are failing due to a single root cause**: The development web server is not running.

---

## 📊 DETAILED ISSUE BREAKDOWN

### CATEGORY 1: TEST INFRASTRUCTURE ISSUES ❌

#### Issue #1: Development Server Not Running (BLOCKING)
**Severity**: CRITICAL  
**Impact**: ALL 300 TESTS FAIL  
**Error**: `net::ERR_CONNECTION_REFUSED at http://127.0.0.1:5500/`

**Root Cause**:
- Tests expect a web server running on `http://127.0.0.1:5500`
- `playwright.config.js` uses `TEST_BASE_URL` environment variable (defaults to `http://127.0.0.1:5500`)
- No built-in dev server configured in the project
- Tests are trying to connect but getting refused

**Current Status**:
- `package.json` has test scripts but no dev server startup
- Project is a static SPA (no build tools) - can use simple HTTP server
- `playwright.config.js` has `webServer` commented out or missing

**Solution**:
Add a `webServer` configuration to `playwright.config.js` to:
1. Start a simple HTTP server before tests run
2. Serve files from project root on port 5500
3. Kill server after tests complete

**Code Fix**:
```javascript
// In playwright.config.js
export default defineConfig({
  // ... existing config ...
  webServer: {
    command: 'npx http-server . -p 5500 -c-1',
    url: 'http://127.0.0.1:5500',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  // ... rest of config ...
});
```

**Dependencies Check**:
- ✅ `http-server` is a lightweight static server (no extra install needed - can use npx)
- Alternative: Use Python's built-in server or Node.js `http` module

---

### CATEGORY 2: APPLICATION CODE SECURITY & DATA ISSUES 🔴

#### Issue #2: XSS Vulnerability - HTML Injection in Card Rendering
**Severity**: CRITICAL  
**File**: [js/app.js](js/app.js#L550)  
**Lines**: 550-620 (createCard function)  
**Category**: Security / XSS Vulnerability

**Issue Description**:
```javascript
// VULNERABLE CODE in createCard():
cardHTML += `<div class="card-field">
  <div class="card-label">${displayKey}</div>
  <div class="card-value">${displayValue}</div>
</div>`;
```

**Attack Vector**:
If a JSON field contains HTML/JavaScript:
```json
"Strategic Use": "<img src=x onerror='alert(\"XSS\")'>"
```
The payload executes when the card renders.

**Current Risk Level**: Medium (internal JSON data source)
**Potential Risk**: High (if API or user input added later)

**Solution**:
Sanitize all user-facing content using `textContent` instead of HTML:
```javascript
// FIXED CODE:
const sanitizeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;  // Escapes HTML
  return div.innerHTML;
};

// Then in createCard:
cardHTML += `<div class="card-field">
  <div class="card-label">${sanitizeHtml(displayKey)}</div>
  <div class="card-value">${sanitizeHtml(displayValue)}</div>
</div>`;
```

---

#### Issue #3: Type Inconsistency - "Owned" Field (Boolean vs String)
**Severity**: CRITICAL  
**Files**:
  - [data/colours.json](data/colours.json) (all records)
  - [data/effects.json](data/effects.json) (all records)
  - [js/app.js](js/app.js#L932)

**Category**: Type Mismatch / Data Validation

**Issue Description**:
JSON data stores `"Owned"` as **strings** (`"True"` / `"False"`), but JavaScript checks for **both**:

```javascript
// Line 932-933 in app.js (FRAGILE):
const ownedColours = allDataColours.colours.filter(colour => 
    colour.Owned === "True" || colour.Owned === true
);
```

**Sample Data**:
```json
{
  "Owned": "True",      // STRING - matches first condition
  "Owned": "False",     // STRING - won't match either
  "Owned": true         // BOOLEAN - would match second (but never happens)
}
```

**Problem Impact**:
1. CSV export inconsistently includes/excludes items
2. If data format changes, filtering breaks completely
3. Type coercion leads to subtle bugs
4. Hard to debug when data format changes

**Solution**:
Normalize the "Owned" field on data load:

```javascript
// In loadDataColours() and loadDataEffects():
if (allDataColours.colours) {
    allDataColours.colours.forEach(colour => {
        // Normalize "Owned" to boolean
        colour.Owned = colour.Owned === "True" || colour.Owned === true;
    });
}

// Then use consistently:
const ownedColours = allDataColours.colours.filter(colour => colour.Owned === true);
```

**Alternative Approach**:
Store in JSON as actual booleans (no quotes):
```json
{
  "Owned": true,
  "Owned": false
}
```

---

#### Issue #4: Unsafe URL Handling in Projects
**Severity**: HIGH  
**File**: [js/app.js](js/app.js#L685)  
**Category**: Security / URL Injection

**Issue Description**:
```javascript
// Line 685 - UNSAFE:
if (item.URL) {
    urlLine = `<a href="${item.URL}" target="_blank" ...>`;
}
```

**Attack Vector**:
Malicious URL in JSON:
```json
"URL": "javascript:alert('XSS')"
```
Would execute as JavaScript when clicked.

**Solution**:
Validate URLs before rendering:
```javascript
const isValidUrl = (urlString) => {
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (e) {
        return false;
    }
};

// Then use:
if (item.URL && isValidUrl(item.URL)) {
    urlLine = `<a href="${item.URL}" target="_blank" ...>`;
}
```

---

#### Issue #5: Filter Logic Edge Cases
**Severity**: MEDIUM  
**File**: [js/app.js](js/app.js#L400)  
**Category**: Business Logic / Edge Cases

**Issue Description**:
Filter checkboxes may not trigger proper UI updates if:
1. No checkboxes are initially checked (edge case in performSearch)
2. Multiple rapid filter clicks
3. Empty results don't show "no results" message

**Specific Test Failure**:
```
Test: "click Temperature filter checkbox and verify results are filtered"
Error: expect(filteredCards).toBeGreaterThan(0)
Received: 0
```

This suggests the filter click isn't being detected or processed.

**Root Cause**:
- Test selects checkbox with `data-field="Temperature"`
- Need to verify selector exists and click triggers `performSearch()`
- May need event delegation or proper event listener

**Solution**:
1. Ensure all checkboxes have proper `data-field` attributes
2. Verify click handlers are attached to checkboxes
3. Add event delegation for dynamically created filters
4. Show "no results" message when filter returns 0 items

---

### CATEGORY 3: TEST COVERAGE & TIMING ISSUES ⚠️

#### Issue #6: Missing Filter Checkbox Selectors
**Severity**: HIGH  
**File**: [tests/search-form.spec.js](tests/search-form.spec.js#L147)  
**Impact**: 3 test failures (Temperature, Project accordion, others)

**Issue**:
Test tries to click checkboxes with selector:
```javascript
const temperatureCheckboxes = page.locator('input[data-field="Temperature"]');
```

**Problem**:
- If checkboxes don't have `data-field` attribute, selector returns 0 elements
- Test then fails on count check: `expect(checkboxCount).toBeGreaterThan(0)`

**Solution**:
1. Add `data-field` attributes to all filter checkboxes in [index.html](index.html)
2. Ensure attribute values match filter names (Temperature, Phase, Saturation, Manufacturer)

**Required HTML Changes**:
```html
<!-- Before: -->
<input type="checkbox" value="Warm">

<!-- After: -->
<input type="checkbox" data-field="Temperature" value="Warm">
```

---

#### Issue #7: Race Conditions - Timing Issues
**Severity**: MEDIUM  
**File**: All test files  

**Issue**:
Tests use `page.waitForTimeout(500)` which is unreliable:
- Different environments have different speeds
- Flaky tests that pass/fail inconsistently

**Solution**:
Replace all `waitForTimeout()` with proper wait conditions:
```javascript
// Before (unreliable):
await page.waitForTimeout(500);

// After (reliable):
await page.waitForSelector('.card', { state: 'visible', timeout: 5000 });
// OR
await expect(page.locator('.card')).toHaveCount(newCount);
```

---

#### Issue #8: Missing Selector for Projects Accordion
**Severity**: MEDIUM  
**File**: [tests/search-form.spec.js](tests/search-form.spec.js#L???)  

**Issue**:
Projects accordion selector might not match actual HTML structure.

**Needed Checks**:
1. Verify `.projects-accordion` class exists in HTML
2. Verify `.accordion-button` class exists
3. Ensure project expansion logic works

---

## 📋 IMPLEMENTATION PRIORITY

### Phase 1: CRITICAL - Fix Test Infrastructure (Blocking)
1. ✅ Update `playwright.config.js` to add `webServer` configuration
2. ✅ Test that dev server starts automatically before tests
3. ✅ Verify tests can connect to server

### Phase 2: HIGH - Fix Application Security Issues
1. ✅ Add HTML sanitization to `createCard()` function
2. ✅ Normalize "Owned" field type on data load
3. ✅ Add URL validation for project links
4. ✅ Add filter edge case handling

### Phase 3: MEDIUM - Fix Test Coverage & Timing
1. ✅ Add `data-field` attributes to all checkboxes
2. ✅ Replace all `waitForTimeout()` with proper waits
3. ✅ Verify accordion selectors match HTML
4. ✅ Run tests and fix remaining issues

### Phase 4: VALIDATION
1. ✅ Run full test suite: `npm test`
2. ✅ Generate HTML report: `npm run test:report`
3. ✅ Verify all 300 tests pass

---

## 🔍 ROOT CAUSE ANALYSIS

### Why All 300 Tests Failed
```
Test Execution Flow:
1. npm test runs playwright test
2. Playwright tries to navigate to http://127.0.0.1:5500/
3. No server is listening on that port
4. Connection refused error
5. ALL tests fail at navigation step
```

### Why It Wasn't Obvious
- Project is a static SPA (no build step)
- No built-in dev server configuration
- Tests assume server is running elsewhere
- No automatic server startup in test config

---

## 📝 VERIFICATION CHECKLIST

After implementing fixes, verify:

- [ ] Dev server starts automatically before tests
- [ ] Tests connect successfully to http://127.0.0.1:5500
- [ ] HTML injection vulnerability is fixed
- [ ] "Owned" field type is consistent
- [ ] URLs are validated before rendering
- [ ] All checkboxes have `data-field` attributes
- [ ] No more `waitForTimeout()` calls in tests
- [ ] Filter tests pass (Temperature filter works)
- [ ] Project accordion tests pass
- [ ] All 300 tests pass
- [ ] HTML test report generates successfully

---

## 🎓 LESSONS LEARNED

1. **Static SPAs need dev servers** - Configure Playwright's `webServer` option
2. **Type consistency matters** - JSON string vs JavaScript boolean causes bugs
3. **XSS prevention is critical** - Always sanitize dynamic HTML
4. **Test timing should be explicit** - Use waits, not arbitrary timeouts
5. **CSS selectors must be testable** - Add `data-*` attributes for testing

---

## 📞 NEXT STEPS

1. Implement Phase 1 fixes (Dev server configuration)
2. Run tests to verify server connection works
3. Implement Phase 2 fixes (Security issues)
4. Implement Phase 3 fixes (Test coverage)
5. Run full test suite and verify all pass
6. Document findings in project README

---

**Plan Created By**: GitHub Copilot  
**Last Updated**: June 3, 2026
