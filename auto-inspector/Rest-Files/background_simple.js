/* global chrome */
// Background script - Enhanced working version

console.log('Universal Element Locator background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed successfully');
});

// Enhanced auto-injection when pages load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if URL is supported (exclude browser internal pages)
    const url = tab.url;
    const isSupported = url.startsWith('http://') || 
                       url.startsWith('https://') || 
                       url.startsWith('file://') ||
                       url.startsWith('data:text/html');
    
    const isBlocked = url.startsWith('chrome://') || 
                     url.startsWith('chrome-extension://') ||
                     url.startsWith('moz-extension://') ||
                     url.startsWith('about:') ||
                     url.startsWith('edge://') ||
                     url.startsWith('brave://');
    
    if (isSupported && !isBlocked) {
      // Small delay to ensure page is ready
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId },
          files: ['content.js']
        }).catch(() => {
          // Silently ignore injection failures
        });
      }, 500);
    }
  }
});
