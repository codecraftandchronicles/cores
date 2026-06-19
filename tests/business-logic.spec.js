// @ts-check
import { test, expect } from '@playwright/test';

test.describe('CORES Project - Essential Business Logic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for initial data loading
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.tab-btn', { state: 'visible' });
  });




});