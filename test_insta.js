const { chromium } = require('@playwright/test');

async function testOutreach() {
  console.log('Connecting to browser on port 9222...');
  let browser;
  try {
    browser = await chromium.connectOverCDP('http://localhost:9222');
  } catch (err) {
    console.error('❌ Failed to connect to browser on port 9222. Make sure Chrome is running with remote debugging enabled.', err);
    return;
  }

  const contexts = browser.contexts();
  if (contexts.length === 0) {
    console.error('❌ No active browser contexts found.');
    return;
  }

  const context = contexts[0];
  const page = await context.newPage();
  console.log('Opened new page in Chrome.');

  try {
    const brand = 'SHOEGR';
    console.log(`Searching Google for Instagram profile of: ${brand}`);
    await page.goto(`https://www.google.com/search?q=site:instagram.com+${encodeURIComponent(brand)}`);
    await page.waitForTimeout(2000);

    const hrefs = await page.$$eval('a', anchors => anchors.map(a => a.href));
    const profileUrl = hrefs.find(href => 
      href.includes('instagram.com/') && 
      !href.includes('/p/') && 
      !href.includes('/reel/') && 
      !href.includes('/explore/') && 
      !href.includes('/tags/') &&
      !href.includes('/developer') &&
      !href.includes('/about')
    );

    if (!profileUrl) {
      console.log(`❌ Could not find Instagram profile URL for ${brand}`);
      return;
    }

    console.log(`Found profile URL: ${profileUrl}`);
    console.log(`Navigating to ${profileUrl}...`);
    await page.goto(profileUrl);
    await page.waitForTimeout(3000);

    // Click Message button
    console.log('Looking for Message button...');
    const messageButtonSelectors = [
      'div[role="button"]:has-text("Message")',
      'div[role="button"]:has-text("कन्वर्सेशन शुरू करें")',
      'div[role="button"]:has-text("संदेश")',
      'button:has-text("Message")',
      'a[href*="/direct/t/"]',
      'div:text("Message")',
      'div:text("संदेश")'
    ];

    let messageClicked = false;
    for (const selector of messageButtonSelectors) {
      const btn = page.locator(selector).first();
      if (await btn.isVisible()) {
        console.log(`Clicking Message button using selector: ${selector}`);
        await btn.click();
        messageClicked = true;
        break;
      }
    }

    if (!messageClicked) {
      // Try finding by text or scanning buttons
      const buttons = await page.locator('div[role="button"], button').all();
      for (const btn of buttons) {
        const text = await btn.innerText();
        if (text && (text.includes('Message') || text.includes('संदेश') || text.includes('Message button'))) {
          console.log(`Found button by inner text "${text}", clicking it...`);
          await btn.click();
          messageClicked = true;
          break;
        }
      }
    }

    if (!messageClicked) {
      console.log('❌ Message button not found on profile page.');
      return;
    }

    console.log('Waiting for Direct Message chat to load...');
    await page.waitForTimeout(5000);

    // Look for DM input
    console.log('Looking for message input...');
    const inputSelectors = [
      'div[role="textbox"]',
      'div[contenteditable="true"]',
      'textarea[placeholder*="Message"]',
      'textarea[placeholder*="संदेश"]'
    ];

    let inputFound = false;
    for (const selector of inputSelectors) {
      const input = page.locator(selector).first();
      if (await input.isVisible()) {
        console.log(`Found message input with selector: ${selector}`);
        await input.focus();
        await page.waitForTimeout(500);
        
        const messageText = `Hi Team,
I'm reaching out from NextGenGrowth (founded by Swatantra Shukla). We connect startups and D2C brands with top-vetted college students for short-term projects like high-retention video reels, graphic design, and web development. You can post a task and only approve once you are satisfied with the output.
Would you be open to a quick chat?
Best,
NextGenGrowth Team`;
        
        await input.fill(messageText);
        console.log('Message typed. Sending...');
        await page.keyboard.press('Enter');
        console.log('✅ Message sent successfully!');
        inputFound = true;
        break;
      }
    }

    if (!inputFound) {
      console.log('❌ Could not find the message input textbox.');
    }

  } catch (err) {
    console.error('❌ Error during test run:', err);
  } finally {
    await page.close();
    console.log('Closed test tab.');
  }
}

testOutreach();
