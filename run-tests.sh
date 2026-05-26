#!/bin/bash

echo "🧪 Running CORES Project E2E Tests"
echo "=================================="

# Check if Playwright is installed
if ! command -v playwright &> /dev/null; then
    echo "❌ Playwright not found. Please install it first:"
    echo "   npm install -g @playwright/test"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Install Playwright browsers
npx playwright install

# Run all tests
echo "🚀 Running all tests..."
npx playwright test

# Check test results
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    
    # Generate HTML report
    echo "📊 Generating HTML report..."
    npx playwright show-report
else
    echo "❌ Some tests failed!"
    echo "📊 Opening HTML report to see details..."
    npx playwright show-report
    exit 1
fi