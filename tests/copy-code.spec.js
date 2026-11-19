// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Copy paint and effect codes', () => {
  test('copies the code from cards in both tabs and confirms success', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async code => {
            document.documentElement.dataset.lastCopiedCode = code;
          }
        }
      });
    });

    await page.goto('/');

    const firstColourCard = page.locator('#results .card').first();
    await expect(firstColourCard).toBeVisible();
    const colourCode = await firstColourCard.locator('.card-code').innerText();
    await firstColourCard.getByRole('button', { name: `Copy code ${colourCode}` }).click();

    await expect(page.locator('#copy-notification')).toHaveText('Code copied to memory');
    expect(await page.locator('html').getAttribute('data-last-copied-code')).toBe(colourCode);

    await page.locator('[data-tab="effects"]').click();
    await expect(page.locator('[data-tab="effects"]')).toHaveClass(/active/);

    const response = await page.request.get('/data/effects.json');
    const effects = (await response.json()).effects;
    effects.sort((a, b) => a['Product Name'].toUpperCase().localeCompare(b['Product Name'].toUpperCase()));
    await expect(page.locator('#results .card-title').first()).toHaveText(effects[0]['Product Name'].toUpperCase());

    const firstEffectCard = page.locator('#results .card').first();
    await expect(firstEffectCard).toBeVisible();
    const effectCode = await firstEffectCard.locator('.card-code').innerText();
    await firstEffectCard.getByRole('button', { name: `Copy code ${effectCode}` }).click();

    await expect(page.locator('#copy-notification')).toHaveText('Code copied to memory');
    expect(await page.locator('html').getAttribute('data-last-copied-code')).toBe(effectCode);
  });

  test('shows failure feedback when writing to the clipboard fails', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async () => {
            throw new Error('Clipboard permission denied');
          }
        }
      });
    });

    await page.goto('/');

    const copyButton = page.getByRole('button', { name: 'Copy code AK11092' });
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    await expect(page.locator('#copy-notification')).toHaveText(
      'Unable to copy code. Please try again.'
    );
    await expect(copyButton).toBeEnabled();
  });
});
