# CORES Project - URL Configuration Change Summary

## 🔄 URL Change

I've updated the test configuration to use `http://127.0.0.1:5500` instead of `http://localhost:3000`.

## 📁 Files Updated

### 1. Configuration Files
- **`playwright.config.js`**: Updated `baseURL` from `'http://localhost:3000'` to `'http://127.0.0.1:5500'`

### 2. Test Files
- **`tests/cores.spec.js`**: Updated `baseURL` constant
- **`tests/data-loading.spec.js`**: Updated `baseURL` constant
- **`tests/basic-test.spec.js`**: Updated direct URL in `page.goto()`

### 3. Documentation Files
- **`TEST_FIXES_AND_RUNNING.md`**: Updated server URL references
- **`VERIFICATION_CHECKLIST.md`**: Updated server URL in checklist

## 🎯 Why This Change?

The change from `http://localhost:3000` to `http://127.0.0.1:5500` was made to match your local development environment. This is a common configuration for:

- **VS Code Live Server** (typically uses port 5500)
- **Static file serving** (no backend required)
- **Local development** (127.0.0.1 is equivalent to localhost)

## 🚀 How to Use

### 1. Start Your Local Server

Make sure your application is running at `http://127.0.0.1:5500`:

```bash
# If using VS Code Live Server:
# Right-click index.html and select "Open with Live Server"

# Or use a simple HTTP server:
npx serve . --port 5500
```

### 2. Run Tests

```bash
# Install dependencies (if not already done)
npm install

# Install Playwright browsers
npx playwright install

# Run all tests
npm test
```

### 3. Verify Configuration

```bash
# Check the base URL configuration
cat playwright.config.js | grep baseURL

# Should output: baseURL: 'http://127.0.0.1:5500',
```

## 🔍 Troubleshooting

### If tests fail to connect:

1. **Verify server is running**:
   ```bash
   curl http://127.0.0.1:5500
   ```

2. **Check port availability**:
   ```bash
   netstat -ano | findstr :5500
   ```

3. **Try different browser**:
   ```bash
   npx playwright test --project=firefox
   ```

4. **Run in headed mode to see what happens**:
   ```bash
   npm run test:headed
   ```

### Common issues:

- **Server not running**: Start your local development server first
- **Wrong port**: Make sure it's running on port 5500, not 3000
- **File not found**: Verify `index.html` is in the root directory
- **CORS issues**: If using APIs, may need CORS configuration

## 📚 Configuration Details

### Playwright Configuration

```javascript
// playwright.config.js
use: {
  baseURL: 'http://127.0.0.1:5500',
  trace: 'on-first-retry',
}
```

### What This Means

- **`baseURL`**: All `page.goto('/')` calls will use this as the base
- **`127.0.0.1`**: The loopback IP address (same as localhost)
- **`5500`**: Common port for development servers

## 🔄 Reverting Changes

If you need to revert to the original configuration:

```bash
# Edit playwright.config.js
sed -i "s|http://127.0.0.1:5500|http://localhost:3000|g" playwright.config.js

# Edit test files
sed -i "s|http://127.0.0.1:5500|http://localhost:3000|g" tests/*.spec.js
```

## 🎉 Verification

To verify the changes are working:

1. **Check configuration**:
   ```bash
   grep -r "127.0.0.1:5500" playwright.config.js tests/
   ```

2. **Run a simple test**:
   ```bash
   npx playwright test tests/basic-test.spec.js
   ```

3. **Verify in browser**:
   - Open `http://127.0.0.1:5500` in your browser
   - Should see your CORES application

## 📝 Notes

- `127.0.0.1` and `localhost` are functionally equivalent
- Port 5500 is commonly used by VS Code Live Server
- Make sure no other services are using port 5500
- If you change ports, update all configuration files accordingly

The test suite is now configured to work with your local development environment at `http://127.0.0.1:5500`! 🚀