// @ts-check
import { test, expect } from '@playwright/test';

// Tab buttons have whitespace padding around their labels.
// Always use toContainText() (not toHaveText()) for .tab-btn.active assertions.
// Always use data-tab attribute selector to click tabs (avoids ambiguous text= matching).

test.describe('CORES Project - UI Components Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.tab-btn', { state: 'visible' });
  });

  test('should display header and footer correctly', async ({ page }) => {
    await expect(page.locator('#headerLabel')).toHaveText('Colour and Effects Catalogue');
    await expect(page.locator('#headerParagraph')).toBeVisible();
    await expect(page.locator('#footer')).toBeVisible();
    await expect(page.locator('#disclaimer')).toBeVisible();
  });

  test('should display search controls correctly', async ({ page }) => {
    await page.locator('[data-tab="colours"]').click();
    await expect(page.locator('#searchInput')).toBeVisible();
    await expect(page.locator('#searchInput')).toBeEnabled();
    await expect(page.locator('#searchField')).toBeVisible();
    await expect(page.locator('#searchField')).toBeEnabled();
    await expect(page.locator('#btnSearch')).toBeVisible();
    await expect(page.locator('#btnSearch')).toBeDisabled();
    await expect(page.locator('#btnClear')).toBeVisible();
    await expect(page.locator('#btnClear')).toBeEnabled();
    await expect(page.locator('#btnInventory')).toBeVisible();
    await expect(page.locator('#btnInventory')).toBeEnabled();
  });
    
  //TODO: FIX THIS TEST 
  // test('should enable search button when form is valid', async ({ page }) => {
  //   await page.locator('[data-tab="colours"]').click();
  //   await page.locator('.card').first().waitFor({ state: 'visible', timeout: 8000 });

  //   const searchButton = page.locator('#btnSearch');
  //   await expect(searchButton).toBeDisabled();

  //   await page.locator('#searchInput').fill('test');
  //   await expect(searchButton).toBeDisabled(); // field not selected yet

  //   await page.locator('#searchField').selectOption('Base Colour');
  //   await expect(searchButton).toBeEnabled();
  // });

  test('should display filter checkboxes correctly', async ({ page }) => {
    // Wait for loading overlay to clear before clicking tab (Firefox is slower)
    await page.locator('#loading-overlay').waitFor({ state: 'hidden', timeout: 8000 }).catch(() => {});
    await page.locator('[data-tab="colours"]').click();
    // Wait for cards = data ready = filters rendered
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 8000 });

    const filterGroups = page.locator('.filter-group');
    await expect(filterGroups).toHaveCount(4);

    const temperatureGroup = page.locator('.filter-group:has-text("Temperature")');
    await expect(temperatureGroup.locator('text=Warm')).toBeVisible();
    await expect(temperatureGroup.locator('text=Cold')).toBeVisible();
    await expect(temperatureGroup.locator('text=Neutral')).toBeVisible();

    await expect(temperatureGroup.locator('input[type="checkbox"]').first()).not.toBeChecked();
  });

  // test('should display sort button correctly', async ({ page }) => {
  //   await page.locator('[data-tab="colours"]').click();

  //   const sortButton = page.locator('#btn-sort');
  //   await expect(sortButton).toBeVisible();
  //   await expect(sortButton).toBeEnabled();
  //   await expect(page.locator('#sort-icon-asc')).toBeVisible();
  //   await expect(page.locator('#sort-icon-desc')).not.toBeVisible();

  //   await sortButton.click();
  //   await expect(page.locator('#sort-icon-asc')).not.toBeVisible();
  //   await expect(page.locator('#sort-icon-desc')).toBeVisible();
  // });

  test('should display results info correctly', async ({ page }) => {
    await page.locator('[data-tab="colours"]').click();
    const resultsInfo = page.locator('#resultsInfo');
    await expect(resultsInfo).toBeVisible();
    expect(await resultsInfo.textContent()).toContain('results');
  });

  test('should display project card components correctly', async ({ page }) => {
    await page.locator('[data-tab="projects"]').click();

    const firstProject = page.locator('.projects-accordion').first();
    await firstProject.waitFor({ state: 'visible', timeout: 8000 });

    await expect(firstProject.locator('.project-title')).toBeVisible();
    await expect(firstProject.locator('.project-badges')).toBeVisible();
    await expect(firstProject.locator('.badge').first()).toBeVisible();

    const projectDesc = firstProject.locator('.project-desc');

    // Don't blindly click — check state first.
    // "In Progress" projects start open; clicking would close them.
    const isAlreadyOpen = await projectDesc.isVisible();
    if (!isAlreadyOpen) {
      await firstProject.locator('.accordion-item > button').click();
    }

    await expect(projectDesc).toBeVisible({ timeout: 3000 });
  });

  test('should display putty table correctly', async ({ page }) => {
    await page.locator('[data-tab="putty"]').click();
    await expect(page.locator('.tab-btn.active')).toContainText('PUTTY', { timeout: 5000 });

    const puttyTable = page.locator('#results .custom-medieval-table');
    await expect(puttyTable).toBeVisible({ timeout: 5000 });
    await expect(puttyTable.locator('thead')).toBeVisible();
    await expect(puttyTable.locator('tbody')).toBeVisible();
    expect(await puttyTable.locator('tbody tr').count()).toBeGreaterThan(0);

    await expect(page.locator('.placeholder-image')).toHaveCount(4);
  });

  test('should display footer links correctly', async ({ page }) => {
    const instagramLink = page.locator('a[href="https://www.instagram.com/medievalcraftsforge"]');
    await expect(instagramLink).toBeVisible();
    await expect(instagramLink).toHaveAttribute('target', '_blank');

    const blogLink = page.locator('a[href="https://codecraftandchronicles.wordpress.com/"]');
    await expect(blogLink).toBeVisible();
    await expect(blogLink).toHaveAttribute('target', '_blank');
  });

  test('should display contribution section correctly', async ({ page }) => {
    await expect(page.locator('#helpExpand')).toBeVisible();
    const helpExpandButton = page.locator('#helpExpandButton');
    await expect(helpExpandButton).toBeVisible();
    await expect(helpExpandButton).toHaveAttribute('href', 'https://docs.google.com/forms/d/e/1FAIpQLSdvYqQ_blMh9Hv9zoBXsFK-5m0VHjzR57XkcEzq4WSeBBLsNQ/viewform?usp=publish-editor');
    await expect(helpExpandButton).toHaveAttribute('target', '_blank');
  });
});


test.describe('CORES Project - UI Interaction Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.tab-btn', { state: 'visible' });
  });

  // FIX: Tab buttons have surrounding whitespace — use toContainText() throughout.
  // Use data-tab attribute to click to avoid ambiguous text= matching.
  // URL hash is set inside the 300ms debounce; wait for active tab first.
  test('should handle tab switching smoothly', async ({ page }) => {
    await expect(page.locator('.tab-btn.active')).toContainText('COLOURS');

    await page.locator('[data-tab="effects"]').click();
    await expect(page.locator('.tab-btn.active')).toContainText('EFFECTS', { timeout: 5000 });
    expect(page.url()).toContain('#effects');

    await page.locator('[data-tab="colours"]').click();
    await expect(page.locator('.tab-btn.active')).toContainText('COLOURS', { timeout: 5000 });
    expect(page.url()).toContain('#colours');
  });

  // FIX: toggleAccordion() sets inline display style (not a CSS class).
  // Check visibility via isVisible() before and after click.
  // "In Progress"/"To Do" projects start open; "Done" start collapsed.
  // We find the first collapsed project to test open, then close it again.
  test('should handle project accordion expansion', async ({ page }) => {
    await page.locator('[data-tab="projects"]').click();

    const allProjects = page.locator('.projects-accordion');
    await allProjects.first().waitFor({ state: 'visible', timeout: 8000 });

    const count = await allProjects.count();

    // Find a collapsed project (accordion-button collapsed = Done status)
    let targetIndex = -1;
    for (let i = 0; i < count; i++) {
      const btn = allProjects.nth(i).locator('.accordion-item > button');
      const hasCollapsed = await btn.evaluate(el => el.classList.contains('collapsed'));
      if (hasCollapsed) { targetIndex = i; break; }
    }

    if (targetIndex >= 0) {
      // Test: open a collapsed project
      const target = allProjects.nth(targetIndex);
      const body = target.locator('.accordion-body');
      await expect(body).not.toBeVisible();

      await target.locator('.accordion-item > button').click();
      await expect(body).toBeVisible({ timeout: 3000 });

      await target.locator('.accordion-item > button').click();
      await expect(body).not.toBeVisible({ timeout: 3000 });
    } else {
      // All projects are open (all In Progress) — test closing one
      const target = allProjects.first();
      const body = target.locator('.accordion-body');
      await expect(body).toBeVisible();

      await target.locator('.accordion-item > button').click();
      await expect(body).not.toBeVisible({ timeout: 3000 });

      await target.locator('.accordion-item > button').click();
      await expect(body).toBeVisible({ timeout: 3000 });
    }
  });

  test('should handle HEX code copy with visual feedback', async ({ page, context }) => {
    // clipboard-write is supported in Chromium; Firefox ignores unknown permissions gracefully
    await context.grantPermissions(['clipboard-write']).catch(() => {});

    await page.locator('[data-tab="colours"]').click();

    const firstCard = page.locator('.card').first();
    await firstCard.waitFor({ state: 'visible', timeout: 8000 });

    const firstHex = page.locator('.card-hex').first();
    const originalText = (await firstHex.textContent())?.trim();

    await firstHex.click();

    // Visual feedback: text changes to COPIED!
    await expect(firstHex).toContainText('COPIED!', { timeout: 3000 });

    // After 800ms the app restores the original text
    await page.waitForTimeout(900);
    await expect(firstHex).toContainText(originalText ?? '', { timeout: 2000 });
  });

  test('should handle filter checkbox changes', async ({ page }) => {
    await page.locator('[data-tab="colours"]').click();
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 8000 });

    const initialCount = await page.locator('.card').count();

    const warmCheckbox = page.locator('#filter-Temperature-Warm');
    await warmCheckbox.check();
    await page.waitForTimeout(500);

    const filteredCount = await page.locator('.card').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    await warmCheckbox.uncheck();
    await page.waitForTimeout(500);

    const restoredCount = await page.locator('.card').count();
    expect(restoredCount).toBe(initialCount);
  });

  //TODO: FIX THIS TEST 
  // test('should handle search input changes', async ({ page }) => {
  //   await page.locator('[data-tab="colours"]').click();
  //   await page.locator('.card').first().waitFor({ state: 'visible', timeout: 8000 });

  //   const searchButton = page.locator('#btnSearch');
  //   await expect(searchButton).toBeDisabled();

  //   await page.locator('#searchInput').fill('test');
  //   await expect(searchButton).toBeDisabled();

  //   await page.locator('#searchField').selectOption('Base Colour');
  //   await expect(searchButton).toBeEnabled();

  //   await page.locator('#searchInput').clear();
  //   await expect(searchButton).toBeDisabled();
  // });
});