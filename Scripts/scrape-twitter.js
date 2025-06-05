const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

// Enable stealth mode
puppeteer.use(StealthPlugin());

(async () => {
  const username = process.argv[2];
  if (!username) {
    console.error('❌ Username required');
    process.exit(1);
  }

  const cookies = JSON.parse(fs.readFileSync('twitter-cookies.json', 'utf8'));
  const url = `https://twitter.com/${username}`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setCookie(...cookies);

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Scroll down to load tweets
  for (let i = 0; i < 5; i++) {
    await page.evaluate(() => window.scrollBy(0, window.innerHeight));
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  try {
    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : '';
      };

      const name = getText('div[data-testid="UserName"] span');
      const bio = getText('div[data-testid="UserDescription"]');
      const location = getText('span[data-testid="UserLocation"]');
      const joinDate = getText('span[data-testid="UserJoinDate"]');

      const stats = Array.from(document.querySelectorAll('a[role="link"] span'))
        .map(span => span.textContent)
        .filter(txt => /\d/.test(txt));

      // Extract recent tweet texts
      const tweetNodes = Array.from(document.querySelectorAll('div[data-testid="tweetText"]'));
      const recentTweets = tweetNodes.slice(0, 3).map(node => node.innerText.trim());

      return {
        name,
        handle: window.location.pathname.replace('/', ''),
        bio,
        location,
        joinDate,
        following: stats[0] || '',
        followers: stats[1] || '',
        recentTweets,
      };
    });

    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('❌ Error scraping Twitter profile:', e.message);
  }

  await browser.close();
})();
