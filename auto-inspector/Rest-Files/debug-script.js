// Debug highlighting issue - inject into console on test page

console.log('🔧 DEBUGGING HIGHLIGHTING ISSUE');
console.log('================================');

// Test 1: Check if content script is loaded
console.log('1. Testing content script availability...');
if (typeof window.universalLocatorInjected !== 'undefined') {
    console.log('✅ Content script is loaded');
    console.log('   - universalLocatorInjected:', window.universalLocatorInjected);
    console.log('   - universalLocatorListenerAdded:', window.universalLocatorListenerAdded);
    console.log('   - highlightedElements array:', window.highlightedElements?.length || 'undefined');
} else {
    console.log('❌ Content script not loaded or not properly initialized');
}

// Test 2: Test the specific selector
const testSelector = '#user-1-container [data-testid="action-menu-button"]';
console.log('\n2. Testing selector directly...');
console.log('Selector:', testSelector);

const elements = document.querySelectorAll(testSelector);
console.log('querySelectorAll result:', elements.length, 'elements found');
elements.forEach((el, i) => {
    console.log(`  Element ${i + 1}:`, {
        tag: el.tagName,
        id: el.id,
        classes: el.className,
        text: el.textContent.trim().substring(0, 30),
        visible: window.getComputedStyle(el).display !== 'none'
    });
});

// Test 3: Test manual highlighting
if (elements.length > 0) {
    console.log('\n3. Testing manual highlighting...');
    const testElement = elements[0];
    
    // Store original styles
    const originalStyles = {
        outline: testElement.style.outline,
        border: testElement.style.border,
        backgroundColor: testElement.style.backgroundColor
    };
    
    // Apply test highlighting
    testElement.style.outline = '4px solid red';
    testElement.style.border = '3px solid red';
    testElement.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
    
    console.log('✅ Manual highlighting applied - check if element is highlighted');
    
    // Clear after 3 seconds
    setTimeout(() => {
        testElement.style.outline = originalStyles.outline;
        testElement.style.border = originalStyles.border;
        testElement.style.backgroundColor = originalStyles.backgroundColor;
        console.log('🧹 Manual highlighting cleared');
    }, 3000);
}

// Test 4: Test message sending to extension
console.log('\n4. Testing extension message...');
if (typeof chrome !== 'undefined' && chrome.runtime) {
    console.log('Chrome extension API available');
    
    // Send test message
    chrome.runtime.sendMessage({
        action: 'highlightElement',
        selector: testSelector
    }, (response) => {
        if (chrome.runtime.lastError) {
            console.log('❌ Runtime error:', chrome.runtime.lastError.message);
        } else {
            console.log('✅ Extension response:', response);
        }
    });
} else {
    console.log('❌ Chrome extension API not available');
}

// Test 5: Check if message listener is working
console.log('\n5. Testing content script message handling...');
console.log('Sending message directly to content script...');

// Simulate the message that should be received by content script
const testMessage = {
    action: 'highlightElement',
    selector: testSelector
};

// This should trigger the message listener if it's properly set up
console.log('Test message:', testMessage);
console.log('Check console for "🎯 HIGHLIGHT REQUEST RECEIVED" message...');

console.log('\n🔧 Debug test complete. Check above results and console messages.');
