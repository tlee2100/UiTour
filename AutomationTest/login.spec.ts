import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const email = process.env.TEST_USER_EMAIL || '23520449@gm.uit.edu.vn';
const password = process.env.TEST_USER_PASSWORD || '123456';

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    // baseURL is set in playwright.config.ts, so this becomes `${baseURL}/login`
    await page.goto('/login');
  });

  test('logs in with configured credentials', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill(password);

    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(page).not.toHaveURL(/\/login$/);
  });

  test('shows error for wrong password', async ({ page }) => {
    await page.getByPlaceholder('Email').fill(email);
    await page.getByPlaceholder('Password').fill('wrong-password');

    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(
      page.getByText(/invalid credentials|login failed|user not found/i)
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('shows error for unknown email', async ({ page }) => {
    await page.getByPlaceholder('Email').fill('unknown.user+e2e@example.com');
    await page.getByPlaceholder('Password').fill(password);

    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await expect(
      page.getByText(/invalid credentials|login failed|user not found/i)
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('forgot password link opens modal', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password\?/i }).click();

    await expect(
      page.getByText(/enter your email address and we'll send you a link to reset your password\./i)
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /send reset link/i })
    ).toBeVisible();
  });

  test('forgot password modal can be closed', async ({ page }) => {
    await page.getByRole('link', { name: /forgot password\?/i }).click();

    const modal = page.locator('.forgot-password-modal');
    await expect(modal).toBeVisible();

    await page.locator('.forgot-password-modal-close').click();

    await expect(modal).toHaveCount(0);
  });

  test('signup link navigates to signup page', async ({ page }) => {
    await page.getByRole('link', { name: /sign up/i }).click();

    await expect(page).toHaveURL(/\/signup$/);
  });
});
