import { test, expect } from '@playwright/test';

async function openFirstProperty(page) {
  // Start from main home page where property cards are listed
  await page.goto('/');

  const cards = page.locator('.property-card');
  await expect(cards.first()).toBeVisible();
  await cards.first().click();
  await expect(page).toHaveURL(/\/property\/\d+/);
}

test.describe('HomeInfoPage (property detail)', () => {
  test('opens from home page and shows gallery and booking box', async ({ page }) => {
    await openFirstProperty(page);

    await expect(page.locator('.gallery-container')).toBeVisible();
    await expect(page.locator('.hib-booking-box')).toBeVisible();
  });

  test('opens gallery modal when an image is clicked', async ({ page }) => {
    await openFirstProperty(page);

    const firstImage = page.locator('.gallery-item').first();
    await firstImage.click();

    const modal = page.locator('.gallery-modal');
    await expect(modal).toBeVisible();
    await expect(page.locator('.gallery-close')).toBeVisible();
  });

  test('booking box shows price and book button', async ({ page }) => {
    await openFirstProperty(page);

    const bookingBox = page.locator('.hib-booking-box');
    await expect(bookingBox).toBeVisible();

    await expect(bookingBox.locator('.hib-price-value')).toBeVisible();
    await expect(bookingBox.locator('.hib-book-button')).toBeVisible();
  });

  test('amenities section is rendered', async ({ page }) => {
    await openFirstProperty(page);

    const amenitiesSection = page.locator('.content-amen');
    await expect(amenitiesSection).toBeVisible();

    // Either has items or shows the "empty" fallback
    await expect(
      amenitiesSection.locator('.content-amen-body, .content-amen-empty')
    ).toBeVisible();
  });

  test('calendar section is visible on detail page', async ({ page }) => {
    await openFirstProperty(page);

    const calendarSection = page.locator('.content-calendar-section');
    await expect(calendarSection).toBeVisible();
  });

  test('property map and external map button are visible', async ({ page }) => {
    await openFirstProperty(page);

    const mapContainer = page.locator('.property-map-container');
    await mapContainer.scrollIntoViewIfNeeded();
    await expect(mapContainer).toBeVisible({ timeout: 15000 });

    const externalBtn = mapContainer.locator('.map-action-btn');
    await expect(externalBtn).toBeVisible({ timeout: 15000 });
  });
});


