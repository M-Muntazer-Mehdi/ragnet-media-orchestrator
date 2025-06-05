const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('https://twitter.com/login');

  console.log('Please log in to Twitter manually... You have 60 seconds.');
  
  // ⏳ Wait 60 seconds
  await new Promise(resolve => setTimeout(resolve, 60000));

  const cookies = await page.cookies();
  fs.writeFileSync('twitter-cookies.json', JSON.stringify(cookies, null, 2));

  console.log('✅ Cookies saved to twitter-cookies.json');
  await browser.close();
})();
