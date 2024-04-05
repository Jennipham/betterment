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

  jest.setTimeout(10000);

  test('Successful Login - Mentee', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
  
    // Fill in login fields
    await page.type('[placeholder="Email Address"]', 'ak@test.com');
    await page.type('[placeholder="Password"]', '123');
  
    // Click on the submit button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.click('button[type="submit"]'),
    ]);
  
    // Verify successful login redirection
    const url = page.url();
    expect(url).toBe('http://localhost:3000/menteematches');
  });

  test('Successful Login - Mentor', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
  
    // Fill in login fields
    await page.type('[placeholder="Email Address"]', 'ts@test.com');
    await page.type('[placeholder="Password"]', '123');
  
    // Click on the submit button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.click('button[type="submit"]'),
    ]);
  
    // Verify successful login redirection
    const url = page.url();
    expect(url).toBe('http://localhost:3000/mentormatches');
  });

  test('Successful Login - Manager', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
  
    // Fill in login fields
    await page.type('[placeholder="Email Address"]', 'ms@test.com');
    await page.type('[placeholder="Password"]', '123');
  
    // Click on the submit button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.click('button[type="submit"]'),
    ]);
  
    // Verify successful login redirection
    const url = page.url();
    expect(url).toBe('http://localhost:3000/dashboard');
  });
  
  

  test('Unsuccessful Login - Incorrect Email', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');

    // Fill in login fields with incorrect email
    await page.type('[placeholder="Email Address"]', 'invalid@test.com');
    await page.type('[placeholder="Password"]', '123');

    // Click on the submit button
    await page.click('button[type="submit"]');

    // Wait for the error message to appear
    await page.waitForSelector('.error-message');

    // Check if the error message indicates incorrect email
    const errorMessage = await page.$eval('.error-message', el => el.textContent);
    expect(errorMessage).toContain('User not found');
  });

  test('Unsuccessful Login - Incorrect Password', async () => {
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');

    // Fill in login fields with incorrect password
    await page.type('[placeholder="Email Address"]', 'ak@test.com');
    await page.type('[placeholder="Password"]', 'invalidpassword');

    // Click on the submit button
    await page.click('button[type="submit"]');

    // Wait for the error message to appear
    await page.waitForSelector('.error-message');

    // Check if the error message indicates incorrect password
    const errorMessage = await page.$eval('.error-message', el => el.textContent);
    expect(errorMessage).toContain('Incorrect Password');
  });

  test('Successful Logout - Mentee', async () => {
    // Open a new page and navigate to the login page
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
  
    // Fill in login fields
    await page.type('[placeholder="Email Address"]', 'ak@test.com');
    await page.type('[placeholder="Password"]', '123');
  
    // Click on the submit button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.click('button[type="submit"]'),
    ]);
  
    // Verify successful login redirection
    const urlAfterLogin = page.url();
    expect(urlAfterLogin).toBe('http://localhost:3000/menteematches');
  
    // Click on the logout link
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.click('a[href="/"]'), // Assuming the logout link redirects to '/'
    ]);
  
    // Verify successful logout redirection
    const urlAfterLogout = page.url();
    expect(urlAfterLogout).toBe('http://localhost:3000/');
  });

  test('Successful Logout - Mentor', async () => {
    // Open a new page and navigate to the login page
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
  
    // Fill in login fields
    await page.type('[placeholder="Email Address"]', 'ts@test.com');
    await page.type('[placeholder="Password"]', '123');
  
    // Click on the submit button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.click('button[type="submit"]'),
    ]);
  
    // Verify successful login redirection
    const urlAfterLogin = page.url();
    expect(urlAfterLogin).toBe('http://localhost:3000/mentormatches');
  
    // Click on the logout link
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.click('a[href="/"]'), // Assuming the logout link redirects to '/'
    ]);
  
    // Verify successful logout redirection
    const urlAfterLogout = page.url();
    expect(urlAfterLogout).toBe('http://localhost:3000/');
  });
  
  test('Successful Logout - Mentor', async () => {
    // Open a new page and navigate to the login page
    const page = await browser.newPage();
    await page.goto('http://localhost:3000/login');
  
    // Fill in login fields
    await page.type('[placeholder="Email Address"]', 'ms@test.com');
    await page.type('[placeholder="Password"]', '123');
  
    // Click on the submit button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.click('button[type="submit"]'),
    ]);
  
    // Verify successful login redirection
    const urlAfterLogin = page.url();
    expect(urlAfterLogin).toBe('http://localhost:3000/dashboard');
  
    // Click on the logout link
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load' }),
      page.click('a[href="/"]'), // Assuming the logout link redirects to '/'
    ]);
  
    // Verify successful logout redirection
    const urlAfterLogout = page.url();
    expect(urlAfterLogout).toBe('http://localhost:3000/');
  });



});
