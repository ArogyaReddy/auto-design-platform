// Element AI Extractor - Content Script
// Handles element inspection, highlighting, and data extraction

// Enhanced loading protection - prevent duplicate script execution
if (window.aiExtractorLoaded) {
  console.log("Element AI Extractor: Content script already loaded, skipping duplicate initialization");
  
  // Send ready signal immediately for duplicate loads
  try {
    chrome.runtime.sendMessage({ 
      action: 'contentScriptReady', 
      url: window.location.href,
      timestamp: Date.now(),
      duplicate: true,
      frameType: window === window.top ? 'main' : 'iframe'
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Element AI Extractor: Could not notify background of ready state (expected if background not available)");
      } else {
        console.log("Element AI Extractor: Successfully notified of duplicate load");
      }
    });
  } catch (error) {
    console.log("Element AI Extractor: Error sending duplicate load notification:", error);
  }
  
  // Exit early to prevent duplicate initialization
} else {
  window.aiExtractorLoaded = true;
  window.aiExtractorMessageListenerAdded = true; // Mark as added
  console.log("Element AI Extractor: Content script loading for the first time...");
  console.log("Element AI Extractor: Page URL:", window.location.href);
  console.log("Element AI Extractor: Frame type:", window === window.top ? 'main frame' : 'iframe');
  console.log("Element AI Extractor: User agent:", navigator.userAgent.substring(0, 100));

  // ========== GLOBAL STATE VARIABLES ==========
  // Declare global state variables at script level to avoid scoping issues
  let isInspecting = false;
  let currentHighlightedElement = null;
  let currentlyHighlightedElement = null; // Keep both for compatibility
  let lastClickedElement = null;
  let storageCheckInterval = null;
  let inspectorBadge = null;
  
  // Make inspection state globally accessible
  window.aiExtractorIsInspecting = false;

  // ========== ML SUGGESTER FUNCTION - EMBEDDED ==========
  function getMLSuggestedLocators(elementInfo) {
    console.log('[ML Suggester] Received element info:', elementInfo);

    // Mock suggestions - to be replaced with actual ML model output
    const mockSuggestions = [
      { locator: `//${elementInfo.tagName || elementInfo.tag || 'div'}[@id='${elementInfo.id || 'mockId'}']`, confidence: 0.95, type: 'xpath' },
      { locator: `${elementInfo.tagName || elementInfo.tag || 'div'}.${(elementInfo.className || 'mockClass').split(' ').join('.')}`, confidence: 0.85, type: 'css' },
      { locator: `//${elementInfo.tagName || elementInfo.tag || 'div'}[contains(text(),'${(elementInfo.text || 'mockText').substring(0, 20)}')]`, confidence: 0.75, type: 'xpath' }
    ];

    // Simulate some processing delay
    return new Promise(resolve => {
      setTimeout(() => {
        console.log('[ML Suggester] Returning mock suggestions:', mockSuggestions);
        resolve(mockSuggestions);
      }, 200);
    });
  }
  
  // Expose to window as well
  window.getMLSuggestedLocators = getMLSuggestedLocators;
  console.log("Element AI Extractor: ML Suggester function embedded and available");
  // ========== END ML SUGGESTER ==========
  
  // Comprehensive Chrome APIs check
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log("Element AI Extractor: Chrome runtime API available");
    console.log("Element AI Extractor: Extension ID:", chrome.runtime.id);
  } else {
    console.error("Element AI Extractor: Chrome runtime API not available!");
    console.error("Element AI Extractor: Chrome object:", typeof chrome);
  }

// Sync inspection state with storage periodically
function startStorageSync() {
  // Only run storage sync in the top-level frame
  if (window !== window.top) {
    return;
  }
  
  if (storageCheckInterval) {
    clearInterval(storageCheckInterval);
  }
  
  storageCheckInterval = setInterval(async () => {
    try {
      const result = await chrome.storage.local.get(['isInspecting']);
      const storageInspecting = result.isInspecting || false;
      
      // If storage says we should not be inspecting but we are, stop
      if (isInspecting && !storageInspecting) {
        console.log("Element AI Extractor: Storage sync detected inspection should stop");
        stopInspection();
      }
      // If storage says we should be inspecting but we're not, start
      else if (!isInspecting && storageInspecting) {
        console.log("Element AI Extractor: Storage sync detected inspection should start");
        startInspection();
      }
    } catch (error) {
      // console.warn("Element AI Extractor: Error during storage sync:", error);
      console.log('Element AI Extractor: Error during storage sync:', error);
    }
  }, 1000); // Check every second
}

function stopStorageSync() {
  if (storageCheckInterval) {
    clearInterval(storageCheckInterval);
    storageCheckInterval = null;
  }
}

// CSS for highlighting and cursor changes
const HIGHLIGHT_STYLES = `
  .ai-extractor-highlight {
    outline: 3px dashed #ff6b35 !important;
    outline-offset: 2px !important;
    background: rgba(255, 107, 53, 0.1) !important;
    position: relative !important;
    z-index: 999999 !important;
  }
  
  .ai-extractor-highlight::after {
    content: '🔍 AI Extractor';
    position: absolute !important;
    top: -25px !important;
    left: 0 !important;
    background: #ff6b35 !important;
    color: white !important;
    padding: 2px 8px !important;
    font-size: 11px !important;
    font-family: Arial, sans-serif !important;
    border-radius: 3px !important;
    z-index: 1000000 !important;
    pointer-events: none !important;
    white-space: nowrap !important;
  }
  
  body.ai-extractor-inspecting {
    cursor: crosshair !important;
  }
  
  body.ai-extractor-inspecting * {
    cursor: crosshair !important;
  }
  
  .ai-extractor-inspector-badge {
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    background: #ff6b35 !important;
    color: white !important;
    padding: 0 !important;
    border-radius: 12px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
    z-index: 2147483647 !important;
    cursor: pointer !important;
    border: 2px solid #e55100 !important;
    user-select: none !important;
    max-width: 280px !important;
    animation: ai-extractor-pulse 2s infinite !important;
    overflow: hidden !important;
  }
  
  .ai-extractor-inspector-badge .badge-header {
    background: #ff6b35 !important;
    padding: 10px 12px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    border-bottom: 1px solid #e55100 !important;
  }
  
  .ai-extractor-inspector-badge .badge-close {
    background: rgba(255, 255, 255, 0.2) !important;
    border-radius: 50% !important;
    width: 20px !important;
    height: 20px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 12px !important;
    cursor: pointer !important;
    transition: background 0.2s !important;
  }
  
  .ai-extractor-inspector-badge .badge-close:hover {
    background: rgba(255, 255, 255, 0.3) !important;
  }
  
  .ai-extractor-inspector-badge .badge-status {
    padding: 8px 12px !important;
    background: #e55100 !important;
    font-size: 12px !important;
    text-align: center !important;
  }
  
  .ai-extractor-inspector-badge .badge-results {
    background: #2d3748 !important;
    color: #e2e8f0 !important;
    padding: 10px 12px !important;
    border-top: 1px solid #4a5568 !important;
    max-height: 200px !important;
    overflow-y: auto !important;
  }
  
  .ai-extractor-inspector-badge .badge-type {
    background: #38a169 !important;
    color: white !important;
    padding: 2px 6px !important;
    border-radius: 4px !important;
    font-size: 11px !important;
    display: inline-block !important;
    margin: 2px 0 !important;
  }
  
  .ai-extractor-inspector-badge .badge-locator {
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace !important;
    font-size: 11px !important;
    color: #81e6d9 !important;
    display: block !important;
    margin: 2px 0 !important;
    word-break: break-all !important;
  }
  
  .ai-extractor-inspector-badge .badge-strength {
    color: #68d391 !important;
    font-size: 11px !important;
    font-weight: bold !important;
  }
  
  @keyframes ai-extractor-pulse {
    0% { opacity: 1; }
    50% { opacity: 0.9; }
    100% { opacity: 1; }
  }
  
  .ai-extractor-inspector-badge:hover {
    transform: scale(1.02) !important;
  }
`;

// Create floating inspector badge with enhanced functionality
function createInspectorBadge() {
  // Only create badge in the top-level frame to prevent duplicates
  if (window !== window.top) {
    return;
  }
  
  if (inspectorBadge) {
    return;
  }
  
  inspectorBadge = document.createElement('div');
  inspectorBadge.className = 'ai-extractor-inspector-badge';
  
  // Enhanced badge with expanded results section
  inspectorBadge.innerHTML = `
    <div class="badge-header">
      🔍 AI Inspector Active
      <div class="badge-close" title="Click to stop inspection">✕</div>
    </div>
    <div class="badge-status">Click elements to inspect</div>
    <div class="badge-content">
      <div class="badge-results" style="display: none;">
        <div class="badge-element-info">
          <div class="badge-element-name"></div>
          <div class="badge-element-type"></div>
        </div>
        <div class="badge-locators">
          <div class="badge-locator-item">
            <span class="badge-locator-label">Best:</span>
            <span class="badge-locator-value"></span>
          </div>
          <div class="badge-locator-item">
            <span class="badge-locator-label">Type:</span>
            <span class="badge-locator-type"></span>
          </div>
          <div class="badge-locator-item">
            <span class="badge-locator-label">Strength:</span>
            <span class="badge-locator-strength"></span>
          </div>
        </div>
        <div class="badge-actions">
          <button class="badge-copy-btn" title="Copy best locator">📋 Copy</button>
          <button class="badge-highlight-btn" title="Highlight element">👁️ Highlight</button>
        </div>
      </div>
    </div>
  `;
  
  inspectorBadge.title = 'AI Element Inspector is active. Click elements to inspect.';
  
  // Handle all badge clicks with single event listener using delegation
  inspectorBadge.addEventListener('click', (event) => {
    console.log("Element AI Extractor: Badge clicked, target:", event.target, "classes:", event.target.classList);
    const target = event.target;
    const closestClose = target.closest('.badge-close');
    const closestCopy = target.closest('.badge-copy-btn');
    const closestHighlight = target.closest('.badge-highlight-btn');
    
    // Handle close button click
    if (closestClose) {
      event.preventDefault(); event.stopPropagation();
      console.log("Element AI Extractor: Badge close clicked, stopping inspection");
      stopInspection();
      chrome.storage.local.set({ isInspecting: false });
      chrome.runtime.sendMessage({ action: "inspectionStoppedFromBadge" }, () => {});
      return;
    }

    // Handle copy button click
    if (closestCopy) {
      event.preventDefault(); event.stopPropagation();
      console.log("Element AI Extractor: Copy button clicked");
      const locatorValue = inspectorBadge.querySelector('.badge-locator-value');
      if (locatorValue && locatorValue.textContent && locatorValue.textContent !== 'N/A') {
        const textToCopy = locatorValue.title || locatorValue.textContent;
        copyToClipboard(textToCopy);
        const btn = closestCopy;
        btn.textContent = '✅ Copied';
        setTimeout(() => { btn.textContent = '📋 Copy'; }, 1500);
      }
      return;
    }

    // Handle highlight button click
    if (closestHighlight) {
      event.preventDefault(); event.stopPropagation();
      console.log("Element AI Extractor: Highlight button clicked");
      if (lastClickedElement) {
        highlightElement(lastClickedElement);
        const btn = closestHighlight;
        btn.textContent = '✨ Highlighted';
        setTimeout(() => { btn.textContent = '👁️ Highlight'; }, 1500);
      }
      return;
    }

    // If click not on a button, let events through
    // console.log("Element AI Extractor: Badge click unhandled");
  });
  
  // Direct listeners as backup for copy/highlight buttons
  const directCopyBtn = inspectorBadge.querySelector('.badge-copy-btn');
  if (directCopyBtn) {
    directCopyBtn.addEventListener('click', e => {
      e.stopPropagation();
      console.log("Element AI Extractor: Direct copy button click");
      const locatorValue = inspectorBadge.querySelector('.badge-locator-value');
      if (locatorValue && locatorValue.textContent && locatorValue.textContent !== 'N/A') {
        const textToCopy = locatorValue.title || locatorValue.textContent;
        copyToClipboard(textToCopy);
        directCopyBtn.textContent = '✅ Copied';
        setTimeout(() => { directCopyBtn.textContent = '📋 Copy'; }, 1500);
      }
    });
  }
  const directHlBtn = inspectorBadge.querySelector('.badge-highlight-btn');
  if (directHlBtn) {
    directHlBtn.addEventListener('click', e => {
      e.stopPropagation();
      console.log("Element AI Extractor: Direct highlight button click");
      if (lastClickedElement) {
        highlightElement(lastClickedElement);
        directHlBtn.textContent = '✨ Highlighted';
        setTimeout(() => { directHlBtn.textContent = '👁️ Highlight'; }, 1500);
      } else {
        console.log("Element AI Extractor: No element to highlight (direct)");
      }
    });
  }
  
  document.body.appendChild(inspectorBadge);
}

// Copy text to clipboard
function copyToClipboard(text) {
  console.log("Element AI Extractor: copyToClipboard called with text:", text);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        console.log("Element AI Extractor: Text copied to clipboard successfully");
      }).catch(err => {
        console.error("Element AI Extractor: Failed to copy text:", err);
        // Fallback method
        fallbackCopyTextToClipboard(text);
      });
    } else {
      console.log("Element AI Extractor: Clipboard API not available, using fallback");
      fallbackCopyTextToClipboard(text);
    }
  } catch (err) {
    console.error("Element AI Extractor: Clipboard API error:", err);
    fallbackCopyTextToClipboard(text);
  }
}

// Fallback copy method
function fallbackCopyTextToClipboard(text) {
  console.log("Element AI Extractor: Using fallback copy method for text:", text);
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-999999px";
  textArea.style.top = "-999999px";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    const successful = document.execCommand('copy');
    console.log("Element AI Extractor: Fallback copy", successful ? "successful" : "failed");
  } catch (err) {
    console.error("Element AI Extractor: Fallback copy failed:", err);
  }
  
  document.body.removeChild(textArea);
}

// Update badge with inspection results
function updateBadgeWithResults(elementData) {
  console.log("Element AI Extractor: updateBadgeWithResults called with data:", elementData);
  if (!inspectorBadge) {
    console.log("Element AI Extractor: No inspector badge found");
    return;
  }
  
  const statusDiv = inspectorBadge.querySelector('.badge-status');
  const resultsDiv = inspectorBadge.querySelector('.badge-results');
  
  if (elementData) {
    // Update status
    statusDiv.textContent = '✅ Element Inspected! View details below';
    
    // Populate element info
    const nameDiv = inspectorBadge.querySelector('.badge-element-name');
    const typeDiv = inspectorBadge.querySelector('.badge-element-type');
    const locatorValue = inspectorBadge.querySelector('.badge-locator-value');
    const locatorType = inspectorBadge.querySelector('.badge-locator-type');
    const locatorStrength = inspectorBadge.querySelector('.badge-locator-strength');
    
    console.log("Element AI Extractor: Badge elements found:", {
      nameDiv, typeDiv, locatorValue, locatorType, locatorStrength
    });
    
    if (nameDiv) nameDiv.textContent = elementData['Element Name'] || 'Element';
    if (typeDiv) typeDiv.textContent = elementData['Element Type'] || 'N/A';
    if (locatorValue) {
      const bestLocator = elementData['Best Locator'] || 'N/A';
      locatorValue.textContent = bestLocator.length > 40 ? bestLocator.substring(0, 40) + '...' : bestLocator;
      locatorValue.title = bestLocator;
      console.log("Element AI Extractor: Set locator value:", locatorValue.textContent, "title:", locatorValue.title);
    }
    if (locatorType) locatorType.textContent = elementData['Locator Type'] || 'N/A';
    if (locatorStrength) locatorStrength.textContent = `${elementData['Strength'] || 'N/A'}%`;
    
    // Show results and keep them visible
    resultsDiv.style.display = 'block';
    
    // Store element data for actions
    inspectorBadge.elementData = elementData;
    console.log("Element AI Extractor: Stored element data on badge:", inspectorBadge.elementData);
    
  } else {
    statusDiv.textContent = 'Click elements to inspect';
    resultsDiv.style.display = 'none';
    console.log("Element AI Extractor: No element data provided, hiding results");
  }
}

// Remove floating inspector badge
function removeInspectorBadge() {
  if (inspectorBadge && inspectorBadge.parentNode) {
    inspectorBadge.parentNode.removeChild(inspectorBadge);
    inspectorBadge = null;
  }
}

// Inject styles into all shadow roots
function injectStylesIntoShadowRoots(rootNode = document) {
  // Find all elements with shadow roots
  const allElements = rootNode.querySelectorAll('*');
  
  allElements.forEach(element => {
    if (element.shadowRoot) {
      // Inject styles into this shadow root
      const existingShadowStyle = element.shadowRoot.getElementById('ai-extractor-shadow-styles');
      if (existingShadowStyle) {
        existingShadowStyle.remove();
      }
      
      const shadowStyleElement = document.createElement('style');
      shadowStyleElement.id = 'ai-extractor-shadow-styles';
      shadowStyleElement.textContent = HIGHLIGHT_STYLES;
      element.shadowRoot.appendChild(shadowStyleElement);
      
      // Recursively inject into nested shadow roots
      injectStylesIntoShadowRoots(element.shadowRoot);
    }
  });
}

// Inject CSS styles for highlighting
function injectStyles() {
  const existingStyle = document.getElementById('ai-extractor-styles');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  const styleElement = document.createElement('style');
  styleElement.id = 'ai-extractor-styles';
  styleElement.textContent = HIGHLIGHT_STYLES;
  document.head.appendChild(styleElement);
  
  // Also inject styles into all shadow roots
  injectStylesIntoShadowRoots();
}

// Remove CSS styles from shadow roots
function removeStylesFromShadowRoots(rootNode = document) {
  const allElements = rootNode.querySelectorAll('*');
  
  allElements.forEach(element => {
    if (element.shadowRoot) {
      const shadowStyleElement = element.shadowRoot.getElementById('ai-extractor-shadow-styles');
      if (shadowStyleElement) {
        shadowStyleElement.remove();
      }
      
      // Recursively remove from nested shadow roots
      removeStylesFromShadowRoots(element.shadowRoot);
    }
  });
}

// Remove CSS styles
function removeStyles() {
  const styleElement = document.getElementById('ai-extractor-styles');
  if (styleElement) {
    styleElement.remove();
  }
  
  // Also remove styles from all shadow roots
  removeStylesFromShadowRoots();
}

// Highlight element on hover - FIXED to use aggressive styling like Element Extractor
function highlightElement(element) {
  console.log("Element AI Extractor: highlightElement called with:", element);
  
  if (currentHighlightedElement && currentHighlightedElement !== element) {
    console.log("Element AI Extractor: Removing previous highlight from:", currentHighlightedElement);
    // Remove both CSS class and inline styles from previous element
    currentHighlightedElement.classList.remove('ai-extractor-highlight');
    currentHighlightedElement.style.removeProperty('outline');
    currentHighlightedElement.style.removeProperty('outline-offset');
    currentHighlightedElement.style.removeProperty('background-color');
    currentHighlightedElement.style.removeProperty('z-index');
  }
  
  if (element && element !== document.body && element !== document.documentElement) {
    console.log("Element AI Extractor: Adding highlight to:", element);
    
    // FIXED: Use the same aggressive styling approach as highlightElementOnTab
    // This ensures Inspector mode works with Shadow DOM elements exactly like Element Extractor
    element.style.setProperty('outline', '3px dashed #ff6b35', 'important');
    element.style.setProperty('outline-offset', '2px', 'important');
    element.style.setProperty('background-color', 'rgba(255, 107, 53, 0.1)', 'important');
    element.style.setProperty('z-index', '999999', 'important');
    element.style.setProperty('position', 'relative', 'important');
    
    // Also add the CSS class as backup (for any custom styles)
    element.classList.add('ai-extractor-highlight');
    
    currentlyHighlightedElement = element;
    
    // Debug: Verify the highlighting was applied
    const computedStyle = window.getComputedStyle(element);
    console.log("Element AI Extractor: Applied AGGRESSIVE highlighting - computed outline:", computedStyle.outline);
    console.log("Element AI Extractor: Applied AGGRESSIVE highlighting - computed background:", computedStyle.backgroundColor);
    console.log("Element AI Extractor: Applied AGGRESSIVE highlighting - computed z-index:", computedStyle.zIndex);
    
    const hasClass = element.classList.contains('ai-extractor-highlight');
    console.log("Element AI Extractor: CSS class applied:", hasClass);
    
    // Special handling for Shadow DOM elements
    if (isInShadowDOM && isInShadowDOM(element)) {
      console.log("Element AI Extractor: SHADOW DOM element detected - applying enhanced highlighting");
      
      // Try to ensure the shadow host is also properly styled to show the highlight
      const shadowRoot = element.getRootNode();
      if (shadowRoot instanceof ShadowRoot && shadowRoot.host) {
        const host = shadowRoot.host;
        console.log("Element AI Extractor: Also highlighting shadow host:", host);
        
        // Add a subtle highlight to the host to make it more visible
        host.style.setProperty('box-shadow', '0 0 0 2px rgba(255, 107, 53, 0.3)', 'important');
      }
    }
  } else {
    console.log("Element AI Extractor: Element not suitable for highlighting:", element);
  }
}

// Remove highlight from element - FIXED to use removeProperty for aggressive styles
function removeHighlight(element) {
  if (element) {
    console.log("Element AI Extractor: Removing highlight from element:", element);
    element.classList.remove('ai-extractor-highlight');
    
    // FIXED: Use removeProperty for styles that were set with !important
    element.style.removeProperty('outline');
    element.style.removeProperty('outline-offset');
    element.style.removeProperty('background-color');
    element.style.removeProperty('z-index');
    element.style.removeProperty('position');
    
    // Also remove shadow host styling if it was added
    if (isInShadowDOM && isInShadowDOM(element)) {
      const shadowRoot = element.getRootNode();
      if (shadowRoot instanceof ShadowRoot && shadowRoot.host) {
        const host = shadowRoot.host;
        host.style.removeProperty('box-shadow');
      }
    }
  }
  if (currentlyHighlightedElement === element) {
    currentlyHighlightedElement = null;
  }
}

// Remove all highlights from shadow roots - FIXED for aggressive style cleanup
function removeAllHighlightsFromShadowRoots(rootNode = document) {
  const allElements = rootNode.querySelectorAll('*');
  
  allElements.forEach(element => {
    if (element.shadowRoot) {
      const shadowHighlightedElements = element.shadowRoot.querySelectorAll('.ai-extractor-highlight');
      shadowHighlightedElements.forEach(el => {
        el.classList.remove('ai-extractor-highlight');
        // FIXED: Use removeProperty for aggressive styles
        el.style.removeProperty('outline');
        el.style.removeProperty('outline-offset');
        el.style.removeProperty('background-color');
        el.style.removeProperty('z-index');
        el.style.removeProperty('position');
      });
      
      // Also remove shadow host styling
      element.style.removeProperty('box-shadow');
      
      // Recursively remove from nested shadow roots
      removeAllHighlightsFromShadowRoots(element.shadowRoot);
    }
  });
}

// Remove all highlights - FIXED for aggressive style cleanup
function removeAllHighlights() {
  const highlightedElements = document.querySelectorAll('.ai-extractor-highlight');
  highlightedElements.forEach(el => {
    el.classList.remove('ai-extractor-highlight');
    // FIXED: Use removeProperty for aggressive styles
    el.style.removeProperty('outline');
    el.style.removeProperty('outline-offset');
    el.style.removeProperty('background-color');
    el.style.removeProperty('z-index');
    el.style.removeProperty('position');
  });
  
  // Also remove highlights from all shadow roots
  removeAllHighlightsFromShadowRoots();
  
  currentHighlightedElement = null;
}

// Get element details for inspection
async function getElementDetails(element) { // Added async here
  if (!element || element === document || element === document.body) {
    return null;
  }

  const tagName = element.tagName.toLowerCase();
  const elementType = getElementType(element);
  const locators = generateLocators(element);
  const bestLocator = getBestLocator(locators);

  // Prepare elementInfo for ML Suggester
  const elementInfoForML = {
    elementName: getElementName(element),
    elementType: elementType,
    id: element.id || null,
    css: locators.css,
    xpath: locators.xpath,
    inShadowDOM: isInShadowDOM(element),
    hostElementPath: getShadowHostPath(element),
    tagName: tagName,
    className: element.className || null,
    text: (element.textContent || '').trim().substring(0, 100) || null,
    attributes: Array.from(element.attributes).map(attr => ({ name: attr.name, value: attr.value })),
    parentId: element.parentElement ? element.parentElement.id || null : null,
    parentTagName: element.parentElement ? element.parentElement.tagName.toLowerCase() : null,
  };

  let mlSuggestions = [];
  
  // Call embedded ML suggester function
  try {
    mlSuggestions = await getMLSuggestedLocators(elementInfoForML);
    console.log("Element AI Extractor: Received ML Suggestions", mlSuggestions);
  } catch (error) {
    console.error("Element AI Extractor: Error getting ML suggestions", error);
  }
  
  // Get automation-compatible locators for Shadow DOM elements
  const automationLocators = isInShadowDOM(element) ? generateAutomationCompatibleLocators(element) : null;
  
  return {
    'Element Name': getElementName(element),
    'Element Type': elementType,
    'Best Locator': bestLocator.locator,
    'Locator Type': bestLocator.type,
    'Strength': bestLocator.strength,
    'ID': element.id || 'N/A',
    'CSS': locators.css,
    'XPATH': locators.xpath,
    'ML Suggestions': mlSuggestions, // Added ML suggestions here
    'In Shadow DOM': isInShadowDOM(element) ? 'Yes' : 'No',
    'Host Element Path': getShadowHostPath(element),
    'Automation Locators': automationLocators, // NEW: Automation-compatible locators
    'Tag Name': tagName,
    'Class': element.className || 'N/A',
    'Text': (element.textContent || '').trim().substring(0, 100) || 'N/A'
  };
}

// Get element name (text content, placeholder, alt, title, etc.)
function getElementName(element) {
  // Try different attributes for a meaningful name
  const name = element.getAttribute('aria-label') ||
               element.getAttribute('title') ||
               element.getAttribute('placeholder') ||
               element.getAttribute('alt') ||
               element.getAttribute('name') ||
               (element.textContent || '').trim();
  
  return name ? name.substring(0, 50) : element.tagName.toLowerCase();
}

// Determine element type
function getElementType(element) {
  const tagName = element.tagName.toLowerCase();
  const type = element.type;
  const role = element.getAttribute('role');
  
  if (tagName === 'a') return 'Link';
  if (tagName === 'button' || type === 'button' || type === 'submit') return 'Button';
  if (tagName === 'input') {
    if (type === 'text' || type === 'email' || type === 'password') return 'Text Input';
    if (type === 'checkbox') return 'Checkbox';
    if (type === 'radio') return 'Radio Button';
    return 'Input';
  }
  if (tagName === 'select') return 'Dropdown';
  if (tagName === 'textarea') return 'Text Area';
  if (tagName === 'img') return 'Image';
  if (tagName === 'form') return 'Form';
  if (tagName === 'iframe') return 'IFrame';
  if (role) return `${role} (role)`;
  
  return tagName.charAt(0).toUpperCase() + tagName.slice(1);
}

// Generate different locator strategies with DevTools compatibility
function generateLocators(element) {
  // Helper function to check if ID contains special CSS characters
  function hasSpecialCssChars(id) {
    return /[.()[\]{}+~>,:;#@$%^&*=!|\\/"'`\s]/.test(id);
  }
  
  // Helper function to validate selector works and is UNIQUE - FIXED for Shadow DOM
  function validateSelector(selector, targetElement = null) {
    try {
      // FIXED: For Shadow DOM elements, we need to search in the correct context
      let searchRoot = document;
      let testElements;
      
      // If we have a target element and it's in Shadow DOM, search from its shadow root
      if (targetElement && isInShadowDOM && isInShadowDOM(targetElement)) {
        const shadowRoot = targetElement.getRootNode();
        if (shadowRoot instanceof ShadowRoot) {
          searchRoot = shadowRoot;
          console.log('Element AI Extractor: Validating selector in Shadow DOM context:', selector);
        }
      }
      
      testElements = searchRoot.querySelectorAll(selector);
      
      // CRITICAL: Selector must be UNIQUE (exactly 1 match) for automation reliability
      if (testElements.length !== 1) {
        // IMPROVED: Don't warn for Shadow DOM context mismatches, this is expected
        if (targetElement && !isInShadowDOM(targetElement)) {
          console.warn(`Element AI Extractor: Non-unique selector (found ${testElements.length} elements):`, selector);
        }
        return false;
      }
      
      // If we have a target element, verify the selector actually selects it
      if (targetElement && testElements[0] !== targetElement) {
        console.warn('Element AI Extractor: Selector selects wrong element:', selector);
        return false;
      }
      
      return true;
    } catch (e) {
      console.warn('Element AI Extractor: Invalid selector syntax in contentScript:', selector, e);
      return false;
    }
  }
  
  // Helper function to generate robust ID selector - IMPROVED for Shadow DOM
  function generateIdSelector(id, targetElement) {
    // Always use attribute selector for maximum compatibility
    const attributeSelector = `[id="${id}"]`;
    
    // For simple IDs, also try CSS.escape with hash selector
    if (!hasSpecialCssChars(id)) {
      try {
        const hashSelector = `#${CSS.escape(id)}`;
        
        // IMPROVED: For Shadow DOM elements, prefer attribute selector for better compatibility
        if (targetElement && isInShadowDOM && isInShadowDOM(targetElement)) {
          console.log('Element AI Extractor: Using attribute selector for Shadow DOM element:', attributeSelector);
          return attributeSelector;
        }
        
        // Validate both and prefer the simpler one if both work
        if (validateSelector(hashSelector, targetElement) && validateSelector(attributeSelector, targetElement)) {
          return hashSelector;
        } else if (validateSelector(attributeSelector, targetElement)) {
          return attributeSelector;
        } else if (validateSelector(hashSelector, targetElement)) {
          return hashSelector;
        }
      } catch (e) {
        // CSS.escape failed, fall back to attribute selector
        console.log('Element AI Extractor: CSS.escape failed, using attribute selector:', attributeSelector);
      }
    }
    
    return attributeSelector;
  }
  
  const locators = {};
  
  // ID selector - Enhanced with DevTools compatibility and fallbacks
  if (element.id) {
    const idSelector = generateIdSelector(element.id, element);
    if (validateSelector(idSelector, element)) {
      locators.id = idSelector;
    } else {
      // IMPROVED: Even if validation fails, include the ID selector for Shadow DOM contexts
      locators.id = idSelector;
      console.log('Element AI Extractor: ID selector validation failed but including for Shadow DOM compatibility:', idSelector);
    }
  }
  
  // CSS selector
  locators.css = generateCSSSelector(element);
  
  // XPath
  locators.xpath = generateXPath(element);
  
  // IMPROVED: Ensure we always have basic fallbacks for robustness
  if (!locators.id && !locators.css) {
    // Generate emergency fallback selectors
    const tagName = element.tagName.toLowerCase();
    
    // Try class-based selector
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.trim() && !c.startsWith('ai-extractor-'));
      if (classes.length > 0) {
        locators.css = `${tagName}.${classes.join('.')}`;
      }
    }
    
    // Ensure we have at least a basic selector
    if (!locators.css) {
      locators.css = tagName;
    }
  }
  
  // Name attribute
  if (element.name) {
    const nameSelector = `[name="${element.name}"]`;
    if (validateSelector(nameSelector, element)) {
      locators.name = nameSelector;
    }
  }
  
  // Aria-label
  if (element.getAttribute('aria-label')) {
    const ariaSelector = `[aria-label="${element.getAttribute('aria-label')}"]`;
    if (validateSelector(ariaSelector, element)) {
      locators.ariaLabel = ariaSelector;
    }
  }
  // ULTIMATE Href locator strategies for navigation elements with validation
  if (element.tagName.toLowerCase() === 'a' && element.getAttribute('href')) {
    const href = element.getAttribute('href');
    
    // Strategy 1: Class + href combination (BEST for navigation)
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ')
        .filter(c => c.trim() && !c.startsWith('ai-extractor-'));
      if (classes.length > 0) {
        const classHrefSelector = `.${classes.map(c => CSS.escape(c)).join('.')}[href="${href}"]`;
        if (validateSelector(classHrefSelector, element)) {
          locators.classHref = classHrefSelector;
        }
      }
    }
    
    // Strategy 2: Pure href (fallback)
    const hrefSelector = `a[href="${href}"]`;
    if (validateSelector(hrefSelector, element)) {
      locators.href = hrefSelector;
    }
    
    // Strategy 3: Text + href for unique navigation items
    const linkText = element.textContent?.trim();
    if (linkText && linkText.length < 50) {
      // Note: :has-text() is Playwright-specific, may not work in all browsers
      const textHrefSelector = `a[href="${href}"]:has-text("${linkText}")`;
      locators.textHref = textHrefSelector; // Include but don't validate as it's framework-specific
    }
    
    // Strategy 4: Role-based navigation locator
    if (element.getAttribute('role')) {
      const roleHrefSelector = `[role="${element.getAttribute('role')}"][href="${href}"]`;
      if (validateSelector(roleHrefSelector, element)) {
        locators.roleHref = roleHrefSelector;
      }
    }
  }
  
  return locators;
}

// Generate CSS selector with DevTools compatibility
function generateCSSSelector(element) {
  // Helper function to check if ID contains special CSS characters
  function hasSpecialCssChars(id) {
    return /[.()[\]{}+~>,:;#@$%^&*=!|\\/"'`\s]/.test(id);
  }
  
  // Helper function to validate selector works and is UNIQUE - FIXED for Shadow DOM context
  function validateSelector(selector, targetElement = null) {
    try {
      // FIXED: For Shadow DOM elements, search in the correct context
      let searchRoot = document;
      let testElements;
      
      // If we have a target element and it's in Shadow DOM, search from its shadow root
      if (targetElement && isInShadowDOM && isInShadowDOM(targetElement)) {
        const shadowRoot = targetElement.getRootNode();
        if (shadowRoot instanceof ShadowRoot) {
          searchRoot = shadowRoot;
        }
      }
      
      testElements = searchRoot.querySelectorAll(selector);
      
      // CRITICAL: Must be exactly 1 match for uniqueness
      if (testElements.length !== 1) {
        // IMPROVED: Only log warnings for main document context
        if (!targetElement || !isInShadowDOM(targetElement)) {
          console.log(`Element AI Extractor: Selector validation failed (found ${testElements.length} elements):`, selector);
        }
        return false;
      }
      
      // If we have a target element, verify the selector actually selects it
      if (targetElement && testElements[0] !== targetElement) {
        return false;
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }
  
  // Helper function to generate robust ID selector
  function generateIdSelector(id) {
    // Always use attribute selector for maximum compatibility
    const attributeSelector = `[id="${id}"]`;
    
    // For simple IDs, also try CSS.escape with hash selector
    if (!hasSpecialCssChars(id)) {
      try {
        const hashSelector = `#${CSS.escape(id)}`;
        // Validate both and prefer the simpler one if both work
        if (validateSelector(hashSelector) && validateSelector(attributeSelector)) {
          return hashSelector;
        }
      } catch (e) {
        // CSS.escape failed, fall back to attribute selector
      }
    }
    
    return attributeSelector;
  }
  
  if (element.id) {
    const idSelector = generateIdSelector(element.id);
    if (validateSelector(idSelector)) {
      return idSelector;
    }
  }
  
  const parts = [];
  let current = element;
  
  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    
    if (current.id) {
      const idSelector = generateIdSelector(current.id);
      if (validateSelector(idSelector)) {
        selector = idSelector;
        parts.unshift(selector);
        break;
      }
    }
    
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.split(' ')
        .filter(c => c.trim() && !c.startsWith('ai-extractor-'));
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }
    
    // Add nth-child if needed for uniqueness
    const siblings = Array.from(current.parentNode?.children || [])
      .filter(el => el.tagName === current.tagName);
    if (siblings.length > 1) {
      const index = siblings.indexOf(current) + 1;
      selector += `:nth-child(${index})`;
    }
    
    parts.unshift(selector);
    current = current.parentElement;
    
    if (parts.length > 5) break; // Limit depth
  }
  
  const finalSelector = parts.join(' > ');
  
  // IMPROVED: Better validation and fallback handling for Shadow DOM
  if (!validateSelector(finalSelector, element)) {
    console.log('Element AI Extractor: Generated CSS selector failed validation:', finalSelector);
    
    // FALLBACK 1: Try simple tag + nth-of-type
    if (element.parentNode) {
      const simpleSelector = `${element.tagName.toLowerCase()}:nth-of-type(${Array.from(element.parentNode.children)
        .filter(child => child.tagName === element.tagName).indexOf(element) + 1})`;
      
      if (validateSelector(simpleSelector, element)) {
        console.log('Element AI Extractor: Using fallback nth-of-type selector:', simpleSelector);
        return simpleSelector;
      }
    }
    
    // FALLBACK 2: For Shadow DOM elements, create a descriptive selector without validation
    if (isInShadowDOM && isInShadowDOM(element)) {
      const shadowFallback = `${element.tagName.toLowerCase()}${element.id ? '#' + element.id : ''}${element.className ? '.' + element.className.split(' ').filter(c => c.trim()).join('.') : ''}`;
      console.log('Element AI Extractor: Using Shadow DOM fallback selector:', shadowFallback);
      return shadowFallback;
    }
    
    // FALLBACK 3: Basic tag selector as last resort
    console.log('Element AI Extractor: Using basic tag fallback for:', element.tagName);
    return element.tagName.toLowerCase();
  }
  
  return finalSelector;
}

// Generate XPath
function generateXPath(element) {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }
  
  const parts = [];
  let current = element;
  
  while (current && current !== document.body) {
    let part = current.tagName.toLowerCase();
    
    if (current.id) {
      part = `*[@id="${current.id}"]`;
      parts.unshift(part);
      break;
    }
    
    // Count siblings of same tag
    const siblings = Array.from(current.parentNode?.children || [])
      .filter(el => el.tagName === current.tagName);
    if (siblings.length > 1) {
      const index = siblings.indexOf(current) + 1;
      part += `[${index}]`;
    }
    
    parts.unshift(part);
    current = current.parentElement;
    
    if (parts.length > 8) break; // Limit depth
  }
  
  return '//' + parts.join('/');
}

// Determine best locator based on ULTIMATE reliability for the BEST tool
function getBestLocator(locators) {
  // ULTIMATE Priority order: ID > Name > Class+Href > Role+Href > Href > Text+Href > Aria-label > CSS > XPath
  if (locators.id) {
    return { locator: locators.id, type: 'ID', strength: 95 };
  }
  
  if (locators.name) {
    return { locator: locators.name, type: 'Name', strength: 85 };
  }
  
  // BEST for navigation: Class + Href combination (semantic + functional)
  if (locators.classHref) {
    return { locator: locators.classHref, type: 'Class+Href', strength: 92 };
  }
  
  // Role-based navigation (excellent for accessibility)
  if (locators.roleHref) {
    return { locator: locators.roleHref, type: 'Role+Href', strength: 88 };
  }
  
  // Pure href (good for navigation)
  if (locators.href) {
    return { locator: locators.href, type: 'Href', strength: 78 };
  }
  
  // Text-based navigation (good for unique content)
  if (locators.textHref) {
    return { locator: locators.textHref, type: 'Text+Href', strength: 75 };
  }
  
  if (locators.ariaLabel) {
    return { locator: locators.ariaLabel, type: 'Aria-label', strength: 80 };
  }
  
  if (locators.css && locators.css.length < 100) {
    return { locator: locators.css, type: 'CSS', strength: 70 };
  }
  
  if (locators.xpath && locators.xpath.length < 150) {
    return { locator: locators.xpath, type: 'XPath', strength: 60 };
  }
  
  // Fallback to CSS even if long
  return { locator: locators.css || locators.xpath, type: 'CSS', strength: 50 };
}

// Check if element is in shadow DOM
function isInShadowDOM(element) {
  if (!element) return false;
  
  // Use getRootNode if available (modern approach)
  if (element.getRootNode) {
    const root = element.getRootNode();
    return root instanceof ShadowRoot;
  }
  
  // Fallback to parent traversal
  let parent = element.parentNode;
  while (parent) {
    if (parent.toString() === '[object ShadowRoot]') {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
}

// Get shadow DOM host path for an element
function getShadowHostPath(element) {
  if (!element || !isInShadowDOM(element)) {
    return '';
  }
  
  const hostPath = [];
  let current = element;
  
  while (current) {
    const root = current.getRootNode ? current.getRootNode() : null;
    
    if (root instanceof ShadowRoot && root.host) {
      // Found a shadow host, add its selector to the path
      const hostSelector = generateCSSSelector(root.host);
      hostPath.unshift(hostSelector);
      current = root.host;
    } else {
      break;
    }
  }
  
  return hostPath.join(' >> ');
}

// Generate automation-compatible Shadow DOM locators
function generateAutomationCompatibleLocators(element) {
  if (!isInShadowDOM(element)) {
    return null;
  }
  
  const result = {
    playwrightLocator: null,
    seleniumJavaScript: null,
    cypressLocator: null
  };
  
  // Build the shadow path
  const shadowPath = [];
  let current = element;
  let elementSelector = null;
  
  // First, get the selector for the element itself within its shadow root
  const shadowRoot = current.getRootNode();
  if (shadowRoot instanceof ShadowRoot) {
    elementSelector = generateCSSSelector(current);
    current = shadowRoot.host;
  }
  
  // Then traverse up through shadow hosts
  while (current && isInShadowDOM(current)) {
    const root = current.getRootNode();
    if (root instanceof ShadowRoot && root.host) {
      const hostSelector = generateCSSSelector(current);
      shadowPath.unshift(hostSelector);
      current = root.host;
    } else {
      break;
    }
  }
  
  // Add the final host selector (not in shadow)
  if (current) {
    const finalHostSelector = generateCSSSelector(current);
    shadowPath.unshift(finalHostSelector);
  }
  
  // Generate automation-specific locators
  if (shadowPath.length > 0 && elementSelector) {
    // Playwright locator (uses pierceRoot)
    result.playwrightLocator = `page.locator('${shadowPath[0]}').locator('${elementSelector}')`;
    
    // Selenium JavaScript executor
    const hostPath = shadowPath.join(' >> ');
    result.seleniumJavaScript = `
// Selenium Shadow DOM locator
WebElement element = (WebElement) ((JavascriptExecutor) driver).executeScript(
  "return arguments[0].shadowRoot.querySelector('${elementSelector}');",
  driver.findElement(By.cssSelector('${shadowPath[shadowPath.length - 1]}'))
);`;
    
    // Cypress locator
    result.cypressLocator = `cy.get('${shadowPath[0]}').shadow().find('${elementSelector}')`;
  }
  
  return result;
}

// Start inspection mode
function startInspection() {
  // Only allow inspection to start in the top-level frame
  if (window !== window.top) {
    return { status: 'ignored_frame' };
  }
  
  if (isInspecting) {
    console.log("Element AI Extractor: Already in inspection mode");
    return { status: 'listening' };
  }
  
  console.log("Element AI Extractor: Starting inspection mode");
  
  // Set inspection state FIRST
  isInspecting = true;
  window.aiExtractorIsInspecting = true;
  
  console.log("Element AI Extractor: Inspection state set - isInspecting:", isInspecting, "window.aiExtractorIsInspecting:", window.aiExtractorIsInspecting);
  
  // Start syncing with storage
  startStorageSync();
  
  // Inject styles (including into shadow roots)
  console.log("Element AI Extractor: Injecting styles for highlighting...");
  injectStyles();
  
  // Debug: Verify styles were injected
  setTimeout(() => {
    const styleElement = document.getElementById('ai-extractor-styles');
    if (styleElement) {
      console.log("Element AI Extractor: Styles successfully injected, content length:", styleElement.textContent.length);
      console.log("Element AI Extractor: Style element:", styleElement);
    } else {
      console.error("Element AI Extractor: ERROR - Style element not found after injection!");
    }
  }, 100);
  
  // Set up shadow DOM observer for dynamic content
  setupShadowDOMObserver();
  
  // Add cursor style to body
  document.body.classList.add('ai-extractor-inspecting');
  console.log("Element AI Extractor: Added inspecting class to body");
  
  // Create floating badge for user guidance
  createInspectorBadge();
  
  // Add event listeners with explicit debugging
  console.log("Element AI Extractor: Adding event listeners...");
  console.log("Element AI Extractor: handleMouseOver function exists:", typeof handleMouseOver === 'function');
  console.log("Element AI Extractor: handleMouseOut function exists:", typeof handleMouseOut === 'function');
  console.log("Element AI Extractor: handleClick function exists:", typeof handleClick === 'function');
  
  // Remove any existing listeners first to avoid duplicates
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('mouseout', handleMouseOut, true);
  document.removeEventListener('click', handleClick, true);
  
  // Add fresh event listeners
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('mouseout', handleMouseOut, true);
  document.addEventListener('click', handleClick, true);
  
  console.log("Element AI Extractor: Event listeners added successfully");
  
  // Test that the functions are actually attached by simulating an event
  setTimeout(() => {
    console.log("Element AI Extractor: Testing event listener attachment...");
    console.log("Element AI Extractor: Current isInspecting state:", isInspecting);
    console.log("Element AI Extractor: Current window.aiExtractorIsInspecting state:", window.aiExtractorIsInspecting);
    
    // Create a test mouseover event to verify the handler is working
    const testEvent = new MouseEvent('mouseover', {
      bubbles: true,
      cancelable: true,
      clientX: 100,
      clientY: 100
    });
    
    // Dispatch on document body as a test
    console.log("Element AI Extractor: Dispatching test mouseover event...");
    document.body.dispatchEvent(testEvent);
    console.log("Element AI Extractor: Test mouseover event dispatched");
  }, 200);
  
  return { status: 'listening' };
}

// Set up observer for dynamically added shadow DOM content
function setupShadowDOMObserver() {
  if (window.aiExtractorShadowObserver) {
    window.aiExtractorShadowObserver.disconnect();
  }
  
  window.aiExtractorShadowObserver = new MutationObserver((mutations) => {
    let needsStyleRefresh = false;
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the added node has shadow roots or is inside a shadow root
          if (node.shadowRoot) {
            needsStyleRefresh = true;
          }
          
          // Check if any child elements have shadow roots
          const shadowElements = node.querySelectorAll && node.querySelectorAll('*') || [];
          for (let element of shadowElements) {
            if (element.shadowRoot) {
              needsStyleRefresh = true;
              break;
            }
          }
        }
      });
    });
    
    if (needsStyleRefresh) {
      console.log("Element AI Extractor: Detected new shadow DOM content, refreshing styles");
      injectStylesIntoShadowRoots();
    }
  });
  
  window.aiExtractorShadowObserver.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Stop inspection mode
function stopInspection() {
  if (!isInspecting) {
    console.log("Element AI Extractor: Not in inspection mode");
    return { status: 'stopped' };
  }
  
  console.log("Element AI Extractor: Stopping inspection mode");
  isInspecting = false;
  window.aiExtractorIsInspecting = false; // Update global state
  
  // Clear storage state IMMEDIATELY to prevent sync conflicts
  try {
    chrome.storage.local.set({ isInspecting: false });
  } catch (error) {
    console.warn("Element AI Extractor: Error clearing storage state:", error);
  }
  
  // Stop syncing with storage
  stopStorageSync();
  
  // Disconnect shadow DOM observer
  if (window.aiExtractorShadowObserver) {
    window.aiExtractorShadowObserver.disconnect();
    window.aiExtractorShadowObserver = null;
  }
  
  // Remove floating badge
  removeInspectorBadge();
  
  // Remove event listeners
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('mouseout', handleMouseOut, true);
  document.removeEventListener('click', handleClick, true);
  
  // Remove highlights and styles (including from shadow roots)
  removeAllHighlights();
  document.body.classList.remove('ai-extractor-inspecting');
  removeStyles();
  
  return { status: 'stopped' };
}

// Get the actual element under the mouse, including shadow DOM elements
function getElementFromPoint(x, y) {
  let element = document.elementFromPoint(x, y);
  
  // Traverse into shadow DOM if the element has shadow root
  while (element && element.shadowRoot) {
    const shadowElement = element.shadowRoot.elementFromPoint(x, y);
    if (shadowElement && shadowElement !== element) {
      element = shadowElement;
    } else {
      break;
    }
  }
  
  return element;
}

// Get the deepest element under mouse coordinates, traversing shadow DOM
function getDeepElementFromPoint(x, y) {
  let element = document.elementFromPoint(x, y);
  
  // Keep going deeper into shadow DOMs
  while (element) {
    if (element.shadowRoot) {
      const shadowElement = element.shadowRoot.elementFromPoint(x, y);
      if (shadowElement && shadowElement !== element) {
        element = shadowElement;
        continue;
      }
    }
    break;
  }
  
  return element;
}

// Handle mouse over events
function handleMouseOver(event) {
  // Add immediate debug logging
  console.log("Element AI Extractor: handleMouseOver TRIGGERED - isInspecting:", isInspecting, "window.aiExtractorIsInspecting:", window.aiExtractorIsInspecting);
  
  if (!isInspecting && !window.aiExtractorIsInspecting) {
    console.log("Element AI Extractor: Mouse over ignored - not inspecting");
    return;
  }
  
  event.stopPropagation();
  
  // Get the actual element under the mouse, including shadow DOM elements
  const actualElement = getDeepElementFromPoint(event.clientX, event.clientY);
  const element = actualElement || event.target;
  
  console.log("Element AI Extractor: Mouse over ACTIVE", {
    originalTarget: event.target,
    actualElement: actualElement,
    finalElement: element,
    inShadowDOM: isInShadowDOM(element),
    elementTag: element.tagName,
    elementId: element.id,
    elementClasses: element.className
  });
  
  // Don't highlight body or html
  if (element === document.body || element === document.documentElement) {
    console.log("Element AI Extractor: Skipping body/html highlighting");
    return;
  }
  
  // Only update highlight if this is a different element
  if (element !== currentlyHighlightedElement) {
    console.log("Element AI Extractor: Highlighting NEW element:", element);
    
    // Remove highlight from previous element
    if (currentlyHighlightedElement) {
      console.log("Element AI Extractor: Removing highlight from previous element:", currentlyHighlightedElement);
      removeHighlight(currentlyHighlightedElement);
    }
    
    // Highlight new element
    highlightElement(element);
    currentlyHighlightedElement = element;
    
    // Debug: Check if highlight was applied
    setTimeout(() => {
      const hasHighlightClass = element.classList.contains('ai-extractor-highlight');
      console.log("Element AI Extractor: Highlight applied successfully?", hasHighlightClass, "Element:", element);
      
      // Also check if styles are present
      const styleElement = document.getElementById('ai-extractor-styles');
      console.log("Element AI Extractor: Style element exists?", !!styleElement);
      if (styleElement) {
        console.log("Element AI Extractor: Style content length:", styleElement.textContent.length);
      }
    }, 10);
  } else {
    console.log("Element AI Extractor: Same element, not re-highlighting");
  }
}

// Handle mouse out events
function handleMouseOut(event) {
  if (!isInspecting) return;
  
  event.stopPropagation();
  // Keep highlight until hovering over a different element
  // This creates the persistence behavior requested
}

// Handle click events
async function handleClick(event) {
  if (!isInspecting) return;
  
  // Get the actual element under the mouse, including shadow DOM elements
  const actualElement = getDeepElementFromPoint(event.clientX, event.clientY);
  const element = actualElement || event.target;
  
  console.log("Element AI Extractor: Element clicked", {
    originalTarget: event.target,
    actualElement: actualElement,
    finalElement: element,
    inShadowDOM: isInShadowDOM(element)
  });
  
  // Don't process body or html clicks
  if (element === document.body || element === document.documentElement) {
    return;
  }
  
  // Don't process clicks on our own inspector badge - but allow button clicks to pass through
  if (element.classList.contains('ai-extractor-inspector-badge') || 
      element.closest('.ai-extractor-inspector-badge')) {
    console.log("Element AI Extractor: Badge click detected");
    
    // If it's a button click inside the badge, don't prevent it
    if (element.classList.contains('badge-copy-btn') || 
        element.classList.contains('badge-highlight-btn') ||
        element.classList.contains('badge-close')) {
      console.log("Element AI Extractor: Badge button click, allowing it to proceed");
      return; // Let the button click proceed normally
    }
    
    // For other badge clicks, prevent element processing
    console.log("Element AI Extractor: Non-button badge click, skipping element processing");
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  
  // For all other clicks during inspection, prevent default behavior
  event.preventDefault();
  event.stopPropagation();
  
  // Get element details (now async)
  const elementData = await getElementDetails(element);
  
  if (elementData) {
    console.log("Element AI Extractor: Sending element data to popup", elementData);
    
    // Store the data in chrome storage for persistence
    const inspectedData = {
      data: elementData,
      timestamp: Date.now(),
      url: window.location.href
    };
    
    try {
      chrome.storage.local.set({ 
        lastInspectedElement: inspectedData 
      }, () => {
        if (chrome.runtime.lastError) {
          console.error("Element AI Extractor: Error storing element data:", chrome.runtime.lastError.message);
        } else {
          console.log("Element AI Extractor: Element data stored successfully");
        }
      });
    } catch (error) {
      console.error("Element AI Extractor: Error accessing storage:", error);
    }
    
    // Try to send to popup if it's open, but don't rely on it
    chrome.runtime.sendMessage({
      action: "inspectedElementDataAiExtractor",
      data: elementData
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log("Element AI Extractor: Popup closed - data stored in storage instead");
      } else {
        console.log("Element AI Extractor: Successfully sent element data to popup");
      }
    });
    
    // Update badge with results
    updateBadgeWithResults(elementData);
    
    // Keep inspection mode active - don't stop automatically
    // User needs to manually click "Stop Inspecting"
    lastClickedElement = element;
  }
}

// Message listener for communication with popup
console.log("Element AI Extractor: Setting up enhanced message listener");

// Remove any existing listeners to prevent duplicates
if (window.aiExtractorMessageListener) {
  try {
    chrome.runtime.onMessage.removeListener(window.aiExtractorMessageListener);
    console.log("Element AI Extractor: Removed existing message listener");
  } catch (error) {
    console.log("Element AI Extractor: Error removing existing listener:", error);
  }
}

// Create robust message listener
window.aiExtractorMessageListener = (message, sender, sendResponse) => {
  console.log("Element AI Extractor: Content script received message", message);
  console.log("Element AI Extractor: Sender:", sender);
  
  try {
    // Validate message structure
    if (!message || typeof message !== 'object') {
      console.warn("Element AI Extractor: Invalid message received", message);
      try {
        sendResponse({ status: 'error', message: 'Invalid message format' });
      } catch (responseError) {
        console.error("Element AI Extractor: Error sending invalid message response:", responseError);
      }
      return true;
    }

    switch (message.action) {
      case 'ping':
        console.log("Element AI Extractor: Responding to ping with enhanced status");
        const response = { 
          status: 'alive', 
          inspecting: window.aiExtractorIsInspecting || false, 
          timestamp: Date.now(),
          frameType: window === window.top ? 'main' : 'iframe',
          url: window.location.href,
          readyState: document.readyState,
          scriptLoaded: window.aiExtractorLoaded || false,
          contentScriptVersion: '1.0.2',
          messageListenerActive: true
        };
        console.log("Element AI Extractor: Ping response:", response);
        
        // Immediate response with error handling
        try {
          sendResponse(response);
          console.log("Element AI Extractor: Ping response sent successfully");
        } catch (responseError) {
          console.error("Element AI Extractor: Error sending ping response:", responseError);
        }
        return true; // Keep channel open
      
      case 'startInspectingAiExtractor':
        console.log("Element AI Extractor: Starting inspection");
        try {
          const startResult = startInspection();
          sendResponse(startResult);
          console.log("Element AI Extractor: Start inspection response sent:", startResult);
        } catch (error) {
          console.error("Element AI Extractor: Error starting inspection:", error);
          try {
            sendResponse({ status: 'error', message: 'Failed to start inspection: ' + error.message });
          } catch (responseError) {
            console.error("Element AI Extractor: Error sending start inspection error response:", responseError);
          }
        }
        return true; // Keep channel open
        
      case 'stopInspectingAiExtractor':
        console.log("Element AI Extractor: Stopping inspection");
        try {
          const stopResult = stopInspection();
          sendResponse(stopResult);
          console.log("Element AI Extractor: Stop inspection response sent:", stopResult);
        } catch (error) {
          console.error("Element AI Extractor: Error stopping inspection:", error);
          try {
            sendResponse({ status: 'error', message: 'Failed to stop inspection: ' + error.message });
          } catch (responseError) {
            console.error("Element AI Extractor: Error sending stop inspection error response:", responseError);
          }
        }
        return true; // Keep channel open
        
      case 'pingAutoFiller':
        console.log("Element AI Extractor: Auto-filler ping received");
        
        // Force a response even if auto-filler is not ready
        let pingResponse;
        
        try {
          // Check if auto-filler exists and is ready
          const autoFillerExists = !!(window.aiExtractorAutoFiller);
          const autoFillerReady = autoFillerExists && 
                                 typeof window.aiExtractorAutoFiller.autoFillForms === 'function' &&
                                 !window.aiExtractorAutoFillerError;
          
          pingResponse = { 
            status: 'success', 
            autoFillerReady: autoFillerReady,
            autoFillerLoaded: !!window.aiExtractorAutoFillerLoaded,
            autoFillerInitialized: !!window.aiExtractorAutoFillerInitialized,
            autoFillerExists: autoFillerExists,
            autoFillerScript: !!window.aiExtractorAutoFillerScript,
            autoFillerError: window.aiExtractorAutoFillerError || null,
            windowVars: {
              aiExtractorAutoFiller: !!window.aiExtractorAutoFiller,
              aiExtractorAutoFillerLoaded: !!window.aiExtractorAutoFillerLoaded,
              aiExtractorAutoFillerInitialized: !!window.aiExtractorAutoFillerInitialized,
              aiExtractorAutoFillerScript: !!window.aiExtractorAutoFillerScript,
              aiExtractorAutoFillerError: window.aiExtractorAutoFillerError
            },
            timestamp: Date.now(),
            url: window.location.href
          };
          
          console.log("Element AI Extractor: Auto-filler ping response prepared:", pingResponse);
          
        } catch (error) {
          console.error("Element AI Extractor: Error preparing auto-filler ping response:", error);
          pingResponse = { 
            status: 'error', 
            autoFillerReady: false, 
            error: error.message,
            timestamp: Date.now(),
            url: window.location.href
          };
        }
        
        // Always try to send response with multiple fallback attempts
        try {
          sendResponse(pingResponse);
          console.log("Element AI Extractor: Auto-filler ping response sent successfully");
        } catch (sendError) {
          console.error("Element AI Extractor: Error sending ping response:", sendError);
          
          // Try alternative response method after a delay
          setTimeout(() => {
            try {
              sendResponse(pingResponse);
              console.log("Element AI Extractor: Auto-filler ping response sent on retry");
            } catch (retryError) {
              console.error("Element AI Extractor: Retry send response failed:", retryError);
            }
          }, 100);
        }
        
        return true; // Keep channel open
        
      case 'autoFillForms':
        console.log("Element AI Extractor: Auto-fill forms request received");
        try {
          if (window.aiExtractorAutoFiller) {
            window.aiExtractorAutoFiller.setTestMode(message.testMode || false);
            window.aiExtractorAutoFiller.autoFillForms()
              .then(() => {
                try {
                  sendResponse({ status: 'success', message: 'Auto-fill completed' });
                } catch (responseError) {
                  console.error("Element AI Extractor: Error sending auto-fill success response:", responseError);
                }
              })
              .catch((error) => {
                try {
                  sendResponse({ status: 'error', message: 'Auto-fill failed: ' + error.message });
                } catch (responseError) {
                  console.error("Element AI Extractor: Error sending auto-fill error response:", responseError);
                }
              });
          } else {
            sendResponse({ status: 'error', message: 'Auto-filler not available' });
          }
        } catch (error) {
          console.error("Element AI Extractor: Error during auto-fill:", error);
          try {
            sendResponse({ status: 'error', message: 'Auto-fill error: ' + error.message });
          } catch (responseError) {
            console.error("Element AI Extractor: Error sending auto-fill error response:", responseError);
          }
        }
        return true; // Keep channel open for async response
        
      case 'autoInteract':
        console.log("Element AI Extractor: Auto-interact request received");
        try {
          if (window.aiExtractorAutoFiller) {
            window.aiExtractorAutoFiller.setTestMode(message.testMode || false);
            window.aiExtractorAutoFiller.autoInteract()
              .then(() => {
                try {
                  sendResponse({ status: 'success', message: 'Auto-interact completed' });
                } catch (responseError) {
                  console.error("Element AI Extractor: Error sending auto-interact success response:", responseError);
                }
              })
              .catch((error) => {
                try {
                  sendResponse({ status: 'error', message: 'Auto-interact failed: ' + error.message });
                } catch (responseError) {
                  console.error("Element AI Extractor: Error sending auto-interact error response:", responseError);
                }
              });
          } else {
            sendResponse({ status: 'error', message: 'Auto-filler not available' });
          }
        } catch (error) {
          console.error("Element AI Extractor: Error during auto-interact:", error);
          try {
            sendResponse({ status: 'error', message: 'Auto-interact error: ' + error.message });
          } catch (responseError) {
            console.error("Element AI Extractor: Error sending auto-interact error response:", responseError);
          }
        }
        return true; // Keep channel open for async response
        
      case 'refreshAutoFillerData':
        console.log("Element AI Extractor: Refresh auto-filler data request received");
        try {
          if (window.aiExtractorAutoFiller && window.aiExtractorAutoFiller.refreshFillData) {
            window.aiExtractorAutoFiller.refreshFillData()
              .then(() => {
                try {
                  sendResponse({ status: 'success', message: 'Auto-filler data refreshed' });
                } catch (responseError) {
                  console.error("Element AI Extractor: Error sending refresh response:", responseError);
                }
              })
              .catch((error) => {
                try {
                  sendResponse({ status: 'error', message: 'Refresh failed: ' + error.message });
                } catch (responseError) {
                  console.error("Element AI Extractor: Error sending refresh error response:", responseError);
                }
              });
          } else {
            sendResponse({ status: 'info', message: 'Auto-filler not available for refresh' });
          }
        } catch (error) {
          console.error("Element AI Extractor: Error during refresh:", error);
          try {
            sendResponse({ status: 'error', message: 'Refresh error: ' + error.message });
          } catch (responseError) {
            console.error("Element AI Extractor: Error sending refresh error response:", responseError);
          }
        }
        return true; // Keep channel open for async response
        
      default:
        console.log("Element AI Extractor: Unknown message action", message.action);
        try {
          sendResponse({ status: 'error', message: 'Unknown action: ' + (message.action || 'undefined') });
        } catch (responseError) {
          console.error("Element AI Extractor: Error sending unknown action response:", responseError);
        }
        return true; // Keep channel open
    }
  } catch (error) {
    console.error("Element AI Extractor: Error in message listener:", error);
    try {
      sendResponse({ status: 'error', message: 'Message handler error: ' + error.message });
    } catch (responseError) {
      console.error("Element AI Extractor: Could not send error response:", responseError);
    }
    return true; // Keep channel open
  }
};

// Add the message listener
chrome.runtime.onMessage.addListener(window.aiExtractorMessageListener);

// Test the message listener setup
setTimeout(() => {
  console.log("Element AI Extractor: Message listener should be active now");
  console.log("Element AI Extractor: chrome.runtime available:", !!chrome.runtime);
  console.log("Element AI Extractor: chrome.runtime.onMessage available:", !!chrome.runtime?.onMessage);
}, 100);

// Cleanup when page unloads
window.addEventListener('beforeunload', () => {
  if (isInspecting) {
    stopInspection();
  }
});

// Initialize storage sync on load
startStorageSync();

console.log("Element AI Extractor: Content script ready");

// Send a signal to indicate the script has loaded successfully
try {
  chrome.runtime.sendMessage({ action: 'contentScriptLoaded', url: window.location.href }, (response) => {
    if (chrome.runtime.lastError) {
      console.log("Element AI Extractor: Could not notify popup of script load (expected if popup closed)");
    } else {
      console.log("Element AI Extractor: Successfully notified popup of script load");
    }
  });
} catch (error) {
  console.log("Element AI Extractor: Error sending load notification:", error);
}

} // End of else block (script loading check)
