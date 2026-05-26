# CORES Project - Testing Documentation

## Overview

This document describes the end-to-end testing setup for the CORES (Colour and Effects Catalogue) project using Playwright.

## Test Suite Structure

```
tests/
├── cores.spec.js          # Main functionality tests (12 tests)
├── data-loading.spec.js   # Data loading and validation (8 tests)
├── ui-components.spec.js  # UI component tests (18 tests)
├── business-logic.spec.js # Business logic tests (16 tests)
├── smoke-test.spec.js     # Smoke tests (3 tests)
├── setup-verification.spec.js # Setup verification (3 tests)
└── example.spec.js        # Example from Playwright

Total: 60+ tests covering all major functionality
```

## Test Coverage Areas

### ✅ Core Functionality (12 tests)
- Page loading and initial state
- Tab switching (Colours, Effects, Putty, Projects)
- Search with field selection
- Filtering with checkboxes
- Sorting results
- Clearing search and filters
- Project details expansion
- Empty results handling
- HEX code copying
- CSV export
- URL hash synchronization
- Mobile responsive design

### ✅ Data Loading (8 tests)
- Colours data loading and structure validation
- Effects data loading and structure validation
- Projects data loading and structure validation
- Error handling for failed data loading
- Loading state display
- Data validation and integrity checks

### ✅ UI Components (18 tests)
- Header and footer display
- Search controls (input, dropdown, buttons)
- Filter checkboxes and groups
- Sort button and icons
- Results info display
- Card components (colours and projects)
- Putty table and images
- Footer links and social icons
- Contribution section
- UI interactions (tab switching, accordion, copy feedback)

### ✅ Business Logic (16 tests)
- Alphabetical sorting verification
- Project status priority sorting
- Temperature filtering logic
- Field-specific searching
- Complementary colour display
- Colour contrast calculation
- Project materials display
- Project image handling
- CSV export validation
- Error handling for edge cases
- Special character handling
- Missing data handling

### ✅ Smoke Tests (3 tests)
- Core functionality verification
- Error handling verification
- Responsive design verification

### ✅ Setup Verification (3 tests)
- Basic test environment verification
- Data file accessibility
- Basic interaction testing

## Running Tests

### Prerequisites
- Node.js v16+
- npm or yarn
- Playwright installed

### Installation
```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

### Running Tests

#### Run all tests
```bash
npm test
```

#### Run specific test file
```bash
npx playwright test tests/cores.spec.js
```

#### Run in headed mode (see browser)
```bash
npm run test:headed
```

#### Run with debug mode
```bash
npm run test:debug
```

#### Generate HTML report
```bash
npm run test:report
```

#### Full test setup and execution
```bash
npm run test:all
```

### Using the test runner script
```bash
chmod +x run-tests.sh
./run-tests.sh
```

## Test Configuration

The Playwright configuration (`playwright.config.js`) includes:

- **Parallel execution**: Tests run in parallel for faster execution
- **CI optimizations**: Retries only on CI, single worker on CI
- **HTML reporting**: Visual report generation
- **Cross-browser testing**: Chromium, Firefox, WebKit
- **Base URL**: Configured for local development
- **Trace collection**: For debugging failed tests

## Test Data

Tests use the actual data from:
- `data/colours.json` - Colour data
- `data/effects.json` - Effects data  
- `data/projects.json` - Projects data
- `data/tools.json` - Tools data

## Test Results

After running tests, you'll find:
- **HTML Report**: `playwright-report/index.html`
- **Test traces**: `test-results/` directory
- **Screenshots**: Automatically captured for failures

## Continuous Integration

Example GitHub Actions workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 16
    
    - name: Install dependencies
      run: npm install
    
    - name: Install Playwright browsers
      run: npx playwright install
    
    - name: Run Playwright tests
      run: npx playwright test
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: playwright-report
        path: playwright-report/
```

## Writing New Tests

### Best Practices

1. **Test Isolation**: Each test should be independent
2. **Descriptive Names**: Clearly describe what's being tested
3. **Proper Waits**: Use `waitForSelector` or `waitForTimeout` for async operations
4. **Meaningful Assertions**: Use Playwright's built-in assertions
5. **Test Both Paths**: Happy path and error cases
6. **Mobile Testing**: Include mobile viewport tests

### Example Test Structure

```javascript
test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup code
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Test actions
    await page.click('selector');
    
    // Assertions
    await expect(page.locator('element')).toBeVisible();
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Error case testing
    await page.fill('input', 'invalid');
    
    // Verify error handling
    await expect(page.locator('.error')).toBeVisible();
  });
});
```

## Test Maintenance

### Updating Tests
When the application changes:
1. Update corresponding tests
2. Run all tests to ensure nothing breaks
3. Add new tests for new features

### Debugging Failed Tests
1. Run in headed mode: `npm run test:headed`
2. Use debug mode: `npm run test:debug`
3. Check HTML report: `npm run test:report`
4. Examine test traces in `test-results/`

## Test Coverage Metrics

| Area | Tests | Coverage |
|------|-------|----------|
| Core Functionality | 12 | ✅ High |
| Data Loading | 8 | ✅ High |
| UI Components | 18 | ✅ Comprehensive |
| Business Logic | 16 | ✅ Comprehensive |
| Smoke Tests | 3 | ✅ Critical paths |
| Setup Verification | 3 | ✅ Environment |

**Total**: 60+ tests covering all major functionality

## Known Limitations

1. **No API testing**: Tests focus on UI, not backend APIs
2. **No visual regression testing**: Consider adding Playwright's visual comparison
3. **Limited cross-browser testing**: Currently tests Chromium, Firefox, WebKit
4. **No performance testing**: Consider adding performance metrics

## Future Enhancements

1. Add visual regression testing
2. Expand cross-browser testing matrix
3. Add performance benchmarking
4. Implement accessibility testing
5. Add internationalization testing
6. Create synthetic monitoring tests

## Troubleshooting

### Common Issues

**Tests failing intermittently**
- Add more explicit waits
- Increase timeouts
- Check for race conditions

**Browser not launching**
- Run `npx playwright install`
- Check browser installations

**Port conflicts**
- Ensure dev server is running
- Check base URL configuration

**Test isolation issues**
- Use `test.beforeEach` for setup
- Clear state between tests
- Avoid global state dependencies

## Contributing

When adding new tests:
1. Follow existing patterns and conventions
2. Place tests in appropriate files
3. Add descriptive test names
4. Test both happy paths and error cases
5. Run all tests before submitting

## License

Tests are released under the same license as the CORES project (ISC).