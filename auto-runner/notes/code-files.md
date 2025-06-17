can you provide me the complete project with code, all the files that we discussed , coded for this project in zip


Coding partner
I understand you'd like a complete, packaged ZIP file of the entire project with all the code and configurations we've discussed so far.

As a large language model, I cannot directly create or provide files (like a ZIP archive) or interact with your local file system for security and technical reasons. My capabilities are limited to generating text and code snippets.

However, I can provide you with a comprehensive, organized list of all the files and their content that we've developed together. You can then manually create these files and folders in your project directory. This is the most reliable way to ensure you have everything exactly as we've built it.

I will structure this as a guide to creating the project structure and populating each file.

Project Structure Overview
Here's a breakdown of the directories and files we've created and modified:

AI-Framework/
├── features/
│   ├── dynamic_registration.feature
│   ├── SauceDemoProductFilter.feature  (Formerly GoogleSearch.feature)
│   ├── login_with_data_manager.feature
│   └── (other .feature files you might have)
├── features/step_definitions/
│   ├── login_steps.js
│   ├── product_steps.js  (Formerly google_steps.js)
│   └── registration_steps.js
├── features/support/
│   └── world.js
├── utils/
│   ├── data_manager.js
│   └── self_healing_locator.js
├── dashboard/
│   ├── app.js
│   └── views/
│       └── index.ejs
├── reports/
│   └── (This folder will be created by Cucumber, no need to manually create files here)
├── .vscode/
│   ├── launch.json
│   └── settings.json
├── cucumber.js
├── package.json
└── (other project files like .eslintrc.js, playwright.config.js etc.)
File Contents to Create/Update:
Please go through your project and create/update these files with the provided content.

1. package.json
   Make sure your scripts and devDependencies are set up correctly. If you've been following along, you should have most of these.

JSON

{
"name": "ai-automation-framework",
"version": "1.0.0",
"description": "An AI-powered automation framework with Playwright and Cucumber.js",
"main": "index.js",
"scripts": {
"test": "cucumber-js -p default",
"start:dashboard": "node dashboard/app.js",
"explore:app": "node utils/app_explorer.js"
// Add other scripts as needed, e.g., "lint": "eslint ."
},
"keywords": [
"AI",
"Automation",
"Playwright",
"Cucumber",
"Node.js"
],
"author": "Your Name",
"license": "MIT",
"devDependencies": {
"@cucumber/cucumber": "^9.6.0",
"@faker-js/faker": "^8.4.1",
"@playwright/test": "^1.44.0",
"playwright": "^1.44.0",
"prettier": "^3.2.5",
"eslint": "^8.57.0",
"eslint-config-prettier": "^9.1.0",
"eslint-plugin-prettier": "^5.1.3"
},
"dependencies": {
"express": "^4.19.2",
"ws": "^8.17.0",
"chart.js": "^4.4.2",
"ejs": "^3.1.10"
}
}
Important: Run npm install in your terminal after making sure package.json is correct to install all dependencies.

2. cucumber.js
   This file configures how Cucumber.js runs your tests, including timeout and report format.

JavaScript

// cucumber.js
module.exports = {
default: `--require features/step_definitions/**/*.js --require features/support/**/*.js --format json:reports/cucumber_report.json --publish-quiet`
};
3. features/ directory
   features/dynamic_registration.feature
   Gherkin

# features/dynamic_registration.feature
Feature: Dynamic User Registration

Scenario: Register a unique new user
Given I am on the user registration page
When I register with dynamic user data
Then the user should be successfully registered
And I should see a success message
features/SauceDemoProductFilter.feature (Rename from GoogleSearch.feature)
Gherkin

# features/SauceDemoProductFilter.feature
Feature: Product Filter on SauceDemo

Scenario: User filters products by name (A to Z)
Given a user navigates to the SauceDemo login page
When the user logs in with "standard_user" and "secret_sauce"
And the user filters products by "Name (A to Z)"
Then the products should be sorted by "Name (A to Z)"
features/login_with_data_manager.feature
Gherkin

# features/login_with_data_manager.feature
Feature: User Login with Data Manager

Scenario: Successful login with standard user from data manager
Given I am on the login page
When I log in as a "standard_user" user
Then I should be redirected to the products page

Scenario: Login with locked out user from data manager
Given I am on the login page
When I log in as a "locked_out_user" user
Then I should see an error message "Epic sadface: Sorry, this user has been locked out."
4. features/step_definitions/ directory
   features/step_definitions/login_steps.js
   JavaScript

// features/step_definitions/login_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { selfHealingLocator } = require('../../utils/self_healing_locator');
const { getData } = require('../../utils/data_manager');

Given('I am on the login page', async function () {
await this.page.goto('https://www.saucedemo.com/');
});

When('I log in with username {string} and password {string}', async function (username, password) {
await selfHealingLocator(this.page, '#user-name', 'Username Input', { testId: 'username-field' }).fill(username);
await selfHealingLocator(this.page, '#password', 'Password Input', { testId: 'password-field' }).fill(password);
await selfHealingLocator(this.page, '#login-button', 'Login Button', { text: 'Login', role: 'button', name: 'Login' }).click();
});

When('I log in as a {string} user', async function (userType) {
const userData = getData('users', userType);

    if (!userData) {
        throw new Error(`User type '${userType}' not found in test data.`);
    }

    console.log(`[Login Step] Logging in as user type: ${userType}`);
    await selfHealingLocator(this.page, '#user-name', 'Username Input', {
        testId: 'username-field', altText: 'Username field', title: 'Enter your username'
    }).fill(userData.username);

    await selfHealingLocator(this.page, '#password', 'Password Input', {
        testId: 'password-field', altText: 'Password field', title: 'Enter your password'
    }).fill(userData.password);

    await selfHealingLocator(this.page, '#login-button', 'Login Button', {
        text: 'Login', role: 'button', name: 'Login', testId: 'login-button'
    }).click();
});

Then('I should be redirected to the products page', async function () {
await expect(this.page).toHaveURL('https://www.saucedemo.com/inventory.html');
});

Then('I should see an error message {string}', async function (errorMessage) {
const errorContainer = await selfHealingLocator(this.page, '.error-message-container', 'Error Message Container', { text: errorMessage });
await expect(errorContainer).toBeVisible();
await expect(errorContainer).toHaveText(errorMessage);
});
features/step_definitions/product_steps.js (Rename from google_steps.js)
JavaScript

// features/step_definitions/product_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { selfHealingLocator } = require('../../utils/self_healing_locator');
const { getData } = require('../../utils/data_manager');

// Given page is available via 'this.page' from World constructor

Given('a user navigates to the SauceDemo login page', async function () {
await this.page.goto('https://www.saucedemo.com/');
});

When('the user logs in with {string} and {string}', async function (userType, password) {
const userData = getData('users', userType); // Using data manager

await selfHealingLocator(this.page, '#user-name', 'Username Input', {
testId: 'username-field'
}).fill(userData.username);
await selfHealingLocator(this.page, '#password', 'Password Input', {
testId: 'password-field'
}).fill(password);
await selfHealingLocator(this.page, '#login-button', 'Login Button', {
text: 'Login',
role: 'button',
name: 'Login',
testId: 'login-button'
}).click();
});

When('the user filters products by {string}', async function (filterOption) {
await selfHealingLocator(this.page, '.product_sort_container', 'Product Sort Dropdown', {
css: 'select.product_sort_container',
testId: 'product-sort-container'
}).selectOption({ label: filterOption });
});

Then('the products should be sorted by {string}', async function (expectedOrder) {
const itemNames = await this.page.locator('.inventory_item_name').allTextContents();

if (expectedOrder === "Name (A to Z)") {
const sortedNames = [...itemNames].sort((a, b) => a.localeCompare(b));
expect(itemNames).toEqual(sortedNames);
console.log(`[Assertion] Products are sorted A to Z: ${itemNames}`);
} else if (expectedOrder === "Name (Z to A)") {
const sortedNames = [...itemNames].sort((a, b) => b.localeCompare(a));
expect(itemNames).toEqual(sortedNames);
console.log(`[Assertion] Products are sorted Z to A: ${itemNames}`);
} else {
throw new Error(`Unsupported sort order: ${expectedOrder}. Implement logic for other sorts.`);
}
});
features/step_definitions/registration_steps.js
JavaScript

// features/step_definitions/registration_steps.js
const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { selfHealingLocator } = require('../../utils/self_healing_locator');
const { generateNewUser } = require('../../utils/data_manager');

let dynamicallyGeneratedUser;

Given('I am on the user registration page', async function () {
// IMPORTANT: Replace with your actual registration URL
await this.page.goto('https://www.example.com/register');
});

When('I register with dynamic user data', async function () {
dynamicallyGeneratedUser = generateNewUser();

    console.log(`[Registration Step] Attempting to register user: ${dynamicallyGeneratedUser.username}`);

    // IMPORTANT: Adapt locators to your actual registration page
    await selfHealingLocator(this.page, '#firstName', 'First Name Input', { testId: 'firstName' }).fill(dynamicallyGeneratedUser.firstName);
    await selfHealingLocator(this.page, '#lastName', 'Last Name Input', { testId: 'lastName' }).fill(dynamicallyGeneratedUser.lastName);
    await selfHealingLocator(this.page, '#email', 'Email Input', { testId: 'email' }).fill(dynamicallyGeneratedUser.email);
    await selfHealingLocator(this.page, '#username', 'Username Input', { testId: 'username' }).fill(dynamicallyGeneratedUser.username);
    await selfHealingLocator(this.page, '#password', 'Password Input', { testId: 'password' }).fill(dynamicallyGeneratedUser.password);
    await selfHealingLocator(this.page, '#confirmPassword', 'Confirm Password Input', { testId: 'confirmPassword' }).fill(dynamicallyGeneratedUser.password);

    await selfHealingLocator(this.page, '#streetAddress', 'Street Address Input', { testId: 'streetAddress' }).fill(dynamicallyGeneratedUser.address.streetAddress);
    await selfHealingLocator(this.page, '#city', 'City Input', { testId: 'city' }).fill(dynamicallyGeneratedUser.address.city);
    await selfHealingLocator(this.page, '#state', 'State Dropdown', { testId: 'state' }).selectOption(dynamicallyGeneratedUser.address.state);
    await selfHealingLocator(this.page, '#zipCode', 'Zip Code Input', { testId: 'zipCode' }).fill(dynamicallyGeneratedUser.address.zipCode);

    await selfHealingLocator(this.page, '#registerButton', 'Register Button', { text: 'Register', role: 'button', name: 'Register' }).click();
});

Then('the user should be successfully registered', async function () {
await expect(this.page).toHaveURL(/success|dashboard/);
});

Then('I should see a success message', async function () {
const successMessageLocator = await selfHealingLocator(this.page, '.success-message', 'Success Message', { text: 'Registration Successful!' });
await expect(successMessageLocator).toBeVisible();
await expect(successMessageLocator).toHaveText('Registration Successful!');
});
5. features/support/ directory
   features/support/world.js
   This file sets up the Playwright browser and page for each scenario and manages the default timeout.

JavaScript

// features/support/world.js
const { setWorldConstructor, setDefaultTimeout, Before, After } = require('@cucumber/cucumber');
const { chromium } = require('@playwright/test'); // Import chromium browser

// Set a default timeout for all steps (e.g., 15 seconds)
setDefaultTimeout(15 * 1000); // 15000 milliseconds = 15 seconds

class CustomWorld {
constructor({ attach, parameters }) {
this.attach = attach; // For attaching screenshots/logs to reports
this.parameters = parameters; // For accessing any Cucumber parameters
}

async openBrowser() {
this.browser = await chromium.launch({ headless: true }); // Set to false for visual debugging
this.page = await this.browser.newPage();
}

async closeBrowser() {
if (this.page) {
await this.page.close();
}
if (this.browser) {
await this.browser.close();
}
}
}

setWorldConstructor(CustomWorld);

// Cucumber Hooks to manage browser lifecycle
Before(async function () {
await this.openBrowser();
});

After(async function ({ result }) {
// Take screenshot on failure
if (result.status === 'failed' && this.page) {
const screenshot = await this.page.screenshot({ fullPage: true });
this.attach(screenshot, 'image/png');
}
await this.closeBrowser();
});
6. utils/ directory
   utils/data_manager.js
   Manages both static and dynamic test data.

JavaScript

// utils/data_manager.js
const fs = require('fs');
const path = require('path');
const { faker } = require('@faker-js/faker');

const dataDirectory = path.join(__dirname, '../test_data');
const loadedData = {}; // Cache for loaded JSON files

/**
* Loads a JSON data file from the test_data directory.
* Caches the loaded data to prevent redundant file reads.
* @param {string} fileName The name of the JSON file (e.g., 'users.json').
* @returns {object} The parsed JSON data.
* @throws {Error} If the file is not found or is invalid JSON.
  */
  function loadDataFile(fileName) {
  if (loadedData[fileName]) {
  return loadedData[fileName]; // Return from cache if already loaded
  }

  const filePath = path.join(dataDirectory, fileName);
  if (!fs.existsSync(filePath)) {
  throw new Error(`Data file not found: ${filePath}`);
  }

  try {
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(fileContent);
  loadedData[fileName] = data; // Cache the data
  console.log(`[DataManager] Loaded data from: ${fileName}`);
  return data;
  } catch (error) {
  throw new Error(`Failed to load or parse data file ${fileName}: ${error.message}`);
  }
  }

/**
* Retrieves specific data from a loaded data file.
* @param {string} dataFileName The name of the data file (e.g., 'users').
* @param {string} dataKey The key within the JSON file (e.g., 'standard_user').
* @returns {any} The requested data.
* @throws {Error} If the file or key is not found.
  */
  function getData(dataFileName, dataKey) {
  const fullFileName = `${dataFileName}.json`;
  const data = loadDataFile(fullFileName);

  if (!(dataKey in data)) {
  throw new Error(`Data key '${dataKey}' not found in file '${fullFileName}'`);
  }

  return data[dataKey];
  }

// Function to generate a unique new user
function generateNewUser() {
const firstName = faker.person.firstName();
const lastName = faker.person.lastName();
const email = faker.internet.email({ firstName, lastName, provider: 'example.com' });
const username = faker.internet.userName({ firstName, lastName }) + faker.string.uuid().substring(0, 4);
const password = faker.internet.password({ length: 12, memorable: true, pattern: /[A-Za-z0-9!@#$%^&*]/ });
const streetAddress = faker.location.streetAddress();
const city = faker.location.city();
const state = faker.location.state({ abbreviated: true });
const zipCode = faker.location.zipCode();
const phoneNumber = faker.phone.number('###-###-####');

    console.log(`[DataManager] Generating new user: ${username}`);

    return {
        firstName,
        lastName,
        email,
        username,
        password,
        address: {
            streetAddress,
            city,
            state,
            zipCode
        },
        phoneNumber
    };
}

// Example: Function to generate a new product
function generateNewProduct() {
return {
name: faker.commerce.productName() + ' ' + faker.string.uuid().substring(0, 6),
description: faker.commerce.productDescription(),
price: faker.commerce.price({ min: 10, max: 1000, dec: 2 }),
category: faker.commerce.department(),
material: faker.commerce.productMaterial()
};
}

module.exports = {
getData,
loadDataFile,
generateNewUser,
generateNewProduct
};
utils/self_healing_locator.js
The core self-healing logic.

JavaScript

// utils/self_healing_locator.js
const { expect } = require('@playwright/test');

const healedLocators = []; // Array to store successful healing records

/**
* Attempts to locate an element using a primary locator. If it fails,
* it tries a series of fallback strategies.
* @param {import('@playwright/test').Page} page - The Playwright Page object.
* @param {string | import('@playwright/test').Locator} primaryLocator - The initial CSS selector or Playwright Locator.
* @param {string} elementName - A human-readable name for the element being located.
* @param {object} fallbackStrategies - An object containing fallback strategies.
* @param {string} [fallbackStrategies.testId] - A data-testid attribute value.
* @param {string} [fallbackStrategies.text] - Visible text content.
* @param {string} [fallbackStrategies.role] - ARIA role (e.g., 'button', 'textbox'). Can be combined with 'name'.
* @param {string} [fallbackStrategies.name] - ARIA name (e.g., label for input, text for button).
* @param {string} [fallbackStrategies.altText] - Alt text for images or other elements.
* @param {string} [fallbackStrategies.title] - Title attribute value.
* @param {string} [fallbackStrategies.css] - A fallback CSS selector.
* @param {number} [timeout=5000] - Custom timeout for locating the element.
* @returns {Promise<import('@playwright/test').Locator>} A Promise that resolves to a Playwright Locator.
* @throws {Error} If the element cannot be located after all strategies.
  */
  async function selfHealingLocator(
  page,
  primaryLocator,
  elementName,
  fallbackStrategies = {},
  options = {}
  ) {
  let locator = page.locator(primaryLocator, options);
  let found = false;
  let usedStrategy = 'Primary Locator';
  let suggestedNewLocator = primaryLocator; // Start with primary, update if healed
  const timeout = options.timeout || 5000;

  // Try with primary locator first
  try {
  await locator.waitFor({ state: 'visible', timeout: timeout });
  found = true;
  console.log(`[Self-Healing] Found '${elementName}' using Primary Locator: '${primaryLocator}'`);
  return locator;
  } catch (e) {
  console.warn(`[Self-Healing] Primary locator failed for '${elementName}' (${primaryLocator}). Trying fallbacks...`);
  }

  // --- Fallback Strategies (ordered by robustness/preference) ---

  // 1. ByRole + Name (highly robust)
  if (!found && fallbackStrategies.role) {
  try {
  locator = page.getByRole(fallbackStrategies.role, { name: fallbackStrategies.name, exact: true });
  await locator.waitFor({ state: 'visible', timeout: timeout });
  found = true;
  usedStrategy = `ByRole('${fallbackStrategies.role}', {name: '${fallbackStrategies.name}'})`;
  suggestedNewLocator = `page.getByRole('${fallbackStrategies.role}', {name: '${fallbackStrategies.name}'})`;
  console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
  } catch (e) {
  console.warn(`[Self-Healing] Fallback ByRole failed for '${elementName}'.`);
  }
  }

  // 2. ByTestId (very robust)
  if (!found && fallbackStrategies.testId) {
  try {
  locator = page.getByTestId(fallbackStrategies.testId);
  await locator.waitFor({ state: 'visible', timeout: timeout });
  found = true;
  usedStrategy = `ByTestId('${fallbackStrategies.testId}')`;
  suggestedNewLocator = `page.getByTestId('${fallbackStrategies.testId}')`;
  console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
  } catch (e) {
  console.warn(`[Self-Healing] Fallback ByTestId failed for '${elementName}'.`);
  }
  }

  // 3. ByText (robust for visible text)
  if (!found && fallbackStrategies.text) {
  try {
  locator = page.getByText(fallbackStrategies.text, { exact: true });
  await locator.waitFor({ state: 'visible', timeout: timeout });
  found = true;
  usedStrategy = `ByText('${fallbackStrategies.text}')`;
  suggestedNewLocator = `page.getByText('${fallbackStrategies.text}')`;
  console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
  } catch (e) {
  console.warn(`[Self-Healing] Fallback ByText failed for '${elementName}'.`);
  }
  }

  // 4. ByAltText (for images/elements with alt text)
  if (!found && fallbackStrategies.altText) {
  try {
  locator = page.getByAltText(fallbackStrategies.altText, { exact: true });
  await locator.waitFor({ state: 'visible', timeout: timeout });
  found = true;
  usedStrategy = `ByAltText('${fallbackStrategies.altText}')`;
  suggestedNewLocator = `page.getByAltText('${fallbackStrategies.altText}')`;
  console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
  } catch (e) {
  console.warn(`[Self-Healing] Fallback ByAltText failed for '${elementName}'.`);
  }
  }

  // 5. ByTitle (for elements with title attribute)
  if (!found && fallbackStrategies.title) {
  try {
  locator = page.getByTitle(fallbackStrategies.title, { exact: true });
  await locator.waitFor({ state: 'visible', timeout: timeout });
  found = true;
  usedStrategy = `ByTitle('${fallbackStrategies.title}')`;
  suggestedNewLocator = `page.getByTitle('${fallbackStrategies.title}')`;
  console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
  } catch (e) {
  console.warn(`[Self-Healing] Fallback ByTitle failed for '${elementName}'.`);
  }
  }

  // 6. Fallback CSS (if all semantic locators fail)
  if (!found && fallbackStrategies.css) {
  try {
  locator = page.locator(fallbackStrategies.css, options);
  await locator.waitFor({ state: 'visible', timeout: timeout });
  found = true;
  usedStrategy = `CSS Selector ('${fallbackStrategies.css}')`;
  suggestedNewLocator = `page.locator('${fallbackStrategies.css}')`;
  console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
  } catch (e) {
  console.warn(`[Self-Healing] Fallback CSS failed for '${elementName}'.`);
  }
  }

  // If a fallback worked, record the healing event
  if (found) {
  healedLocators.push({
  elementName: elementName,
  originalLocator: primaryLocator,
  healedLocator: suggestedNewLocator,
  strategyUsed: usedStrategy,
  timestamp: new Date().toISOString()
  });
  return locator;
  }

  // If no fallback worked, throw an error
  if (!found) {
  const errorMessage = `[Self-Healing] Failed to locate '${elementName}' using primary locator '${primaryLocator}' and all fallback strategies.`;
  console.error(errorMessage);
  throw new Error(errorMessage);
  }
  }

module.exports = {
selfHealingLocator,
healedLocators
};
7. test_data/ directory
   test_data/users.json
   JSON

// test_data/users.json
{
"standard_user": {
"username": "standard_user",
"password": "secret_sauce"
},
"locked_out_user": {
"username": "locked_out_user",
"password": "secret_sauce"
},
"problem_user": {
"username": "problem_user",
"password": "secret_sauce"
},
"performance_glitch_user": {
"username": "performance_glitch_user",
"password": "secret_sauce"
},
"test_user_1": {
"username": "user1@example.com",
"password": "password123"
},
"test_user_2": {
"username": "user2@example.com",
"password": "password456"
}
}
8. dashboard/ directory
   dashboard/app.js
   The backend for your reporting dashboard.

JavaScript

// dashboard/app.js
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const fsp = require('fs/promises');
const os = require('os');
const { healedLocators } = require('../utils/self_healing_locator');

const app = express();
const port = 3000;
const projectRoot = path.resolve(__dirname, '..'); // Assuming dashboard is in project_root/dashboard

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (if you add any)

// --- Helper Functions ---

function calculateCucumberSummary(report) {
let totalScenarios = 0;
let passedScenarios = 0;
let failedScenarios = 0;
let skippedScenarios = 0;
let totalSteps = 0;
let passedSteps = 0;
let failedSteps = 0;
let skippedSteps = 0;
let undefinedSteps = 0;

    report.forEach(feature => {
        feature.elements.forEach(scenario => {
            totalScenarios++;
            let scenarioFailed = false;
            let scenarioSkipped = false;
            let scenarioUndefined = false;

            scenario.steps.forEach(step => {
                totalSteps++;
                if (step.result) {
                    if (step.result.status === 'passed') {
                        passedSteps++;
                    } else if (step.result.status === 'failed') {
                        failedSteps++;
                        scenarioFailed = true;
                    } else if (step.result.status === 'skipped') {
                        skippedSteps++;
                        scenarioSkipped = true;
                    } else if (step.result.status === 'undefined') {
                        undefinedSteps++;
                        scenarioUndefined = true;
                    }
                }
            });

            if (scenarioFailed) {
                failedScenarios++;
            } else if (scenarioUndefined) {
                undefinedSteps++; // Count scenario as undefined if any step is undefined
            } else if (scenarioSkipped) {
                skippedScenarios++;
            } else {
                passedScenarios++;
            }
        });
    });

    return {
        totalScenarios,
        passedScenarios,
        failedScenarios,
        skippedScenarios,
        totalSteps,
        passedSteps,
        failedSteps,
        skippedSteps,
        undefinedSteps,
        timestamp: new Date().toISOString()
    };
}

const historyFilePath = path.join(projectRoot, 'reports/summary_history.json');

async function saveSummaryToHistory(summary) {
try {
let history = [];
if (fs.existsSync(historyFilePath)) {
const data = await fsp.readFile(historyFilePath, 'utf8');
history = JSON.parse(data);
}
history.push(summary);
await fsp.writeFile(historyFilePath, JSON.stringify(history, null, 2), 'utf8');
console.log('[Dashboard] Summary saved to history.');
} catch (error) {
console.error('[Dashboard] Error saving summary to history:', error);
}
}

async function getFlakinessReport(limit = 10) {
try {
if (!fs.existsSync(historyFilePath)) {
return [];
}
const data = await fsp.readFile(historyFilePath, 'utf8');
const history = JSON.parse(data);

        if (history.length === 0) {
            return [];
        }

        const scenarioFailureCounts = {};
        history.forEach(run => {
            if (run.failedScenarios > 0 || run.undefinedSteps > 0) { // Only count runs with failures/undefined steps
                // Re-read the full report for detailed scenario names if needed
                // For simplicity here, we're doing a high-level summary.
                // A more robust flakiness report would parse scenario names from each historical cucumber_report.json
                // and track their pass/fail status across runs.
            }
        });

        // This is a simplified flakiness report based on overall run status.
        // For actual scenario-level flakiness, you'd need to store scenario results per run.
        // For now, let's just show a dummy or empty array for simplicity if not implemented fully.
        return [];

    } catch (error) {
        console.error('Error generating flakiness report:', error);
        return [];
    }
}

function analyzeFailure(errorMessage, step) {
if (!errorMessage) {
return 'Unknown Error';
}

    const lowerCaseMessage = errorMessage.toLowerCase();

    // 1. Element Not Found / Locator Issues
    if (lowerCaseMessage.includes('locator resolved to no element') ||
        lowerCaseMessage.includes('element is not visible') ||
        lowerCaseMessage.includes('element is not enabled') ||
        lowerCaseMessage.includes('element is not editable') ||
        (lowerCaseMessage.includes('timeout') && (lowerCaseMessage.includes('waiting for selector') || lowerCaseMessage.includes('waiting for element')))) {
        return 'Element Not Found / Locator Issue';
    }

    // 2. Assertion Failures
    if (lowerCaseMessage.includes('assertionerror') ||
        (lowerCaseMessage.includes('expected') && lowerCaseMessage.includes('received')) ||
        lowerCaseMessage.includes('did not match expected') ||
        lowerCaseMessage.includes('tohaveurl') ||
        lowerCaseMessage.includes('tohavescreenshot') ||
        lowerCaseMessage.includes('expect(locator).tobevisible')) {
        return 'Assertion Failure';
    }

    // 3. Navigation / Network Issues
    if (lowerCaseMessage.includes('navigation failed') ||
        lowerCaseMessage.includes('net::err_') ||
        lowerCaseMessage.includes('network error') ||
        lowerCaseMessage.includes('page closed') ||
        lowerCaseMessage.includes('target closed') ||
        lowerCaseMessage.includes('err_connection_refused')) {
        return 'Navigation / Network Issue';
    }

    // 4. API / Backend Issues
    if (lowerCaseMessage.includes('server error') ||
        lowerCaseMessage.includes('api failed') ||
        lowerCaseMessage.includes('internal server error') ||
        lowerCaseMessage.includes('status code 500') || lowerCaseMessage.includes('status code 400') ||
        lowerCaseMessage.includes('status code 401') || lowerCaseMessage.includes('status code 403')) {
        return 'API / Backend Issue';
    }

    // 5. Playwright Specific Errors
    if (lowerCaseMessage.includes('playwright error') ||
        lowerCaseMessage.includes('context closed') ||
        lowerCaseMessage.includes('browser closed') ||
        lowerCaseMessage.includes('expect(locator).tohavetitle')) { // Add this if toHaveTitle fails with non-title content
        return 'Playwright Framework Error';
    }

    // 6. Undefined Steps (from Cucumber.js)
    if (step && step.status === 'undefined') {
        return 'Cucumber Step Undefined';
    }

    // Default / Generic Error
    return 'Uncategorized Error';
}


let currentHealedLocatorsSession = []; // Variable to hold healed locators for the current session

// --- WebSocket Server Setup ---
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', ws => {
let childProcess = null;

    ws.on('message', async (message) => {
        const data = JSON.parse(message);
        const scriptName = data.command;
        let command;
        let args;
        let env = { ...process.env }; // Clone environment for modification

        // Clear healed locators at the start of a new test run
        if (scriptName.startsWith('test')) {
            healedLocators.length = 0; // Clear the array in self_healing_locator.js
            currentHealedLocatorsSession = []; // Clear our session storage
            ws.send(JSON.stringify({ type: 'log', message: 'Starting new test run. Self-healing logs cleared.\n', timestamp: new Date().toISOString() }));
        }

        if (scriptName === 'test') {
            command = 'npm';
            args = ['test']; // Use npm test script
        } else if (scriptName === 'explore:app') {
            command = 'npm';
            args = ['run', 'explore:app'];
            env.PWDEBUG = '1'; // Open Playwright Inspector
        } else if (scriptName.startsWith('generate:tests')) {
            command = 'npm';
            args = ['run', scriptName];
        } else {
            ws.send(JSON.stringify({ type: 'log', message: `Unknown command: ${scriptName}\n`, timestamp: new Date().toISOString() }));
            ws.send(JSON.stringify({ type: 'status', message: `Unknown command: ${scriptName}.` }));
            return;
        }

        ws.send(JSON.stringify({ type: 'status', message: `Running command: ${command} ${args.join(' ')}` }));
        childProcess = spawn(command, args, { cwd: projectRoot, env: env, shell: true });

        childProcess.stdout.on('data', (data) => {
            ws.send(JSON.stringify({ type: 'log', message: data.toString(), timestamp: new Date().toISOString() }));
        });

        childProcess.stderr.on('data', (data) => {
            ws.send(JSON.stringify({ type: 'log', message: data.toString(), timestamp: new Date().toISOString() }));
        });

        childProcess.on('close', async (code) => {
            ws.send(JSON.stringify({ type: 'log', message: `Command '${scriptName}' exited with code ${code}.\n`, timestamp: new Date().toISOString() }));
            ws.send(JSON.JSON.stringify({ type: 'status', message: `Command '${scriptName}' completed with code ${code}.` }));

            // Process Cucumber report after tests
            if (scriptName === 'test') {
                const cucumberReportPath = path.join(projectRoot, 'reports/cucumber_report.json');
                if (fs.existsSync(cucumberReportPath)) {
                    try {
                        const reportContent = await fsp.readFile(cucumberReportPath, 'utf8');
                        const report = JSON.parse(reportContent);
                        const summary = calculateCucumberSummary(report);
                        await saveSummaryToHistory(summary);
                        ws.send(JSON.stringify({ type: 'summary', summary: summary }));
                    } catch (error) {
                        console.error('Error processing Cucumber report:', error);
                        ws.send(JSON.stringify({ type: 'error', message: `Failed to process Cucumber report: ${error.message}` }));
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Cucumber report not found after test run.' }));
                }

                // After test run, copy healed locators for current session storage
                currentHealedLocatorsSession = [...healedLocators];
                console.log(`[Dashboard] Captured ${currentHealedLocatorsSession.length} healed locators from run.`);
            }

            childProcess = null;
        });

        childProcess.on('error', (err) => {
            console.error(`Failed to start child process: ${err}`);
            ws.send(JSON.stringify({ type: 'log', message: `Error starting command: ${err.message}\n`, timestamp: new Date().toISOString() }));
            ws.send(JSON.stringify({ type: 'status', message: `Command '${scriptName}' failed to start.` }));
            childProcess = null;
        });
    });

    ws.on('close', () => {
        if (childProcess) {
            console.log('Client disconnected, killing child process...');
            childProcess.kill();
        }
    });
});

// --- Express Routes ---

app.get('/', (req, res) => {
res.render('index');
});

app.get('/api/summary', async (req, res) => {
try {
if (fs.existsSync(historyFilePath)) {
const data = await fsp.readFile(historyFilePath, 'utf8');
const history = JSON.parse(data);
res.json(history[history.length - 1] || null);
} else {
res.json(null);
}
} catch (error) {
console.error('Error fetching summary:', error);
res.status(500).json({ error: 'Failed to fetch summary data' });
}
});

app.get('/api/trend', async (req, res) => {
try {
if (fs.existsSync(historyFilePath)) {
const data = await fsp.readFile(historyFilePath, 'utf8');
const history = JSON.parse(data);
res.json(history);
} else {
res.json([]);
}
} catch (error) {
console.error('Error fetching trend:', error);
res.status(500).json({ error: 'Failed to fetch trend data' });
}
});

app.get('/api/flakiness', async (req, res) => {
const report = await getFlakinessReport();
res.json(report);
});


app.get('/api/latest-full-report', (req, res) => {
const cucumberReportPath = path.join(projectRoot, 'reports/cucumber_report.json');

    if (!fs.existsSync(cucumberReportPath)) {
        return res.status(404).json({ error: 'Latest Cucumber report not found.' });
    }

    try {
        const reportContent = fs.readFileSync(cucumberReportPath, 'utf8');
        const report = JSON.parse(reportContent);

        // --- ADD ROOT CAUSE ANALYSIS TO THE REPORT ---
        report.forEach(feature => {
            feature.elements.forEach(scenario => {
                scenario.steps.forEach(step => {
                    if (step.result && (step.result.status === 'failed' || step.result.status === 'undefined')) {
                        step.result.rootCause = analyzeFailure(step.result.error_message, step.result);
                    }
                });
            });
        });
        // --- END ROOT CAUSE ANALYSIS ---

        res.json(report);
    } catch (error) {
        console.error(`Error parsing latest Cucumber report: ${error.message}`);
        res.status(500).json({ error: 'Failed to parse latest Cucumber report JSON.' });
    }
});

app.get('/api/healed-tests', (req, res) => {
res.json(currentHealedLocatorsSession);
});


const server = app.listen(port, () => {
console.log(`Dashboard server running at http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
wss.handleUpgrade(request, socket, head, ws => {
wss.emit('connection', ws, request);
});
});

dashboard/views/index.ejs
The frontend dashboard UI.

HTML

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Automation Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f7f6;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background-color: #fff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        h1, h2, h3 {
            color: #0056b3;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
            margin-top: 25px;
        }
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 25px;
            border-bottom: 2px solid #e0e0e0;
            padding-bottom: 10px;
        }
        .controls, .summary, .trend-chart, .flaky-tests, .test-details, .healed-tests-section {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            background-color: #fdfdfd;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        .controls button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 18px;
            margin-right: 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 1em;
            transition: background-color 0.2s ease;
        }
        .controls button:hover:not(:disabled) {
            background-color: #0056b3;
        }
        .controls button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
        .status-message {
            margin-top: 15px;
            padding: 10px;
            border-radius: 5px;
            background-color: #e9ecef;
            color: #495057;
            font-size: 0.9em;
        }
        .log-area {
            background-color: #282c34;
            color: #abb2bf;
            padding: 15px;
            border-radius: 8px;
            font-family: 'Fira Code', 'Cascadia Code', monospace;
            font-size: 0.9em;
            max-height: 400px;
            overflow-y: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            line-height: 1.4;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        .summary-item {
            background-color: #e9f7ef;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 1px 5px rgba(0,0,0,0.08);
            transition: transform 0.2s ease;
        }
        .summary-item:hover {
            transform: translateY(-3px);
        }
        .summary-item h3 {
            margin-top: 0;
            margin-bottom: 10px;
            color: #0056b3;
            border-bottom: none;
            padding-bottom: 0;
        }
        .summary-item p {
            font-size: 1.8em;
            font-weight: bold;
            margin: 0;
        }
        .summary-item.passed { color: #28a745; } /* Green */
        .summary-item.failed { color: #dc3545; } /* Red */
        .summary-item.skipped { color: #ffc107; } /* Yellow */
        .summary-item.total { color: #17a2b8; } /* Blue-green */
        .summary-item.undefined { color: #6c757d; } /* Gray */

        /* Trend Chart */
        .chart-container {
            position: relative;
            height: 300px;
            width: 100%;
            margin-top: 20px;
        }

        /* Flaky Tests */
        .flaky-tests-list {
            list-style-type: none;
            padding: 0;
        }
        .flaky-tests-list li {
            background-color: #fff3cd;
            border: 1px solid #ffeeba;
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 5px;
            font-size: 0.9em;
        }
        .flaky-tests-list li strong {
            color: #856404;
        }

        /* Test Details */
        .feature-details {
            margin-bottom: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            background-color: #fdfdfd;
        }
        .feature-summary, .scenario-summary {
            padding: 10px 15px;
            background-color: #e9e9e9;
            cursor: pointer;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
            border-radius: 5px;
        }
        .scenario-details {
            padding: 10px 15px;
            border-bottom: 1px dashed #eee;
        }
        .scenario-details:last-child {
            border-bottom: none;
        }
        .step-details {
            padding: 8px 0;
            border-left: 3px solid transparent;
            padding-left: 10px;
            margin-left: 10px;
        }
        .step-details.passed { border-left-color: #28a745; }
        .step-details.failed { border-left-color: #dc3545; }
        .step-details.skipped { border-left-color: #ffc107; }
        .step-details.pending { border-left-color: #17a2b8; }
        .step-details.undefined { border-left-color: #6c757d; }

        .error-message {
            color: #dc3545;
            font-family: 'Courier New', Courier, monospace;
            white-space: pre-wrap;
            word-break: break-word;
            font-size: 0.85em;
            margin-top: 5px;
            padding: 5px;
            background-color: #ffebeb;
            border: 1px solid #dc3545;
            border-radius: 3px;
        }
        .root-cause-suggestion {
            font-weight: bold;
            color: #0056b3;
            margin-top: 5px;
            padding: 5px;
            border-left: 3px solid #0056b3;
            background-color: #e6f7ff;
            font-size: 0.9em;
        }
        /* Healed Tests */
        .healed-tests-section {
            background-color: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .healed-tests-list {
            list-style-type: none;
            padding: 0;
        }
        .healed-tests-list li {
            background-color: #e6ffe6;
            border: 1px solid #aaffaa;
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 5px;
            font-size: 0.9em;
        }
        .healed-tests-list li strong {
            color: #28a745;
        }
        .healed-tests-list li code {
            background-color: #f0f0f0;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', Courier, monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI-Powered Automation Dashboard</h1>

        <div class="controls">
            <h2>Controls</h2>
            <button id="runTestsButton">Run All Tests</button>
            <button id="exploreAppButton">Explore App (Playwright Inspector)</button>
            <div class="status-message" id="statusMessage">Awaiting command...</div>
        </div>

        <div class="summary">
            <h2>Latest Test Run Summary</h2>
            <div id="summaryGrid" class="summary-grid">
                <div class="summary-item total">
                    <h3>Total Scenarios</h3>
                    <p id="totalScenarios">0</p>
                </div>
                <div class="summary-item passed">
                    <h3>Passed Scenarios</h3>
                    <p id="passedScenarios">0</p>
                </div>
                <div class="summary-item failed">
                    <h3>Failed Scenarios</h3>
                    <p id="failedScenarios">0</p>
                </div>
                <div class="summary-item skipped">
                    <h3>Skipped Scenarios</h3>
                    <p id="skippedScenarios">0</p>
                </div>
                <div class="summary-item total">
                    <h3>Total Steps</h3>
                    <p id="totalSteps">0</p>
                </div>
                <div class="summary-item passed">
                    <h3>Passed Steps</h3>
                    <p id="passedSteps">0</p>
                </div>
                <div class="summary-item failed">
                    <h3>Failed Steps</h3>
                    <p id="failedSteps">0</p>
                </div>
                <div class="summary-item skipped">
                    <h3>Skipped Steps</h3>
                    <p id="skippedSteps">0</p>
                </div>
                <div class="summary-item undefined">
                    <h3>Undefined Steps</h3>
                    <p id="undefinedSteps">0</p>
                </div>
            </div>
        </div>

        <div class="trend-chart">
            <h2>Test Run Trend</h2>
            <div class="chart-container">
                <canvas id="runTrendChart"></canvas>
            </div>
        </div>

        <div class="flaky-tests">
            <div class="section-header">
                <h2>Flaky Tests (Last 10 Runs)</h2>
                <span id="flakyTestsStatus"></span>
            </div>
            <div id="flakyTestsList">
                <p>No flakiness data available.</p>
            </div>
        </div>

        <div class="test-details">
            <h2>Latest Test Run Details</h2>
            <div id="latestReportDetails">
                <p>No detailed report loaded. Run tests first.</p>
            </div>
        </div>

        <div class="healed-tests-section">
            <h2>Healed Tests / Locator Update Suggestions</h2>
            <div id="healedTestsList">
                <p>No healed locators from the last run.</p>
            </div>
        </div>

        <div class="log-area">
            <h2>Console Log</h2>
            <pre id="logOutput"></pre>
        </div>
    </div>

    <script>
        const logOutput = document.getElementById('logOutput');
        const statusMessage = document.getElementById('statusMessage');
        const runTestsButton = document.getElementById('runTestsButton');
        const exploreAppButton = document.getElementById('exploreAppButton');
        const totalScenariosElem = document.getElementById('totalScenarios');
        const passedScenariosElem = document.getElementById('passedScenarios');
        const failedScenariosElem = document.getElementById('failedScenarios');
        const skippedScenariosElem = document.getElementById('skippedScenarios');
        const totalStepsElem = document.getElementById('totalSteps');
        const passedStepsElem = document.getElementById('passedSteps');
        const failedStepsElem = document.getElementById('failedSteps');
        const skippedStepsElem = document.getElementById('skippedSteps');
        const undefinedStepsElem = document.getElementById('undefinedSteps');
        const runTrendChartCanvas = document.getElementById('runTrendChart').getContext('2d');
        const latestReportDetailsElem = document.getElementById('latestReportDetails');
        const flakyTestsListElem = document.getElementById('flakyTestsList');
        const flakyTestsStatusElem = document.getElementById('flakyTestsStatus');

        let ws;
        let runTrendChart;

        function getStatusClass(status) {
            switch (status) {
                case 'passed': return 'passed';
                case 'failed': return 'failed';
                case 'skipped': return 'skipped';
                case 'pending': return 'pending';
                case 'undefined': return 'undefined';
                default: return '';
            }
        }

        function setButtonsState(enabled) {
            runTestsButton.disabled = !enabled;
            exploreAppButton.disabled = !enabled;
            // Disable/enable other buttons as needed
        }

        function connectWebSocket() {
            if (ws && ws.readyState === WebSocket.OPEN) {
                return;
            }

            ws = new WebSocket(`ws://${window.location.host}`);

            ws.onopen = () => {
                statusMessage.textContent = 'Connected to dashboard server.';
                setButtonsState(true);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'log') {
                    logOutput.textContent += data.message;
                    logOutput.scrollTop = logOutput.scrollHeight; // Auto-scroll to bottom
                } else if (data.type === 'status') {
                    statusMessage.textContent = data.message;
                    if (data.message.includes('completed') || data.message.includes('failed to start')) {
                        setButtonsState(true);
                        loadSummaryData();
                        loadTrendData();
                        loadFlakinessReport();
                        loadLatestReportDetails();
                        loadHealedTests(); // NEW: Load healed tests after a run completes
                    }
                } else if (data.type === 'summary') {
                    updateSummaryDashboard(data.summary);
                } else if (data.type === 'error') {
                    statusMessage.textContent = `Error: ${data.message}`;
                    setButtonsState(true);
                }
            };

            ws.onclose = () => {
                statusMessage.textContent = 'Disconnected from dashboard server. Retrying in 5 seconds...';
                setButtonsState(false);
                setTimeout(connectWebSocket, 5000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                statusMessage.textContent = 'WebSocket error. Check console for details.';
            };
        }

        function sendMessage(command) {
            if (ws && ws.readyState === WebSocket.OPEN) {
                setButtonsState(false);
                logOutput.textContent = ''; // Clear log on new command
                statusMessage.textContent = `Sending command: ${command}...`;
                ws.send(JSON.stringify({ command: command }));
            } else {
                statusMessage.textContent = 'Not connected to server. Please wait or refresh.';
            }
        }

        runTestsButton.addEventListener('click', () => {
            sendMessage('test');
        });

        exploreAppButton.addEventListener('click', () => {
            sendMessage('explore:app');
        });

        async function loadSummaryData() {
            try {
                const response = await fetch('/api/summary');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const summary = await response.json();
                if (summary) {
                    updateSummaryDashboard(summary);
                    statusMessage.textContent = 'Latest summary loaded.';
                } else {
                    statusMessage.textContent = 'No summary data available yet.';
                    updateSummaryDashboard({
                        totalScenarios: 0, passedScenarios: 0, failedScenarios: 0, skippedScenarios: 0,
                        totalSteps: 0, passedSteps: 0, failedSteps: 0, skippedSteps: 0, undefinedSteps: 0
                    });
                }
            } catch (error) {
                console.error('Error loading summary:', error);
                statusMessage.textContent = `Error loading summary: ${error.message}`;
            }
        }

        function updateSummaryDashboard(summary) {
            totalScenariosElem.textContent = summary.totalScenarios;
            passedScenariosElem.textContent = summary.passedScenarios;
            failedScenariosElem.textContent = summary.failedScenarios;
            skippedScenariosElem.textContent = summary.skippedScenarios;
            totalStepsElem.textContent = summary.totalSteps;
            passedStepsElem.textContent = summary.passedSteps;
            failedStepsElem.textContent = summary.failedSteps;
            skippedStepsElem.textContent = summary.skippedSteps;
            undefinedStepsElem.textContent = summary.undefinedSteps;
        }

        async function loadTrendData() {
            try {
                const response = await fetch('/api/trend');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const history = await response.json();

                if (runTrendChart) {
                    runTrendChart.destroy();
                }

                if (history.length > 0) {
                    const labels = history.map((_, index) => `Run ${index + 1}`);
                    const passedData = history.map(s => s.passedScenarios);
                    const failedData = history.map(s => s.failedScenarios);
                    const skippedData = history.map(s => s.skippedScenarios);

                    runTrendChart = new Chart(runTrendChartCanvas, {
                        type: 'line',
                        data: {
                            labels: labels,
                            datasets: [
                                {
                                    label: 'Passed Scenarios',
                                    data: passedData,
                                    borderColor: '#28a745',
                                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                                    fill: true,
                                    tension: 0.1
                                },
                                {
                                    label: 'Failed Scenarios',
                                    data: failedData,
                                    borderColor: '#dc3545',
                                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                                    fill: true,
                                    tension: 0.1
                                },
                                {
                                    label: 'Skipped Scenarios',
                                    data: skippedData,
                                    borderColor: '#ffc107',
                                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                                    fill: true,
                                    tension: 0.1
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Number of Scenarios'
                                    },
                                    ticks: {
                                        precision: 0
                                    }
                                }
                            },
                            plugins: {
                                title: {
                                    display: true,
                                    text: 'Scenario Pass/Fail Trend Over Time'
                                }
                            }
                        }
                    });
                } else {
                    runTrendChartCanvas.clearRect(0, 0, runTrendChartCanvas.canvas.width, runTrendChartCanvas.canvas.height);
                }
            } catch (error) {
                console.error('Error loading trend data:', error);
            }
        }

        async function loadFlakinessReport() {
            flakyTestsListElem.innerHTML = '<p>Loading flakiness report...</p>';
            try {
                const response = await fetch('/api/flakiness');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const report = await response.json();

                if (report.length === 0) {
                    flakyTestsListElem.innerHTML = '<p>No flakiness data available.</p>';
                    flakyTestsStatusElem.textContent = '';
                } else {
                    const ul = document.createElement('ul');
                    ul.className = 'flaky-tests-list';
                    report.forEach(item => {
                        const li = document.createElement('li');
                        li.innerHTML = `<strong>Scenario:</strong> ${item.scenarioName} - Failed ${item.failureCount} times in last ${item.totalRuns} runs.`;
                        ul.appendChild(li);
                    });
                    flakyTestsListElem.innerHTML = '';
                    flakyTestsListElem.appendChild(ul);
                    flakyTestsStatusElem.textContent = `Found ${report.length} potentially flaky scenarios.`;
                }
            } catch (error) {
                console.error('Error loading flakiness report:', error);
                flakyTestsListElem.innerHTML = `<p style="color: red;">Error loading flakiness report: ${error.message}</p>`;
            }
        }

        async function loadLatestReportDetails() {
            latestReportDetailsElem.innerHTML = 'Loading latest report details...';
            try {
                const response = await fetch('/api/latest-full-report');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const report = await response.json();

                latestReportDetailsElem.innerHTML = '';

                if (report.length === 0) {
                    latestReportDetailsElem.innerHTML = '<p>No detailed report found. Run tests first.</p>';
                    return;
                }

                report.forEach(feature => {
                    const featureDetails = document.createElement('details');
                    featureDetails.className = 'feature-details';
                    const featureSummary = document.createElement('summary');
                    featureSummary.className = 'feature-summary';
                    featureSummary.textContent = `Feature: ${feature.name || 'Unnamed Feature'}`;
                    featureDetails.appendChild(featureSummary);

                    feature.elements.forEach(scenario => {
                        const scenarioDetails = document.createElement('details');
                        const scenarioStatus = scenario.steps.some(step => step.result && (step.result.status === 'failed' || step.result.status === 'undefined')) ? 'failed' :
                                               scenario.steps.some(step => step.result && step.result.status === 'skipped') ? 'skipped' :
                                               scenario.steps.every(step => step.result && step.result.status === 'passed') ? 'passed' : 'pending';
                        scenarioDetails.className = `scenario-details ${getStatusClass(scenarioStatus)}`;
                        const scenarioSummary = document.createElement('summary');
                        scenarioSummary.className = 'scenario-summary';
                        scenarioSummary.textContent = `Scenario: ${scenario.name || 'Unnamed Scenario'} (${scenarioStatus.toUpperCase()})`;
                        scenarioDetails.appendChild(scenarioSummary);

                        scenario.steps.forEach(step => {
                            const stepDiv = document.createElement('div');
                            const stepStatus = (step.result && step.result.status) || 'pending';
                            stepDiv.className = `step-details ${getStatusClass(stepStatus)}`;
                            stepDiv.innerHTML = `
                                <strong>${step.keyword} ${step.name || 'Unnamed Step'}</strong> (${stepStatus.toUpperCase()})
                            `;
                            if (step.result && step.result.error_message) {
                                const errorDiv = document.createElement('div');
                                errorDiv.className = 'error-message';
                                errorDiv.textContent = step.result.error_message;
                                stepDiv.appendChild(errorDiv);
                            }
                            if (step.result && step.result.rootCause) {
                                const rootCauseDiv = document.createElement('div');
                                rootCauseDiv.className = 'root-cause-suggestion';
                                rootCauseDiv.textContent = `AI Suggestion: ${step.result.rootCause}`;
                                stepDiv.appendChild(rootCauseDiv);
                            }
                            scenarioDetails.appendChild(stepDiv);
                        });
                        featureDetails.appendChild(scenarioDetails);
                    });
                    latestReportDetailsElem.appendChild(featureDetails);
                });

                statusMessage.textContent = 'Latest report details loaded with AI analysis.';
            } catch (error) {
                console.error('Error loading latest report details:', error);
                latestReportDetailsElem.innerHTML = `<p style="color: red;">Error loading detailed report: ${error.message}</p>`;
            }
        }

        async function loadHealedTests() {
            const healedTestsListElem = document.getElementById('healedTestsList');
            healedTestsListElem.innerHTML = '<p>Loading healed test suggestions...</p>';
            try {
                const response = await fetch('/api/healed-tests');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const healedData = await response.json();

                if (healedData.length === 0) {
                    healedTestsListElem.innerHTML = '<p>No healed locators from the last run.</p>';
                } else {
                    const ul = document.createElement('ul');
                    ul.className = 'healed-tests-list';
                    healedData.forEach(item => {
                        const li = document.createElement('li');
                        li.innerHTML = `
                            <strong>Element:</strong> ${item.elementName}<br>
                            <strong>Original Locator:</strong> <code>${item.originalLocator}</code><br>
                            <strong>Healed Locator:</strong> <code>${item.healedLocator}</code> (via ${item.strategyUsed})<br>
                            <span style="color: #888; font-size: 0.9em;">(Discovered: ${new Date(item.timestamp).toLocaleString()})</span><br>
                            <span style="font-weight: bold; color: #d9534f;">ACTION REQUIRED: Consider updating your test code with the new locator.</span>
                        `;
                        ul.appendChild(li);
                    });
                    healedTestsListElem.innerHTML = '';
                    healedTestsListElem.appendChild(ul);
                }
            } catch (error) {
                console.error('Error loading healed test data:', error);
                healedTestsListElem.innerHTML = `<p style="color: red;">Error loading healed test data: ${error.message}</p>`;
            }
        }

        // Initial load on page load
        window.onload = () => {
            connectWebSocket();
            loadSummaryData();
            loadTrendData();
            loadFlakinessReport();
            loadLatestReportDetails();
            loadHealedTests(); // Load healed tests on initial page load
        };
    </script>
</body>
</html>
9. .vscode/ directory
Create this folder in your project root.

.vscode/settings.json
JSON

// .vscode/settings.json
{
// General Editor Settings
"editor.tabSize": 2,
"editor.insertSpaces": true,
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
"files.eol": "\n", // Ensure consistent line endings

    // File Exclusions (for cleaner sidebar and faster search)
    "files.exclude": {
        "**/.git": true,
        "**/.svn": true,
        "**/.hg": true,
        "**/CVS": true,
        "**/.DS_Store": true,
        "**/node_modules": true,
        "**/reports": true, // Exclude generated reports
        "**/generated_features": true // Exclude dynamically generated features
    },

    // JavaScript Specific Settings
    "javascript.updateImportsOnFileMove.enabled": "always",
    "javascript.format.enable": false, // Let Prettier handle JS formatting
    "eslint.enable": true,
    "eslint.options": {
        "overrideConfigFile": "./.eslintrc.js" // Adjust if your ESLint config is named differently
    },
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "typescript",
        "typescriptreact"
    ],

    // Cucumber/Gherkin Settings
    "cucumber.features": [
        "features/**/*.feature"
    ],
    "cucumber.stepDefinitions": [
        "features/step_definitions/**/*.js",
        "features/support/**/*.js"
    ],
    "cucumber.glue": [
        "features/step_definitions",
        "features/support"
    ],

    // Playwright Test Extension Settings (optional, usually auto-detected)
    "playwright.testRunner.args": [
        "--config", "playwright.config.js"
    ],

    // Node.js Debugging
    "debug.javascript.autoAttachFilter": "smart"
}
.vscode/launch.json
JSON

// .vscode/launch.json
{
"version": "0.2.0",
"configurations": [
{
"name": "Launch Cucumber Tests (All)",
"type": "node",
"request": "launch",
"program": "${workspaceFolder}/node_modules/.bin/cucumber-js",
"args": [
"--require", "features/step_definitions/**/*.js",
"--require", "features/support/**/*.js",
"--format", "json:reports/cucumber_report.json",
"--publish-quiet"
],
"cwd": "${workspaceFolder}",
"console": "integratedTerminal",
"internalConsoleOptions": "neverOpen",
"env": {
// "PWDEBUG": "1" // Uncomment to open Playwright Inspector for all tests
},
"skipFiles": [
"<node_internals>/**"
]
},
{
"name": "Debug Cucumber Test (Current Feature File)",
"type": "node",
"request": "launch",
"program": "${workspaceFolder}/node_modules/.bin/cucumber-js",
"args": [
"${file}",
"--require", "features/step_definitions/**/*.js",
"--require", "features/support/**/*.js",
"--format", "json:reports/cucumber_report.json",
"--publish-quiet"
],
"cwd": "${workspaceFolder}",
"console": "integratedTerminal",
"internalConsoleOptions": "neverOpen",
"env": {
"PWDEBUG": "1" // Opens Playwright Inspector for debugging this specific test
},
"skipFiles": [
"<node_internals>/**"
]
},
{
"name": "Attach to Cucumber Process",
"type": "node",
"request": "attach",
"port": 9229,
"cwd": "${workspaceFolder}",
"skipFiles": [
"<node_internals>/**"
],
"preLaunchTask": "npm: test:debug" // Requires "test:debug": "node --inspect-brk node_modules/.bin/cucumber-js ..." in package.json
}
]
}
10. test_data/ directory
    You will need to create the test_data directory at the project root.

11. Other Potential Files (If you have them from previous steps)
    .eslintrc.js (for ESLint):

JavaScript

// .eslintrc.js
module.exports = {
env: {
browser: true,
node: true,
es2021: true
},
extends: [
'eslint:recommended',
'plugin:prettier/recommended' // Integrates Prettier with ESLint
],
parserOptions: {
ecmaVersion: 12,
sourceType: 'module'
},
plugins: [
'prettier'
],
rules: {
'prettier/prettier': 'error'
}
};
playwright.config.js (if you need a specific Playwright config outside Cucumber):

JavaScript

// playwright.config.js
// This file is typically used when running Playwright directly, not via Cucumber.
// However, it can be referenced by Playwright extensions or for shared configurations.
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
testDir: './tests', // Playwright's default test directory
fullyParallel: true,
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
reporter: 'html',
use: {
trace: 'on-first-retry',
baseURL: 'http://localhost:3000', // Example base URL
},
projects: [
{
name: 'chromium',
use: { ...devices['Desktop Chrome'] },
},
],
});
Final Steps After Creating/Updating Files:

Open your terminal at the project's root.
Run npm install to ensure all dependencies are installed.
Start the dashboard: npm run start:dashboard.
Open your browser to http://localhost:3000.
Try running your tests from the dashboard or via npm test features/SauceDemoProductFilter.feature in your terminal.
This should give you a complete and functional setup of our project so far!