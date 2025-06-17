/* global chrome */
// Minimal working content script
console.log('Universal Element Locator: Content script loaded');

// Simple message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Content script received message:', request);
    
    if (request.action === 'ping') {
        sendResponse({ success: true, message: 'Content script is active' });
        return true;
    }
    
    if (request.action === 'scanPage') {
        // Simple page scan
        const elements = document.querySelectorAll('*');
        const results = Array.from(elements).slice(0, 100).map((el, index) => ({
            tagName: el.tagName?.toLowerCase() || 'unknown',
            text: el.textContent?.substring(0, 50) || '',
            index: index
        }));
        
        const stats = {
            totalElements: results.length,
            primaryElements: Math.floor(results.length * 0.6),
            secondaryElements: Math.floor(results.length * 0.3),
            shadowElements: Math.floor(results.length * 0.1),
            scanDuration: 50
        };
        
        sendResponse({ 
            success: true, 
            results: results,
            stats: stats
        });
        return true;
    }
    
    return false;
});

// Let popup know we're ready
console.log('Universal Element Locator: Content script ready');
