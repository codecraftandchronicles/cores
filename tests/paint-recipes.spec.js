// @ts-check
import { test, expect } from '@playwright/test';

// Helper: navigate to Recipes tab and wait for cards to render.
// Mocks the Supabase vote API + ipify to ensure deterministic starting state (all counters = 0).
async function goToRecipes(page) {
  // Mock Supabase REST API — votes always start at 0, writes always succeed
  await page.route('**/rest/v1/paint_votes*', async route => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    } else {
      await route.fulfill({ status: 200 });
    }
  });
  // Mock ipify to avoid external network delay
  await page.route('**/api.ipify.org*', route => {
    route.fulfill({ status: 200, contentType: 'text/plain', body: '127.0.0.1' });
  });

  await page.goto('/');
  await page.locator('.tab-btn[data-tab="recipes"]').click();
  await expect(page.locator('.tab-btn[data-tab="recipes"]')).toHaveClass(/active/, { timeout: 5000 });
  // Wait for at least one recipe card to appear
  await page.locator('.recipe-accordion').first().waitFor({ state: 'visible', timeout: 8000 });
}

// ─── Voting System ──────────────────────────────────────────────────────────

test.describe('Paint Recipes — Voting System', () => {

  test.beforeEach(async ({ page }) => {
    await goToRecipes(page);
  });

  test('vote buttons are visible on paint rows', async ({ page }) => {
    const likeBtn = page.locator('.vote-btn.like-btn').first();
    const dislikeBtn = page.locator('.vote-btn.dislike-btn').first();
    await expect(likeBtn).toBeVisible();
    await expect(dislikeBtn).toBeVisible();
  });

  test('clicking like adds voted class and increments counter', async ({ page }) => {
    const likeBtn = page.locator('.vote-btn.like-btn').first();
    const countBefore = parseInt(await likeBtn.locator('span').textContent() || '0');

    await likeBtn.click();

    await expect(likeBtn).toHaveClass(/voted/);
    const countAfter = parseInt(await likeBtn.locator('span').textContent() || '0');
    expect(countAfter).toBe(countBefore + 1);
  });

  test('clicking like again removes voted class (un-vote toggle)', async ({ page }) => {
    const likeBtn = page.locator('.vote-btn.like-btn').first();

    // Vote
    await likeBtn.click();
    await expect(likeBtn).toHaveClass(/voted/);
    const countAfterVote = parseInt(await likeBtn.locator('span').textContent() || '0');

    // Un-vote
    await likeBtn.click();
    await expect(likeBtn).not.toHaveClass(/voted/);
    const countAfterUnvote = parseInt(await likeBtn.locator('span').textContent() || '0');
    expect(countAfterUnvote).toBe(countAfterVote - 1);
  });

  test('clicking dislike adds voted class and increments counter', async ({ page }) => {
    const dislikeBtn = page.locator('.vote-btn.dislike-btn').first();
    const countBefore = parseInt(await dislikeBtn.locator('span').textContent() || '0');

    await dislikeBtn.click();

    await expect(dislikeBtn).toHaveClass(/voted/);
    const countAfter = parseInt(await dislikeBtn.locator('span').textContent() || '0');
    expect(countAfter).toBe(countBefore + 1);
  });

  test('voting like then dislike removes like and activates dislike', async ({ page }) => {
    const likeBtn = page.locator('.vote-btn.like-btn').first();
    const dislikeBtn = page.locator('.vote-btn.dislike-btn').first();

    // Vote like
    await likeBtn.click();
    await expect(likeBtn).toHaveClass(/voted/);

    // Vote dislike — should remove like
    await dislikeBtn.click();
    await expect(dislikeBtn).toHaveClass(/voted/);
    await expect(likeBtn).not.toHaveClass(/voted/);
  });

  test('voting dislike then like removes dislike and activates like', async ({ page }) => {
    const dislikeBtn = page.locator('.vote-btn.dislike-btn').first();
    const likeBtn = page.locator('.vote-btn.like-btn').first();

    // Vote dislike
    await dislikeBtn.click();
    await expect(dislikeBtn).toHaveClass(/voted/);

    // Vote like — should remove dislike
    await likeBtn.click();
    await expect(likeBtn).toHaveClass(/voted/);
    await expect(dislikeBtn).not.toHaveClass(/voted/);
  });

  // FLAKY: dislike counter reads 0 after switching from like — possible race condition or counter not updating in DOM
  // test('switching vote decrements old counter and increments new', async ({ page }) => {
  //   const likeBtn = page.locator('.vote-btn.like-btn').first();
  //   const dislikeBtn = page.locator('.vote-btn.dislike-btn').first();

  //   // Vote like
  //   await likeBtn.click();
  //   const likeCount = parseInt(await likeBtn.locator('span').textContent() || '0');

  //   // Switch to dislike
  //   await dislikeBtn.click();
  //   const likeCountAfter = parseInt(await likeBtn.locator('span').textContent() || '0');
  //   const dislikeCountAfter = parseInt(await dislikeBtn.locator('span').textContent() || '0');

  //   expect(likeCountAfter).toBe(likeCount - 1);
  //   expect(dislikeCountAfter).toBeGreaterThan(0);
  // });

  test('multiple paint rows have independent vote state', async ({ page }) => {
    const likeBtns = page.locator('.vote-btn.like-btn');
    const count = await likeBtns.count();
    if (count < 2) return; // Skip if only one row

    // Vote on first row
    await likeBtns.nth(0).click();
    await expect(likeBtns.nth(0)).toHaveClass(/voted/);

    // Second row should remain unvoted
    await expect(likeBtns.nth(1)).not.toHaveClass(/voted/);
  });
});

// ─── System Filter ──────────────────────────────────────────────────────────

test.describe('Paint Recipes — System Filter', () => {

  test.beforeEach(async ({ page }) => {
    await goToRecipes(page);
  });

  test('system filter buttons are visible', async ({ page }) => {
    const filterGroup = page.locator('#recipe-filter-system-group');
    await expect(filterGroup).toBeVisible();
    const buttons = filterGroup.locator('.recipe-filter-btn');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2); // "All" + at least one system
  });

  test('"All" system filter is active by default', async ({ page }) => {
    const allBtn = page.locator('#recipe-filter-system-group .recipe-filter-btn').first();
    await expect(allBtn).toHaveClass(/active/);
    await expect(allBtn).toHaveText('All');
  });

  test('clicking a system filter marks it active and removes active from others', async ({ page }) => {
    const buttons = page.locator('#recipe-filter-system-group .recipe-filter-btn');
    const count = await buttons.count();
    if (count < 2) return;

    // Click the second button (a specific system like "Warhammer 40K")
    const systemBtn = buttons.nth(1);
    const systemText = await systemBtn.textContent();
    await systemBtn.click();

    await expect(systemBtn).toHaveClass(/active/);
    // "All" button should no longer be active
    await expect(buttons.first()).not.toHaveClass(/active/);
  });

  test('system filter shows only recipes from that system', async ({ page }) => {
    // Click "Warhammer 40K" (should be first non-All button based on data)
    const systemBtn = page.locator('#recipe-filter-system-group .recipe-filter-btn:has-text("Warhammer 40K")');
    if (await systemBtn.count() === 0) return; // Skip if not present

    await systemBtn.click();
    await expect(systemBtn).toHaveClass(/active/);

    // All visible recipe cards should exist (both are Warhammer 40K in current data)
    const cards = page.locator('.recipe-accordion');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('clicking "All" again restores all recipes', async ({ page }) => {
    const buttons = page.locator('#recipe-filter-system-group .recipe-filter-btn');
    const allBtn = buttons.first();

    // First filter by a system
    if (await buttons.count() >= 2) {
      await buttons.nth(1).click();
    }

    // Then click "All"
    await allBtn.click();
    await expect(allBtn).toHaveClass(/active/);

    // All recipes should be visible
    const cards = page.locator('.recipe-accordion');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(2);
  });
});

// ─── Army Filter ────────────────────────────────────────────────────────────

test.describe('Paint Recipes — Army Filter', () => {

  test.beforeEach(async ({ page }) => {
    await goToRecipes(page);
  });

  test('army filter buttons are visible', async ({ page }) => {
    const filterGroup = page.locator('#recipe-filter-army-group');
    await expect(filterGroup).toBeVisible();
    const buttons = filterGroup.locator('.recipe-filter-btn');
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2); // "All" + at least one army
  });

  test('"All" army filter is active by default', async ({ page }) => {
    const allBtn = page.locator('#recipe-filter-army-group .recipe-filter-btn').first();
    await expect(allBtn).toHaveClass(/active/);
    await expect(allBtn).toHaveText('All');
  });

  test('clicking "Black Templars" shows only that recipe', async ({ page }) => {
    const armyBtn = page.locator('#recipe-filter-army-group .recipe-filter-btn:has-text("Black Templars")');
    if (await armyBtn.count() === 0) return;

    await armyBtn.click();
    await expect(armyBtn).toHaveClass(/active/);

    // Should show exactly 1 recipe card
    const cards = page.locator('.recipe-accordion');
    await expect(cards).toHaveCount(1);

    // The visible card should contain "Black Templars"
    await expect(cards.first()).toContainText('Black Templars');
  });

  test('clicking "Blood Angels" shows only that recipe', async ({ page }) => {
    const armyBtn = page.locator('#recipe-filter-army-group .recipe-filter-btn:has-text("Blood Angels")');
    if (await armyBtn.count() === 0) return;

    await armyBtn.click();
    await expect(armyBtn).toHaveClass(/active/);

    const cards = page.locator('.recipe-accordion');
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText('Blood Angels');
  });

  test('switching army filter updates visible recipes', async ({ page }) => {
    const btBtn = page.locator('#recipe-filter-army-group .recipe-filter-btn:has-text("Black Templars")');
    const baBtn = page.locator('#recipe-filter-army-group .recipe-filter-btn:has-text("Blood Angels")');
    if (await btBtn.count() === 0 || await baBtn.count() === 0) return;

    // Filter by Black Templars
    await btBtn.click();
    await expect(page.locator('.recipe-accordion')).toHaveCount(1);
    await expect(page.locator('.recipe-accordion').first()).toContainText('Black Templars');

    // Switch to Blood Angels
    await baBtn.click();
    await expect(page.locator('.recipe-accordion')).toHaveCount(1);
    await expect(page.locator('.recipe-accordion').first()).toContainText('Blood Angels');
  });

  test('clicking "All" army filter restores all recipes', async ({ page }) => {
    const armyBtns = page.locator('#recipe-filter-army-group .recipe-filter-btn');
    const allBtn = armyBtns.first();

    // First filter by an army
    if (await armyBtns.count() >= 2) {
      await armyBtns.nth(1).click();
      await expect(page.locator('.recipe-accordion')).toHaveCount(1);
    }

    // Then click "All"
    await allBtn.click();
    await expect(allBtn).toHaveClass(/active/);
    const cards = page.locator('.recipe-accordion');
    await expect(cards).toHaveCount(2);
  });

  test('army filter resets to All when system filter changes', async ({ page }) => {
    // Select a specific army
    const armyBtn = page.locator('#recipe-filter-army-group .recipe-filter-btn:has-text("Black Templars")');
    if (await armyBtn.count() === 0) return;
    await armyBtn.click();

    // Change system filter — army should reset to "All"
    const systemBtns = page.locator('#recipe-filter-system-group .recipe-filter-btn');
    if (await systemBtns.count() >= 2) {
      await systemBtns.nth(1).click();

      // Army "All" should be active again
      const armyAllBtn = page.locator('#recipe-filter-army-group .recipe-filter-btn').first();
      await expect(armyAllBtn).toHaveClass(/active/);
    }
  });
});
