// Storage debugging utility - inject this in console to check scan data
async function debugStorageData() {
    console.log('🔍 Debug: Checking Chrome storage...');
    
    try {
        const result = await chrome.storage.local.get(['scanResults']);
        
        if (result.scanResults) {
            const scanData = result.scanResults;
            console.log('✅ Debug: Storage contains scan data:', {
                url: scanData.url,
                title: scanData.title,
                timestamp: scanData.timestamp,
                totalElements: scanData.totalElements,
                elementsLength: scanData.elements ? scanData.elements.length : 'undefined',
                elementsType: typeof scanData.elements,
                isArray: Array.isArray(scanData.elements)
            });
            
            if (scanData.elements && scanData.elements.length > 0) {
                console.log('🔍 Debug: First element in storage:', scanData.elements[0]);
                console.log('🔍 Debug: First element attributes:', scanData.elements[0].attributes);
                console.log('🔍 Debug: First element context:', scanData.elements[0].context);
                console.log('🔍 Debug: First element locators:', scanData.elements[0].locators);
            } else {
                console.log('❌ Debug: No elements in scan data or elements array is empty');
            }
        } else {
            console.log('❌ Debug: No scan results in storage');
        }
        
        // Also check for any other data in storage
        const allData = await chrome.storage.local.get(null);
        console.log('🔍 Debug: All storage keys:', Object.keys(allData));
        
    } catch (error) {
        console.error('❌ Debug: Error accessing storage:', error);
    }
}

// Run immediately
debugStorageData();
