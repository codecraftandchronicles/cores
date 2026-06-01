// @ts-check
import { test, expect } from '@playwright/test';

// Base URL - adjust if needed
const baseURL = 'https://codecraftandchronicles.github.io/cores/'; //http://127.0.0.1:5500

test.describe('CORES Project - End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    // Wait for initial data loading
    await page.waitForSelector('.tab-btn', { state: 'visible' });
  });

  test('should load and display initial data', async ({ page }) => {
    // Check that the page loads with default tab
    const header = page.locator('#headerLabel');
    await expect(header).toHaveText('Colour and Effects Catalogue');
    
    // Verify default tab is active
    const coloursTab = page.locator('.tab-btn.active');
    await expect(coloursTab).toHaveText('COLOURS');
    
    // Check that results are displayed
    const results = page.locator('.results-grid');
    await expect(results).toBeVisible();
    
    // Verify loading spinner is gone
    const loadingOverlay = page.locator('#loading-overlay');
    await expect(loadingOverlay).not.toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Test switching to Effects tab
    await page.click('text=EFFECTS');
    await expect(page.locator('.tab-btn.active')).toHaveText('EFFECTS');
    
    // Test switching to Putty tab
    await page.click('text=PUTTY');
    await expect(page.locator('.tab-btn.active')).toHaveText('PUTTY');
    
    // Verify putty content is displayed
    await expect(page.locator('text=Technical reference guide for fillers')).toBeVisible();
    
    // Test switching to Projects tab
    await page.click('text=Projects');
    await expect(page.locator('.tab-btn.active')).toHaveText('Projects');
  });

  test('should perform search functionality', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Fill search input
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('red');
    
    // Select a field from dropdown
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    // Click search button
    await page.click('#btnSearch');
    
    // Verify results are filtered
    const resultCards = page.locator('.card');
    const count = await resultCards.count();
    
    // Check that we have some results (not empty)
    expect(count).toBeGreaterThan(0);
    
    // Verify results contain the search term
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = resultCards.nth(i);
      const title = await card.locator('.card-title').textContent();
      expect(title?.toLowerCase()).toContain('red');
    }
  });

  test('should filter by checkboxes', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Check a filter checkbox (e.g., Warm temperature)
    const warmCheckbox = page.locator('text=Warm').locator('..').locator('input[type="checkbox"]');
    await warmCheckbox.check();
    
    // Wait for filtering to complete
    await page.waitForTimeout(500);
    
    // Verify results are filtered
    const resultCards = page.locator('.card');
    const count = await resultCards.count();
    
    // Check that we have results
    expect(count).toBeGreaterThan(0);
  });

  test('should sort results', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Get initial first card title
    const firstCardBefore = await page.locator('.card').first().locator('.card-title').textContent();
    
    // Click sort button
    await page.click('#btn-sort');
    
    // Wait for sorting to complete
    await page.waitForTimeout(500);
    
    // Get first card title after sorting
    const firstCardAfter = await page.locator('.card').first().locator('.card-title').textContent();
    
    // Verify that sorting changed the order
    expect(firstCardBefore).not.toBe(firstCardAfter);
  });

  test('should clear search and filters', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Perform a search
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('test');
    
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    await page.click('#btnSearch');
    
    // Check a filter
    const warmCheckbox = page.locator('text=Warm').locator('..').locator('input[type="checkbox"]');
    await warmCheckbox.check();
    
    // Click clear button
    await page.click('#btnClear');
    
    // Verify search input is cleared
    await expect(searchInput).toBeEmpty();
    
    // Verify search field is reset
    await expect(searchField).toHaveValue('');
    
    // Verify checkbox is unchecked
    await expect(warmCheckbox).not.toBeChecked();
  });

  test('should display project details', async ({ page }) => {
    // Switch to Projects tab
    await page.click('text=Projects');
    
    // Wait for projects to load
    await page.waitForSelector('.projects-accordion', { state: 'visible' });
    
    // Get first project
    const firstProject = page.locator('.projects-accordion').first();
    
    // Click to expand project details
    const projectButton = firstProject.locator('button.accordion-button');
    await projectButton.click();
    
    // Verify project details are visible
    const projectDesc = firstProject.locator('.project-desc');
    await expect(projectDesc).toBeVisible();
    
    // Verify project status badge is visible
    const statusBadge = firstProject.locator('.badge');
    await expect(statusBadge).toBeVisible();
  });

  test('should handle empty search results', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Search for something that won't exist
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('nonexistentcolor12345');
    
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    await page.click('#btnSearch');
    
    // Verify empty state is shown
    const emptyState = page.locator('.empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No results found');
  });

  test('should copy HEX code to clipboard', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Get first card's HEX element
    const firstHex = page.locator('.card-hex').first();
    const hexValue = await firstHex.textContent();
    
    // Click to copy
    await firstHex.click();
    
    // Verify copy feedback is shown
    await expect(firstHex).toHaveText('COPIED!');
    
    // Wait for feedback to disappear
    await page.waitForTimeout(1000);
    
    // Verify original HEX value is restored
    await expect(firstHex).toHaveText(hexValue);
  });

  test('should export inventory to CSV', async ({ page, context }) => {
    // Mock the download dialog
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('#btnInventory');
    
    // Wait for download to start
    const download = await downloadPromise;
    
    // Verify download has correct filename
    expect(download.suggestedFilename()).toContain('meu_inventario_tintas.csv');
  });

  test('should maintain URL hash on tab switch', async ({ page }) => {
    // Switch to Effects tab
    await page.click('text=EFFECTS');
    
    // Verify URL hash is updated
    expect(page.url()).toContain('#effects');
    
    // Switch to Projects tab
    await page.click('text=Projects');
    
    // Verify URL hash is updated
    expect(page.url()).toContain('#projects');
  });

  test('should handle mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Refresh page
    await page.reload();
    
    // Verify mobile layout is applied
    const header = page.locator('#headerLabel');
    await expect(header).toBeVisible();
    
    // Verify tabs are still accessible
    const tabs = page.locator('.tab-btn');
    await expect(tabs).toHaveCount(4);
    
    // Verify results grid adapts
    const resultsGrid = page.locator('.results-grid');
    await expect(resultsGrid).toBeVisible();
  });
});

test.describe('CORES Project - Edge Cases', () => {
  test('should handle special characters in search', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Search with special characters
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('éàü');
    
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    await page.click('#btnSearch');
    
    // Should not crash, even if no results
    const emptyState = page.locator('.empty-state');
    if (await emptyState.count() > 0) {
      await expect(emptyState).toBeVisible();
    }
  });

  test('should handle rapid tab switching', async ({ page }) => {
    // Rapidly switch between tabs
    for (let i = 0; i < 5; i++) {
      await page.click('text=COLOURS');
      await page.click('text=EFFECTS');
      await page.click('text=PUTTY');
      await page.click('text=Projects');
    }
    
    // Verify we end up on Projects tab
    await expect(page.locator('.tab-btn.active')).toHaveText('Projects');
    
    // Verify content is still displayed
    const projects = page.locator('.projects-accordion');
    await expect(projects).toBeVisible();
  });

  test('should handle multiple checkbox filters', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Check multiple filters
    const warmCheckbox = page.locator('text=Warm').locator('..').locator('input[type="checkbox"]');
    const coldCheckbox = page.locator('text=Cold').locator('..').locator('input[type="checkbox"]');
    
    await warmCheckbox.check();
    await coldCheckbox.check();
    
    // Wait for filtering
    await page.waitForTimeout(500);
    
    // Verify results are filtered
    const resultCards = page.locator('.card');
    const count = await resultCards.count();
    
    // Should have results (warm OR cold colors)
    expect(count).toBeGreaterThan(0);
  });
});