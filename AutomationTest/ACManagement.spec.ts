import { test, expect } from '@playwright/test';

const TEST_USER_ID = 9001;
const TEST_TOKEN = 'mock-token-acct';
const TEST_USER = {
  UserID: TEST_USER_ID,
  FullName: 'Guest User',
  Email: 'guest.user@example.com',
  Phone: '0900000000',
  Nationality: 'Vietnam',
  Role: 'Guest',
};

const HOST_USER = {
  UserID: 9002,
  FullName: 'Host User',
  Email: 'host.user@example.com',
  Phone: '0901111111',
  Nationality: 'Vietnam',
  Role: 'Host',
  HostID: 77,
};

const OTP_CODE = '123456';

const maskEmail = (email) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 1);
  const stars = '*'.repeat(Math.max(local.length - 2, 2));
  return `${visible}${stars}${local.slice(-1)}@${domain}`;
};

async function setAuth(page, user = TEST_USER, token = TEST_TOKEN) {
  await page.addInitScript(({ u, t }) => {
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', t);
  }, { u: user, t: token });
}

async function stubUserFetch(page, user = TEST_USER) {
  await page.route(`**/api/user/${user.UserID}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user),
    });
  });

  await page.route('**/api/booking/user/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
}

test.describe('Account management - business requirements compliance', () => {
  test('BR-AM-01: Authenticated access required for account settings', async ({ page }) => {
    await page.goto('/account');
    await expect(page).toHaveURL(/\/login$/);

    await setAuth(page, TEST_USER);
    await stubUserFetch(page, TEST_USER);
    await page.goto('/account');
    await expect(page.getByRole('heading', { name: /account settings/i })).toBeVisible();
  });

  test('BR-AM-02: Account information is displayed and read-only in view mode', async ({ page }) => {
    await setAuth(page, TEST_USER);
    await stubUserFetch(page, TEST_USER);

    await page.goto('/account');
    await expect(page.getByRole('heading', { name: /personal information/i })).toBeVisible();

    const nameField = page.locator('.acct-field').filter({ hasText: 'Legal name' });
    const emailField = page.locator('.acct-field').filter({ hasText: 'Email address' });
    const phoneField = page.locator('.acct-field').filter({ hasText: 'Phone number' });

    await expect(nameField.locator('.acct-field-value')).toHaveText(TEST_USER.FullName);
    await expect(emailField.locator('.acct-field-value')).toHaveText(maskEmail(TEST_USER.Email));
    await expect(phoneField.locator('.acct-field-value')).toHaveText(TEST_USER.Phone);

    await expect(page.locator('.acct-card input')).toHaveCount(0);
  });

  test('BR-AM-03: Update profile information with OTP confirmation', async ({ page }) => {
    const updated = {
      fullName: 'Guest Updated',
      phone: '0911222333',
      nationality: 'Thailand',
    };

    await setAuth(page, TEST_USER);
    await stubUserFetch(page, TEST_USER);

    await page.route('**/api/user/**/profile/send-otp', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'OTP sent' }) });
    });

    await page.route('**/api/user/**/profile/verify-otp', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'OTP verified' }) });
    });

    let updateProfilePayload = null;
    await page.route('**/api/user/**/profile', async (route, request) => {
      updateProfilePayload = JSON.parse(request.postData() || '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });

    let updatePhonePayload = null;
    await page.route('**/api/user/**/phone', async (route, request) => {
      updatePhonePayload = JSON.parse(request.postData() || '{}');
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });

    await page.goto('/account');
    await page.locator('.acct-field').filter({ hasText: 'Legal name' }).locator('button.acct-link').click();

    await page.getByLabel('Legal name').fill(updated.fullName);
    await page.getByLabel('Phone number').fill(updated.phone);
    await page.getByLabel('Country/Residence').fill(updated.nationality);

    await page.locator('.acct-modal-actions .acct-primary').click();
    await expect(page.getByPlaceholder(/enter otp code/i)).toBeVisible();

    await page.getByPlaceholder(/enter otp code/i).fill(OTP_CODE);
    await page.locator('.acct-modal-actions .acct-primary').click();

    await expect(page.locator('.acct-banner.success')).toContainText(/personal information updated/i);
    expect(updateProfilePayload).toBeTruthy();
    expect(updatePhonePayload).toBeTruthy();
  });

  test('BR-AM-04: Validate profile update inputs', async ({ page }) => {
    await setAuth(page, TEST_USER);
    await stubUserFetch(page, TEST_USER);

    let sendOtpCount = 0;
    await page.route('**/api/user/**/profile/send-otp', async (route) => {
      sendOtpCount += 1;
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'OTP sent' }) });
    });

    await page.goto('/account');
    await page.locator('.acct-field').filter({ hasText: 'Legal name' }).locator('button.acct-link').click();

    const legalNameInput = page.getByLabel('Legal name');
    await legalNameInput.fill('');
    await page.locator('.acct-modal-actions .acct-primary').click();
    await expect(page.getByText(/name cannot be empty/i)).toBeVisible();

    await legalNameInput.fill('Guest User');
    await page.getByLabel('Phone number').fill('abc');
    await page.locator('.acct-modal-actions .acct-primary').click();
    await expect(page.getByText(/invalid phone number/i)).toBeVisible();

    expect(sendOtpCount).toBe(0);
  });

  test('BR-AM-05 & BR-AM-09: Change password with OTP and masked inputs', async ({ page }) => {
    await setAuth(page, TEST_USER);
    await stubUserFetch(page, TEST_USER);

    await page.route('**/api/user/**/profile/send-otp', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'OTP sent' }) });
    });

    await page.route('**/api/user/**/profile/verify-otp', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ message: 'OTP verified' }) });
    });

    await page.route('**/api/user/**/change-password', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    });

    await page.goto('/account');
    await page.getByRole('button', { name: /login & security/i }).click();
    await page.getByRole('button', { name: /change password/i }).click();

    const currentPwd = page.getByLabel('Current password', { exact: true });
    const newPwd = page.getByLabel('New password', { exact: true });
    const confirmPwd = page.getByLabel('Confirm new password', { exact: true });

    await expect(currentPwd).toHaveAttribute('type', 'password');
    await expect(newPwd).toHaveAttribute('type', 'password');
    await expect(confirmPwd).toHaveAttribute('type', 'password');

    await currentPwd.fill('oldpass');
    await newPwd.fill('newpass123');
    await confirmPwd.fill('newpass123');

    await page.locator('.acct-modal-actions .acct-primary').click();
    await expect(page.getByPlaceholder(/enter otp code/i)).toBeVisible();

    await page.getByPlaceholder(/enter otp code/i).fill(OTP_CODE);
    await page.locator('.acct-modal-actions .acct-primary').click();

    await expect(page.locator('.acct-banner.success')).toContainText(/password changed successfully/i);
  });

  test('BR-AM-06: Guest booking history shows tour details, dates, status, and amount', async ({ page }) => {
    await setAuth(page, TEST_USER);

    await page.route('**/api/booking/user/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            BookingID: 5001,
            PropertyID: 301,
            CheckIn: '2024-06-01',
            CheckOut: '2024-06-03',
            Status: 'Confirmed',
            TotalPrice: 250,
            Nights: 2,
            GuestsCount: 2,
          },
        ]),
      });
    });

    await page.route('**/api/properties/301', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          PropertyID: 301,
          listingTitle: 'Lake View Stay',
          location: 'Da Nang',
          Photos: [{ url: '/images/sample.jpg', SortIndex: 0 }],
        }),
      });
    });

    await page.goto('/trips');

    const dismiss = page.getByRole('button', { name: /close/i });
    if (await dismiss.isVisible().catch(() => false)) {
      await dismiss.click();
    }

    const tripCard = page.locator('.trip-card').first();
    await expect(tripCard).toBeVisible();
    await expect(tripCard.locator('.trip-title')).toContainText(/lake view stay/i);
    await expect(tripCard.locator('.trip-status')).toContainText(/confirmed/i);
    await expect(tripCard.locator('.trip-dates')).toBeVisible();
    await expect(tripCard.locator('.trip-price')).not.toHaveText('');
  });

  test('BR-AM-07 & BR-AM-08: Host dashboard overview loads within 5 seconds for host role', async ({ page }) => {
    await setAuth(page, HOST_USER);

    await page.route('**/api/booking/user/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/booking/host/**/dashboard', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          summary: {
            totalIncomeYTD: 1000,
            totalIncomeYTDChange: 5,
            incomeThisMonth: 200,
            incomeThisMonthChange: 2,
            bookingsThisMonth: 3,
            bookingsThisMonthChange: 1,
            upcomingBookings: 2,
          },
          yearlyStay: Array(12).fill(10),
          yearlyExp: Array(12).fill(5),
        }),
      });
    });

    const start = Date.now();
    await page.goto('/host/dashboard');
    await page.waitForResponse(/\/api\/booking\/host\/.*\/dashboard/);
    const duration = Date.now() - start;
    expect(duration).toBeLessThanOrEqual(5000);

    await expect(page.locator('.hostd-dashboard')).toBeVisible();
  });
});
