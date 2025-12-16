import { test, expect } from '@playwright/test';

// Fake host user so HostMessages sees a logged-in user
const fakeHostUser = {
  UserID: 1,
  Email: 'host@example.com',
  FullName: 'Host User',
  Role: 'Host',
};

test.describe('Host messages page', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((user) => {
      window.localStorage.setItem('user', JSON.stringify(user));
      window.localStorage.setItem('token', 'test-token');
    }, fakeHostUser);

    await page.goto('/host/messages');
  });

  test('shows messages layout with sidebar and main panel', async ({ page }) => {
    await expect(page.locator('.host-messages')).toBeVisible();
    await expect(page.locator('.messages-sidebar')).toBeVisible();
    await expect(page.locator('.messages-main')).toBeVisible();
  });

  test('shows messages header and search input', async ({ page }) => {
    const header = page.locator('.messages-sidebar-header');
    await expect(header).toBeVisible();

    const search = page.locator('.messages-search input');
    await expect(search).toBeVisible();
  });

  test('shows conversations list empty state or items', async ({ page }) => {
    const list = page.locator('.conversations-list');
    await expect(list).toBeVisible();

    const loading = list.getByText(/loading/i);
    const empty = list.getByText(/no messages yet/i);
    const item = list.locator('.conversation-item').first();

    await expect(loading.or(empty).or(item)).toBeVisible();
  });

  test('shows empty main panel prompt when no conversation selected', async ({ page }) => {
    const empty = page.locator('.messages-empty');
    await expect(empty).toBeVisible();
  });

  test('new chat button toggles new chat popover', async ({ page }) => {
    const newChatBtn = page.locator('.new-chat-button');
    await expect(newChatBtn).toBeVisible();

    await newChatBtn.click();
    await expect(page.locator('.new-chat-popover')).toBeVisible();
  });

  test('new chat popover has email input and submit button', async ({ page }) => {
    const newChatBtn = page.locator('.new-chat-button');
    await newChatBtn.click();

    const emailInput = page.locator('.new-chat-input');
    const submitBtn = page.locator('.new-chat-submit');

    await expect(emailInput).toBeVisible();
    await expect(submitBtn).toBeVisible();
  });
});


