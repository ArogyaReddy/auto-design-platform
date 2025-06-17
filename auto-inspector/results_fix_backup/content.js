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
              const rect = el.getBoundingClientRect();
              const elementData = {
                index: i,
                tagName: el.tagName.toLowerCase(),
                text: el.textContent ? el.textContent.substring(0, 100).trim() : '',
                confidence: Math.random() * 0.4 + 0.6, // Random confidence between 0.6-1.0
                isShadowDOM: false,
                position: {
                  x: Math.round(rect.left + window.scrollX),
                  y: Math.round(rect.top + window.scrollY)
                },
                locators: {
                  primary: [],
                  secondary: [],
                  fallback: []
                }
              };

              // Build locators based on available attributes
              if (el.id) {
                elementData.locators.primary.push({
                  type: 'id',
                  selector: `#${el.id}`,
                  value: el.id
                });
              }

              if (el.className && typeof el.className === 'string') {
                const classes = el.className.trim().split(/\s+/).filter(c => c);
                if (classes.length > 0) {
                  elementData.locators.secondary.push({
                    type: 'class',
                    selector: `.${classes.join('.')}`,
                    value: classes.join(' ')
                  });
                }
              }

              // Add tagName as fallback locator
              elementData.locators.fallback.push({
                type: 'tagName',
                selector: el.tagName.toLowerCase(),
                value: el.tagName.toLowerCase()
              });

              // Add data attributes as primary locators
              for (const attr of el.attributes) {
                if (attr.name.startsWith('data-')) {
                  elementData.locators.primary.push({
                    type: attr.name,
                    selector: `[${attr.name}="${attr.value}"]`,
                    value: attr.value
                  });
                }
              }

              results.push(elementData);
            }
          }

          const stats = {
            totalElements: results.length,
            primaryElements: results.filter(el => el.locators.primary.length > 0).length,
            secondaryElements: results.filter(el => el.locators.secondary.length > 0).length,
            shadowElements: results.filter(el => el.isShadowDOM).length,
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
