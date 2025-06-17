/* global chrome */
/* eslint-disable no-unused-vars */

// Popup script for Universal Element Locator Extension
const state = {
    connected: false,
    scanning: false,
    retryAttempts: 0,
    maxRetries: 3,
    connectionCheckInterval: null,
    isValidTab: false
};

document.addEventListener('DOMContentLoaded', initializePopup);

function initializePopup() {
    // Initialize UI elements
    const scanButton = document.getElementById('scanButton');
    const status = document.getElementById('status');
    const connectionStatus = document.getElementById('connectionStatus');
    const retryButton = document.getElementById('retryConnection');
    
    // Check if we're in a valid tab
    checkTabValidity().then(valid => {
        if (!valid) {
            updateStatus('Extension only works on regular web pages', true);
            disableControls();
            if (retryButton) retryButton.style.display = 'none';
            return;
        }
        
        // Set up connection monitoring
        setupConnectionMonitoring();

        // Event listeners
        if (scanButton) {
            scanButton.addEventListener('click', handleScan);
        }

        if (retryButton) {
            retryButton.addEventListener('click', handleRetryConnection);
            retryButton.style.display = 'none'; // Hide initially
        }

        // Initial connection check
        checkConnectionStatus();
    });
}

async function checkTabValidity() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) return false;
        
        const url = new URL(tab.url);
        state.isValidTab = ['http:', 'https:'].includes(url.protocol);
        return state.isValidTab;
    } catch (error) {
        console.error('Tab validity check failed:', error);
        state.isValidTab = false;
        return false;
    }
}

function updateStatus(message, isError = false) {
    const status = document.getElementById('status');
    const connectionStatus = document.getElementById('connectionStatus');
    const retryButton = document.getElementById('retryConnection');
    const scanButton = document.getElementById('scanButton');
    
    if (status) {
        status.textContent = message;
        status.className = 'status-message ' + (isError ? 'status-error' : 'status-success');
    }
    
    if (connectionStatus) {
        connectionStatus.textContent = isError ? 'Disconnected' : 'Connected';
        connectionStatus.className = isError ? 'status-error' : 'status-success';
    }
    
    if (retryButton) {
        retryButton.style.display = isError ? 'block' : 'none';
        retryButton.disabled = false;
    }

    if (scanButton) {
        scanButton.disabled = isError;
    }
}

function disableControls() {
    const scanButton = document.getElementById('scanButton');
    if (scanButton) scanButton.disabled = true;
    
    const controls = document.querySelectorAll('.control-button');
    controls.forEach(control => control.disabled = true);
}

function enableControls() {
    const scanButton = document.getElementById('scanButton');
    if (scanButton) scanButton.disabled = false;
    
    const controls = document.querySelectorAll('.control-button');
    controls.forEach(control => control.disabled = false);
}

// Connection monitoring functions
async function setupConnectionMonitoring() {
    if (state.connectionCheckInterval) {
        clearInterval(state.connectionCheckInterval);
    }
    state.connectionCheckInterval = setInterval(checkConnectionStatus, 2000);
}

async function checkConnectionStatus() {
    if (!state.isValidTab) return;

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            updateStatus('No active tab found', true);
            return;
        }

        const response = await chrome.runtime.sendMessage({ 
            action: 'getConnectionStatus',
            tabId: tab.id
        });

        if (response.connected) {
            state.connected = true;
            updateStatus('Ready to scan');
        } else {
            state.connected = false;
            const message = response.invalidated ? 
                'Connection lost - click retry to reconnect' : 
                'Not connected - click retry to connect';
            updateStatus(message, true);
        }
    } catch (error) {
        console.error('Connection check failed:', error);
        updateStatus('Failed to check connection - click retry to connect', true);
    }
}

async function handleRetryConnection() {
    const retryButton = document.getElementById('retryConnection');
    if (retryButton) {
        retryButton.disabled = true;
    }
    
    updateStatus('Attempting to reconnect...');

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
            throw new Error('No active tab');
        }

        // Request background script to reload content script
        await chrome.runtime.sendMessage({
            action: 'reloadContentScript',
            tabId: tab.id
        });

        // Wait a bit for the content script to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check connection status
        await checkConnectionStatus();
        
    } catch (error) {
        console.error('Retry failed:', error);
        updateStatus('Failed to reconnect: ' + error.message, true);
        if (retryButton) {
            retryButton.disabled = false;
        }
    }
}

// Scan handler
async function handleScan() {
    if (!state.connected) {
        updateStatus('Not connected - please retry connection first', true);
        return;
    }

    const scanButton = document.getElementById('scanButton');
    if (scanButton) {
        scanButton.disabled = true;
    }

    updateStatus('Scanning page...');

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
            throw new Error('No active tab');
        }

        const response = await chrome.tabs.sendMessage(tab.id, { 
            action: 'scanPage'
        });

        if (response.success) {
            updateStatus('Scan completed successfully');
            if (response.stats) {
                updateStats(response.stats);
            }
        } else {
            throw new Error(response.error || 'Scan failed');
        }
    } catch (error) {
        console.error('Scan failed:', error);
        updateStatus('Scan failed: ' + error.message, true);
        
        if (error.message.includes('receiving end does not exist')) {
            // Connection lost during scan
            state.connected = false;
            await checkConnectionStatus();
        }
    } finally {
        if (scanButton) {
            scanButton.disabled = false;
        }
    }
}

// Statistics update
function updateStats(stats) {
    if (!stats) return;

    const elements = {
        totalElements: document.getElementById('totalElements'),
        primaryElements: document.getElementById('primaryElements'),
        secondaryElements: document.getElementById('secondaryElements'),
        shadowElements: document.getElementById('shadowElements'),
        scanDuration: document.getElementById('scanDuration')
    };

    for (const [key, element] of Object.entries(elements)) {
        if (element && stats[key] !== undefined) {
            element.textContent = stats[key].toString();
        }
    }
}

// Action handlers
function handleViewResults() {
    // TODO: Implement view results
    console.log('View results clicked');
}

function handleExportData() {
    // TODO: Implement export data
    console.log('Export data clicked');
}

function handleClearData() {
    chrome.storage.local.remove(['scanResults'], () => {
        updateStats({
            totalElements: 0,
            primaryElements: 0,
            secondaryElements: 0,
            shadowElements: 0,
            scanDuration: 0
        });
    });
}
