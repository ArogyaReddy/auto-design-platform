// Full Page Mode JavaScript
// This file handles the full page mode functionality

// Initialize full page mode
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('fullpage-mode')) {
        initializeFullPageMode();
    }
});

function initializeFullPageMode() {
    // Load data from storage when in full page mode
    loadDataFromStorage();
    
    // Setup close tab button
    const closeTabBtn = document.getElementById('closeTabBtn');
    if (closeTabBtn) {
        closeTabBtn.addEventListener('click', () => {
            window.close();
        });
    }
    
    // Adjust table display for full page
    adjustTableForFullPage();
    
    // Setup data synchronization
    setupDataSync();
    
    // Disable problematic buttons to avoid extension issues
    disableProblematicButtons();
}

function loadDataFromStorage() {
    chrome.storage.local.get(['lastExtractedData', 'fullPageData'], (result) => {
        let dataToLoad = result.fullPageData || result.lastExtractedData;
        
        if (dataToLoad && Array.isArray(dataToLoad)) {
            // Store the data globally for other functions to access
            if (typeof window !== 'undefined') {
                window.allOriginalData = dataToLoad;
                window.currentFilteredData = dataToLoad;
            }
            
            // Use the existing renderElementsTable function
            if (typeof renderElementsTable === 'function') {
                renderElementsTable(dataToLoad);
                document.getElementById('status').textContent = `Loaded ${dataToLoad.length} elements in full page view.`;
            } else {
                // Fallback rendering if renderElementsTable is not available
                renderTableFallback(dataToLoad);
            }
        } else {
            document.getElementById('status').textContent = 'No data available. Please extract elements first.';
        }
    });
}

// Fallback table rendering function
function renderTableFallback(data) {
    const preview = document.getElementById('preview');
    if (!preview || !data || data.length === 0) return;
    
    let html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>CSS Selector</th>
                    <th>XPath</th>
                    <th>ID</th>
                    <th>Text Content</th>
                    <th class="playwright-header">🎭 Playwright</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    data.forEach((element, index) => {
        // Extract proper data structure matching popup format
        const elementName = element['Element Name'] || element.tag || 'N/A';
        const elementType = element['Element Type'] || element.type || 'N/A';
        const cssSelector = element['CSS'] || element.css || 'N/A';
        const xpath = element['XPATH'] || element.xpath || 'N/A';
        const elementId = element['ID'] || element.id || 'N/A';
        const textContent = element['Element Name'] || element.text || 'N/A';
        
        html += `
            <tr>
                <td class="element-name">${elementName}</td>
                <td>
                    <span class="el-badge">${elementType}</span>
                </td>
                <td class="locator-text">${cssSelector}</td>
                <td class="locator-text">${xpath}</td>
                <td class="element-id">${elementId}</td>
                <td>${textContent}</td>
                <td class="playwright-column">
                    <button class="validate-single-btn" data-element-index="${index}" title="Validate with Playwright">🎭 Validate</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    preview.innerHTML = html;
    
    // Disable any buttons that were just added
    setTimeout(() => {
        disableHighlightButtons();
    }, 100);
    
    // Update stats
    const elementCount = document.getElementById('elementCount');
    if (elementCount) {
        elementCount.textContent = `${data.length} elements found`;
    }
}

function adjustTableForFullPage() {
    // Remove pagination for full page view - show all data
    const paginationControls = document.getElementById('paginationControls');
    if (paginationControls) {
        paginationControls.style.display = 'none';
    }
    
    // Adjust table width and styling
    const preview = document.getElementById('preview');
    if (preview) {
        preview.classList.add('fullpage-table');
    }
}

function setupDataSync() {
    // Listen for storage changes to sync data
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && (changes.lastExtractedData || changes.fullPageData)) {
            loadDataFromStorage();
        }
    });
}

// Disable problematic buttons to avoid extension issues in fullpage view
function disableProblematicButtons() {
    // Disable Inspect Element button
    const inspectElementBtn = document.getElementById('inspectElement');
    if (inspectElementBtn) {
        inspectElementBtn.disabled = true;
        inspectElementBtn.style.opacity = '0.5';
        inspectElementBtn.style.cursor = 'not-allowed';
        inspectElementBtn.title = 'Inspect Element is disabled in full page view to avoid extension conflicts';
        
        // Remove any existing click handlers and prevent new ones
        inspectElementBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
    }
    
    // Disable Extract Element button
    const extractElementBtn = document.getElementById('extract');
    if (extractElementBtn) {
        extractElementBtn.disabled = true;
        extractElementBtn.style.opacity = '0.5';
        extractElementBtn.style.cursor = 'not-allowed';
        extractElementBtn.title = 'Extract Elements is disabled in full page view to avoid extension conflicts';
        
        // Remove any existing click handlers and prevent new ones
        extractElementBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
    }
    
    // Override the bindTablePreviewButtons function to disable highlight buttons
    if (typeof window.bindTablePreviewButtons === 'function') {
        const originalBindFunction = window.bindTablePreviewButtons;
        window.bindTablePreviewButtons = function() {
            // Call original function first to set up copy buttons
            originalBindFunction.call(this);
            
            // Then disable highlight buttons
            disableHighlightButtons();
        };
    }
    
    // Set up a mutation observer to catch dynamically added buttons
    setupButtonDisableObserver();
    
    // Also disable any existing highlight buttons immediately
    disableHighlightButtons();
}

// Function to disable highlight buttons specifically
function disableHighlightButtons() {
    const highlightButtons = document.querySelectorAll('.hl-btn');
    highlightButtons.forEach(button => {
        button.disabled = true;
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
        button.title = 'Highlight is disabled in full page view to avoid extension conflicts';
        
        // Remove existing handlers and prevent clicks
        button.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        
        // Change icon to indicate disabled state
        if (button.textContent.includes('👁️')) {
            button.innerHTML = '🚫 Disabled';
            button.style.fontSize = '0.8em';
        }
    });
}

// Set up mutation observer to catch dynamically added buttons
function setupButtonDisableObserver() {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check for highlight buttons in the added content
                        const newHighlightButtons = node.querySelectorAll ? node.querySelectorAll('.hl-btn') : [];
                        newHighlightButtons.forEach(button => {
                            button.disabled = true;
                            button.style.opacity = '0.5';
                            button.style.cursor = 'not-allowed';
                            button.title = 'Highlight is disabled in full page view';
                            button.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            };
                            if (button.textContent.includes('👁️')) {
                                button.innerHTML = '🚫 Disabled';
                                button.style.fontSize = '0.8em';
                            }
                        });
                        
                        // Check for Extract Element buttons in the added content
                        const newExtractButtons = node.querySelectorAll ? node.querySelectorAll('#extract') : [];
                        newExtractButtons.forEach(button => {
                            button.disabled = true;
                            button.style.opacity = '0.5';
                            button.style.cursor = 'not-allowed';
                            button.title = 'Extract Elements is disabled in full page view';
                            button.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            };
                        });
                        
                        // Check if the node itself is a highlight button
                        if (node.classList && node.classList.contains('hl-btn')) {
                            node.disabled = true;
                            node.style.opacity = '0.5';
                            node.style.cursor = 'not-allowed';
                            node.title = 'Highlight is disabled in full page view';
                            node.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            };
                            if (node.textContent.includes('👁️')) {
                                node.innerHTML = '🚫 Disabled';
                                node.style.fontSize = '0.8em';
                            }
                        }
                        
                        // Check if the node itself is an Extract Element button
                        if (node.id === 'extract') {
                            node.disabled = true;
                            node.style.opacity = '0.5';
                            node.style.cursor = 'not-allowed';
                            node.title = 'Extract Elements is disabled in full page view';
                            node.onclick = (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            };
                        }
                    }
                });
            }
        });
    });
    
    // Start observing the document with the configured parameters
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Export function to be called from popup
function openInNewTab(data) {
    // Store the data to be accessed by the full page
    chrome.storage.local.set({ 
        fullPageData: data,
        fullPageTimestamp: Date.now()
    }, () => {
        // Open the full page in a new tab
        chrome.tabs.create({
            url: chrome.runtime.getURL('fullpage.html'),
            active: true
        });
    });
}

// Make function available globally if in extension context
if (typeof chrome !== 'undefined' && chrome.runtime) {
    window.openInNewTab = openInNewTab;
}
