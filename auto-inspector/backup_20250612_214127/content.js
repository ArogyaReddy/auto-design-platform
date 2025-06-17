// Content script for Universal Element Locator Extension
(function () {
  "use strict";

  // Store the instance on the window to allow cleanup
  window.__universalLocator = window.__universalLocator || {};

  // Extension state management
  const state = {
    initialized: false,
    connected: false,
    connecting: false,
    port: null,
    retryAttempts: 0,
    maxRetries: 5,
    retryDelay: 1000,
    lastHeartbeat: Date.now(),
    heartbeatTimeout: null,
    scanInProgress: false,
    recoveryTimeout: null,
    highlightedElements: new Set(),
    initializeTimeout: null
  };

  // Configuration
  const CONFIG = {
    DEBUG: true,
    HEARTBEAT_INTERVAL: 5000,    // Send heartbeat every 5 seconds
    HEARTBEAT_TIMEOUT: 15000,    // Consider connection dead after 15 seconds of no heartbeat
    CONNECTION_TIMEOUT: 3000,
    MAX_RECONNECTION_ATTEMPTS: 10,
    MIN_RECOVERY_DELAY: 1000,
    MAX_RECOVERY_DELAY: 10000,
    HIGHLIGHT_CLASS: 'universal-locator-highlight',
    INIT_RETRY_DELAY: 500,
    MAX_INIT_RETRIES: 5,
    CONTEXT_CHECK_INTERVAL: 2000  // Check extension context every 2 seconds
  };

  // Wait for page load before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWithRetry);
  } else {
    initializeWithRetry();
  }

  function initializeWithRetry(attempt = 0) {
    if (attempt >= CONFIG.MAX_INIT_RETRIES) {
      logError("Failed to initialize after maximum attempts");
      return;
    }

    try {
      // Check if the extension context is valid
      if (!chrome.runtime?.id) {
        throw new Error("Extension context not ready");
      }

      // Clear any existing timeout
      if (state.initializeTimeout) {
        clearTimeout(state.initializeTimeout);
        state.initializeTimeout = null;
      }

      initialize();

    } catch (error) {
      logError("Initialization attempt failed:", error);
      
      // Schedule retry with exponential backoff
      const delay = CONFIG.INIT_RETRY_DELAY * Math.pow(2, attempt);
      state.initializeTimeout = setTimeout(() => {
        initializeWithRetry(attempt + 1);
      }, delay);
    }
  }

  function initialize() {
    if (state.initialized && state.connected) {
      log("Content script already initialized and connected");
      return;
    }

    log("Initializing content script...");

    try {
      // Clean up any existing state
      cleanup();
      
      // Set up message handling first
      setupMessageHandling();
      
      // Then attempt connection
      setupConnectionHandling();
      
      // Mark as initialized
      state.initialized = true;
      
      // Store cleanup function
      window.__universalLocator.cleanup = cleanup;
      
      log("Content script initialized successfully");
    } catch (error) {
      logError("Failed to initialize content script:", error);
      handleInitializationError(error);
    }
  }

  function handleInitializationError(error) {
    cleanup(); // Clean up before attempting recovery
    
    if (error.message?.includes('Extension context invalidated')) {
      notifyBackgroundScript();
    } else {
      attemptRecovery();
    }
  }

  function notifyBackgroundScript() {
    try {
      chrome.runtime.sendMessage({ 
        action: 'reportInvalidContext',
      }).catch(() => {
        // If we can't communicate, force reload
        forceReload();
      });
    } catch (error) {
      // If we can't even try to send the message, force reload
      forceReload();
    }
  }

  function forceReload() {
    try {
      window.location.reload();
    } catch (error) {
      logError("Failed to force reload:", error);
    }
  }

  function setupMessageHandling() {
    try {
      // Remove any existing listeners
      chrome.runtime.onMessage.removeListener(handleMessage);
      // Add new listener
      chrome.runtime.onMessage.addListener(handleMessage);
      log("Message handling setup complete");
    } catch (error) {
      logError("Failed to setup message handling:", error);
      throw error; // Propagate to allow recovery
    }
  }

  function setupConnectionHandling() {
    if (state.connecting) {
      log("Connection attempt already in progress");
      return;
    }

    try {
      state.connecting = true;
      state.port = chrome.runtime.connect({ name: "content-script" });
      
      state.port.onDisconnect.addListener(() => {
        const error = chrome.runtime.lastError;
        log("Port disconnected:", error?.message);
        handleDisconnect(error);
      });

      state.port.onMessage.addListener((message) => {
        try {
          handlePortMessage(message);
        } catch (error) {
          logError("Error handling port message:", error);
          if (error.message?.includes('Extension context invalidated')) {
            handleDisconnect(error);
          }
        }
      });

      state.connected = true;
      state.connecting = false;
      state.retryAttempts = 0; // Reset retry attempts on success
      log("Connection established successfully");
      
      // Start the heartbeat and context validation
      startHeartbeat();
      startContextValidation();
      
    } catch (error) {
      state.connecting = false;
      logError("Failed to establish connection:", error);
      throw error; // Propagate to allow recovery
    }
  }

  // Start the heartbeat immediately after connection
  function startHeartbeat() {
    if (state.heartbeatTimeout) {
      clearTimeout(state.heartbeatTimeout);
    }

    function sendHeartbeat() {
      if (!state.connected || !state.port) {
        return;
      }

      try {
        state.port.postMessage({ type: 'heartbeat' });
        
        // Set timeout for response
        state.heartbeatTimeout = setTimeout(() => {
          log("Heartbeat response timeout");
          handleDisconnect(new Error("Heartbeat timeout"));
        }, CONFIG.HEARTBEAT_TIMEOUT);
      } catch (error) {
        logError("Failed to send heartbeat:", error);
        handleDisconnect(error);
      }
    }

    // Start periodic heartbeat
    state.heartbeatInterval = setInterval(sendHeartbeat, CONFIG.HEARTBEAT_INTERVAL);
    sendHeartbeat(); // Send first heartbeat immediately
  }

  // Validate extension context periodically
  function startContextValidation() {
    if (state.contextValidationInterval) {
      clearInterval(state.contextValidationInterval);
    }

    state.contextValidationInterval = setInterval(() => {
      validateContext();
    }, CONFIG.CONTEXT_CHECK_INTERVAL);
  }

  // Validate the extension context
  function validateContext() {
    try {
      if (!chrome.runtime?.id) {
        log("Extension context invalid, triggering recovery");
        handleDisconnect(new Error("Extension context invalidated"));
        return false;
      }
      return true;
    } catch (error) {
      logError("Context validation failed:", error);
      handleDisconnect(error);
      return false;
    }
  }

  function handleDisconnect(error) {
    if (state.connected || state.connecting) {
      state.connected = false;
      state.connecting = false;
      
      // Always do a cleanup, but keep retry count if not doing full recovery
      cleanup(error?.message?.includes('Extension context invalidated'));

      if (error?.message?.includes('Extension context invalidated')) {
        // Try to notify background script, but don't wait for response
        try {
          chrome.runtime.sendMessage({ 
            action: 'reportInvalidContext',
            timestamp: Date.now()
          }).catch(() => {
            setTimeout(() => forceReload(), 1000);
          });
        } catch (error) {
          // If we can't even try to send the message, schedule a reload
          setTimeout(() => forceReload(), 1000);
        }
      } else {
        attemptRecovery();
      }
    }
  }

  async function attemptRecovery() {
    if (state.connecting || state.retryAttempts >= CONFIG.MAX_RECONNECTION_ATTEMPTS) {
      logError("Max retry attempts reached or already connecting");
      
      // If we've reached max retries, do a full cleanup and notify background
      if (state.retryAttempts >= CONFIG.MAX_RECONNECTION_ATTEMPTS) {
        cleanup(true);
        try {
          chrome.runtime.sendMessage({
            action: 'recoveryFailed',
            error: 'Max retry attempts reached'
          }).catch(() => {
            // If we can't communicate, force reload after a delay
            setTimeout(() => forceReload(), 1000);
          });
        } catch (error) {
          // If we can't even try to send the message, force reload after a delay
          setTimeout(() => forceReload(), 1000);
        }
      }
      return;
    }

    state.retryAttempts++;
    const delay = Math.min(
      CONFIG.MIN_RECOVERY_DELAY * Math.pow(2, state.retryAttempts - 1),
      CONFIG.MAX_RECOVERY_DELAY
    );

    log(`Attempting recovery in ${delay}ms (attempt ${state.retryAttempts})`);

    try {
      // Validate context before attempting recovery
      if (!validateContext()) {
        throw new Error("Invalid extension context before recovery");
      }

      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Validate context again after delay
      if (!validateContext()) {
        throw new Error("Invalid extension context after delay");
      }

      cleanup(false); // Partial cleanup before retry
      initializeWithRetry();
    } catch (error) {
      logError("Recovery attempt failed:", error);
      handleDisconnect(error); // Trigger disconnect handling for proper recovery flow
    }
  }

  // Enhanced cleanup function
  function cleanup(fullCleanup = false) {
    try {
      if (state.port) {
        try {
          state.port.disconnect();
        } catch (error) {
          // Ignore disconnect errors
        }
      }

      // Clear all intervals and timeouts
      [
        state.heartbeatTimeout,
        state.initializeTimeout,
        state.recoveryTimeout,
        state.heartbeatInterval,
        state.contextValidationInterval
      ].forEach(timer => {
        if (timer) {
          if (timer.constructor.name === 'Timeout') {
            clearTimeout(timer);
          } else {
            clearInterval(timer);
          }
        }
      });

      // Reset state
      if (fullCleanup) {
        Object.assign(state, {
          initialized: false,
          connected: false,
          connecting: false,
          port: null,
          retryAttempts: 0,
          scanInProgress: false,
          heartbeatTimeout: null,
          heartbeatInterval: null,
          contextValidationInterval: null,
          recoveryTimeout: null,
          initializeTimeout: null
        });
      }

      removeHighlights();
    } catch (error) {
      logError("Error during cleanup:", error);
    }
  }

  // Highlight management
  function removeHighlights() {
    try {
      document.querySelectorAll('.' + CONFIG.HIGHLIGHT_CLASS).forEach(el => {
        try {
          el.classList.remove(CONFIG.HIGHLIGHT_CLASS);
        } catch (error) {
          // Ignore individual element errors
        }
      });
      state.highlightedElements.clear();
    } catch (error) {
      logError("Error removing highlights:", error);
    }
  }

  function injectHighlightStyles() {
    try {
      const existingStyle = document.getElementById('universal-locator-styles');
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = 'universal-locator-styles';
        style.textContent = `
          .${CONFIG.HIGHLIGHT_CLASS} {
            outline: 2px solid #007bff !important;
            outline-offset: 1px !important;
            background-color: rgba(0, 123, 255, 0.1) !important;
          }
        `;
        document.head.appendChild(style);
      }
    } catch (error) {
      logError("Failed to inject highlight styles:", error);
    }
  }

  // Utility functions
  function log(...args) {
    if (CONFIG.DEBUG) {
      console.log("[Universal Element Locator]", ...args);
    }
  }

  function logError(...args) {
    console.error("[Universal Element Locator]", ...args);
  }

  // Message handling
  function handleMessage(message, sender, sendResponse) {
    log("Received message:", message.action);
    
    switch (message.action) {
      case 'scanPage':
        if (!state.connected) {
          sendResponse({ success: false, error: 'Not connected' });
          return true;
        }
        // TODO: Implement scan page
        sendResponse({ success: true });
        return true;
      default:
        return false;
    }
  }

  function handlePortMessage(message) {
    if (!validateContext()) {
      return;
    }

    switch (message.type) {
      case 'heartbeat':
        if (state.heartbeatTimeout) {
          clearTimeout(state.heartbeatTimeout);
          state.heartbeatTimeout = null;
        }
        state.lastHeartbeat = Date.now();
        try {
          state.port?.postMessage({ type: 'heartbeat-response' });
        } catch (error) {
          logError("Failed to send heartbeat response:", error);
          handleDisconnect(error);
        }
        break;
      case 'context-invalidated':
        handleDisconnect({ message: 'Extension context invalidated' });
        break;
      case 'reconnect':
        cleanup(true);
        initializeWithRetry();
        break;
    }
  }

  // Store cleanup function for external access
  window.__universalLocator.cleanup = cleanup;
})();
