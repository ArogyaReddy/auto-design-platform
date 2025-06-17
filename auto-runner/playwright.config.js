// playwright.config.js
// This file is typically used when running Playwright directly, not via Cucumber.
// However, it can be referenced by Playwright extensions or for shared configurations.
const { defineConfig,devices } = require('@playwright/test');
// const {devices} = require("playwright");

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
        /* Whether to run browsers in headless mode. */
        headless: false, // <--- SET THIS TO FALSE
    },
    projects: [
        {
            name: 'chromium',
            // use: { ...devices['Desktop Chrome'] },
            use: { ...devices['Desktop Chrome'], headless: false }, // Or set it per project

        },
    ],
});