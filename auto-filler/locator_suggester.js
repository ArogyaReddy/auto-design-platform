// ML Locator Suggester - Loaded and initializing
console.log('[ML Suggester] Script loading...');

/**
 * Analyzes element data and suggests locators based on a (future) ML model.
 * For now, this will return mock suggestions.
 *
 * @param {object} elementInfo - Information about the web element (e.g., tag, id, classes, attributes).
 * @returns {Promise<Array<{locator:string,confidence:number,type:string}>>}
 */
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

// Multiple ways to expose the function
if (typeof window !== 'undefined') {
  window.getMLSuggestedLocators = getMLSuggestedLocators;
  console.log('[ML Suggester] Function exposed to window.getMLSuggestedLocators');
}

// Also expose globally
if (typeof globalThis !== 'undefined') {
  globalThis.getMLSuggestedLocators = getMLSuggestedLocators;
}

// Verify function is available
setTimeout(() => {
  if (typeof window !== 'undefined' && window.getMLSuggestedLocators) {
    console.log('[ML Suggester] Function successfully available on window');
  } else {
    console.error('[ML Suggester] Function NOT available on window');
  }
}, 100);

console.log('[ML Suggester] Script loaded successfully');
