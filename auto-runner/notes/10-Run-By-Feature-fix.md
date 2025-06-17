I completely understand your frustration, and I assure you, I'm thinking hard about what could be causing `cucumber-js` to run all features despite specifying a single one. This behavior, especially when you confirmed it happens even with a manual command like `./node_modules/.bin/cucumber-js --config cucumber.js features/login.feature`, is indeed puzzling and not standard.

It strongly suggests that for your `@cucumber/cucumber@11.3.0` setup, the `paths: ['features/**/*.feature']` array within your `cucumber.js` default profile is too "sticky" – it's overriding or merging with the explicit feature file path provided on the command line when that config is loaded.

**Let's try a more robust solution that uses Cucumber.js's profile system to isolate the runs.**

The idea is to have:

1.  Your current `default` profile in `cucumber.js` that includes `paths: ['features/**/*.feature']` (for the "Run All Tests" button).
2.  A **new, separate profile** in `cucumber.js` specifically for running selected features. This new profile will _not_ contain the `paths` key, ensuring that only the feature files passed on the command line are considered.

---

### **Solution: Using Cucumber Profiles to Isolate Feature Runs**

**Step 1: Modify `cucumber.js` to Add a New Profile**

- **Action:** Open your `AI-Playwright-Framework/cucumber.js` file. We will add a new profile named `specific_features_run`.

**Code (`AI-Playwright-Framework/cucumber.js`):**

```javascript
// AI-Playwright-Framework/cucumber.js
module.exports = {
  // This is your existing default profile, used by "Run All Tests"
  default: {
    paths: ['features/**/*.feature'], // This tells Cucumber to find all features by default
    requireModule: ['@babel/register'],
    require: [
      'features/step_definitions/**/*.js',
      'features/support/**/*.js' // Loads world.js where setDefaultTimeout is
    ],
    format: [
      'summary' // Keep it simple, or add 'progress-bar', 'html:reports/cucumber-report.html'
    ],
    // timeout is now handled by setDefaultTimeout in your support code (e.g., world.js)
    // If you still had 'timeout: 60000' here, it's fine, but setDefaultTimeout takes precedence.
    publishQuiet: true
  },

  // --- NEW PROFILE for running specific feature files ---
  specific_features_run: {
    // NO 'paths' key here intentionally!
    requireModule: ['@babel/register'],
    require: [
      'features/step_definitions/**/*.js',
      'features/support/**/*.js' // Crucial for loading World, hooks, setDefaultTimeout
    ],
    format: [
      'summary' // Or your preferred formatters for this run type
      // 'html:reports/cucumber-report-specific.html' // Optionally, a different report file
    ],
    // Timeout will be inherited from setDefaultTimeout called in your support files.
    // If you needed a different timeout specifically for this profile, you could add:
    // timeout: 75000,
    publishQuiet: true,
    worldParameters: {
      // any specific parameters for this type of run if needed
    }
  }
};
```

- **Explanation of Changes:**
  - We've added a new profile key: `specific_features_run`.
  - This new profile contains all the necessary `requireModule`, `require`, and `format` options.
  - **Crucially, it does NOT contain the `paths: ['features/**/\*.feature']` key.\*\* This is key.
  - The timeout will still be governed by `setDefaultTimeout(60 * 1000)` in your `features/support/world.js` because the `require` paths will load that file.

---

**Step 2: Modify `dashboard/app.js` for `/run-by-feature-files` Route**

- **Action:** Update the `/run-by-feature-files` route in your `dashboard/app.js` to use the `--config cucumber.js` flag again, but now also specify `--profile specific_features_run`.

**Code (`dashboard/app.js` - Revised `/run-by-feature-files` route):**

```javascript
// ... (inside app.post('/run-by-feature-files', ...) route) ...

// ... (after featureFiles array is populated and validated) ...

console.log(`[Dashboard] Received request to run feature file(s): ${featureFiles.join(', ')}`);

const cucumberCommand = './node_modules/.bin/cucumber-js';
// --- REVISED ARGUMENT STRATEGY using specific profile ---
const cucumberArgs = [
  '--config',
  'cucumber.js', // Explicitly load our config file
  '--profile',
  'specific_features_run', // Use the new profile that has NO 'paths' glob
  ...featureFiles // Add the specific feature file paths
];

// Logging the command to be spawned
console.log('[Dashboard] EXACT COMMAND TO BE SPAWNED (Profile-based for specific features):');
console.log('Executable:', cucumberCommand);
console.log('Arguments:', JSON.stringify(cucumberArgs, null, 2));
console.log('Full command string (for manual testing):', `${cucumberCommand} ${cucumberArgs.join(' ')}`);
console.log(`Working Directory for spawn: ${projectRoot}`);

currentTestProcess = spawn(cucumberCommand, cucumberArgs, {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

// ... (rest of your spawn event handlers: 'spawn', 'error', 'close' remain the same) ...
currentTestProcess.on('spawn', () => {
  /* ... */
});
currentTestProcess.on('error', error => {
  /* ... */
});
currentTestProcess.on('close', code => {
  /* ... */
});
// ...
```

- **Explanation of Change:**
  - We've re-introduced `'--config', 'cucumber.js'`.
  - We've added `'--profile', 'specific_features_run'`. This tells Cucumber to load settings from the `specific_features_run` profile within your `cucumber.js`.
  - The specific feature file paths (`...featureFiles`) are then appended.
  - Because the `specific_features_run` profile has no `paths` key, Cucumber should _only_ consider the feature files provided on the command line.

---

**Step 3: Quick Reminder - Fix `TypeError: selfHealingLocator is not a function`**

Before testing, please ensure you've addressed the `TypeError: selfHealingLocator is not a function` from your previous log.

- **Action:** In all your step definition files (e.g., `product_steps.js`, `registration_steps.js`, `login_steps.js`, and the `login_steps copy.js` if you're still using it):
  - Make sure the import is: `const { findElementRobustly } = require('../../utils/self_healing_locator');`
  - Make sure you are calling it as: `await findElementRobustly(...)`

---

**Step 4: Test the Solution**

1.  Save your updated `cucumber.js` and `dashboard/app.js` files.
2.  Ensure any `TypeError: selfHealingLocator is not a function` issues are fixed in your step definitions.
3.  Restart your `node dashboard/app.js` server.
4.  Go to your dashboard UI.
5.  In the "Run by Specific Feature File(s)" input, type `features/login.feature`.
6.  Click the "Run Selected Feature File(s)" button.
7.  **Observe the server console output:**
    - Check the "EXACT COMMAND TO BE SPAWNED" logs. It should now include `--profile specific_features_run`.
    - **Most importantly, see which tests are executed.** It should now _only_ be the scenarios from `features/login.feature`.

**Why this should work "once and for all" for this issue:** We are explicitly telling Cucumber to use a configuration profile (`specific_features_run`) that has no default broad `paths` defined. Therefore, the only source of feature files for Cucumber to run will be those explicitly passed on the command line. This directly avoids the conflict where the `paths` glob in the `default` profile was overriding your specific CLI path.

This is a clean way to manage different execution needs using Cucumber's own profile system. Let me know if this finally corrals Cucumber into running only what you specify!
