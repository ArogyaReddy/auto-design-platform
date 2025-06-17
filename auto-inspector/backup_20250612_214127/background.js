// Background script for Universal Element Locator
const state = {
  connections: new Map(),
  invalidatedTabs: new Set(),
  heartbeats: new Map(),
  recoveryAttempts: new Map(),
  injectionAttempts: new Map(),
  pendingInjections: new Set()
};

const CONSTANTS = {
  HEARTBEAT_INTERVAL: 5000,
  MAX_RECOVERY_ATTEMPTS: 3,
  RECOVERY_DELAY_BASE: 1000,
  INJECTION_RETRY_MAX: 3,
  INJECTION_RETRY_DELAY: 1000,
  VALID_PROTOCOLS: ['http:', 'https:'],
  INJECTION_TIMEOUT: 5000,
  CLEANUP_TIMEOUT: 1000
};

// Handle extension installation or update
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
  reloadAllTabs();
});

// Handle tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);
      if (CONSTANTS.VALID_PROTOCOLS.includes(url.protocol)) {
        // Add a small delay to ensure the page is fully loaded
        setTimeout(() => {
          if (!state.connections.has(tabId)) {
            injectContentScript(tabId);
          }
        }, 500);
      }
    } catch (error) {
      console.log(`Invalid URL for tab ${tabId}`);
    }
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = message.tabId || sender.tab?.id;

  if (message.action === 'reportInvalidContext') {
    handleInvalidContext(tabId);
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'reloadContentScript') {
    if (!tabId) {
      sendResponse({ success: false, error: 'No tab ID provided' });
      return true;
    }

    reinjectContentScript(tabId)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (message.action === 'getConnectionStatus') {
    sendResponse({
      connected: state.connections.has(tabId),
      invalidated: state.invalidatedTabs.has(tabId)
    });
    return true;
  }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  cleanup(tabId);
});

function cleanup(tabId) {
  if (state.pendingInjections.has(tabId)) {
    return; // Don't cleanup if injection is pending
  }

  state.connections.delete(tabId);
  state.invalidatedTabs.delete(tabId);
  state.heartbeats.delete(tabId);
  state.recoveryAttempts.delete(tabId);
  state.injectionAttempts.delete(tabId);
}

async function reinjectContentScript(tabId) {
  // Prevent cleanup during reinjection
  state.pendingInjections.add(tabId);
  
  try {
    // First try to remove any existing content script
    await chrome.scripting.executeScript({
      target: { tabId },
      function: () => {
        // Clean up any existing content script
        if (window.__universalLocator) {
          window.__universalLocator.cleanup?.();
          delete window.__universalLocator;
        }
      }
    });

    // Wait for cleanup
    await new Promise(resolve => setTimeout(resolve, CONSTANTS.CLEANUP_TIMEOUT));

    // Inject the new content script
    await injectContentScript(tabId, true);
    
  } finally {
    // Allow cleanup after reinjection
    state.pendingInjections.delete(tabId);
  }
}

async function injectContentScript(tabId, isReinjection = false) {
  if (!tabId) {
    throw new Error('No tab ID provided');
  }

  // Prevent multiple simultaneous injections
  if (state.pendingInjections.has(tabId)) {
    return;
  }

  state.pendingInjections.add(tabId);

  try {
    // For reinjection, we don't count attempts
    if (!isReinjection) {
      const attempts = state.injectionAttempts.get(tabId) || 0;
      if (attempts >= CONSTANTS.INJECTION_RETRY_MAX) {
        throw new Error(`Max injection attempts reached for tab ${tabId}`);
      }
      state.injectionAttempts.set(tabId, attempts + 1);
    }

    // Validate tab before trying to inject
    const isValid = await isValidTab(tabId);
    if (!isValid) {
      throw new Error(`Invalid tab ${tabId}`);
    }

    // Try to inject the content script with timeout
    await Promise.race([
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Injection timeout')), 
        CONSTANTS.INJECTION_TIMEOUT)
      )
    ]);

    // If successful, try to inject CSS
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['content.css']
    });

    // Reset state on success
    if (!isReinjection) {
      state.injectionAttempts.delete(tabId);
    }
    state.invalidatedTabs.delete(tabId);
    state.recoveryAttempts.delete(tabId);

    console.log(`Content script ${isReinjection ? 're-' : ''}injected successfully in tab ${tabId}`);
    return true;

  } catch (error) {
    console.error(`Failed to inject content script in tab ${tabId}:`, error);
    throw error;
  } finally {
    state.pendingInjections.delete(tabId);
  }
}

function setupHeartbeat(tabId, port) {
  clearHeartbeat(tabId);
  
  const interval = setInterval(() => {
    try {
      port.postMessage({ type: 'heartbeat' });
    } catch (error) {
      console.log(`Heartbeat failed for tab ${tabId}:`, error);
      handleConnectionLoss(tabId);
    }
  }, CONSTANTS.HEARTBEAT_INTERVAL);
  
  state.heartbeats.set(tabId, interval);
}

function clearHeartbeat(tabId) {
  const existingInterval = state.heartbeats.get(tabId);
  if (existingInterval) {
    clearInterval(existingInterval);
    state.heartbeats.delete(tabId);
  }
}

function handleConnectionLoss(tabId) {
  state.connections.delete(tabId);
  clearHeartbeat(tabId);
  
  const attempts = state.recoveryAttempts.get(tabId) || 0;
  if (attempts < CONSTANTS.MAX_RECOVERY_ATTEMPTS) {
    const delay = CONSTANTS.RECOVERY_DELAY_BASE * Math.pow(2, attempts);
    setTimeout(() => {
      injectContentScript(tabId);  // Use injectContentScript instead of reloadContentScript
      state.recoveryAttempts.set(tabId, attempts + 1);
    }, delay);
  } else {
    state.invalidatedTabs.add(tabId);
    notifyTabInvalidated(tabId);
  }
}

// Handle connections from content scripts
chrome.runtime.onConnect.addListener((port) => {
  const tabId = port.sender?.tab?.id;
  if (!tabId) return;

  console.log(`Connection established from tab ${tabId}`);
  state.connections.set(tabId, port);
  state.invalidatedTabs.delete(tabId);
  state.recoveryAttempts.delete(tabId);
  setupHeartbeat(tabId, port);

  port.onMessage.addListener((message) => {
    if (message.type === 'heartbeat-response') {
      // Connection is healthy
      state.recoveryAttempts.delete(tabId);
    }
  });

  port.onDisconnect.addListener(() => {
    console.log(`Connection lost from tab ${tabId}`);
    handleConnectionLoss(tabId);
  });
});

function notifyTabInvalidated(tabId) {
  const port = state.connections.get(tabId);
  if (port) {
    try {
      port.postMessage({ type: 'context-invalidated' });
    } catch (error) {
      console.log(`Failed to notify tab ${tabId} of invalidation:`, error);
    }
  }
}

async function reloadAllTabs() {
  const tabs = await chrome.tabs.query({ url: ['http://*/*', 'https://*/*'] });
  for (const tab of tabs) {
    reloadContentScript(tab.id);
  }
}

function handleInvalidContext(tabId) {
  if (!tabId) return;
  
  state.invalidatedTabs.add(tabId);
  handleConnectionLoss(tabId);
}

async function reloadContentScript(tabId) {
  if (!tabId) {
    console.error('No tab ID provided for reloadContentScript');
    return;
  }

  try {
    console.log(`Reloading content script for tab ${tabId}`);
    await reinjectContentScript(tabId);
    return true;
  } catch (error) {
    console.error(`Failed to reload content script in tab ${tabId}:`, error);
    return false;
  }
}
