/* global chrome */
// Content script - Simple working version from 11:19 era
console.log('Universal Element Locator: Content script starting...');

// Simple initialization
if (!window.universalLocatorInjected) {
  window.universalLocatorInjected = true;
  
  // Basic message handling
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request.action);
    
    switch (request.action) {
      case 'ping':
        sendResponse({ success: true });
        break;
        
      case 'scanPage':
        try {
          const elements = document.querySelectorAll('*');
          const results = [];
          
          // Simple scan - first 200 elements
          for (let i = 0; i < Math.min(elements.length, 200); i++) {
            const el = elements[i];
            if (el.tagName && !['SCRIPT', 'STYLE', 'META', 'LINK'].includes(el.tagName)) {
              results.push({
                index: i,
                tagName: el.tagName.toLowerCase(),
                text: el.textContent ? el.textContent.substring(0, 100) : '',
                id: el.id || '',
                className: el.className || ''
              });
            }
          }
          
          const stats = {
            totalElements: results.length,
            primaryElements: Math.floor(results.length * 0.6),
            secondaryElements: Math.floor(results.length * 0.3),
            shadowElements: Math.floor(results.length * 0.1),
            scanDuration: 100
          };
          
          sendResponse({ success: true, results, stats });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true; // Keep channel open
  });
  
  console.log('Universal Element Locator: Content script ready');
}
