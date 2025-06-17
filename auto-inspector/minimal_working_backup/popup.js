/* global chrome */
/* eslint-disable no-unused-vars */

// Popup script for Universal Element Locator Extension
const state = {
    connected: false,
    scanning: false,
    selectedElement: null,
    scanMode: false
};

document.addEventListener('DOMContentLoaded', initializePopup);

function initializePopup() {
    console.log('Initializing popup...');
    
    // Check if we're in a valid tab
    checkTabValidity().then(valid => {
        if (!valid) {
            updateStatus('Extension only works on regular web pages', true);
            disableControls();
            return;
        }
        
        // Initial connection check
        checkConnectionStatus();

        // Set up event listeners
        setupEventListeners();
    });
}

function setupEventListeners() {
    const scanButton = document.getElementById('scanButton');
    const scanElementButton = document.getElementById('scanElementButton');
    const highlightElementButton = document.getElementById('highlightElementButton');
    const retryButton = document.getElementById('retryConnection');
    
    if (scanButton) {
        scanButton.addEventListener('click', handleScan);
    }

    if (scanElementButton) {
        scanElementButton.addEventListener('click', toggleElementScan);
    }

    if (highlightElementButton) {
        highlightElementButton.addEventListener('click', highlightSelectedElement);
    }

    if (retryButton) {
        retryButton.addEventListener('click', handleRetryConnection);
    }
}

async function checkTabValidity() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.url) return false;
        
        const url = new URL(tab.url);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (error) {
        console.error('Tab validity check failed:', error);
        return false;
    }
}

function updateStatus(message, isError = false) {
    const status = document.getElementById('status');
    const connectionStatus = document.getElementById('connectionStatus');
    const retryButton = document.getElementById('retryConnection');
    
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
    }
    
    const scanButton = document.getElementById('scanButton');
    if (scanButton) {
        scanButton.disabled = isError;
    }
}

function disableControls() {
    const controls = document.querySelectorAll('button');
    controls.forEach(control => control.disabled = true);
}

async function checkConnectionStatus() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab) {
            updateStatus('No active tab found', true);
            return;
        }

        // Test connection by pinging content script
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
        
        if (response && response.success) {
            state.connected = true;
            updateStatus('Ready to scan any webpage!');
        } else {
            throw new Error('No response from content script');
        }
    } catch (error) {
        console.error('Connection check failed:', error);
        state.connected = false;
        updateStatus('Not connected - click retry to connect', true);
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

        // Try to inject content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
        });

        // Wait for content script to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check connection status
        await checkConnectionStatus();
        
    } catch (error) {
        console.error('Retry failed:', error);
        updateStatus('Failed to reconnect: ' + error.message, true);
    } finally {
        if (retryButton) {
            retryButton.disabled = false;
        }
    }
}

async function handleScan() {
    if (!state.connected) {
        updateStatus('Not connected - please retry connection first', true);
        return;
    }

    const scanButton = document.getElementById('scanButton');
    if (scanButton) {
        scanButton.disabled = true;
    }

    updateStatus('Scanning page elements...');

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
            throw new Error('No active tab');
        }

        const response = await chrome.tabs.sendMessage(tab.id, { 
            action: 'scanPage',
            options: {
                includeHidden: document.getElementById('includeHidden')?.checked || false,
                includeShadowDOM: document.getElementById('includeShadowDOM')?.checked || false,
                highlightDuringScanning: document.getElementById('highlightDuringScanning')?.checked || false
            }
        });

        if (response && response.success) {
            updateStatus(`Scan completed! Found ${response.stats.totalElements} elements`);
            if (response.stats) {
                updateStats(response.stats);
            }
            // Store results and open results page
            chrome.storage.local.set({ scanResults: response.results }, () => {
                chrome.tabs.create({ url: 'results.html' });
            });
        } else {
            throw new Error(response?.error || 'Scan failed');
        }
    } catch (error) {
        console.error('Scan failed:', error);
        updateStatus('Scan failed: ' + error.message, true);
        
        if (error.message.includes('receiving end does not exist')) {
            state.connected = false;
            await checkConnectionStatus();
        }
    } finally {
        if (scanButton) {
            scanButton.disabled = false;
        }
    }
}

async function toggleElementScan() {
    if (!state.connected) {
        updateStatus('Not connected - please retry connection first', true);
        return;
    }

    const scanElementButton = document.getElementById('scanElementButton');
    
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
            throw new Error('No active tab');
        }

        if (!state.scanMode) {
            state.scanMode = true;
            if (scanElementButton) {
                scanElementButton.textContent = '🛑 Stop Scan';
                scanElementButton.classList.add('active');
            }
            updateStatus('Click on any element to analyze it');

            const response = await chrome.tabs.sendMessage(tab.id, { 
                action: 'startIndividualElementScan'
            });

            if (!response || !response.success) {
                throw new Error(response?.error || 'Failed to start element scan');
            }
        } else {
            await stopElementScan();
        }
    } catch (error) {
        console.error('Element scan failed:', error);
        updateStatus('Element scan failed: ' + error.message, true);
        await stopElementScan();
    }
}

async function stopElementScan() {
    state.scanMode = false;
    const scanElementButton = document.getElementById('scanElementButton');
    if (scanElementButton) {
        scanElementButton.textContent = '🎯 Scan Element';
        scanElementButton.classList.remove('active');
    }

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
            await chrome.tabs.sendMessage(tab.id, { 
                action: 'stopIndividualElementScan'
            });
        }
    } catch (error) {
        console.error('Failed to stop element scan:', error);
    }

    updateStatus('Ready to scan any webpage!');
}

function displaySelectedElement(elementData) {
    state.selectedElement = elementData;
    
    const elementInfo = document.getElementById('elementInfo');
    const highlightButton = document.getElementById('highlightElementButton');
    
    if (elementInfo) {
        const allLocators = elementData.allLocators || elementData.locators || [];
        const locatorCount = Array.isArray(allLocators) ? allLocators.length : 
            (allLocators.primary?.length || 0) + (allLocators.secondary?.length || 0) + (allLocators.fallback?.length || 0);
        
        elementInfo.innerHTML = `
            <div class="element-info">
                <strong>${elementData.tagName || 'Unknown'}</strong>
                <div class="element-details">
                    ${elementData.text ? `Text: "${elementData.text.substring(0, 50)}${elementData.text.length > 50 ? '...' : ''}"` : 'No text content'}
                    <br>Locators: ${locatorCount}
                </div>
            </div>
        `;
        elementInfo.style.display = 'block';
    }
    
    if (highlightButton) {
        highlightButton.disabled = false;
    }
    
    updateStatus(`Element analyzed: ${elementData.tagName}`);
}

async function highlightSelectedElement() {
    if (!state.selectedElement) {
        updateStatus('No element selected to highlight', true);
        return;
    }

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab?.id) {
            throw new Error('No active tab');
        }

        const response = await chrome.tabs.sendMessage(tab.id, { 
            action: 'highlightSelectedElement',
            elementData: state.selectedElement
        });

        if (response && response.success) {
            updateStatus('Element highlighted successfully');
        } else {
            throw new Error(response?.error || 'Failed to highlight element');
        }
    } catch (error) {
        console.error('Highlight failed:', error);
        updateStatus('Highlight failed: ' + error.message, true);
    }
}

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

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'elementSelected') {
        displaySelectedElement(message.elementData);
        stopElementScan();
    }
});

// Action handlers for results
function handleViewResults() {
    chrome.tabs.create({ url: 'results.html' });
}

function handleExportData() {
    chrome.storage.local.get(['scanResults'], (result) => {
        if (result.scanResults) {
            const dataStr = JSON.stringify(result.scanResults, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'element-locators.json';
            link.click();
            
            URL.revokeObjectURL(url);
        }
    });
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
        updateStatus('Data cleared successfully');
    });
}
