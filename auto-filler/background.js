chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'aiExtractorMenu',
    title: 'Extract elements with AI Extractor',
    contexts: ['all']
  });
  
  // Initialize storage state
  chrome.storage.local.set({ 
    isInspecting: false,
    playwrightEnabled: true,
    autoValidate: false
  });
  
  console.log('Element AI Extractor: Background script initialized with Playwright support');
});

// Playwright validation queue for batch processing
let validationQueue = new Map();
let isProcessingQueue = false;

// Enhanced message listener with Playwright validation support
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Element AI Extractor: Background received message:', message);
  console.log('Element AI Extractor: Message sender:', sender);
  
  if (message.action === 'contentScriptLoaded') {
    console.log('Element AI Extractor: Content script loaded in tab', sender.tab?.id, 'URL:', message.url);
    console.log('Element AI Extractor: Frame type:', message.frameType);
    sendResponse({ status: 'acknowledged', timestamp: Date.now() });
  }
  
  if (message.action === 'contentScriptReady') {
    console.log('Element AI Extractor: Content script ready in tab', sender.tab?.id, 'URL:', message.url);
    if (message.duplicate) {
      console.log('Element AI Extractor: This was a duplicate script load attempt');
    }
    sendResponse({ status: 'acknowledged', timestamp: Date.now() });
  }
  
  if (message.action === 'inspectionStoppedFromBadge') {
    console.log('Element AI Extractor: Inspection stopped from badge in tab', sender.tab?.id);
    sendResponse({ status: 'acknowledged' });
  }

  // Playwright validation requests
  if (message.action === 'validateWithPlaywright') {
    handlePlaywrightValidation(message, sender, sendResponse);
    return true; // Keep channel open for async response
  }

  if (message.action === 'batchValidateWithPlaywright') {
    handleBatchPlaywrightValidation(message, sender, sendResponse);
    return true; // Keep channel open for async response
  }

  if (message.action === 'getPlaywrightSettings') {
    chrome.storage.local.get(['playwrightEnabled', 'autoValidate'], (result) => {
      sendResponse({
        playwrightEnabled: result.playwrightEnabled !== false,
        autoValidate: result.autoValidate === true
      });
    });
    return true;
  }

  if (message.action === 'setPlaywrightSettings') {
    chrome.storage.local.set({
      playwrightEnabled: message.enabled,
      autoValidate: message.autoValidate
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  // Always return true to keep the message channel open
  return true;
});



chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'aiExtractorMenu') {
    // Inject content script and then send message
    chrome.scripting.executeScript({
      target: {tabId: tab.id},
      files: ['contentScript.js']
    }).then(() => {
      console.log('Element AI Extractor: Content script injected via context menu');
    }).catch(error => {
      console.error('Element AI Extractor: Failed to inject content script via context menu:', error);
    });
  }
});

// Handle extension icon click to ensure content script is available
chrome.action.onClicked.addListener((tab) => {
  // This will only fire if no popup is defined, but we have one
  // This is just a backup handler
  console.log('Element AI Extractor: Extension icon clicked');
});

// Handle tab changes - stop inspection if tab switches
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  chrome.storage.local.get(['isInspecting'], (result) => {
    if (result.isInspecting) {
      // Stop inspection in the previous tab if it was active
      chrome.tabs.query({ active: false, currentWindow: true }, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: "stopInspectingAiExtractor"
          }, () => {
            // Ignore errors - content script might not be loaded
            if (chrome.runtime.lastError) {
              console.log("Element AI Extractor: No content script in tab", tab.id);
            }
          });
        });
      });
    }
  });
});

// Playwright validation functions
async function handlePlaywrightValidation(message, sender, sendResponse) {
  try {
    const { locator, url, elementData } = message;
    console.log('Element AI Extractor: Starting Playwright validation for locator:', locator);
    
    // Simulate Playwright validation (in real implementation, this would call Node.js Playwright process)
    const validationResult = await simulatePlaywrightValidation(locator, url, elementData);
    
    sendResponse({
      success: true,
      result: validationResult
    });
  } catch (error) {
    console.error('Element AI Extractor: Playwright validation error:', error);
    sendResponse({
      success: false,
      error: error.message,
      result: {
        isValid: false,
        score: 0,
        grade: 'F',
        issues: ['Validation failed: ' + error.message],
        recommendations: ['Check Playwright setup and try again']
      }
    });
  }
}

async function handleBatchPlaywrightValidation(message, sender, sendResponse) {
  try {
    const { elements, url } = message;
    console.log('Element AI Extractor: Starting batch Playwright validation for', elements.length, 'elements');
    
    const results = [];
    const batchSize = 5; // Process in batches to avoid overwhelming
    
    for (let i = 0; i < elements.length; i += batchSize) {
      const batch = elements.slice(i, i + batchSize);
      const batchPromises = batch.map(async (element) => {
        try {
          const result = await simulatePlaywrightValidation(element.locator, url, element);
          return {
            elementIndex: element.index,
            locator: element.locator,
            result: result
          };
        } catch (error) {
          return {
            elementIndex: element.index,
            locator: element.locator,
            result: {
              isValid: false,
              score: 0,
              grade: 'F',
              issues: ['Validation failed: ' + error.message],
              recommendations: ['Check element and try again']
            }
          };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    sendResponse({
      success: true,
      results: results,
      totalProcessed: results.length
    });
  } catch (error) {
    console.error('Element AI Extractor: Batch Playwright validation error:', error);
    sendResponse({
      success: false,
      error: error.message,
      results: []
    });
  }
}

// Simulate Playwright validation (placeholder for real implementation)
async function simulatePlaywrightValidation(locator, url, elementData) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 200));
  
  // Calculate score based on locator quality heuristics
  let score = 50; // Base score
  const issues = [];
  const recommendations = [];
  
  // Analyze locator type and quality
  if (elementData.locatorType === 'ID' && elementData.id) {
    score += 25;
  } else if (elementData.locatorType === 'CSS' && locator.includes('[data-testid]')) {
    score += 20;
  } else if (elementData.locatorType === 'CSS' && locator.includes('[aria-label]')) {
    score += 15;
  } else if (elementData.locatorType === 'XPath' && locator.includes('text()')) {
    score += 10;
  }
  
  // Penalize complex selectors
  if (locator.length > 100) {
    score -= 10;
    issues.push('Locator is very long and may be fragile');
    recommendations.push('Try to find a shorter, more stable locator');
  }
  
  // Analyze selector stability
  if (locator.includes('nth-child') || locator.includes('nth-of-type')) {
    score -= 15;
    issues.push('Position-based selector may break when content changes');
    recommendations.push('Use ID, data attributes, or semantic selectors instead');
  }
  
  // Check for good practices
  if (elementData.elementType === 'Button' || elementData.elementType === 'Link') {
    score += 10; // Interactive elements are generally good for automation
  }
  
  // Simulate visibility and clickability checks
  const isVisible = Math.random() > 0.1; // 90% chance visible
  const isClickable = Math.random() > 0.2; // 80% chance clickable
  
  if (!isVisible) {
    score -= 20;
    issues.push('Element may not be visible');
    recommendations.push('Ensure element is visible before interacting');
  }
  
  if (!isClickable && (elementData.elementType === 'Button' || elementData.elementType === 'Link')) {
    score -= 15;
    issues.push('Interactive element may not be clickable');
    recommendations.push('Check for overlapping elements or CSS pointer-events');
  }
  
  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));
  
  // Calculate grade
  let grade;
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 60) grade = 'C';
  else if (score >= 50) grade = 'D';
  else grade = 'F';
  
  return {
    isValid: score >= 60,
    isVisible: isVisible,
    isClickable: isClickable,
    score: score,
    grade: grade,
    issues: issues,
    recommendations: recommendations,
    alternativeLocators: generateAlternativeLocators(locator, elementData),
    validationTime: new Date().toISOString()
  };
}

// Generate alternative locators suggestions
function generateAlternativeLocators(currentLocator, elementData) {
  const alternatives = [];
  
  // Suggest ID-based if available
  if (elementData.id && !currentLocator.includes('#' + elementData.id)) {
    alternatives.push({
      locator: '#' + elementData.id,
      type: 'CSS',
      confidence: 95,
      reason: 'ID-based selector (most stable)'
    });
  }
  
  // Suggest data-testid if element name suggests it
  if (elementData.elementName && !currentLocator.includes('data-testid')) {
    const testId = elementData.elementName.toLowerCase().replace(/\s+/g, '-');
    alternatives.push({
      locator: `[data-testid="${testId}"]`,
      type: 'CSS',
      confidence: 85,
      reason: 'Suggested test ID attribute'
    });
  }
  
  // Suggest text-based XPath for buttons/links
  if ((elementData.elementType === 'Button' || elementData.elementType === 'Link') && 
      elementData.elementName && !currentLocator.includes('text()')) {
    alternatives.push({
      locator: `//*[contains(text(), "${elementData.elementName}")]`,
      type: 'XPath',
      confidence: 70,
      reason: 'Text-based selection'
    });
  }
  
  // Suggest role-based selection
  if (elementData.elementType && !currentLocator.includes('[role=')) {
    const roleMap = {
      'Button': 'button',
      'Link': 'link',
      'Input': 'textbox',
      'Checkbox': 'checkbox',
      'Radio': 'radio'
    };
    
    const role = roleMap[elementData.elementType];
    if (role) {
      alternatives.push({
        locator: `[role="${role}"]`,
        type: 'CSS',
        confidence: 75,
        reason: 'Role-based selector (accessible)'
      });
    }
  }
  
  return alternatives.slice(0, 3); // Return top 3 alternatives
}
