npm test features/SauceDemoProductFilter.feature

> ai-automation-framework@1.0.0 test
> cucumber-js -p default features/SauceDemoProductFilter.feature

This Node.js version (v22.11.0) has not been tested with this version of Cucumber; it should work normally, but please raise an issue if you see anything unexpected.
error: unknown option '--paths'
➜  AI-Playwright-Framework


## ------------------
```js 
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
// ... other configurations ...

use: {
/* Base URL to use in actions like `await page.goto('/')`. */
// baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Whether to run browsers in headless mode. */
    headless: false, // <--- SET THIS TO FALSE

    /* Other common options */
    // viewport: { width: 1280, height: 720 },
    // ignoreHTTPSErrors: true,
    // video: 'retain-on-failure',
    // screenshot: 'only-on-failure',
},

/* Configure projects for major browsers */
projects: [
{
name: 'chromium',
use: { ...devices['Desktop Chrome'], headless: false }, // Or set it per project
},
// {
//   name: 'firefox',
//   use: { ...devices['Desktop Firefox'], headless: false },
// },
// {
//   name: 'webkit',
//   use: { ...devices['Desktop Safari'], headless: false },
// },
],

// ... other configurations ...
});
