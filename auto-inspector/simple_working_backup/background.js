/* global chrome */
// Background script - Simple working version from 11:19 era

console.log('Universal Element Locator background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed successfully');
});

// Simple auto-injection when pages load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    // Small delay to ensure page is ready
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['content_simple.js']
      }).catch(() => {
        // Silently ignore injection failures (e.g., on chrome:// pages)
      });
    }, 200);
  }
});
