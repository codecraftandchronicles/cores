// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CORES Project - Setup Verification', () => {
  test('should verify test setup is working', async ({ page }) => {
    // This is a simple test to verify the testing environment is set up correctly
    await page.goto('/');
    
    // Verify page loads
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Verify we can find the main header
    const header = page.locator('#headerLabel');
    await expect(header).toBeVisible();
    
    // Verify tabs are present
    const tabs = page.locator('.tab-btn');
    await expect(tabs).toHaveCount(4);
    
    console.log('✅ Test setup verified successfully!');
  });

  test('should verify data files are accessible', async ({ page }) => {
    // Verify we can access the data files
    const coloursResponse = await page.goto('/data/colours.json');
    expect(coloursResponse?.status()).toBe(200);
    
    const effectsResponse = await page.goto('/data/effects.json');
    expect(effectsResponse?.status()).toBe(200);
    
    const projectsResponse = await page.goto('/data/projects.json');
    expect(projectsResponse?.status()).toBe(200);
    
    console.log('✅ Data files are accessible!');
  });

  test('should verify basic interactions work', async ({ page }) => {
    await page.goto('/');
    
    // Verify we can click tabs
    await page.click('text=COLOURS');
    await expect(page.locator('.tab-btn.active')).toHaveText('COLOURS');
    
    await page.click('text=EFFECTS');
    await expect(page.locator('.tab-btn.active')).toHaveText('EFFECTS');
    
    // Verify we can type in search
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');
    
    console.log('✅ Basic interactions work correctly!');
  });
});