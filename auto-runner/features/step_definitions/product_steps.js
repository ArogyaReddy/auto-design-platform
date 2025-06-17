// features/step_definitions/product_steps.js
const {Given, When, Then} = require('@cucumber/cucumber');
const {expect} = require('@playwright/test');
const {findElementRobustly} = require('../../utils/self_healing_locator');
const {getData} = require('../../utils/data_manager');

// Given page is available via 'this.page' from World constructor

Given('a user navigates to the SauceDemo login page', async function () {
  await this.page.goto('https://www.saucedemo.com/');
});

When('the user logs in with {string} and {string}', async function (userType, password) {
  const userData = getData('users', userType); // Using data manager

  await (await findElementRobustly(this.page, 'Username Input', '#user-name', ["[testId: 'username-field']"])).fill(userData.username);
  await (await findElementRobustly(this.page, 'Password Input', '#password', ["[testId: 'password-field']"])).fill(password);
  await (await findElementRobustly(this.page, 'Login Button', '#login-button', ["[testId: 'login-button']"])).click();
});

When('the user filters products by {string}', async function (filterOption) {
  await (await findElementRobustly(this.page, 'Product Sort Dropdown', '.product_sort_container', ["[css: 'select.product_sort_container', testId: 'product-sort-container']"])).selectOption({label: filterOption});
});

Then('the products should be sorted by {string}', async function (expectedOrder) {
  const itemNames = await this.page.locator('.inventory_item_name').allTextContents();

  if (expectedOrder === 'Name (A to Z)') {
    const sortedNames = [...itemNames].sort((a, b) => a.localeCompare(b));
    expect(itemNames).toEqual(sortedNames);
    console.log(`[Assertion] Products are sorted A to Z: ${itemNames}`);
  } else if (expectedOrder === 'Name (Z to A)') {
    const sortedNames = [...itemNames].sort((a, b) => b.localeCompare(a));
    expect(itemNames).toEqual(sortedNames);
    console.log(`[Assertion] Products are sorted Z to A: ${itemNames}`);
  } else {
    throw new Error(`Unsupported sort order: ${expectedOrder}. Implement logic for other sorts.`);
  }
});
