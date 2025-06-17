// // In a hooks.js or support file
// const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
// const { chromium } = require('playwright'); // Or your library of choice

// // setDefaultTimeout(60 * 1000); // Optional: set default timeout

// Before(async function () {
//   this.browser = await chromium.launch({ headless: false }); // Or your browser
//   this.context = await this.browser.newContext();
//   this.page = await this.context.newPage(); // Make sure 'this.page' is set
// });

// After(async function () {
//   if (this.page) {
//     await this.page.close();
//   }
//   if (this.context) {
//     await this.context.close();
//   }
//   if (this.browser) {
//     await this.browser.close();
//   }
// });