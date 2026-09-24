const { test, expect } = require('@playwright/test');
const crypto = require('crypto');
require('dotenv').config({ quiet: true });

test.describe('API and coupon access controls', () => {
  test('coupon administration APIs reject anonymous access', async ({ request }) => {
    const checks = [
      ['get', '/api/coupon/admin/stats'],
      ['get', '/api/coupon/admin/list'],
      ['post', '/api/coupon/admin/generate-bulk'],
      ['post', '/api/coupon/admin/add-store'],
    ];
    for (const [method, url] of checks) {
      const response = await request[method](url, { maxRedirects: 0 });
      expect(response.status(), `${method.toUpperCase()} ${url}`).toBe(401);
    }
  });

  test('coupon administration pages redirect anonymous visitors to login', async ({ request, page }) => {
    const response = await request.get('/coupon-admin', { maxRedirects: 0 });
    expect(response.status()).toBe(302);
    expect(response.headers().location).toBe('/login');

    const legacyFile = await request.get('/coupon-admin.html', { maxRedirects: 0 });
    expect(legacyFile.status()).toBe(302);
    expect(legacyFile.headers().location).toBe('/coupon-admin');
    await page.goto('/coupon-admin');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('public health response omits platform counts and payment configuration', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).not.toHaveProperty('users');
    expect(body).not.toHaveProperty('jobs');
    expect(body).not.toHaveProperty('razorpayStatus');
    expect(body).not.toHaveProperty('razorpay');
  });

  test('outreach contact files are not served by Express static routes', async ({ request }) => {
    for (const file of ['brand_contacts.csv', 'hr_contacts.csv', 'prospects_database.csv']) {
      const response = await request.get(`/${file}`);
      expect(response.status(), file).toBe(404);
    }
  });

  test('Razorpay payment verification accepts only a matching signature', async ({ request }) => {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    test.skip(!secret, 'RAZORPAY_KEY_SECRET is not available to the test process.');
    const razorpay_order_id = 'order_ngg_validation';
    const razorpay_payment_id = 'pay_ngg_validation';
    const razorpay_signature = crypto.createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const valid = await request.post('/api/verify-payment', {
      data: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    });
    expect(valid.status()).toBe(200);
    const invalid = await request.post('/api/verify-payment', {
      data: { razorpay_order_id, razorpay_payment_id, razorpay_signature: '0'.repeat(64) },
    });
    expect(invalid.status()).toBe(400);
  });
});
