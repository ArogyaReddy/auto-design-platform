You've hit a subtle but important JavaScript scoping issue! Let's get this fixed.

The error message is:
`ReferenceError: Cannot access 'testProcess' before initialization`
And it's occurring at:
`/Users/arog/AI/AI-Playwright-Framework/dashboard/app.js:47:3`

Looking at your `dashboard/app.js` code, here's what's happening:

1.  **Module-Scoped Variable:** At the top of your file (around line 15), you correctly declare:
    ```javascript
    let testProcess = null;
    ```
    This `testProcess` is intended to hold the reference to the spawned Cucumber child process and is accessible throughout your `app.js` module.

2.  **Shadowing in `/run-all-tests` Route:** Inside your `app.post('/run-all-tests', ...)` route handler, on the line where you spawn the process (which is your line 47 or very close to it), you have:
    ```javascript
    const testProcess = spawn(cucumberCommand, cucumberArgs, { /* ... */ });
    ```
    By using `const testProcess` here, you are declaring a **new, local variable** also named `testProcess` that is only visible *inside* this `/run-all-tests` function block. This new local variable "shadows" (hides) the module-scoped `testProcess`.

    The `ReferenceError: Cannot access 'testProcess' before initialization` on this specific line (`const testProcess = spawn(...)`) is unusual because it's the declaration line itself. This error typically occurs if you try to *use* a `let` or `const` variable before its declaration line within the same scope. While the exact reason it's manifesting on the declaration line here might be due to a subtle interaction or a slightly misleading error report in this context, the core issue is the variable shadowing and how you intend to use `testProcess`.

    The event handlers like `testProcess.on('error', ...)` and `testProcess.on('close', ...)` that you define *after* this local `const testProcess` will refer to this *local* one. If you then try to do `testProcess = null;` inside those handlers (as you correctly do to clear the reference), you would be trying to reassign a `const` variable, which would cause a `TypeError`. However, the immediate error is the `ReferenceError`.

**The Solution: Assign to the Module-Scoped Variable**

To fix this, you should not re-declare `testProcess` inside the `/run-all-tests` handler. Instead, assign the result of `spawn()` directly to the module-scoped `testProcess` variable.

---
### **Corrected Code for `dashboard/app.js`**

**Action:** Modify your `/run-all-tests` route handler in `dashboard/app.js`.

**Code (`dashboard/app.js` - Focus on the `/run-all-tests` route):**
```javascript
// dashboard/app.js
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');
// const WebSocket = require('ws'); // Not used in this snippet
// const fs = require('fs'); // Not used in this snippet
// const fsp = require('fs/promises'); // Not used in this snippet
// const os = require('os'); // Not used in this snippet
// const { healedLocators } = require('../utils/self_healing_locator'); // Not used in this snippet, can be removed if not needed here

const app = express();
const PORT = process.env.PORT || 3000;
const projectRoot = path.join(__dirname, '..');

// --- Variable to keep track of the current test process ---
let currentTestProcess = null; // << RENAMED for clarity from 'testProcess' to avoid confusion with local variables if you had any before. Using 'currentTestProcess' consistently.

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true })); // One instance is enough
app.use(express.json()); // One instance is enough
app.use(express.static(path.join(__dirname, 'public')));
app.use('/reports', express.static(path.join(projectRoot, 'reports')));

app.get('/', (req, res) => {
  res.render('index', { title: 'AI Automation Dashboard' });
});

app.post('/run-all-tests', (req, res) => {
  // Use the module-scoped 'currentTestProcess'
  if (currentTestProcess) {
    console.log('[Dashboard] A test process is already running.');
    return res.status(409).json({ message: 'A test process is already running. Please wait or stop it.' });
  }
  console.log('[Dashboard] Received request to run all tests.');

  // projectRoot is already defined globally, no need to redefine here unless you prefer local scope
  // const projectRootLocal = path.join(__dirname, '..'); 

  const cucumberCommand = './node_modules/.bin/cucumber-js';
  const cucumberArgs = ['--config', 'cucumber.js'];

  console.log(`[Dashboard] Executing command: ${cucumberCommand} ${cucumberArgs.join(' ')} in ${projectRoot}`);

  // --- CORRECTION: Assign to the module-scoped 'currentTestProcess' ---
  // Do NOT use 'const' or 'let' here to avoid re-declaring/shadowing
  currentTestProcess = spawn(cucumberCommand, cucumberArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  currentTestProcess.on('spawn', () => {
    console.log('[Dashboard] Cucumber test process spawned.');
    res.status(202).json({ message: 'Test run initiated. Check server console for output.' });
  });

  currentTestProcess.on('error', (error)  => {
    console.error('[Dashboard] Failed to start Cucumber test process.', error);
    currentTestProcess = null; // Correctly clears the module-scoped variable
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to start test run.', error: error.message });
    }
  });

  currentTestProcess.on('close', (code) => {
    console.log(`[Dashboard] Cucumber test process exited with code ${code}.`);
    currentTestProcess = null; // Correctly clears the module-scoped variable
  });
});

app.post('/stop-tests', (req, res) => {
  // This route correctly uses the module-scoped 'currentTestProcess'
  if (currentTestProcess) {
    console.log('[Dashboard] Received request to stop tests. Attempting to terminate process.');
    const killed = currentTestProcess.kill('SIGTERM'); 
    
    if (killed) {
      console.log('[Dashboard] Sent kill signal to test process.');
      // currentTestProcess will be set to null by its 'close' or 'error' event handlers.
      res.status(200).json({ message: 'Attempting to stop test run. Check server console.' });
    } else {
      console.log('[Dashboard] Failed to send kill signal (process might have already exited or an error occurred).');
      res.status(500).json({ message: 'Could not send stop signal or process already stopped.' });
    }
  } else {
    console.log('[Dashboard] No test process currently running to stop.');
    res.status(404).json({ message: 'No test process is currently running.' });
  }
});

app.listen(PORT, () => {
  console.log(`AI Automation Dashboard server running at http://localhost:${PORT}`);
});
```

**Key Changes Made:**

1.  **Renamed Global Variable (for clarity, optional but good practice):** I renamed the global `let testProcess = null;` to `let currentTestProcess = null;`. This helps differentiate it from any local variables if you ever chose to use `testProcess` locally for other things. I've updated all references to use `currentTestProcess`. If you prefer to keep it as `testProcess` globally, that's fine, just ensure consistency.
2.  **Removed Re-declaration in `/run-all-tests` (CRITICAL FIX):**
    * **Removed `const`:** Changed `const testProcess = spawn(...)` to `currentTestProcess = spawn(...)`.
    * This now assigns the spawned process object to the **module-scoped `currentTestProcess` variable** instead of creating a new, local, shadowed variable.
3.  **Event Handlers Now Correctly Modify Module-Scoped Variable:**
    * The lines `currentTestProcess = null;` within the `error` and `close` event handlers for the spawned process will now correctly refer to and modify the module-scoped `currentTestProcess`.

**Why this fixes the `ReferenceError` (and potential future `TypeError`):**
* By assigning directly to the module-scoped `currentTestProcess`, we avoid the complexities of shadowing and any potential TDZ (Temporal Dead Zone) confusion related to re-declaring a variable with the same name in an inner scope.
* The `ReferenceError: Cannot access 'variable' before initialization` is typically about using a `let` or `const` before its declaration line within its defined scope. While its appearance on the declaration line itself was unusual, ensuring we are operating on the correct, single, module-scoped variable for the child process reference eliminates this class of scoping problems.
* This also preempts a `TypeError` you would have gotten later if you tried to reassign `testProcess = null` to a `const testProcess` local variable.

**Additional Notes from your provided code:**
* You have `const { healedLocators } = require('../utils/self_healing_locator');` but `healedLocators` isn't used in this `app.js`. You can remove this line if it's not intended for use here.
* You have `app.use(express.urlencoded({ extended: true }));` and `app.use(express.json());` listed twice. One instance of each is sufficient. I've kept one of each in the corrected snippet above.

---
**Next Step:**

1.  Apply these corrections to your `dashboard/app.js`.
2.  Restart your `node dashboard/app.js` server.
3.  Try clicking "Run All Tests" and then "Stop Running" again.

This should resolve the `ReferenceError` and allow your process management logic to work as intended. Let me know the outcome!