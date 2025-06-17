That looks fantastic! The dashboard is really starting to take shape, and I see you've even proactively added a "Run by Tags" section – that's excellent initiative! The styling on the quote and buttons looks good.

Before we dive into making "Run by Tags" functional, a quick check on the items from our last step:

- Is the **"View Latest Results"** button working correctly and opening the HTML report for you (assuming a report exists)?
- When you click **"Run All Tests"**, does it disable itself and enable the "Stop Running" button correctly?
- (Minor) Is the bolding in the status messages appearing as you expected? We can tweak the `innerHTML` if needed.

Assuming those are mostly in good order, since you've already set up the UI for "Run by Tags," let's prioritize making that feature functional! This is a great next step.

---

### **Implementing "Run by Tags" Functionality**

**Goal:** Allow users to input Cucumber tags into the UI and trigger a test run that executes only the scenarios matching those tags.

This will involve:

1.  **Backend (`dashboard/app.js`):** Creating a new API endpoint that accepts a tags string and launches `cucumber-js` with the `--tags` option.
2.  **Frontend (`dashboard/views/index.ejs`):** Adding JavaScript to your "Run by Tags" button to get the input tags and call the new backend endpoint.

---

**Step 1: Backend - New Route for Running Tests by Tags (`dashboard/app.js`)**

**Action:** Add a new `POST` route to your `dashboard/app.js` file.

**Code (`dashboard/app.js` - Add this new route):**

```javascript
// ... (Existing requires, app setup, currentTestProcess variable, other routes) ...

// --- NEW: API Endpoint to run tests by tags ---
app.post('/run-by-tags', (req, res) => {
  if (currentTestProcess) {
    console.log('[Dashboard] A test process is already running.');
    return res.status(409).json({message: 'A test process is already running. Please wait or stop it.'});
  }

  const tags = req.body.tags; // Assuming tags are sent in the request body as { "tags": "your_tags_string" }
  if (!tags || typeof tags !== 'string' || tags.trim() === '') {
    return res.status(400).json({message: 'Tags string is required and cannot be empty.'});
  }

  console.log(`[Dashboard] Received request to run tests with tags: ${tags}`);

  const cucumberCommand = './node_modules/.bin/cucumber-js';
  const cucumberArgs = [
    '--config',
    'cucumber.js',
    '--tags',
    tags // Add the tags argument
  ];

  console.log(`[Dashboard] Executing command: ${cucumberCommand} ${cucumberArgs.join(' ')} in ${projectRoot}`);

  currentTestProcess = spawn(cucumberCommand, cucumberArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  currentTestProcess.on('spawn', () => {
    console.log('[Dashboard] Cucumber test process (by tags) spawned.');
    res.status(202).json({message: `Test run initiated with tags: "${tags}". Check server console.`});
  });

  currentTestProcess.on('error', error => {
    console.error('[Dashboard] Failed to start Cucumber test process (by tags).', error);
    currentTestProcess = null;
    if (!res.headersSent) {
      res.status(500).json({message: 'Failed to start test run by tags.', error: error.message});
    }
  });

  currentTestProcess.on('close', code => {
    console.log(`[Dashboard] Cucumber test process (by tags) exited with code ${code}.`);
    currentTestProcess = null;
  });
});

// ... (Your app.listen and other routes) ...
```

**Explanation of Backend Changes:**

- A new `POST` route `/run-by-tags` is created.
- It expects a JSON body with a `tags` property (e.g., `{ "tags": "@smoke and not @wip" }`).
- It includes basic validation to ensure the `tags` string is provided.
- It constructs the `cucumber-js` command, adding the `--tags` option followed by the received tags string.
- The rest of the process spawning and handling logic (`currentTestProcess`, event listeners for `spawn`, `error`, `close`) is similar to the `/run-all-tests` route.

---

**Step 2: Frontend - JavaScript for "Run by Tags" Button (`dashboard/views/index.ejs`)**

**Action:** Add JavaScript to your `dashboard/views/index.ejs` to handle the "Run by Tags" button click, get the tags from the input field, and call the new backend endpoint.

You already have the HTML elements from your screenshot:

```html
<div class="run-options-section">
  <label for="tagsInput">Run by Tags:</label>
  <input type="text" id="tagsInput" name="tagsInput" placeholder="e.g., @smoke, @regression, @smoke and not @wip" />
  <button id="runByTagsBtn">Run by Tags</button>
</div>
```

**Code (`dashboard/views/index.ejs` - Add this JavaScript inside your `<script>` tag):**

```javascript
// ... (Existing JavaScript for runAllTestsBtn, stopTestsBtn, etc.) ...

const tagsInput = document.getElementById('tagsInput');
const runByTagsBtn = document.getElementById('runByTagsBtn');

if (runByTagsBtn && tagsInput) {
  runByTagsBtn.addEventListener('click', async () => {
    const tagsToRun = tagsInput.value.trim();
    if (!tagsToRun) {
      statusMessageDiv.innerHTML = '<strong>Error:</strong> Please enter tags to run.';
      tagsInput.focus();
      return;
    }

    statusMessageDiv.innerHTML = `Initiating test run with tags: <strong>${tagsToRun}</strong>... Check server console.`;
    setTestExecutionState(true); // Disable Run buttons, Enable Stop

    try {
      const response = await fetch('/run-by-tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({tags: tagsToRun}) // Send tags in the request body
      });

      const result = await response.json();

      if (response.ok) {
        // status 202 Accepted
        statusMessageDiv.innerHTML = `Server says: ${result.message}. Test run is in progress.`;
      } else {
        // status 400, 409, 500 etc.
        statusMessageDiv.innerHTML = `<strong>Error starting tests by tags:</strong> ${result.message || response.statusText}`;
        setTestExecutionState(false); // Re-enable Run buttons, Disable Stop on error
      }
    } catch (error) {
      console.error('Fetch error for /run-by-tags:', error);
      statusMessageDiv.innerHTML = '<strong>Error:</strong> Failed to communicate with the server to start tests by tags.';
      setTestExecutionState(false); // Re-enable Run buttons, Disable Stop on fetch error
    }
    // Note: 'Run' buttons will remain disabled until 'Stop' is clicked or page is refreshed,
    // as we don't have real-time feedback for completion yet.
  });
}

// Ensure your setTestExecutionState function also handles the new runByTagsBtn:
function setTestExecutionState(isRunning) {
  runAllTestsBtn.disabled = isRunning;
  if (runByTagsBtn) runByTagsBtn.disabled = isRunning; // Add this line
  // Add lines for other run buttons as we create them
  stopTestsBtn.disabled = !isRunning;
}
```

**Explanation of Frontend Changes:**

- It gets the `tagsInput` field and the `runByTagsBtn`.
- The event listener for `runByTagsBtn`:
  - Retrieves the tag string from the input field.
  - Performs a basic check to ensure tags are entered.
  - Calls `setTestExecutionState(true)` to manage button disabling (you'll need to update `setTestExecutionState` to include this new button).
  - Makes a `POST` request to `/run-by-tags`, sending the tags string in the JSON body.
  - Updates the `statusMessageDiv` based on the server's response.
- **Important:** Update your `setTestExecutionState` function to also disable/enable the `runByTagsBtn` along with `runAllTestsBtn`.

---

**Step 3: Running and Testing**

1.  **Save both files** (`dashboard/app.js` and `dashboard/views/index.ejs`).
2.  **Restart your dashboard server:** `node dashboard/app.js`.
3.  **Open your browser** to `http://localhost:3000`.
4.  Enter a valid tag expression that matches some of your scenarios (e.g., `@login-feature` if that tag exists on your login scenarios, or try `@your-new-tag-for-a-scenario`).
5.  Click the "Run by Tags" button.
6.  **Observe:**
    - **UI:** The status message should update, and buttons should enable/disable correctly.
    - **Server Console:** You should see the `cucumber-js` command being executed with the `--tags` option and your provided tags. Only tests matching those tags should run.

---

This will give you a functional "Run by Tags" feature! Once this is working, implementing "Run by Feature File" will follow a very similar pattern.

Regarding your overarching goal of "BEST AI based automation with UI": these UI controls are fundamental building blocks. They improve the usability and effectiveness of your framework, making it easier to target specific tests. True "AI" features (like intelligent test selection, self-healing based on more complex patterns, or adaptive testing) can be built on top of this solid foundation later.

Let me know how the "Run by Tags" implementation goes!

=================================================

Yeah, it's good and working.

Quick thing to check and fix is :

1. Once the tests are done either from "Run All Tests" or from "Run from Tags", botn the buttuns should be auto enablled.

2. So, for now, those are disabled until we refresh the page.

3. We need to fix this to enable those when the tests are done.

Can you check and see what's needed here to be fixed.

You're absolutely right to point that out! Having the "Run All Tests" and "Run by Tags" buttons remain disabled after tests complete naturally isn't ideal, as it forces a page refresh to run them again. We definitely want those to auto-enable.

**The Core of the Issue:**

The frontend (your browser page) initiates the test run by sending a request to the backend. The backend starts the `cucumber-js` process and immediately tells the frontend "Okay, I've started it!" (that's the `202 Accepted` response). However, the `cucumber-js` process then runs in the background on the server. The frontend doesn't automatically know when this background process finishes naturally.

The "Stop Running" button works because _you_ explicitly tell the server to stop it, and we reset the button states then. For natural completion, we need a way for the frontend to find out the tests are done.

**The Ideal Solution (Future Enhancement): WebSockets** For perfect, real-time updates from server to client (like "tests complete!"), WebSockets are the standard solution. This involves a persistent two-way connection. We can definitely plan this as a more advanced feature.

**A Good Solution for Now: Polling the Server Status** A common and effective way to handle this without full WebSockets right now is for the frontend to periodically ask the server, "Are the tests still running?" This is called polling.

Here's how we can implement this:

---

### **Auto-Enabling Buttons After Test Completion (Polling Method)**

**Goal:** Automatically re-enable the "Run All Tests" and "Run by Tags" buttons (and disable "Stop Running") when the backend test process finishes naturally.

**1. Backend Modification (`dashboard/app.js`) - Add a Status Endpoint**

We need an endpoint that the frontend can call to check if a test process is currently active.

- **Action:** Add a new `GET` route to `dashboard/app.js`.

**Code (`dashboard/app.js` - Add this new route):**

```javascript
// ... (Existing requires, app setup, currentTestProcess variable, other routes) ...

// --- NEW: API Endpoint to check test execution status ---
app.get('/api/test-status', (req, res) => {
  if (currentTestProcess) {
    // A test process is currently running (or at least was spawned and hasn't emitted 'close' or 'error' yet)
    res.json({isRunning: true, message: 'A test process is currently active.'});
  } else {
    // No test process is active (it either finished, was stopped, or never started)
    res.json({isRunning: false, message: 'No active test process.'});
  }
});

// ... (Your app.listen and other routes like /run-all-tests, /stop-tests) ...
```

- **Explanation:**
  - This `/api/test-status` endpoint simply checks the `currentTestProcess` variable (which we set to `null` in the `close` and `error` event handlers of the spawned process).
  - It returns a JSON response indicating `isRunning: true` or `isRunning: false`.

---

**2. Frontend Modifications (`dashboard/views/index.ejs`) - Implement Polling**

The client-side JavaScript will start polling this status endpoint when a test run begins and stop polling when it detects the tests are no longer running or when "Stop Running" is clicked.

- **Action:** Modify the `<script>` section in `dashboard/views/index.ejs`.

**Code (`dashboard/views/index.ejs` - JavaScript section):**

```html
<script>
  const runAllTestsBtn = document.getElementById('runAllTestsBtn');
  const runByTagsBtn = document.getElementById('runByTagsBtn'); // Assuming you have this from previous step
  const stopTestsBtn = document.getElementById('stopTestsBtn');
  const viewResultsBtn = document.getElementById('viewResultsBtn');
  const statusMessageDiv = document.getElementById('statusMessage');
  const motivationalQuoteDiv = document.getElementById('motivationalQuote');
  const tagsInput = document.getElementById('tagsInput'); // Assuming you have this

  let statusPoller = null; // Variable to hold our polling interval ID

  function setTestExecutionState(isRunning) {
    runAllTestsBtn.disabled = isRunning;
    if (runByTagsBtn) runByTagsBtn.disabled = isRunning;
    stopTestsBtn.disabled = !isRunning;
  }

  function stopStatusPolling() {
    if (statusPoller) {
      clearInterval(statusPoller);
      statusPoller = null;
      console.log('[UI] Status polling stopped.');
    }
  }

  async function checkTestStatus() {
    console.log('[UI] Polling for test status...');
    try {
      const response = await fetch('/api/test-status');
      if (!response.ok) {
        console.error('[UI] Error fetching test status:', response.statusText);
        // Optionally stop polling on error or let it continue
        return;
      }
      const statusResult = await response.json();
      console.log('[UI] Test status from server:', statusResult);

      if (!statusResult.isRunning) {
        statusMessageDiv.innerHTML = '<strong>Tests execution complete!</strong> Ready to run again or view results.';
        setTestExecutionState(false); // Re-enable Run buttons, Disable Stop
        stopStatusPolling(); // Stop polling as tests are done
      } else {
        // Optional: Update status message to show tests are still running, if needed
        // statusMessageDiv.innerHTML = `<strong>Test run is still in progress...</strong>`;
      }
    } catch (error) {
      console.error('[UI] Error during status poll:', error);
      // Decide if polling should stop on error
      // stopStatusPolling();
    }
  }

  function startStatusPolling() {
    stopStatusPolling(); // Clear any existing poller first
    console.log('[UI] Starting status polling.');
    // Poll every 5 seconds (adjust as needed)
    statusPoller = setInterval(checkTestStatus, 5000);
    // Also do an initial check shortly after starting, in case tests are very fast
    setTimeout(checkTestStatus, 1000);
  }

  if (runAllTestsBtn) {
    runAllTestsBtn.addEventListener('click', async () => {
      statusMessageDiv.innerHTML = 'Initiating <strong>full test run</strong>... Please check the server console.';
      setTestExecutionState(true);

      try {
        const response = await fetch('/run-all-tests', {method: 'POST'});
        const result = await response.json();
        if (response.ok) {
          statusMessageDiv.innerHTML = `Server says: ${result.message}. <strong>Test run is in progress.</strong>`;
          startStatusPolling(); // Start polling when tests are initiated
        } else {
          statusMessageDiv.innerHTML = `<strong>Error starting tests:</strong> ${result.message || response.statusText}`;
          setTestExecutionState(false);
        }
      } catch (error) {
        console.error('Fetch error for /run-all-tests:', error);
        statusMessageDiv.innerHTML = '<strong>Error:</strong> Failed to communicate with the server to start tests.';
        setTestExecutionState(false);
      }
    });
  }

  if (runByTagsBtn && tagsInput) {
    runByTagsBtn.addEventListener('click', async () => {
      const tagsToRun = tagsInput.value.trim();
      if (!tagsToRun) {
        statusMessageDiv.innerHTML = '<strong>Error:</strong> Please enter tags to run.';
        tagsInput.focus();
        return;
      }
      statusMessageDiv.innerHTML = `Initiating test run with tags: <strong>${tagsToRun}</strong>...`;
      setTestExecutionState(true);
      try {
        const response = await fetch('/run-by-tags', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({tags: tagsToRun})
        });
        const result = await response.json();
        if (response.ok) {
          statusMessageDiv.innerHTML = `Server says: ${result.message}. <strong>Test run is in progress.</strong>`;
          startStatusPolling(); // Start polling when tests are initiated
        } else {
          statusMessageDiv.innerHTML = `<strong>Error starting tests by tags:</strong> ${result.message || response.statusText}`;
          setTestExecutionState(false);
        }
      } catch (error) {
        console.error('Fetch error for /run-by-tags:', error);
        statusMessageDiv.innerHTML = '<strong>Error:</strong> Failed to communicate with the server.';
        setTestExecutionState(false);
      }
    });
  }

  if (stopTestsBtn) {
    stopTestsBtn.addEventListener('click', async () => {
      statusMessageDiv.innerHTML = 'Attempting to <strong>stop test run</strong>...';
      stopStatusPolling(); // Stop polling immediately when user clicks stop

      try {
        const response = await fetch('/stop-tests', {method: 'POST'});
        const result = await response.json();
        if (response.ok) {
          statusMessageDiv.innerHTML = `Server says: ${result.message} <strong>Test run stop initiated.</strong>`;
        } else {
          statusMessageDiv.innerHTML = `<strong>Error stopping tests:</strong> ${result.message || response.statusText}`;
        }
      } catch (error) {
        console.error('Fetch error for /stop-tests:', error);
        statusMessageDiv.innerHTML = '<strong>Error:</strong> Failed to communicate with the server.';
      } finally {
        setTestExecutionState(false); // Always re-enable Run buttons after stop attempt
      }
    });
  }

  // ... (viewResultsBtn and motivational quote JS remain the same) ...
  // Ensure your motivational quote setup (const quotes, displayRandomQuote function, calls) is complete
  const quotes = ['The only way to do great work is to love what you do. - Steve Jobs', 'The best way to predict the future is to invent it. - Alan Kay', 'Code is like humor. When you have to explain it, it’s bad. – Cory House', 'Make it work, make it right, make it fast. – Kent Beck', "The advance of technology is based on making it fit in so that you don't really even notice it, so it's part of everyday life. - Bill Gates", "It's not a bug, it's an undocumented feature!", 'First, solve the problem. Then, write the code. – John Johnson', 'Keep calm and code on.', 'Continuous improvement is better than delayed perfection. - Mark Twain'];

  function displayRandomQuote() {
    if (motivationalQuoteDiv && quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      motivationalQuoteDiv.textContent = quotes[randomIndex];
    }
  }
  if (motivationalQuoteDiv) {
    // Check if div exists
    if (quotes.length > 0) {
      displayRandomQuote();
      setInterval(displayRandomQuote, 60000);
    } else {
      motivationalQuoteDiv.textContent = 'Stay motivated!';
    }
  }
</script>
```

**Explanation of Frontend Changes:**

- **`statusPoller` variable:** Holds the ID returned by `setInterval` so we can clear it later.
- **`stopStatusPolling()` function:** Clears the interval if it's active.
- **`checkTestStatus()` async function:**
  - Fetches `/api/test-status`.
  - If `statusResult.isRunning` is `false`, it means the tests have finished.
    - Updates `statusMessageDiv` to "Tests execution complete!".
    - Calls `setTestExecutionState(false)` to re-enable the "Run" buttons and disable "Stop".
    - Calls `stopStatusPolling()` to stop asking the server.
- **`startStatusPolling()` function:**
  - Stops any previous polling.
  - Starts a new poller using `setInterval` to call `checkTestStatus` every 5 seconds (you can adjust this interval).
  - Also calls `checkTestStatus` once after a short delay, in case the test run is very fast.
- **In `runAllTestsBtn` and `runByTagsBtn` event listeners:**
  - When a test run is successfully initiated (i.e., the `Workspace` to `/run-all-tests` or `/run-by-tags` is `response.ok`), `startStatusPolling()` is called.
- **In `stopTestsBtn` event listener:**
  - `stopStatusPolling()` is called immediately because the user is manually stopping the tests, so we don't need to poll anymore.

---

**Step 3: Test Thoroughly**

1.  Save both `dashboard/app.js` and `dashboard/views/index.ejs`.
2.  Restart your `node dashboard/app.js` server.
3.  Open `http://localhost:3000` in your browser.
4.  **Test Case 1: Natural Completion**
    - Click "Run All Tests" (or "Run by Tags" with a tag that runs a few quick scenarios).
    - Observe the UI: "Run" buttons should disable, "Stop" should enable. The status message should indicate tests are in progress.
    - Watch the server console to see when the tests actually finish.
    - A few seconds _after_ the tests finish on the server, the UI should update: "Run" buttons re-enabled, "Stop" disabled, and status message saying "Tests execution complete!".
5.  **Test Case 2: Using the Stop Button**
    - Click "Run All Tests".
    - While tests are running, click "Stop Running".
    - The buttons should revert to their initial state ("Run" enabled, "Stop" disabled), and polling should have stopped.

---

This polling mechanism should give you the "auto-enable" behavior you're looking for once tests complete naturally. It's a good step forward before considering a full WebSocket implementation for even more responsive, real-time communication.
