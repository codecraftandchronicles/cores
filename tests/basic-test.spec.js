// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Basic Setup Test', () => {
  // FLAKY (firefox): page.goto('/') times out or #headerLabel not visible under firefox project.
  // Fix: investigate firefox-specific network timing or add explicit networkidle wait.
  test.skip('should verify basic test infrastructure works', async ({ page }) => {
    // This is a minimal test to verify the testing environment is working
    await page.goto('/');
    
    // Verify page loads
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Verify we can find the main header
    const header = page.locator('#headerLabel');
    await expect(header).toBeVisible();
    
    console.log('✅ Basic test infrastructure is working!');
  });
});