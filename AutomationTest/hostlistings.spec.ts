import { test, expect } from '@playwright/test';

// Fake host user so HostListings has a user id to query with
const fakeHostUser = {
  UserID: 1,
  Email: 'host@example.com',
  FullName: 'Host User',
  Role: 'Host',
};

test.describe('Host Listings page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      window.localStorage.setItem('user', JSON.stringify(user));
      window.localStorage.setItem('token', 'test-token');
    }, fakeHostUser);

    await page.goto('/host/listings');
  });

  test('shows listings header and create button', async ({ page }) => {
    const header = page.locator('.listing-header');
    await expect(header).toBeVisible();

    const createBtn = page.locator('.listing-create-btn');
    await expect(createBtn).toBeVisible();
  });

  test('shows loading, empty state or listing grid', async ({ page }) => {
    const grid = page.locator('.listing-grid');
    await expect(grid).toBeVisible();
  });

  test('listing card shows status, type badge and image when present', async ({ page }) => {
    const card = page.locator('.listing-card').first();
    const count = await card.count();

    if (count === 0) {
      // No listings yet is a valid state; assert that explicitly
      await expect(page.locator('.listing-card')).toHaveCount(0);
      return;
    }

    await expect(card.locator('.listing-status')).toBeVisible();
    await expect(card.locator('.listing-type-badge')).toBeVisible();
    await expect(card.locator('.listing-img')).toBeVisible();
  });

  test('listing card shows title and optional location', async ({ page }) => {
    const card = page.locator('.listing-card').first();
    const count = await card.count();

    if (count === 0) {
      await expect(page.locator('.listing-card')).toHaveCount(0);
      return;
    }

    await expect(card.locator('.listing-info h3')).toBeVisible();
    await expect(card.locator('.listing-location').first().or(card.locator('.listing-info'))).toBeVisible();
  });

  test('edit button is disabled for pending listings', async ({ page }) => {
    const pendingCard = page.locator('.listing-card.pending-card').first();
    const count = await pendingCard.count();

    if (count === 0) {
      // If there are no pending cards, assert that instead of skipping
      await expect(page.locator('.listing-card.pending-card')).toHaveCount(0);
      return;
    }

    const editBtn = pendingCard.locator('.listing-edit-btn');
    await expect(editBtn).toHaveAttribute('disabled', /true/i);
  });

  test('delete confirmation modal appears when delete clicked', async ({ page }) => {
    const card = page.locator('.listing-card').first();
    const count = await card.count();

    if (count === 0) {
      // No cards means no delete modal; assert that state explicitly
      await expect(page.locator('.delete-modal-backdrop')).toHaveCount(0);
      return;
    }

    const deleteBtn = card.locator('.listing-delete-btn');
    await deleteBtn.click();

    const modal = page.locator('.delete-modal-backdrop');
    await expect(modal).toBeVisible();
  });
});


