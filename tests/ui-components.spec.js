// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CORES Project - UI Components Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial data loading
    await page.waitForSelector('.tab-btn', { state: 'visible' });
  });

  test('should display header and footer correctly', async ({ page }) => {
    // Verify header elements
    const headerLabel = page.locator('#headerLabel');
    await expect(headerLabel).toHaveText('Colour and Effects Catalogue');
    
    const headerParagraph = page.locator('#headerParagraph');
    await expect(headerParagraph).toBeVisible();
    
    // Verify footer elements
    const footer = page.locator('#footer');
    await expect(footer).toBeVisible();
    
    const disclaimer = page.locator('#disclaimer');
    await expect(disclaimer).toBeVisible();
  });

  test('should display search controls correctly', async ({ page }) => {
    // Ensure we're on Colours tab (which shows search controls)
    await page.click('text=COLOURS');
    
    // Verify search input
    const searchInput = page.locator('#searchInput');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEnabled();
    
    // Verify search field dropdown
    const searchField = page.locator('#searchField');
    await expect(searchField).toBeVisible();
    await expect(searchField).toBeEnabled();
    
    // Verify search button
    const searchButton = page.locator('#btnSearch');
    await expect(searchButton).toBeVisible();
    await expect(searchButton).toBeDisabled(); // Should be disabled initially
    
    // Verify clear button
    const clearButton = page.locator('#btnClear');
    await expect(clearButton).toBeVisible();
    await expect(clearButton).toBeEnabled();
    
    // Verify export button
    const exportButton = page.locator('#btnInventory');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toBeEnabled();
  });

  test('should enable search button when form is valid', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    const searchInput = page.locator('#searchInput');
    const searchField = page.locator('#searchField');
    const searchButton = page.locator('#btnSearch');
    
    // Initially disabled
    await expect(searchButton).toBeDisabled();
    
    // Fill search term
    await searchInput.fill('test');
    
    // Still disabled (no field selected)
    await expect(searchButton).toBeDisabled();
    
    // Select field
    await searchField.selectOption('Base Colour');
    
    // Now should be enabled
    await expect(searchButton).toBeEnabled();
  });

  test('should display filter checkboxes correctly', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Verify filter groups are visible
    const filterGroups = page.locator('.filter-group');
    await expect(filterGroups).toHaveCount(4); // Temperature, Phase, Saturation, Manufacturer
    
    // Verify Temperature filter has expected options
    const temperatureGroup = page.locator('.filter-group:has-text("Temperature")');
    await expect(temperatureGroup.locator('text=Warm')).toBeVisible();
    await expect(temperatureGroup.locator('text=Cold')).toBeVisible();
    await expect(temperatureGroup.locator('text=Neutral')).toBeVisible();
    
    // Verify checkboxes are unchecked initially
    const warmCheckbox = temperatureGroup.locator('input[type="checkbox"]').first();
    await expect(warmCheckbox).not.toBeChecked();
  });

  test('should display sort button correctly', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Verify sort button is visible
    const sortButton = page.locator('#btn-sort');
    await expect(sortButton).toBeVisible();
    await expect(sortButton).toBeEnabled();
    
    // Verify initial sort icon (ascending)
    const ascIcon = page.locator('#sort-icon-asc');
    await expect(ascIcon).toBeVisible();
    
    const descIcon = page.locator('#sort-icon-desc');
    await expect(descIcon).not.toBeVisible();
    
    // Click sort button
    await sortButton.click();
    
    // Verify sort icon changes to descending
    await expect(ascIcon).not.toBeVisible();
    await expect(descIcon).toBeVisible();
  });

  test('should display results info correctly', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Verify results info is visible
    const resultsInfo = page.locator('#resultsInfo');
    await expect(resultsInfo).toBeVisible();
    
    // Verify it shows the count of results
    const resultsText = await resultsInfo.textContent();
    expect(resultsText).toContain('results');
  });

  test('should display card components correctly', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Get first card
    const firstCard = page.locator('.card').first();
    
    // Verify card structure
    await expect(firstCard.locator('.card-header')).toBeVisible();
    await expect(firstCard.locator('.card-title')).toBeVisible();
    await expect(firstCard.locator('.card-hex')).toBeVisible();
    await expect(firstCard.locator('.card-code')).toBeVisible();
    await expect(firstCard.locator('.dilution-container')).toBeVisible();
    await expect(firstCard.locator('.card-field')).toBeVisible();
    await expect(firstCard.locator('.card-keywords')).toBeVisible();
  });

  test('should display project card components correctly', async ({ page }) => {
    // Switch to Projects tab
    await page.click('text=Projects');
    
    // Get first project
    const firstProject = page.locator('.projects-accordion').first();
    
    // Verify project structure
    await expect(firstProject.locator('.project-title')).toBeVisible();
    await expect(firstProject.locator('.project-badges')).toBeVisible();
    await expect(firstProject.locator('.badge')).toBeVisible();
    
    // Click to expand
    const projectButton = firstProject.locator('button.accordion-button');
    await projectButton.click();
    
    // Verify expanded content
    await expect(firstProject.locator('.project-desc')).toBeVisible();
  });

  test('should display putty table correctly', async ({ page }) => {
    // Switch to Putty tab
    await page.click('text=PUTTY');
    
    // Verify putty content is displayed
    const puttyTable = page.locator('.custom-medieval-table');
    await expect(puttyTable).toBeVisible();
    
    // Verify table structure
    await expect(puttyTable.locator('thead')).toBeVisible();
    await expect(puttyTable.locator('tbody')).toBeVisible();
    
    // Verify table has expected rows
    const rows = puttyTable.locator('tbody tr');
    expect(await rows.count()).toBeGreaterThan(0);
    
    // Verify images are displayed
    const images = page.locator('.placeholder-image');
    await expect(images).toHaveCount(4);
  });

  test('should display footer links correctly', async ({ page }) => {
    // Verify Instagram link
    const instagramLink = page.locator('a[href="https://www.instagram.com/medievalcraftsforge"]');
    await expect(instagramLink).toBeVisible();
    await expect(instagramLink).toHaveAttribute('target', '_blank');
    
    // Verify Blog link
    const blogLink = page.locator('a[href="https://codecraftandchronicles.wordpress.com/"]');
    await expect(blogLink).toBeVisible();
    await expect(blogLink).toHaveAttribute('target', '_blank');
  });

  test('should display contribution section correctly', async ({ page }) => {
    // Verify contribution text
    const helpExpand = page.locator('#helpExpand');
    await expect(helpExpand).toBeVisible();
    
    // Verify contribution button
    const helpExpandButton = page.locator('#helpExpandButton');
    await expect(helpExpandButton).toBeVisible();
    await expect(helpExpandButton).toHaveAttribute('href', 'https://docs.google.com/forms/d/e/1FAIpQLSdvYqQ_blMh9Hv9zoBXsFK-5m0VHjzR57XkcEzq4WSeBBLsNQ/viewform?usp=publish-editor');
    await expect(helpExpandButton).toHaveAttribute('target', '_blank');
  });
});

test.describe('CORES Project - UI Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial data loading
    await page.waitForSelector('.tab-btn', { state: 'visible' });
  });

  test('should handle tab switching smoothly', async ({ page }) => {
    // Get initial active tab
    const initialActiveTab = page.locator('.tab-btn.active');
    await expect(initialActiveTab).toHaveText('COLOURS');
    
    // Switch to Effects tab
    await page.click('text=EFFECTS');
    await expect(page.locator('.tab-btn.active')).toHaveText('EFFECTS');
    
    // Verify URL hash is updated
    expect(page.url()).toContain('#effects');
    
    // Switch back to Colours
    await page.click('text=COLOURS');
    await expect(page.locator('.tab-btn.active')).toHaveText('COLOURS');
    expect(page.url()).toContain('#colours');
  });

  test('should handle project accordion expansion', async ({ page }) => {
    // Switch to Projects tab
    await page.click('text=Projects');
    
    // Get first project
    const firstProject = page.locator('.projects-accordion').first();
    const projectButton = firstProject.locator('button');
    const projectBody = firstProject.locator('.accordion-body');
    
    // Verify initially collapsed (unless it's "in progress")
    const isExpanded = await projectBody.isVisible();
    
    // Click to toggle
    await projectButton.click();
    
    // Verify state changed
    const isExpandedAfterClick = await projectBody.isVisible();
    expect(isExpandedAfterClick).not.toBe(isExpanded);
    
    // Click again to toggle back
    await projectButton.click();
    
    // Verify state changed back
    const isExpandedFinal = await projectBody.isVisible();
    expect(isExpandedFinal).toBe(isExpanded);
  });

  test('should handle HEX code copy with visual feedback', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Get first card's HEX element
    const firstHex = page.locator('.card-hex').first();
    const originalText = await firstHex.textContent();
    
    // Click to copy
    await firstHex.click();
    
    // Verify visual feedback
    await expect(firstHex).toHaveText('COPIED!');
    
    // Verify animation
    const transform = await firstHex.evaluate(el => {
      return window.getComputedStyle(el).getPropertyValue('transform');
    });
    expect(transform).toContain('scale(1.1)');
    
    // Wait for feedback to disappear
    await page.waitForTimeout(1000);
    
    // Verify original text is restored
    await expect(firstHex).toHaveText(originalText);
  });

  test('should handle filter checkbox changes', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Get initial result count
    const initialResults = page.locator('.card');
    const initialCount = await initialResults.count();
    
    // Check a filter
    const warmCheckbox = page.locator('text=Warm').locator('..').locator('input[type="checkbox"]');
    await warmCheckbox.check();
    
    // Wait for filtering
    await page.waitForTimeout(500);
    
    // Get filtered result count
    const filteredResults = page.locator('.card');
    const filteredCount = await filteredResults.count();
    
    // Verify filtering changed results
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
    
    // Uncheck filter
    await warmCheckbox.uncheck();
    
    // Wait for filtering
    await page.waitForTimeout(500);
    
    // Verify results are restored
    const restoredResults = page.locator('.card');
    const restoredCount = await restoredResults.count();
    expect(restoredCount).toBe(initialCount);
  });

  test('should handle search input changes', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    const searchInput = page.locator('#searchInput');
    const searchButton = page.locator('#btnSearch');
    
    // Verify button is disabled initially
    await expect(searchButton).toBeDisabled();
    
    // Type in search input
    await searchInput.fill('test');
    
    // Button should still be disabled (no field selected)
    await expect(searchButton).toBeDisabled();
    
    // Select a field
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    // Button should now be enabled
    await expect(searchButton).toBeEnabled();
    
    // Clear search input
    await searchInput.clear();
    
    // Button should be disabled again
    await expect(searchButton).toBeDisabled();
  });
});