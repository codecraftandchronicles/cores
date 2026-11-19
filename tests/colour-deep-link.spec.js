// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Colour code deep links', () => {
  test('shows only the matching colour card and normalizes the code', async ({ page }) => {
    await page.goto('/?code=%20ak11092%20');

    const cards = page.locator('#results .card');
    await expect(cards).toHaveCount(1);
    await expect(cards.locator('.card-title')).toHaveText('MATT RED');
    await expect(cards.locator('.card-code').first()).toHaveText('AK11092');
  });

  test('shows all colours with a discreet notice when the code does not exist', async ({ page }) => {
    const response = await page.request.get('/data/colours.json');
    const data = await response.json();

    await page.goto('/?code=NOT-A-REAL-COLOUR-CODE');

    await expect(page.locator('.code-query-not-found')).toHaveText(
      'Colour code "NOT-A-REAL-COLOUR-CODE" not found. Showing all colours.'
    );
    await expect(page.locator('#resultsInfo')).toContainText(`Showing ${data.colours.length} results`);
    await expect(page.locator('#results .card').first()).toBeVisible();
  });
});
