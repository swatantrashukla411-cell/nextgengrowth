const { chromium } = require('playwright');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log("Launching headless browser...");
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    const htmlPath = path.resolve(__dirname, 'nextgengrowth_whitepaper.html');
    // Ensure correct file path format for Windows
    const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
    
    console.log(`Loading HTML from: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    
    console.log("Generating PDF file...");
    await page.pdf({
      path: path.resolve(__dirname, 'nextgengrowth_whitepaper.pdf'),
      format: 'A4',
      margin: {
        top: '25mm',
        bottom: '25mm',
        left: '20mm',
        right: '20mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-family: 'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif; font-size: 8px; color: #64748B; width: 100%; display: flex; justify-content: space-between; padding: 0 20mm; border-top: 1px solid #E2E8F0; padding-top: 4px;">
          <span>NextGenGrowth Ecosystem Explainer & Whitepaper</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      printBackground: true
    });
    
    console.log("✅ PDF generation complete. Saved to nextgengrowth_whitepaper.pdf");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
