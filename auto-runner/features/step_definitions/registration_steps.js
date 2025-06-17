// features/step_definitions/registration_steps.js
const {Given, When, Then} = require('@cucumber/cucumber');
const {expect} = require('@playwright/test');
const {findElementRobustly} = require('../../utils/self_healing_locator');
const {generateNewUser} = require('../../utils/data_manager');

let dynamicallyGeneratedUser;

Given('I am on the user registration page', async function () {
  // IMPORTANT: Replace with your actual registration URL
  await this.page.goto('https://www.example.com/register');
});

When('I register with dynamic user data', async function () {
  dynamicallyGeneratedUser = generateNewUser();

  console.log(`[Registration Step] Attempting to register user: ${dynamicallyGeneratedUser.username}`);

  // IMPORTANT: Adapt locators to your actual registration page

  // await selfHealingLocator(this.page, '#firstName', 'First Name Input', { testId: 'firstName' }).fill(dynamicallyGeneratedUser.firstName);

  // ## 1 ::
  // const firstNameInput = await selfHealingLocator(this.page, '#firstName', 'First Name Input', { testId: 'firstName' });
  // await firstNameInput.fill(dynamicallyGeneratedUser.firstName);

  // ## 2 ::
  await (await findElementRobustly(this.page, '#firstName', 'First Name Input', {testId: 'firstName'})).fill(dynamicallyGeneratedUser.firstName);
  await (await findElementRobustly(this.page, '#lastName', 'Last Name Input', {testId: 'lastName'})).fill(dynamicallyGeneratedUser.lastName);
  await (await findElementRobustly(this.page, '#email', 'Email Input', {testId: 'email'})).fill(dynamicallyGeneratedUser.email);
  await (await findElementRobustly(this.page, '#username', 'Username Input', {testId: 'username'})).fill(dynamicallyGeneratedUser.username);
  await (await findElementRobustly(this.page, '#password', 'Password Input', {testId: 'password'})).fill(dynamicallyGeneratedUser.password);
  await (await findElementRobustly(this.page, '#confirmPassword', 'Confirm Password Input', {testId: 'confirmPassword'})).fill(dynamicallyGeneratedUser.password);

  await (await findElementRobustly(this.page, '#streetAddress', 'Street Address Input', {testId: 'streetAddress'})).fill(dynamicallyGeneratedUser.address.streetAddress);
  await (await findElementRobustly(this.page, '#city', 'City Input', {testId: 'city'})).fill(dynamicallyGeneratedUser.address.city);
  await (await findElementRobustly(this.page, '#state', 'State Dropdown', {testId: 'state'})).selectOption(dynamicallyGeneratedUser.address.state);
  await (await findElementRobustly(this.page, '#zipCode', 'Zip Code Input', {testId: 'zipCode'})).fill(dynamicallyGeneratedUser.address.zipCode);

  await (await findElementRobustly(this.page, '#registerButton', 'Register Button', {text: 'Register', role: 'button', name: 'Register'})).click();
});

Then('the user should be successfully registered', async function () {
  await expect(this.page).toHaveURL(/success|dashboard/);
});

Then('I should see a success message', async function () {
  const successMessageLocator = await findElementRobustly(this.page, '.success-message', 'Success Message', {text: 'Registration Successful!'});
  await expect(successMessageLocator).toBeVisible();
  await expect(successMessageLocator).toHaveText('Registration Successful!');
});
