// === Element AI Extractor - popup.js ===

// ---- AI Tip List ----
const aiTips = [
  // Element Selection Best Practices
  'IDs are the most stable selectors—use them if available! They rarely change and provide unique identification.',
  'The [role] and [aria-label] attributes improve accessibility and test stability across browser updates.',
  'Interactable elements (buttons, links, inputs) are best for automation—they\'re designed to be clicked.',
  'Prefer visible elements for automation—hidden elements may change behavior or disappear unexpectedly.',
  'Combine multiple CSS classes for more unique selectors: .btn.primary.large targets very specific elements.',
  
  // Selector Strategy Tips
  'Use data-testid attributes in your apps—they\'re specifically designed for testing and automation.',
  'XPath lets you select by text content: //button[contains(text(), "Submit")] finds buttons with "Submit" text.',
  'CSS selectors are faster than XPath—use them when possible for better performance.',
  'Avoid selectors based on position (nth-child) unless absolutely necessary—they break when content changes.',
  'Parent-child relationships in selectors add stability: .form .submit-btn is more reliable than just .submit-btn.',
  
  // Advanced Selection Techniques
  'Use attribute contains for partial matches: [class*="btn"] finds elements with "btn" anywhere in class name.',
  'Combine multiple attributes for uniqueness: input[type="email"][required] is more specific than just input.',
  'XPath axes help navigate relationships: //div[@class="user"]//following-sibling::button finds related elements.',
  'Use :not() pseudo-selector to exclude elements: button:not(.disabled) avoids non-clickable buttons.',
  'Filter by element state: input:enabled, :visible, :checked help find elements in the right condition.',
  
  // Dynamic Content Handling
  'For dynamic content, use stable attributes like data-id rather than generated class names.',
  'Text-based selectors work well for stable UI text: [aria-label="Close dialog"] is reliable.',
  'Avoid selecting by style attributes—they change frequently and break automation.',
  'Use partial text matching for dynamic content: [title*="User Profile"] handles changing user names.',
  'Shadow DOM elements require special handling—look for ::shadow or /deep/ selectors.',
  
  // Troubleshooting & Debugging
  'If an element isn\'t clickable, check for overlapping elements or CSS pointer-events: none.',
  'Elements inside iframes need frame switching—standard selectors won\'t work across frame boundaries.',
  'Timing matters: wait for elements to be both present AND visible before interacting.',
  'Check the element\'s computed style—display:none or visibility:hidden elements can\'t be clicked.',
  'Use browser dev tools to test selectors: $("your-selector") in console shows what you\'ll get.',
  
  // Performance & Reliability
  'Shorter selector paths are faster and less likely to break when UI structure changes.',
  'Avoid deep nesting in selectors—3-4 levels max keeps them maintainable.',
  'Test selectors in different browsers—some CSS features have varying support.',
  'Use semantic HTML elements when possible—<button> is better than <div role="button">.',
  'Form labels improve selector reliability: label[for="email"] or input#email both work well.',
  
  // Modern Web App Tips
  'Single Page Apps (SPAs) may reload content—wait for elements to be stable before selecting.',
  'React/Vue components often have data attributes—use them for reliable selection.',
  'CSS-in-JS generates unique class names—prefer data attributes or aria labels instead.',
  'Use intersection observer patterns to detect when elements are truly visible to users.',
  'Progressive Web Apps may lazy-load content—ensure elements exist before attempting selection.',
  
  // Cross-Browser Compatibility
  'Test critical selectors across Chrome, Firefox, and Safari—behavior can vary.',
  'Some CSS4 selectors aren\'t supported everywhere—stick to CSS3 for better compatibility.',
  'XPath support varies between browsers—CSS selectors are more universally supported.',
  'Mobile browsers may handle touch differently—test automation on actual devices.',
  'Flexbox and Grid layouts can change element positions—use logical selectors, not positional ones.'
];

// const aiTips = ['Did you know? [role] and [aria-label] improve accessibility and test stability.', 'AI Tip: Interactable (clickable) elements are best for automation.', 'Pro tip: Prefer visible elements for automation—hidden ones may change.', 'AI Tip: IDs are the most stable selectors—use them if available!', 'AI Tip: XPath lets you select by text, attribute, or position.', 'AI Tip: Use CSS selectors for faster automation scripts.', 'AI Tip: Filter by element type for faster locator selection.', 'Pro tip: Combine CSS classes for more unique selectors.'];

// ---- Element Inspector State ----
let isInspectingGlobal = false; // Tracks if inspect mode is active

// ---- Pagination State ----
let currentPage = 1;
let itemsPerPage = 12;
let currentFilteredData = [];
let showAllMode = false;
let allOriginalData = []; // Store the complete dataset

// ---- On Load: Setup UI, Restore Table ----
document.addEventListener('DOMContentLoaded', () => {
  // Show random tip at top - target the content div to preserve the sidebar structure
  const aiTipContent = document.querySelector('.ai-tip-content');
  if (aiTipContent) {
    aiTipContent.innerHTML = `<strong>Pro Tip:</strong>${aiTips[Math.floor(Math.random() * aiTips.length)]}`;
  }

  // Make only "All Elements" checked initially; others unchecked
  document.getElementById('filterAll').checked = true;
  elementTypeList.forEach(type => (document.getElementById(type.id).checked = false));

  // Check for recent inspection data and display it
  checkForRecentInspectionData();

  // Restore last data (if any) from storage for user
  chrome.storage.local.get(['lastExtractedData'], res => {
    if (res.lastExtractedData && Array.isArray(res.lastExtractedData)) {
      renderElementsTable(res.lastExtractedData);
      document.getElementById('status').textContent = 'Previous extraction loaded.';
    }
  });
});

// ---- Supported Element Types ----
const elementTypeList = [
  {id: 'filterLinks', label: 'Links', selector: 'a'},
  {id: 'filterButtons', label: 'Buttons', selector: "button,input[type='button'],input[type='submit']"},
  {id: 'filterInputs', label: 'Inputs', selector: 'input,select,textarea'},
  {id: 'filterCombo', label: 'Combo', selector: "select,[role='combobox']"},
  {id: 'filterTextboxes', label: 'Textboxes', selector: "input[type='text'],input[type='search'],input[type='email'],input[type='url'],input[type='password']"},
  {id: 'filterCheckboxes', label: 'Checkboxes', selector: "input[type='checkbox']"},
  {id: 'filterRadios', label: 'Radios', selector: "input[type='radio']"},
  {id: 'filterLists', label: 'Lists', selector: 'ul,ol,li,dl,dt,dd'},
  {id: 'filterForms', label: 'Forms', selector: 'form'},
  {id: 'filterImages', label: 'Images', selector: 'img'},
  {id: 'filterIframes', label: 'Iframes', selector: 'iframe'},
  {id: 'filterCustom', label: 'Custom Elements', selector: '*'}
];

// ---- ALL ELEMENTS toggle logic ----
const filterAllBox = document.getElementById('filterAll');
filterAllBox.addEventListener('change', function () {
  elementTypeList.forEach(type => {
    document.getElementById(type.id).checked = this.checked;
  });
});
elementTypeList.forEach(type => {
  document.getElementById(type.id).addEventListener('change', function () {
    if (!this.checked) filterAllBox.checked = false;
    else filterAllBox.checked = elementTypeList.every(type => document.getElementById(type.id).checked);
  });
});

// ---- Visible/Hidden mutually exclusive logic ----
document.getElementById('filterVisible').addEventListener('change', function () {
  if (this.checked) document.getElementById('filterHidden').checked = false;
});
document.getElementById('filterHidden').addEventListener('change', function () {
  if (this.checked) document.getElementById('filterVisible').checked = false;
});

// ---- Utility: Get Filters State from UI ----
function getCurrentFilters() {
  return {
    selectedTypes: elementTypeList.filter(type => document.getElementById(type.id).checked).map(type => type.id),
    shadowDOM: document.getElementById('filterShadow').checked,
    visibleOnly: document.getElementById('filterVisible').checked,
    hiddenOnly: document.getElementById('filterHidden').checked
  };
}

// ---- Utility: Check if URL is restricted ----
function isRestrictedUrl(url) {
  if (!url) return true;
  
  // Allow localhost and file URLs for testing
  if (url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1')) {
    return false;
  }
  
  // Allow file URLs if the extension has permission
  if (url.startsWith('file://')) {
    return false; // Let the browser handle the permission check
  }
  
  const restrictedProtocols = ['chrome:', 'chrome-extension:', 'moz-extension:', 'edge:', 'about:', 'data:', 'javascript:'];
  const restrictedPages = ['chrome.google.com/webstore', 'addons.mozilla.org', 'microsoftedge.microsoft.com'];
  
  return restrictedProtocols.some(protocol => url.startsWith(protocol)) ||
         restrictedPages.some(page => url.includes(page));
}

// ---- Utility: Get current active tab info ----
async function getCurrentTabInfo() {
  let [tab] = await chrome.tabs.query({active: true, currentWindow: true});
  try {
    const url = new URL(tab.url);
    return {
      hostname: url.hostname, 
      tabId: tab.id, 
      url: tab.url,
      isRestricted: isRestrictedUrl(tab.url)
    };
  } catch (e) {
    return {
      hostname: 'site', 
      tabId: tab.id, 
      url: tab.url || '',
      isRestricted: true
    };
  }
}

// ---- Utility: Case-insensitive match for search ----
function nameMatchesSearch(name, search) {
  if (!search) return true;
  return (name || '').toLowerCase().includes(search.toLowerCase());
}

// ---- Utility: Clipboard Copy ----
function copyLocatorToClipboard(text) {
  navigator.clipboard.writeText(text);
}

// ---- Utility: Highlight Element on Tab ----
function highlightElementOnTab(tabId, locator, inShadowDOM) {
  chrome.scripting.executeScript({
    target: {tabId},
    args: [locator, inShadowDOM],
    func: (locator, inShadowDOM) => {
      // #FUNCTION: findElementWithShadowSupport
      // #DESCRIPTION: Enhanced element finding with comprehensive Shadow DOM support
      function findElementWithShadowSupport(locatorStr, isInShadow) {
        if (!locatorStr) return null;
        
        console.log('Element AI Extractor: Searching for element:', locatorStr, 'inShadowDOM:', isInShadow);
        
        // #NOTE: Handle Shadow DOM path syntax "host >> inner"
        if (isInShadow && typeof locatorStr === 'string' && locatorStr.includes(' >> ')) {
          try {
            const pathSegments = locatorStr.split(' >> ');
            const finalInnerSelector = pathSegments.pop();
            let currentNode = document;
            
            console.log('Element AI Extractor: Processing shadow path segments:', pathSegments);
            
            // #IMPORTANT: Traverse through shadow host path
            for (const segment of pathSegments) {
              if (currentNode.querySelector) {
                let host = currentNode.querySelector(segment);
                if (host && host.shadowRoot) {
                  currentNode = host.shadowRoot;
                  console.log('Element AI Extractor: Found shadow host:', segment, 'shadowRoot:', currentNode);
                } else {
                  console.warn('Element AI Extractor: Shadow host not found:', segment);
                  return null;
                }
              } else {
                console.warn('Element AI Extractor: Cannot query in current node:', currentNode);
                return null;
              }
            }
            
            // #NOTE: Find final element in the deepest shadow root
            if (currentNode.querySelector) {
              const foundElement = currentNode.querySelector(finalInnerSelector);
              console.log('Element AI Extractor: Final element search result:', foundElement);
              return foundElement;
            }
          } catch (e) {
            console.warn('Element AI Extractor: Error parsing shadow path:', e);
            return null;
          }
        }
        
        // #NOTE: Enhanced shadow search with deep traversal
        if (isInShadow) {
          function searchAllShadowRoots(rootNode, selector) {
            if (!rootNode) return null;
            
            // Try to find in current context
            if (rootNode.querySelector) {
              try {
                let found = rootNode.querySelector(selector);
                if (found) {
                  console.log('Element AI Extractor: Found element in shadow root:', found);
                  return found;
                }
              } catch (e) {
                console.warn('Element AI Extractor: Error querying selector in shadow root:', e);
              }
            }
            
            // Recursively search in all shadow roots
            const elements = rootNode.querySelectorAll ? rootNode.querySelectorAll('*') : [];
            for (let element of elements) {
              if (element.shadowRoot) {
                let found = searchAllShadowRoots(element.shadowRoot, selector);
                if (found) return found;
              }
            }
            
            return null;
          }
          
          // Search starting from document
          let result = searchAllShadowRoots(document, locatorStr);
          if (result) {
            console.log('Element AI Extractor: Found element via shadow search:', result);
            return result;
          }
        }
        
        // #NOTE: Standard element finding
        try {
          let element = null;
          if (locatorStr.startsWith('#')) {
            element = document.querySelector(locatorStr);
          } else if (locatorStr.startsWith('/')) {
            let r = document.evaluate(locatorStr, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            element = r.singleNodeValue;
          } else {
            element = document.querySelector(locatorStr);
          }
          
          if (element) {
            console.log('Element AI Extractor: Found element via standard search:', element);
          }
          return element;
        } catch (e) {
          console.warn('Element AI Extractor: Error finding element:', e);
          return null;
        }
      }
      
      let el = findElementWithShadowSupport(locator, inShadowDOM);
      if (el) {
        console.log('Element AI Extractor: Successfully found element, highlighting:', el);
        el.scrollIntoView({behavior: 'smooth', block: 'center'});
        el.style.outline = '3px solid #ff0000';
        el.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        setTimeout(() => {
          el.style.outline = '';
          el.style.backgroundColor = '';
        }, 2000);
      } else {
        console.warn('Element AI Extractor: Could not find element with locator:', locator, 'inShadowDOM:', inShadowDOM);
        // Try alternative search methods if shadow DOM search failed
        if (inShadowDOM) {
          console.log('Element AI Extractor: Trying fallback search methods...');
          try {
            // Try direct querySelector on document as fallback
            let fallbackEl = document.querySelector(locator);
            if (fallbackEl) {
              console.log('Element AI Extractor: Found element via fallback search:', fallbackEl);
              fallbackEl.scrollIntoView({behavior: 'smooth', block: 'center'});
              fallbackEl.style.outline = '3px solid #ff0000';
              fallbackEl.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
              setTimeout(() => {
                fallbackEl.style.outline = '';
                fallbackEl.style.backgroundColor = '';
              }, 2000);
            }
          } catch (e) {
            console.warn('Element AI Extractor: Fallback search also failed:', e);
          }
        }
      }
    }
  });
}

// ---- CSV Download Helper ----
function downloadCSVFile(elementList, filename) {
  const headers = ['Element Name', 'Element Type', 'Best Locator', 'Locator Type', 'Strength', 'ID', 'CSS', 'XPATH', 'In Shadow DOM', 'Host Element Path'];
  const csvRows = [headers.join(',')].concat(elementList.map(row => headers.map(h => `"${(row[h] + '').replace(/"/g, '""')}"`).join(',')));
  const blob = new Blob([csvRows.join('\n')], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  document.getElementById('status').textContent = `Your locators are ready: ${filename}`;
}

// ---- JSON Download Helper ----
function downloadJSONFile(elementList, filename) {
  const jsonData = {
    extractedAt: new Date().toISOString(),
    hostname: window.location.hostname,
    totalElements: elementList.length,
    elements: elementList
  };
  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  document.getElementById('status').textContent = `JSON export ready: ${filename}`;
}

// ---- Excel Download Helper ----
function downloadExcelFile(elementList, filename) {
  const headers = ['Element Name', 'Element Type', 'Best Locator', 'Locator Type', 'ID', 'CSS', 'XPATH', 'In Shadow DOM'];
  let excelContent = '<table border="1">';
  excelContent += '<tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr>';
  elementList.forEach(row => {
    excelContent += '<tr>' + headers.map(h => `<td>${row[h] || ''}</td>`).join('') + '</tr>';
  });
  excelContent += '</table>';
  
  const blob = new Blob([excelContent], {type: 'application/vnd.ms-excel'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  document.getElementById('status').textContent = `Excel export ready: ${filename}`;
}

// ---- MAIN: Extraction Button Click Handler ----
document.getElementById('extract').onclick = async () => {
  let extractBtn = document.getElementById('extract');
  extractBtn.disabled = true;
  document.getElementById('status').innerHTML = '<span class="loading">Scanning elements...</span>';
  document.getElementById('preview').innerHTML = '';
  const filters = getCurrentFilters();
  const {hostname, tabId} = await getCurrentTabInfo();

  // --- Fail-safe timeout: never hang!
  let failTimeout = setTimeout(() => {
    document.getElementById('status').innerHTML = '❌ Could not extract elements. Try on a regular website.';
    extractBtn.disabled = false;
  }, 9000);

  // -- The DOM extraction runs inside the page context
  chrome.scripting.executeScript(
    {
      target: {tabId},
      args: [filters],
      func: domExtractionFunction
    },
    results => {
      clearTimeout(failTimeout);

      if (!results || !results[0] || !results[0].result) {
        document.getElementById('status').textContent = '❌ Injection or extraction failed!';
        extractBtn.disabled = false;
        return;
      }

      if (chrome.runtime.lastError) {
        document.getElementById('status').textContent = '❌ Script injection failed: ' + chrome.runtime.lastError.message;
        extractBtn.disabled = false;
        return;
      }
      if (!results || !Array.isArray(results) || !results[0] || !results[0].result) {
        document.getElementById('status').textContent = '❌ Extraction failed or blocked on this page.';
        extractBtn.disabled = false;
        return;
      }
      let elementDataList = results[0].result;
      // Save latest result for preview even if popup is closed
      chrome.storage.local.set({lastExtractedData: elementDataList});
      if (!elementDataList.length) {
        document.getElementById('status').textContent = 'No elements found.';
        document.getElementById('preview').innerHTML = '';
        extractBtn.disabled = false;
        return;
      }
      document.getElementById('status').textContent = 'Scanned elements!';
      
      // Reset pagination for new data
      resetToFirstPage();
      
      renderElementsTable(elementDataList);
      updateStatsDisplay(elementDataList);
      // Get selected export format and compose filename
      let exportFormat = document.getElementById('exportFormat').value;
      
      // Only download files for non-Table formats
      if (exportFormat !== 'table') {
        let now = new Date();
        let timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
        let filename = `${hostname}_elements_${timestamp}`;
        
        // Download in selected format
        switch(exportFormat) {
          case 'json':
            downloadJSONFile(elementDataList, filename + '.json');
            break;
          case 'excel':
            downloadExcelFile(elementDataList, filename + '.xls');
            break;
          case 'csv':
            downloadCSVFile(elementDataList, filename + '.csv');
            break;
        }
      }
      setTimeout(() => (extractBtn.disabled = false), 1100);
    }
  );
};

/**
 * ---- DOM Extraction Logic (IN-PAGE CONTEXT) ----
 * Gathers and returns all elements per filters from the DOM.
 * Variable and function names are clear and consistent.
 * @param {Object} filters - from UI: {selectedTypes, shadowDOM, visibleOnly, hiddenOnly}
 * @returns {Array<Object>} array of element info
 */

// -- ADVANCED DOM EXTRACTION FUNCTION -- //
// (This function runs inside the page context)
function domExtractionFunction(filters) {
  // Map filters to selectors
  const typeToSelector = {
    filterLinks: 'a',
    filterButtons: "button,input[type='button'],input[type='submit']",
    filterInputs: 'input,select,textarea',
    filterCombo: "select,[role='combobox']",
    filterTextboxes: "input[type='text'],input[type='search'],input[type='email'],input[type='url'],input[type='password']",
    filterCheckboxes: "input[type='checkbox']",
    filterRadios: "input[type='radio']",
    filterLists: 'ul,ol,li,dl,dt,dd',
    filterForms: 'form',
    filterImages: 'img',
    filterIframes: 'iframe',
    filterCustom: '*'
  };

  // #FUNCTION: isVisible - Enhanced visibility check
  // #DESCRIPTION: Checks if an element is currently visible in the layout
  function isVisible(el) {
    if (!el || !el.getBoundingClientRect) return false;
    const style = window.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    
    return style && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           rect.width > 0 && 
           rect.height > 0;
  }

  // #FUNCTION: getBestLocator - Enhanced for Shadow DOM context
  // #DESCRIPTION: Get the best, most stable locator for the element with context awareness
  function getBestLocator(el, contextNode = document) {
    // Priority order: ID > Test attributes > Aria attributes > Role > CSS > XPath
    
    // Helper function to check if ID contains special CSS characters
    function hasSpecialCssChars(id) {
      // Characters that have special meaning in CSS selectors
      return /[.()[\]{}+~>,:;#@$%^&*=!|\\/"'`\s]/.test(id);
    }
    
    // 1. ID selector (most reliable)
    if (el.id && !el.id.match(/^[0-9]+$/)) {
      // Check uniqueness within the current context
      const sameIdElements = contextNode.querySelectorAll ? 
        contextNode.querySelectorAll(`[id="${el.id}"]`) : [];
      if (sameIdElements.length === 1) {
        // Use attribute selector for complex IDs with special characters
        if (hasSpecialCssChars(el.id)) {
          return {type: 'ID', locator: `[id="${el.id}"]`, reason: 'Unique ID (complex)'};
        }
        return {type: 'ID', locator: `#${el.id}`, reason: 'Unique ID'};
      }
    }

    // 2. Test attributes (very reliable for automation)
    for (const attr of ['data-testid', 'data-qa', 'data-cy']) {
      if (el.hasAttribute(attr)) {
        const value = el.getAttribute(attr);
        const sameTestAttr = contextNode.querySelectorAll ? 
          contextNode.querySelectorAll(`[${attr}="${value}"]`) : [];
        if (sameTestAttr.length === 1) {
          return {type: attr, locator: `[${attr}="${value}"]`, reason: 'Unique test attribute'};
        }
      }
    }

    // 3. Name attribute (reliable for form elements)
    if (el.name) {
      const sameName = contextNode.querySelectorAll ? 
        contextNode.querySelectorAll(`[name="${el.name}"]`) : [];
      if (sameName.length === 1) {
        return {type: 'name', locator: `[name="${el.name}"]`, reason: 'Unique name attribute'};
      }
    }

    // 4. ULTIMATE Href-based locators for links (BEST PRACTICE for navigation)
    if (el.tagName.toLowerCase() === 'a' && el.hasAttribute('href')) {
      const href = el.getAttribute('href');
      
      // PRIORITY 1: Class + Href combination (MOST RELIABLE for navigation)
      if (el.className && typeof el.className === 'string') {
        const classes = el.className.split(' ')
          .filter(c => c.trim() && !c.startsWith('ai-extractor-'));
        if (classes.length > 0) {
          const combinedLocator = `.${classes.map(c => CSS.escape(c)).join('.')}[href="${href}"]`;
          const sameCombined = contextNode.querySelectorAll ? 
            contextNode.querySelectorAll(combinedLocator) : [];
          if (sameCombined.length === 1) {
            return {type: 'class+href', locator: combinedLocator, reason: 'BEST: Unique semantic navigation locator'};
          }
        }
      }
      
      // PRIORITY 2: Pure href (fallback)
      const sameHref = contextNode.querySelectorAll ? 
        contextNode.querySelectorAll(`a[href="${href}"]`) : [];
      if (sameHref.length === 1) {
        return {type: 'href', locator: `a[href="${href}"]`, reason: 'Unique href'};
      }
    }

    // 5. Aria attributes (good for accessibility)
    if (el.hasAttribute('aria-label')) {
      const ariaLabel = el.getAttribute('aria-label');
      const sameAriaLabel = contextNode.querySelectorAll ? 
        contextNode.querySelectorAll(`[aria-label="${ariaLabel}"]`) : [];
      if (sameAriaLabel.length === 1) {
        return {type: 'aria-label', locator: `[aria-label="${ariaLabel}"]`, reason: 'Unique aria-label'};
      }
    }

    // 6. Role attribute (good for semantic elements)
    if (el.hasAttribute('role')) {
      const role = el.getAttribute('role');
      const sameRole = contextNode.querySelectorAll ? 
        contextNode.querySelectorAll(`[role="${role}"]`) : [];
      if (sameRole.length === 1) {
        return {type: 'role', locator: `[role="${role}"]`, reason: 'Unique role'};
      }
    }
    
    // 7. Single class (if unique)
    const filteredClasses = Array.from(el.classList).filter(cls => !cls.startsWith('ai-extractor-'));
    if (filteredClasses.length === 1) {
      const className = filteredClasses[0];
      const sameClass = contextNode.querySelectorAll ? 
        contextNode.querySelectorAll(`.${CSS.escape(className)}`) : [];
      if (sameClass.length === 1) {
        return {type: 'class', locator: `.${CSS.escape(className)}`, reason: 'Unique class'};
      }
    }

    // 8. CSS selector (generated) within context
    const cssSelector = getUniqueCssSelector(el, contextNode);
    if (cssSelector && cssSelector.length < 100) {
      return {type: 'CSS', locator: cssSelector, reason: 'Generated CSS selector'};
    }

    // 9. XPath as fallback within context
    const xpathSelector = getXPath(el, contextNode);
    if (xpathSelector && xpathSelector.length < 150) {
      return {type: 'XPath', locator: xpathSelector, reason: 'Generated XPath'};
    }

    // Final fallback to CSS even if long
    return {type: 'CSS', locator: cssSelector || el.tagName.toLowerCase(), reason: 'Fallback CSS'};
  }

  // #FUNCTION: getUniqueCssSelector - Enhanced for Shadow DOM context
  // #DESCRIPTION: Unique CSS Selector Generator with context awareness
  function getUniqueCssSelector(el, contextNode = document) {
    // Helper function to check if ID contains special CSS characters
    function hasSpecialCssChars(id) {
      return /[.()[\]{}+~>,:;#@$%^&*=!|\\/"'`\s]/.test(id);
    }
    
    if (el.id) {
      // Check if ID is unique within the context
      const sameIdElements = contextNode.querySelectorAll ? 
        contextNode.querySelectorAll(`[id="${el.id}"]`) : [];
      if (sameIdElements.length === 1) {
        // Use attribute selector for complex IDs with special characters
        if (hasSpecialCssChars(el.id)) {
          return `[id="${el.id}"]`;
        }
        return `#${el.id}`;
      }
    }
    
    const parts = [];
    let current = el;
    
    while (current && current !== contextNode && current !== document.body) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id && contextNode.querySelectorAll) {
        const sameIdInContext = contextNode.querySelectorAll(`[id="${current.id}"]`);
        if (sameIdInContext.length === 1) {
          // Use attribute selector for complex IDs with special characters
          if (hasSpecialCssChars(current.id)) {
            selector = `[id="${current.id}"]`;
          } else {
            selector += `#${current.id}`;
          }
          parts.unshift(selector);
          break;
        }
      }
      
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.split(' ')
          .filter(c => c.trim() && !c.startsWith('ai-extractor-'));
        if (classes.length > 0) {
          selector += '.' + classes.map(c => CSS.escape(c)).join('.');
        }
      }
      
      // Add nth-child if needed for uniqueness within context
      const siblings = Array.from(current.parentNode?.children || [])
        .filter(child => child.tagName === current.tagName);
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-child(${index})`;
      }
      
      parts.unshift(selector);
      current = current.parentElement;
      
      if (parts.length > 5) break; // Limit depth for performance
    }
    
    return parts.join(' > ');
  }

  // #FUNCTION: getXPath - Enhanced for Shadow DOM context
  // #DESCRIPTION: Generate XPath relative to context node (document or shadowRoot)
  function getXPath(el, contextNode = document) {
    if (el.id) {
      // Check if ID is unique within the context
      const sameIdElements = contextNode.querySelectorAll ? 
        contextNode.querySelectorAll(`[id="${el.id}"]`) : [];
      if (sameIdElements.length === 1) {
        return `//*[@id="${el.id}"]`;
      }
    }
    
    let path = [];
    let current = el;
    
    while (current && current !== contextNode && current.nodeType === Node.ELEMENT_NODE) {
      let idx = 1, sib = current.previousSibling;
      while (sib) {
        if (sib.nodeType === Node.ELEMENT_NODE && sib.nodeName === current.nodeName) idx++;
        sib = sib.previousSibling;
      }
      path.unshift(current.nodeName.toLowerCase() + `[${idx}]`);
      current = current.parentNode;
      
      if (path.length > 8) break; // Limit depth for performance
    }
    
    return '/' + path.join('/');
  }

  function getElementDisplayName(el) {
    return (
      el.getAttribute('aria-label') ||
      el.getAttribute('alt') ||
      el.getAttribute('placeholder') ||
      (el.innerText ? el.innerText.trim().replace(/\s+/g, ' ').slice(0, 40) : el.tagName.toLowerCase())
    );
  }

  function getElementTypeName(el) {
    if (el.matches('a')) return 'LINK';
    if (el.matches("button,input[type='button'],input[type='submit']")) return 'BTN';
    if (el.matches('input,select,textarea')) return 'INPUT';
    if (el.matches("select,[role='combobox']")) return 'COMBO';
    if (el.matches("input[type='text'],input[type='search'],input[type='email'],input[type='url'],input[type='password']")) return 'TXT';
    if (el.matches("input[type='checkbox']")) return 'CHK';
    if (el.matches("input[type='radio']")) return 'RADIO';
    if (el.matches('ul,ol,li,dl,dt,dd')) return 'LIST';
    if (el.matches('form')) return 'FORM';
    if (el.matches('img')) return 'IMG';
    if (el.matches('iframe')) return 'IFRAME';
    if (el.tagName && el.tagName.includes('-')) return 'CUSTOM';
    return el.tagName;
  }

  // #FUNCTION: _extractElementsRecursive - Core recursive Shadow DOM extraction
  // #DESCRIPTION: Recursively extracts elements from a given node (document or shadowRoot)
  // #IMPORTANT: This is the heart of Shadow DOM traversal - handles nested shadow roots
  function _extractElementsRecursive(contextNode, isShadowContext, currentHostPathArray) {
    let collectedData = [];
    let currentElementsProcessed = 0;
    const perContextLimit = 1000; // Prevent runaway recursion

    // #NOTE: Use broad selector to find all elements, including potential shadow hosts
    let baseSelectorsString = '*';
    if (filters.selectedTypes.length > 0 && !filters.selectedTypes.includes('filterCustom')) {
      const allCheckbox = document.getElementById && document.getElementById('filterAll');
      if (!allCheckbox || !allCheckbox.checked) {
        baseSelectorsString = filters.selectedTypes.map(typeId => {
          return typeToSelector[typeId] || '*';
        }).filter(s => s).join(',');
      }
    }
    if (!baseSelectorsString) baseSelectorsString = '*';

    let elementsToScan = [];
    try {
      elementsToScan = Array.from(contextNode.querySelectorAll(baseSelectorsString));
    } catch (e) {
      console.warn(`Element AI Extractor: Could not query elements in context:`, contextNode, e);
      return collectedData;
    }

    // #SECTION: Process each element in current context
    for (let el of elementsToScan) {
      if (currentElementsProcessed >= perContextLimit && !el.shadowRoot) {
        // Skip if limit reached unless it's a shadow host
        continue;
      }

      // #NOTE: Apply type filters after broad selection to ensure we find shadow hosts
      const elementType = getElementTypeName(el);
      const matchesTypeFilter = filters.selectedTypes.length === 0 || 
        filters.selectedTypes.some(typeId => {
          const typeInfo = typeToSelector[typeId];
          return typeInfo && el.matches(typeInfo);
        });

      let shouldAddCurrentElement = true;
      if (filters.selectedTypes.length > 0) {
        const allCheckbox = document.getElementById && document.getElementById('filterAll');
        const customSelected = filters.selectedTypes.includes('filterCustom');
        if (!allCheckbox?.checked && !customSelected && !matchesTypeFilter) {
          shouldAddCurrentElement = false;
        }
      }

      // #NOTE: Apply visibility filters only if we plan to add the element
      if (shouldAddCurrentElement) {
        if (filters.visibleOnly && !isVisible(el)) continue;
        if (filters.hiddenOnly && isVisible(el)) continue;

        currentElementsProcessed++;

        // #SECTION: Generate locators within current context
        let localId = el.id || '';
        let localCssSelector = getUniqueCssSelector(el, contextNode);
        let localXPath = getXPath(el, contextNode);
        let bestLocatorInfo = getBestLocator(el, contextNode);

        // #SECTION: Build final locators for Shadow DOM elements
        let finalCssSelector = localCssSelector;
        let finalXPath = localXPath; // Keep local for display
        let finalBestLocator = bestLocatorInfo.locator;
        let hostPathString = isShadowContext ? currentHostPathArray.join(' >> ') : '';

        // #IMPORTANT: Prefix locators with shadow host path for elements in shadow DOM
        if (isShadowContext && hostPathString) {
          finalCssSelector = `${hostPathString} >> ${localCssSelector}`;
          // Prefix best locator if it's a CSS-type locator
          if (['ID', 'data-testid', 'data-qa', 'data-cy', 'aria-label', 'role', 'class', 'CSS'].includes(bestLocatorInfo.type)) {
            finalBestLocator = `${hostPathString} >> ${bestLocatorInfo.locator}`;
          }
        }

        let displayName = getElementDisplayName(el);

        // #SECTION: Add element data to collection
        collectedData.push({
          'Element Name': displayName,
          'Element Type': elementType,
          'Best Locator': finalBestLocator,
          'Locator Type': bestLocatorInfo.type,
          'Strength': getLocatorStrength(el, bestLocatorInfo.locator, bestLocatorInfo.type),
          'ID': localId,
          'CSS': finalCssSelector,
          'XPATH': localXPath, // Store local XPath for debugging
          'In Shadow DOM': isShadowContext ? 'Yes' : '',
          'Host Element Path': hostPathString
        });
      }

      // #SECTION: Recursion for Shadow Hosts
      // #IMPORTANT: Always recurse into shadow roots if shadowDOM filter is active
      if (el.shadowRoot && filters.shadowDOM) {
        try {
          // #NOTE: Generate robust selector for shadow host within current context
          let selectorForHostInPath;
          const hostBestLocator = getBestLocator(el, contextNode);
          
          if (hostBestLocator.type === 'ID') {
            selectorForHostInPath = hostBestLocator.locator;
          } else {
            selectorForHostInPath = getUniqueCssSelector(el, contextNode);
          }
          
          const newHostPath = [...currentHostPathArray, selectorForHostInPath];
          
          // #NOTE: Recursive call to extract from shadow root
          const shadowData = _extractElementsRecursive(el.shadowRoot, true, newHostPath);
          collectedData = collectedData.concat(shadowData);
        } catch (e) {
          console.warn('Element AI Extractor: Error processing shadow root:', e);
        }
      }
    }

    return collectedData;
  }

  // #FUNCTION: getLocatorStrength - Calculate reliability score for locators
  // #DESCRIPTION: Returns strength score (1-100) based on locator type and characteristics
  function getLocatorStrength(el, locator, type) {
    let score = 50; // Base score
    
    // ID locators are strongest
    if (type === 'ID') score = 95;
    
    // Test attributes are very strong
    else if (['data-testid', 'data-qa', 'data-cy'].includes(type)) score = 90;
    
    // ULTIMATE scoring system for navigation locators
    else if (type === 'class+href') score = 92; // HIGHEST for navigation elements
    
    // Accessibility attributes are strong
    else if (['aria-label', 'aria-labelledby'].includes(type)) score = 85;
    
    // Href attributes for links are reliable but lower than class+href
    else if (type === 'href') score = 78;
    
    // Role attributes are good
    else if (type === 'role') score = 75;
    
    // Single class is decent
    else if (type === 'class') score = 65;
    
    // Name attribute is reliable for forms
    else if (type === 'name') score = 70;
    
    // Text-based selectors are fragile
    else if (type === 'text') score = 40;
    
    // CSS selectors depend on complexity
    else if (type === 'CSS') {
      const selectorParts = locator.split(' > ').length;
      score = Math.max(20, 60 - (selectorParts * 5));
    }
    
    // XPath is usually complex and fragile
    else if (type === 'XPath') score = 25;
    
    return Math.min(100, Math.max(10, score));
  }

  // #SECTION: Main Extraction Logic with Shadow DOM Support
  // #IMPORTANT: Now uses recursive extraction to handle nested Shadow DOMs
  try {
    let allExtractedData = _extractElementsRecursive(document, false, []);
    
    // #NOTE: Apply overall limit after collecting all elements
    const maxResultsLimit = 2000;
    if (allExtractedData.length > maxResultsLimit) {
      allExtractedData = allExtractedData.slice(0, maxResultsLimit);
    }
    
    return allExtractedData;
  } catch (error) {
    console.error('Element AI Extractor: Error during extraction:', error);
    
    // #NOTE: Fallback to basic extraction if recursive fails
    let selectorsString = filters.selectedTypes.map(type => typeToSelector[type] || '*').join(',');
    let domElements = [];
    try {
      domElements = Array.from(document.querySelectorAll(selectorsString));
    } catch (e) {
      domElements = Array.from(document.querySelectorAll('*'));
    }
    domElements = domElements.slice(0, 2000);

    let data = [];
    for (let el of domElements) {
      if (filters.visibleOnly && !isVisible(el)) continue;
      if (filters.hiddenOnly && isVisible(el)) continue;

      let best = getBestLocator(el);
      let strength = getLocatorStrength(el, best.locator, best.type);

      data.push({
        'Element Name': getElementDisplayName(el),
        'Element Type': getElementTypeName(el),
        'Best Locator': best.locator,
        'Locator Type': best.type,
        'Strength': strength,
        'ID': el.id || '',
        'CSS': getUniqueCssSelector(el),
        'XPATH': getXPath(el),
        'In Shadow DOM': el.getRootNode() instanceof ShadowRoot ? 'Yes' : '',
        'Host Element Path': ''
      });
    }
    return data;
  }
}

// function domExtractionFunction(filters) {
//   // --- Map filters to selectors
//   const typeToSelector = {
//     filterLinks: 'a',
//     filterButtons: "button,input[type='button'],input[type='submit']",
//     filterInputs: 'input,select,textarea',
//     filterCombo: "select,[role='combobox']",
//     filterHeaders: 'h1,h2,h3,h4,h5,h6',
//     filterTextboxes: "input[type='text'],input[type='search'],input[type='email'],input[type='url'],input[type='password']",
//     filterCheckboxes: "input[type='checkbox']",
//     filterRadios: "input[type='radio']",
//     filterLists: 'ul,ol,li,dl,dt,dd',
//     filterForms: 'form',
//     filterSVG: 'svg',
//     filterTables: 'table,thead,tbody,tr,td,th',
//     filterSpans: 'span',
//     filterDivs: 'div',
//     filterCustom: '*'
//   };

//   /**
//    * Checks if an element is visible in the page.
//    * @param {HTMLElement} el
//    * @returns {boolean}
//    */
//   function isVisible(el) {
//     const style = window.getComputedStyle(el);
//     return style && style.display !== 'none' && style.visibility !== 'hidden' && el.offsetParent !== null;
//   }

//   /**
//    * Generates a unique CSS selector for the element.
//    * @param {HTMLElement} el
//    * @returns {string}
//    */
//   function getUniqueCssSelector(el) {
//     if (el.id) return `#${el.id}`;
//     let path = [],
//       parent;
//     while (el.nodeType === Node.ELEMENT_NODE) {
//       let selector = el.nodeName.toLowerCase();
//       if (el.className) selector += '.' + [...el.classList].join('.');
//       parent = el.parentNode;
//       let siblings = parent ? [...parent.children].filter(e => e.nodeName === el.nodeName) : [];
//       if (siblings.length > 1) selector += `:nth-child(${[...parent.children].indexOf(el) + 1})`;
//       path.unshift(selector);
//       el = parent;
//       if (!el || el === document.body) break;
//     }
//     return path.join(' > ');
//   }

//   /**
//    * Generates XPath for the element.
//    * @param {HTMLElement} el
//    * @returns {string}
//    */
//   function getXPath(el) {
//     if (el.id) return `//*[@id="${el.id}"]`;
//     let path = [];
//     while (el && el.nodeType === Node.ELEMENT_NODE) {
//       let idx = 1,
//         sib = el.previousSibling;
//       while (sib) {
//         if (sib.nodeType === Node.ELEMENT_NODE && sib.nodeName === el.nodeName) idx++;
//         sib = sib.previousSibling;
//       }
//       path.unshift(el.nodeName.toLowerCase() + '[' + idx + ']');
//       el = el.parentNode;
//     }
//     return '/' + path.join('/');
//   }

//   /**
//    * Picks best locator: ID > name > CSS > XPath
//    * @param {HTMLElement} el
//    * @returns {{type: string, locator: string}}
//    */
//   function getBestLocatorStrategy(el) {
//     if (el.id) return {type: 'ID', locator: `#${el.id}`};
//     if (el.getAttribute('name')) return {type: 'Name', locator: `[name="${el.getAttribute('name')}"]`};
//     if (el.className) return {type: 'CSS', locator: getUniqueCssSelector(el)};
//     return {type: 'XPath', locator: getXPath(el)};
//   }

//   /**
//    * Returns user-friendly display name for the element.
//    * @param {HTMLElement} el
//    * @returns {string}
//    */
//   function getElementDisplayName(el) {
//     return el.getAttribute('aria-label') || el.getAttribute('alt') || el.getAttribute('placeholder') || (el.innerText ? el.innerText.trim().replace(/\s+/g, ' ').slice(0, 40) : el.tagName.toLowerCase());
//   }

//   /**
//    * Human-readable element type for badges.
//    * @param {HTMLElement} el
//    * @returns {string}
//    */
//   function getElementTypeName(el) {
//     if (el.matches('a')) return 'LINK';
//     if (el.matches("button,input[type='button'],input[type='submit']")) return 'BTN';
//     if (el.matches('input,select,textarea')) return 'INPUT';
//     if (el.matches("select,[role='combobox']")) return 'COMBO';
//     if (el.matches('h1,h2,h3,h4,h5,h6')) return 'HDR';
//     if (el.matches("input[type='text'],input[type='search'],input[type='email'],input[type='url'],input[type='password']")) return 'TXT';
//     if (el.matches("input[type='checkbox']")) return 'CHK';
//     if (el.matches("input[type='radio']")) return 'RADIO';
//     if (el.matches('ul,ol,li,dl,dt,dd')) return 'LIST';
//     if (el.matches('form')) return 'FORM';
//     if (el.matches('svg')) return 'SVG';
//     if (el.matches('table,thead,tbody,tr,td,th')) return 'TABLE';
//     if (el.matches('span')) return 'SPAN';
//     if (el.matches('div')) return 'DIV';
//     if (el.tagName && el.tagName.includes('-')) return 'CUSTOM';
//     return el.tagName;
//   }

//   // ---- Main extraction ----
//   // Compose selectors string for all selected types
//   let selectorsString = filters.selectedTypes.map(type => typeToSelector[type] || '*').join(',');
//   let domElements = [];
//   try {
//     domElements = Array.from(document.querySelectorAll(selectorsString));
//   } catch (e) {
//     domElements = Array.from(document.querySelectorAll('*'));
//   }
//   domElements = domElements.slice(0, 2000); // Performance safety

//   let data = [];
//   for (let el of domElements) {
//     if (filters.visibleOnly && !isVisible(el)) continue;
//     if (filters.hiddenOnly && isVisible(el)) continue;
//     let displayName = getElementDisplayName(el);
//     let id = el.id || '';
//     let cssSelector = getUniqueCssSelector(el);
//     let xpath = getXPath(el);
//     let bestLocator = getBestLocatorStrategy(el);
//     let elementType = getElementTypeName(el);
//     data.push({
//       'Element Name': displayName,
//       'Element Type': elementType,
//       'Best Locator': bestLocator.locator,
//       ID: id,
//       CSS: cssSelector,
//       XPATH: xpath,
//       'In Shadow DOM': '' // Shadow DOM feature could be added here later
//     });
//   }
//   return data;
// }



// ---- RENDER: Table of elements (Preview) ----


//TODO: ---
function renderElementsTable(data) {
  // Store original data if this is a new dataset
  if (JSON.stringify(data) !== JSON.stringify(allOriginalData)) {
    allOriginalData = [...data]; // Create a copy to avoid reference issues
  }
  
  const search = document.getElementById('search').value;
  let filteredData = data.filter(row => nameMatchesSearch(row['Element Name'], search));
  
  // Store filtered data for reference
  currentFilteredData = [...filteredData]; // Create a copy to avoid reference issues
  
  // Update stats display
  updateStatsDisplay(data);
  
  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Ensure current page is valid
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  if (currentPage < 1) {
    currentPage = 1;
  }
  
  // Calculate which items to show
  let startIndex, endIndex;
  if (showAllMode) {
    startIndex = 0;
    endIndex = totalItems;
  } else {
    startIndex = (currentPage - 1) * itemsPerPage;
    endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  }
  
  const itemsToShow = filteredData.slice(startIndex, endIndex);
  
  // Build table HTML
  let previewHTML = '';
  if (showAllMode) {
    previewHTML = `<b>Showing all ${totalItems} elements:</b>`;
  } else {
    previewHTML = `<b>Preview (${startIndex + 1}-${endIndex} of ${totalItems}):</b>`;
  }
  
  previewHTML += `
    <table><tr>
    <th>Name</th>
    <th>Type</th>
    <th>Best</th>
    <th>Strength</th>
    <th>ID</th>
    <th>CSS</th>
    <th>XPATH</th>
    <th>Shadow</th>
    <th>Host Path</th>
    <th>Copy</th>
    <th>Highlight</th></tr>`;
    
  for (let i = 0; i < itemsToShow.length; i++) {
    let r = itemsToShow[i];
    const isInShadow = r['In Shadow DOM'] === 'Yes';
    const hostPath = r['Host Element Path'] || '';
    
    previewHTML += `<tr>
      <td title="${r['Element Name']}">${r['Element Name']}</td>
      <td><span class="el-badge">${r['Element Type']}</span></td>
      <td title="${r['Best Locator']}">${r['Best Locator']}</td>
      <td><span class="strength-badge strength-${getStrengthClass(r['Strength'])}">${r['Strength']}%</span></td>
      <td title="${r['ID']}">${r['ID']}</td>
      <td title="${r['CSS']}">${r['CSS']}</td>
      <td title="${r['XPATH']}">${r['XPATH']}</td>
      <td>${isInShadow ? `<span class="shadow-badge" title="Host Path: ${hostPath}">Shadow</span>` : ''}</td>
      <td title="${hostPath}" class="host-path">${hostPath ? hostPath.substring(0, 30) + (hostPath.length > 30 ? '...' : '') : ''}</td>
      <td><button class="copy-btn" data-copy="${encodeURIComponent(r['Best Locator'])}" title="Copy to clipboard">📋</button></td>
      <td><button class="hl-btn" data-hl="${encodeURIComponent(r['Best Locator'])}" data-shadow="${isInShadow ? '1' : '0'}" title="Highlight element">👁️</button></td>
    </tr>`;
  }
  previewHTML += '</table>';
  document.getElementById('preview').innerHTML = previewHTML;
  
  // Update pagination controls
  updatePaginationControls(totalItems, totalPages);
  
  setTimeout(() => bindTablePreviewButtons(), 100);
}

// ---- UPDATE: Pagination Controls ----
function updatePaginationControls(totalItems, totalPages) {
  const paginationControls = document.getElementById('paginationControls');
  const currentPageSpan = document.getElementById('currentPage');
  const totalPagesSpan = document.getElementById('totalPages');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const showAllBtn = document.getElementById('showAllBtn');
  
  if (totalItems <= itemsPerPage && !showAllMode) {
    // Hide pagination if all items fit on one page
    paginationControls.style.display = 'none';
    return;
  }
  
  // Show pagination controls
  paginationControls.style.display = 'flex';
  
  if (showAllMode) {
    currentPageSpan.textContent = 'All';
    totalPagesSpan.textContent = 'All';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
    showAllBtn.textContent = 'Show Pages';
    showAllBtn.title = 'Show paginated view';
    showAllBtn.classList.add('active');
  } else {
    currentPageSpan.textContent = currentPage;
    totalPagesSpan.textContent = totalPages;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;
    showAllBtn.textContent = 'Show All';
    showAllBtn.title = 'Show all elements';
    showAllBtn.classList.remove('active');
  }
}

// ---- PAGINATION: Reset to first page ----
function resetToFirstPage() {
  currentPage = 1;
  showAllMode = false;
  const showAllBtn = document.getElementById('showAllBtn');
  if (showAllBtn) {
    showAllBtn.textContent = 'Show All';
    showAllBtn.classList.remove('active');
  }
}

// ---- BIND: Copy/Highlight buttons in preview ----
function bindTablePreviewButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.onclick = e => {
      let text = decodeURIComponent(e.target.getAttribute('data-copy') || '');
      copyLocatorToClipboard(text);
      btn.textContent = '✅';
      setTimeout(() => (btn.textContent = '📋'), 600);
    };
  });
  document.querySelectorAll('.hl-btn').forEach(btn => {
    btn.onclick = async e => {
      let locator = decodeURIComponent(e.target.getAttribute('data-hl') || '');
      let inShadow = e.target.getAttribute('data-shadow') === '1';
      const {tabId} = await getCurrentTabInfo();
      highlightElementOnTab(tabId, locator, inShadow);
      btn.textContent = '✨';
      setTimeout(() => (btn.textContent = '👁️'), 600);
    };
  });
}

// ---- SEARCH Filter ----
document.getElementById('search').oninput = function () {
  // Reset to first page when searching
  resetToFirstPage();
  
  // Re-render table with current search term using the original data
  if (allOriginalData.length > 0) {
    renderElementsTable(allOriginalData);
  }
};

// ---- CLEAR SEARCH Button ----
document.getElementById('clearSearch').onclick = function () {
  const searchBox = document.getElementById('search');
  searchBox.value = '';
  searchBox.focus();
  
  // Reset pagination when clearing search
  resetToFirstPage();
  
  // Trigger search filter to show all rows again
  let tableRows = document.querySelectorAll('#preview table tr');
  tableRows.forEach((row, idx) => {
    if (idx == 0) return; // header
    row.style.display = '';
  });
  
  // Re-render if we have data using original data
  if (allOriginalData.length > 0) {
    renderElementsTable(allOriginalData);
  }
};

// Pagination event handlers are defined at the bottom of the file using addEventListener

// Show All button handler is defined at the bottom of the file using addEventListener

// ---- Update Stats Display ----
function updateStatsDisplay(elementList) {
  const totalElements = elementList.length;
  const visibleElements = elementList.filter(el => !el['In Shadow DOM']).length;
  const hiddenElements = totalElements - visibleElements;
  
  document.getElementById('elementCount').textContent = `${totalElements} elements found`;
  document.getElementById('visibilityStats').textContent = `${visibleElements} visible • ${hiddenElements} hidden`;
}

// ---- Quick Actions Event Handlers ----
document.getElementById('selectAll').onclick = () => {
  document.getElementById('filterAll').checked = true;
  elementTypeList.forEach(type => {
    document.getElementById(type.id).checked = true;
  });
};

document.getElementById('selectInteractive').onclick = () => {
  // Uncheck all first
  document.getElementById('filterAll').checked = false;
  elementTypeList.forEach(type => {
    document.getElementById(type.id).checked = false;
  });
  
  // Check only interactive elements
  ['filterLinks', 'filterButtons', 'filterInputs', 'filterTextboxes', 
   'filterCheckboxes', 'filterRadios', 'filterCombo'].forEach(id => {
    const checkbox = document.getElementById(id);
    if (checkbox) checkbox.checked = true;
  });
};

document.getElementById('clearFilters').onclick = () => {
  document.getElementById('filterAll').checked = false;
  elementTypeList.forEach(type => {
    document.getElementById(type.id).checked = false;
  });
  document.getElementById('search').value = '';
  document.getElementById('preview').innerHTML = '';
  document.getElementById('status').textContent = 'Filters cleared.';
};

document.getElementById('refreshExtraction').onclick = () => {
  document.getElementById('extract').click();
};

// ---- On load: auto-check all types if "All Elements" is checked ----
if (document.getElementById('filterAll').checked) {
  elementTypeList.forEach(type => {
    document.getElementById(type.id).checked = true;
  });
}

// ---- Get Strength CSS Class ----
function getStrengthClass(strength) {
  if (strength >= 80) return 'high';
  if (strength >= 50) return 'medium';
  return 'low';
}

// ---- Pagination Functions ----
function resetToFirstPage() {
  currentPage = 1;
  showAllMode = false;
}

// ---- Pagination Event Handlers ----
document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentPage > 1 && !showAllMode) {
    currentPage--;
    if (allOriginalData.length > 0) {
      renderElementsTable(allOriginalData);
    }
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  const search = document.getElementById('search').value;
  const filteredData = allOriginalData.filter(row => nameMatchesSearch(row['Element Name'], search));
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  
  if (currentPage < totalPages && !showAllMode) {
    currentPage++;
    if (allOriginalData.length > 0) {
      renderElementsTable(allOriginalData);
    }
  }
});

document.getElementById('showAllBtn').addEventListener('click', () => {
  showAllMode = !showAllMode;
  const btn = document.getElementById('showAllBtn');
  
  if (showAllMode) {
    btn.textContent = 'Show Pages';
    btn.classList.add('active');
  } else {
    btn.textContent = 'Show All';
    btn.classList.remove('active');
    currentPage = 1;
  }
  
  // Always use allOriginalData to ensure consistent behavior
  if (allOriginalData.length > 0) {
    renderElementsTable(allOriginalData);
  }
});

// ---- Element Inspector Event Handlers ----
document.addEventListener('DOMContentLoaded', () => {
  // Inspector button event handler
  const inspectElementBtn = document.getElementById('inspectElement');
  const inspectedElementDetailsDiv = document.getElementById('inspected-element-details');
  const inspectorStatusDiv = document.getElementById('inspector-status');

  // Load inspection state from storage when popup opens
  chrome.storage.local.get(['isInspecting'], (result) => {
    if (result.isInspecting) {
      isInspectingGlobal = true;
      inspectElementBtn.classList.add('inspecting');
      inspectElementBtn.textContent = '🔴 Stop Inspecting';
      inspectorStatusDiv.textContent = '🔬 Inspect Mode: Click an element on the page.';
    }
  });

  if (inspectElementBtn) {
    inspectElementBtn.addEventListener('click', async () => {
      const tabInfo = await getCurrentTabInfo();
      if (!tabInfo || tabInfo.tabId === null) {
        inspectorStatusDiv.textContent = '❌ Error: No active tab found.';
        return;
      }

      // Check if the current page is restricted
      if (tabInfo.isRestricted) {
        inspectorStatusDiv.textContent = '❌ Error: Cannot inspect elements on this page (restricted URL).';
        return;
      }

      isInspectingGlobal = !isInspectingGlobal; // Toggle inspect mode

      if (isInspectingGlobal) {
        // Save inspection state to storage
        chrome.storage.local.set({ isInspecting: true });
        
        inspectorStatusDiv.textContent = '🔬 Inspect Mode: Click an element on the page.';
        inspectElementBtn.classList.add('inspecting');
        inspectElementBtn.textContent = '🔴 Stop Inspecting';
        inspectedElementDetailsDiv.style.display = 'none'; // Hide previous details
        inspectedElementDetailsDiv.innerHTML = ''; // Clear previous details

        // BULLETPROOF APPROACH: Always ensure content script is loaded and ready
        console.log("Element AI Extractor: Ensuring content script is loaded and ready...");
        inspectorStatusDiv.textContent = '🔄 Initializing...';
        
        // Always inject and wait for content script to be ready
        ensureContentScriptReady(tabInfo.tabId);
      } else {
        // Clear inspection state from storage FIRST
        chrome.storage.local.set({ isInspecting: false });
        
        // Update UI immediately
        isInspectingGlobal = false;
        inspectorStatusDiv.textContent = 'Inspection stopped.';
        inspectElementBtn.classList.remove('inspecting');
        inspectElementBtn.textContent = '🔬 Inspect Element';
        
        // Clear any displayed element details
        inspectedElementDetailsDiv.style.display = 'none';
        inspectedElementDetailsDiv.innerHTML = '';
        
        // Send message to content script to stop inspecting
        chrome.tabs.sendMessage(tabInfo.tabId, {
          action: "stopInspectingAiExtractor"
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.warn("Element AI Extractor: Error sending stopInspecting message or content script already inactive.", chrome.runtime.lastError.message);
          } else {
            console.log("Element AI Extractor: Successfully sent stop inspection message to content script");
          }
        });
      }
    });
  }

  // Robust content script connection testing with multiple strategies
  // BULLETPROOF content script initialization - this WILL work
  async function ensureContentScriptReady(tabId) {
    const maxAttempts = 3;
    const inspectorStatusDiv = document.getElementById('inspector-status');
    
    console.log("Element AI Extractor: Starting bulletproof content script initialization");
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Element AI Extractor: Initialization attempt ${attempt}/${maxAttempts}`);
      inspectorStatusDiv.textContent = `🔄 Initializing (${attempt}/${maxAttempts})...`;
      
      try {
        // Step 1: Always inject the content script (this handles refresh/reload cases)
        console.log("Element AI Extractor: Injecting content script...");
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['contentScript.js']
        });
        
        console.log("Element AI Extractor: Content script injected successfully");
        
        // Step 2: Wait for script initialization
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 3: Test communication with guaranteed response
        console.log("Element AI Extractor: Testing communication...");
        const isReady = await testCommunication(tabId);
        
        if (isReady) {
          console.log("Element AI Extractor: Content script is ready and responsive");
          inspectorStatusDiv.textContent = '✅ Ready! Starting inspection...';
          startInspectionDirectly(tabId);
          return; // Success!
        } else {
          console.warn(`Element AI Extractor: Attempt ${attempt} - Communication test failed`);
        }
        
      } catch (error) {
        console.error(`Element AI Extractor: Attempt ${attempt} failed:`, error);
      }
    }
    
    // If we get here, all attempts failed
    console.error("Element AI Extractor: All initialization attempts failed");
    inspectorStatusDiv.textContent = '❌ Failed to initialize. Please reload the page and try again.';
    resetInspectionState();
  }
  
  // Simple, reliable communication test
  function testCommunication(tabId) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn("Element AI Extractor: Communication test timed out");
        resolve(false);
      }, 3000);
      
      try {
        chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
          clearTimeout(timeout);
          
          if (chrome.runtime.lastError) {
            console.warn("Element AI Extractor: Communication test failed:", chrome.runtime.lastError.message);
            resolve(false);
          } else if (response && response.status === 'alive') {
            console.log("Element AI Extractor: Communication test successful:", response);
            resolve(true);
          } else {
            console.warn("Element AI Extractor: Invalid response:", response);
            resolve(false);
          }
        });
      } catch (error) {
        clearTimeout(timeout);
        console.error("Element AI Extractor: Communication test error:", error);
        resolve(false);
      }
    });
  }
    const maxAttempts = 3;
    const inspectorStatusDiv = document.getElementById('inspector-status');
    
    console.log(`Element AI Extractor: Connection attempt ${attemptNumber}/${maxAttempts}`);
    inspectorStatusDiv.textContent = `🔄 Testing connection (${attemptNumber}/${maxAttempts})...`;
    
    // First try: Quick ping test
    const quickPingPromise = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Quick ping timeout'));
      }, 1000);
      
      chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response && response.status === 'alive') {
          resolve(response);
        } else {
          reject(new Error('Invalid ping response'));
        }
      });
    });
    
    // Second try: Extended ping test (for slower pages)
    const extendedPingPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        const timeout = setTimeout(() => {
          reject(new Error('Extended ping timeout'));
        }, 2000);
        
        chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.status === 'alive') {
            resolve(response);
          } else {
            reject(new Error('Invalid extended ping response'));
          }
        });
      }, 500); // Wait 500ms before trying extended ping
    });
    
    // Try quick ping first
    quickPingPromise
      .then(response => {
        console.log("Element AI Extractor: Quick ping successful", response);
        inspectorStatusDiv.textContent = '✅ Connected! Starting inspection...';
        startInspectionDirectly(tabId);
      })
      .catch(quickError => {
        console.log("Element AI Extractor: Quick ping failed:", quickError.message);
        
        // Try extended ping
        extendedPingPromise
          .then(response => {
            console.log("Element AI Extractor: Extended ping successful", response);
            inspectorStatusDiv.textContent = '✅ Connected! Starting inspection...';
            startInspectionDirectly(tabId);
          })
          .catch(extendedError => {
            console.log("Element AI Extractor: Extended ping failed:", extendedError.message);
            
            // Check if it's a connection error
            if (extendedError.message.includes("Could not establish connection") || 
                extendedError.message.includes("Receiving end does not exist")) {
              
              if (attemptNumber < maxAttempts) {
                // Try to inject content script
                console.log("Element AI Extractor: Attempting content script injection...");
                inspectorStatusDiv.textContent = `🔄 Injecting content script (${attemptNumber}/${maxAttempts})...`;
                
                injectContentScriptSafely(tabId)
                  .then(() => {
                    // Wait for script to initialize, then retry connection
                    setTimeout(() => {
                      testContentScriptConnection(tabId, attemptNumber + 1);
                    }, 1500);
                  })
                  .catch(injectionError => {
                    console.error("Element AI Extractor: Injection failed:", injectionError);
                    if (attemptNumber < maxAttempts) {
                      // Retry after a delay
                      setTimeout(() => {
                        testContentScriptConnection(tabId, attemptNumber + 1);
                      }, 2000);
                    } else {
                      // Final failure
                      inspectorStatusDiv.textContent = '❌ Failed to establish connection. Please reload the page and try again.';
                      resetInspectionState();
                    }
                  });
              } else {
                // All attempts failed
                inspectorStatusDiv.textContent = '❌ Connection failed after multiple attempts. Please reload the page and try again.';
                resetInspectionState();
              }
            } else {
              // Different type of error
              console.error("Element AI Extractor: Unexpected connection error:", extendedError);
              inspectorStatusDiv.textContent = '❌ Connection error. Please check the page and try again.';
              resetInspectionState();
            }
          });
      });
  }

  // Safe content script injection with duplicate prevention
  function injectContentScriptSafely(tabId) {
    return new Promise((resolve, reject) => {
      // First check tab info
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(`Cannot access tab: ${chrome.runtime.lastError.message}`));
          return;
        }
        
        // Check if URL is restricted
        if (isRestrictedUrl(tab.url)) {
          reject(new Error(`Cannot inject on restricted URL: ${tab.url}`));
          return;
        }
        
        console.log("Element AI Extractor: Injecting content script into tab", {
          url: tab.url,
          title: tab.title.substring(0, 50),
          status: tab.status
        });
        
        // Inject the script
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['contentScript.js']
        })
        .then(() => {
          console.log("Element AI Extractor: Content script injection successful");
          resolve();
        })
        .catch((error) => {
          console.error("Element AI Extractor: Content script injection failed:", error);
          reject(error);
        });
      });
    });
  }

  // Helper function to inject content script with retries
  function injectContentScriptWithRetry(tabId, attemptsLeft) {
    const inspectorStatusDiv = document.getElementById('inspector-status');
    
    if (attemptsLeft <= 0) {
      console.error("Element AI Extractor: All injection attempts failed");
      inspectorStatusDiv.textContent = '❌ Error: Cannot inject content script after multiple attempts.';
      resetInspectionState();
      return;
    }

    console.log(`Element AI Extractor: Attempting content script injection (${4 - attemptsLeft}/3)`);
    inspectorStatusDiv.textContent = `🔄 Injecting content script (attempt ${4 - attemptsLeft}/3)...`;
    
    // First try to check current tab info and restrictions
    chrome.tabs.get(tabId, (tab) => {
      if (chrome.runtime.lastError) {
        console.error("Element AI Extractor: Cannot access tab:", chrome.runtime.lastError.message);
        inspectorStatusDiv.textContent = '❌ Error: Cannot access current tab.';
        resetInspectionState();
        return;
      }
      
      console.log("Element AI Extractor: Tab details for injection:", {
        url: tab.url,
        title: tab.title.substring(0, 50),
        status: tab.status
      });
      
      // Check if URL is restricted
      if (isRestrictedUrl(tab.url)) {
        console.warn("Element AI Extractor: Cannot inject on restricted URL:", tab.url);
        inspectorStatusDiv.textContent = '❌ Error: Cannot inspect elements on this page (restricted URL).';
        resetInspectionState();
        return;
      }
      
      // Try injection using file method
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['contentScript.js']
      }).then(() => {
        console.log("Element AI Extractor: Content script injection successful");
        inspectorStatusDiv.textContent = '🔄 Content script injected, initializing...';
        
        // Wait longer for script to initialize
        setTimeout(() => {
          // Test if the script is now responsive with timeout
          const timeoutId = setTimeout(() => {
            console.warn("Element AI Extractor: Ping timeout after injection");
            if (attemptsLeft > 1) {
              console.log("Element AI Extractor: Retrying injection...");
              setTimeout(() => {
                injectContentScriptWithRetry(tabId, attemptsLeft - 1);
              }, 500);
            } else {
              inspectorStatusDiv.textContent = '❌ Error: Content script not responding after injection.';
              resetInspectionState();
            }
          }, 2000); // 2 second timeout
          
          chrome.tabs.sendMessage(tabId, { action: "ping" }, (pingResponse) => {
            clearTimeout(timeoutId);
            
            if (chrome.runtime.lastError || !pingResponse) {
              console.warn("Element AI Extractor: Content script still not responsive after injection");
              console.log("Element AI Extractor: Ping error:", chrome.runtime.lastError?.message);
              console.log("Element AI Extractor: Ping response:", pingResponse);
              
              // Retry injection
              setTimeout(() => {
                injectContentScriptWithRetry(tabId, attemptsLeft - 1);
              }, 300);
            } else {
              console.log("Element AI Extractor: Content script is now responsive after injection", pingResponse);
              inspectorStatusDiv.textContent = '✅ Content script ready, starting inspection...';
              startInspectionAfterInjection(tabId);
            }
          });
        }, 750); // Increased wait time for initialization
      }).catch((error) => {
        console.error("Element AI Extractor: Content script injection failed:", error);
        
        // If file injection fails, check if script might already be loaded
        console.log("Element AI Extractor: File injection failed, checking if script already exists...");
        
        chrome.tabs.sendMessage(tabId, { action: "ping" }, (pingResponse) => {
          if (chrome.runtime.lastError || !pingResponse) {
            // Script truly not loaded, try again or fail
            if (attemptsLeft > 1) {
              console.log("Element AI Extractor: Retrying injection after failure...");
              setTimeout(() => {
                injectContentScriptWithRetry(tabId, attemptsLeft - 1);
              }, 500);
            } else {
              inspectorStatusDiv.textContent = '❌ Error: Cannot inject content script. Check page permissions.';
              resetInspectionState();
            }
          } else {
            // Script was already there, proceed
            console.log("Element AI Extractor: Content script was already present after injection failure");
            startInspectionAfterInjection(tabId);
          }
        });
      });
    });
  }

  // Helper function to start inspection directly (when content script is already loaded)
  function startInspectionDirectly(tabId) {
    const inspectorStatusDiv = document.getElementById('inspector-status');
    chrome.tabs.sendMessage(tabId, {
      action: "startInspectingAiExtractor"
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Element AI Extractor: Unexpected error during inspection start:", chrome.runtime.lastError.message);
        inspectorStatusDiv.textContent = '❌ Error: Failed to start inspection.';
        resetInspectionState();
      } else if (response && response.status === 'error') {
        console.warn("Element AI Extractor: Content script reported an error:", response.message);
        inspectorStatusDiv.textContent = `❌ Error: ${response.message}`;
        resetInspectionState();
      } else if (response && response.status === 'listening') {
        console.log("Element AI Extractor: Content script is now listening for inspection.");
        inspectorStatusDiv.textContent = '🔬 Inspect Mode: Click an element on the page.';
      }
    });
  }

  // Helper function to start inspection after manual injection
  function startInspectionAfterInjection(tabId) {
    const inspectorStatusDiv = document.getElementById('inspector-status');
    chrome.tabs.sendMessage(tabId, {
      action: "startInspectingAiExtractor"
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("Element AI Extractor: Still cannot connect after manual injection:", chrome.runtime.lastError.message);
        inspectorStatusDiv.textContent = '❌ Error: Cannot connect to page. Try reloading the page/extension.';
        resetInspectionState();
      } else if (response && response.status === 'listening') {
        console.log("Element AI Extractor: Content script is now listening after manual injection.");
        inspectorStatusDiv.textContent = '🔬 Inspect Mode: Click an element on the page.';
      } else if (response && response.status === 'error') {
        inspectorStatusDiv.textContent = `❌ Error: ${response.message}`;
        resetInspectionState();
      }
    });
  }

  // Helper function to reset inspection state
  function resetInspectionState() {
    isInspectingGlobal = false;
    // Clear inspection state from storage
    chrome.storage.local.set({ isInspecting: false });
    const inspectElementBtn = document.getElementById('inspectElement');
    inspectElementBtn.classList.remove('inspecting');
    inspectElementBtn.textContent = '🔬 Inspect Element';
  }

  // Note: We intentionally do NOT stop inspection when popup closes
  // This allows inspection to persist when popup closes automatically
  // Users must manually click "Stop Inspecting" to end inspection mode
});

// ---- Inspector Message Listener ----
// Listen for data sent back from contentScript.js after an element is inspected
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "inspectedElementDataAiExtractor") {
    console.log("Popup received inspected element data:", message.data);
    const inspectedElementDetailsDiv = document.getElementById('inspected-element-details');
    const inspectorStatusDiv = document.getElementById('inspector-status');
    const inspectElementBtn = document.getElementById('inspectElement');

    if (message.data) {
      // Display the inspected element details
      const data = message.data;
      const isInShadow = data['In Shadow DOM'] === 'Yes';
      
      inspectedElementDetailsDiv.innerHTML = `
        <h4>🔍 Inspected Element Details</h4>
        <table>
          <tr><td>Element Name:</td><td>${data['Element Name'] || 'N/A'}</td></tr>
          <tr><td>Element Type:</td><td><span class="el-badge">${data['Element Type'] || 'N/A'}</span></td></tr>
          <tr><td>Best Locator:</td><td title="${data['Best Locator'] || 'N/A'}">${data['Best Locator'] || 'N/A'}</td></tr>
          <tr><td>Locator Type:</td><td>${data['Locator Type'] || 'N/A'}</td></tr>
          <tr><td>Strength:</td><td><span class="strength-badge strength-${getStrengthClass(data['Strength'] || 50)}">${data['Strength'] || 'N/A'}%</span></td></tr>
          <tr><td>ID:</td><td title="${data['ID'] || 'N/A'}">${data['ID'] || 'N/A'}</td></tr>
          <tr><td>CSS Selector:</td><td title="${data['CSS'] || 'N/A'}">${data['CSS'] || 'N/A'}</td></tr>
          <tr><td>XPath:</td><td title="${data['XPATH'] || 'N/A'}">${data['XPATH'] || 'N/A'}</td></tr>
          <tr><td>In Shadow DOM:</td><td>${isInShadow ? '<span class="shadow-badge">Shadow</span>' : 'No'}</td></tr>
        </table>
        <div style="margin-top: 12px; display: flex; gap: 8px;">
          <button class="copy-btn" 
                  data-copy="${encodeURIComponent(data['Best Locator'] || '')}" 
                  title="Copy best locator to clipboard">📋 Copy</button>
          <button class="hl-btn" 
                  data-hl="${encodeURIComponent(data['Best Locator'] || '')}" 
                  data-shadow="${isInShadow ? '1' : '0'}"
                  title="Highlight element">👁️ Highlight</button>
        </div>`;
      
      inspectedElementDetailsDiv.style.display = 'block';
      requestAnimationFrame(() => bindTablePreviewButtons()); // Re-bind for these new buttons
      inspectorStatusDiv.textContent = '✅ Element Inspected! Click another element or Stop Inspecting.';
    } else {
      inspectorStatusDiv.textContent = '❌ Inspection did not return element data.';
    }

    // DON'T reset inspect mode - keep it active for continuous inspection
    // The user should manually click "Stop Inspecting" to exit
    // isInspectingGlobal = false;  // REMOVED
    // if (inspectElementBtn) {     // REMOVED
    //   inspectElementBtn.classList.remove('inspecting');  // REMOVED
    //   inspectElementBtn.textContent = '🔬 Inspect Element';  // REMOVED
    // }  // REMOVED
    
    sendResponse({status: "popupReceivedData"}); // Acknowledge receipt
    return true; // Keep listener open for async response
  }
  
  // Handle inspection stopped from floating badge
  if (message.action === "inspectionStoppedFromBadge") {
    console.log("Popup received inspection stopped from badge");
    const inspectElementBtn = document.getElementById('inspectElement');
    const inspectorStatusDiv = document.getElementById('inspector-status');
    const inspectedElementDetailsDiv = document.getElementById('inspected-element-details');
    
    // Update popup UI to reflect stopped state
    isInspectingGlobal = false;
    if (inspectElementBtn) {
      inspectElementBtn.classList.remove('inspecting');
      inspectElementBtn.textContent = '🔬 Inspect Element';
    }
    if (inspectorStatusDiv) {
      inspectorStatusDiv.textContent = 'Inspection stopped from page.';
    }
    if (inspectedElementDetailsDiv) {
      inspectedElementDetailsDiv.style.display = 'none';
      inspectedElementDetailsDiv.innerHTML = '';
    }
    
    sendResponse({status: "popupUpdated"});
    return true;
  }
});

// ---- Utility: Check for recent inspection data ----
async function checkForRecentInspectionData() {
  try {
    const result = await chrome.storage.local.get(['lastInspectedElement']);
    if (result.lastInspectedElement) {
      const inspectedData = result.lastInspectedElement;
      const timeDiff = Date.now() - inspectedData.timestamp;
      
      // Show data if it's less than 5 minutes old
      if (timeDiff < 5 * 60 * 1000) {
        console.log("Element AI Extractor: Found recent inspection data", inspectedData.data);
        displayInspectedElementData(inspectedData.data);
        
        // Update status to show this is recent data
        const inspectorStatusDiv = document.getElementById('inspector-status');
        if (inspectorStatusDiv) {
          inspectorStatusDiv.textContent = '✅ Recent inspection data loaded.';
        }
      } else {
        // Clear old data
        chrome.storage.local.remove(['lastInspectedElement']);
      }
    }
  } catch (error) {
    console.error("Element AI Extractor: Error checking inspection data:", error);
  }
}

// ---- Utility: Display inspected element data ----
function displayInspectedElementData(data) {
  const inspectedElementDetailsDiv = document.getElementById('inspected-element-details');
  if (!inspectedElementDetailsDiv || !data) return;
  
  const isInShadow = data['In Shadow DOM'] === 'Yes';
  const hostPath = data['Host Element Path'] || '';
  
  let shadowInfo = '';
  if (isInShadow) {
    shadowInfo = `<span class="shadow-badge" title="Host Path: ${hostPath}">Shadow</span>`;
    if (hostPath) {
      shadowInfo += `<br><small style="color: #ffe682;">Path: ${hostPath}</small>`;
    }
  } else {
    shadowInfo = 'No';
  }
  
  inspectedElementDetailsDiv.innerHTML = `
    <div class="inspected-header">
      <h4>🔍 Inspected Element Details</h4>
      <button class="details-close-btn" title="Close details">✕</button>
    </div>
    <table>
      <tr><td>Element Name:</td><td>${data['Element Name'] || 'N/A'}</td></tr>
      <tr><td>Element Type:</td><td><span class="el-badge">${data['Element Type'] || 'N/A'}</span></td></tr>
      <tr><td>Best Locator:</td><td title="${data['Best Locator'] || 'N/A'}">${data['Best Locator'] || 'N/A'}</td></tr>
      <tr><td>Locator Type:</td><td>${data['Locator Type'] || 'N/A'}</td></tr>
      <tr><td>Strength:</td><td><span class="strength-badge strength-${getStrengthClass(data['Strength'] || 50)}">${data['Strength'] || 'N/A'}%</span></td></tr>
      <tr><td>ID:</td><td title="${data['ID'] || 'N/A'}">${data['ID'] || 'N/A'}</td></tr>
      <tr><td>CSS Selector:</td><td title="${data['CSS'] || 'N/A'}">${data['CSS'] || 'N/A'}</td></tr>
      <tr><td>XPath:</td><td title="${data['XPATH'] || 'N/A'}">${data['XPATH'] || 'N/A'}</td></tr>
      <tr><td>In Shadow DOM:</td><td>${shadowInfo}</td></tr>
    </table>
    <div style="margin-top: 12px; display: flex; gap: 8px;">
      <button class="copy-btn" 
              data-copy="${encodeURIComponent(data['Best Locator'] || '')}" 
              title="Copy best locator to clipboard">📋 Copy</button>
      <button class="hl-btn" 
              data-hl="${encodeURIComponent(data['Best Locator'] || '')}" 
              data-shadow="${isInShadow ? '1' : '0'}"
              title="Highlight element">👁️ Highlight</button>
    </div>`;
  
  inspectedElementDetailsDiv.style.display = 'block';
  
  // Add close button event handler
  const closeBtn = inspectedElementDetailsDiv.querySelector('.details-close-btn');
  if (closeBtn) {
    closeBtn.onclick = () => {
      inspectedElementDetailsDiv.style.display = 'none';
    };
  }
  
  // Re-bind buttons
  requestAnimationFrame(() => bindTablePreviewButtons());
}

// ---- Storage Listener for Inspection Data ----
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.lastInspectedElement) {
    const newData = changes.lastInspectedElement.newValue;
    if (newData && newData.data) {
      console.log("Element AI Extractor: New inspection data detected", newData.data);
      displayInspectedElementData(newData.data);
      
      // Update status
      const inspectorStatusDiv = document.getElementById('inspector-status');
      if (inspectorStatusDiv && inspectorStatusDiv.textContent.includes('Inspect Mode')) {
        inspectorStatusDiv.textContent = '✅ Element Inspected! Click another element or Stop Inspecting.';
      }
    }
  }
});
