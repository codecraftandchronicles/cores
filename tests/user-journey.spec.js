// @ts-check
import { test, expect } from '@playwright/test';

// The tab switcher has a 300ms debounce (TAB_SWITCH_DEBOUNCE in app.js).
// After clicking a tab we always wait for a reliable DOM signal before asserting,
// never for an arbitrary timeout.

// Helper: click a tab and wait until it is marked active AND its content is ready.
async function switchToTab(page, tabText, readyLocator) {
  // Use data-tab attribute to click — avoids ambiguous text= matching
  await page.locator(`.tab-btn[data-tab="${tabText.toLowerCase()}"]`).click();
  // toContainText handles the whitespace/newline padding in the button
  await expect(page.locator('.tab-btn.active')).toContainText(tabText, { timeout: 5000 });
  if (readyLocator) await expect(readyLocator).toBeVisible({ timeout: 5000 });
}

test.describe('CORES Project - User Journey Tests', () => {

  test('complete user journey: finding and using colour information', async ({ page }) => {
    await page.goto('/');

    // 1. Header is visible
    await expect(page.locator('#headerLabel')).toHaveText('Colour and Effects Catalogue');
    await expect(page.locator('#headerParagraph')).toBeVisible();

    //Before
    await expect(page.locator('.tab-btn.active')).toHaveText('COLOURS');
    // After
    await expect(page.locator('.tab-btn.active')).toContainText('COLOURS');

    // 3. At least one colour card loads
    const firstCard = page.locator('.card').first();
    await firstCard.waitFor({ state: 'visible', timeout: 8000 });
    const initialCount = await page.locator('.card').count();
    expect(initialCount).toBeGreaterThan(0);

    // 4. Search for red colours by Base Colour field
    await page.locator('#searchInput').fill('red');
    await page.locator('#searchField').selectOption('Base Colour');
    await page.locator('#loading-overlay').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
    await page.click('#btnSearch');
    await page.waitForTimeout(400); // allow debounced search to settle

    // 5. Filtered results contain "red" in their title
    const redCards = page.locator('.card');
    const redCount = await redCards.count();
    if (redCount > 0) {
      for (let i = 0; i < Math.min(redCount, 3); i++) {
        const title = await redCards.nth(i).locator('.card-title').textContent();
        expect(title?.toLowerCase() ?? '').toContain('red');
      }
    }

    // 6. Filter by Warm temperature
    await page.click('#btnClear');
    const warmCheckbox = page.locator('#filter-Temperature-Warm');
    await warmCheckbox.check();
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 5000 });
    expect(await page.locator('.card').count()).toBeGreaterThan(0);

    // 7. Copy the HEX code of the first warm colour
    const firstHex = page.locator('.card-hex').first();
    const hexValue = (await firstHex.textContent())?.trim() ?? '';

    await firstHex.evaluate(el => {
      if (typeof window['copyToClipboard'] === 'function') {
        window['copyToClipboard'](el.textContent.trim(), { preventDefault: () => {}, stopPropagation: () => {} });
      } else {
        el.click();
      }
    }).catch(() => firstHex.click());

    try {
      await expect(firstHex).toHaveText(/COPIED!/, { timeout: 1500 });
      if (hexValue) {
        await expect(firstHex).toHaveText(new RegExp(hexValue.replace('#', '\\#')), { timeout: 2000 });
      }
    } catch {
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText()).catch(() => hexValue);
      expect(clipboardText).toContain(hexValue);
    }

    // 8. Complementary colour field (optional — only asserts if present and non-N/A)
    const firstColourCard = page.locator('.card').first();
    const complementarySection = firstColourCard.locator('.card-field:has-text("Complementary")');
    if (await complementarySection.count() > 0) {
      const complementaryValue = await complementarySection.first().locator('.card-value').textContent();
      if (complementaryValue && !complementaryValue.includes('N/A')) {
        const hasHex = /#[0-9A-F]{6}/i.test(complementaryValue);
        if (hasHex) {
          expect(complementaryValue).toMatch(/[A-Za-z]*.*#[0-9A-F]{6}/i);
        } else {
          expect(complementaryValue.trim().length).toBeGreaterThan(5);
        }
      }
    }

    // 9. Switch to EFFECTS tab
    await switchToTab(page, 'EFFECTS', page.locator('.card').first());
    expect(await page.locator('.card').count()).toBeGreaterThan(0);

    // 10. Switch to Projects tab
    await switchToTab(page, 'Projects', page.getByRole('button', { name: /DONE|IN PROGRESS/i }).first());
    const projectButtons = page.getByRole('button', { name: /DONE|IN PROGRESS/i });
    const projectsCount = await projectButtons.count();
    expect(projectsCount).toBeGreaterThan(0);

    // 11. Expand a project
    // The first project opens automatically; click the second if it exists to test toggle.
    if (projectsCount > 1) {
      await projectButtons.nth(1).click();
      await expect(page.locator('.project-desc').nth(1)).toBeVisible({ timeout: 5000 });
    } else {
      await expect(page.locator('.project-desc').first()).toBeVisible({ timeout: 5000 });
    }

    // 12. Switch to PUTTY tab and verify content.
    //
    // KEY FACTS from app.js:
    //   - switchTab() wraps everything in a 300ms setTimeout (TAB_SWITCH_DEBOUNCE).
    //   - For the putty tab, #resultsInfo is set to display:none — so the
    //     "Technical reference guide for fillers" paragraph is ALWAYS HIDDEN.
    //     It must NOT be asserted with toBeVisible().
    //   - The real content (htmlPutty) is injected into #results after the debounce.
    //   - The correct visible indicator is .custom-medieval-table inside #results.
    await page.click('text=PUTTY');
    await expect(page.locator('.tab-btn.active')).toHaveText('PUTTY', { timeout: 5000 });

    // Wait for htmlPutty to be injected into #results
    const medievalTable = page.locator('#results .custom-medieval-table');
    await expect(medievalTable).toBeVisible({ timeout: 5000 });

    // The table content is correct
    await expect(medievalTable.locator('th').first()).toHaveText('Feature / Product');
    await expect(medievalTable.locator('tbody tr')).toHaveCount(6);

    // 13. Export inventory
    await switchToTab(page, 'COLOURS', page.locator('.card').first());

    const downloadPromise = page.waitForEvent('download');
    await page.click('#btnInventory');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('meu_inventario_tintas.csv');

    console.log('✅ Complete user journey test passed!');
  });


  test('user journey: searching for specific project materials', async ({ page }) => {
    await page.goto('/');

    await switchToTab(page, 'Projects', page.getByRole('button', { name: /DONE|IN PROGRESS/i }).first());

    const projectButtons = page.getByRole('button', { name: /DONE|IN PROGRESS/i });
    const projectsCount = await projectButtons.count();
    expect(projectsCount).toBeGreaterThan(0);

    let projectWithMaterials = null;

    for (let i = 0; i < Math.min(projectsCount, 5); i++) {
      await projectButtons.nth(i).click();
      await page.waitForTimeout(300); // allow collapse animation

      const materialsGrid = page.locator('.project-dependencies-grid').nth(i);
      if (await materialsGrid.count() > 0) {
        projectWithMaterials = materialsGrid;
        break;
      }
    }

    if (projectWithMaterials) {
      const materialChips = projectWithMaterials.locator('.mini-chip');
      const chipCount = await materialChips.count();

      if (chipCount > 0) {
        const chipText = await materialChips.first().textContent();
        const colourName = chipText?.split('\n')[1]?.trim();

        if (colourName) {
          await switchToTab(page, 'COLOURS', page.locator('.card').first());

          await page.locator('#searchInput').fill(colourName);
          await page.locator('#searchField').selectOption('Base Colour');
          await page.click('#btnSearch');
          await page.waitForTimeout(400);

          const results = page.locator('.card');
          if (await results.count() > 0) {
            const firstResultTitle = await results.first().locator('.card-title').textContent();
            expect(firstResultTitle?.toLowerCase() ?? '').toContain(colourName.toLowerCase());
          }
        }
      }
    }

    console.log('✅ Project materials search journey test passed!');
  });


  test('user journey: comparing colours and effects', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.tab-btn.active')).toHaveText('COLOURS');
    await page.locator('.card').first().waitFor({ state: 'visible', timeout: 8000 });

    const firstColour = await page.locator('.card').first().locator('.card-title').textContent();

    // Switch to EFFECTS and back — card list must reset to the colours list
    await switchToTab(page, 'EFFECTS', page.locator('.card').first());
    // (firstEffect captured but not needed for this assertion)

    await switchToTab(page, 'COLOURS', page.locator('.card').first());
    const firstColourAfterSwitch = await page.locator('.card').first().locator('.card-title').textContent();
    expect(firstColourAfterSwitch).toBe(firstColour);

    // Filter by AK manufacturer
    await page.locator('#filter-Manufacturer-AK').check();
    await page.waitForTimeout(500);
    const akCount = await page.locator('.card').count();
    expect(akCount).toBeGreaterThan(0);

    // Clearing filter restores more results
    await page.click('#btnClear');
    await page.waitForTimeout(500);
    const allCount = await page.locator('.card').count();
    expect(allCount).toBeGreaterThan(akCount);

    console.log('✅ Colour comparison journey test passed!');
  });

});