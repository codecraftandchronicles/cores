const { test, expect } = require('@playwright/test');

const COLOURS_PAGE = '/';

test.describe('Primer selector feature', () => {
  test.beforeEach(async ({ page }) => {
    // await page.goto(COLOURS_PAGE);
    // // Ensure we're on the colours tab
    // await expect(page.locator('#tab-cores-label')).toHaveClass(/active/);
    await page.unroute('**/data/*.json'); // clear any leaked routes from other spec files
    await page.goto(COLOURS_PAGE);
    await expect(page.locator('#tab-cores-label')).toHaveClass(/active/);
  });

  test('primer selector exists and has correct label', async ({ page }) => {
    const primerContainer = page.locator('.primer-selector-container');
    await expect(primerContainer).toBeVisible();

    const label = page.locator('.primer-label');
    await expect(label).toHaveText('Preview Primer Effect');
  });

  test('primer selector has all 19 primer options', async ({ page }) => {
    const primerSelect = page.locator('#primerSelect');
    
    const options = await primerSelect.locator('option').count();
    // 19 primer options
    expect(options).toBe(19);

    // Verify specific options exist (options are not "visible" in dropdown, just check they exist)
    const primerOptions = [
      'primer-v-white',
      'primer-v-black',
      'primer-v-ultramarine',
      'primer-v-vermilion',
      'primer-v-grey'
    ];

    for (const option of primerOptions) {
      const optionElement = primerSelect.locator(`option[value="${option}"]`);
      await expect(optionElement).toBeTruthy();
      const count = await optionElement.count();
      expect(count).toBe(1);
    }
  });

  test('primer selector has tooltip with correct text', async ({ page }) => {
    const primerSelect = page.locator('#primerSelect');
    const expectedTooltip = 'Change background to match your miniature\'s primer and preview dilution transparency.';
    
    // The tooltip is the title attribute on the select element itself
    await expect(primerSelect).toHaveAttribute('title', expectedTooltip);
  });

  test('default primer (white) is applied on page load', async ({ page }) => {
    // Wait for cards to render
    await expect(page.locator('.card').first()).toBeVisible();

    // Check that cards have the primer-v-white class by default
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toHaveClass(/primer-v-white/);
  });

  test('selecting a primer applies the correct CSS class to all cards', async ({ page }) => {
    // Wait for cards to render
    await expect(page.locator('.card').first()).toBeVisible();

    const primerSelect = page.locator('#primerSelect');

    // Select a different primer
    await primerSelect.selectOption('primer-v-black');

    // Wait for class change
    await page.waitForTimeout(100);

    // Check that all cards now have the primer-v-black class
    const cards = page.locator('.card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);

    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveClass(/primer-v-black/);
    }
  });

  test('selecting different primers updates card styling', async ({ page }) => {
    await expect(page.locator('.card').first()).toBeVisible();

    const primerSelect = page.locator('#primerSelect');
    const firstCard = page.locator('.card').first();

    // Start with white
    await expect(firstCard).toHaveClass(/primer-v-white/);

    // Switch to ultramarine
    await primerSelect.selectOption('primer-v-ultramarine');
    await page.waitForTimeout(100);
    await expect(firstCard).toHaveClass(/primer-v-ultramarine/);
    await expect(firstCard).not.toHaveClass(/primer-v-white/);

    // Switch to vermilion
    await primerSelect.selectOption('primer-v-vermilion');
    await page.waitForTimeout(100);
    await expect(firstCard).toHaveClass(/primer-v-vermilion/);
    await expect(firstCard).not.toHaveClass(/primer-v-ultramarine/);
  });

  test('primer selector is visible on colours tab', async ({ page }) => {
    const primerContainer = page.locator('.primer-selector-container');
    await expect(primerContainer).toBeVisible();
  });

  test('primer selector is visible on effects tab', async ({ page }) => {
    // Switch to effects tab
    await page.click('#tab-efeitos-label');
    await page.waitForTimeout(200);

    const primerContainer = page.locator('.primer-selector-container');
    await expect(primerContainer).toBeVisible();
  });

  test('primer selector is hidden on putty tab', async ({ page }) => {
    // Switch to putty tab
    await page.click('#tab-massa-label');
    await page.waitForTimeout(200);

    const primerContainer = page.locator('.primer-selector-container');
    await expect(primerContainer).not.toBeVisible();
  });

  test('primer selector is hidden on projects tab', async ({ page }) => {
    // Switch to projects tab
    await page.click('#tab-projects-label');
    await page.waitForTimeout(200);

    const primerContainer = page.locator('.primer-selector-container');
    await expect(primerContainer).not.toBeVisible();
  });

  test('primer selection persists when switching between search results', async ({ page }) => {
    // Load initial data
    await expect(page.locator('.card').first()).toBeVisible();

    const primerSelect = page.locator('#primerSelect');

    // Select a specific primer
    await primerSelect.selectOption('primer-v-grey');
    await page.waitForTimeout(100);

    // Perform a search
    await page.selectOption('#searchField', { label: 'Base Colour' });
    await page.fill('#searchInput', 'Ultramarine');
    await page.click('#btnSearch');

    // Wait for results
    await expect(page.locator('.card').first()).toBeVisible();

    // Verify that the grey primer is still applied to the filtered results
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toHaveClass(/primer-v-grey/);

    // Verify the dropdown still shows the grey primer
    await expect(primerSelect).toHaveValue('primer-v-grey');
  });

  test('all 19 primer classes can be applied without errors', async ({ page }) => {
    await expect(page.locator('.card').first()).toBeVisible();

    const primerSelect = page.locator('#primerSelect');
    const allPrimers = [
      'primer-v-white',
      'primer-v-yellow-ice',
      'primer-v-desert-sand',
      'primer-v-dark-yellow',
      'primer-v-silvergrey',
      'primer-v-light-grey',
      'primer-v-vermilion',
      'primer-v-ultramarine',
      'primer-v-nato-green',
      'primer-v-chestnut-brown',
      'primer-v-oxford-blue',
      'primer-v-usmc-green',
      'primer-v-venetian-red',
      'primer-v-german-green',
      'primer-v-bronze-green',
      'primer-v-grey',
      'primer-v-dark-grey',
      'primer-v-basalt-grey',
      'primer-v-black'
    ];

    for (const primer of allPrimers) {
      await primerSelect.selectOption(primer);
      await page.waitForTimeout(50);

      // Verify the first card has the selected primer class
      const firstCard = page.locator('.card').first();
      const hasClass = await firstCard.evaluate((el, primerClass) => {
        return el.classList.contains(primerClass);
      }, primer);

      expect(hasClass).toBe(true);
    }
  });

  test('primer selector displays correctly on effects tab with data', async ({ page }) => {
    // Switch to effects tab
    await page.click('#tab-efeitos-label');
    await page.waitForTimeout(200);

    // Verify primer selector is visible
    const primerContainer = page.locator('.primer-selector-container');
    await expect(primerContainer).toBeVisible();

    // Select a primer
    const primerSelect = page.locator('#primerSelect');
    await primerSelect.selectOption('primer-v-black');
    await page.waitForTimeout(100);

    // Wait for cards to render and verify primer is applied
    const firstCard = page.locator('.card').first();
    if (await firstCard.count() > 0) {
      await expect(firstCard).toHaveClass(/primer-v-black/);
    }
  });

  test('switching tabs and back maintains primer selection', async ({ page }) => {
    // Set a primer on colours tab
    const primerSelect = page.locator('#primerSelect');
    await primerSelect.selectOption('primer-v-ultramarine');
    await page.waitForTimeout(100);

    // Switch to effects tab
    await page.click('#tab-efeitos-label');
    await page.waitForTimeout(200);

    // Switch back to colours tab
    await page.click('#tab-cores-label');
    await page.waitForTimeout(200);

    // Verify primer selection is restored
    await expect(primerSelect).toHaveValue('primer-v-ultramarine');
    const firstCard = page.locator('.card').first();
    await expect(firstCard).toHaveClass(/primer-v-ultramarine/);
  });
});
