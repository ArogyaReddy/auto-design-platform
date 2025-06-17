// AI-Playwright-Framework/features/support/world.js
const {setWorldConstructor, World, Before, After, setDefaultTimeout} = require("@cucumber/cucumber");
const playwright = require("playwright");
const { Browser, BrowserContext, Page } = require('playwright'); // Import Playwright types

setDefaultTimeout(60 * 1000); // <--- SET TIMEOUT TO 60 SECONDS (60000ms)


// Import Playwright types for JSDoc
/** @typedef {import('playwright').Browser} Browser */
/** @typedef {import('playwright').BrowserContext} BrowserContext */
/** @typedef {import('playwright').Page} Page */


// Options for launching the browser.
// You can make these configurable, e.g., via environment variables.
const browserOptions = {
  headless: process.env.HEADLESS === "true" || (!process.env.HEADLESS && process.env.CI) ? true : false, // headless if HEADLESS=true or in CI
  slowMo: parseInt(process.env.SLOMO) || 0, // ms
};

class CustomWorld extends World {

   /** @type {Browser | null} */
  browser;
  /** @type {BrowserContext | null} */
  context;
  /** @type {Page | null} */
  page;
  // You can also define types for other custom properties you add to the world
  
  constructor(options) {
    super(options);
    this.browser = null;
    this.context = null;
    this.page = null;
    // You can attach other properties here, like request if doing API testing.
  }

  // It's good practice to have async methods for launching and closing the browser.
  // async openBrowser(browserName = "chromium") {
  //   // default to chromium
  //   this.log(`Launching ${browserName} browser with options: ${JSON.stringify(browserOptions)}`);
  //   try {
  //     this.browser = await playwright[browserName].launch(browserOptions);
  //     this.context = await this.browser.newContext();
  //     this.page = await this.context.newPage();
  //   } catch (error) {
  //     this.log(`Error launching browser: ${error.message}`);
  //     throw error; // Re-throw to fail the test run if browser launch fails
  //   }
  // }

  // ...
  async openBrowser(browserName = 'chromium') {
    this.log(`Launching ${browserName} browser with options: ${JSON.stringify(browserOptions)}`);
    try {
      this.browser = await playwright[browserName].launch(browserOptions);
      this.context = await this.browser.newContext();
      this.page = await this.context.newPage(); // Ensure this line completes
      this.log(`Successfully launched ${browserName} and opened a new page.`); // Added log
    } catch (error) {
      this.log(`Error launching browser or creating page: ${error.message}`); // Enhanced log
      throw error;
    }
  }
// ...


  async closeBrowser() {
    if (this.page) {
      await this.page.close();
      this.log("Page closed.");
    }
    if (this.context) {
      await this.context.close();
      this.log("Browser context closed.");
    }
    if (this.browser) {
      await this.browser.close();
      this.log("Browser closed.");
    }
  }
}

setWorldConstructor(CustomWorld);

// --- Hooks ---

// Before each scenario, launch the browser
// You can customize which browser to launch, e.g., based on tags or env variables
Before(async function (scenario) {
  this.log(`Starting scenario: "${scenario.pickle.name}"`);
  // Default to chromium, can be extended to select browser type based on tags or env vars
  // For example, if a scenario has a tag @firefox, launch firefox.
  let browserToLaunch = "chromium";
  if (scenario.pickle.tags.some((tag) => tag.name === "@firefox")) {
    browserToLaunch = "firefox";
  } else if (scenario.pickle.tags.some((tag) => tag.name === "@webkit")) {
    browserToLaunch = "webkit";
  }
  // You could also use an environment variable: process.env.BROWSER || 'chromium'
  await this.openBrowser(browserToLaunch);
});

// After each scenario, close the browser
After(async function (scenario) {
  this.log(`Finished scenario: "${scenario.pickle.name}" with status: ${scenario.result?.status}`);
  if (scenario.result?.status === "FAILED" && this.page) {
    try {
      const screenshotName = `failure-${scenario.pickle.name.replace(
        /\s+/g,
        "_"
      )}-${Date.now()}.png`;
      const screenshotPath = `reports/screenshots/${screenshotName}`; // Ensure reports/screenshots folder exists or is created
      await this.page.screenshot({ path: screenshotPath, fullPage: true });
      this.log(`Screenshot taken on failure: ${screenshotPath}`);
      // If you want to attach it to a Cucumber report (e.g., cucumber-json-formatter)
      // this.attach(await this.page.screenshot({ fullPage: true }), 'image/png');
    } catch (error) {
      this.log(`Failed to take screenshot: ${error.message}`);
    }
  }
  await this.closeBrowser();
});
// You can also add global After hooks for cleanup or reporting
// AfterAll(async function () {
//   // Cleanup code here, if needed
// });
// You can also add global Before hooks for setup or reporting
// BeforeAll(async function () {
//   // Setup code here, if needed
// });
// You can also add custom functions to the world object for reuse across steps
// Custom functions can be added here
// For example, a function to log messages
CustomWorld.prototype.log = function (message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
};
// You can also use a logging library for better logging
// const winston = require('winston');
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: 'combined.log' }),
//   ],
// });
// CustomWorld.prototype.log = function (message) {
//   logger.info(message);
// };
// You can also add custom functions for common actions, like navigating to a URL
CustomWorld.prototype.navigateTo = async function (url) {
  if (this.page) {
    await this.page.goto(url);
    this.log(`Navigated to ${url}`);
  } else {
    this.log("Page is not initialized. Cannot navigate.");
  }
};
