const { test, expect } = require('@playwright/test');

test('should load the for-brands page', async ({ page }) => {
  await page.goto('/for-brands');
  await expect(page).toHaveURL(/.*for-brands/);
  const heading = page.locator('h1');
  await expect(heading).toBeVisible();
});
