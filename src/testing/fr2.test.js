const puppeteer = require('puppeteer-core');
const randomatic = require('randomatic');

describe('The system must allow users to log in and log out.', () => {
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

test('Successful Login', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');

    // Fill in login fields
    await page.type('[placeholder="Email Address"]', 'ak@test.com');
    await page.type('[placeholder="Password"]', '123');

    // Click on the submit button
    await page.click('button[type="submit"]');

    // Wait for navigation to complete
    await page.waitForNavigation({ waitUntil: 'load' });

    const url = page.url();
    expect(url).toBe('http://localhost:3000/menteematches');

  });

    test('Unsuccessful Login', async () => {
        const page = await browser.newPage();
        await page.goto('http://localhost:3000/login');
    
        // Fill in login fields with incorrect credentials
        await page.type('[placeholder="Email Address"]', 'invalid@test.com');
        await page.type('[placeholder="Password"]', 'invalidpassword');
    
        // Click on the submit button
        await page.click('button[type="submit"]');
    
        // Wait for the error message to appear
        await page.waitForSelector('.error-message');
    
        // Check if the error message indicates incorrect credentials
        const errorMessage = await page.$eval('.error-message', el => el.textContent);
        expect(errorMessage).toContain('User not found');

  });
});
