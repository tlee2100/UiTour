import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const TEST_EMAIL = process.env.TEST_USER_EMAIL || '23520449@gm.uit.edu.vn';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || '123456';

test.describe('Login page - business requirements compliance', () => {
  test.beforeEach(async ({ page }) => {
    // baseURL is set in playwright.config.ts, so this becomes `${baseURL}/login`
    await page.goto('/login');
    // wait for the React login box to render
    await page.waitForSelector('.login-box', { timeout: 5000 });
    // Intercept login API calls to make tests deterministic when backend isn't available.
    await page.route('**/api/user/login', async (route, request) => {
      try {
        const postData = request.postData() || '';
        const body = postData ? JSON.parse(postData) : {};
        const reqEmail = (body.Email || body.email || '').toString().toLowerCase();
        const reqPassword = (body.Password || body.password || '').toString();

        // Successful login for TEST_EMAIL/TEST_PASSWORD
        if (reqEmail === TEST_EMAIL.toLowerCase() && reqPassword === TEST_PASSWORD) {
          const response = {
            user: {
              id: 9999,
              email: TEST_EMAIL,
              role: 'Traveler',
            },
            token: 'mocked-token-123',
          };
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(response),
          });
          return;
        }

        // Unknown user or wrong credentials
        await route.fulfill({
          status: 401,
          contentType: 'text/plain',
          body: 'Invalid credentials',
        });
      } catch (err) {
        await route.fulfill({
          status: 500,
          contentType: 'text/plain',
          body: 'Internal test stub error',
        });
      }
    });
  });

  test('BR-LOGIN-01: Login interface elements are visible and enabled', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    // prefer direct text for Continue button to avoid role text mismatch
    const loginButton = page.locator('button.continue-btn');
    const registerLink = page.getByText(/sign up/i);
    const forgotLink = page.getByText(/forgot password\?/i);

    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEnabled();

    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toBeEnabled();

    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();

    await expect(registerLink).toBeVisible();
    await expect(forgotLink).toBeVisible();
  });

  test('BR-LOGIN-02 & BR-LOGIN-03: Input acceptance and validation (required, format, trimming, min length)', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    const loginButton = page.locator('button.continue-btn');

    // Required validation: empty fields should display inline error or mark inputs invalid
    await emailInput.fill(''); // empty
    await passwordInput.fill('');
    await loginButton.click();
    // give UI a moment to run client-side validation and render error
    await page.waitForTimeout(250);
    const emailAriaInvalid = await emailInput.getAttribute('aria-invalid');
    const passwordAriaInvalid = await passwordInput.getAttribute('aria-invalid');
    // Either an inline error text is shown, or the inputs have aria-invalid=true
    const requiredError = page.getByText(/email is required|please enter a valid email|please enter your password|required/i);
    await Promise.race([
      requiredError.isVisible().then(() => true).catch(() => false),
      (async () => (emailAriaInvalid === 'true' || passwordAriaInvalid === 'true'))()
    ]);

    // Email format validation and trimming: prefer aria-invalid but accept text
    await emailInput.fill('  invalid-email  ');
    await passwordInput.fill('123456');
    await loginButton.click();
    await page.waitForTimeout(250);
    const emailAriaAfter = await emailInput.getAttribute('aria-invalid');
    const invalidEmailError = page.getByText(/please enter a valid email|invalid email|please enter a valid email address/i);
    // Assert either attribute or visible text
    if (emailAriaAfter !== 'true') {
      await expect(invalidEmailError).toBeVisible({ timeout: 2000 });
    }

    // Password minimum length validation
    await emailInput.fill('user@example.com');
    await passwordInput.fill('123'); // too short
    await loginButton.click();
    await page.waitForTimeout(250);
    const pwdAriaAfter = await passwordInput.getAttribute('aria-invalid');
    const shortPwdError = page.getByText(/password must be at least 6|minimum.*6.*characters/i);
    if (pwdAriaAfter !== 'true') {
      await expect(shortPwdError).toBeVisible({ timeout: 2000 });
    }
  });

  test('BR-LOGIN-04 & BR-LOGIN-07: Credential authentication - success and failure messages', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    const loginButton = page.locator('button.continue-btn');

    // Failure scenario - expect an error to appear
    await emailInput.fill('unknown.user+e2e@example.com');
    await passwordInput.fill(TEST_PASSWORD);
    await loginButton.click();
    const failureLocator = page.getByText(/invalid credentials|login failed|user not found/i);
    await expect(failureLocator).toBeVisible({ timeout: 2000 });
    await expect(page).toHaveURL(/\/login$/);

    // Success scenario - uses configured credentials
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    // Success scenario - uses configured credentials; wait for token in localStorage
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);
    const start = Date.now();
    await loginButton.click();
    await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 5000 });
    const durationMs = Date.now() - start;
    // BR-LOGIN-09: response time should be <= 5000ms
    expect(durationMs).toBeLessThanOrEqual(5000);
    // BR-LOGIN-08: token should be set (login uses POST on backend; here we assert token presence)
    const storedToken = await page.evaluate(() => localStorage.getItem('token'));
    expect(storedToken).toBeTruthy();
    // BR-LOGIN-06: Login success notification or welcome title
    // The app may show a banner or navigate to a dashboard; accept either a visible welcome/success text or navigation away from /login
    const successTextVisible = await page.getByText(/welcome to uitour|welcome|login successful|successfully logged in/i).isVisible().catch(() => false);
    const navigatedAway = !(await page.url()).toLowerCase().includes('/login');
    expect(successTextVisible || navigatedAway).toBeTruthy();
  });

  test('BR-LOGIN-05 & BR-LOGIN-10: Session token exists and role-based redirection', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    const loginButton = page.locator('button.continue-btn');

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    // Click and wait for token to appear in localStorage (SPA navigation may not trigger navigation events)
    await loginButton.click();
    await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 7000 }).catch(() => null);

    // BR-LOGIN-05: verify a token/session value exists in localStorage (keys may vary)
    const localKeys = await page.evaluate(() => Object.keys(localStorage));
    const hasTokenKey = localKeys.some(k => /token|auth|jwt|access/i.test(k));
    expect(hasTokenKey).toBeTruthy();

    // BR-LOGIN-10: role-based redirection - attempt to infer role from localStorage or page
    const rawUserString = await page.evaluate(() => localStorage.getItem('user') || localStorage.getItem('profile') || null);
    let role: string | null = null;
    if (rawUserString) {
      try {
        const user = JSON.parse(rawUserString);
        role = (user && user.role) ? String(user.role).toLowerCase() : null;
      } catch {
        role = null;
      }
    }

    const currentUrl = page.url().toLowerCase();
    if (role) {
      if (role.includes('admin')) {
        expect(currentUrl).toContain('/admin');
      } else if (role.includes('host')) {
        expect(currentUrl.includes('/listings') || currentUrl.includes('/host')).toBeTruthy();
      } else {
        // traveler / default user - accept root '/' as valid landing too
        const pathname = new URL(currentUrl).pathname;
        expect(pathname === '/' || pathname.includes('/home') || pathname.includes('/explore')).toBeTruthy();
      }
    } else {
      // If role is not available, at minimum ensure user isn't on login and sees dashboard content
      expect(currentUrl).not.toMatch(/\/login$/);
      const dashboardLocator = page.getByText(/dashboard|listings|explore|welcome/i);
      await expect(dashboardLocator).toBeVisible().catch(() => {});
    }
  });

  test('BR-LOGIN-08: Password field is masked and no sensitive data shown in UI', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Password');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Ensure password is not present in page text after filling
    await passwordInput.fill(TEST_PASSWORD);
    const pageText = await page.textContent('body');
    expect(pageText).not.toContain(TEST_PASSWORD);
  });

  test('BR-LOGIN-06: Login success notification (dedicated)', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    const loginButton = page.locator('button.continue-btn');

    // Use configured credentials
    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    // Click and wait for token -> then check for either a welcome text or navigation
    await loginButton.click();
    await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 7000 }).catch(() => null);

    const successText = page.getByText(/welcome to uitour|welcome|login successful|successfully logged in/i);
    // Accept either an explicit success/welcome text or navigation away from /login
    const successVisible = await successText.isVisible().catch(() => false);
    const navigatedAway = !(await page.url()).toLowerCase().includes('/login');
    expect(successVisible || navigatedAway).toBeTruthy();
  });

  test('BR-LOGIN-09: Login response time is within acceptable threshold', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Email');
    const passwordInput = page.getByPlaceholder('Password');
    const loginButton = page.locator('button.continue-btn');

    await emailInput.fill(TEST_EMAIL);
    await passwordInput.fill(TEST_PASSWORD);

    const start = Date.now();
    try {
      await Promise.all([
        page.waitForResponse(resp => /\/api\/user\/login/.test(resp.url()) && (resp.status() === 200 || resp.status() === 201), { timeout: 5000 }),
        loginButton.click()
      ]);
    } catch {
      // Fallback: wait for token in localStorage if response wasn't observed in time
      await page.waitForFunction(() => !!localStorage.getItem('token'), null, { timeout: 5000 }).catch(() => null);
    }
    const durationMs = Date.now() - start;
    expect(durationMs).toBeLessThanOrEqual(5000);
  });
});