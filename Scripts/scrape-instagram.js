const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeInstagram(username) {

  const url = `https://www.instagram.com/${username}/`;

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set user-agent to avoid bot detection
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36');

  try {
    const cookies = JSON.parse(fs.readFileSync('ig-cookies.json'));
    await page.setCookie(...cookies);
  } catch (e) {
  }

  try {

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('header', { timeout: 20000 });
for (let i = 0; i < 3; i++) {
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await new Promise((res) => setTimeout(res, 3000));

}


    const data = await page.evaluate(() => {
      const getText = (selector) => {
        const el = document.querySelector(selector);
        return el ? el.textContent.trim() : '';
      };

      const name = (() => {
        const meta = document.querySelector('meta[property="og:title"]');
        return meta ? meta.content.split('(')[0].trim() : '';
      })();

      const bio = (() => {
  // Option 1: try meta tag first
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    const content = meta.getAttribute('content') || '';
    const afterColon = content.split(':').pop()?.trim();
    if (afterColon) return afterColon.replace(/^"|"$/g, '');
  }

  // Option 2: fallback to DOM extraction
  const bioContainer = document.querySelector('header section span');
  if (!bioContainer) return '';

  const texts = Array.from(bioContainer.querySelectorAll('span, div, br'))
    .map(el => el.textContent?.trim())
    .filter(Boolean);

  return texts.join('\n');
})();



      const posts = getText('li:nth-child(1) span span') || '';
      const followers = getText('li:nth-child(2) span span') || '';
      const following = getText('li:nth-child(3) span span') || '';

      const website = (() => {
        const link = document.querySelector('header section a');
        return link?.href || '';
      })();

      // Extract recent post images (fallback-safe)
      const recentPosts = [];
const posts1 = [...document.querySelectorAll('div.x1lliihq.x1n2onr6.xh8yej3')].slice(0, 10);


const seen = new Set();

posts1.forEach(post => {
  const img = post.querySelector('img');
  if (img && img.src && recentPosts.length < 3) {
    seen.add(img.src);
    recentPosts.push({
      src: img.src,
      alt: img.alt || ''
    });
  }
});


      return {
        name,
        bio,
        posts,
        followers,
        following,
        website,
        recentPosts,
      };
    });

    await browser.close();

    return {
      data,
    };
  } catch (error) {
    await browser.close();

    return {
      error: error.message,
    };
  }
}

// Entry point
const username = process.argv[2];
if (!username) {
  console.error('❌ Instagram username required as argument');
  process.exit(1);
}

scrapeInstagram(username)
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.error(`🚨 Script crashed: ${err.message}`);
    process.exit(1);
  });
