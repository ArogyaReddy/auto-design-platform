// Enhanced Debug Script for Universal Element Locator Extension
// Run this in the browser console to diagnose connection issues

console.log('🔍 Universal Element Locator Extension - Enhanced Debug');
console.log('====================================================');

// Check browser and page info
console.log('🌐 Environment Info:');
console.log('   Browser:', navigator.userAgent.split(' ').pop());
console.log('   Page URL:', window.location.href);
console.log('   Page Protocol:', window.location.protocol);
console.log('   Page Ready State:', document.readyState);

// Check if we're on a restricted page
const restrictedPage = window.location.href.startsWith('chrome://') || 
                      window.location.href.startsWith('chrome-extension://') ||
                      window.location.href.startsWith('moz-extension://');

if (restrictedPage) {
  console.log('⚠️  WARNING: You are on a restricted page. Extension may not work here.');
  console.log('   Try testing on a regular website like https://example.com');
}

// Check extension context
console.log('\n🔧 Extension Context:');
if (typeof chrome !== 'undefined') {
  console.log('✅ Chrome extension APIs available');
  if (chrome.runtime) {
    console.log('✅ Chrome runtime available');
    console.log('   Extension ID:', chrome.runtime.id);
  } else {
    console.log('❌ Chrome runtime NOT available');
  }
} else {
  console.log('❌ Chrome extension APIs NOT available');
}

// Check content script status
console.log('\n📜 Content Script Status:');
if (window.universalElementLocatorInjected) {
  console.log('✅ Content script is loaded');
  console.log('   Injection timestamp:', window.universalElementLocatorInjected);
} else {
  console.log('❌ Content script is NOT loaded');
  console.log('   This is likely the cause of connection errors');
}

// Check locator engine
console.log('\n⚙️  Locator Engine Status:');
if (window.universalLocatorEngine) {
  console.log('✅ Locator engine is available');
  console.log('   Version:', window.universalLocatorEngine.version || 'unknown');
} else {
  console.log('❌ Locator engine is NOT available');
}

// Test extension communication
console.log('\n📡 Testing Extension Communication:');
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
  // Test ping to background script
  chrome.runtime.sendMessage({action: 'ping'}, (response) => {
    if (chrome.runtime.lastError) {
      console.log('❌ Background script communication failed:', chrome.runtime.lastError.message);
    } else if (response) {
      console.log('✅ Background script communication working:', response);
    } else {
      console.log('⚠️  Background script not responding (this is normal for content script context)');
    }
  });
  
  // Test content script communication (this works from popup context)
  if (chrome.tabs) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'ping'}, (response) => {
          if (chrome.runtime.lastError) {
            console.log('❌ Content script communication failed:', chrome.runtime.lastError.message);
            console.log('   Solution: Refresh the page and try again');
          } else if (response) {
            console.log('✅ Content script communication working:', response);
          } else {
            console.log('❌ Content script not responding');
          }
        });
      }
    });
  }
} else {
  console.log('ℹ️  Extension communication test skipped (APIs not available in this context)');
}

// Analyze page elements
console.log('\n🔍 Page Element Analysis:');
const allElements = document.querySelectorAll('*');
const visibleElements = Array.from(allElements).filter(el => {
  const style = window.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden' && el.offsetHeight > 0;
});

console.log('   Total elements:', allElements.length);
console.log('   Visible elements:', visibleElements.length);

// Check for useful locator attributes
const withTestId = document.querySelectorAll('[data-testid]');
const withId = document.querySelectorAll('[id]');
const withName = document.querySelectorAll('[name]');
const withAriaLabel = document.querySelectorAll('[aria-label]');

console.log('   Elements with data-testid:', withTestId.length);
console.log('   Elements with id:', withId.length);
console.log('   Elements with name:', withName.length);
console.log('   Elements with aria-label:', withAriaLabel.length);

// Check for Shadow DOM
const shadowHosts = Array.from(allElements).filter(el => el.shadowRoot);
console.log('   Shadow DOM hosts:', shadowHosts.length);

// Test manual scanning if possible
console.log('\n🧪 Manual Scan Test:');
if (window.universalLocatorEngine) {
  try {
    console.log('   Starting manual scan...');
    window.universalLocatorEngine.scanElements({
      highlightElements: false,
      includeShadowDOM: true,
      includeHidden: false
    }).then(results => {
      console.log('✅ Manual scan successful!');
      console.log('   Results:', {
        totalElements: results.statistics.total,
        withPrimary: results.statistics.withPrimary,
        withSecondary: results.statistics.withSecondary,
        shadowDOM: results.statistics.shadowDOM
      });
    }).catch(error => {
      console.log('❌ Manual scan failed:', error.message);
    });
  } catch (error) {
    console.log('❌ Error starting manual scan:', error.message);
  }
} else {
  console.log('   Skipped (locator engine not available)');
}

// Provide recommendations
console.log('\n💡 Recommendations:');
if (!window.universalElementLocatorInjected) {
  console.log('❌ Content script not loaded:');
  console.log('   1. Refresh the page (Cmd+R)');
  console.log('   2. Wait for page to fully load');
  console.log('   3. Try scanning again');
  console.log('   4. If still failing, reload the extension');
}

if (restrictedPage) {
  console.log('⚠️  Restricted page detected:');
  console.log('   1. Navigate to a regular website (https://example.com)');
  console.log('   2. Avoid chrome:// and extension pages');
  console.log('   3. Try the test page: file:///path/to/test-page.html');
}

if (allElements.length > 1000) {
  console.log('📊 Large page detected:');
  console.log('   1. Scanning may take 3-10 seconds');
  console.log('   2. Disable visual highlighting for faster scans');
  console.log('   3. Consider scanning specific sections only');
}

console.log('\n🎯 Debug Analysis Complete!');
console.log('If issues persist, check the extension background console:');
console.log('chrome://extensions/ → Click "Service Worker" under Universal Element Locator');

// Return a summary object for programmatic access
window.extensionDebugInfo = {
  contentScriptLoaded: !!window.universalElementLocatorInjected,
  locatorEngineAvailable: !!window.universalLocatorEngine,
  restrictedPage: restrictedPage,
  totalElements: allElements.length,
  visibleElements: visibleElements.length,
  elementsWithTestId: withTestId.length,
  elementsWithId: withId.length,
  shadowDomHosts: shadowHosts.length,
  pageUrl: window.location.href,
  timestamp: new Date().toISOString()
};

console.log('\n📋 Debug info saved to window.extensionDebugInfo for programmatic access');
