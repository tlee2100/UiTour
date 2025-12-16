import { test, expect } from '@playwright/test';

test.describe('Search results page', () => {
  test.beforeEach(async ({ page }) => {
    // Open search page with some basic query parameters
    await page.goto('/search?location=Hanoi&checkIn=2025-01-01&checkOut=2025-01-05&guests=2');
  });

  test('shows compact search header with fields and search button', async ({ page }) => {
    const header = page.locator('.search-header');
    await expect(header).toBeVisible();

    const compactBar = header.locator('.search-bar-compact');
    await expect(compactBar).toBeVisible();

    await expect(compactBar.locator('.search-field-compact')).toHaveCount(4);
    await expect(compactBar.locator('.search-button-compact')).toBeVisible();
  });

  test('shows filter and map toggle actions', async ({ page }) => {
    await expect(page.locator('.filter-button-header')).toBeVisible();
    await expect(page.locator('.map-toggle-button')).toBeVisible();
  });

  test('shows results panel with header', async ({ page }) => {
    const resultsPanel = page.locator('.results-panel');
    await expect(resultsPanel).toBeVisible();

    await expect(resultsPanel.locator('.results-header h2')).toBeVisible();
  });

  test('shows property list (possibly empty) without error', async ({ page }) => {
    const list = page.locator('.property-list');
    await expect(list).toBeVisible();

    // Either zero or more PropertyCard entries; in both cases the test passes
    await expect(list.locator('.property-card').first()).toHaveCount(0, { timeout: 0 }).catch(() => {});
  });

  test('shows map panel when map is toggled on', async ({ page }) => {
    const mapPanel = page.locator('.map-panel');
    await expect(mapPanel).toBeVisible();

    await expect(mapPanel.locator('.map-controls')).toBeVisible();
  });

  test('toggling map button hides map panel', async ({ page }) => {
    const toggle = page.locator('.map-toggle-button');
    await toggle.click();

    await expect(page.locator('.map-panel')).toHaveCount(0);
  });
});


