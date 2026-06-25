const { test, expect } = require('@playwright/test');

test.describe('NextGenGrowth For Brands responsiveness & styling', () => {
  test('should load page and have HTML text-size-adjust set correctly', async ({ page }) => {
    await page.goto('/for-brands');
    
    // Check text-size-adjust properties on html
    const htmlStyle = await page.evaluate(() => {
      const htmlEl = document.documentElement;
      const styles = window.getComputedStyle(htmlEl);
      return {
        webkitTextSizeAdjust: styles.webkitTextSizeAdjust,
        textSizeAdjust: styles.textSizeAdjust || styles.getPropertyValue('text-size-adjust')
      };
    });

    expect(htmlStyle.webkitTextSizeAdjust).toBe('100%');
  });

  test('should have vendor prefixed backdrop-filter and user-select rules', async ({ page }) => {
    await page.goto('/for-brands');
    
    // Evaluate if backdrop-filter and user-select exist in style sheet rules
    const styleChecks = await page.evaluate(() => {
      const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
      
      const mockDashboardMatch = styles.match(/\.mock-dashboard\s*\{([^}]+)\}/);
      const mockCard1Match = styles.match(/\.mock-card-1\s*\{([^}]+)\}/);
      const mockCard2Match = styles.match(/\.mock-card-2\s*\{([^}]+)\}/);
      const mobileMenuMatch = styles.match(/\.mobile-menu\s*\{([^}]+)\}/);
      const faqQuestionMatch = styles.match(/\.faq-question\s*\{([^}]+)\}/);

      const checkWebkitBackdrop = (blockText) => blockText && blockText.includes('-webkit-backdrop-filter');
      const checkUserSelectPrefixes = (blockText) => blockText && 
        blockText.includes('-webkit-user-select') && 
        blockText.includes('-moz-user-select') && 
        blockText.includes('-ms-user-select');

      return {
        mockDashboardHasWebkit: checkWebkitBackdrop(mockDashboardMatch ? mockDashboardMatch[1] : ''),
        mockCard1HasWebkit: checkWebkitBackdrop(mockCard1Match ? mockCard1Match[1] : ''),
        mockCard2HasWebkit: checkWebkitBackdrop(mockCard2Match ? mockCard2Match[1] : ''),
        mobileMenuHasWebkit: checkWebkitBackdrop(mobileMenuMatch ? mobileMenuMatch[1] : ''),
        faqQuestionHasWebkitUserSelect: checkUserSelectPrefixes(faqQuestionMatch ? faqQuestionMatch[1] : '')
      };
    });

    expect(styleChecks.mockDashboardHasWebkit).toBe(true);
    expect(styleChecks.mockCard1HasWebkit).toBe(true);
    expect(styleChecks.mockCard2HasWebkit).toBe(true);
    expect(styleChecks.mobileMenuHasWebkit).toBe(true);
    expect(styleChecks.faqQuestionHasWebkitUserSelect).toBe(true);
  });

  test('should handle menu toggle clicks, scroll locking, and ARIA updates', async ({ page }) => {
    // We set mobile viewport first to make sure toggle is displayed
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/for-brands');

    const navToggle = page.locator('#navToggle');
    const body = page.locator('body');
    const mobileMenu = page.locator('#mobileMenu');

    // Initially: toggle not open, scroll-locked not present, aria attributes
    await expect(navToggle).toHaveAttribute('aria-label', 'Open menu');
    await expect(body).not.toHaveClass(/scroll-locked/);
    await expect(mobileMenu).not.toHaveClass(/show/);

    // Click toggle to open menu
    await navToggle.click();
    await expect(mobileMenu).toHaveClass(/show/);
    await expect(body).toHaveClass(/scroll-locked/);
    await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(navToggle).toHaveAttribute('aria-label', 'Close menu');

    // Click toggle again to close menu
    await navToggle.click();
    await expect(mobileMenu).not.toHaveClass(/show/);
    await expect(body).not.toHaveClass(/scroll-locked/);
    await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(navToggle).toHaveAttribute('aria-label', 'Open menu');

    // Open again and click a link to close
    await navToggle.click();
    await expect(body).toHaveClass(/scroll-locked/);
    
    const firstLink = page.locator('.mobile-menu-links a').first();
    await firstLink.click();
    await expect(mobileMenu).not.toHaveClass(/show/);
    await expect(body).not.toHaveClass(/scroll-locked/);
    await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(navToggle).toHaveAttribute('aria-label', 'Open menu');
  });

  test('should hide Client Login and Post a Project from header on mobile viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/for-brands');

    // Header buttons
    const clientLoginBtn = page.locator('header .btn-login');
    const postProjectBtn = page.locator('header .btn-primary');

    await expect(clientLoginBtn).not.toBeVisible();
    await expect(postProjectBtn).not.toBeVisible();
  });

  test('should ensure mobile menu toggle and menu links meet touch target guidelines', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/for-brands');

    // Hamburger toggle dimensions
    const navToggle = page.locator('#navToggle');
    const toggleBox = await navToggle.boundingBox();
    expect(toggleBox.width).toBeGreaterThanOrEqual(44);
    expect(toggleBox.height).toBeGreaterThanOrEqual(44);

    // Open mobile menu
    await navToggle.click();

    // Check touch target of mobile menu links
    const links = page.locator('.mobile-menu-links a:not(.btn)');
    const count = await links.count();
    for (let i = 0; i < count; i++) {
      const box = await links.nth(i).boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    // Check touch target of mobile menu buttons
    const btns = page.locator('.mobile-menu-links .btn');
    const btnCount = await btns.count();
    for (let i = 0; i < btnCount; i++) {
      const box = await btns.nth(i).boundingBox();
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should apply responsive rules and prevent overflow in landscape mode', async ({ page }) => {
    // Set landscape view (e.g. height 320, width 640)
    await page.setViewportSize({ width: 640, height: 320 });
    await page.goto('/for-brands');

    // Open mobile menu
    await page.locator('#navToggle').click();

    // Verify mobile menu scrollability features
    const mobileMenuStyles = await page.evaluate(() => {
      const el = document.getElementById('mobileMenu');
      const styles = window.getComputedStyle(el);
      return {
        overflowY: styles.overflowY,
        webkitOverflowScrolling: styles.webkitOverflowScrolling || styles.getPropertyValue('-webkit-overflow-scrolling')
      };
    });

    expect(mobileMenuStyles.overflowY).toBe('auto');
  });
});
