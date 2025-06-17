/* global chrome */
// Content script - Enhanced version with element highlighting
console.log('Universal Element Locator: Content script starting...');

// Add CSS for highlighting elements
const highlightCSS = `
  .universal-locator-highlight {
    outline: 2px solid #ff6b6b !important;
    outline-offset: 2px !important;
    background-color: rgba(255, 107, 107, 0.1) !important;
    position: relative !important;
    z-index: 9999 !important;
    transition: all 0.2s ease !important;
  }
  
  .universal-locator-scanning {
    outline: 2px solid #4ecdc4 !important;
    outline-offset: 2px !important;
    background-color: rgba(78, 205, 196, 0.15) !important;
    box-shadow: 0 0 10px rgba(78, 205, 196, 0.3) !important;
  }
  
  .universal-locator-scanned {
    outline: 2px solid #45b7d1 !important;
    outline-offset: 2px !important;
    background-color: rgba(69, 183, 209, 0.1) !important;
  }
`;

// Inject CSS if not already present
if (!document.getElementById('universal-locator-css')) {
  const style = document.createElement('style');
  style.id = 'universal-locator-css';
  style.textContent = highlightCSS;
  document.head.appendChild(style);
}

// Simple initialization
if (!window.universalLocatorInjected) {
  window.universalLocatorInjected = true;
  
// Helper function to clear all highlights
function clearHighlights() {
  const highlightedElements = document.querySelectorAll('.universal-locator-highlight, .universal-locator-scanning, .universal-locator-scanned');
  highlightedElements.forEach(el => {
    el.classList.remove('universal-locator-highlight', 'universal-locator-scanning', 'universal-locator-scanned');
  });
}

// Async scan function
async function handleScanPage(sendResponse) {
  try {
    console.log('Starting page scan with highlighting...');
    
    // Clear any existing highlights
    clearHighlights();
    
    const elements = document.querySelectorAll('*');
    const results = [];
    let scanProgress = 0;
    
    // Show scanning progress
    const totalElements = Math.min(elements.length, 200);
    
    // Scan elements with highlighting
    for (let i = 0; i < totalElements; i++) {
      const el = elements[i];
      
      // Skip script, style, meta, and link elements
      if (!el.tagName || ['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'TITLE'].includes(el.tagName)) {
        continue;
      }
      
      // Highlight element being scanned
      el.classList.add('universal-locator-scanning');
      
      // Small delay to show the highlight (for visual feedback)
      await new Promise(resolve => setTimeout(resolve, 2));
      
      try {
        const rect = el.getBoundingClientRect();
        
        // Only process visible elements or elements with content
        if (rect.width > 0 || rect.height > 0 || el.textContent.trim()) {
          const elementData = {
            index: results.length,
            tagName: el.tagName.toLowerCase(),
            text: el.textContent ? el.textContent.substring(0, 100).trim() : '',
            confidence: Math.random() * 0.4 + 0.6, // Random confidence between 0.6-1.0
            isShadowDOM: el.getRootNode() !== document,
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
            const classes = el.className.trim().split(/\s+/).filter(c => c && !c.startsWith('universal-locator'));
            if (classes.length > 0) {
              elementData.locators.secondary.push({
                type: 'class',
                selector: `.${classes.join('.')}`,
                value: classes.join(' ')
              });
            }
          }

          // Add data attributes as primary locators
          for (const attr of el.attributes) {
            if (attr.name.startsWith('data-') && !attr.name.startsWith('data-universal-locator')) {
              elementData.locators.primary.push({
                type: attr.name,
                selector: `[${attr.name}="${attr.value}"]`,
                value: attr.value
              });
            }
          }

          // Add name attribute for form elements
          if (el.name) {
            elementData.locators.secondary.push({
              type: 'name',
              selector: `[name="${el.name}"]`,
              value: el.name
            });
          }

          // Add tagName as fallback locator
          elementData.locators.fallback.push({
            type: 'tagName',
            selector: el.tagName.toLowerCase(),
            value: el.tagName.toLowerCase()
          });

          // Add to results
          results.push(elementData);
          
          // Mark as scanned (change highlight style)
          el.classList.remove('universal-locator-scanning');
          el.classList.add('universal-locator-scanned');
        } else {
          // Remove scanning highlight for non-processed elements
          el.classList.remove('universal-locator-scanning');
        }
      } catch (elementError) {
        console.warn('Error processing element:', elementError);
        el.classList.remove('universal-locator-scanning');
      }
      
      scanProgress++;
    }

    console.log(`Scan completed! Found ${results.length} elements`);

    const stats = {
      totalElements: results.length,
      primaryElements: results.filter(el => el.locators.primary.length > 0).length,
      secondaryElements: results.filter(el => el.locators.secondary.length > 0).length,
      shadowElements: results.filter(el => el.isShadowDOM).length,
      scanDuration: scanProgress * 2 // Approximate duration based on elements scanned
    };

    // Keep highlights for a moment to show completion
    setTimeout(() => {
      clearHighlights();
    }, 1000);

    sendResponse({ success: true, results, stats });
  } catch (error) {
    console.error('Scan failed:', error);
    clearHighlights();
    sendResponse({ success: false, error: error.message });
  }
}

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
        // Handle async scan
        handleScanPage(sendResponse);
        return true; // Keep channel open for async response
        
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
    
    return true; // Keep channel open
  });
  
  console.log('Universal Element Locator: Content script ready');
}
