/* global chrome */
// Simplified content script for debugging empty results
console.log('Universal Element Locator: Debug content script starting...');

// Simplified visibility check
function isElementVisible(element) {
  try {
    if (!element || !element.isConnected) return false;
    
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden') {
      return false;
    }
    
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  } catch (e) {
    return false;
  }
}

// Simplified attribute getter
function getElementAttributes(element) {
  const attributes = {};
  try {
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attr = element.attributes[i];
        attributes[attr.name] = attr.value;
      }
    }
  } catch (e) {
    console.log('Error getting attributes:', e);
  }
  return attributes;
}

// Simplified initialization
if (!window.universalLocatorInjected) {
  window.universalLocatorInjected = true;
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('🔍 Debug: Message received:', request.action);
    
    if (request.action === 'ping') {
      sendResponse({ success: true });
      return true;
    }
    
    if (request.action === 'scanPage') {
      try {
        console.log('🔍 Debug: Starting simplified scan...');
        
        const elements = document.querySelectorAll('*');
        const results = [];
        
        console.log(`🔍 Debug: Found ${elements.length} total elements`);
        
        for (let i = 0; i < elements.length && results.length < 50; i++) {
          const el = elements[i];
          
          // Skip script/style elements
          if (['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'TITLE'].includes(el.tagName)) {
            continue;
          }
          
          // Only process visible elements
          if (!isElementVisible(el)) {
            continue;
          }
          
          const attributes = getElementAttributes(el);
          const rect = el.getBoundingClientRect();
          
          console.log(`🔍 Debug: Processing element ${results.length + 1}: ${el.tagName}`, {
            id: el.id || '(no id)',
            className: el.className || '(no class)',
            attributeCount: Object.keys(attributes).length,
            hasText: !!(el.innerText || el.textContent || '').trim(),
            position: { x: Math.round(rect.left), y: Math.round(rect.top), w: Math.round(rect.width), h: Math.round(rect.height) }
          });
          
          const elementData = {
            index: results.length,
            tagName: el.tagName.toLowerCase(),
            text: (el.innerText || el.textContent || '').trim().substring(0, 100),
            confidence: 0.8,
            isShadowDOM: false,
            position: {
              x: Math.round(rect.left + window.scrollX),
              y: Math.round(rect.top + window.scrollY),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            textContent: {
              innerText: (el.innerText || '').trim().substring(0, 200),
              textContent: (el.textContent || '').trim().substring(0, 200),
              cleanText: (el.innerText || el.textContent || '').trim().substring(0, 100),
              hasText: !!(el.innerText || el.textContent || '').trim()
            },
            context: {
              parentTagName: el.parentElement ? el.parentElement.tagName.toLowerCase() : null,
              parentId: el.parentElement ? el.parentElement.id || null : null,
              childrenCount: el.children.length,
              siblingIndex: el.parentElement ? Array.from(el.parentElement.children).indexOf(el) : -1,
              nestingLevel: 0
            },
            attributes: attributes,
            elementState: {
              isFormElement: ['input', 'select', 'textarea', 'button'].includes(el.tagName.toLowerCase()),
              isInteractive: ['a', 'button', 'input', 'select', 'textarea'].includes(el.tagName.toLowerCase()),
              isVisible: true,
              hasChildren: el.children.length > 0,
              isEmptyElement: !el.textContent?.trim() && el.children.length === 0
            },
            styling: {
              computedStyles: {},
              displayType: window.getComputedStyle(el).display,
              visibility: window.getComputedStyle(el).visibility,
              opacity: window.getComputedStyle(el).opacity
            },
            locators: {
              primary: [],
              secondary: [],
              fallback: []
            }
          };

          // Add locators
          if (el.id) {
            elementData.locators.primary.push({
              type: 'id',
              selector: `#${el.id}`,
              value: el.id
            });
          }

          // Data attributes
          for (const [name, value] of Object.entries(attributes)) {
            if (name.startsWith('data-')) {
              elementData.locators.primary.push({
                type: name,
                selector: `[${name}="${value}"]`,
                value: value
              });
            }
          }

          // Class names
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

          // Fallback
          elementData.locators.fallback.push({
            type: 'tagName',
            selector: el.tagName.toLowerCase(),
            value: el.tagName.toLowerCase()
          });

          results.push(elementData);
        }
        
        console.log(`🔍 Debug: Scan complete! Found ${results.length} visible elements`);
        console.log('🔍 Debug: First element data:', results[0]);

        const stats = {
          totalElements: results.length,
          primaryElements: results.filter(el => el.locators.primary.length > 0).length,
          secondaryElements: results.filter(el => el.locators.secondary.length > 0).length,
          shadowElements: 0,
          scanDuration: 100
        };

        sendResponse({ success: true, results, stats });
      } catch (error) {
        console.error('🔍 Debug: Scan error:', error);
        sendResponse({ success: false, error: error.message });
      }
      return true;
    }
    
    return true;
  });
  
  console.log('Universal Element Locator: Debug content script ready');
}
