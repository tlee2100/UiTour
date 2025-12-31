import { test, expect } from '@playwright/test';

const TEST_FULL_NAME = 'E2E Signup User';
const TEST_EMAIL = 'e2e.signup.user@example.com';
const TEST_PHONE = '0123456789';
const TEST_PASSWORD = '123456';
const OTP_CODE = '123456';

async function fillSignupForm(page, overrides = {}) {
  const data = {
    fullName: TEST_FULL_NAME,
    email: TEST_EMAIL,
    phone: TEST_PHONE,
    password: TEST_PASSWORD,
    confirmPassword: TEST_PASSWORD,
    ...overrides,
  };

  await page.getByPlaceholder('Full Name').fill(data.fullName);
  await page.getByPlaceholder('Email').fill(data.email);
  await page.getByPlaceholder('Phone (optional)').fill(data.phone);
  await page.getByPlaceholder('Password', { exact: true }).fill(data.password);
  await page.getByPlaceholder('Confirm password', { exact: true }).fill(data.confirmPassword);
}

async function fillOtp(page, code = OTP_CODE) {
  const digits = code.split('');
  const inputs = page.locator('.otp-input');
  const count = await inputs.count();
  for (let i = 0; i < Math.min(digits.length, count); i += 1) {
    await inputs.nth(i).fill(digits[i]);
  }
}

test.describe('Sign up page - business requirements compliance', () => {
  test('BR-REGISTER-01 & BR-REGISTER-02: Registration interface and required inputs', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForSelector('.login-box', { timeout: 5000 });

    const fullNameInput = page.getByPlaceholder('Full Name');
    const emailInput = page.getByPlaceholder('Email');
    const phoneInput = page.getByPlaceholder('Phone (optional)');
    const passwordInput = page.getByPlaceholder('Password', { exact: true });
    const confirmPasswordInput = page.getByPlaceholder('Confirm password', { exact: true });
    const continueButton = page.locator('button.continue-btn');

    await expect(fullNameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
    await expect(continueButton).toBeVisible();
    await expect(continueButton).toBeEnabled();
  });

  test('BR-REGISTER-03 & BR-REGISTER-09: Client-side validation for password mismatch, short password, and email format', async ({ page }) => {
    await page.goto('/signup');

    await fillSignupForm(page, { password: '123456', confirmPassword: '654321' });
    await page.locator('button.continue-btn').click();
    await expect(page.getByText(/password confirmation does not match/i)).toBeVisible();

    await page.reload();
    await fillSignupForm(page, { password: '123', confirmPassword: '123' });
    await page.locator('button.continue-btn').click();
    await expect(page.getByText(/password must be at least 6/i)).toBeVisible();

    await page.reload();
    await fillSignupForm(page, { email: 'invalid-email' });
    const isEmailValid = await page.evaluate(() => {
      const input = document.querySelector('input[type="email"]');
      return input ? input.checkValidity() : false;
    });
    expect(isEmailValid).toBeFalsy();
  });

  test('BR-REGISTER-03 & BR-REGISTER-09: Existing email is rejected', async ({ page }) => {
    await page.route('**/api/user/send-otp', async (route) => {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Email already exists' }),
      });
    });

    await page.goto('/signup');
    await fillSignupForm(page);
    await page.locator('button.continue-btn').click();
    await expect(page.getByText(/email already exists|already.*registered|exists/i)).toBeVisible();
  });

  test('BR-REGISTER-04: Send confirmation email (OTP) on valid registration data', async ({ page }) => {
    await page.route('**/api/user/send-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'OTP sent' }),
      });
    });

    await page.goto('/signup');
    await fillSignupForm(page);

    const requestPromise = page.waitForRequest(/\/api\/user\/send-otp/);
    await page.locator('button.continue-btn').click();
    await requestPromise;

    await expect(page.getByRole('heading', { name: /verify email/i })).toBeVisible();
    await expect(page.locator('.otp-container')).toBeVisible();
  });

  test('BR-REGISTER-05 & BR-REGISTER-06 & BR-REGISTER-07 & BR-REGISTER-08 & BR-REGISTER-12: Verify OTP, create account, and navigate to login', async ({ page }) => {
    await page.route('**/api/user/send-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'OTP sent' }),
      });
    });

    await page.route('**/api/user/verify-otp', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'OTP verified' }),
      });
    });

    let registerPayload = null;
    await page.route('**/api/user/register', async (route, request) => {
      const postData = request.postData() || '{}';
      registerPayload = JSON.parse(postData);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1001, email: registerPayload.Email }),
      });
    });

    await page.goto('/signup');
    await fillSignupForm(page);
    await page.locator('button.continue-btn').click();
    await expect(page.getByRole('heading', { name: /verify email/i })).toBeVisible();

    await fillOtp(page);
    const verifyButton = page.locator('button.continue-btn');
    const start = Date.now();
    await Promise.all([
      page.waitForResponse((resp) => /\/api\/user\/register/.test(resp.url()) && resp.status() === 201),
      verifyButton.click(),
    ]);
    const durationMs = Date.now() - start;
    expect(durationMs).toBeLessThanOrEqual(5000);

    expect(registerPayload).toBeTruthy();
    expect(registerPayload.FullName).toBe(TEST_FULL_NAME);
    expect(registerPayload.Email).toBe(TEST_EMAIL);
    expect(registerPayload.Password).toBe(TEST_PASSWORD);

    await page.waitForURL(/\/login$/);
    await expect(page.getByPlaceholder('Email')).toBeVisible();
  });

  test('BR-REGISTER-06 & BR-REGISTER-10 & BR-REGISTER-13: Invalid or expired OTP shows error and allows resend', async ({ page }) => {
    await page.addInitScript(() => {
      const originalSetTimeout = window.setTimeout;
      window.setTimeout = (fn, ms, ...args) => originalSetTimeout(fn, Math.min(ms, 10), ...args);
    });

    let sendOtpCount = 0;
    await page.route('**/api/user/send-otp', async (route) => {
      sendOtpCount += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'OTP sent' }),
      });
    });

    await page.route('**/api/user/verify-otp', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'OTP expired' }),
      });
    });

    await page.goto('/signup');
    await fillSignupForm(page);
    await page.locator('button.continue-btn').click();
    await expect(page.getByRole('heading', { name: /verify email/i })).toBeVisible();

    await fillOtp(page, '000000');
    await page.locator('button.continue-btn').click();
    await expect(page.getByText(/otp|expired|invalid/i)).toBeVisible();
    await expect(page.locator('.otp-input').first()).toHaveValue('');

    const resendButton = page.locator('button.resend-otp-btn');
    await expect(resendButton).toBeVisible();
    await expect(resendButton).toBeEnabled({ timeout: 2000 });
    await resendButton.click();
    await page.waitForTimeout(50);
    expect(sendOtpCount).toBeGreaterThanOrEqual(2);
  });

  test('BR-REGISTER-11: Password input is masked and not exposed in UI text', async ({ page }) => {
    await page.goto('/signup');
    const passwordInput = page.getByPlaceholder('Password', { exact: true });
    await expect(passwordInput).toHaveAttribute('type', 'password');

    await passwordInput.fill(TEST_PASSWORD);
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain(TEST_PASSWORD);
  });
});
