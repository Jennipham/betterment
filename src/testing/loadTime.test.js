const puppeteer = require('puppeteer-core');

describe('Page Load Time Test', () => {
  let browser;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Average page load time for all routes', async () => {
    const routes = [
      '/',
      '/signup',
      '/login',
      '/signupSuccess',
      '/termsofuse',
      '/fullprofile/:email',
      '/help',
      '/error',
      '/expired',
      '/profileSettings',
      '/adminSettings',
      '/dashboard',
      '/mentormatches',
      '/menteematches',
      '/requests'
    ];

    let totalLoadTime = 0;

    for (const route of routes) {
      const page = await browser.newPage();
      await page.goto(`http://localhost:3000${route}`, { waitUntil: 'load' });
      const loadTime = await page.evaluate(() => window.performance.timing.loadEventEnd - window.performance.timing.navigationStart);
      totalLoadTime += loadTime;
      await page.close();
    }

    const averageLoadTime = totalLoadTime / routes.length;
    console.log('Average page load time:', averageLoadTime, 'ms');
    // Average load time should be less than 3s
    expect(averageLoadTime).toBeLessThan(3000);
  });
});
