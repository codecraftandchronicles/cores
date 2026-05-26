// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CORES Project - Smoke Tests', () => {
  test('smoke test: verify core functionality', async ({ page }) => {
    // Load the page
    await page.goto('/');
    
    // 1. Verify page loads with default content
    const header = page.locator('#headerLabel');
    await expect(header).toHaveText('Colour and Effects Catalogue');
    
    const activeTab = page.locator('.tab-btn.active');
    await expect(activeTab).toHaveText('COLOURS');
    
    // 2. Verify colours are loaded
    const colourCards = page.locator('.card');
    await expect(colourCards).toHaveCountGreaterThan(0);
    
    // 3. Test tab switching
    await page.click('text=EFFECTS');
    await expect(page.locator('.tab-btn.active')).toHaveText('EFFECTS');
    
    await page.click('text=PUTTY');
    await expect(page.locator('.tab-btn.active')).toHaveText('PUTTY');
    await expect(page.locator('text=Technical reference guide for fillers')).toBeVisible();
    
    await page.click('text=Projects');
    await expect(page.locator('.tab-btn.active')).toHaveText('Projects');
    
    // 4. Test search functionality
    await page.click('text=COLOURS');
    
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('red');
    
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    await page.click('#btnSearch');
    
    // Should have some results or show empty state
    const resultCards = page.locator('.card');
    const cardCount = await resultCards.count();
    
    if (cardCount > 0) {
      // Verify results contain search term
      const firstTitle = await resultCards.first().locator('.card-title').textContent();
      expect(firstTitle?.toLowerCase()).toContain('red');
    } else {
      // Should show empty state
      await expect(page.locator('.empty-state')).toBeVisible();
    }
    
    // 5. Test filtering
    await page.click('#btnClear');
    
    const warmCheckbox = page.locator('text=Warm').locator('..').locator('input[type="checkbox"]');
    await warmCheckbox.check();
    
    await page.waitForTimeout(500);
    
    const filteredCards = page.locator('.card');
    await expect(filteredCards).toHaveCountGreaterThan(0);
    
    // 6. Test sorting
    await warmCheckbox.uncheck();
    
    const firstCardBefore = await page.locator('.card').first().locator('.card-title').textContent();
    
    await page.click('#btn-sort');
    
    await page.waitForTimeout(500);
    
    const firstCardAfter = await page.locator('.card').first().locator('.card-title').textContent();
    
    // Sorting should change the order
    expect(firstCardBefore).not.toBe(firstCardAfter);
    
    // 7. Test project expansion
    await page.click('text=Projects');
    
    const firstProject = page.locator('.projects-accordion').first();
    const projectButton = firstProject.locator('button');
    
    await projectButton.click();
    
    await expect(firstProject.locator('.project-desc')).toBeVisible();
    
    // 8. Test HEX copy functionality
    await page.click('text=COLOURS');
    
    const firstHex = page.locator('.card-hex').first();
    const hexValue = await firstHex.textContent();
    
    await firstHex.click();
    
    await expect(firstHex).toHaveText('COPIED!');
    
    await page.waitForTimeout(1000);
    
    await expect(firstHex).toHaveText(hexValue);
    
    console.log('✅ Smoke test passed - core functionality is working!');
  });

  test('smoke test: verify error handling', async ({ page }) => {
    // Test that the app handles errors gracefully
    await page.goto('/');
    
    // 1. Test search with no results
    await page.click('text=COLOURS');
    
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('nonexistentcolorxyz123');
    
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    await page.click('#btnSearch');
    
    // Should show empty state, not crash
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() > 0) {
      await expect(emptyState).toContainText('No results found');
    }
    
    // 2. Test clearing search works
    await page.click('#btnClear');
    
    const clearedCards = page.locator('.card');
    await expect(clearedCards).toHaveCountGreaterThan(0);
    
    console.log('✅ Error handling smoke test passed!');
  });

  test('smoke test: verify responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should still be usable on mobile
    const header = page.locator('#headerLabel');
    await expect(header).toBeVisible();
    
    const tabs = page.locator('.tab-btn');
    await expect(tabs).toHaveCount(4);
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();
    
    await expect(header).toBeVisible();
    await expect(tabs).toHaveCount(4);
    
    console.log('✅ Responsive design smoke test passed!');
  });
});