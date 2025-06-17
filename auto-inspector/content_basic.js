/* global chrome */
// Ultra-basic content script - earliest prototype version

console.log('Element Locator: Basic content script loaded');

// Only handle the most basic message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ping') {
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'scanPage') {
    // Ultra-simple scan - just get basic info
    const allElements = document.querySelectorAll('*');
    const basicResults = [];
    
    // Just scan first 50 elements for speed
    for (let i = 0; i < Math.min(allElements.length, 50); i++) {
      const el = allElements[i];
      if (el.tagName && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
        basicResults.push({
          tag: el.tagName.toLowerCase(),
          text: el.textContent ? el.textContent.substring(0, 30) : '',
          hasId: !!el.id,
          hasClass: !!el.className
        });
      }
    }
    
    sendResponse({ 
      success: true, 
      count: basicResults.length,
      elements: basicResults
    });
    return true;
  }
  
  return false;
});

console.log('Element Locator: Ready for basic scanning');
