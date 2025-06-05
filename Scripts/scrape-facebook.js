const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeFacebook(username) {
  const url = `https://www.facebook.com/${username}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set user-agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );

  try {
    const cookies = JSON.parse(fs.readFileSync('fb-cookies.json'));
    await page.setCookie(...cookies);
  } catch (e) {
    console.error('❌ Failed to load cookies:', e.message);
  }

  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for name or intro card to appear
    await page.waitForSelector('h1, div[data-testid="profile_intro_card"]', { timeout: 20000 });

    // Scroll a bit to load content
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise(res => setTimeout(res, 3000));
    }

    // Wait for the bio element you identified
    await page.waitForSelector('div.x1lliihq span', { timeout: 15000 });

    // Extract data all in one evaluate block
const data = await page.evaluate(() => {
  const getText = (selector) => {
    const el = document.querySelector(selector);
    return el ? el.textContent.trim() : '';
  };

  const name = getText('h1');

const bio = (() => {
  // Select the span with those classes (use part of the class or a parent selector if stable)
  const span = document.querySelector('span.x6zurak.x18bv5gf.x184q3qc.xqxll94.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1lliihq.xzsf02u.xlh3980.xvmahel.x1x9mg3.xo1l8bm');
  return span ? span.innerText.trim() : '';
})();


const about = (() => {
  // Select all matching spans
  const spans = document.querySelectorAll('span.x6zurak.x18bv5gf.x184q3qc.xqxll94.x1s928wv.xhkezso.x1gmr53x.x1cpjm7i.x1fgarty.x1943h6x.x193iq5w.xeuugli.x13faqbe.x1vvkbs.x1yc453h.x1lliihq.xzsf02u.xlh3980.xvmahel.x1x9mg3.xo1l8bm');

  // Return the text of first two spans or empty string if missing
  const line1 = spans[0] ? spans[0].innerText.trim() : '';
  const line2 = spans[1] ? spans[1].innerText.trim() : '';
  const line3 = spans[2] ? spans[2].innerText.trim() : '';
  const line4 = spans[3] ? spans[3].innerText.trim() : '';
  const line5 = spans[4] ? spans[4].innerText.trim() : '';
  const line6 = spans[5] ? spans[5].innerText.trim() : '';

  return { line1, line2, line3, line4, line5, line6 };
})();




  return { name, bio, about };
});


    await browser.close();
    return { data };

  } catch (error) {
    await browser.close();
    return { error: error.message };
  }
}

// Entry point
const username = process.argv[2];
if (!username) {
  console.error('❌ Facebook username required as argument');
  process.exit(1);
}

scrapeFacebook(username)
  .then(result => console.log(JSON.stringify(result, null, 2)))
  .catch(err => {
    console.error(`🚨 Script crashed: ${err.message}`);
    process.exit(1);
  });
