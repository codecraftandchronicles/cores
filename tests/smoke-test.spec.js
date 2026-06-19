// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CORES Project - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load app with Colours tab active by default', async ({ page }) => {
    // Verify header is visible
    const header = page.locator('#headerLabel');
    await expect(header).toContainText('Colour and Effects Catalogue');

    // Verify Colours tab is active by default
    const activeTab = page.locator('[data-tab="colours"]');
    await expect(activeTab).toHaveAttribute('class', /active/);

    // Verify cards are loaded
    const cards = page.locator('.card');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('should switch between tabs using [data-tab] selectors', async ({ page }) => {
    // Switch to Effects tab
    await page.locator('[data-tab="effects"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-tab="effects"]')).toHaveAttribute('class', /active/);

    // Switch to Putty tab
    await page.locator('[data-tab="putty"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-tab="putty"]')).toHaveAttribute('class', /active/);

    // Switch to Projects tab
    await page.locator('[data-tab="projects"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-tab="projects"]')).toHaveAttribute('class', /active/);

    // Switch back to Colours
    await page.locator('[data-tab="colours"]').click();
    await page.waitForTimeout(300);
    await expect(page.locator('[data-tab="colours"]')).toHaveAttribute('class', /active/);
  });


});