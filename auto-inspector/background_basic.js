/* global chrome */
// Ultra-basic background script - earliest prototype version

console.log('Element Locator: Background script started');

// Just install and inject on page loads
chrome.runtime.onInstalled.addListener(() => {
  console.log('Element Locator extension installed');
});

// Auto-inject content script (very basic)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['content_basic.js']
    }).catch(() => {
      // Ignore errors
    });
  }
});
