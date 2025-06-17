/* global chrome */

// Background script for Universal Element Locator
const connections = new Map();

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
    console.log('Universal Element Locator extension installed');
});

// Handle connections from content scripts
chrome.runtime.onConnect.addListener((port) => {
    const tabId = port.sender?.tab?.id;
    if (!tabId) return;

    console.log(`Connection established from tab ${tabId}`);
    connections.set(tabId, port);

    port.onMessage.addListener((message) => {
        console.log(`Message from tab ${tabId}:`, message);
        // Handle heartbeat and other messages
        if (message.type === 'heartbeat') {
            port.postMessage({ type: 'heartbeat-response' });
        }
    });

    port.onDisconnect.addListener(() => {
        console.log(`Connection lost from tab ${tabId}`);
        connections.delete(tabId);
    });
});

// Handle tab updates - inject content script when page loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        try {
            const url = new URL(tab.url);
            if (['http:', 'https:'].includes(url.protocol)) {
                // Small delay to ensure page is ready
                setTimeout(() => {
                    injectContentScript(tabId);
                }, 500);
            }
        } catch (error) {
            console.log(`Invalid URL for tab ${tabId}`);
        }
    }
});

// Handle tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
    connections.delete(tabId);
});

async function injectContentScript(tabId) {
    try {
        // Check if content script is already injected
        if (connections.has(tabId)) {
            return;
        }

        await chrome.scripting.executeScript({
            target: { tabId },
            files: ['content.js']
        });

        // Also inject CSS
        await chrome.scripting.insertCSS({
            target: { tabId },
            files: ['content.css']
        });

        console.log(`Content script injected successfully in tab ${tabId}`);
    } catch (error) {
        console.error(`Failed to inject content script in tab ${tabId}:`, error);
    }
}
