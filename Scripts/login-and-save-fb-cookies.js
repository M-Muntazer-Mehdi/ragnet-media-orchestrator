// login-and-save-fb-cookies.js
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.goto('https://www.facebook.com/login', { waitUntil: 'networkidle2' });

  console.log('🔐 Please log in to Facebook manually...');
  await new Promise(resolve => setTimeout(resolve, 70000));

  const cookies = await page.cookies();
  fs.writeFileSync('fb-cookies.json', JSON.stringify(cookies, null, 2));

  console.log('✅ Cookies saved to fb-cookies.json');
  await browser.close();
})();
