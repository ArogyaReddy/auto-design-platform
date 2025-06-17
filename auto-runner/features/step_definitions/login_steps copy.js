// features/step_definitions/login_steps.js
const {Given, When, Then} = require('@cucumber/cucumber');
const {expect} = require('@playwright/test');
const {findElementRobustly} = require('../../utils/self_healing_locator');
const {getData} = require('../../utils/data_manager');

Given('I am on the login page', async function () {
  await this.page.goto('https://www.saucedemo.com/');
});

When('I log in with username {string} and password {string}', async function (username, password) {
  await (await findElementRobustly(this.page, '#user-name', 'Username Input', {testId: 'username-field'})).fill(username);
  await (await findElementRobustly(this.page, '#password', 'Password Input', {testId: 'password-field'})).fill(password);
  await (await findElementRobustly(this.page, '#login-button', 'Login Button', {text: 'Login', role: 'button', name: 'Login'})).click();
});

When('I log in as a {string} user', async function (userType) {
  const userData = getData('users', userType);

  if (!userData) {
    throw new Error(`User type '${userType}' not found in test data.`);
  }

  console.log(`[Login Step] Logging in as user type: ${userType}`);
  await (
    await findElementRobustly(this.page, '#user-name', 'Username Input', {
      testId: 'username-field',
      altText: 'Username field',
      title: 'Enter your username'
    })
  ).fill(userData.username);

  await (
    await findElementRobustly(this.page, '#password', 'Password Input', {
      testId: 'password-field',
      altText: 'Password field',
      title: 'Enter your password'
    })
  ).fill(userData.password);

  await (
    await findElementRobustly(this.page, '#login-button', 'Login Button', {
      text: 'Login',
      role: 'button',
      name: 'Login',
      testId: 'login-button'
    })
  ).click();
});

Then('I should be redirected to the products page', async function () {
  await expect(this.page).toHaveURL('https://www.saucedemo.com/inventory.html');
});

Then('I should see an error message {string}', async function (errorMessage) {
  const errorContainer = await await findElementRobustly(this.page, '.error-message-container', 'Error Message Container', {text: errorMessage});
  await expect(errorContainer).toBeVisible();
  await expect(errorContainer).toHaveText(errorMessage);
});
