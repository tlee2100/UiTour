import { test, expect } from '@playwright/test';

const TEST_USER_ID = 9101;
const TEST_TOKEN = 'mock-token-review';
const TEST_USER = {
  UserID: TEST_USER_ID,
  FullName: 'Review Guest',
  Email: 'review.guest@example.com',
  Role: 'Guest',
};

const TOUR_ID = 101;
const REVIEW_BOOKING_ID = 7001;
const OTP_REVIEW_TEXT = 'Wonderful experience, highly recommended.';

async function setAuth(page, user = TEST_USER, token = TEST_TOKEN) {
  await page.addInitScript(({ u, t }) => {
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', t);
  }, { u: user, t: token });
}

async function dismissCancelNotice(page) {
  const overlay = page.locator('.cancel-notice-overlay');
  if (await overlay.isVisible().catch(() => false)) {
    const closeBtn = overlay.locator('.trip-btn-primary');
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
      await expect(overlay).toBeHidden();
    }
  }
}

async function stubBookings(page, bookings) {
  await page.route('**/api/booking/user/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(bookings),
    });
  });
}

async function stubTour(page, id, tourOverrides = {}) {
  await page.route(`**/api/tour/${id}`, async (route) => {
    const payload = {
      TourID: id,
      tourName: 'Da Nang Explorer',
      location: 'Da Nang',
      rating: 4.2,
      reviewsCount: 1,
      reviews: [],
      ...tourOverrides,
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    });
  });
}

test.describe('Tour review and rating - business requirements compliance', () => {
  test('BR-RR-01 & BR-RR-02: Guest can access review form from booking history', async ({ page }) => {
    await setAuth(page);
    await stubBookings(page, [
      {
        BookingID: REVIEW_BOOKING_ID,
        TourID: TOUR_ID,
        CheckIn: '2024-06-01',
        CheckOut: '2024-06-02',
        Status: 'Confirmed',
        TotalPrice: 200,
        Nights: 1,
        GuestsCount: 2,
      },
    ]);
    await stubTour(page, TOUR_ID, { reviews: [] });

    await page.goto('/trips');
    await dismissCancelNotice(page);

    const reviewButton = page.locator('.trip-card .trip-btn-primary');
    await expect(reviewButton).toBeVisible();
    await expect(reviewButton).toBeEnabled();

    await reviewButton.click();
    await expect(page.getByRole('heading', { name: /share your experience/i })).toBeVisible();
  });

  test('BR-RR-03 & BR-RR-04 & BR-RR-05 & BR-RR-09 & BR-RR-10: Submit rating/comment securely and within 5s', async ({ page }) => {
    await setAuth(page);

    let reviewSubmitted = false;
    let reviewRequestHeaders = null;
    let reviewRequestBody = null;

    await stubBookings(page, [
      {
        BookingID: REVIEW_BOOKING_ID,
        TourID: TOUR_ID,
        CheckIn: '2024-06-01',
        CheckOut: '2024-06-02',
        Status: 'Confirmed',
        TotalPrice: 200,
        Nights: 1,
        GuestsCount: 2,
      },
    ]);

    await page.route(`**/api/tour/${TOUR_ID}`, async (route, request) => {
      const base = {
        TourID: TOUR_ID,
        tourName: 'Da Nang Explorer',
        location: 'Da Nang',
        rating: reviewSubmitted ? 4.6 : 4.2,
        reviewsCount: reviewSubmitted ? 2 : 1,
        Reviews: reviewSubmitted
          ? [{ UserID: TEST_USER_ID, rating: 4, comment: OTP_REVIEW_TEXT }]
          : [],
      };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(base),
      });
    });

    await page.route(`**/api/booking/${REVIEW_BOOKING_ID}/reviews`, async (route, request) => {
      reviewRequestHeaders = request.headers();
      reviewRequestBody = request.postData();
      await new Promise((resolve) => setTimeout(resolve, 200));
      reviewSubmitted = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Review submitted successfully' }),
      });
    });

    await page.goto('/trips');
    await dismissCancelNotice(page);

    await page.locator('.trip-card .trip-btn-primary').click();
    await expect(page.getByRole('heading', { name: /share your experience/i })).toBeVisible();

    await page.locator('#review-rating').evaluate((el) => {
      el.value = '4';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('#review-comments').fill(OTP_REVIEW_TEXT);

    const start = Date.now();
    await Promise.all([
      page.waitForResponse(new RegExp(`/api/booking/${REVIEW_BOOKING_ID}/reviews`)),
      page.locator('.trip-btn-primary.stretch').click(),
    ]);
    const durationMs = Date.now() - start;

    expect(durationMs).toBeLessThanOrEqual(5000);
    expect(reviewRequestHeaders?.authorization || '').toContain('Bearer');
    const parsedReviewBody = reviewRequestBody ? JSON.parse(reviewRequestBody) : {};
    expect(parsedReviewBody.Rating).toBeGreaterThanOrEqual(1);
    expect(parsedReviewBody.Rating).toBeLessThanOrEqual(5);
    expect(parsedReviewBody.Comments).toContain('Wonderful experience');

    await expect(page.getByText(/thanks! your review has been submitted/i)).toBeVisible();

    await page.waitForTimeout(400);
    const reviewButton = page.locator('.trip-card .trip-btn-primary');
    await expect(reviewButton).toBeDisabled();
  });

  test('BR-RR-06 & BR-RR-07: Tour details show reviews and average rating', async ({ page }) => {
    const experienceId = 201;

    await page.route(`**/api/tour/${experienceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          TourID: experienceId,
          listingTitle: 'Hoi An Lantern Tour',
          summary: 'Lantern night tour',
          rating: 4.5,
          reviewsCount: 2,
          location: 'Hoi An',
          pricing: { basePrice: 100, currency: 'USD' },
          maxGuests: 6,
          durationHours: 3,
          hostID: 5,
        }),
      });
    });

    await page.route(`**/api/tour/${experienceId}/photos`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route(`**/api/tour/${experienceId}/experiencedetails`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route(`**/api/host/5`, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ hostID: 5, hostSince: '2020-01-01', user: { fullName: 'Host A' } }) });
    });

    await page.route(`**/api/tour/${experienceId}/reviews`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 1,
            userName: 'Alice',
            userAvatar: '/uploads/alice.png',
            rating: 5,
            comment: 'Amazing night market tour!'
          },
          {
            id: 2,
            userName: 'Bob',
            userAvatar: '/uploads/bob.png',
            rating: 4,
            comment: 'Great host and vibes.'
          },
        ]),
      });
    });

    await page.goto(`/experience/${experienceId}`);
    await expect(page.locator('.ir-review-section')).toBeVisible();
    await expect(page.locator('.ir-review-count')).toContainText('2 reviews');
    await expect(page.locator('.ir-rating-text')).toHaveText('4.5');

    const reviewCards = page.locator('.ir-review-card');
    await expect(reviewCards).toHaveCount(2);
  });

  test('BR-RR-08: Prevent duplicate reviews for the same booking', async ({ page }) => {
    await setAuth(page);
    await stubBookings(page, [
      {
        BookingID: REVIEW_BOOKING_ID,
        TourID: TOUR_ID,
        CheckIn: '2024-06-01',
        CheckOut: '2024-06-02',
        Status: 'Confirmed',
        TotalPrice: 200,
        Nights: 1,
        GuestsCount: 2,
      },
    ]);

    await stubTour(page, TOUR_ID, {
      Reviews: [{ UserID: TEST_USER_ID, rating: 5, comment: 'Loved it.' }],
    });

    await page.goto('/trips');
    await dismissCancelNotice(page);

    const reviewButton = page.locator('.trip-card .trip-btn-primary');
    await expect(reviewButton).toBeDisabled();
    await expect(reviewButton).toHaveText(/review submitted/i);
  });
});
