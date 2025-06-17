// features/step_definitions/the_internet_login_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test'); // For assertions

const LOGIN_PAGE_URL = 'https://the-internet.herokuapp.com/login';
const SECURE_AREA_URL_FRAGMENT = '/secure'; // Part of the URL for the secure area

// --- Locators ---
const USERNAME_INPUT = '#username';
const PASSWORD_INPUT = '#password';
const LOGIN_BUTTON = 'button[type="submit"]'; // More specific: 'form#login button[type="submit"]'
const FLASH_MESSAGE = '#flash'; // This element shows both success and error messages

Given('I am on "The Internet" login page', async function () {
    // 'this.page' comes from your World context (e.g., features/support/world.js or hooks)
    await this.page.goto(LOGIN_PAGE_URL);
});

When('I enter username {string}', async function (username) {
    await this.page.locator(USERNAME_INPUT).fill(username);
});

When('I enter password {string}', async function (password) {
    await this.page.locator(PASSWORD_INPUT).fill(password);
});

When('I click the login button', async function () {
    await this.page.locator(LOGIN_BUTTON).click();
});

Then('I should see a success message containing {string}', async function (expectedMessage) {
    const flashMessageElement = this.page.locator(FLASH_MESSAGE);
    await expect(flashMessageElement).toBeVisible();
    await expect(flashMessageElement).toContainText(expectedMessage);
    // Optional: Check for the 'success' class if you want to be more specific
    await expect(flashMessageElement).toHaveClass(/success/);
});

Then('I should be on the secure area page', async function () {
    // Check if the current URL contains the fragment for the secure area
    await expect(this.page).toHaveURL(new RegExp(`.*${SECURE_AREA_URL_FRAGMENT}$`));
});