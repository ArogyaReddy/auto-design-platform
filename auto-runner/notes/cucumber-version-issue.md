➜  AI-Playwright-Framework ./node_modules/.bin/cucumber-js --version
6.0.7
➜  AI-Playwright-Framework npm list @cucumber/cucumber
ai-automation-framework@1.0.0 /Users/arog/AI/AI-Playwright-Framework
└── @cucumber/cucumber@11.3.0

➜  AI-Playwright-Framework rm -rf node_modules
➜  AI-Playwright-Framework rm package-lock.json
➜  AI-Playwright-Framework npm cache clean --force
npm warn using --force Recommended protections disabled.
➜  AI-Playwright-Framework npm install


This is the **critical piece of information** we've been looking for!

You ran `./node_modules/.bin/cucumber-js --version` and it outputted **`6.0.7`**.

However, you previously indicated (and `npm list @cucumber/cucumber` presumably showed) that you have `@cucumber/cucumber@11.3.0` installed.

**This discrepancy is the absolute root cause of the problems you've been facing with unknown CLI options like `--timeout` and `--config`, and likely why your `cucumber.js` configurations weren't working as expected.**

* **Cucumber.js v6.0.7 has a different set of CLI options and expects a different `cucumber.js` configuration file format** compared to v11.3.0.
* The modern object-style `cucumber.js` we've been crafting is for Cucumber v7+ (including v11.3.0) and is **incompatible** with v6.0.7.
* Similarly, while v6 did have a `--timeout` CLI option, its CLI parser might be different, and it definitely didn't have `--config` in the same way.

**The "once and for all" fix is to ensure that your project is actually using `@cucumber/cucumber@11.3.0` as intended.** The `cucumber-js` executable in your `node_modules/.bin` folder must be the one from the v11.3.0 package.

---
### **Solution: Ensure Correct Cucumber Version (11.3.0) is Installed and Used**

**Goal:** Align your project's installed `cucumber-js` executable with the desired `@cucumber/cucumber@11.3.0` version.

**Step 1: Verify `package.json`**

* **Action:** Open your `AI-Playwright-Framework/package.json` file. Look in the `devDependencies` (or `dependencies`, though it's usually a dev dependency) section for `@cucumber/cucumber`.
* **Confirm:** Does it explicitly state a version compatible with 11.3.0? It should look something like:
    ```json
    "devDependencies": {
      // ... other dependencies
      "@cucumber/cucumber": "^11.3.0" // Or "~11.3.0", "11.3.0"
      // ...
    }
    ```
* **If it shows an older version (like `^6.0.7`) here, this is the primary source of the mismatch. You'll need to update it to `^11.3.0` in `package.json` before proceeding.**

---
**Step 2: Perform a Thorough Clean Reinstall of Dependencies**

This will remove any old or mismatched versions from `node_modules` and reinstall based on your (now verified or corrected) `package.json`.

* **Action:**
    1.  From your `AI-Playwright-Framework` project root in the terminal:
    2.  **Delete `node_modules` folder:**
        ```sh
        rm -rf node_modules
        ```
        (Windows: `rd /s /q node_modules`)
    3.  **Delete `package-lock.json` file:** (This is crucial to prevent npm from reinstalling based on an old lock file)
        ```sh
        rm package-lock.json
        ```
    4.  **Optional but recommended: Clean npm cache:**
        ```sh
        npm cache clean --force
        ```
    5.  **Reinstall dependencies:**
        ```sh
        npm install
        ```

---
**Step 3: Verify the Executable Version AGAIN**

This is the most important check after reinstalling.
* **Action:** After `npm install` completes successfully, run this again in your terminal:
    ```sh
    ./node_modules/.bin/cucumber-js --version
    ```
* **Expected Output:** It **MUST** now show `11.3.0` (or the specific v11 version listed in your `package.json`).
* **If it still shows `6.0.7` or another incorrect version:** Stop here. There's a fundamental issue with your `package.json` or npm's ability to install the correct version. We would need to see your `package.json` contents for `@cucumber/cucumber` at that point.

---
**Step 4: If Version is Correct (11.3.0), Proceed with Correct Configuration**

Assuming Step 3 confirms `./node_modules/.bin/cucumber-js --version` now outputs `11.3.0`:

1.  **Use the Correct `cucumber.js` for v11.3.0:**
    Make sure your `AI-Playwright-Framework/cucumber.js` file contains the modern object-style configuration we discussed, with the correct timeout and simplified formatters:
    ```javascript
    // AI-Playwright-Framework/cucumber.js
    module.exports = {
      default: {
        paths: ['features/**/*.feature'],
        requireModule: ['@babel/register'],
        require: [
          'features/step_definitions/**/*.js',
          'features/support/**/*.js'
        ],
        format: [
          'progress-bar',
          'html:reports/cucumber-report.html'
        ],
        timeout: 60000, // 60 seconds
        publishQuiet: true // Or remove if you prefer default behavior
      }
    };
    ```

2.  **Use the Correct NPM Script:**
    Your `package.json` script should now work as `cucumber-js` (v11.3.0) will understand the `--config` flag.
    ```json
    "dashboard:test:login": "cross-env PWDEBUG=1 ./node_modules/.bin/cucumber-js --config cucumber.js --tags @login-feature"
    ```

3.  **Run the Test:**
    ```sh
    npm run dashboard:test:login
    ```

**Expected Outcome (Once v11.3.0 is correctly installed and used):**
* No more "unknown option" errors for `--config` or `--timeout` (when timeout is in `cucumber.js`).
* The `timeout: 60000` from your `cucumber.js` file should be respected.
* The 5000ms timeout errors should be gone.
* Playwright Inspector (`PWDEBUG=1`) should work as expected, pausing with enough time.

---
Please follow these steps meticulously, especially the clean reinstall (Step 2) and the subsequent version verification of the executable (Step 3). This version mismatch is the key. Let me know the output of `./node_modules/.bin/cucumber-js --version` after the reinstall!