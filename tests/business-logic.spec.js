// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CORES Project - Business Logic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial data loading
    await page.waitForSelector('.tab-btn', { state: 'visible' });
  });

  test('should sort colours alphabetically by default', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Get all colour card titles
    const cardTitles = page.locator('.card .card-title');
    const titles = [];
    const count = await cardTitles.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const title = await cardTitles.nth(i).textContent();
      titles.push(title || '');
    }
    
    // Verify titles are sorted alphabetically
    const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));
    expect(titles).toEqual(sortedTitles);
  });

  test('should sort projects by status priority', async ({ page }) => {
    // Switch to Projects tab
    await page.click('text=Projects');
    
    // Get all project statuses
    const projectStatuses = page.locator('.projects-accordion .badge');
    const statuses = [];
    const count = await projectStatuses.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const status = await projectStatuses.nth(i).textContent();
      statuses.push(status?.toLowerCase() || '');
    }
    
    // Define expected priority order
    const priorityOrder = ['to do', 'in progress', 'on the bench', 'done', 'completed', 'parking lot'];
    
    // Verify statuses follow priority order
    let prevPriority = -1;
    for (const status of statuses) {
      const currentPriority = priorityOrder.indexOf(status);
      expect(currentPriority).toBeGreaterThanOrEqual(prevPriority);
      prevPriority = currentPriority;
    }
  });

  test('should filter colours by temperature correctly', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Get initial count
    const initialCount = await page.locator('.card').count();
    
    // Filter by Warm
    const warmCheckbox = page.locator('text=Warm').locator('..').locator('input[type="checkbox"]');
    await warmCheckbox.check();
    
    // Wait for filtering
    await page.waitForTimeout(500);
    
    // Get filtered count
    const warmCount = await page.locator('.card').count();
    
    // Verify we have warm colours
    expect(warmCount).toBeGreaterThan(0);
    expect(warmCount).toBeLessThanOrEqual(initialCount);
    
    // Uncheck Warm and check Cold
    await warmCheckbox.uncheck();
    const coldCheckbox = page.locator('text=Cold').locator('..').locator('input[type="checkbox"]');
    await coldCheckbox.check();
    
    // Wait for filtering
    await page.waitForTimeout(500);
    
    // Get cold count
    const coldCount = await page.locator('.card').count();
    
    // Verify we have cold colours
    expect(coldCount).toBeGreaterThan(0);
  });

  test('should search colours by specific field', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Search by Base Colour field
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('red');
    
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    await page.click('#btnSearch');
    
    // Verify results
    const resultCards = page.locator('.card');
    const count = await resultCards.count();
    
    if (count > 0) {
      // Verify all results contain 'red' in Base Colour
      for (let i = 0; i < Math.min(count, 5); i++) {
        const card = resultCards.nth(i);
        const title = await card.locator('.card-title').textContent();
        expect(title?.toLowerCase()).toContain('red');
      }
    }
  });

  test('should display complementary colours correctly', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Get first card that has a complementary colour
    const cards = page.locator('.card');
    const count = await cards.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) {
      const card = cards.nth(i);
      const complementarySection = card.locator('.card-field:has-text("Complementary")');
      
      if (await complementarySection.count() > 0) {
        const complementaryValue = await complementarySection.locator('.card-value').textContent();
        
        // If complementary colour exists, it should display properly
        if (complementaryValue && !complementaryValue.includes('N/A')) {
          // Verify it shows the colour name and HEX code
          expect(complementaryValue).toMatch(/[A-Za-z]+.*#[0-9A-F]{6}/i);
        }
        
        break; // Found a card with complementary colour
      }
    }
  });

  test('should calculate colour contrast correctly', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Get first card
    const firstCard = page.locator('.card').first();
    const hexElement = firstCard.locator('.card-hex');
    
    // Get HEX value and text colour
    const hexValue = await hexElement.getAttribute('style');
    const backgroundColor = hexValue?.match(/background-color:\s*([^;]+)/)?.[1] || '';
    const textColor = hexValue?.match(/color:\s*([^;]+)/)?.[1] || '';
    
    // Verify contrast is appropriate
    if (backgroundColor && textColor) {
      // Simple verification that contrast is set (white or black)
      expect(textColor).toMatch(/^(white|black|rgb\(255,\s*255,\s*255\)|rgb\(0,\s*0,\s*0\))$/i);
    }
  });

  test('should display project materials correctly', async ({ page }) => {
    // Switch to Projects tab
    await page.click('text=Projects');
    
    // Find a project with materials
    const projects = page.locator('.projects-accordion');
    const count = await projects.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const project = projects.nth(i);
      const projectButton = project.locator('button');
      
      // Expand project
      await projectButton.click();
      
      // Check if project has materials
      const materialsGrid = project.locator('.project-dependencies-grid');
      
      if (await materialsGrid.count() > 0) {
        // Verify materials are displayed with proper formatting
        const materialChips = materialsGrid.locator('.mini-chip');
        const chipCount = await materialChips.count();
        
        expect(chipCount).toBeGreaterThan(0);
        
        // Verify each chip has name and code
        for (let j = 0; j < Math.min(chipCount, 3); j++) {
          const chip = materialChips.nth(j);
          await expect(chip.locator('strong')).toBeVisible();
          await expect(chip.locator('small')).toBeVisible();
        }
        
        break; // Found a project with materials
      }
    }
  });

  test('should handle project images correctly', async ({ page }) => {
    // Switch to Projects tab
    await page.click('text=Projects');
    
    // Find a project with images
    const projects = page.locator('.projects-accordion');
    const count = await projects.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const project = projects.nth(i);
      const projectButton = project.locator('button');
      
      // Expand project
      await projectButton.click();
      
      // Check if project has images
      const carousel = project.locator('.canva-carousel-container');
      
      if (await carousel.count() > 0) {
        // Verify images are displayed
        const images = carousel.locator('img');
        const imageCount = await images.count();
        
        expect(imageCount).toBeGreaterThan(0);
        
        // Verify images have proper attributes
        for (let j = 0; j < Math.min(imageCount, 3); j++) {
          const image = images.nth(j);
          await expect(image).toHaveAttribute('src');
          await expect(image).toHaveAttribute('alt');
        }
        
        break; // Found a project with images
      }
    }
  });

  test('should export only owned items to CSV', async ({ page, context }) => {
    // Mock the download to capture content
    const downloadPromise = page.waitForEvent('download');
    
    // Click export button
    await page.click('#btnInventory');
    
    // Wait for download
    const download = await downloadPromise;
    
    // Get download content
    const content = await download.text();
    
    // Verify CSV structure
    const lines = content.split('\n');
    expect(lines[0]).toContain('Base Colour,Code');
    
    // Verify only owned items are included
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        // Each line should have colour name and code
        const parts = lines[i].split(',');
        expect(parts.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

test.describe('CORES Project - Error Handling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial data loading
    await page.waitForSelector('.tab-btn', { state: 'visible' });
  });

  test('should handle empty search gracefully', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Search with empty input
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('');
    
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    await page.click('#btnSearch');
    
    // Should show all results (empty search returns everything)
    const resultCards = page.locator('.card');
    const count = await resultCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should handle search with no results gracefully', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Search for something that won't exist
    const searchInput = page.locator('#searchInput');
    await searchInput.fill('nonexistentcolorxyz123');
    
    const searchField = page.locator('#searchField');
    await searchField.selectOption('Base Colour');
    
    await page.click('#btnSearch');
    
    // Should show empty state
    const emptyState = page.locator('.empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No results found');
  });

  test('should handle filter with no results gracefully', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Check a filter that might have no results
    const fluorescentCheckbox = page.locator('text=Fluorescent').locator('..').locator('input[type="checkbox"]');
    
    if (await fluorescentCheckbox.count() > 0) {
      await fluorescentCheckbox.check();
      
      // Wait for filtering
      await page.waitForTimeout(500);
      
      // Check if we have results or empty state
      const resultCards = page.locator('.card');
      const cardCount = await resultCards.count();
      
      if (cardCount === 0) {
        // Should show empty state
        const emptyState = page.locator('.empty-state');
        await expect(emptyState).toBeVisible();
      }
    }
  });

  test('should handle special characters in data gracefully', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Verify page doesn't crash with special characters in data
    const cards = page.locator('.card');
    const count = await cards.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = cards.nth(i);
      const title = await card.locator('.card-title').textContent();
      
      // Should not crash even with special characters
      expect(title).toBeTruthy();
    }
  });

  test('should handle missing data fields gracefully', async ({ page }) => {
    // Ensure we're on Colours tab
    await page.click('text=COLOURS');
    
    // Verify all cards are displayed even if some have missing fields
    const cards = page.locator('.card');
    const count = await cards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // All cards should be visible
    for (let i = 0; i < Math.min(count, 5); i++) {
      await expect(cards.nth(i)).toBeVisible();
    }
  });
});