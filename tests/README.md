# CORES Project E2E Tests

This directory contains end-to-end tests for the CORES (Colour and Effects Catalogue) project using Playwright.

## Test Structure

```
tests/
├── cores.spec.js          # Main functionality tests
├── data-loading.spec.js   # Data loading and validation tests
├── ui-components.spec.js  # UI component tests
├── business-logic.spec.js # Business logic and error handling tests
└── example.spec.js        # Example test (from Playwright)
```

## Test Coverage

### 1. Main Functionality Tests (`cores.spec.js`)
- Page loading and initial data display
- Tab switching between Colours, Effects, Putty, and Projects
- Search functionality with field selection
- Filtering with checkboxes
- Sorting results
- Clearing search and filters
- Project details expansion
- Empty search results handling
- HEX code copying
- CSV export
- URL hash synchronization
- Mobile responsive design

### 2. Data Loading Tests (`data-loading.spec.js`)
- Colours data loading and validation
- Effects data loading and validation
- Projects data loading and validation
- Error handling for failed data loading
- Loading state display during data fetch

### 3. UI Component Tests (`ui-components.spec.js`)
- Header and footer display
- Search controls (input, dropdown, buttons)
- Filter checkboxes
- Sort button and icons
- Results info display
- Card components (colours and projects)
- Putty table display
- Footer links
- Contribution section

### 4. Business Logic Tests (`business-logic.spec.js`)
- Alphabetical sorting of colours
- Project status priority sorting
- Temperature filtering
- Field-specific searching
- Complementary colour display
- Colour contrast calculation
- Project materials display
- Project image handling
- CSV export validation
- Error handling for edge cases

## Running Tests

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Playwright installed (`npm install -g @playwright/test`)

### Installation
```bash
npm install
npx playwright install
```

### Running Tests

#### Run all tests
```bash
npx playwright test
```

#### Run specific test file
```bash
npx playwright test cores.spec.js
```

#### Run in headed mode (see browser)
```bash
npx playwright test --headed
```

#### Run with debug mode
```bash
npx playwright test --debug
```

#### Generate HTML report
```bash
npx playwright show-report
```

### Using the test runner script
```bash
chmod +x run-tests.sh
./run-tests.sh
```

## Test Configuration

The Playwright configuration is in `playwright.config.js`:
- Tests run in parallel by default
- Retries on CI only
- HTML reporter enabled
- Supports Chromium, Firefox, and WebKit
- Base URL configured for local development

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on the state of other tests.

2. **Descriptive Names**: Test names should clearly describe what they're testing.

3. **Wait for Elements**: Use appropriate wait strategies (`waitForSelector`, `waitForTimeout`) to handle async operations.

4. **Assertions**: Use Playwright's built-in assertions for better error messages.

5. **Mobile Testing**: Include mobile viewport tests for responsive design.

6. **Error Handling**: Test how the application handles errors and edge cases.

## Continuous Integration

To run these tests in CI, add this to your workflow:

```yaml
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

When adding new tests:

1. Place them in the appropriate file based on what they test
2. Follow the existing naming conventions
3. Use `test.describe` to group related tests
4. Add `test.beforeEach` for common setup
5. Use meaningful assertions
6. Test both happy paths and error cases

## Test Data

The tests use the actual data from the JSON files in the `data/` directory. For testing specific scenarios, you can:

1. Create test-specific JSON files
2. Use Playwright's route interception to mock responses
3. Add test data directly to the existing JSON files with a "test" flag

## Troubleshooting

- **Tests failing intermittently**: Add more explicit waits or increase timeouts
- **Browser not launching**: Run `npx playwright install` to install browsers
- **Port conflicts**: Make sure your dev server is running on the configured port
- **Test isolation issues**: Use `test.beforeEach` to reset state

## Contributing

When contributing new tests:

1. Fork the repository
2. Create a new branch for your tests
3. Add your tests following the existing patterns
4. Run all tests to ensure nothing breaks
5. Submit a pull request

## License

These tests are released under the same license as the CORES project.