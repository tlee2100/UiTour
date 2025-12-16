import { test, expect } from '@playwright/test';

// Fake authenticated user for profile tests – avoids depending on backend login
const fakeUser = {
  UserID: 1,
  Email: '23520449@gm.uit.edu.vn',
  FullName: 'Test User',
  Role: 'Guest',
};
const fakeToken = 'test-token';

test.describe('Profile page', () => {
  test.beforeEach(async ({ page }) => {
    // Pre-seed localStorage so AppContext and RequireAuth see an authenticated user
    await page.addInitScript((user, token) => {
      window.localStorage.setItem('user', JSON.stringify(user));
      window.localStorage.setItem('token', token);
    }, fakeUser, fakeToken);

    await page.goto('/profile');
  });

  test('shows basic profile header', async ({ page }) => {
    await expect(page.locator('.profile-page')).toBeVisible();
    await expect(page.locator('.profile-title')).toBeVisible();
    await expect(page.locator('.profile-avatar-large, .profile-avatar')).toBeVisible();
  });

  test('has About, Trips and Connections tabs', async ({ page }) => {
    const tabs = page.locator('.profile-nav-item');
    await expect(tabs.nth(0)).toBeVisible(); // About
    await expect(tabs.nth(1)).toBeVisible(); // Trips
    await expect(tabs.nth(2)).toBeVisible(); // Connections
  });

  test('clicking Edit profile button navigates to edit page', async ({ page }) => {
    const editBtn = page.locator('.profile-primary-btn').first();
    await expect(editBtn).toBeVisible();
    await editBtn.click();

    await expect(page).toHaveURL(/\/profile\/edit$/);
  });

  test('Trips tab shows empty state or trip list', async ({ page }) => {
    const tabs = page.locator('.profile-nav-item');
    await tabs.nth(1).click(); // Trips

    const emptyState = page.locator('.profile-empty-state');
    const tripList = page.locator('.profile-trips-list');

    await expect(emptyState.or(tripList)).toBeVisible();
  });

  test('Connections tab shows empty connections state', async ({ page }) => {
    const tabs = page.locator('.profile-nav-item');
    await tabs.nth(2).click(); // Connections

    const emptyState = page.locator('.profile-empty-state');
    await expect(emptyState).toBeVisible();
  });

  test('Book a trip button from trips or connections goes back to home', async ({ page }) => {
    const tabs = page.locator('.profile-nav-item');

    // Try from trips tab first
    await tabs.nth(1).click(); // Trips
    let bookBtn = page.locator('.profile-trips-section .profile-primary-btn').first();

    if (await bookBtn.count()) {
      await bookBtn.click();
      await expect(page).toHaveURL('/');
      return;
    }

    // Fallback: check from connections tab
    await page.goto('/profile');
    await tabs.nth(2).click(); // Connections
    bookBtn = page.locator('.profile-empty-state .profile-primary-btn').first();
    if (await bookBtn.count()) {
      await bookBtn.click();
      await expect(page).toHaveURL('/');
    }
  });
});


