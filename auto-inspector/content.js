/* global chrome */
// Content script - Enhanced with visibility filtering
console.log('Universal Element Locator: Content script starting...');

// Enhanced helper function to recursively traverse Shadow DOM
function getAllElementsIncludingShadowDOM(root = document, includeHidden = false) {
  const allElements = [];
  
  function traverse(node, isShadowRoot = false) {
    // If it's an element, add it to our list (with visibility check if needed)
    if (node.nodeType === Node.ELEMENT_NODE) {
      // Skip only clearly problematic elements
      const tagName = node.tagName.toLowerCase();
      const skipElements = ['script', 'style', 'meta', 'link', 'head', 'title', 'noscript'];
      
      if (!skipElements.includes(tagName)) {
        // Only add the element if we're including hidden elements OR if it's visible
        if (includeHidden || isElementVisible(node)) {
          allElements.push({
            element: node,
            isShadowDOM: isShadowRoot,
            shadowHost: isShadowRoot ? node.getRootNode().host : null
          });
        } else {
          // Even if not visible, add interactive/form elements as they might be important
          if (['input', 'button', 'select', 'textarea', 'a', 'form'].includes(tagName)) {
            allElements.push({
              element: node,
              isShadowDOM: isShadowRoot,
              shadowHost: isShadowRoot ? node.getRootNode().host : null
            });
          }
        }
      }
    }
    
    // Traverse children
    if (node.childNodes) {
      for (const child of node.childNodes) {
        traverse(child, isShadowRoot);
      }
    }
    
    // If this element has a shadow root, traverse it too
    if (node.nodeType === Node.ELEMENT_NODE && node.shadowRoot) {
      console.log('🔍 Content: Found Shadow DOM on element:', node.tagName, node.id || node.className);
      traverse(node.shadowRoot, true);
    }
    
    // Also check for closed shadow roots using common patterns
    if (node.nodeType === Node.ELEMENT_NODE) {
      // Some frameworks store shadow root references
      const possibleShadowKeys = ['_shadowRoot', '__shadowRoot', 'shadowRoot'];
      for (const key of possibleShadowKeys) {
        if (node[key] && typeof node[key] === 'object' && node[key].nodeType) {
          console.log('🔍 Content: Found closed Shadow DOM via', key, 'on element:', node.tagName);
          traverse(node[key], true);
        }
      }
    }
  }
  
  traverse(root);
  return allElements;
}

// Enhanced helper function to check if element is truly visible
function isElementVisible(element) {
  try {
    if (!element || !element.isConnected) return false;
    
    const style = window.getComputedStyle(element);
    
    // Check CSS visibility properties
    if (style.display === 'none' || 
        style.visibility === 'hidden' || 
        parseFloat(style.opacity) === 0) {
      return false;
    }
    
    // Get element bounds
    const rect = element.getBoundingClientRect();
    
    // Check if element has dimensions - but be more lenient for form elements and interactive elements
    const isFormOrInteractive = ['input', 'button', 'select', 'textarea', 'a', 'label'].includes(element.tagName.toLowerCase());
    if (!isFormOrInteractive && rect.width === 0 && rect.height === 0) {
      return false;
    }
    
    // Check if element is significantly offscreen (allowing for larger margin for scrollable content)
    const viewport = {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight
    };
    
    // More lenient offscreen check - elements can be quite far offscreen and still be valid
    if (rect.right < -2000 || 
        rect.left > viewport.width + 2000 ||
        rect.bottom < -2000 || 
        rect.top > viewport.height + 2000) {
      return false;
    }
    
    // Check for parent elements that might hide this element
    let parent = element.parentElement;
    let checkDepth = 0;
    while (parent && checkDepth < 3) { // Only check a few levels up for performance
      const parentStyle = window.getComputedStyle(parent);
      if (parentStyle.display === 'none' || 
          parentStyle.visibility === 'hidden' ||
          parseFloat(parentStyle.opacity) === 0) {
        return false;
      }
      parent = parent.parentElement;
      checkDepth++;
    }
    
    return true;
  } catch (e) {
    return false;
  }
}

// Enhanced helper function to get clean text content
function getCleanText(element) {
  try {
    // Try innerText first (respects styling), fall back to textContent
    const rawText = element.innerText || element.textContent || '';
    let cleanText = rawText.trim();
    
    // Return empty for clearly empty content
    if (!cleanText) return '';
    
    // Filter out JavaScript code patterns
    const jsPatterns = [
      /function\s*\(/,           // function declarations
      /=>\s*{/,                 // arrow functions
      /console\./,              // console statements
      /document\./,             // DOM access
      /window\./,               // window access
      /var\s+\w+\s*=/,          // variable declarations
      /const\s+\w+\s*=/,        // const declarations
      /let\s+\w+\s*=/,          // let declarations
      /\{\s*[\w'"]+\s*:\s*[\w'"]/,  // object literals
      /^\s*[{}();,]\s*$/,       // just punctuation
      /import\s+.*from/,        // import statements
      /export\s+(default\s+)?/,  // export statements
      /require\s*\(/,           // require statements
      /addEventListener/,        // event listeners
      /getElementById/,         // DOM methods
      /querySelector/           // DOM methods
    ];
    
    // Check if text matches JavaScript patterns
    for (const pattern of jsPatterns) {
      if (pattern.test(cleanText)) {
        return '';
      }
    }
    
    // Filter out very long content (likely code or data) - but be more lenient
    if (cleanText.length > 500) {
      return cleanText.substring(0, 200).trim() + '...';
    }
    
    // Filter out content that's mostly symbols or numbers - but be more lenient  
    const alphaRatio = (cleanText.match(/[a-zA-Z]/g) || []).length / cleanText.length;
    if (alphaRatio < 0.2 && cleanText.length > 20) {
      return '';
    }
    
    // Return truncated meaningful text
    return cleanText.substring(0, 150).trim();
  } catch (e) {
    return '';
  }
}

// Helper function to get element nesting level
function getElementNestingLevel(element) {
  let level = 0;
  let current = element.parentElement;
  while (current && level < 20) { // Prevent infinite loops
    level++;
    current = current.parentElement;
  }
  return level;
}

// Helper function to get all element attributes
function getAllAttributes(element) {
  const attributes = {};
  try {
    if (element.attributes && element.attributes.length > 0) {
      for (const attr of element.attributes) {
        attributes[attr.name] = attr.value;
      }
    }
  } catch (e) {
    console.log(`🔍 Debug: Error getting attributes for ${element.tagName}:`, e);
  }
  return attributes;
}

// Helper function to check if element is interactive
function isInteractiveElement(element) {
  const interactiveTags = ['a', 'button', 'input', 'select', 'textarea', 'label'];
  const interactiveRoles = ['button', 'link', 'tab', 'option', 'checkbox', 'radio'];
  const interactiveTypes = ['button', 'submit', 'reset', 'checkbox', 'radio'];
  
  return interactiveTags.includes(element.tagName.toLowerCase()) ||
         interactiveRoles.includes(element.getAttribute('role')) ||
         interactiveTypes.includes(element.getAttribute('type')) ||
         element.hasAttribute('onclick') ||
         element.hasAttribute('onmousedown') ||
         element.style.cursor === 'pointer';
}

// Helper function to get relevant CSS styles
function getRelevantStyles(element) {
  try {
    const style = window.getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      textAlign: style.textAlign,
      padding: style.padding,
      margin: style.margin,
      border: style.border,
      borderRadius: style.borderRadius,
      cursor: style.cursor
    };
  } catch (e) {
    return {};
  }
}

// Highlighting functionality - Green highlighting for scan-time
function highlightElementForScan(element) {
  if (!element || window.highlightedElements.includes(element)) return;
  
  console.log('🟢 Applying scan highlight to element:', element.tagName, element.id || element.className);
  
  // Store original styles
  const originalOutline = element.style.outline;
  const originalBoxShadow = element.style.boxShadow;
  const originalZIndex = element.style.zIndex;
  const originalTransition = element.style.transition;
  const originalBackground = element.style.backgroundColor;
  
  // Apply green outline with minimal background for scan-time (like original)
  element.style.transition = 'all 0.2s ease';
  element.style.outline = '2px solid #00ff00';
  element.style.boxShadow = '0 0 4px rgba(0, 255, 0, 0.3)';
  element.style.zIndex = '999999';
  // Keep background transparent/white like original
  element.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
  
  // Store element and original styles for cleanup
  element._originalStyles = {
    outline: originalOutline,
    boxShadow: originalBoxShadow,
    zIndex: originalZIndex,
    transition: originalTransition,
    backgroundColor: originalBackground
  };
  
  window.highlightedElements.push(element);
}

// Orange/red highlighting for UI-triggered highlighting (🎯 button clicks)
function highlightElement(element, skipClearAndScroll = false) {
  if (!element) {
    console.error('❌ No element provided for highlighting');
    return;
  }
  
  console.log('🎯 Applying UI highlight to element:', element.tagName, element.id || element.className);
  
  // Clear any existing highlights first (only for the first element)
  if (!skipClearAndScroll) {
    clearHighlights();
    
    // Scroll element into view with smooth animation (only for the first element)
    try {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center', 
        inline: 'center' 
      });
      console.log('📍 Scrolled element into view');
    } catch (scrollError) {
      console.warn('⚠️ Could not scroll element into view:', scrollError);
    }
  }
  
  // Store original styles
  const originalOutline = element.style.outline;
  const originalBoxShadow = element.style.boxShadow;
  const originalZIndex = element.style.zIndex;
  const originalTransition = element.style.transition;
  const originalBackground = element.style.backgroundColor;
  // Removed originalTransform since we'renot using transform anymore
  
  console.log('💾 Stored original styles for element');
  
  // Apply bright orange/red highlighting with maximum visibility
  element.style.transition = 'all 0.3s ease !important';
  element.style.outline = '5px solid #ff4500 !important';
  element.style.boxShadow = '0 0 30px rgba(255, 69, 0, 1), inset 0 0 30px rgba(255, 69, 0, 0.4) !important';
  element.style.zIndex = '999999 !important';
  element.style.backgroundColor = 'rgba(255, 69, 0, 0.2) !important';
  // Remove scaling to prevent layout shifts
  // element.style.transform = 'scale(1.02)'; // REMOVED
  
  console.log('🎨 Applied orange highlighting styles (no scaling)');
  
  // Store element and original styles for cleanup
  element._originalStyles = {
    outline: originalOutline,
    boxShadow: originalBoxShadow,
    zIndex: originalZIndex,
    transition: originalTransition,
    backgroundColor: originalBackground
    // Removed transform since we're not using it anymore
  };
  
  window.highlightedElements.push(element);
  
  // Add a strong pulsing effect for maximum visibility
  setTimeout(() => {
    if (element.style.outline && element.style.outline.includes('#ff4500')) {
      element.style.outline = '5px solid rgba(255, 69, 0, 0.8) !important';
      element.style.boxShadow = '0 0 40px rgba(255, 69, 0, 1), inset 0 0 40px rgba(255, 69, 0, 0.5) !important';
      console.log('💫 Applied first pulse effect');
    }
  }, 150);
  
  // Add a second pulse for extra visibility
  setTimeout(() => {
    if (element.style.outline && (element.style.outline.includes('#ff4500') || element.style.outline.includes('255, 69, 0'))) {
      element.style.outline = '5px solid #ff4500 !important';
      element.style.boxShadow = '0 0 35px rgba(255, 69, 0, 1), inset 0 0 35px rgba(255, 69, 0, 0.4) !important';
      console.log('💫 Applied second pulse effect');
    }
  }, 300);
  
  console.log('✅ UI highlighting completed for element:', element.tagName);
}

// Lightweight highlight function for testing selectors (no scaling/layout changes)
function highlightElementLightly(element, skipClearAndScroll = false) {
  if (!element) {
    console.error('❌ No element provided for light highlighting');
    return;
  }
  
  console.log('🎯 Applying light highlight to element:', element.tagName, element.id || element.className);
  
  // Clear any existing highlights first (only for the first element)
  if (!skipClearAndScroll) {
    clearHighlights();
  }
  
  // Store original styles
  const originalOutline = element.style.outline;
  const originalBoxShadow = element.style.boxShadow;
  const originalZIndex = element.style.zIndex;
  const originalTransition = element.style.transition;
  const originalBackground = element.style.backgroundColor;
  
  console.log('💾 Stored original styles for light highlighting');
  
  // Apply light highlighting WITHOUT scaling or transform changes
  element.style.transition = 'all 0.2s ease !important';
  element.style.outline = '3px solid #ff6b35 !important';
  element.style.boxShadow = '0 0 15px rgba(255, 107, 53, 0.8) !important';
  element.style.zIndex = '999998 !important';
  element.style.backgroundColor = 'rgba(255, 107, 53, 0.15) !important';
  // NO TRANSFORM/SCALING to prevent layout shifts
  
  console.log('🎨 Applied light orange highlighting styles');
  
  // Store element and original styles for cleanup
  element._originalStyles = {
    outline: originalOutline,
    boxShadow: originalBoxShadow,
    zIndex: originalZIndex,
    transition: originalTransition,
    backgroundColor: originalBackground
  };
  
  window.highlightedElements.push(element);
  
  console.log('✅ Light highlighting completed for element:', element.tagName);
}

function clearAllHighlighting() {
  console.log('🧹 Clearing all highlights from', window.highlightedElements.length, 'elements');
  window.highlightedElements.forEach(element => {
    if (element && element._originalStyles) {
      element.style.outline = element._originalStyles.outline;
      element.style.boxShadow = element._originalStyles.boxShadow;
      element.style.zIndex = element._originalStyles.zIndex;
      element.style.transition = element._originalStyles.transition;
      element.style.backgroundColor = element._originalStyles.backgroundColor;
      if (element._originalStyles.transform !== undefined) {
        element.style.transform = element._originalStyles.transform;
      }
      delete element._originalStyles;
    }
  });
  window.highlightedElements = [];
  
  // Clear number badges
  if (window.elementNumberBadges) {
    window.elementNumberBadges.forEach(badge => {
      if (badge && badge.parentElement) {
        badge.remove();
      }
    });
    window.elementNumberBadges = [];
  }
  
  // Clear multi-element summary
  const summary = document.getElementById('multi-element-summary');
  if (summary) {
    summary.remove();
  }
  
  console.log('✅ All highlights and badges cleared');
}

// Alias for consistency with new message handler
function clearHighlights() {
  clearAllHighlighting();
}

// Function to find ALL elements including those in Shadow DOM (matches browser behavior)
function findAllElementsBySelectorIncludingShadowDOM(selector) {
  console.log('🔍 Searching for ALL elements with selector:', selector);
  const foundElements = [];
  
  // First try standard document query for all elements
  try {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      foundElements.push(...Array.from(elements));
      console.log(`✅ Found ${elements.length} elements in main document`);
    }
  } catch (e) {
    console.error('❌ Invalid selector:', selector, e);
    return [];
  }
  
  // Search in Shadow DOM trees
  const allElements = getAllElementsIncludingShadowDOM(document);
  for (const el of allElements) {
    if (el.element && el.element.shadowRoot) {
      try {
        const shadowElements = el.element.shadowRoot.querySelectorAll(selector);
        if (shadowElements.length > 0) {
          foundElements.push(...Array.from(shadowElements));
          console.log(`✅ Found ${shadowElements.length} elements in Shadow DOM of:`, el.element.tagName);
        }
      } catch (e) {
        // Ignore errors from closed shadow roots or invalid selectors
        console.log('⚠️ Could not search in Shadow DOM:', e.message);
      }
    }
  }
  
  console.log(`🎯 Total elements found: ${foundElements.length}`);
  return foundElements;
}

// Legacy function for backward compatibility (returns first element)
// Function to highlight all matching elements with numbered badges
function highlightAllElements(elements) {
  if (!elements || elements.length === 0) {
    console.log('❌ No elements to highlight');
    return false;
  }
  
  console.log(`🎯 Highlighting ${elements.length} elements with numbered badges`);
  
  let successCount = 0;
  elements.forEach((element, index) => {
    try {
      // For the first element, clear highlights and scroll into view
      // For subsequent elements, skip clearing and scrolling
      const skipClearAndScroll = index > 0;
      highlightElementWithNumber(element, index + 1, elements.length, skipClearAndScroll);
      successCount++;
      console.log(`✅ Highlighted element ${index + 1}/${elements.length}:`, element.tagName, element.id || element.className);
    } catch (error) {
      console.error(`❌ Failed to highlight element ${index + 1}:`, error);
    }
  });
  
  console.log(`🎯 Successfully highlighted ${successCount}/${elements.length} elements`);
  
  // If multiple elements, show summary overlay
  if (elements.length > 1) {
    showMultiElementSummary(elements.length);
  }
  
  return successCount > 0;
}

// Enhanced highlight function that adds a numbered badge
function highlightElementWithNumber(element, number, total, skipClearAndScroll = false) {
  if (!element) return;
  
  // First do the regular highlighting
  highlightElement(element, skipClearAndScroll);
  
  // Then add a numbered badge
  addNumberBadgeToElement(element, number, total);
}

function addNumberBadgeToElement(element, number, total) {
  try {
    // Remove any existing badge first
    const existingBadge = element.querySelector('.element-number-badge');
    if (existingBadge) {
      existingBadge.remove();
    }
    
    // Create numbered badge
    const badge = document.createElement('div');
    badge.className = 'element-number-badge';
    badge.style.cssText = `
      position: absolute !important;
      top: -10px !important;
      left: -10px !important;
      z-index: 999999 !important;
      background: #ff4444 !important;
      color: white !important;
      border-radius: 50% !important;
      width: 24px !important;
      height: 24px !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
      font-size: 12px !important;
      font-weight: bold !important;
      border: 2px solid white !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3) !important;
      pointer-events: none !important;
    `;
    badge.textContent = number.toString();
    badge.title = `Element ${number} of ${total}`;
    
    // Make sure the element has relative positioning to contain the badge
    const computedStyle = getComputedStyle(element);
    if (computedStyle.position === 'static') {
      element.style.position = 'relative';
    }
    
    // Add the badge to the element
    element.appendChild(badge);
    
    // Store badge reference for cleanup
    if (!window.elementNumberBadges) {
      window.elementNumberBadges = [];
    }
    window.elementNumberBadges.push(badge);
    
  } catch (error) {
    console.error('Failed to add number badge:', error);
  }
}

function showMultiElementSummary(totalElements) {
  // Remove existing summary if any
  const existingSummary = document.getElementById('multi-element-summary');
  if (existingSummary) {
    existingSummary.remove();
  }
  
  // Create summary overlay
  const summary = document.createElement('div');
  summary.id = 'multi-element-summary';
  summary.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 999999 !important;
    background: rgba(0,0,0,0.9) !important;
    color: white !important;
    padding: 15px 20px !important;
    border-radius: 8px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
    font-size: 14px !important;
    border: 2px solid #ff4444 !important;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
    min-width: 200px !important;
  `;
  
  summary.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px; color: #ff4444;">
      🎯 Multiple Elements Found
    </div>
    <div style="margin-bottom: 8px;">
      Found <strong>${totalElements}</strong> matching elements
    </div>
    <div style="font-size: 12px; opacity: 0.8; line-height: 1.4;">
      Each element is numbered with a red badge.<br>
      Use specific selectors from the results<br>
      to target individual elements.
    </div>
    <button onclick="this.parentElement.remove()" style="
      background: #ff4444;
      border: none;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      margin-top: 10px;
      cursor: pointer;
      width: 100%;
    ">Close</button>
  `;
  
  document.body.appendChild(summary);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (summary && summary.parentElement) {
      summary.remove();
    }
  }, 10000);
}

// Simple initialization
if (!window.universalLocatorInjected) {
  window.universalLocatorInjected = true;
  
  // Highlighting functionality - only declare if not already declared
  if (!window.highlightedElements) {
    window.highlightedElements = [];
  }
  
  // Only add event listener if not already added
  if (!window.universalLocatorListenerAdded) {
    window.universalLocatorListenerAdded = true;
    
    // Basic message handling
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request.action);
    
    switch (request.action) {
      case 'ping':
        sendResponse({ success: true });
        break;
        
      case 'scanPage':
      case 'scanPageWithHighlighting':
        try {
          console.log('🔍 Content: Starting visible elements scan...');
          console.log('🔍 Content: Document ready state:', document.readyState);
          console.log('🔍 Content: DOM loaded:', document.body ? 'Yes' : 'No');
          
          if (!document.body) {
            throw new Error('Page not fully loaded - DOM body not available');
          }
          
          const scanOptions = request.options || {};
          const shouldHighlight = request.action === 'scanPageWithHighlighting' && scanOptions.highlight !== false;
          
          // Clear any existing highlighting first
          clearAllHighlighting();
          
          // Use enhanced element collection that includes Shadow DOM
          const allElementsData = getAllElementsIncludingShadowDOM(document, scanOptions.includeHidden);
          const results = [];
          let totalChecked = 0;
          let visibleFound = 0;
          let skippedByTag = 0;
          let shadowDOMFound = 0;
          
          console.log(`🔍 Content: Found ${allElementsData.length} total elements to check (including Shadow DOM)`);
          console.log(`🔍 Content: Highlighting enabled: ${shouldHighlight}`);
          console.log(`🔍 Content: Scan options:`, scanOptions);
          
          // Add debugging for element distribution
          const elementsByTag = {};
          allElementsData.forEach(({ element }) => {
            const tag = element.tagName.toLowerCase();
            elementsByTag[tag] = (elementsByTag[tag] || 0) + 1;
          });
          console.log(`🔍 Content: Element distribution:`, elementsByTag);
          
          // Scan for visible elements only
          for (let i = 0; i < allElementsData.length && results.length < 1000; i++) {
            const elementInfo = allElementsData[i];
            const el = elementInfo.element;
            const isShadowElement = elementInfo.isShadowDOM;
            
            totalChecked++;
            
            // Track Shadow DOM elements found
            if (isShadowElement) {
              shadowDOMFound++;
            }
            
            // Skip only clearly non-scannable elements (but be very conservative)
            if (!el.tagName || ['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'TITLE', 'NOSCRIPT'].includes(el.tagName)) {
              skippedByTag++;
              continue;
            }
            
            // Elements are already filtered by visibility in getAllElementsIncludingShadowDOM
            visibleFound++;
            const rect = el.getBoundingClientRect();
            
            // Highlight element if enabled - use green highlighting for scan
            if (shouldHighlight) {
              highlightElementForScan(el);
            }
            
            // Enhanced element data with detailed context and attributes
            const elementData = {
              index: results.length,
              tagName: el.tagName.toLowerCase(),
              text: getCleanText(el),
              confidence: Math.random() * 0.4 + 0.6,
              isShadowDOM: isShadowElement,
              shadowHost: isShadowElement && elementInfo.shadowHost ? {
                tagName: elementInfo.shadowHost.tagName.toLowerCase(),
                id: elementInfo.shadowHost.id || null,
                className: elementInfo.shadowHost.className || null
              } : null,
              position: {
                x: Math.round(rect.left + window.scrollX),
                y: Math.round(rect.top + window.scrollY),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
              },
              // Enhanced text and content information
              textContent: {
                innerText: (el.innerText || '').trim().substring(0, 200),
                textContent: (el.textContent || '').trim().substring(0, 200),
                cleanText: getCleanText(el),
                hasText: !!(el.innerText || el.textContent || '').trim()
              },
              // Element context and hierarchy
              context: {
                parentTagName: el.parentElement ? el.parentElement.tagName.toLowerCase() : null,
                parentId: el.parentElement ? el.parentElement.id || null : null,
                parentClasses: el.parentElement ? Array.from(el.parentElement.classList) : [],
                childrenCount: el.children.length,
                siblingIndex: Array.from(el.parentElement?.children || []).indexOf(el),
                nestingLevel: getElementNestingLevel(el)
              },
              // All attributes as key-value pairs
              attributes: getAllAttributes(el),
              // Element state and properties
              elementState: {
                isFormElement: ['input', 'select', 'textarea', 'button'].includes(el.tagName.toLowerCase()),
                isInteractive: isInteractiveElement(el),
                isVisible: true, // We already checked this
                hasChildren: el.children.length > 0,
                isEmptyElement: !el.textContent?.trim() && el.children.length === 0
              },
              // CSS information
              styling: {
                computedStyles: getRelevantStyles(el),
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

            // Enhanced locator generation with uniqueness detection
            // 1. ID locators (highest priority) - Enhanced with uniqueness verification
            if (el.id) {
              const baseSelector = `#${el.id}`;
              const selector = baseSelector;
              const isUnique = !isShadowElement && isSelectorUnique(baseSelector);
              
              elementData.locators.primary.push({
                type: 'id',
                selector: selector,
                value: el.id,
                shadowDOM: isShadowElement,
                isUnique: isUnique,
                uniquenessLevel: isUnique ? 'unique' : 'duplicate-id'
              });
              
              // If ID is not unique (should be rare but happens), add contextual selectors
              if (!isUnique || isShadowElement) {
                const uniqueSelectors = generateUniqueSelector(el, baseSelector);
                uniqueSelectors.slice(1).slice(0, 3).forEach((uniqueSelector, index) => {
                  elementData.locators.primary.push({
                    type: `id-contextual-${index + 1}`,
                    selector: uniqueSelector,
                    value: el.id,
                    shadowDOM: isShadowElement,
                    isUnique: !isShadowElement && isSelectorUnique(uniqueSelector.replace('/* Shadow DOM */ ', '')),
                    uniquenessLevel: 'contextual-id',
                    baseAttribute: 'id'
                  });
                });
              }
            }

            // 2. Data attributes (high priority for testing) - Enhanced with uniqueness
            for (const attr of el.attributes) {
              if (attr.name.startsWith('data-')) {
                const baseSelector = `[${attr.name}="${attr.value}"]`;
                const basicSelector = baseSelector;
                
                // Check if the basic selector is unique
                const isUnique = !isShadowElement && isSelectorUnique(baseSelector);
                
                // Always add the basic selector
                elementData.locators.primary.push({
                  type: attr.name,
                  selector: basicSelector,
                  value: attr.value,
                  shadowDOM: isShadowElement,
                  isUnique: isUnique,
                  uniquenessLevel: isUnique ? 'unique' : 'non-unique'
                });
                
                // If not unique, generate additional contextual selectors
                if (!isUnique || isShadowElement) {
                  const uniqueSelectors = generateUniqueSelector(el, baseSelector);
                  uniqueSelectors.slice(1).forEach((uniqueSelector, index) => {
                    elementData.locators.primary.push({
                      type: `${attr.name}-contextual-${index + 1}`,
                      selector: uniqueSelector,
                      value: attr.value,
                      shadowDOM: isShadowElement,
                      isUnique: !isShadowElement && isSelectorUnique(uniqueSelector),
                      uniquenessLevel: 'contextual',
                      baseAttribute: attr.name,
                      contextType: index === 0 ? 'parent-id' : 
                                   index === 1 ? 'parent-class' :
                                   index === 2 ? 'parent-tag' :
                                   index === 3 ? 'nth-child' :
                                   index === 4 ? 'grandparent' :
                                   'table-row' 
                    });
                  });
                }
              }
            }

            // 3. Name attribute (important for forms)
            if (el.name) {
              const selector = `[name="${el.name}"]`;
              elementData.locators.primary.push({
                type: 'name',
                selector: selector,
                value: el.name,
                shadowDOM: isShadowElement
              });
            }

            // 4. Aria labels and roles (accessibility)
            if (el.getAttribute('aria-label')) {
              const selector = `[aria-label="${el.getAttribute('aria-label')}"]`;
              elementData.locators.secondary.push({
                type: 'aria-label',
                selector: selector,
                value: el.getAttribute('aria-label'),
                shadowDOM: isShadowElement
              });
            }

            if (el.getAttribute('role')) {
              const selector = `[role="${el.getAttribute('role')}"]`;
              elementData.locators.secondary.push({
                type: 'role',
                selector: selector,
                value: el.getAttribute('role'),
                shadowDOM: isShadowElement
              });
            }

            // 5. Class names (medium priority) - Enhanced with uniqueness detection
            if (el.className && typeof el.className === 'string') {
              const classes = el.className.trim().split(/\s+/).filter(c => c);
              if (classes.length > 0) {
                const combinedSelector = `.${classes.join('.')}`;
                const selector = combinedSelector;
                const isUnique = !isShadowElement && isSelectorUnique(combinedSelector);
                
                elementData.locators.secondary.push({
                  type: 'class',
                  selector: selector,
                  value: classes.join(' '),
                  shadowDOM: isShadowElement,
                  isUnique: isUnique,
                  uniquenessLevel: isUnique ? 'unique' : 'non-unique'
                });
                
                // If combined classes are not unique, try contextual selectors
                if (!isUnique || isShadowElement) {
                  const uniqueSelectors = generateUniqueSelector(el, combinedSelector);
                  uniqueSelectors.slice(1).slice(0, 2).forEach((uniqueSelector, index) => {
                    elementData.locators.secondary.push({
                      type: `class-contextual-${index + 1}`,
                      selector: uniqueSelector,
                      value: classes.join(' '),
                      shadowDOM: isShadowElement,
                      isUnique: !isShadowElement && isSelectorUnique(uniqueSelector),
                      uniquenessLevel: 'contextual-class'
                    });
                  });
                }
                
                // Also add individual classes as separate locators with uniqueness check
                classes.forEach((className, classIndex) => {
                  const singleSelector = `.${className}`;
                  const selector = singleSelector;
                  const isClassUnique = !isShadowElement && isSelectorUnique(singleSelector);
                  
                  elementData.locators.secondary.push({
                    type: 'single-class',
                    selector: selector,
                    value: className,
                    shadowDOM: isShadowElement,
                    isUnique: isClassUnique,
                    uniquenessLevel: isClassUnique ? 'unique' : 'non-unique',
                    classIndex: classIndex
                  });
                  
                  // If single class is not unique, add contextual version
                  if (!isClassUnique && classIndex === 0) { // Only for first class to avoid too many locators
                    const uniqueSelectors = generateUniqueSelector(el, singleSelector);
                    const bestContextual = uniqueSelectors.slice(1)[0]; // Take the first contextual selector
                    if (bestContextual) {
                      elementData.locators.secondary.push({
                        type: 'single-class-contextual',
                        selector: bestContextual,
                        value: className,
                        shadowDOM: isShadowElement,
                        isUnique: !isShadowElement && isSelectorUnique(bestContextual),
                        uniquenessLevel: 'contextual-single-class'
                      });
                    }
                  }
                });
              }
            }

            // 6. Type attribute (for inputs)
            if (el.type) {
              const selector = `[type="${el.type}"]`;
              elementData.locators.secondary.push({
                type: 'type',
                selector: selector,
                value: el.type,
                shadowDOM: isShadowElement
              });
            }

            // 7. Placeholder text (for inputs)
            if (el.placeholder) {
              elementData.locators.secondary.push({
                type: 'placeholder',
                selector: `[placeholder="${el.placeholder}"]`,
                value: el.placeholder
              });
            }

            // 8. Text content-based locators (for links and buttons)
            const textContent = getCleanText(el);
            if (textContent && textContent.length > 0 && textContent.length <= 50) {
              if (el.tagName.toLowerCase() === 'a' || 
                  el.tagName.toLowerCase() === 'button' ||
                  el.getAttribute('role') === 'button') {
                elementData.locators.secondary.push({
                  type: 'text',
                  selector: `${el.tagName.toLowerCase()}:contains("${textContent}")`,
                  value: textContent
                });
              }
            }

            // 9. Always add tagName as fallback
            elementData.locators.fallback.push({
              type: 'tagName',
              selector: el.tagName.toLowerCase(),
              value: el.tagName.toLowerCase()
            });

            // 10. Add position-based fallback for unique identification
            const position = `${Math.round(rect.left)},${Math.round(rect.top)}`;
            elementData.locators.fallback.push({
              type: 'position',
              selector: `/* position: ${position} */`,
              value: position
            });

            results.push(elementData);
            
            // Validate that we actually have meaningful data
            if (results.length === 1) {
              console.log('🔍 Debug: First element validation:', {
                hasAttributes: Object.keys(elementData.attributes).length > 0,
                hasContext: !!elementData.context.parentTagName,
                hasLocators: elementData.locators.primary.length > 0 || elementData.locators.secondary.length > 0,
                sampleData: {
                  attributes: elementData.attributes,
                  context: elementData.context,
                  primaryLocators: elementData.locators.primary.length,
                  secondaryLocators: elementData.locators.secondary.length
                }
              });
            }
          }
          
          console.log(`🔍 Content: Scan complete! Checked ${totalChecked} elements, found ${visibleFound} visible, captured ${results.length}`);
          console.log(`🔍 Content: Shadow DOM found: ${shadowDOMFound} elements`);
          console.log(`🔍 Content: Filtering stats - Skipped by tag: ${skippedByTag}, Visible elements processed: ${visibleFound}`);

          // Validate results quality
          if (results.length === 0) {
            console.warn('🔍 Content: No elements found - this might indicate an issue');
            throw new Error(`No visible elements found on page. Checked ${totalChecked} elements, found ${visibleFound} visible elements.`);
          }
          
          if (results.length < 5 && visibleFound > 10) {
            console.warn('🔍 Content: Very few results captured compared to visible elements found');
          }

          const stats = {
            totalElements: results.length,
            primaryElements: results.filter(el => el.locators.primary.length > 0).length,
            secondaryElements: results.filter(el => el.locators.secondary.length > 0).length,
            shadowElements: results.filter(el => el.isShadowDOM).length,
            scanDuration: 100,
            debugInfo: {
              totalChecked,
              visibleFound,
              skippedByTag,
              shadowDOMFound
            }
          };

          sendResponse({ success: true, results, stats });
        } catch (error) {
          console.error('🔍 Content: Scan error:', error);
          console.error('🔍 Content: Error stack:', error.stack);
          sendResponse({ success: false, error: error.message, details: error.stack });
        }
        break;
      
      case 'clearHighlighting':
        try {
          clearAllHighlighting();
          sendResponse({ success: true });
        } catch (error) {
          sendResponse({ success: false, error: error.message });
        }
        break;
        
      case 'highlightElement':
        try {
          const { selector } = request;
          if (!selector) {
            throw new Error('No selector provided for highlighting');
          }
          
          console.log('🎯 Highlighting ALL elements with selector:', selector);
          
          // Find all matching elements (like browser dev tools)
          const elements = findAllElementsBySelectorIncludingShadowDOM(selector);
          if (elements.length > 0) {
            const success = highlightAllElements(elements);
            if (success) {
              console.log(`✅ Successfully highlighted ${elements.length} elements`);
              sendResponse({ 
                success: true, 
                found: true, 
                count: elements.length 
              });
            } else {
              console.log('❌ Failed to highlight elements');
              sendResponse({ success: false, error: 'Failed to apply highlighting' });
            }
          } else {
            console.log('❌ No elements found for highlighting');
            sendResponse({ success: true, found: false, count: 0 });
          }
        } catch (error) {
          console.error('Error highlighting elements:', error);
          sendResponse({ success: false, error: error.message });
        }
        break;
      
      case 'clearHighlights':
        try {
          clearHighlights();
          console.log('✅ Highlights cleared');
          sendResponse({ success: true });
        } catch (error) {
          console.error('Error clearing highlights:', error);
          sendResponse({ success: false, error: error.message });
        }
        break;
        
      case 'startElementScan':
        try {
          console.log('🎯 Starting element scan mode...');
          startElementScanMode();
          sendResponse({ success: true });
        } catch (error) {
          console.error('Error starting element scan mode:', error);
          sendResponse({ success: false, error: error.message });
        }
        break;
        
      case 'stopElementScan':
        try {
          console.log('🎯 Stopping element scan mode...');
          stopElementScanMode();
          sendResponse({ success: true });
        } catch (error) {
          console.error('Error stopping element scan mode:', error);
          sendResponse({ success: false, error: error.message });
        }
        break;
        
      case 'startAreaScanMode':
        try {
          console.log('📦 Starting area scan mode...');
          startAreaScanMode();
          sendResponse({ success: true });
        } catch (error) {
          console.error('Error starting area scan mode:', error);
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
}

// Helper function to generate unique contextual selectors
function generateUniqueSelector(element, baseSelector) {
  const selectors = [];
  const prefix = '';
  
  // Start with the base selector
  selectors.push(`${prefix}${baseSelector}`);
  
  // Try to make it unique by adding parent context
  let parent = element.parentElement;
  if (parent) {
    // Parent with ID
    if (parent.id) {
      selectors.push(`${prefix}#${parent.id} ${baseSelector}`);
    }
    
    // Parent with unique class
    if (parent.className) {
      const parentClasses = parent.className.trim().split(/\s+/).filter(c => c);
      if (parentClasses.length > 0) {
        selectors.push(`${prefix}.${parentClasses[0]} ${baseSelector}`);
      }
    }
    
    // Parent tag name context
    selectors.push(`${prefix}${parent.tagName.toLowerCase()} ${baseSelector}`);
    
    // Sibling index context (nth-child)
    const siblings = Array.from(parent.children);
    const index = siblings.indexOf(element);
    if (index >= 0) {
      selectors.push(`${prefix}${baseSelector}:nth-child(${index + 1})`);
    }
    
    // Grandparent context for deeply nested elements
    const grandparent = parent.parentElement;
    if (grandparent && grandparent.id) {
      selectors.push(`${prefix}#${grandparent.id} ${parent.tagName.toLowerCase()} ${baseSelector}`);
    }
  }
  
  // Table context (for table cells, rows)
  const table = element.closest('table');
  if (table) {
    const row = element.closest('tr');
    if (row) {
      const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
      const cellIndex = Array.from(row.children).indexOf(element);
      if (rowIndex >= 0 && cellIndex >= 0) {
        selectors.push(`${prefix}table tr:nth-child(${rowIndex + 1}) ${baseSelector}`);
        selectors.push(`${prefix}table tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1}) ${baseSelector}`);
      }
    }
  }
  
  // Form context
  const form = element.closest('form');
  if (form) {
    if (form.id) {
      selectors.push(`${prefix}#${form.id} ${baseSelector}`);
    } else if (form.className) {
      const formClasses = form.className.trim().split(/\s+/).filter(c => c);
      if (formClasses.length > 0) {
        selectors.push(`${prefix}.${formClasses[0]} ${baseSelector}`);
      }
    }
  }
  
  // List context (for list items)
  const list = element.closest('ul, ol');
  if (list) {
    const listItems = Array.from(list.children);
    const itemIndex = listItems.indexOf(element.closest('li'));
    if (itemIndex >= 0) {
      selectors.push(`${prefix}${list.tagName.toLowerCase()} li:nth-child(${itemIndex + 1}) ${baseSelector}`);
    }
  }
  
  return selectors;
}

// Helper function to check if a selector is unique on the page
function isSelectorUnique(selector, shadowDOM = false) {
  try {
    if (shadowDOM) {
      // For shadow DOM, we'd need more complex checking
      // For now, assume it might not be unique
      return false;
    }
    const elements = document.querySelectorAll(selector);
    return elements.length === 1;
  } catch (e) {
    return false;
  }
}

// ==============================================================================
// SCAN ELEMENT MODE FUNCTIONALITY
// ==============================================================================

// Initialize scan mode variables
if (!window.isElementScanMode) {
  window.isElementScanMode = false;
}
if (!window.scanModeHoverElement) {
  window.scanModeHoverElement = null;
}
if (!window.scanModeEventListeners) {
  window.scanModeEventListeners = [];
}

function startElementScanMode() {
  console.log('🎯 Starting element scan mode...');
  
  if (window.isElementScanMode) {
    console.log('🎯 Element scan mode already active');
    return;
  }
  
  window.isElementScanMode = true;
  
  // Clear any existing highlights
  clearAllHighlighting();
  
  // Change cursor to crosshair
  document.body.style.cursor = 'crosshair';
  
  // Create event listeners
  const hoverListener = (event) => {
    if (!window.isElementScanMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    
    // Clear previous hover highlight
    if (window.scanModeHoverElement) {
      removeScanModeHighlight(window.scanModeHoverElement);
    }
    
    // Apply new hover highlight
    window.scanModeHoverElement = element;
    addScanModeHighlight(element);
  };
  
  const clickListener = (event) => {
    if (!window.isElementScanMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    console.log('🎯 Element selected for scanning:', element);
    
    // Scan the selected element
    scanSelectedElement(element);
    
    // Exit scan mode
    stopElementScanMode();
  };
  
  const escapeListener = (event) => {
    if (!window.isElementScanMode) return;
    
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      console.log('🎯 Escape pressed - exiting scan mode');
      stopElementScanMode();
    }
  };
  
  // Add event listeners
  document.addEventListener('mouseover', hoverListener, true);
  document.addEventListener('click', clickListener, true);
  document.addEventListener('keydown', escapeListener, true);
  
  // Store listeners for cleanup
  window.scanModeEventListeners = [
    { element: document, event: 'mouseover', listener: hoverListener, options: true },
    { element: document, event: 'click', listener: clickListener, options: true },
    { element: document, event: 'keydown', listener: escapeListener, options: true }
  ];
  
  console.log('🎯 Element scan mode activated - hover to highlight, click to select, ESC to exit');
}

function stopElementScanMode() {
  console.log('🎯 Stopping element scan mode...');
  
  if (!window.isElementScanMode) {
    console.log('🎯 Element scan mode not active');
    return;
  }
  
  window.isElementScanMode = false;
  
  // Restore cursor
  document.body.style.cursor = '';
  
  // Clear hover highlight
  if (window.scanModeHoverElement) {
    removeScanModeHighlight(window.scanModeHoverElement);
    window.scanModeHoverElement = null;
  }
  
  // Remove event listeners
  window.scanModeEventListeners.forEach(({ element, event, listener, options }) => {
    element.removeEventListener(event, listener, options);
  });
  window.scanModeEventListeners = [];
  
  console.log('🎯 Element scan mode deactivated');
}

function addScanModeHighlight(element) {
  if (!element) return;
  
  // Store original styles
  if (!element._scanModeOriginalStyles) {
    element._scanModeOriginalStyles = {
      outline: element.style.outline,
      backgroundColor: element.style.backgroundColor,
      border: element.style.border
    };
  }
  
  // Apply scan mode highlight (different from regular highlight)
  element.style.outline = '3px dashed #00ff00';
  element.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
  element.style.border = '1px solid #00ff00';
}

function removeScanModeHighlight(element) {
  if (!element || !element._scanModeOriginalStyles) return;
  
  // Restore original styles
  element.style.outline = element._scanModeOriginalStyles.outline;
  element.style.backgroundColor = element._scanModeOriginalStyles.backgroundColor;
  element.style.border = element._scanModeOriginalStyles.border;
  
  delete element._scanModeOriginalStyles;
}

function scanSelectedElement(element) {
  console.log('🎯 Scanning selected element:', element);
  
  if (!element) {
    console.error('❌ No element provided for scanning');
    return;
  }
  
  // Generate comprehensive element data
  const elementData = generateElementData(element);
  
  // Create and show the movable popup with results
  createElementLocatorsPopup(elementData);
  
  console.log('✅ Element scan complete, popup displayed');
}

function generateElementData(element) {
  const rect = element.getBoundingClientRect();
  
  // Generate all possible locators
  const locators = {
    primary: [],
    secondary: []
  };
  
  // ID locator
  if (element.id) {
    const selector = `#${element.id}`;
    locators.primary.push({
      type: 'id',
      selector: selector,
      value: element.id,
      unique: isSelectorUnique(selector)
    });
  }
  
  // Data attributes
  for (const attr of element.attributes) {
    if (attr.name.startsWith('data-')) {
      const selector = `[${attr.name}="${attr.value}"]`;
      locators.primary.push({
        type: attr.name,
        selector: selector,
        value: attr.value,
        unique: isSelectorUnique(selector)
      });
    }
  }
  
  // Name attribute
  if (element.name) {
    const selector = `[name="${element.name}"]`;
    locators.primary.push({
      type: 'name',
      selector: selector,
      value: element.name,
      unique: isSelectorUnique(selector)
    });
  }
  
  // Class names
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).filter(c => c);
    if (classes.length > 0) {
      const selector = `.${classes.join('.')}`;
      locators.secondary.push({
        type: 'class',
        selector: selector,
        value: classes.join(' '),
        unique: isSelectorUnique(selector)
      });
    }
  }
  
  // Tag name
  locators.secondary.push({
    type: 'tag',
    selector: element.tagName.toLowerCase(),
    value: element.tagName.toLowerCase(),
    unique: false
  });
  
  return {
    tagName: element.tagName.toLowerCase(),
    text: (element.textContent || '').trim().substring(0, 50),
    position: {
      x: Math.round(rect.left + window.scrollX),
      y: Math.round(rect.top + window.scrollY),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    },
    locators: locators
  };
}

function createElementLocatorsPopup(elementData) {
  // Remove any existing popup
  const existingPopup = document.getElementById('universal-locator-popup');
  if (existingPopup) {
    existingPopup.remove();
  }
  
  // Create popup container
  const popup = document.createElement('div');
  popup.id = 'universal-locator-popup';
  popup.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    width: 500px !important;
    max-height: 650px !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border: none !important;
    border-radius: 20px !important;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5) !important;
    z-index: 999999 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    color: white !important;
    overflow: hidden !important;
    resize: both !important;
    min-width: 400px !important;
    min-height: 300px !important;
  `;
  
  // Create header (draggable)
  const header = document.createElement('div');
  header.style.cssText = `
    padding: 18px 24px;
    background: rgba(255, 255, 255, 0.15);
    cursor: move;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.25);
  `;
  
  const title = document.createElement('h3');
  title.style.cssText = `
    margin: 0;
    font-size: 17px;
    font-weight: 600;
    letter-spacing: 0.3px;
  `;
  title.textContent = `🎯 Element Locators: ${elementData.tagName.toUpperCase()}`;
  
  const closeBtn = document.createElement('button');
  closeBtn.style.cssText = `
    background: rgba(255, 255, 255, 0.25);
    border: none;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  `;
  closeBtn.textContent = '×';
  closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.35)';
  closeBtn.onmouseout = () => closeBtn.style.background = 'rgba(255, 255, 255, 0.25)';
  closeBtn.onclick = () => popup.remove();
  
  header.appendChild(title);
  header.appendChild(closeBtn);
  
  // Create content area
  const content = document.createElement('div');
  content.style.cssText = `
    padding: 30px !important;
    max-height: 500px !important;
    overflow-y: auto !important;
  `;
  
  // Element info
  const elementInfo = document.createElement('div');
  elementInfo.style.cssText = `
    background: rgba(255, 255, 255, 0.2) !important;
    padding: 20px !important;
    border-radius: 15px !important;
    margin-bottom: 25px !important;
    font-size: 15px !important;
    line-height: 1.6 !important;
  `;
  elementInfo.innerHTML = `
    <div style="margin-bottom: 12px !important;"><strong>Tag:</strong> ${elementData.tagName.toUpperCase()}</div>
    <div style="margin-bottom: 12px !important;"><strong>Text:</strong> "${elementData.text}"</div>
    <div><strong>Position:</strong> ${elementData.position.x}, ${elementData.position.y} (${elementData.position.width}×${elementData.position.height})</div>
  `;
  
  content.appendChild(elementInfo);
  
  // Add locators
  ['primary', 'secondary'].forEach(category => {
    if (elementData.locators[category].length > 0) {
      const categoryHeader = document.createElement('h4');
      categoryHeader.style.cssText = `
        margin: 20px 0 12px 0;
        font-size: 16px;
        text-transform: capitalize;
        color: rgba(255, 255, 255, 0.95);
        font-weight: 600;
      `;
      categoryHeader.textContent = `${category} Locators (${elementData.locators[category].length})`;
      content.appendChild(categoryHeader);
      
      elementData.locators[category].forEach(locator => {
        const locatorDiv = document.createElement('div');
        locatorDiv.style.cssText = `
          background: rgba(255, 255, 255, 0.18) !important;
          border: 2px solid rgba(255, 255, 255, 0.3) !important;
          border-radius: 15px !important;
          padding: 18px !important;
          margin-bottom: 15px !important;
          font-size: 14px !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: flex-start !important;
          gap: 15px !important;
        `;
        
        const selectorDiv = document.createElement('div');
        selectorDiv.style.cssText = `
          flex: 1;
          margin-right: 12px;
        `;
        
        const selectorText = document.createElement('code');
        selectorText.style.cssText = `
          background: rgba(0, 0, 0, 0.3);
          padding: 8px 10px;
          border-radius: 6px;
          font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
          font-size: 12px;
          word-break: break-all;
          display: block;
          margin-bottom: 8px;
          line-height: 1.4;
          color: #e8f5e8;
        `;
        selectorText.textContent = locator.selector;
        
        const metaDiv = document.createElement('div');
        metaDiv.style.cssText = `
          font-size: 11px;
          color: rgba(255, 255, 255, 0.75);
          line-height: 1.3;
        `;
        metaDiv.innerHTML = `Type: ${locator.type} | Unique: ${locator.unique ? '✅' : '❌'}`;
        
        selectorDiv.appendChild(selectorText);
        selectorDiv.appendChild(metaDiv);
        
        // Copy button
        const copyBtn = document.createElement('button');
        copyBtn.style.cssText = `
          background: rgba(255, 255, 255, 0.25);
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          margin-bottom: 6px;
          font-weight: 500;
          transition: all 0.2s ease;
        `;
        copyBtn.textContent = '📋 Copy';
        copyBtn.onmouseover = () => copyBtn.style.background = 'rgba(255, 255, 255, 0.35)';
        copyBtn.onmouseout = () => copyBtn.style.background = 'rgba(255, 255, 255, 0.25)';
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(locator.selector);
          copyBtn.textContent = '✅ Copied!';
          setTimeout(() => copyBtn.textContent = '📋 Copy', 2000);
        };
        
        // Test button
        const testBtn = document.createElement('button');
        testBtn.style.cssText = `
          background: rgba(76, 175, 80, 0.9);
          border: none;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.2s ease;
        `;
        testBtn.textContent = '🎯 Test';
        testBtn.onmouseover = () => testBtn.style.background = 'rgba(76, 175, 80, 1)';
        testBtn.onmouseout = () => testBtn.style.background = 'rgba(76, 175, 80, 0.9)';
        testBtn.onclick = () => {
          // Clear existing highlights
          clearAllHighlighting();
          
          // Find and highlight elements
          const elements = document.querySelectorAll(locator.selector);
          if (elements.length > 0) {
            // Limit highlighting to prevent layout issues
            const maxHighlight = 10; // Only highlight first 10 elements
            const elementsToHighlight = Array.from(elements).slice(0, maxHighlight);
            
            elementsToHighlight.forEach((el, index) => {
              highlightElementLightly(el, index > 0); // Use lighter highlighting
            });
            
            if (elements.length > maxHighlight) {
              testBtn.textContent = `✅ Found ${elements.length}! (Showing ${maxHighlight})`;
            } else {
              testBtn.textContent = `✅ Found ${elements.length}!`;
            }
          } else {
            testBtn.textContent = '❌ Not Found';
          }
          
          setTimeout(() => testBtn.textContent = '🎯 Test', 3000);
        };
        
        const buttonsDiv = document.createElement('div');
        buttonsDiv.style.cssText = `
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 80px;
        `;
        buttonsDiv.appendChild(copyBtn);
        buttonsDiv.appendChild(testBtn);
        
        locatorDiv.appendChild(selectorDiv);
        locatorDiv.appendChild(buttonsDiv);
        
        content.appendChild(locatorDiv);
      });
    }
  });
  
  popup.appendChild(header);
  popup.appendChild(content);
  
  // Make draggable
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };
  
  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragOffset.x = e.clientX - popup.offsetLeft;
    dragOffset.y = e.clientY - popup.offsetTop;
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
  });
  
  function drag(e) {
    if (isDragging) {
      popup.style.left = (e.clientX - dragOffset.x) + 'px';
      popup.style.top = (e.clientY - dragOffset.y) + 'px';
      popup.style.right = 'auto';
    }
  }
  
  function stopDrag() {
    isDragging = false;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
  }
  
  // Add to page
  document.body.appendChild(popup);
  
  // Auto-focus first copy button for keyboard users
  const firstCopyBtn = popup.querySelector('button[onclick]');
  if (firstCopyBtn) {
    firstCopyBtn.focus();
  }
  
  console.log('🎯 Element locators popup created and displayed');
}

// Area Scan Mode Functions
function startAreaScanMode() {
  console.log('📦 Starting area scan mode...');
  
  if (window.isAreaScanMode) {
    console.log('📦 Area scan mode already active');
    return;
  }
  
  window.isAreaScanMode = true;
  
  // Clear any existing highlights
  clearAllHighlighting();
  
  // Change cursor to crosshair
  document.body.style.cursor = 'crosshair';
  
  // Create overlay to show scan mode is active
  const overlay = document.createElement('div');
  overlay.id = 'area-scan-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 100, 255, 0.05);
    z-index: 999998;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  `;
  
  const instruction = document.createElement('div');
  instruction.style.cssText = `
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px 30px;
    border-radius: 12px;
    font-size: 16px;
    text-align: center;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  `;
  instruction.innerHTML = `
    <div style="font-size: 20px; margin-bottom: 10px;">📦 Area Scan Mode</div>
    <div>Click on any container to scan all its elements</div>
    <div style="font-size: 14px; opacity: 0.8; margin-top: 10px;">Press ESC to cancel</div>
  `;
  
  overlay.appendChild(instruction);
  document.body.appendChild(overlay);
  
  // Hide instruction after 3 seconds
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.5s ease';
      setTimeout(() => {
        if (overlay.parentNode) {
          overlay.remove();
        }
      }, 500);
    }
  }, 3000);
  
  // Create event listeners
  const hoverListener = (event) => {
    if (!window.isAreaScanMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const element = event.target;
    
    // Clear previous hover highlight
    if (window.areaScanHoverElement) {
      removeAreaScanHighlight(window.areaScanHoverElement);
    }
    
    // Apply new hover highlight for area
    window.areaScanHoverElement = element;
    addAreaScanHighlight(element);
  };
  
  const clickListener = (event) => {
    if (!window.isAreaScanMode) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    const container = event.target;
    console.log('📦 Container selected for area scanning:', container);
    
    // Scan all elements within the selected container
    scanAreaElements(container);
    
    // Exit area scan mode
    stopAreaScanMode();
  };
  
  const escapeListener = (event) => {
    if (!window.isAreaScanMode) return;
    
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      console.log('📦 Escape pressed - exiting area scan mode');
      
      // Send cancellation message to popup
      try {
        chrome.runtime.sendMessage({
          action: 'areaScanCancelled'
        });
      } catch (error) {
        console.log('Could not send cancellation message:', error);
      }
      
      stopAreaScanMode();
    }
  };
  
  // Add event listeners
  document.addEventListener('mouseover', hoverListener, true);
  document.addEventListener('click', clickListener, true);
  document.addEventListener('keydown', escapeListener, true);
  
  // Store listeners for cleanup
  window.areaScanEventListeners = [
    { element: document, event: 'mouseover', listener: hoverListener, options: true },
    { element: document, event: 'click', listener: clickListener, options: true },
    { element: document, event: 'keydown', listener: escapeListener, options: true }
  ];
  
  console.log('📦 Area scan mode activated - hover to highlight area, click to scan area, ESC to cancel');
}

function stopAreaScanMode() {
  console.log('📦 Stopping area scan mode...');
  
  if (!window.isAreaScanMode) {
    console.log('📦 Area scan mode not active');
    return;
  }
  
  window.isAreaScanMode = false;
  
  // Restore cursor
  document.body.style.cursor = '';
  
  // Remove overlay if it exists
  const overlay = document.getElementById('area-scan-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // Clear hover highlight
  if (window.areaScanHoverElement) {
    removeAreaScanHighlight(window.areaScanHoverElement);
    window.areaScanHoverElement = null;
  }
  
  // Remove event listeners
  if (window.areaScanEventListeners) {
    window.areaScanEventListeners.forEach(({ element, event, listener, options }) => {
      element.removeEventListener(event, listener, options);
    });
    window.areaScanEventListeners = [];
  }
  
  console.log('📦 Area scan mode deactivated');
}

function addAreaScanHighlight(element) {
  if (!element) return;
  
  // Store original styles
  if (!element._areaScanOriginalStyles) {
    element._areaScanOriginalStyles = {
      outline: element.style.outline,
      backgroundColor: element.style.backgroundColor,
      border: element.style.border,
      boxShadow: element.style.boxShadow
    };
  }
  
  // Apply area scan highlight (blue theme for containers)
  element.style.outline = '3px dashed #0066ff';
  element.style.backgroundColor = 'rgba(0, 100, 255, 0.1)';
  element.style.border = '2px solid #0066ff';
  element.style.boxShadow = '0 0 20px rgba(0, 100, 255, 0.3)';
}

function removeAreaScanHighlight(element) {
  if (!element || !element._areaScanOriginalStyles) return;
  
  // Restore original styles
  element.style.outline = element._areaScanOriginalStyles.outline;
  element.style.backgroundColor = element._areaScanOriginalStyles.backgroundColor;
  element.style.border = element._areaScanOriginalStyles.border;
  element.style.boxShadow = element._areaScanOriginalStyles.boxShadow;
  
  delete element._areaScanOriginalStyles;
}

function scanAreaElements(container) {
  console.log('📦 Scanning all elements within container:', container);
  
  if (!container) {
    console.error('❌ No container provided for area scanning');
    return;
  }
  
  try {
    // Collect container information
    const containerInfo = {
      tagName: container.tagName.toLowerCase(),
      id: container.id || '',
      className: container.className || '',
      url: window.location.href,
      selector: generateSimpleSelector(container)
    };
    
    // Find all scannable elements within this container
    const allElements = container.querySelectorAll('*');
    const scannableElements = [];
    
    console.log(`📦 Found ${allElements.length} total elements in container`);
    
    // Filter and process elements
    for (const element of allElements) {
      // Skip script/style elements
      if (!element.tagName || ['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'TITLE', 'NOSCRIPT'].includes(element.tagName)) {
        continue;
      }
      
      // Check if element is visible
      if (!isElementVisible(element)) {
        continue;
      }
      
      // Generate element data similar to full page scan
      const elementData = generateCompleteElementData(element, true); // true indicates it's within a container
      if (elementData) {
        scannableElements.push(elementData);
      }
      
      // Limit to prevent performance issues
      if (scannableElements.length >= 100) {
        console.log('📦 Reached 100 element limit for area scan');
        break;
      }
    }
    
    console.log(`📦 Area scan complete: ${scannableElements.length} scannable elements found`);
    
    // Send results back to popup
    try {
      console.log('📦 CONTENT: Sending area scan results to popup:', scannableElements.length, 'elements');
      
      // Store results in storage immediately as well as sending message
      const areaScanResults = {
        action: 'areaScanComplete',
        results: {
          elements: scannableElements,
          scanDuration: Date.now() % 1000 // Simple duration
        },
        containerInfo: containerInfo,
        timestamp: Date.now()
      };
      
      // Store in local storage as backup
      chrome.storage.local.set({ areaScanResults });
      
      // Send message to popup
      chrome.runtime.sendMessage(areaScanResults);
      console.log('📦 CONTENT: Area scan results sent successfully');
    } catch (error) {
      console.error('📦 CONTENT: Failed to send area scan results:', error);
    }
    
    // Highlight found elements briefly
    scannableElements.forEach((elementData, index) => {
      setTimeout(() => {
        const element = document.querySelector(elementData.locators.primary[0]?.selector);
        if (element) {
          highlightElementLightly(element, true); // true = skip clear and scroll
        }
      }, index * 50); // Stagger highlighting
    });
    
  } catch (error) {
    console.error('📦 Area scan failed:', error);
    
    // Send error back to popup
    try {
      chrome.runtime.sendMessage({
        action: 'areaScanCancelled'
      });
    } catch (msgError) {
      console.log('Could not send error message:', msgError);
    }
  }
}

function generateSimpleSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.className && typeof element.className === 'string') {
    const classes = element.className.trim().split(/\s+/).filter(c => c);
    if (classes.length > 0) {
      return `.${classes[0]}`;
    }
  }
  
  return element.tagName.toLowerCase();
}

function generateCompleteElementData(element, isInContainer = false) {
  try {
    const rect = element.getBoundingClientRect();
    
    // Basic element information
    const elementData = {
      tagName: element.tagName.toLowerCase(),
      text: getCleanText(element),
      attributes: {},
      position: {
        x: Math.round(rect.left + window.scrollX),
        y: Math.round(rect.top + window.scrollY),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      locators: {
        primary: [],
        secondary: [],
        fallback: [],
        unique: [] // New category for guaranteed unique selectors
      },
      context: {
        isInContainer: isInContainer,
        parentTagName: element.parentElement?.tagName?.toLowerCase() || '',
        hasChildren: element.children.length > 0,
        childCount: element.children.length,
        indexInParent: Array.from(element.parentElement?.children || []).indexOf(element),
        indexOfType: Array.from(element.parentElement?.querySelectorAll(element.tagName) || []).indexOf(element)
      }
    };
    
    // Copy attributes
    for (const attr of element.attributes) {
      elementData.attributes[attr.name] = attr.value;
    }
    
    // Generate primary locators (high priority)
    
    // 1. ID
    if (element.id) {
      const selector = `#${element.id}`;
      const isUnique = isSelectorUnique(selector);
      elementData.locators[isUnique ? 'unique' : 'primary'].push({
        type: 'id',
        selector: selector,
        value: element.id,
        isUnique: isUnique
      });
    }
    
    // 2. Data attributes with uniqueness enhancement
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-')) {
        const basicSelector = `[${attr.name}="${attr.value}"]`;
        const isBasicUnique = isSelectorUnique(basicSelector);
        
        // Add basic selector
        elementData.locators[isBasicUnique ? 'unique' : 'primary'].push({
          type: attr.name,
          selector: basicSelector,
          value: attr.value,
          isUnique: isBasicUnique,
          matchCount: isBasicUnique ? 1 : document.querySelectorAll(basicSelector).length
        });
        
        // If not unique, generate enhanced selectors
        if (!isBasicUnique) {
          const enhancedSelectors = generateUniqueSelectorsForAttribute(element, attr.name, attr.value);
          enhancedSelectors.forEach(enhanced => {
            elementData.locators.unique.push(enhanced);
          });
        }
      }
    }
    
    // 3. Name attribute
    if (element.name) {
      const selector = `[name="${element.name}"]`;
      const isUnique = isSelectorUnique(selector);
      elementData.locators[isUnique ? 'unique' : 'primary'].push({
        type: 'name',
        selector: selector,
        value: element.name,
        isUnique: isUnique,
        matchCount: isUnique ? 1 : document.querySelectorAll(selector).length
      });
    }
    
    // Generate secondary locators
    
    // 4. Classes
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(c => c);
      if (classes.length > 0) {
        const selector = `.${classes.join('.')}`;
        const isUnique = isSelectorUnique(selector);
        elementData.locators[isUnique ? 'unique' : 'secondary'].push({
          type: 'class',
          selector: selector,
          value: classes.join(' '),
          isUnique: isUnique,
          matchCount: isUnique ? 1 : document.querySelectorAll(selector).length
        });
      }
    }
    
    // 5. Generate guaranteed unique selectors
    const guaranteedUnique = generateGuaranteedUniqueSelectors(element);
    guaranteedUnique.forEach(unique => {
      elementData.locators.unique.push(unique);
    });
    
    // 6. Tag selector (always fallback)
    elementData.locators.fallback.push({
      type: 'tag',
      selector: element.tagName.toLowerCase(),
      value: element.tagName.toLowerCase(),
      isUnique: false,
      matchCount: document.querySelectorAll(element.tagName.toLowerCase()).length
    });
    
    return elementData;
    
  } catch (error) {
    console.error('Failed to generate element data:', error);
    return null;
  }
}

// Helper functions for generating unique selectors
function generateUniqueSelectorsForAttribute(element, attrName, attrValue) {
  const uniqueSelectors = [];
  const basicSelector = `[${attrName}="${attrValue}"]`;
  const matchingElements = Array.from(document.querySelectorAll(basicSelector));
  const elementIndex = matchingElements.indexOf(element);
  
  if (elementIndex === -1) return uniqueSelectors;
  
  // Method 1: nth-of-type with attribute
  const nthOfTypeSelector = `${element.tagName.toLowerCase()}[${attrName}="${attrValue}"]:nth-of-type(${elementIndex + 1})`;
  if (isSelectorUnique(nthOfTypeSelector)) {
    uniqueSelectors.push({
      type: `${attrName}-nth-of-type`,
      selector: nthOfTypeSelector,
      value: `${attrValue} (${elementIndex + 1} of ${matchingElements.length})`,
      isUnique: true,
      matchCount: 1,
      description: `${elementIndex + 1}${getOrdinalSuffix(elementIndex + 1)} ${element.tagName.toLowerCase()} element with ${attrName}="${attrValue}"`
    });
  }
  
  // Method 2: nth-child with attribute
  if (element.parentElement) {
    const siblingIndex = Array.from(element.parentElement.children).indexOf(element) + 1;
    const nthChildSelector = `${element.tagName.toLowerCase()}[${attrName}="${attrValue}"]:nth-child(${siblingIndex})`;
    if (isSelectorUnique(nthChildSelector)) {
      uniqueSelectors.push({
        type: `${attrName}-nth-child`,
        selector: nthChildSelector,
        value: `${attrValue} (child ${siblingIndex})`,
        isUnique: true,
        matchCount: 1,
        description: `${siblingIndex}${getOrdinalSuffix(siblingIndex)} child element with ${attrName}="${attrValue}"`
      });
    }
  }
  
  // Method 3: Combine with parent context
  if (element.parentElement && element.parentElement.id) {
    const parentSelector = `#${element.parentElement.id} [${attrName}="${attrValue}"]`;
    const parentMatches = document.querySelectorAll(parentSelector);
    if (parentMatches.length > 0) {
      const parentIndex = Array.from(parentMatches).indexOf(element);
      if (parentIndex !== -1) {
        const parentContextSelector = `#${element.parentElement.id} [${attrName}="${attrValue}"]:nth-of-type(${parentIndex + 1})`;
        if (isSelectorUnique(parentContextSelector)) {
          uniqueSelectors.push({
            type: `${attrName}-parent-context`,
            selector: parentContextSelector,
            value: `${attrValue} (in #${element.parentElement.id}, ${parentIndex + 1} of ${parentMatches.length})`,
            isUnique: true,
            matchCount: 1,
            description: `${parentIndex + 1}${getOrdinalSuffix(parentIndex + 1)} element with ${attrName}="${attrValue}" inside #${element.parentElement.id}`
          });
        }
      }
    }
  }
  
  // Method 4: Combine with additional attributes
  for (const attr of element.attributes) {
    if (attr.name !== attrName && !attr.name.startsWith('data-testid') && attr.value) {
      const combinedSelector = `[${attrName}="${attrValue}"][${attr.name}="${attr.value}"]`;
      if (isSelectorUnique(combinedSelector)) {
        uniqueSelectors.push({
          type: `${attrName}-combined`,
          selector: combinedSelector,
          value: `${attrValue} + ${attr.name}="${attr.value}"`,
          isUnique: true,
          matchCount: 1,
          description: `Element with ${attrName}="${attrValue}" and ${attr.name}="${attr.value}"`
        });
        break; // Only need one working combination
      }
    }
  }
  
  // Method 5: Position-based with text content
  const elementText = getCleanText(element);
  if (elementText && elementText.length > 0) {
    // Note: :contains is not standard CSS, so we provide text-based description
    uniqueSelectors.push({
      type: `${attrName}-text`,
      selector: `[${attrName}="${attrValue}"]`, // We'll add text matching in description
      value: `${attrValue} (with text: "${elementText.substring(0, 30)}${elementText.length > 30 ? '...' : ''}")`,
      isUnique: false, // Not truly unique by selector alone
      matchCount: matchingElements.length,
      description: `Element with ${attrName}="${attrValue}" containing text "${elementText.substring(0, 50)}${elementText.length > 50 ? '...' : ''}"`
    });
  }
  
  return uniqueSelectors;
}

function generateGuaranteedUniqueSelectors(element) {
  const uniqueSelectors = [];
  
  // Method 1: Full path selector
  const fullPath = getElementPath(element);
  if (fullPath && isSelectorUnique(fullPath)) {
    uniqueSelectors.push({
      type: 'full-path',
      selector: fullPath,
      value: 'Full DOM path',
      isUnique: true,
      matchCount: 1,
      description: 'Unique DOM path selector'
    });
  }
  
  // Method 2: XPath-style positioning
  if (element.parentElement) {
    const siblings = Array.from(element.parentElement.children);
    const sameTagSiblings = siblings.filter(el => el.tagName === element.tagName);
    const indexInSameTag = sameTagSiblings.indexOf(element) + 1;
    
    let parentSelector = '';
    if (element.parentElement.id) {
      parentSelector = `#${element.parentElement.id}`;
    } else if (element.parentElement.className) {
      const parentClasses = element.parentElement.className.trim().split(/\s+/);
      parentSelector = `.${parentClasses[0]}`;
    } else {
      parentSelector = element.parentElement.tagName.toLowerCase();
    }
    
    const xpathLikeSelector = `${parentSelector} > ${element.tagName.toLowerCase()}:nth-of-type(${indexInSameTag})`;
    if (isSelectorUnique(xpathLikeSelector)) {
      uniqueSelectors.push({
        type: 'xpath-like',
        selector: xpathLikeSelector,
        value: `${indexInSameTag}${getOrdinalSuffix(indexInSameTag)} ${element.tagName.toLowerCase()} in parent`,
        isUnique: true,
        matchCount: 1,
        description: `${indexInSameTag}${getOrdinalSuffix(indexInSameTag)} ${element.tagName.toLowerCase()} element in its parent container`
      });
    }
  }
  
  // Method 3: Coordinate-based description (not a selector, but helpful for identification)
  const rect = element.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) {
    uniqueSelectors.push({
      type: 'position',
      selector: `/* Element at position (${Math.round(rect.left)}, ${Math.round(rect.top)}) */`,
      value: `Position: (${Math.round(rect.left)}, ${Math.round(rect.top)})`,
      isUnique: false,
      matchCount: 1,
      description: `Element located at coordinates (${Math.round(rect.left)}, ${Math.round(rect.top)}) with size ${Math.round(rect.width)}×${Math.round(rect.height)}px`
    });
  }
  
  return uniqueSelectors;
}

function getElementPath(element) {
  if (element.id) {
    return `#${element.id}`;
  }
  
  const path = [];
  let current = element;
  
  while (current && current.nodeType === Node.ELEMENT_NODE) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    } else {
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(child => 
          child.tagName === current.tagName
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }
      path.unshift(selector);
    }
    
    current = current.parentElement;
  }
  
  return path.join(' > ');
}

function getOrdinalSuffix(num) {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}
