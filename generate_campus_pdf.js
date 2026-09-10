const { chromium } = require('playwright');
const path = require('path');

(async () => {
  let browser;
  try {
    console.log("🚀 Launching Browser for PDF generation...");
    // Try launching installed msedge or chrome
    try {
      browser = await chromium.launch({ channel: 'msedge', headless: true });
    } catch (e) {
      console.log("Falling back to system chrome...");
      browser = await chromium.launch({ channel: 'chrome', headless: true });
    }
    
    const page = await browser.newPage();
    
    const htmlPath = path.resolve(__dirname, 'campus_techstack_guide.html');
    const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
    
    console.log(`📄 Loading HTML file from: ${fileUrl}`);
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    
    const outputPath = path.resolve(__dirname, 'NextGenGrowth_Campus_TechStack_Guide.pdf');
    console.log(`⏳ Generating PDF file at: ${outputPath}`);
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      margin: {
        top: '15mm',
        bottom: '15mm',
        left: '15mm',
        right: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; font-size: 8px; color: #64748B; width: 100%; display: flex; justify-content: space-between; padding: 0 15mm; border-top: 1px solid #E2E8F0; padding-top: 4px;">
          <span>NextGenGrowth Tech Architecture & Campus Landing Page Guide</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      printBackground: true
    });
    
    console.log("✅ PDF Generation Successful! Saved to NextGenGrowth_Campus_TechStack_Guide.pdf");
  } catch (error) {
    console.error("❌ Error generating PDF:", error);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
})();
