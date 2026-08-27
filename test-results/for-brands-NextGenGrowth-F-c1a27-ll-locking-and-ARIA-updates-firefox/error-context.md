# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: for-brands.spec.js >> NextGenGrowth For Brands responsiveness & styling >> should handle menu toggle clicks, scroll locking, and ARIA updates
- Location: tests-e2e\for-brands.spec.js:55:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: expect(locator).not.toHaveClass(expected) failed

Locator: locator('#mobileMenu')
Expected pattern: not /show/
Received string: ""

Call log:
  - Expect "not toHaveClass" with timeout 5000ms
  - waiting for locator('#mobileMenu')

```

# Test source

```ts
  1   | const { test, expect } = require('@playwright/test');
  2   | 
  3   | test.describe('NextGenGrowth For Brands responsiveness & styling', () => {
  4   |   test('should load page and have HTML text-size-adjust set correctly', async ({ page }) => {
  5   |     await page.goto('/for-brands');
  6   |     
  7   |     // Check text-size-adjust properties on html
  8   |     const htmlStyle = await page.evaluate(() => {
  9   |       const htmlEl = document.documentElement;
  10  |       const styles = window.getComputedStyle(htmlEl);
  11  |       return {
  12  |         webkitTextSizeAdjust: styles.webkitTextSizeAdjust,
  13  |         textSizeAdjust: styles.textSizeAdjust || styles.getPropertyValue('text-size-adjust')
  14  |       };
  15  |     });
  16  | 
  17  |     expect(htmlStyle.webkitTextSizeAdjust).toBe('100%');
  18  |   });
  19  | 
  20  |   test('should have vendor prefixed backdrop-filter and user-select rules', async ({ page }) => {
  21  |     await page.goto('/for-brands');
  22  |     
  23  |     // Evaluate if backdrop-filter and user-select exist in style sheet rules
  24  |     const styleChecks = await page.evaluate(() => {
  25  |       const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
  26  |       
  27  |       const mockDashboardMatch = styles.match(/\.mock-dashboard\s*\{([^}]+)\}/);
  28  |       const mockCard1Match = styles.match(/\.mock-card-1\s*\{([^}]+)\}/);
  29  |       const mockCard2Match = styles.match(/\.mock-card-2\s*\{([^}]+)\}/);
  30  |       const mobileMenuMatch = styles.match(/\.mobile-menu\s*\{([^}]+)\}/);
  31  |       const faqQuestionMatch = styles.match(/\.faq-question\s*\{([^}]+)\}/);
  32  | 
  33  |       const checkWebkitBackdrop = (blockText) => blockText && blockText.includes('-webkit-backdrop-filter');
  34  |       const checkUserSelectPrefixes = (blockText) => blockText && 
  35  |         blockText.includes('-webkit-user-select') && 
  36  |         blockText.includes('-moz-user-select') && 
  37  |         blockText.includes('-ms-user-select');
  38  | 
  39  |       return {
  40  |         mockDashboardHasWebkit: checkWebkitBackdrop(mockDashboardMatch ? mockDashboardMatch[1] : ''),
  41  |         mockCard1HasWebkit: checkWebkitBackdrop(mockCard1Match ? mockCard1Match[1] : ''),
  42  |         mockCard2HasWebkit: checkWebkitBackdrop(mockCard2Match ? mockCard2Match[1] : ''),
  43  |         mobileMenuHasWebkit: checkWebkitBackdrop(mobileMenuMatch ? mobileMenuMatch[1] : ''),
  44  |         faqQuestionHasWebkitUserSelect: checkUserSelectPrefixes(faqQuestionMatch ? faqQuestionMatch[1] : '')
  45  |       };
  46  |     });
  47  | 
  48  |     expect(styleChecks.mockDashboardHasWebkit).toBe(true);
  49  |     expect(styleChecks.mockCard1HasWebkit).toBe(true);
  50  |     expect(styleChecks.mockCard2HasWebkit).toBe(true);
  51  |     expect(styleChecks.mobileMenuHasWebkit).toBe(true);
  52  |     expect(styleChecks.faqQuestionHasWebkitUserSelect).toBe(true);
  53  |   });
  54  | 
  55  |   test('should handle menu toggle clicks, scroll locking, and ARIA updates', async ({ page }) => {
  56  |     // We set mobile viewport first to make sure toggle is displayed
  57  |     await page.setViewportSize({ width: 375, height: 667 });
  58  |     await page.goto('/for-brands');
  59  | 
  60  |     const navToggle = page.locator('#navToggle');
  61  |     const body = page.locator('body');
  62  |     const mobileMenu = page.locator('#mobileMenu');
  63  | 
  64  |     // Initially: toggle not open, scroll-locked not present, aria attributes
  65  |     await expect(navToggle).toHaveAttribute('aria-label', 'Open menu');
  66  |     await expect(body).not.toHaveClass(/scroll-locked/);
> 67  |     await expect(mobileMenu).not.toHaveClass(/show/);
      |                                  ^ Error: expect(locator).not.toHaveClass(expected) failed
  68  | 
  69  |     // Click toggle to open menu
  70  |     await navToggle.click();
  71  |     await expect(mobileMenu).toHaveClass(/show/);
  72  |     await expect(body).toHaveClass(/scroll-locked/);
  73  |     await expect(navToggle).toHaveAttribute('aria-expanded', 'true');
  74  |     await expect(navToggle).toHaveAttribute('aria-label', 'Close menu');
  75  | 
  76  |     // Click toggle again to close menu
  77  |     await navToggle.click();
  78  |     await expect(mobileMenu).not.toHaveClass(/show/);
  79  |     await expect(body).not.toHaveClass(/scroll-locked/);
  80  |     await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
  81  |     await expect(navToggle).toHaveAttribute('aria-label', 'Open menu');
  82  | 
  83  |     // Open again and click a link to close
  84  |     await navToggle.click();
  85  |     await expect(body).toHaveClass(/scroll-locked/);
  86  |     
  87  |     const firstLink = page.locator('.mobile-menu-links a').first();
  88  |     await firstLink.click();
  89  |     await expect(mobileMenu).not.toHaveClass(/show/);
  90  |     await expect(body).not.toHaveClass(/scroll-locked/);
  91  |     await expect(navToggle).toHaveAttribute('aria-expanded', 'false');
  92  |     await expect(navToggle).toHaveAttribute('aria-label', 'Open menu');
  93  |   });
  94  | 
  95  |   test('should hide Client Login and Post a Project from header on mobile viewports', async ({ page }) => {
  96  |     await page.setViewportSize({ width: 375, height: 667 });
  97  |     await page.goto('/for-brands');
  98  | 
  99  |     // Header buttons
  100 |     const clientLoginBtn = page.locator('header .btn-login');
  101 |     const postProjectBtn = page.locator('header .btn-primary');
  102 | 
  103 |     await expect(clientLoginBtn).not.toBeVisible();
  104 |     await expect(postProjectBtn).not.toBeVisible();
  105 |   });
  106 | 
  107 |   test('should ensure mobile menu toggle and menu links meet touch target guidelines', async ({ page }) => {
  108 |     await page.setViewportSize({ width: 375, height: 667 });
  109 |     await page.goto('/for-brands');
  110 | 
  111 |     // Hamburger toggle dimensions
  112 |     const navToggle = page.locator('#navToggle');
  113 |     const toggleBox = await navToggle.boundingBox();
  114 |     expect(toggleBox.width).toBeGreaterThanOrEqual(44);
  115 |     expect(toggleBox.height).toBeGreaterThanOrEqual(44);
  116 | 
  117 |     // Open mobile menu
  118 |     await navToggle.click();
  119 | 
  120 |     // Check touch target of mobile menu links
  121 |     const links = page.locator('.mobile-menu-links a:not(.btn)');
  122 |     const count = await links.count();
  123 |     for (let i = 0; i < count; i++) {
  124 |       const box = await links.nth(i).boundingBox();
  125 |       expect(box.height).toBeGreaterThanOrEqual(44);
  126 |     }
  127 | 
  128 |     // Check touch target of mobile menu buttons
  129 |     const btns = page.locator('.mobile-menu-links .btn');
  130 |     const btnCount = await btns.count();
  131 |     for (let i = 0; i < btnCount; i++) {
  132 |       const box = await btns.nth(i).boundingBox();
  133 |       expect(box.height).toBeGreaterThanOrEqual(44);
  134 |     }
  135 |   });
  136 | 
  137 |   test('should apply responsive rules and prevent overflow in landscape mode', async ({ page }) => {
  138 |     // Set landscape view (e.g. height 320, width 640)
  139 |     await page.setViewportSize({ width: 640, height: 320 });
  140 |     await page.goto('/for-brands');
  141 | 
  142 |     // Open mobile menu
  143 |     await page.locator('#navToggle').click();
  144 | 
  145 |     // Verify mobile menu scrollability features
  146 |     const mobileMenuStyles = await page.evaluate(() => {
  147 |       const el = document.getElementById('mobileMenu');
  148 |       const styles = window.getComputedStyle(el);
  149 |       return {
  150 |         overflowY: styles.overflowY,
  151 |         webkitOverflowScrolling: styles.webkitOverflowScrolling || styles.getPropertyValue('-webkit-overflow-scrolling')
  152 |       };
  153 |     });
  154 | 
  155 |     expect(mobileMenuStyles.overflowY).toBe('auto');
  156 |   });
  157 | });
  158 | 
```