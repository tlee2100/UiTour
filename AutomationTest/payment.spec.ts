import { test, expect } from '@playwright/test';

// Seed auth so RequireAuth (if used) sees a logged-in user
const fakeUser = {
  UserID: 1,
  Email: '23520449@gm.uit.edu.vn',
  FullName: 'Test User',
  Role: 'Guest',
};

test.describe('Payment page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      window.localStorage.setItem('user', JSON.stringify(user));
      window.localStorage.setItem('token', 'test-token');
    }, fakeUser);

    await page.goto('/payment');
  });

  test('redirects to home when no booking data is provided', async ({ page }) => {
    // PaymentPage immediately navigates away if it has no booking context
    await expect(page).toHaveURL('/');
  });

  test('does not render payment layout when redirected', async ({ page }) => {
    await expect(page.locator('.payment-page')).toHaveCount(0);
    await expect(page.locator('.payment-container')).toHaveCount(0);
  });

  test('does not render booking summary when booking is missing', async ({ page }) => {
    await expect(page.locator('.booking-summary')).toHaveCount(0);
  });

  test('does not render payment methods when booking is missing', async ({ page }) => {
    await expect(page.locator('.payment-methods')).toHaveCount(0);
  });

  test('can revisit payment page and still see fallback view', async ({ page }) => {
    await page.goto('/');
    await page.goto('/payment');

    // Still redirected back to home with no payment markup
    await expect(page).toHaveURL('/');
    await expect(page.locator('.payment-page')).toHaveCount(0);
  });
});

