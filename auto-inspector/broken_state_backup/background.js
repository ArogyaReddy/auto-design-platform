/* global chrome */
// Minimal working background script

console.log('Background script loaded');

// Simple installation handler
chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

// Auto-inject content script on page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
        chrome.scripting.executeScript({
            target: { tabId },
            files: ['content_minimal.js']
        }).catch(() => {
            // Ignore errors for pages where we can't inject
        });
    }
});
