import { test, expect } from '@playwright/test';

test.describe('Search Functionality - BR-SF', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Stub properties API to return deterministic data for tests (match both /api/properties and /api/properties/search)
    await page.route(/\/api\/properties/, async (route) => {
      const mockProperties = [
        {
          propertyID: 1,
          listingTitle: 'Test Stay in Hanoi',
          location: 'Hanoi',
          price: 150,
          photos: [{ url: '/images/test.jpg' }],
          reviews: [{ rating: 4 }, { rating: 5 }]
        },
        {
          propertyID: 2,
          listingTitle: 'Another Stay in Hanoi',
          location: 'Hanoi',
          price: 250,
          photos: [{ url: '/images/test2.jpg' }],
          reviews: [{ rating: 4 }]
        }
      ];

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockProperties)
      });
    });
  });

  /**
   * BR-SF-01: Access Search Function
   */
  test('BR-SF-01: User can access search results page', async ({ page }) => {
    await page.goto('/search?location=Hanoi');
    await expect(page).toHaveURL(/search/);
    await expect(page.locator('.results-panel')).toBeVisible();
  });

  /**
   * BR-SF-02: Keyword Search
   */
  test('BR-SF-02: Search tours by keyword', async ({ page }) => {
    await page.goto('/search?keyword=Hanoi');
    await page.waitForSelector('.results-panel');
    const cards = page.locator('.property-card-result');
    const count = await cards.count();
    if (count > 0) {
      await expect(cards.first()).toBeVisible();
    } else {
      // If no cards, assert header shows 0 results
      await expect(page.locator('.results-header')).toContainText(/0\+ stays in/i);
    }

  });

  /**
   * BR-SF-03: Filter by Location
   */
  test('BR-SF-03: Filter tours by location', async ({ page }) => {
    await page.goto('/search?location=Hanoi');
    await page.waitForSelector('.results-panel');
    await expect(page.locator('.results-header')).toContainText('Hanoi');
  });

  /**
   * BR-SF-04: Filter by Price Range
   */
  test('BR-SF-04: Filter tours by price range', async ({ page }) => {
    await page.goto('/search?minPrice=100&maxPrice=300');
    const prices = page.locator('.property-card .price');

    const count = await prices.count();
    for (let i = 0; i < count; i++) {
      const priceText = await prices.nth(i).innerText();
      const price = Number(priceText.replace(/\D/g, ''));
      expect(price).toBeGreaterThanOrEqual(100);
      expect(price).toBeLessThanOrEqual(300);
    }
  });

  /**
   * BR-SF-05: Filter by Date Availability
   */
  test('BR-SF-05: Filter tours by available dates', async ({ page }) => {
  await page.goto('/search?checkIn=2025-01-01&checkOut=2025-01-05');
  await expectSearchResultOrEmpty(page);
});


  /**
   * BR-SF-06: Filter by Rating
   */
  test('BR-SF-06: Filter tours by rating', async ({ page }) => {
    await page.goto('/search?rating=4');
    const ratings = page.locator('.property-card .rating');

    const count = await ratings.count();
    for (let i = 0; i < count; i++) {
      const rating = Number(await ratings.nth(i).innerText());
      expect(rating).toBeGreaterThanOrEqual(4);
    }
  });

  /**
   * BR-SF-07: Combine Multiple Filters
   */
  test('BR-SF-07: Apply multiple filters simultaneously', async ({ page }) => {
    await page.goto(
      '/search?location=Hanoi&rating=4&minPrice=100&maxPrice=500'
    );
    await page.waitForSelector('.results-panel');
    await expect(page.locator('.property-card-result').first()).toBeVisible();
  });

  /**
   * BR-SF-08: Display Search Results
   */
  test('BR-SF-08: Display search results with required information', async ({ page }) => {
    await page.goto('/search?location=Hanoi');
    await page.waitForSelector('.results-panel');
    const card = page.locator('.property-card-result').first();
    await expect(card.locator('.property-title-result')).toBeVisible();
    await expect(card.locator('.price-value')).toBeVisible();
    await expect(card.locator('.rating-value')).toBeVisible();
    await expect(card.locator('img')).toBeVisible();
  });

  /**
   * BR-SF-09: Search Security
   */
  test('BR-SF-09: Search input is handled securely', async ({ page }) => {
    await page.goto('/search?keyword=<script>alert(1)</script>');
    await expect(page.locator('text=alert')).toHaveCount(0);
  });

  /**
   * BR-SF-10: Search Performance
   */
  test('BR-SF-10: Search results load within acceptable time', async ({ page }) => {
    const start = Date.now();
    // navigate without waiting for full load to measure time to render results panel
    await page.goto('/search?location=Hanoi', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.property-card-result', { timeout: 5000 });
    const duration = Date.now() - start;

    // Allow extra buffer for CI machines; assert within 8s to avoid flaky failures
    expect(duration).toBeLessThan(8000);
  });

// Helper used by BR-SF-05
const expectSearchResultOrEmpty = async (page) => {
  await page.waitForSelector('.results-panel');
  const count = await page.locator('.property-card-result').count();
  if (count > 0) {
    await expect(page.locator('.property-card-result').first()).toBeVisible();
  } else {
    await expect(page.locator('.results-header')).toContainText(/0\+ stays in/i);
  }
};

});
