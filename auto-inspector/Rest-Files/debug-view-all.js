// Debug script to inject into results page
// Run this in the browser console when viewing results

function debugViewAllIssue() {
    console.log('=== DEBUG VIEW ALL ISSUE ===');
    
    // Check current state
    console.log('Current state:');
    console.log('- viewAllMode:', window.viewAllMode);
    console.log('- filteredElements length:', window.filteredElements ? window.filteredElements.length : 'undefined');
    console.log('- scanResults:', window.scanResults ? 'exists' : 'null');
    console.log('- currentPage:', window.currentPage);
    
    // Check if elements container exists
    const container = document.getElementById('elementsContainer');
    console.log('- elementsContainer:', container ? 'exists' : 'missing');
    if (container) {
        console.log('- container innerHTML length:', container.innerHTML.length);
        console.log('- container first 200 chars:', container.innerHTML.substring(0, 200));
    }
    
    // Find View All button
    const viewAllBtn = document.getElementById('viewAllBtn');
    console.log('- viewAllBtn:', viewAllBtn ? 'exists' : 'missing');
    if (viewAllBtn) {
        console.log('- viewAllBtn text:', viewAllBtn.textContent);
    }
    
    // Test display function
    console.log('\n=== Testing displayElements function ===');
    if (window.displayElements && typeof window.displayElements === 'function') {
        console.log('Calling displayElements...');
        try {
            window.displayElements();
            console.log('✅ displayElements completed');
        } catch (error) {
            console.error('❌ displayElements error:', error);
        }
    } else {
        console.log('❌ displayElements function not found');
    }
    
    // Check table structure after display
    const table = document.querySelector('.elements-table');
    console.log('- table:', table ? 'exists' : 'missing');
    if (table) {
        const tbody = table.querySelector('tbody');
        console.log('- tbody:', tbody ? 'exists' : 'missing');
        if (tbody) {
            const rows = tbody.querySelectorAll('tr');
            console.log('- table rows:', rows.length);
            if (rows.length > 0) {
                console.log('- first row HTML:', rows[0].innerHTML.substring(0, 200));
            }
        }
    }
    
    console.log('=== END DEBUG ===');
}

// Function to manually trigger view all mode
function manualViewAll() {
    console.log('Manually triggering View All mode...');
    window.viewAllMode = true;
    window.currentPage = 1;
    if (window.displayElements) {
        window.displayElements();
        console.log('✅ Manual View All triggered');
    }
}

// Function to check element creation
function debugElementCreation() {
    console.log('=== DEBUG ELEMENT CREATION ===');
    if (window.filteredElements && window.filteredElements.length > 0) {
        const firstElement = window.filteredElements[0];
        console.log('First element:', firstElement);
        
        if (window.createElementRow && typeof window.createElementRow === 'function') {
            try {
                const rowHTML = window.createElementRow(firstElement, 0);
                console.log('Generated row HTML:', rowHTML);
            } catch (error) {
                console.error('❌ Error creating row:', error);
            }
        }
    }
}

// Auto-run debug when script loads
console.log('Debug script loaded. Available functions:');
console.log('- debugViewAllIssue(): Check current state and test display function');
console.log('- manualViewAll(): Manually trigger view all mode');
console.log('- debugElementCreation(): Test element row creation');

// Run initial debug
setTimeout(debugViewAllIssue, 1000);
