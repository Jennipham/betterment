const puppeteer = require('puppeteer-core');
const randomatic = require('randomatic');

describe('The system must allow users to register a new account.', () => {
    let browser;

    beforeEach(async () => {
        browser = await puppeteer.launch({
            executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
            headless: true
        });
    });

    afterEach(async () => {
        await browser.close();
    });

    test('New User can sign up successfully', async () => {
        const page = await browser.newPage();

        await page.goto('http://localhost:3000/signup');

        await page.click(`.signUpButton`);

        await page.waitForSelector('[name="fname"]');
        const email = `${randomatic('a', 10)}@example.com`;


        await page.type('[name="fname"]', 'John');
        await page.type('[name="sname"]', 'Doe');
        await page.type('[name="email"]', email);
        await page.type('[name="password"]', 'password');
        await page.type('[name="confirmPassword"]', 'password');

        await page.click('button[type="submit"]');

        await page.waitForNavigation({ waitUntil: 'load' });

        const url = page.url();
        expect(url).toBe('http://localhost:3000/signupSuccess');

        await browser.close();
    });

    test('User cannot sign up with existing email', async () => {
        const page = await browser.newPage();

        await page.goto('http://localhost:3000/signup');

        await page.click(`.signUpButton`);

        await page.waitForSelector('[name="fname"]');
        const email = 'ak@test.com'; // Uses existing email

        await page.type('[name="fname"]', 'John');
        await page.type('[name="sname"]', 'Doe');
        await page.type('[name="email"]', email);
        await page.type('[name="password"]', 'password');
        await page.type('[name="confirmPassword"]', 'password');

        await page.click('button[type="submit"]');

        await page.waitForSelector('.error-message', { timeout: 10000 });

        const errorMessage = await page.$eval('.error-message', el => el.textContent);
        expect(errorMessage).toContain('This email is already registered');
    });
});