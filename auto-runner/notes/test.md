Okay, excellent! Implementing a basic self-healing locator mechanism is a fantastic next step to make our framework more resilient.

We'll start with a straightforward version that tries a primary selector and then iterates through a list of fallback selectors if the primary one fails.

---
### **Next Step: Implementing Basic Self-Healing Locators**

**Goal:**
* Create a function in `utils/self_healing_locator.js` that can find elements using a primary selector and a list of fallbacks.
* Update the login steps in `features/step_definitions/login_steps.js` to use this new function for locating username, password, and login button elements.
* Ensure existing login tests continue to pass.

---

**1. Implement the Self-Healing Locator Function**

**Action:**
Open your `utils/self_healing_locator.js` file and replace its content with the following code:

**Code (`utils/self_healing_locator.js`):**
```javascript
// AI-Playwright-Framework/utils/self_healing_locator.js

/**
 * Attempts to find an element using a primary selector, and then fallback selectors if the primary fails.
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string} elementName - A logical name for the element (for logging purposes).
 * @param {string} primarySelector - The main selector (CSS or XPath) to try first.
 * @param {string[]} [fallbackSelectors=[]] - An array of alternative selectors to try if the primary fails.
 * @param {object} [waitForOptions={ state: 'visible', timeout: 7000 }] - Options for Playwright's `element.waitFor()`.
 * Increased default timeout slightly for visibility checks.
 * @returns {Promise<import('playwright').Locator>} Playwright Locator object for the found element.
 * @throws {Error} If the element cannot be found using any of the provided selectors.
 */
async function findElementRobustly(page, elementName, primarySelector, fallbackSelectors = [], waitForOptions = { state: 'visible', timeout: 7000 }) {
  console.log(`[Self-Healing] Attempting to find '${elementName}'. Primary: '${primarySelector}'`);

  try {
    const element = page.locator(primarySelector);
    // Check if the element exists and meets the waitForOptions (e.g., is visible)
    await element.waitFor(waitForOptions);
    console.log(`[Self-Healing] Found '${elementName}' using primary locator: '${primarySelector}'`);
    return element;
  } catch (error) {
    console.warn(`[Self-Healing] Primary locator for '${elementName}' ('${primarySelector}') failed. Error: ${error.message}`);
    if (fallbackSelectors && fallbackSelectors.length > 0) {
      console.log(`[Self-Healing] Trying ${fallbackSelectors.length} fallback selector(s) for '${elementName}'...`);
      for (let i = 0; i < fallbackSelectors.length; i++) {
        const fallback = fallbackSelectors[i];
        console.log(`[Self-Healing] Trying fallback #${i + 1} for '${elementName}': '${fallback}'`);
        try {
          const element = page.locator(fallback);
          await element.waitFor(waitForOptions);
          console.log(`[Self-Healing] Found '${elementName}' using fallback locator: '${fallback}'`);
          // Potential future enhancement: Implement a learning mechanism here.
          // For example, if a fallback works consistently, it could be promoted.
          return element;
        } catch (fallbackError) {
          console.warn(`[Self-Healing] Fallback locator '${fallback}' for '${elementName}' failed. Error: ${fallbackError.message}`);
        }
      }
    }
    const errorMessage = `[Self-Healing] Element '${elementName}' NOT FOUND using primary locator ('${primarySelector}') or any of its ${fallbackSelectors.length} fallback(s).`;
    console.error(errorMessage);
    throw new Error(errorMessage); // Re-throw the error to fail the test step if element not found
  }
}

module.exports = { findElementRobustly };
```

**Explanation of `findElementRobustly`:**
* It takes the Playwright `page` object, a human-readable `elementName` (for better logging), the `primarySelector`, an array of `fallbackSelectors`, and optional `waitForOptions`.
* It first tries to locate the element using `primarySelector` and waits for it to meet conditions in `waitForOptions` (e.g., be visible within 7 seconds).
* If the primary selector fails, it logs a warning and iterates through `fallbackSelectors`.
* For each fallback, it tries to locate the element and waits for it.
* If a fallback is successful, it returns the Playwright `Locator` object.
* If all selectors fail, it throws an error, which will cause the test step to fail (as it should if an element can't be found).
* Console logs are added to trace the self-healing process.

---

**2. Update Login Step Definitions to Use `findElementRobustly`**

**Action:**
Modify your `features/step_definitions/login_steps.js` file.

**Code (`features/step_definitions/login_steps.js`):**
```javascript
// AI-Playwright-Framework/features/step_definitions/login_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('node:assert');
const { getUser } = require('../../utils/data_manager');
const { findElementRobustly } = require('../../utils/self_healing_locator'); // Import our new function

const SAUCEDEMO_URL = 'https://www.saucedemo.com/';
// Removed old direct locator constants, we'll define strategies below

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
  }
};

Given('I am on the SauceDemo login page', async function () {
  this.log('Navigating to SauceDemo login page');
  await this.page.goto(SAUCEDEMO_URL);
  const currentUrl = this.page.url();
  assert(currentUrl === SAUCEDEMO_URL || currentUrl === SAUCEDEMO_URL + 'index.html' || currentUrl === SAUCEDEMO_URL + "v1/", `Expected to be on ${SAUCEDEMO_URL} but was on ${currentUrl}`);
  this.log('Successfully navigated to SauceDemo login page.');
});

When('I attempt to login as {string}', async function (userType) {
  this.log(`Attempting to login as user type: "${userType}"`);
  const user = getUser(userType);
  if (!user) {
    throw new Error(`User type "${userType}" not found or data manager failed to load user.`);
  }

  const usernameStrategy = LOGIN_PAGE_LOCATORS.usernameInput;
  const usernameField = await findElementRobustly(this.page, usernameStrategy.name, usernameStrategy.primary, usernameStrategy.fallbacks);
  await usernameField.fill(user.username);
  this.log(`[Login Step] Entered username: "${user.username}" using strategy for '${usernameStrategy.name}'`);

  const passwordStrategy = LOGIN_PAGE_LOCATORS.passwordInput;
  const passwordField = await findElementRobustly(this.page, passwordStrategy.name, passwordStrategy.primary, passwordStrategy.fallbacks);
  await passwordField.fill(user.password);
  this.log(`[Login Step] Entered password: "****" using strategy for '${passwordStrategy.name}'`); // Mask password in log
});

When('I click the login button', async function () {
  this.log('[Login Step] Clicking the login button');
  const buttonStrategy = LOGIN_PAGE_LOCATORS.loginButton;
  const loginBtn = await findElementRobustly(this.page, buttonStrategy.name, buttonStrategy.primary, buttonStrategy.fallbacks);
  await loginBtn.click();
});

Then('I should be redirected to the SauceDemo products page', async function () {
  const PRODUCTS_PAGE_URL_PATH = '/inventory.html'; // Specific to SauceDemo v1, adjust if needed
  const PRODUCTS_PAGE_HEADER_SELECTOR = '.title'; // A common element on the products page

  const expectedUrl = SAUCEDEMO_URL.endsWith('/') ? SAUCEDEMO_URL + PRODUCTS_PAGE_URL_PATH.substring(1) : SAUCEDEMO_URL + PRODUCTS_PAGE_URL_PATH;
  this.log(`Verifying redirection to products page. Expected URL to contain: "${expectedUrl}"`);
  
  // More robust wait: wait for a known element on the products page.
  // This also uses our self-healing, though for verification it might be simpler to use a direct locator.
  // For consistency, let's try:
  try {
    const productsHeader = await findElementRobustly(this.page, "Products Page Header", PRODUCTS_PAGE_HEADER_SELECTOR, [], { state: 'visible', timeout: 10000 });
    assert(await productsHeader.isVisible(), `Products page header "${PRODUCTS_PAGE_HEADER_SELECTOR}" not visible.`);
  } catch (e) {
     // Fallback: Check URL if specific element check fails or for an alternative verification
    this.log(`Products page header not found, attempting URL check. Error: ${e.message}`);
    await this.page.waitForURL(`**${PRODUCTS_PAGE_URL_PATH}`, { timeout: 10000 });
  }
  
  const currentUrl = this.page.url();
  assert(currentUrl.includes(PRODUCTS_PAGE_URL_PATH), `Expected URL to include "${PRODUCTS_PAGE_URL_PATH}", but was "${currentUrl}"`);
  this.log('Successfully redirected to SauceDemo products page.');
});

Then('I should see an error message {string}', async function (expectedErrorMessage) {
  this.log(`Verifying error message. Expecting to contain: "${expectedErrorMessage}"`);
  const errorStrategy = LOGIN_PAGE_LOCATORS.errorMessageContainer;
  
  const errorElement = await findElementRobustly(this.page, errorStrategy.name, errorStrategy.primary, errorStrategy.fallbacks, { state: 'visible', timeout: 7000 });
  const actualErrorMessage = await errorElement.textContent();
  
  this.log(`Actual error message found: "${actualErrorMessage}"`);
  assert(
    actualErrorMessage && actualErrorMessage.includes(expectedErrorMessage),
    `Expected error message to include "${expectedErrorMessage}", but got "${actualErrorMessage}"`
  );
  this.log('Error message verification successful.');
});
```

**Explanation of Changes in `login_steps.js`:**
* Imported `findElementRobustly` from `self_healing_locator.js`.
* Defined a `LOGIN_PAGE_LOCATORS` object to store the `name`, `primary` selector, and `fallbacks` array for each element we interact with on the login page. This keeps locator strategies organized.
* In the `When I attempt to login as {string}` and `When I click the login button` steps, we now call `findElementRobustly`, passing the `this.page` object and the relevant locator strategy from `LOGIN_PAGE_LOCATORS`.
* The `Then I should see an error message` step also uses `findElementRobustly` for the error message container.
* The `Then I should be redirected to the SauceDemo products page` step also attempts to use `findElementRobustly` for the page header verification, demonstrating its use beyond just input fields/buttons.
* Logging is updated to reflect the use of self-healing.
* The `Given I am on the SauceDemo login page` step includes a slightly more flexible URL check for `saucedemo.com` as I've seen it sometimes redirect to `v1/` or include `index.html`.

---

**3. Test the Implementation**

**Action:**
1.  Save both `utils/self_healing_locator.js` and `features/step_definitions/login_steps.js`.
2.  Run your login tests (which should include successful and unsuccessful login scenarios from `login_with_data_manager.feature`):
    ```sh
    npm test
    ```
    Or, if you want to run with debug mode and the specific tag:
    ```sh
    npm run dashboard:debug:test
    ```
    (Ensure `dashboard:debug:test` script in `package.json` is `cross-env PWDEBUG=1 cucumber-js --config cucumber.js --tags @your_chosen_tag_for_login_tests`)

**Expected Outcome:**
* All your existing login tests should pass.
* You should see console logs prefixed with `[Self-Healing]` indicating which locators were used (initially, it should always be the primary ones).

**How to Manually Test the "Healing" Part (Optional for now):**
To truly test the self-healing with fallbacks:
1.  Temporarily modify `login_steps.js`. For example, for the username input, change its `primary` selector in `LOGIN_PAGE_LOCATORS` to something incorrect (e.g., `#user-name-broken`).
2.  Run the test.
3.  You should see in the console logs that the primary locator failed, and then one of the fallback locators (e.g., `[data-test="username"]`) was successfully used. The test should still pass.
4.  Remember to revert the primary selector to its correct value after testing the fallback.

---

This implementation provides a basic but functional self-healing capability. We can enhance it further later with more advanced strategies, learning mechanisms, or different types of locators.

Let me know how it goes!