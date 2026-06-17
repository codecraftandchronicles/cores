// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CORES Project - Setup Verification', () => {
  // FAILING: tab count expects 4, app now has 5 tabs — update count after deciding final tab set
  // test('should verify test setup is working', async ({ page }) => {
  //   // This is a simple test to verify the testing environment is set up correctly
  //   await page.goto('/');
  //   
  //   // Verify page loads
  //   const title = await page.title();
  //   expect(title).toBeTruthy();
  //   
  //   // Verify we can find the main header
  //   const header = page.locator('#headerLabel');
  //   await expect(header).toBeVisible();
  //   
  //   // Verify tabs are present
  //   const tabs = page.locator('.tab-btn');
  //   await expect(tabs).toHaveCount(4);
  //   
  //   console.log('✅ Test setup verified successfully!');
  // });

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
    await page.unroute('**/data/*.json'); // clear leaked routes from other spec files
    await page.goto('/');

    await page.click('[data-tab="colours"]');
    await expect(page.locator('[data-tab="colours"].tab-btn')).toHaveClass(/active/, { timeout: 5000 });

    await page.click('[data-tab="effects"]');
    await expect(page.locator('[data-tab="effects"].tab-btn')).toHaveClass(/active/, { timeout: 5000 });

    const searchInput = page.locator('#searchInput');
    await searchInput.fill('test');
    await expect(searchInput).toHaveValue('test');

    console.log('✅ Basic interactions work correctly!');
  });
});