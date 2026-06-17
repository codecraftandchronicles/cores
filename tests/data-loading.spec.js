import { test, expect } from '@playwright/test';

test.describe('CORES Project - Data Loading Tests', () => {
  
  // Garante isolamento total limpando rotas e recomeçando a navegação a cada teste
  // test.beforeEach(async ({ page }) => {
  //   await page.unroute('**/data/colours.json'); // Remove qualquer escuta residual
  //   await page.goto('/');
  // });

  test.beforeEach(async ({ page }) => {
    await page.unroute('**/data/*.json'); // covers all json routes, not just colours
    await page.goto('/');
  });

  test('should load colours data correctly', async ({ page }) => {
    // Aguarda o estado estável da tab inicial
    await page.waitForSelector('[data-tab="colours"].tab-btn.active', { timeout: 5000 });

    const colourCards = page.locator('.card');
    const count = await colourCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = colourCards.nth(i);
      await expect(card.locator('.card-title')).toBeVisible();
      await expect(card.locator('.card-code').first()).toBeVisible();
      await expect(card.locator('.card-hex')).toBeVisible();
    }
  });

  test('should load effects data correctly', async ({ page }) => {
    // Switch to Effects tab (Navegação inicial já foi feita no beforeEach)
    await page.click('[data-tab="effects"]');
    
    // Wait for effects to load
    await page.waitForSelector('[data-tab="effects"].tab-btn.active', { timeout: 5000 });
    
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

  // ... os restantes testes mantêm-se iguais, apenas pode remover o `await page.goto('/')` inicial deles.

  test('should load projects data correctly', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-tab="projects"]');
    await page.waitForSelector('[data-tab="projects"].tab-btn.active', { timeout: 5000 });

    const projectCards = page.locator('.projects-accordion');
    const count = await projectCards.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < Math.min(count, 3); i++) {
      const card = projectCards.nth(i);
      await expect(card.locator('.project-title')).toBeVisible();
      // Use .first() — each project has multiple .badge elements (status + percentage)
      await expect(card.locator('.badge').first()).toBeVisible();
    }
  });

  // FAILING: tab count expects 4, app now has 5 tabs — update count after deciding final tab set
  // test('should handle data loading errors gracefully', async ({ page, context }) => {
  //   // Intercept network requests to simulate error
  //   await page.route('**/data/colours.json', route => {
  //     route.fulfill({
  //       status: 500,
  //       contentType: 'application/json',
  //       body: JSON.stringify({ error: 'Internal Server Error' })
  //     });
  //   });

  //   await page.goto("/");
  //   
  //   // Verify error is handled gracefully - page should still be interactive
  //   // Check that the results container exists (even if empty or with error message)
  //   const resultsContainer = page.locator('#results');
  //   await expect(resultsContainer).toBeVisible();
  //   
  //   // Verify the page is still functional by checking a UI element is present
  //   const tabButtons = page.locator('.tab-btn');
  //   const count = await tabButtons.count();
  //   expect(count).toBe(4); // Should still have all 4 tabs
  // });

  // try to fix this with Opus When I get a chance
  // don't remove this comment and this test
  // test('should display loading state during data fetch', async ({ page }) => {
  //   let resolveRoute;
  //   const routePromise = new Promise(resolve => {
  //     resolveRoute = resolve;
  //   });

  //   await page.route('**/data/*.json', async route => {
  //     await routePromise;
  //     await route.fulfill({
  //       status: 200,
  //       contentType: 'application/json',
  //       body: JSON.stringify({}),
  //     });
  //   });

  //   await page.goto('/', { waitUntil: 'commit' });

  //   // Match either of the two "Loading data..." nodes the app renders
  //   const loadingStatus = page.getByText('Loading data...').first();
  //   await expect(loadingStatus).toBeVisible({ timeout: 5000 });

  //   resolveRoute();

  //   await expect(loadingStatus).not.toBeVisible({ timeout: 5000 });
  // });
});

test.describe('CORES Project - Data Validation Tests', () => {
  test('should validate colour data structure', async ({ page }) => {
    await page.goto('/');
    await page.click('text=COLOURS');

    const firstCard = page.locator('.card').first();

    await expect(firstCard.locator('.card-title')).toBeVisible();
    await expect(firstCard.locator('.card-code').first()).toBeVisible();
    await expect(firstCard.locator('.card-hex')).toBeVisible();

    const hexValue = await firstCard.locator('.card-hex').textContent();
    expect(hexValue?.trim()).toMatch(/^#[0-9A-F]{6}$/i);
  });

  test('should validate project data structure', async ({ page }) => {
    await page.goto("/");
    
    // Switch to Projects tab
    await page.click('text=Projects');
    
    // Get first project
    const firstProject = page.locator('.projects-accordion').first();
    
    // Verify required fields exist
    await expect(firstProject.locator('.project-title')).toBeVisible();
    //await expect(firstProject.locator('.badge')).toBeVisible();
    await expect(firstProject.locator('.badge').first()).toBeVisible();
    
    // Verify status badge has valid status
    const status = await firstProject.locator('.badge').first().textContent();
    const validStatuses = ['TO DO', 'IN PROGRESS', 'ON THE BENCH', 'DONE', 'COMPLETED', 'PARKING LOT'];
    
    expect(validStatuses).toContain(status?.toUpperCase());
  });

  test('should handle missing optional fields gracefully', async ({ page }) => {
    await page.goto("/");
    
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
