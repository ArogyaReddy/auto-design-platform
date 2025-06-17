/* global chrome */
// Background script - Simple working version from 11:19 era

console.log('Universal Element Locator background script loaded');

// Store area scan results temporarily
let areaScanResults = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed successfully');
});

// Handle messages and route them appropriately
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🔄 BACKGROUND: Received message:', message.action);
  
  if (message.action === 'areaScanComplete') {
    console.log('🔄 BACKGROUND: Storing area scan results');
    areaScanResults = message;
    // Store in chrome storage as well
    chrome.storage.local.set({ areaScanResults: message });
  } else if (message.action === 'getAreaScanResults') {
    console.log('🔄 BACKGROUND: Popup requesting area scan results');
    sendResponse(areaScanResults);
    areaScanResults = null; // Clear after retrieval
  }
});

// Auto-inject content script when pages load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && (tab.url.startsWith('http') || tab.url.startsWith('file:'))) {
    console.log('🔄 BACKGROUND: Injecting content script into tab:', tabId, tab.url);
    
    // Inject the main content script
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      }).then(() => {
        console.log('✅ BACKGROUND: Content script injected successfully');
      }).catch((error) => {
        console.log('⚠️ BACKGROUND: Content script injection failed:', error.message);
      });
    }, 100);
  }
});