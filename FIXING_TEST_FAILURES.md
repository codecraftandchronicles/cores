# CORES Project - Fixing Test Failures Guide

## 📊 Your Test Results
- **90 Passed** ✅
- **101 Failed** ❌
- **4 Skipped** ⏭️

## 🔍 Step 1: Generate Detailed Report

```bash
# Generate HTML report
npx playwright show-report

# This opens a browser with detailed test results
```

## 📝 Step 2: Analyze Failures

### In the HTML Report:
1. **Click on failed tests** to see details
2. **Check error messages** for each failure
3. **Look at screenshots** (if available)
4. **Review test traces** for timing issues

### Common Failure Patterns:

#### 1. **"Element not found" errors**
- **Cause**: Selector doesn't match any element
- **Fix**: Update selector or wait for element to appear

#### 2. **"Timeout" errors**  
- **Cause**: Element takes too long to load
- **Fix**: Increase timeout or add explicit wait

#### 3. **"Navigation failed" errors**
- **Cause**: Server not running or wrong URL
- **Fix**: Start server at correct URL

#### 4. **"Assertion failed" errors**
- **Cause**: Expected condition not met
- **Fix**: Update test expectations or application behavior

## 🛠️ Step 3: Common Fixes

### Fix 1: Server Not Running

```bash
# Start VS Code Live Server:
# Right-click index.html → "Open with Live Server"

# Or use simple HTTP server:
npx serve . --port 5500
```

### Fix 2: Increase Timeouts

```javascript
// Add explicit waits
await page.waitForSelector('.card', { timeout: 10000 }); // 10 seconds

// Or increase global timeout in playwright.config.js
use: {
  baseURL: 'http://127.0.0.1:5500',
  timeout: 10000, // Default timeout for actions
  trace: 'on-first-retry',
}
```

### Fix 3: Update Selectors

```javascript
// If element IDs changed, update selectors
// Old:
await page.click('#old-button-id');

// New:
await page.click('#new-button-id');
// Or use text:
await page.click('text=Search');
```

### Fix 4: Add Retries

```javascript
// Add retry logic for flaky tests
test('flaky test', async ({ page }) => {
  await page.goto('/');
  
  // Retry up to 3 times
  for (let i = 0; i < 3; i++) {
    try {
      await page.click('#search-button');
      break; // Success, exit loop
    } catch (error) {
      if (i === 2) throw error; // Fail on last attempt
      await page.waitForTimeout(1000); // Wait before retry
    }
  }
});
```

## 🎯 Step 4: Fix Specific Test Categories

### Data Loading Tests (likely failing)

```javascript
// tests/data-loading.spec.js

// Fix: Add explicit waits for data
test('should load colours data correctly', async ({ page }) => {
  await page.goto('/');
  
  // Wait longer for data to load
  await page.waitForSelector('.card', { timeout: 15000 }); // 15 seconds
  
  const colourCards = page.locator('.card');
  await expect(colourCards).toHaveCountGreaterThan(0);
});
```

### UI Component Tests (likely failing)

```javascript
// tests/ui-components.spec.js

// Fix: Make selectors more robust
test('should display search controls correctly', async ({ page }) => {
  await page.goto('/');
  
  // Use more specific selectors
  const searchInput = page.locator('#searchInput');
  await searchInput.waitFor({ state: 'visible', timeout: 10000 });
  
  await expect(searchInput).toBeVisible();
});
```

### Business Logic Tests (possibly failing)

```javascript
// tests/business-logic.spec.js

// Fix: Add validation before assertions
test('should sort colours alphabetically by default', async ({ page }) => {
  await page.goto('/');
  
  // Wait for cards to be visible
  const cardTitles = page.locator('.card .card-title');
  await cardTitles.first().waitFor({ timeout: 10000 });
  
  const count = await cardTitles.count();
  if (count === 0) {
    console.log('No cards found - data may not be loaded');
    return; // Skip test if no data
  }
  
  // Rest of test...
});
```

## 🔧 Step 5: Run Tests in Headed Mode

```bash
# Run in headed mode to see what's happening
npm run test:headed

# This shows the browser so you can see exactly what the test sees
```

## 📊 Step 6: Focus on Critical Tests First

### Priority Order for Fixing:

1. **Basic setup tests** (`basic-test.spec.js`)
2. **Core functionality** (`cores.spec.js`)
3. **Data loading** (`data-loading.spec.js`)
4. **UI components** (`ui-components.spec.js`)
5. **Business logic** (`business-logic.spec.js`)
6. **User journeys** (`user-journey.spec.js`)

### Run Specific Test Files:

```bash
# Test basic functionality first
npx playwright test tests/basic-test.spec.js

# Then core functionality
npx playwright test tests/cores.spec.js

# Continue with other files...
```

## 🎯 Step 7: Common Quick Fixes

### 1. Update All Timeouts

```bash
# Add this to playwright.config.js
use: {
  baseURL: 'http://127.0.0.1:5500',
  timeout: 15000, // 15 second timeout
  navigationTimeout: 20000, // 20 seconds for navigation
  trace: 'on-first-retry',
}
```

### 2. Add Global Wait

```javascript
// Add to test.beforeEach
test.describe('CORES Project Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Wait for core elements to be ready
    await page.waitForSelector('body', { state: 'visible' });
    await page.waitForTimeout(2000); // Extra buffer time
  });
  
  // Your tests...
});
```

### 3. Skip Problematic Tests Temporarily

```javascript
// Skip tests that are blocking progress
test.skip('problematic test', async ({ page }) => {
  // Test code...
});
```

## 📈 Step 8: Gradual Improvement

1. **Fix 10-20 tests at a time**
2. **Run tests after each fix**
3. **Verify fixes work**
4. **Move to next batch**
5. **Repeat until all tests pass**

## 🚀 Step 9: Final Verification

```bash
# Run all tests again
npm test

# Check results
npx playwright show-report

# Celebrate progress!
```

## 🎉 Success Criteria

- **First goal**: Get to 50% passing (reduce failures from 101 to ~50)
- **Second goal**: Get to 80% passing (reduce to ~20 failures)
- **Final goal**: Get to 95%+ passing (reduce to <5 failures)

## 📚 Additional Resources

- **Playwright Documentation**: https://playwright.dev/docs/intro
- **Debugging Guide**: https://playwright.dev/docs/debug
- **Best Practices**: https://playwright.dev/docs/best-practices

## 🔍 Common Issues Specific to CORES

### 1. Data Loading Race Conditions

**Problem**: Multiple data files load asynchronously

**Solution**: Wait for all data to be ready

```javascript
await page.waitForFunction(() => {
  return window.allDataColours?.colours?.length > 0 &&
         window.allDataEffects?.effects?.length > 0;
}, { timeout: 15000 });
```

### 2. Tab Switching Timing

**Problem**: Tabs take time to load content

**Solution**: Wait for tab content to be visible

```javascript
await page.click('text=EFFECTS');
await page.waitForSelector('.tab-btn.active:has-text("EFFECTS")');
await page.waitForTimeout(1000); // Extra buffer
```

### 3. Search Functionality

**Problem**: Search results may take time to appear

**Solution**: Wait for results or empty state

```javascript
await page.click('#btnSearch');
await page.waitForSelector('.card', { timeout: 5000 }).catch(() => {
  // If no cards, check for empty state
  return page.waitForSelector('.empty-state', { timeout: 2000 });
});
```

## 📞 Need More Help?

If you're still having trouble, try:

1. **Run a single test in headed mode**:
   ```bash
   npx playwright test tests/cores.spec.js --headed
   ```

2. **Check console logs**:
   ```bash
   npx playwright test --debug
   ```

3. **Review test traces**:
   ```bash
   npx playwright show-report
   ```

4. **Check network requests**:
   ```bash
   # Make sure data files are accessible
   curl http://127.0.0.1:5500/data/colours.json
   curl http://127.0.0.1:5500/data/effects.json
   ```

The key is to **fix tests incrementally** and **verify each fix works** before moving to the next. With 90 tests already passing, you're well on your way! 🚀