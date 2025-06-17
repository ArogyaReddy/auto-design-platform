/* global chrome */
// Minimal working popup script

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Popup loaded');
    
    const statusElement = document.getElementById('status');
    const connectionElement = document.getElementById('connectionStatus');
    const scanButton = document.getElementById('scanButton');
    const retryButton = document.getElementById('retryConnection');
    
    function updateStatus(message, isError = false) {
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = isError ? 'status-error' : 'status-success';
        }
        if (connectionElement) {
            connectionElement.textContent = isError ? 'Disconnected' : 'Connected';
            connectionElement.className = isError ? 'status-error' : 'status-success';
        }
        if (retryButton) {
            retryButton.style.display = isError ? 'block' : 'none';
        }
        if (scanButton) {
            scanButton.disabled = isError;
        }
    }
    
    async function checkConnection() {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab || !tab.url.startsWith('http')) {
                updateStatus('Only works on web pages', true);
                return;
            }
            
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
            if (response && response.success) {
                updateStatus('Ready to scan!');
            } else {
                throw new Error('No response');
            }
        } catch (error) {
            console.error('Connection failed:', error);
            updateStatus('Not connected - click retry', true);
        }
    }
    
    async function handleScan() {
        try {
            updateStatus('Scanning...');
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });
            
            if (response && response.success) {
                updateStatus(`Found ${response.stats.totalElements} elements!`);
                // Store results and open results page
                chrome.storage.local.set({ scanResults: response.results });
                chrome.tabs.create({ url: 'results.html' });
            } else {
                throw new Error('Scan failed');
            }
        } catch (error) {
            console.error('Scan error:', error);
            updateStatus('Scan failed - try retry', true);
        }
    }
    
    async function handleRetry() {
        try {
            updateStatus('Reconnecting...');
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Inject content script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content_minimal.js']
            });
            
            // Wait and check
            setTimeout(checkConnection, 1000);
        } catch (error) {
            console.error('Retry failed:', error);
            updateStatus('Retry failed', true);
        }
    }
    
    // Set up event listeners
    if (scanButton) scanButton.addEventListener('click', handleScan);
    if (retryButton) retryButton.addEventListener('click', handleRetry);
    
    // Initial connection check
    checkConnection();
});
