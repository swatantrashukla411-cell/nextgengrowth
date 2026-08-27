const { chromium } = require('@playwright/test');
const path = require('path');

const brands = [
  { name: 'SHOEGR', url: 'https://www.instagram.com/shoegr_official/' },
  { name: 'Mokobara', url: 'https://www.instagram.com/mokobaraofficial/' },
  { name: 'Snitch', url: 'https://www.instagram.com/snitch.co.in/' },
  { name: 'boAt', url: 'https://www.instagram.com/boat.nirvana/' },
  { name: 'Svish', url: 'https://www.instagram.com/besvish/' },
  { name: 'Koparo Clean', url: 'https://www.instagram.com/koparoclean/' },
  { name: 'SleepyCat', url: 'https://www.instagram.com/sleepycat.in/' },
  { name: 'SaffronStays', url: 'https://www.instagram.com/saffronstays/' },
  { name: 'Mamaearth', url: 'https://www.instagram.com/mamaearth.in/' },
  { name: 'Sleepyhead', url: 'https://www.instagram.com/sleepyhead.home/' }
];

const messageText = `Hi Team,
I'm reaching out from NextGenGrowth (founded by Swatantra Shukla). We connect startups and D2C brands with top-vetted college students for short-term projects like high-retention video reels, graphic design, and web development. Instead of high agency retainers, you can hire students directly on our platform and only approve once you are satisfied with the output.
Would you be open to a quick chat?
Best,
NextGenGrowth Team`;

async function run() {
  console.log('🚀 Launching headless Chrome using copied profile...');
  const profileDir = path.join(__dirname, 'temp-chrome-profile');
  const chromePath = 'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe';
  
  let context;
  try {
    context = await chromium.launchPersistentContext(profileDir, {
      headless: true,
      executablePath: chromePath,
      viewport: { width: 1280, height: 720 }
    });
  } catch (err) {
    console.error('❌ Failed to launch browser:', err);
    return;
  }

  const page = context.pages()[0] || await context.newPage();
  
  console.log('Verifying Instagram login session...');
  await page.goto('https://www.instagram.com/');
  await page.waitForTimeout(5000); // Wait for page to fully load and cookies to apply

  const directIcon = page.locator('a[href*="/direct/inbox/"]').first();
  const searchIcon = page.locator('svg[aria-label="Search"]').first();
  
  if (await directIcon.isVisible() || await searchIcon.isVisible()) {
    console.log('✅ Session active! Logged in successfully.');
  } else {
    console.log('❌ Session inactive or cookies failed to load. Current URL:', page.url());
    const screenshotPath = path.join(__dirname, 'verify_fail.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`Saved failure screenshot to: ${screenshotPath}`);
    console.log('Make sure you were logged in to Instagram on Profile 3 before closing Chrome.');
    await context.close();
    return;
  }

  console.log('Starting automated outreach to 10 brands...');

  for (let idx = 0; idx < brands.length; idx++) {
    const brand = brands[idx];
    console.log(`\n[${idx + 1}/10] Navigating to ${brand.name} (${brand.url})...`);
    
    try {
      await page.goto(brand.url);
      await page.waitForTimeout(3000);

      console.log('Looking for Message button...');
      const messageButtonSelectors = [
        'div[role="button"]:has-text("Message")',
        'div[role="button"]:has-text("संदेश")',
        'div[role="button"]:has-text("कन्वर्सेशन शुरू करें")',
        'button:has-text("Message")',
        'a[href*="/direct/t/"]',
        'div:text("Message")',
        'div:text("संदेश")'
      ];

      let messageClicked = false;
      for (const selector of messageButtonSelectors) {
        const btn = page.locator(selector).first();
        if (await btn.isVisible()) {
          console.log(`Clicking Message button...`);
          await btn.click();
          messageClicked = true;
          break;
        }
      }

      if (!messageClicked) {
        const buttons = await page.locator('div[role="button"], button').all();
        for (const btn of buttons) {
          const text = await btn.innerText();
          if (text && (text.includes('Message') || text.includes('संदेश') || text.includes('Message button'))) {
            console.log(`Clicking message button found by text: "${text}"`);
            await btn.click();
            messageClicked = true;
            break;
          }
        }
      }

      if (!messageClicked) {
        console.log(`❌ Message button not found for ${brand.name}. Skipping.`);
        continue;
      }

      console.log('Waiting for Direct Message chat to load...');
      await page.waitForTimeout(4000);

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
          console.log(`Entering message...`);
          await input.focus();
          await page.waitForTimeout(500);
          await input.fill(messageText);
          await page.waitForTimeout(500);
          await page.keyboard.press('Enter');
          console.log(`✅ Message sent to ${brand.name}!`);
          inputFound = true;
          break;
        }
      }

      if (!inputFound) {
        console.log(`❌ Message input box not found for ${brand.name}.`);
      }

    } catch (error) {
      console.error(`❌ Error messaging ${brand.name}:`, error.message);
    }

    console.log('Waiting 5 seconds before next brand...');
    await page.waitForTimeout(5000);
  }

  console.log('\n🎉 Finished outreach to all 10 brands!');
  await context.close();
}

run();
