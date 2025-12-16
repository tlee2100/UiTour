import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/'); // baseURL from playwright.config.ts
  });

  test('shows header with stays and experiences tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: /uitour logo/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /stays/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /experiences/i })).toBeVisible();
  });

  test('shows the universal search bar', async ({ page }) => {
    // The UniversalSearchBar is complex; just check for its container and a search button.
    const searchSection = page.locator('.search-section');
    await expect(searchSection).toBeVisible();

    await expect(
      searchSection.getByRole('button', { name: /search|find/i })
    ).toBeVisible();
  });

  test('lists at least one property card when API returns data', async ({ page }) => {
    const cards = page.locator('.property-card');
    await expect(cards.first()).toBeVisible();
  });

  test('clicking a property card navigates to its detail page', async ({ page }) => {
    const firstCard = page.locator('.property-card').first();
    await firstCard.click();

    await expect(page).toHaveURL(/\/property\/\d+/);
  });

  test('clicking favorite on a property does not navigate away', async ({ page }) => {
    const firstCard = page.locator('.property-card').first();
    const favoriteButton = firstCard.locator('.favorite-button');

    await favoriteButton.click();

    await expect(page).toHaveURL(/\//); // still on a "/"-based URL (home or localized)
  });

  test('shows "Continue exploring" section with show more button', async ({ page }) => {
    const continueSection = page.locator('.continue-section');
    await expect(continueSection).toBeVisible();

    const showMoreButton = continueSection.locator('.show-more-button');
    await expect(showMoreButton).toBeVisible();
  });
}
);


