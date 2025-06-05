
const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: false, // show browser so you can log in manually
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://www.instagram.com/accounts/login/', {
    waitUntil: 'networkidle2'
  });

  console.log('🔐 Please log in to Instagram manually...');
  await new Promise(resolve => setTimeout(resolve, 70000));

  const cookies = await page.cookies();
  fs.writeFileSync('ig-cookies.json', JSON.stringify(cookies, null, 2));

  console.log('✅ Cookies saved to ig-cookies.json');
  await browser.close();
})();