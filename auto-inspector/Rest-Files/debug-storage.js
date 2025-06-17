/* global chrome */
// Debug script to check scan results storage
// Run this in the browser console on the results page

async function debugScanResults() {
    console.log('🔍 Debugging scan results storage...');
    
    try {
        const result = await chrome.storage.local.get(['scanResults']);
        console.log('📦 Raw storage result:', result);
        
        if (result.scanResults) {
            const scanData = result.scanResults;
            console.log('✅ Scan data found in storage');
            console.log('📊 Data structure:', {
                url: scanData.url,
                title: scanData.title,
                timestamp: scanData.timestamp,
                duration: scanData.duration,
                totalElements: scanData.totalElements,
                elementsWithPrimary: scanData.elementsWithPrimary,
                elementsWithSecondary: scanData.elementsWithSecondary,
                shadowDOMElements: scanData.shadowDOMElements,
                elementsArrayLength: scanData.elements ? scanData.elements.length : 'UNDEFINED',
                elementsArrayType: typeof scanData.elements,
                firstElement: scanData.elements && scanData.elements[0] ? scanData.elements[0] : 'NO FIRST ELEMENT'
            });
            
            if (scanData.elements) {
                console.log('🧩 First few elements:', scanData.elements.slice(0, 3));
            } else {
                console.log('❌ scanData.elements is undefined or null');
            }
        } else {
            console.log('❌ No scan results found in storage');
        }
    } catch (error) {
        console.error('💥 Error reading storage:', error);
    }
}

// Run the debug function
debugScanResults();
