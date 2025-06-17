// dashboard/app.js
const express = require('express');
const path = require('path');
const {spawn} = require('child_process');
// const WebSocket = require('ws');
const fs = require('fs');
// const fsp = require('fs/promises');
// const os = require('os');
// const { healedLocators } = require('../utils/self_healing_locator');

const app = express();
const PORT = process.env.PORT || 3000; // Port for the dashboard server
const projectRoot = path.join(__dirname, '..'); // This assumes app.js is in 'dashboard/' folder

// --- Variable to keep track of the current test process ---
let currentTestProcess = null;

// Setup EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Points to dashboard/views directory
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use('/reports', express.static(path.join(projectRoot, 'reports')));

// Route to render your main dashboard page
app.get('/', (req, res) => {
  res.render('index', {title: 'AI Automation Dashboard'});
});

// --- /api/projects : API Endpoint to list projects) ---
app.get('/api/projects', (req, res) => {
  const featuresPath = path.join(projectRoot, 'features');
  console.log(`[Dashboard] Reading projects from: ${featuresPath}`);

  try {
    const entries = fs.readdirSync(featuresPath, {withFileTypes: true});
    const projectDirectories = entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);

    console.log('[Dashboard] Found projects:', projectDirectories);
    res.json({projects: projectDirectories});
  } catch (error) {
    console.error('[Dashboard] Error reading features directory for projects:', error);
    res.status(500).json({message: 'Failed to retrieve project list.', error: error.message});
  }
});

// --- /api/features-in-project: API Endpoint to list feature files within a specific project ---
app.get('/api/features-in-project', async (req, res) => {
  const projectName = req.query.project; // Get project name from query parameter

  if (!projectName || typeof projectName !== 'string' || projectName.trim() === '') {
    return res.status(400).json({message: 'Project name is required.'});
  }

  // Basic validation to prevent path traversal.
  // Ensure projectName only contains alphanumeric, underscore, or hyphen characters.
  if (!/^[a-zA-Z0-9_-]+$/.test(projectName)) {
    return res.status(400).json({message: 'Invalid project name format.'});
  }

  const projectFeaturesPath = path.join(projectRoot, 'features', projectName);
  console.log(`[Dashboard] Reading features for project '${projectName}' from: ${projectFeaturesPath}`);

  try {
    // Check if the project directory exists
    if (!fs.existsSync(projectFeaturesPath) || !fs.lstatSync(projectFeaturesPath).isDirectory()) {
      console.log(`[Dashboard] Project directory not found or is not a directory: ${projectFeaturesPath}`);
      return res.status(404).json({message: `Project '${projectName}' not found or is not a directory.`});
    }

    const entries = await fs.promises.readdir(projectFeaturesPath, {withFileTypes: true});
    const featureFiles = entries.filter(dirent => dirent.isFile() && dirent.name.endsWith('.feature')).map(dirent => dirent.name); // Just the file names, not full paths yet

    console.log(`[Dashboard] Found feature files for project '${projectName}':`, featureFiles);
    res.json({featureFiles: featureFiles});
  } catch (error) {
    console.error(`[Dashboard] Error reading features for project '${projectName}':`, error);
    res.status(500).json({message: `Failed to retrieve feature files for project '${projectName}'.`, error: error.message});
  }
});

// --- API Endpoint to run all tests ---
app.post('/run-all-tests', (req, res) => {
  if (currentTestProcess) {
    console.log('[Dashboard] A test process is already running.');
    return res.status(409).json({message: 'A test process is already running. Please wait or stop it.'});
  }
  console.log('[Dashboard] Received request to run all tests.');

  // --- FIX: Define cucumberCommand and cucumberArgs for this route ---
  const cucumberCommand = './node_modules/.bin/cucumber-js';
  const cucumberArgs = ['--config', 'cucumber.js']; // For running all tests as per cucumber.js config

  // This log will now work correctly:
  console.log(`[Dashboard] Executing command: ${cucumberCommand} ${cucumberArgs.join(' ')} in ${projectRoot}`);

  currentTestProcess = spawn(cucumberCommand, cucumberArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  // ... (rest of your existing event handlers for currentTestProcess: spawn, error, close) ...
  currentTestProcess.on('spawn', () => {
    console.log('[Dashboard] Cucumber test process spawned.');
    res.status(202).json({message: 'Test run initiated. Check server console for output.'});
  });

  currentTestProcess.on('error', error => {
    console.error('[Dashboard] Failed to start Cucumber test process.', error);
    currentTestProcess = null;
    if (!res.headersSent) {
      res.status(500).json({message: 'Failed to start test run.', error: error.message});
    }
  });

  currentTestProcess.on('close', code => {
    console.log(`[Dashboard] Cucumber test process exited with code ${code}.`);
    currentTestProcess = null;
  });
});

// ---API Endpoint to stop the current test run ---
app.post('/stop-tests', (req, res) => {
  if (currentTestProcess) {
    console.log('[Dashboard] Received request to stop tests. Attempting to terminate process.');
    const killed = currentTestProcess.kill('SIGTERM');

    if (killed) {
      console.log('[Dashboard] Sent kill signal to test process.');
      res.status(200).json({message: 'Attempting to stop test run. Check server console.'});
    } else {
      console.log('[Dashboard] Failed to send kill signal (process might have already exited or an error occurred).');
      res.status(500).json({message: 'Could not send stop signal or process already stopped.'});
    }
  } else {
    console.log('[Dashboard] No test process currently running to stop.');
    res.status(404).json({message: 'No test process is currently running.'});
  }
});

// --- API Endpoint to run tests by tags ---
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

// --- API Endpoint to check test execution status ---
app.get('/api/test-status', (req, res) => {
  if (currentTestProcess) {
    // A test process is currently running (or at least was spawned and hasn't emitted 'close' or 'error' yet)
    res.json({isRunning: true, message: 'A test process is currently active.'});
  } else {
    // No test process is active (it either finished, was stopped, or never started)
    res.json({isRunning: false, message: 'No active test process.'});
  }
});

// ... /run-by-feature-files ...
app.post('/run-by-feature-files', (req, res) => {
  if (currentTestProcess) {
    return res.status(409).json({message: 'A test process is already running. Please wait or stop it.'});
  }

  const featureFilesString = req.body.featureFiles; // Expecting { "featureFiles": "path1,path2" }
  if (!featureFilesString || typeof featureFilesString !== 'string' || featureFilesString.trim() === '') {
    return res.status(400).json({message: 'Feature file paths are required and cannot be empty.'});
  }

  // Split the string into an array of paths and trim whitespace
  const featureFiles = featureFilesString
    .split(',')
    .map(file => file.trim())
    .filter(file => file.length > 0);

  if (featureFiles.length === 0) {
    return res.status(400).json({message: 'No valid feature file paths provided.'});
  }

  for (const file of featureFiles) {
    // if (!file.startsWith('features/')) {
    if (!file.toLowerCase().startsWith('features/')) {
      return res.status(400).json({message: `Invalid feature file path: ${file}. Paths must start with 'features/'.`});
    }
  }

  console.log(`[Dashboard] Received request to run feature file(s): ${featureFiles.join(', ')}`);

  // --- FIX: Define cucumberCommand and cucumberArgs for this route ---
  const cucumberCommand = './node_modules/.bin/cucumber-js';
  // --- REVISED ARGUMENT STRATEGY using specific profile ---
  const cucumberArgs = ['--config', 'cucumber.js', '--profile', 'specific_features_run', ...featureFiles];

  // Logging the command to be spawned
  console.log('[Dashboard] EXACT COMMAND TO BE SPAWNED (Profile-based for specific features):');
  console.log('Executable:', cucumberCommand);
  console.log('Arguments:', JSON.stringify(cucumberArgs, null, 2));
  console.log('Full command string (for manual testing):', `${cucumberCommand} ${cucumberArgs.join(' ')}`);
  console.log(`Working Directory for spawn: ${projectRoot}`);

  // console.log(`[Dashboard] Executing command: ${cucumberCommand} ${cucumberArgs.join(' ')} in ${projectRoot}`);

  currentTestProcess = spawn(cucumberCommand, cucumberArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  currentTestProcess.on('spawn', () => {
    console.log('[Dashboard] Cucumber test process (by explicit feature files) spawned.');
    res.status(202).json({message: `Test run initiated for specific feature file(s): ${featureFiles.join(', ')}. Check server console.`});
  });

  currentTestProcess.on('error', error => {
    console.error('[Dashboard] Failed to start Cucumber test process (by feature files).', error);
    currentTestProcess = null;
    if (!res.headersSent) {
      res.status(500).json({message: 'Failed to start test run by feature files.', error: error.message});
    }
  });

  currentTestProcess.on('close', code => {
    console.log(`[Dashboard] Cucumber test process (by feature files) exited with code ${code}.`);
    currentTestProcess = null;
  });
});

// ... app.listen and other routes ...
// Start the dashboard server
app.listen(PORT, () => {
  console.log(`AI Automation Dashboard server running at http://localhost:${PORT}`);
});

/*

////////////////////////////////////////////////////////////////////
// --- Helper Functions ---
function calculateCucumberSummary(report) {
    let totalScenarios = 0;
    let passedScenarios = 0;
    let failedScenarios = 0;
    let skippedScenarios = 0;
    let totalSteps = 0;
    let passedSteps = 0;
    let failedSteps = 0;
    let skippedSteps = 0;
    let undefinedSteps = 0;

    report.forEach(feature => {
        feature.elements.forEach(scenario => {
            totalScenarios++;
            let scenarioFailed = false;
            let scenarioSkipped = false;
            let scenarioUndefined = false;

            scenario.steps.forEach(step => {
                totalSteps++;
                if (step.result) {
                    if (step.result.status === 'passed') {
                        passedSteps++;
                    } else if (step.result.status === 'failed') {
                        failedSteps++;
                        scenarioFailed = true;
                    } else if (step.result.status === 'skipped') {
                        skippedSteps++;
                        scenarioSkipped = true;
                    } else if (step.result.status === 'undefined') {
                        undefinedSteps++;
                        scenarioUndefined = true;
                    }
                }
            });

            if (scenarioFailed) {
                failedScenarios++;
            } else if (scenarioUndefined) {
                undefinedSteps++; // Count scenario as undefined if any step is undefined
            } else if (scenarioSkipped) {
                skippedScenarios++;
            } else {
                passedScenarios++;
            }
        });
    });

    return {
        totalScenarios,
        passedScenarios,
        failedScenarios,
        skippedScenarios,
        totalSteps,
        passedSteps,
        failedSteps,
        skippedSteps,
        undefinedSteps,
        timestamp: new Date().toISOString()
    };
}

const historyFilePath = path.join(projectRoot, 'reports/summary_history.json');

async function saveSummaryToHistory(summary) {
    try {
        let history = [];
        if (fs.existsSync(historyFilePath)) {
            const data = await fsp.readFile(historyFilePath, 'utf8');
            history = JSON.parse(data);
        }
        history.push(summary);
        await fsp.writeFile(historyFilePath, JSON.stringify(history, null, 2), 'utf8');
        console.log('[Dashboard] Summary saved to history.');
    } catch (error) {
        console.error('[Dashboard] Error saving summary to history:', error);
    }
}

async function getFlakinessReport(limit = 10) {
    try {
        if (!fs.existsSync(historyFilePath)) {
            return [];
        }
        const data = await fsp.readFile(historyFilePath, 'utf8');
        const history = JSON.parse(data);

        if (history.length === 0) {
            return [];
        }

        const scenarioFailureCounts = {};
        history.forEach(run => {
            if (run.failedScenarios > 0 || run.undefinedSteps > 0) { // Only count runs with failures/undefined steps
                // Re-read the full report for detailed scenario names if needed
                // For simplicity here, we're doing a high-level summary.
                // A more robust flakiness report would parse scenario names from each historical cucumber_report.json
                // and track their pass/fail status across runs.
            }
        });

        // This is a simplified flakiness report based on overall run status.
        // For actual scenario-level flakiness, you'd need to store scenario results per run.
        // For now, let's just show a dummy or empty array for simplicity if not implemented fully.
        return [];

    } catch (error) {
        console.error('Error generating flakiness report:', error);
        return [];
    }
}

function analyzeFailure(errorMessage, step) {
    if (!errorMessage) {
        return 'Unknown Error';
    }

    const lowerCaseMessage = errorMessage.toLowerCase();

    // 1. Element Not Found / Locator Issues
    if (lowerCaseMessage.includes('locator resolved to no element') ||
        lowerCaseMessage.includes('element is not visible') ||
        lowerCaseMessage.includes('element is not enabled') ||
        lowerCaseMessage.includes('element is not editable') ||
        (lowerCaseMessage.includes('timeout') && (lowerCaseMessage.includes('waiting for selector') || lowerCaseMessage.includes('waiting for element')))) {
        return 'Element Not Found / Locator Issue';
    }

    // 2. Assertion Failures
    if (lowerCaseMessage.includes('assertionerror') ||
        (lowerCaseMessage.includes('expected') && lowerCaseMessage.includes('received')) ||
        lowerCaseMessage.includes('did not match expected') ||
        lowerCaseMessage.includes('tohaveurl') ||
        lowerCaseMessage.includes('tohavescreenshot') ||
        lowerCaseMessage.includes('expect(locator).tobevisible')) {
        return 'Assertion Failure';
    }

    // 3. Navigation / Network Issues
    if (lowerCaseMessage.includes('navigation failed') ||
        lowerCaseMessage.includes('net::err_') ||
        lowerCaseMessage.includes('network error') ||
        lowerCaseMessage.includes('page closed') ||
        lowerCaseMessage.includes('target closed') ||
        lowerCaseMessage.includes('err_connection_refused')) {
        return 'Navigation / Network Issue';
    }

    // 4. API / Backend Issues
    if (lowerCaseMessage.includes('server error') ||
        lowerCaseMessage.includes('api failed') ||
        lowerCaseMessage.includes('internal server error') ||
        lowerCaseMessage.includes('status code 500') || lowerCaseMessage.includes('status code 400') ||
        lowerCaseMessage.includes('status code 401') || lowerCaseMessage.includes('status code 403')) {
        return 'API / Backend Issue';
    }

    // 5. Playwright Specific Errors
    if (lowerCaseMessage.includes('playwright error') ||
        lowerCaseMessage.includes('context closed') ||
        lowerCaseMessage.includes('browser closed') ||
        lowerCaseMessage.includes('expect(locator).tohavetitle')) { // Add this if toHaveTitle fails with non-title content
        return 'Playwright Framework Error';
    }

    // 6. Undefined Steps (from Cucumber.js)
    if (step && step.status === 'undefined') {
        return 'Cucumber Step Undefined';
    }

    // Default / Generic Error
    return 'Uncategorized Error';
}


let currentHealedLocatorsSession = []; // Variable to hold healed locators for the current session

// --- WebSocket Server Setup ---
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', ws => {
    let childProcess = null;

    ws.on('message', async (message) => {
        const data = JSON.parse(message);
        const scriptName = data.command;
        let command;
        let args;
        let env = { ...process.env }; // Clone environment for modification

        // Clear healed locators at the start of a new test run
        if (scriptName.startsWith('test')) {
            healedLocators.length = 0; // Clear the array in self_healing_locator.js
            currentHealedLocatorsSession = []; // Clear our session storage
            ws.send(JSON.stringify({ type: 'log', message: 'Starting new test run. Self-healing logs cleared.\n', timestamp: new Date().toISOString() }));
        }

        if (scriptName === 'test') {
            command = 'npm';
            args = ['test']; // Use npm test script
        } else if (scriptName === 'explore:app') {
            command = 'npm';
            args = ['run', 'explore:app'];
            env.PWDEBUG = '1'; // Open Playwright Inspector
        } else if (scriptName.startsWith('generate:tests')) {
            command = 'npm';
            args = ['run', scriptName];
        } else {
            ws.send(JSON.stringify({ type: 'log', message: `Unknown command: ${scriptName}\n`, timestamp: new Date().toISOString() }));
            ws.send(JSON.stringify({ type: 'status', message: `Unknown command: ${scriptName}.` }));
            return;
        }

        ws.send(JSON.stringify({ type: 'status', message: `Running command: ${command} ${args.join(' ')}` }));
        childProcess = spawn(command, args, { cwd: projectRoot, env: env, shell: true });

        childProcess.stdout.on('data', (data) => {
            ws.send(JSON.stringify({ type: 'log', message: data.toString(), timestamp: new Date().toISOString() }));
        });

        childProcess.stderr.on('data', (data) => {
            ws.send(JSON.stringify({ type: 'log', message: data.toString(), timestamp: new Date().toISOString() }));
        });

        childProcess.on('close', async (code) => {
            ws.send(JSON.stringify({ type: 'log', message: `Command '${scriptName}' exited with code ${code}.\n`, timestamp: new Date().toISOString() }));
            ws.send(JSON.stringify({ type: 'status', message: `Command '${scriptName}' completed with code ${code}.` }));

            // Process Cucumber report after tests
            if (scriptName === 'test') {
                const cucumberReportPath = path.join(projectRoot, 'reports/cucumber_report.json');
                if (fs.existsSync(cucumberReportPath)) {
                    try {
                        const reportContent = await fsp.readFile(cucumberReportPath, 'utf8');
                        const report = JSON.parse(reportContent);
                        const summary = calculateCucumberSummary(report);
                        await saveSummaryToHistory(summary);
                        ws.send(JSON.stringify({ type: 'summary', summary: summary }));
                    } catch (error) {
                        console.error('Error processing Cucumber report:', error);
                        ws.send(JSON.stringify({ type: 'error', message: `Failed to process Cucumber report: ${error.message}` }));
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Cucumber report not found after test run.' }));
                }

                // After test run, copy healed locators for current session storage
                currentHealedLocatorsSession = [...healedLocators];
                console.log(`[Dashboard] Captured ${currentHealedLocatorsSession.length} healed locators from run.`);
            }

            childProcess = null;
        });

        childProcess.on('error', (err) => {
            console.error(`Failed to start child process: ${err}`);
            ws.send(JSON.stringify({ type: 'log', message: `Error starting command: ${err.message}\n`, timestamp: new Date().toISOString() }));
            ws.send(JSON.stringify({ type: 'status', message: `Command '${scriptName}' failed to start.` }));
            childProcess = null;
        });
    });

    ws.on('close', () => {
        if (childProcess) {
            console.log('Client disconnected, killing child process...');
            childProcess.kill();
        }
    });
});

// --- Express Routes ---

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/api/summary', async (req, res) => {
    try {
        if (fs.existsSync(historyFilePath)) {
            const data = await fsp.readFile(historyFilePath, 'utf8');
            const history = JSON.parse(data);
            res.json(history[history.length - 1] || null);
        } else {
            res.json(null);
        }
    } catch (error) {
        console.error('Error fetching summary:', error);
        res.status(500).json({ error: 'Failed to fetch summary data' });
    }
});

app.get('/api/trend', async (req, res) => {
    try {
        if (fs.existsSync(historyFilePath)) {
            const data = await fsp.readFile(historyFilePath, 'utf8');
            const history = JSON.parse(data);
            res.json(history);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error fetching trend:', error);
        res.status(500).json({ error: 'Failed to fetch trend data' });
    }
});

app.get('/api/flakiness', async (req, res) => {
    const report = await getFlakinessReport();
    res.json(report);
});


app.get('/api/latest-full-report', (req, res) => {
    const cucumberReportPath = path.join(projectRoot, 'reports/cucumber_report.json');

    if (!fs.existsSync(cucumberReportPath)) {
        return res.status(404).json({ error: 'Latest Cucumber report not found.' });
    }

    try {
        const reportContent = fs.readFileSync(cucumberReportPath, 'utf8');
        const report = JSON.parse(reportContent);

        // --- ADD ROOT CAUSE ANALYSIS TO THE REPORT ---
        report.forEach(feature => {
            feature.elements.forEach(scenario => {
                scenario.steps.forEach(step => {
                    if (step.result && (step.result.status === 'failed' || step.result.status === 'undefined')) {
                        step.result.rootCause = analyzeFailure(step.result.error_message, step.result);
                    }
                });
            });
        });
        // --- END ROOT CAUSE ANALYSIS ---

        res.json(report);
    } catch (error) {
        console.error(`Error parsing latest Cucumber report: ${error.message}`);
        res.status(500).json({ error: 'Failed to parse latest Cucumber report JSON.' });
    }
});

app.get('/api/healed-tests', (req, res) => {
    res.json(currentHealedLocatorsSession);
});


const server = app.listen(port, () => {
    console.log(`Dashboard server running at http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
    });
});

// Code to handle Playwright Inspector launch
// This is a placeholder. You can implement this as needed.
// For example, you might want to add a button in your EJS template
// that sends a POST request to this endpoint to launch the inspector.
// This is a simple example of how to set up a route to launch the inspector
// and handle the response.
// Route to serve the dashboard UI



// Route to handle launching the inspector
app.post('/launch-inspector', (req, res) => {
  console.log('Attempting to launch Playwright Inspector...');

  // Define the command and arguments
  // Adjust the command as needed (e.g., 'npm', ['run', 'test:inspect'])
  // Ensure paths are correct if not running from project root context
  const command = 'npm';
  const args = ['run', 'test:inspect']; // Assuming 'test:inspect' is in your package.json
                                       // and correctly sets PWDEBUG=1

  // For more control, or if 'test:inspect' isn't set up with cross-env:
  // const command = 'npx'; // or path to cross-env
  // const args = ['cross-env', 'PWDEBUG=1', 'cucumber-js'];


  const options = {
    stdio: 'inherit', // Show output in the dashboard's console (or pipe to UI)
    shell: true,      // Often needed for 'npm' or commands involving &&
    cwd: path.join(__dirname, '..') // Run from the project root
  };

  const inspectorProcess = spawn(command, args, options);

  inspectorProcess.on('spawn', () => {
    console.log('Playwright Inspector process spawned. Check for new windows/console output.');
    // You might not be able to send a direct success HTTP response immediately
    // if the process is long-running and interactive.
    // Consider using WebSockets for real-time feedback to the UI.
  });

  inspectorProcess.on('error', (error) => {
    console.error(`Error spawning Inspector process: ${error.message}`);
    // Send an error response or update UI via WebSockets
    if (!res.headersSent) {
      res.status(500).send('Failed to start Playwright Inspector.');
    }
  });

  inspectorProcess.on('exit', (code, signal) => {
    console.log(`Inspector process exited with code ${code} and signal ${signal}`);
    // Update UI via WebSockets
  });

  // For a long-running interactive process, you might send an initial acknowledgment
  if (!res.headersSent) {
    res.status(202).send('Playwright Inspector launch initiated. Check console/new windows.');
  }
});


// app.listen(port, () => {
//   console.log(`Dashboard server listening at http://localhost:${port}`);
// });

*/
// --- End of the file ---
