// @ts-check
import { test, expect } from '@playwright/test';

// Base URL - adjust if needed
const baseURL = 'http://127.0.0.1:5500';

test.describe('CORES Project - Data Loading Tests', () => {
  test('should load colours data correctly', async ({ page }) => {
    await page.goto(baseURL);
    
    // Wait for colours to load
    await page.waitForSelector('.tab-btn.active:has-text("COLOURS")');
    
    // Verify colours are displayed
    const colourCards = page.locator('.card');
    const count = await colourCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verify each card has required fields
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = colourCards.nth(i);
      await expect(card.locator('.card-title')).toBeVisible();
      await expect(card.locator('.card-code')).toBeVisible();
      await expect(card.locator('.card-hex')).toBeVisible();
    }
  });

  test('should load effects data correctly', async ({ page }) => {
    await page.goto(baseURL);
    
    // Switch to Effects tab
    await page.click('text=EFFECTS');
    
    // Wait for effects to load
    await page.waitForSelector('.tab-btn.active:has-text("EFFECTS")');
    
    // Verify effects are displayed
    const effectCards = page.locator('.card');
    const count = await effectCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verify each card has required fields
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = effectCards.nth(i);
      await expect(card.locator('.card-title')).toBeVisible();
      await expect(card.locator('.card-code')).toBeVisible();
    }
  });

  test('should load projects data correctly', async ({ page }) => {
    await page.goto(baseURL);
    
    // Switch to Projects tab
    await page.click('text=Projects');
    
    // Wait for projects to load
    await page.waitForSelector('.tab-btn.active:has-text("Projects")');
    
    // Verify projects are displayed
    const projectCards = page.locator('.projects-accordion');
    const count = await projectCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verify each project has required fields
    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = projectCards.nth(i);
      await expect(card.locator('.project-title')).toBeVisible();
      await expect(card.locator('.badge')).toBeVisible();
    }
  });

  test('should handle data loading errors gracefully', async ({ page, context }) => {
    // Intercept network requests to simulate error
    await page.route('**/data/colours.json', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto(baseURL);
    
    // Verify error is handled
    const errorState = page.locator('.empty-state:has-text("Erro")');
    await expect(errorState).toBeVisible();
  });

  test('should display loading state during data fetch', async ({ page }) => {
    // Slow down the response to see loading state
    await page.route('**/data/colours.json', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ colours: [] })
        });
      }, 1000);
    });

    await page.goto(baseURL);
    
    // Verify loading overlay is visible
    const loadingOverlay = page.locator('#loading-overlay');
    await expect(loadingOverlay).toBeVisible();
    
    // Wait for loading to complete
    await page.waitForSelector('#loading-overlay:not(:visible)', { timeout: 5000 });
    
    // Verify loading overlay is hidden after data loads
    await expect(loadingOverlay).not.toBeVisible();
  });
});

test.describe('CORES Project - Data Validation Tests', () => {
  test('should validate colour data structure', async ({ page }) => {
    await page.goto(baseURL);
    
    // Switch to Colours tab
    await page.click('text=COLOURS');
    
    // Get first colour card
    const firstCard = page.locator('.card').first();
    
    // Verify required fields exist
    await expect(firstCard.locator('.card-title')).toBeVisible();
    await expect(firstCard.locator('.card-code')).toBeVisible();
    await expect(firstCard.locator('.card-hex')).toBeVisible();
    
    // Verify HEX code format
    const hexValue = await firstCard.locator('.card-hex').textContent();
    expect(hexValue).toMatch(/^#[0-9A-F]{6}$/i);
  });

  test('should validate project data structure', async ({ page }) => {
    await page.goto(baseURL);
    
    // Switch to Projects tab
    await page.click('text=Projects');
    
    // Get first project
    const firstProject = page.locator('.projects-accordion').first();
    
    // Verify required fields exist
    await expect(firstProject.locator('.project-title')).toBeVisible();
    await expect(firstProject.locator('.badge')).toBeVisible();
    
    // Verify status badge has valid status
    const status = await firstProject.locator('.badge').first().textContent();
    const validStatuses = ['TO DO', 'IN PROGRESS', 'ON THE BENCH', 'DONE', 'COMPLETED', 'PARKING LOT'];
    
    expect(validStatuses).toContain(status?.toUpperCase());
  });

  test('should handle missing optional fields gracefully', async ({ page }) => {
    await page.goto(baseURL);
    
    // Switch to Colours tab
    await page.click('text=COLOURS');
    
    // Verify page doesn't crash even if some cards have missing optional fields
    const cards = page.locator('.card');
    const count = await cards.count();
    
    // All cards should still be visible
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });
});