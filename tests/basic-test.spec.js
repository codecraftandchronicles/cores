// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Basic Setup Test', () => {
  test('should verify basic test infrastructure works', async ({ page }) => {
    // This is a minimal test to verify the testing environment is working
    await page.goto('https://codecraftandchronicles.github.io/cores/'); //http://127.0.0.1:5500
    
    // Verify page loads
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Verify we can find the main header
    const header = page.locator('#headerLabel');
    await expect(header).toBeVisible();
    
    console.log('✅ Basic test infrastructure is working!');
  });
});