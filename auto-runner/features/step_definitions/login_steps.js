// AI-Playwright-Framework/features/step_definitions/login_steps.js
const {Given, When, Then} = require('@cucumber/cucumber');
const assert = require('node:assert');
const {getUser} = require('../../utils/data_manager');
const {findElementRobustly} = require('../../utils/self_healing_locator'); // Import our new function

const SAUCEDEMO_URL = 'https://www.saucedemo.com/';
const LOGIN_BUTTON = 'button[type="submit"]'; // M
// Removed old direct locator constants, we'll define strategies below

// // Corrected usage within your step definition (e.g., When('I click the login button', ...))
// // Define your locator strategies, perhaps at the top of your step definition file
// const LOGIN_PAGE_LOCATORS = {
//   // ... other locators ...
//   loginButton: {
//     name: 'Login Button', // This is the elementName
//     primary: '#login-button',
//     fallbacks: [
//       '[data-test="login-button"]',        // Using data-test attribute
//       '[name="login-button"]',             // Using name attribute
//       'input.submit-button[value="Login"]' // Using class, type, and value
//     ]
//   }
// };

// Locator strategies for SauceDemo login page
const LOGIN_PAGE_LOCATORS = {
  usernameInput: {
    name: 'Username Input',
    primary: '#user-name',
    fallbacks: ['[data-test="username"]', '[name="user-name"]']
  },
  passwordInput: {
    name: 'Password Input',
    primary: '#password',
    fallbacks: ['[data-test="password"]', '[name="password"]']
  },
  loginButton: {
    name: 'Login Button',
    primary: '#login-button',
    fallbacks: ['[data-test="login-button"]', '[name="login-button"]', 'input.submit-button[value="Login"]']
  },
  errorMessageContainer: {
    name: 'Error Message Container',
    primary: '[data-test="error"]',
    fallbacks: ['.error-message-container h3'] // Assuming h3 might also contain the error text
  },
  loginButton1: {
    name: 'Login Button', // This is the elementName
    primary: '#login-button',
    fallbacks: [
      '[data-test="login-button"]', // Using data-test attribute
      '[name="login-button"]', // Using name attribute
      'input.submit-button[value="Login"]' // Using class, type, and value
    ]
  }
};

Given('User navigates to the SauceDemo login page', async function () {
  await this.page.goto('https://www.saucedemo.com/');
});

Given('User is on the SauceDemo login page', async function () {
  this.log('Navigating to SauceDemo login page');
  await this.page.goto(SAUCEDEMO_URL);
  const currentUrl = this.page.url();
  assert(currentUrl === SAUCEDEMO_URL || currentUrl === SAUCEDEMO_URL + 'index.html' || currentUrl === SAUCEDEMO_URL + 'v1/', `Expected to be on ${SAUCEDEMO_URL} but was on ${currentUrl}`);
  this.log('Successfully navigated to SauceDemo login page.');
});

When('User attempts to login as {string} user', async function (userType) {
  this.log(`Attempting to login as user type: "${userType}"`);
  const user = getUser(userType);
  if (!user) {
    throw new Error(`User type "${userType}" not found or data manager failed to load user.`);
  }

  // const usernameStrategy = LOGIN_PAGE_LOCATORS.usernameInput;

  // const usernameField = await findElementRobustly(
  //   this.page,
  //   usernameStrategy.name, // e.g., "Username Input"
  //   usernameStrategy.primary, // e.g., "#user-name"
  //   usernameStrategy.fallbacks // e.g., ["[data-test='username']"]
  // );

  const usernameStrategy = LOGIN_PAGE_LOCATORS.usernameInput;
  const usernameField = await findElementRobustly(this.page, usernameStrategy.name, usernameStrategy.primary, usernameStrategy.fallbacks);
  await usernameField.fill(user.username);
  this.log(`[Login Step] Entered username: "${user.username}" using strategy for '${usernameStrategy.name}'`);

  const passwordStrategy = LOGIN_PAGE_LOCATORS.passwordInput;
  const passwordField = await findElementRobustly(this.page, passwordStrategy.name, passwordStrategy.primary, passwordStrategy.fallbacks);
  await passwordField.fill(user.password);
  this.log(`[Login Step] Entered password: "****" using strategy for '${passwordStrategy.name}'`); // Mask password in log
});

Then('User should be redirected to the SauceDemo products page - second check', async function () {
  const PRODUCTS_PAGE_URL_PATH = '/inventory.html'; // Specific to SauceDemo v1, adjust if needed
  const PRODUCTS_PAGE_HEADER_SELECTOR = '.title'; // A common element on the products page

  const expectedUrl = SAUCEDEMO_URL.endsWith('/') ? SAUCEDEMO_URL + PRODUCTS_PAGE_URL_PATH.substring(1) : SAUCEDEMO_URL + PRODUCTS_PAGE_URL_PATH;
  this.log(`Verifying redirection to products page. Expected URL to contain: "${expectedUrl}"`);

  // More robust wait: wait for a known element on the products page.
  // This also uses our self-healing, though for verification it might be simpler to use a direct locator.
  // For consistency, let's try:
  try {
    const productsHeader = await findElementRobustly(this.page, 'Products Page Header', PRODUCTS_PAGE_HEADER_SELECTOR, [], {state: 'visible', timeout: 10000});
    assert(await productsHeader.isVisible(), `Products page header "${PRODUCTS_PAGE_HEADER_SELECTOR}" not visible.`);
  } catch (e) {
    // Fallback: Check URL if specific element check fails or for an alternative verification
    this.log(`Products page header not found, attempting URL check. Error: ${e.message}`);
    await this.page.waitForURL(`**${PRODUCTS_PAGE_URL_PATH}`, {timeout: 10000});
  }

  const currentUrl = this.page.url();
  assert(currentUrl.includes(PRODUCTS_PAGE_URL_PATH), `Expected URL to include "${PRODUCTS_PAGE_URL_PATH}", but was "${currentUrl}"`);
  this.log('Successfully redirected to SauceDemo products page.');
});

// In features/step_definitions/login_steps.js
Then('User should be redirected to the SauceDemo products page', async function () {
  const currentUrl = this.page.url();
  this.log(`Current URL is: ${currentUrl}`); // <-- ADD THIS LOG

  // Add a specific wait for URL if not already robustly handled
  try {
    await this.page.waitForURL('**/inventory.html', {timeout: 10000});
    this.log('URL contains inventory.html');
  } catch (e) {
    this.log(`Failed to navigate to inventory.html. Current URL: ${this.page.url()}`);
    throw new Error(`Page did not navigate to inventory.html. Current URL: ${this.page.url()}`);
  }

  const PRODUCTS_PAGE_HEADER_SELECTOR = '.title';
  const productsHeader = await findElementRobustly(this.page, 'Products Page Header', PRODUCTS_PAGE_HEADER_SELECTOR, [], {state: 'visible', timeout: 10000}); // Increased timeout for this specific check
  assert(await productsHeader.isVisible(), `Products page header "${PRODUCTS_PAGE_HEADER_SELECTOR}" not visible.`);
  this.log('Successfully redirected to SauceDemo products page and header is visible.');
  ``;
});

When('User clicks the login button', async function () {
  // ... later in your step ...
  const loginButtonStrategy = LOGIN_PAGE_LOCATORS.loginButton;

  // The console.log you had is already handled inside findElementRobustly,
  // so you don't need it directly before the call here.
  this.log(`[Login Step] Attempting to find and click the '${loginButtonStrategy.name}'.`); // Your own step log

  const loginButtonElement = await findElementRobustly(
    this.page,
    loginButtonStrategy.name, // 1st argument: 'Login Button'
    loginButtonStrategy.primary, // 2nd argument: '#login-button'
    loginButtonStrategy.fallbacks // 3rd argument: ['[data-test="login-button"]', '[name="login-button"]', ...]
    // waitForOptions will use the default from findElementRobustly unless you pass a 5th argument
  );

  await loginButtonElement.click();
  this.log(`[Login Step] Clicked the '${loginButtonStrategy.name}'.`);
});
