"You are my goto person!!!!" - That's fantastic to hear! I'm thrilled we're making such great progress together and that everything is working well so far. It's very rewarding to see the framework and dashboard evolving.

Absolutely, let's get that "Stop Running" button implemented. This is a very useful feature for controlling longer test runs. It's a bit more complex than the previous UI tweaks as it involves managing the test execution process on the server, but definitely doable.

Here's how we can approach it:

---
### **Implementing a "Stop Running" Button**

**Goal:** Add a "Stop Running" button that, when clicked, terminates the ongoing Cucumber test execution initiated by the "Run All Tests" button and updates the UI.

**Overall Logic:**
1.  **Backend (`dashboard/app.js`):**
    * When "Run All Tests" is initiated, we'll store a reference to the spawned test process.
    * We'll create a new API endpoint (e.g., `/stop-tests`).
    * When this endpoint is called, if a test process is running, we'll send a signal to terminate it.
2.  **Frontend (`dashboard/views/index.ejs`):**
    * Add a "Stop Running" button.
    * This button will call the `/stop-tests` backend endpoint.
    * The "Run All Tests" and "Stop Running" buttons will be enabled/disabled appropriately based on whether tests are currently executing.

---
**Step 1: Backend Modifications (`dashboard/app.js`)**

We need to keep track of the running test process and add a route to stop it.

**Action:** Modify your `dashboard/app.js`.

**Code (`dashboard/app.js` - Key changes and additions):**
```javascript
const express = require('express');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const projectRoot = path.join(__dirname, '..');

// --- Variable to keep track of the current test process ---
let currentTestProcess = null;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/reports', express.static(path.join(projectRoot, 'reports')));

app.get('/', (req, res) => {
  res.render('index', { title: 'AI Playwright Test Dashboard' });
});

app.post('/run-all-tests', (req, res) => {
  if (currentTestProcess) {
    console.log('[Dashboard] A test process is already running.');
    return res.status(409).json({ message: 'A test process is already running. Please wait or stop it.' });
  }
  console.log('[Dashboard] Received request to run all tests.');

  const cucumberCommand = './node_modules/.bin/cucumber-js';
  const cucumberArgs = ['--config', 'cucumber.js'];

  console.log(`[Dashboard] Executing command: ${cucumberCommand} ${cucumberArgs.join(' ')} in ${projectRoot}`);

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
    currentTestProcess = null; // Clear the reference
    if (!res.headersSent) {
      res.status(500).json({ message: 'Failed to start test run.', error: error.message });
    }
  });

  currentTestProcess.on('close', (code) => {
    console.log(`[Dashboard] Cucumber test process exited with code ${code}.`);
    currentTestProcess = null; // --- Clear the reference when process finishes ---
    // Future enhancement: Notify client via WebSockets that tests are done.
  });
});

// --- NEW: API Endpoint to stop the current test run ---
app.post('/stop-tests', (req, res) => {
  if (currentTestProcess) {
    console.log('[Dashboard] Received request to stop tests. Attempting to terminate process.');
    // Send SIGTERM for a graceful shutdown. If it doesn't work, SIGKILL can be used.
    // For child processes spawned with 'shell: true' on Windows, taskkill might be needed for robust termination.
    // For simplicity now, we'll use kill().
    const killed = currentTestProcess.kill('SIGTERM'); // Or 'SIGINT'
    
    if (killed) {
      console.log('[Dashboard] Sent kill signal to test process.');
      // Note: currentTestProcess will be set to null in its 'close' or 'exit' event handler.
      // We can also proactively set it to null here after a short delay if 'close' doesn't fire quickly
      // currentTestProcess = null; // (handled by 'close' event)
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
  console.log(`AI Playwright Dashboard server running at http://localhost:${PORT}`);
});
```

**Explanation of Backend Changes:**
* **`currentTestProcess` Variable:** A global (within `app.js` scope) variable `currentTestProcess` is introduced to hold the reference to the spawned child process.
* **In `/run-all-tests`:**
    * It now checks if `currentTestProcess` is already set. If so, it returns a message preventing multiple concurrent runs (for this basic setup).
    * The spawned process is assigned to `currentTestProcess`.
    * When the process `close`s (finishes or is killed), `currentTestProcess` is reset to `null`. This is important so we know when we can start a new run.
* **New `/stop-tests` Route:**
    * This `POST` route checks if `currentTestProcess` exists.
    * If it does, it calls `currentTestProcess.kill('SIGTERM')`. `SIGTERM` requests the process to terminate gracefully. If the process doesn't respond, `SIGKILL` could be used as a more forceful alternative, but `SIGTERM` is generally preferred first.
    * It sends a response back to the client.

---
**Step 2: Frontend Modifications (`dashboard/views/index.ejs`)**

We need to add the "Stop Running" button and update the JavaScript to manage button states and call the new endpoint.

**Action:** Modify your `dashboard/views/index.ejs`.

**Code (`dashboard/views/index.ejs`):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><%= typeof title !== 'undefined' ? title : 'Test Dashboard' %></title>
    <style>
        body { font-family: sans-serif; margin: 20px; }
        .quote { margin-bottom: 20px; font-style: italic; color: #007bff; font-size: 1.1em; padding: 10px; background-color: #f0f8ff; border-left: 3px solid #007bff; }
        .button-container { display: flex; gap: 10px; margin-bottom: 20px; }
        .button-container button { padding: 10px 15px; font-size: 1em; cursor: pointer; border: 1px solid #007bff; background-color: #007bff; color: white; border-radius: 4px; }
        .button-container button:hover:not(:disabled) { background-color: #0056b3; }
        .button-container button:disabled { background-color: #cccccc; border-color: #cccccc; color: #666666; cursor: not-allowed; }
        #statusMessage { margin-top: 20px; padding: 10px; border: 1px solid #ccc; background-color: #f9f9f9; min-height: 40px; }
    </style>
</head>
<body>
    <h1>AI Playwright Test Dashboard</h1>
    <div id="motivationalQuote" class="quote">Loading a motivational quote...</div>

    <div class="button-container">
        <button id="runAllTestsBtn">Run All Tests</button>
        <button id="stopTestsBtn" disabled>Stop Running</button> <button id="viewResultsBtn">View Latest Results</button>
    </div>

    <div id="statusMessage">Welcome! Click a button to start.</div>

    <script>
        const runAllTestsBtn = document.getElementById('runAllTestsBtn');
        const stopTestsBtn = document.getElementById('stopTestsBtn'); // New button
        const viewResultsBtn = document.getElementById('viewResultsBtn');
        const statusMessageDiv = document.getElementById('statusMessage');
        const motivationalQuoteDiv = document.getElementById('motivationalQuote');

        // --- Function to update button states ---
        function setTestExecutionState(isRunning) {
            runAllTestsBtn.disabled = isRunning;
            stopTestsBtn.disabled = !isRunning;
        }

        if (runAllTestsBtn) {
            runAllTestsBtn.addEventListener('click', async () => {
                statusMessageDiv.textContent = 'Initiating full test run... Please check the server console for progress.';
                setTestExecutionState(true); // Disable Run, Enable Stop

                try {
                    const response = await fetch('/run-all-tests', { method: 'POST' });
                    const result = await response.json();

                    if (response.ok) {
                        statusMessageDiv.textContent = `Server says: ${result.message}. Test run is in progress. Click 'Stop Running' to terminate.`;
                        // Note: We don't know exactly when it finishes without WebSockets.
                        // The 'close' event on the server will clear currentTestProcess.
                        // For now, the stop button allows manual intervention.
                        // We won't automatically re-enable "Run All Tests" here.
                    } else {
                        statusMessageDiv.textContent = `Error starting tests: ${result.message || response.statusText}`;
                        setTestExecutionState(false); // Re-enable Run, Disable Stop on error
                    }
                } catch (error) {
                    console.error('Fetch error for /run-all-tests:', error);
                    statusMessageDiv.textContent = 'Failed to communicate with the server to start tests. See browser console.';
                    setTestExecutionState(false); // Re-enable Run, Disable Stop on fetch error
                }
            });
        }

        // --- Event listener for the new Stop Tests button ---
        if (stopTestsBtn) {
            stopTestsBtn.addEventListener('click', async () => {
                statusMessageDiv.textContent = 'Attempting to stop test run...';
                try {
                    const response = await fetch('/stop-tests', { method: 'POST' });
                    const result = await response.json();

                    if (response.ok) {
                        statusMessageDiv.textContent = `Server says: ${result.message}`;
                    } else {
                        statusMessageDiv.textContent = `Error stopping tests: ${result.message || response.statusText}`;
                    }
                } catch (error) {
                    console.error('Fetch error for /stop-tests:', error);
                    statusMessageDiv.textContent = 'Failed to communicate with the server to stop tests. See browser console.';
                } finally {
                    setTestExecutionState(false); // Always Enable Run, Disable Stop after stop attempt
                }
            });
        }


        if (viewResultsBtn) {
            viewResultsBtn.addEventListener('click', () => {
                window.open('/reports/cucumber-report.html', '_blank');
                statusMessageDiv.textContent = 'Attempting to open test results in a new tab. Ensure tests have run and generated a report.';
            });
        }

        // Motivational Quote Logic (from previous step)
        const quotes = [ /* ... your quotes ... */ ];
        function displayRandomQuote() { /* ... */ }
        if (motivationalQuoteDiv && quotes.length > 0) { // Check if quotes array has items
           displayRandomQuote();
           setInterval(displayRandomQuote, 60000);
        } else if (motivationalQuoteDiv) {
            motivationalQuoteDiv.textContent = "Stay motivated!" // Default if no quotes
        }

    </script>
</body>
</html>
```

**Explanation of Frontend Changes:**
* **New "Stop Running" Button:** Added with `id="stopTestsBtn"` and initially `disabled`.
* **`setTestExecutionState(isRunning)` Function:** A helper function to manage enabling/disabling the "Run All Tests" and "Stop Running" buttons.
* **`runAllTestsBtn` Listener Update:**
    * Calls `setTestExecutionState(true)` to disable "Run" and enable "Stop" when tests start.
    * If starting tests fails, it calls `setTestExecutionState(false)` to revert button states.
    * It no longer tries to re-enable "Run All Tests" automatically on success, as the server process runs in the background.
* **`stopTestsBtn` Listener:**
    * Calls the new `/stop-tests` backend endpoint.
    * Updates the status message.
    * Calls `setTestExecutionState(false)` in the `finally` block to re-enable "Run" and disable "Stop", assuming the stop attempt either succeeded or the process is no longer considered actively running from the UI's perspective.

---
### **Step 3: Running and Testing**

1.  **Save both files** (`dashboard/app.js` and `dashboard/views/index.ejs`).
2.  **Restart your dashboard server:** `node dashboard/app.js`.
3.  **Open your browser** to `http://localhost:3000`.
4.  **Test the flow:**
    * Click "Run All Tests".
        * "Run All Tests" should become disabled.
        * "Stop Running" should become enabled.
        * Tests should start running (visible in your server console).
    * While tests are running, click "Stop Running".
        * The tests in the server console should terminate (you might see an error or exit code related to `SIGTERM`).
        * The UI status message should update.
        * "Stop Running" should become disabled.
        * "Run All Tests" should become enabled.
    * Also test what happens if "Run All Tests" completes naturally (the server console will show the process exiting) – the "Stop Running" button will still be enabled from the UI's perspective. Clicking it then should result in the "No test process currently running" message from the backend. This highlights the limitation without real-time updates from server to client.

---
This implementation provides a foundational "Stop Running" capability. As mentioned, for a truly seamless experience where the UI always reflects the *actual* backend state (e.g., re-enabling "Run All Tests" automatically when tests complete naturally), WebSockets would be the next step for communication from server to client.

Let me know how this works for you!