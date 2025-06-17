/* global chrome */
// Results page JavaScript for Universal Element Locator Extension
// This file handles the detailed results page functionality

let scanResults = null;
let filteredElements = [];
let currentPage = 1;
const itemsPerPage = 50;
let viewAllMode = false;

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await loadScanResults();
    setupEventListeners();
});

async function loadScanResults() {
    try {
        const result = await chrome.storage.local.get(['scanResults']);
        console.log('🔍 Debug: Raw storage result:', result);
        
        if (result.scanResults) {
            scanResults = result.scanResults;
            console.log('✅ Debug: scanResults loaded:', {
                hasElements: !!scanResults.elements,
                elementsLength: scanResults.elements ? scanResults.elements.length : 'undefined',
                elementsType: typeof scanResults.elements,
                firstElement: scanResults.elements && scanResults.elements[0] ? scanResults.elements[0] : 'none'
            });
            displayResults();
        } else {
            console.log('❌ Debug: No scanResults in storage');
            showNoData();
        }
    } catch (error) {
        console.error('Error loading scan results:', error);
        showNoData();
    }
}

function displayResults() {
    if (!scanResults) return;

    // Update header info
    document.getElementById('pageUrl').textContent = scanResults.url || 'Unknown';
    document.getElementById('pageTitle').textContent = scanResults.title || 'Unknown';
    document.getElementById('scanDate').textContent = scanResults.timestamp ? 
        new Date(scanResults.timestamp).toLocaleString() : 'Unknown';
    document.getElementById('scanDuration').textContent = `${scanResults.duration || 0}ms`;

    // Update main page header with dynamic title
    const pageHeader = document.getElementById('pageHeader');
    if (pageHeader) {
        const pageTitle = scanResults.title || 'Unknown Page';
        pageHeader.textContent = `${pageTitle} : Locator Results`;
    }

    // Update statistics
    displayStatistics();

    // Populate filters
    populateFilterOptions();

    // Display elements - set initial filtered elements without calling applyFilters
    const rawElements = scanResults.elements || [];
    filteredElements = rawElements; // Don't apply filters initially
    console.log('🔍 Debug: filteredElements after assignment:', {
        length: filteredElements.length,
        type: typeof filteredElements,
        isArray: Array.isArray(filteredElements),
        firstElement: filteredElements[0] || 'none'
    });
    
    // Validate data quality
    if (filteredElements.length > 0) {
        const firstElement = filteredElements[0];
        const dataQuality = {
            hasAttributes: firstElement.attributes && Object.keys(firstElement.attributes).length > 0,
            hasContext: firstElement.context && Object.keys(firstElement.context).length > 0,
            hasLocators: firstElement.locators && (
                (firstElement.locators.primary && firstElement.locators.primary.length > 0) ||
                (firstElement.locators.secondary && firstElement.locators.secondary.length > 0) ||
                (firstElement.locators.fallback && firstElement.locators.fallback.length > 0)
            ),
            hasTextContent: firstElement.textContent && Object.keys(firstElement.textContent).length > 0,
            hasElementState: firstElement.elementState && Object.keys(firstElement.elementState).length > 0
        };
        
        console.log('🔍 Debug: Data quality check:', dataQuality);
        console.log('🔍 Debug: First element full data:', firstElement);
        
        // If data appears to be empty across the board, log a warning
        const emptyDataFields = Object.values(dataQuality).filter(Boolean).length;
        if (emptyDataFields < 3) {
            console.warn('⚠️ Warning: Most element data fields appear to be empty. This suggests a data extraction issue.');
        }
    }
    
    displayElements();
}

function displayStatistics() {
    const stats = [
        { 
            label: 'Total Elements', 
            value: scanResults.totalElements || 0, 
            color: '#667eea',
            sortKey: 'total',
            tooltip: 'Click to sort by element index'
        },
        { 
            label: 'Primary Locators', 
            value: scanResults.elementsWithPrimary || 0, 
            color: '#10b981',
            sortKey: 'primary',
            tooltip: 'Click to sort by primary locator count'
        },
        { 
            label: 'Secondary Locators', 
            value: scanResults.elementsWithSecondary || 0, 
            color: '#f59e0b',
            sortKey: 'secondary',
            tooltip: 'Click to sort by secondary locator count'
        },
        { 
            label: 'Shadow DOM', 
            value: scanResults.shadowDOMElements || 0, 
            color: '#8b5cf6',
            sortKey: 'shadowDOM',
            tooltip: 'Click to sort by Shadow DOM elements first'
        }
    ];

    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card clickable-stat" 
             data-sort-key="${stat.sortKey}" 
             title="${stat.tooltip}"
             style="background: linear-gradient(135deg, ${stat.color}, ${stat.color}dd); cursor: pointer; transition: transform 0.2s ease;">
            <div class="stat-number">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
            <div class="sort-indicator">⬍⬌</div>
        </div>
    `).join('');

    // Add click event listeners for sorting
    document.querySelectorAll('.clickable-stat').forEach(card => {
        card.addEventListener('click', () => {
            const sortKey = card.getAttribute('data-sort-key');
            sortElementsByStat(sortKey);
            
            // Visual feedback
            document.querySelectorAll('.clickable-stat').forEach(c => c.classList.remove('active-sort'));
            card.classList.add('active-sort');
        });

        // Add hover effects
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-2px)';
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = 'none';
        });
    });
}

// Sorting functionality for statistics cards
let currentSortKey = null;
let currentSortDirection = 'desc'; // 'asc' or 'desc'

function sortElementsByStat(sortKey) {
    console.log('🔄 Sorting elements by:', sortKey);
    
    // Toggle direction if clicking the same sort key
    if (currentSortKey === sortKey) {
        currentSortDirection = currentSortDirection === 'desc' ? 'asc' : 'desc';
    } else {
        currentSortDirection = 'desc'; // Default to descending for new sort
        currentSortKey = sortKey;
    }
    
    // Create a copy of filtered elements for sorting
    const elementsToSort = [...filteredElements];
    
    // Sort based on the selected criteria
    elementsToSort.sort((a, b) => {
        let valueA, valueB;
        
        switch (sortKey) {
            case 'total':
                // Sort by element index (original order)
                valueA = a.index || 0;
                valueB = b.index || 0;
                break;
                
            case 'primary':
                // Sort by number of primary locators
                valueA = (a.locators?.primary?.length || 0);
                valueB = (b.locators?.primary?.length || 0);
                break;
                
            case 'secondary':
                // Sort by number of secondary locators
                valueA = (a.locators?.secondary?.length || 0);
                valueB = (b.locators?.secondary?.length || 0);
                break;
                
            case 'shadowDOM':
                // Sort by Shadow DOM status (Shadow DOM elements first when desc)
                valueA = a.isShadowDOM ? 1 : 0;
                valueB = b.isShadowDOM ? 1 : 0;
                break;
                
            default:
                valueA = a.index || 0;
                valueB = b.index || 0;
        }
        
        // Apply sorting direction
        if (currentSortDirection === 'desc') {
            return valueB - valueA;
        } else {
            return valueA - valueB;
        }
    });
    
    // Update filtered elements with sorted order
    filteredElements = elementsToSort;
    
    // Reset to first page when sorting
    currentPage = 1;
    
    // Re-display elements
    displayElements();
    
    // Update sort indicator
    updateSortIndicator(sortKey, currentSortDirection);
    
    console.log('✅ Sorted elements by', sortKey, 'in', currentSortDirection, 'order');
}

function updateSortIndicator(sortKey, direction) {
    // Update sort indicators on all stat cards
    document.querySelectorAll('.clickable-stat').forEach(card => {
        const indicator = card.querySelector('.sort-indicator');
        const cardSortKey = card.getAttribute('data-sort-key');
        
        if (cardSortKey === sortKey) {
            // Active sort
            indicator.textContent = direction === 'desc' ? '⬇' : '⬆';
            indicator.style.opacity = '1';
            card.classList.add('active-sort');
        } else {
            // Inactive sort
            indicator.textContent = '⬍⬌';
            indicator.style.opacity = '0.5';
            card.classList.remove('active-sort');
        }
    });
}

function displayElements() {
    console.log('🔍 Debug: displayElements() called with filteredElements.length:', filteredElements.length);
    console.log('🔍 Debug: viewAllMode:', viewAllMode);
    
    const container = document.getElementById('elementsContainer');
    console.log('🔍 Debug: elementsContainer found:', !!container);
    
    if (filteredElements.length === 0) {
        console.log('❌ Debug: No filtered elements - showing no data message');
        container.innerHTML = '<div class="no-data">No elements found matching the current filters.</div>';
        return;
    }

    console.log('✅ Debug: Rendering', filteredElements.length, 'elements');

    // Determine elements to show based on view mode
    let elementsToShow;
    let controlsHtml;
    
    if (viewAllMode) {
        // Show all elements
        elementsToShow = [...filteredElements]; // Create a copy to avoid reference issues
        console.log('🔍 Debug: View All Mode - elementsToShow length:', elementsToShow.length);
        console.log('🔍 Debug: View All Mode - first element:', elementsToShow[0] ? 'exists' : 'missing');
        controlsHtml = `
            <div class="results-summary">
                <span>Showing all ${filteredElements.length} elements</span>
            </div>
        `;
    } else {
        // Show paginated elements
        const totalPages = Math.ceil(filteredElements.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        elementsToShow = filteredElements.slice(startIndex, endIndex);
        
        controlsHtml = `
            <div class="results-summary">
                <span>Showing ${elementsToShow.length} of ${filteredElements.length} elements (Page ${currentPage} of ${totalPages})</span>
            </div>
        `;
    }

    console.log('🔍 Debug: Elements to show:', elementsToShow.length);

    // Generate table body content with error handling for each row
    let tableBodyContent = '';
    for (let i = 0; i < elementsToShow.length; i++) {
        const element = elementsToShow[i];
        const actualIndex = viewAllMode ? i : ((currentPage - 1) * itemsPerPage) + i;
        
        try {
            console.log(`🔍 Debug: Creating row ${i + 1}/${elementsToShow.length} for element`, element ? 'exists' : 'missing');
            const rowHTML = createElementRow(element, actualIndex);
            if (rowHTML && rowHTML.trim().length > 0) {
                tableBodyContent += rowHTML;
            } else {
                console.warn(`⚠️ Warning: Empty row HTML for element at index ${i}`);
                tableBodyContent += `<tr><td colspan="12">Empty row for element ${i + 1}</td></tr>`;
            }
        } catch (error) {
            console.error(`❌ Error creating row for element ${i}:`, error);
            tableBodyContent += `<tr><td colspan="12">Error rendering element ${i + 1}: ${error.message}</td></tr>`;
        }
    }

    console.log('🔍 Debug: Table body content length:', tableBodyContent.length);

    const tableContent = `
        <div class="table-wrapper">
            <table class="elements-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Element Name</th>
                        <th>Tag</th>
                        <th>Text Content</th>
                        <th>Attributes</th>
                        <th>Context</th>
                        <th>State</th>
                        <th style="background: #10b981; color: white;">🎯 Unique Locators</th>
                        <th>Primary Locators</th>
                        <th>Secondary Locators</th>
                        <th>Fallback Locators</th>
                        <th>Position & Size</th>
                        <th>Styling</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableBodyContent}
                </tbody>
            </table>
        </div>
    `;

    // Only show pagination if not in view all mode
    const pagination = createPagination(Math.ceil(filteredElements.length / itemsPerPage));
    const finalHTML = controlsHtml + tableContent + pagination;
    
    console.log('🔍 Debug: Setting container innerHTML, length:', finalHTML.length);
    container.innerHTML = finalHTML;
    console.log('✅ Debug: Container innerHTML set successfully');
}

function createElementRow(element, index) {
    try {
        console.log('🔍 Debug: Creating row for element:', element);
        console.log('🔍 Debug: Element structure keys:', Object.keys(element));
        console.log('🔍 Debug: Element textContent:', element.textContent);
        console.log('🔍 Debug: Element text:', element.text);
        console.log('🔍 Debug: Element attributes:', element.attributes);
        console.log('🔍 Debug: Element locators:', element.locators);
        
        const shadowIndicator = element.isShadowDOM ? '<span class="shadow-indicator">🌑</span>' : '';
        
        // Generate element name based on available attributes
        const elementName = generateElementName(element);
        
        // Apply highlighting to element name and tag
        const currentSearchTerm = getCurrentSearchTerm();
        const highlightedElementName = currentSearchTerm ? 
            highlightSearchTerm(elementName, currentSearchTerm) : 
            escapeHtml(elementName);
        const highlightedTagName = currentSearchTerm ? 
            highlightSearchTerm(safeString(element.tagName).toUpperCase(), currentSearchTerm) : 
            escapeHtml(safeString(element.tagName).toUpperCase());

        // Ensure locators exist and provide safe defaults
        const locators = element.locators || { primary: [], secondary: [], fallback: [] };
        
        console.log('🔍 Debug: Processed locators for row:', {
            primary: locators.primary.length,
            secondary: locators.secondary.length, 
            fallback: locators.fallback.length
        });

        return `
            <tr class="element-row" data-element-index="${index}">
                <td class="index-cell">${index + 1}</td>
                <td class="name-cell">
                    <span class="element-name" title="${highlightedElementName}">${highlightedElementName}</span>
                </td>
                <td class="tag-cell">
                    <span class="element-tag">${highlightedTagName}</span> ${shadowIndicator}
                    ${element.elementState?.isInteractive ? '<span class="interactive-indicator" title="Interactive element">🔗</span>' : ''}
                    ${element.elementState?.isFormElement ? '<span class="form-indicator" title="Form element">📝</span>' : ''}
                </td>
                <td class="text-cell">
                    ${createTextContentDisplay(element)}
                </td>
                <td class="attributes-cell">
                    ${createAttributesDisplay(element.attributes || {})}
                </td>
                <td class="context-cell">
                    ${createContextDisplay(element.context || {})}
                </td>
                <td class="state-cell">
                    ${createStateDisplay(element.elementState || {})}
                </td>
                <td class="locators-cell unique-locators" style="background: rgba(16, 185, 129, 0.1);">
                    ${createLocatorsList(locators.unique || [], 'unique')}
                </td>
                <td class="locators-cell">${createLocatorsList(locators.primary, 'primary')}</td>
                <td class="locators-cell">${createLocatorsList(locators.secondary, 'secondary')}</td>
                <td class="locators-cell">${createLocatorsList(locators.fallback, 'fallback')}</td>
                <td class="position-cell">
                    ${createPositionDisplay(element.position || {})}
                </td>
                <td class="styling-cell">
                    ${createStylingDisplay(element.styling || {})}
                </td>
            </tr>
        `;
    } catch (error) {
        console.error('❌ Error creating element row:', error, element);
        console.error('❌ Error stack:', error.stack);
        return `<tr><td colspan="12">Error rendering element ${index + 1}: ${error.message}</td></tr>`;
    }
}

function generateElementName(element) {
    // Try to generate a meaningful name from various element attributes
    
    // 1. Check for data-testid, id, name attributes in primary locators
    if (element.locators && element.locators.primary) {
        for (const locator of element.locators.primary) {
            if (locator.type === 'data-testid' && locator.selector) {
                const match = locator.selector.match(/data-testid="([^"]+)"/);
                if (match) return match[1];
            }
            if (locator.type === 'id' && locator.selector) {
                const match = locator.selector.match(/#([^.\s[]+)/);
                if (match) return match[1];
            }
        }
    }
    
    // 2. Check for aria-label
    if (element.locators && element.locators.primary) {
        for (const locator of element.locators.primary) {
            if (locator.type === 'aria-label' && locator.selector) {
                const match = locator.selector.match(/aria-label="([^"]+)"/);
                if (match) return match[1];
            }
        }
    }
    
    // 3. Use element text if available and meaningful
    const textValue = safeString(element.text);
    if (textValue && safeTrim(textValue).length > 0 && textValue.length <= 50) {
        return safeTrim(textValue);
    }
    
    // 4. Check for name attribute in secondary locators
    if (element.locators && element.locators.secondary) {
        for (const locator of element.locators.secondary) {
            if (locator.selector && locator.selector.includes('name=')) {
                const match = locator.selector.match(/name="([^"]+)"/);
                if (match) return match[1];
            }
        }
    }
    
    // 5. Check for class names that might be meaningful
    if (element.locators && element.locators.secondary) {
        for (const locator of element.locators.secondary) {
            if (locator.type === 'class' && locator.selector) {
                const match = locator.selector.match(/\.([^.\s[]+)/);
                if (match && !match[1].match(/^(btn|button|input|div|span|container)$/i)) {
                    return match[1];
                }
            }
        }
    }
    
    // 6. Default to tag name with index
    return `${safeString(element.tagName).toLowerCase()}_element`;
}

function createLocatorsList(locators, type) {
    console.log(`🔍 Debug: createLocatorsList called with:`, locators, type);
    
    if (!locators || locators.length === 0) {
        console.log(`🔍 Debug: No locators for type ${type}, returning dash`);
        if (type === 'unique') {
            return '<div style="color: #f59e0b; font-style: italic;">⚠️ No unique selectors available</div>';
        }
        return '-';
    }
    
    console.log(`🔍 Debug: Found ${locators.length} locators for type ${type}`);
    
    const locatorId = `locators_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const isUnique = type === 'unique';
    
    return `<div class="locators-list ${isUnique ? 'unique-locators-list' : ''}" data-locator-id="${locatorId}">
        <div class="locators-header ${isUnique ? 'unique-header' : ''}">
            <button class="copy-btn ${isUnique ? 'unique-copy-btn' : ''}" data-action="copy-all" data-type="${type}" title="Copy all ${type} locators">
                ${isUnique ? '🎯' : '📋'} Copy All ${safeString(type).charAt(0).toUpperCase() + safeString(type).slice(1)}
            </button>
            ${isUnique ? '<div style="font-size: 11px; color: #10b981; margin-top: 4px;">✅ Guaranteed unique selectors</div>' : ''}
        </div>
        ${locators.map((loc) => {
            // Apply highlighting to locator selector
            const currentSearchTerm = getCurrentSearchTerm();
            const highlightedSelector = currentSearchTerm ? 
                highlightSearchTerm(loc.selector, currentSearchTerm) : 
                escapeHtml(loc.selector);
            const highlightedType = currentSearchTerm ? 
                highlightSearchTerm(loc.type, currentSearchTerm) : 
                escapeHtml(loc.type);
            
            // Special handling for unique locators
            const uniqueClass = isUnique ? 'unique-locator-item' : '';
            const matchCountDisplay = loc.matchCount !== undefined ? 
                `<span class="match-count" style="font-size: 10px; color: ${loc.matchCount === 1 ? '#10b981' : '#f59e0b'};">
                    ${loc.matchCount === 1 ? '✅ Unique' : `⚠️ ${loc.matchCount} matches`}
                </span>` : '';
            
            const descriptionDisplay = loc.description ? 
                `<div class="locator-description" style="font-size: 11px; color: #666; margin-top: 2px; font-style: italic;">
                    ${escapeHtml(loc.description)}
                </div>` : '';
            
            return `<div class="locator-item locator-${type} ${uniqueClass}" data-locator="${escapeHtml(loc.selector)}">
                <div class="locator-content">
                    <div class="locator-type" style="${isUnique ? 'color: #10b981; font-weight: bold;' : ''}">${highlightedType}</div>
                    <div class="locator-value" title="${highlightedSelector}">${highlightedSelector}</div>
                    ${matchCountDisplay}
                    ${descriptionDisplay}
                </div>
                <div class="locator-actions">
                    <button class="highlight-btn ${isUnique ? 'unique-highlight-btn' : ''}" data-action="highlight" data-locator="${escapeHtml(loc.selector)}" title="Highlight this element on the page">${isUnique ? '🎯' : '🎯'}</button>
                    <button class="copy-single-btn ${isUnique ? 'unique-copy-single-btn' : ''}" data-action="copy-single" data-locator="${escapeHtml(loc.selector)}" title="Copy this locator">${isUnique ? '✅' : '📋'}</button>
                </div>
            </div>`;
        }).join('')}
    </div>`;
}

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) {
        return '';
    }
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

// Helper function to safely get string value
function safeString(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value);
}

// Helper function to safely trim a string
function safeTrim(value) {
    if (!value || typeof value !== 'string') {
        return '';
    }
    return value.trim();
}

async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showCopyNotification('Copied to clipboard!');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            showCopyNotification('Copied to clipboard!');
        } catch (fallbackErr) {
            showCopyNotification('Failed to copy', true);
        }
        document.body.removeChild(textArea);
    }
}

function showCopyNotification(message, isError = false) {
    // Remove existing notification
    const existing = document.querySelector('.copy-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `copy-notification ${isError ? 'error' : 'success'}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${isError ? '#ef4444' : '#10b981'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function createPagination(totalPages) {
    // If we're in view all mode, always show the back to pagination controls
    if (viewAllMode) {
        return createViewAllControls();
    }
    
    if (totalPages <= 1) {
        return `
            <div class="view-all-section">
                <div class="view-mode-info">📊 All ${filteredElements.length} elements displayed</div>
            </div>
        `;
    }

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(`
            <button data-page="${i}" ${i === currentPage ? 'class="active"' : ''}>
                ${i}
            </button>
        `);
    }

    // Integrated pagination with view all button inline
    return `
        <div class="pagination">
            <button data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
                ← Previous
            </button>
            ${pages.join('')}
            <button data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
                Next →
            </button>
            <button id="viewAllBtn" class="view-all-btn pagination-inline">
                📋 View All ${filteredElements.length}
            </button>
        </div>
        <div class="view-all-section">
            <div class="view-mode-info">� Page ${currentPage} of ${totalPages} (${filteredElements.length} total elements)</div>
        </div>
    `;
}

function createViewAllControls() {
    return `
        <div class="pagination">
            <button id="paginationModeBtn" class="pagination-mode-btn">
                📑 Back to Pagination
            </button>
        </div>
        <div class="view-all-section">
            <div class="view-mode-info">📊 Viewing all ${filteredElements.length} elements</div>
        </div>
    `;
}

function goToPage(page) {
    const totalPages = Math.ceil(filteredElements.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    displayElements();
}

function setupEventListeners() {
    // Main controls event listeners (for elements that exist on page load)
    const mainSearchBox = document.getElementById('searchBox');
    if (mainSearchBox) {
        mainSearchBox.addEventListener('input', applyFilters);
    }

    const searchClearBtn = document.getElementById('searchClear');
    if (searchClearBtn) {
        searchClearBtn.addEventListener('click', function() {
            document.getElementById('searchBox').value = '';
            applyFilters();
        });
    }

    const confidenceFilter = document.getElementById('confidenceFilter');
    if (confidenceFilter) {
        confidenceFilter.addEventListener('change', applyFilters);
    }

    const tagFilter = document.getElementById('tagFilter');
    if (tagFilter) {
        tagFilter.addEventListener('change', applyFilters);
    }

    const exportCSVBtn = document.getElementById('exportCSV');
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', exportToCSV);
    }

    const exportJSONBtn = document.getElementById('exportJSON');
    if (exportJSONBtn) {
        exportJSONBtn.addEventListener('click', exportToJSON);
    }

    const stateFilter = document.getElementById('stateFilter');
    if (stateFilter) {
        stateFilter.addEventListener('change', applyFilters);
    }

    const locatorFilter = document.getElementById('locatorFilter');
    if (locatorFilter) {
        locatorFilter.addEventListener('change', applyFilters);
    }

    const compactViewBtn = document.getElementById('compactView');
    if (compactViewBtn) {
        compactViewBtn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
            compactViewBtn.classList.add('active');
            toggleView(true);
        });
    }

    const detailedViewBtn = document.getElementById('detailedView');
    if (detailedViewBtn) {
        detailedViewBtn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
            detailedViewBtn.classList.add('active');
            toggleView(false);
        });
    }

    // Table event listeners (for dynamically added elements like pagination and copy buttons)
    document.getElementById('elementsContainer').addEventListener('click', function(event) {

        // View mode button event delegation
        if (event.target.id === 'viewAllBtn') {
            viewAllMode = true;
            currentPage = 1; // Reset to page 1 when switching modes
            displayElements();
            return;
        }
        
        if (event.target.id === 'paginationModeBtn') {
            viewAllMode = false;
            currentPage = 1; // Reset to page 1 when switching modes
            displayElements();
            return;
        }

        // Pagination event delegation
        if (event.target.tagName === 'BUTTON' && event.target.hasAttribute('data-page')) {
            const page = parseInt(event.target.getAttribute('data-page'));
            if (!isNaN(page)) {
                goToPage(page);
            }
        }
        
        // Copy button event delegation
        if (event.target.hasAttribute('data-action')) {
            const action = event.target.getAttribute('data-action');
            
            if (action === 'copy-single') {
                const locator = event.target.getAttribute('data-locator');
                if (locator) {
                    copyToClipboard(locator);
                }
            } else if (action === 'copy-all') {
                const type = event.target.getAttribute('data-type');
                const container = event.target.closest('.locators-list');
                if (container && type) {
                    const locatorItems = container.querySelectorAll('.locator-item');
                    const locators = Array.from(locatorItems).map(item => {
                        const typeSpan = item.querySelector('.locator-type');
                        const valueSpan = item.querySelector('.locator-value');
                        return `${typeSpan.textContent} ${valueSpan.textContent}`;
                    });
                    
                    const text = locators.join('\n');
                    copyToClipboard(text);
                }
            } else if (action === 'highlight') {
                const locator = event.target.getAttribute('data-locator');
                if (locator) {
                    highlightElementOnPage(locator);
                }
            }
        }
    });
}

// Helper function to create text content display
function createTextContentDisplay(element) {
    console.log('🔍 Debug: createTextContentDisplay called with element:', element);
    
    // Handle the textContent object structure from content.js
    let textToDisplay = '';
    
    if (element.textContent && typeof element.textContent === 'object') {
        // textContent is an object with innerText, textContent, cleanText, hasText
        console.log('🔍 Debug: textContent object:', element.textContent);
        
        const possibleTexts = [
            element.textContent.cleanText,
            element.textContent.innerText,
            element.textContent.textContent
        ];
        
        textToDisplay = possibleTexts.find(text => {
            const textStr = safeString(text);
            return textStr && safeTrim(textStr).length > 0;
        }) || '';
    } else {
        // Fallback for other possible text sources
        const possibleTexts = [
            element.textContent,
            element.text,
            element.innerText
        ];
        
        textToDisplay = possibleTexts.find(text => {
            const textStr = safeString(text);
            return textStr && safeTrim(textStr).length > 0;
        }) || '';
    }
    
    console.log('🔍 Debug: Final textToDisplay:', textToDisplay);
    
    if (!textToDisplay) {
        return '<span class="no-text">No text content</span>';
    }
    
    const textStr = safeString(textToDisplay);
    const trimmedText = safeTrim(textStr);
    
    if (trimmedText.length === 0) {
        return '<span class="no-text">No text content</span>';
    }
    
    const safeSubstring = trimmedText.length > 40 ? trimmedText.substring(0, 40) : trimmedText;
    
    // Get current search term for highlighting
    const currentSearchTerm = getCurrentSearchTerm();
    
    // Apply highlighting if there's a search term
    const displayText = currentSearchTerm ? 
        highlightSearchTerm(safeSubstring, currentSearchTerm) : 
        escapeHtml(safeSubstring);
    const titleText = currentSearchTerm ? 
        highlightSearchTerm(trimmedText, currentSearchTerm) : 
        escapeHtml(trimmedText);
    
    return `
        <div class="text-content-display">
            <div class="text-summary" title="${titleText}">
                ${displayText}${trimmedText.length > 40 ? '...' : ''}
            </div>
        </div>
    `;
}

// Helper function to create attributes display
function createAttributesDisplay(attributes) {
    console.log('🔍 Debug: createAttributesDisplay called with:', attributes);
    
    if (!attributes || typeof attributes !== 'object') {
        return '<span class="no-attributes">No attributes</span>';
    }
    
    const attrEntries = Object.entries(attributes);
    console.log('🔍 Debug: Attribute entries:', attrEntries);
    
    if (attrEntries.length === 0) {
        return '<span class="no-attributes">No attributes</span>';
    }
    
    return `
        <div class="attributes-display">
            ${attrEntries.slice(0, 3).map(([name, value]) => {
                const valueStr = safeString(value);
                const valueSafe = valueStr.length > 20 ? valueStr.substring(0, 20) : valueStr;
                
                // Apply highlighting to both name and value
                const currentSearchTerm = getCurrentSearchTerm();
                const highlightedName = currentSearchTerm ? 
                    highlightSearchTerm(name, currentSearchTerm) : 
                    escapeHtml(name);
                const highlightedValue = currentSearchTerm ? 
                    highlightSearchTerm(valueSafe, currentSearchTerm) : 
                    escapeHtml(valueSafe);
                const highlightedValueFull = currentSearchTerm ? 
                    highlightSearchTerm(valueStr, currentSearchTerm) : 
                    escapeHtml(valueStr);
                
                return `<div class="attr-item" title="${highlightedName}='${highlightedValueFull}'">
                    <strong>${highlightedName}:</strong> ${highlightedValue}${valueStr.length > 20 ? '...' : ''}
                </div>`;
            }).join('')}
            ${attrEntries.length > 3 ? `<div class="attr-item">+${attrEntries.length - 3} more...</div>` : ''}
        </div>
    `;
}

// Helper function to create context display
function createContextDisplay(context) {
    if (!context || Object.keys(context).length === 0) {
        return '<span class="no-context">No context</span>';
    }
    
    return `
        <div class="context-display">
            ${context.parentTagName ? `<div class="context-item">
                <strong>Parent:</strong> ${safeString(context.parentTagName).toUpperCase()}
                ${context.parentId ? `#${context.parentId}` : ''}
            </div>` : ''}
            <div class="context-item">
                <strong>Position:</strong> ${context.siblingIndex >= 0 ? `${context.siblingIndex + 1}` : '?'} of ${context.childrenCount || 0}
            </div>
            <div class="context-item">
                <strong>Depth:</strong> ${context.nestingLevel || 0}
            </div>
        </div>
    `;
}

// Helper function to create state display
function createStateDisplay(elementState) {
    if (!elementState || Object.keys(elementState).length === 0) {
        return '<span class="no-state">No state info</span>';
    }
    
    const states = [];
    if (elementState.isFormElement) states.push('📝 Form');
    if (elementState.isInteractive) states.push('🔗 Interactive');
    if (elementState.hasChildren) states.push('👥 Has Children');
    if (elementState.isEmptyElement) states.push('🫙 Empty');
    
    return `
        <div class="state-display">
            ${states.length > 0 ? states.map(state => `<span class="state-badge">${state}</span>`).join('') : '<span class="no-states">Static</span>'}
        </div>
    `;
}

// Helper function to create position display
function createPositionDisplay(position) {
    if (!position || (!position.x && !position.y)) {
        return '<span class="no-position">No position</span>';
    }
    
    return `
        <div class="position-display">
            <div class="position-coords">
                <strong>X:</strong> ${position.x || 0}, <strong>Y:</strong> ${position.y || 0}
            </div>
            ${position.width && position.height ? `
                <div class="position-size">
                    <strong>Size:</strong> ${position.width}×${position.height}
                </div>
            ` : ''}
        </div>
    `;
}

// Helper function to create styling display
function createStylingDisplay(styling) {
    if (!styling || Object.keys(styling).length === 0) {
        return '<span class="no-styling">No style info</span>';
    }
    
    const computedStyles = styling.computedStyles || {};
    const relevantStyles = [
        ['color', computedStyles.color],
        ['bg', computedStyles.backgroundColor],
        ['font-size', computedStyles.fontSize],
        ['display', styling.displayType]
    ].filter(([, value]) => value && value !== 'rgba(0, 0, 0, 0)' && value !== 'transparent');
    
    return `
        <div class="styling-display">
            ${relevantStyles.map(([prop, value]) => {
                const valueStr = safeString(value);
                const valueSafe = valueStr.length > 15 ? valueStr.substring(0, 15) : valueStr;
                return `<div class="style-item" title="${escapeHtml(prop)}: ${escapeHtml(valueStr)}">
                    <strong>${prop}:</strong> ${escapeHtml(valueSafe)}${valueStr.length > 15 ? '...' : ''}
                </div>`;
            }).join('')}
        </div>
    `;
}

// Enhanced filtering function
function applyFilters() {
    if (!scanResults || !scanResults.elements) {
        console.log('🔍 Debug: applyFilters - no scanResults or elements');
        return;
    }

    console.log('🔍 Debug: applyFilters called, elements:', scanResults.elements.length);

    const searchTerm = safeTrim(document.getElementById('searchBox')?.value || '').toLowerCase();
    const tagFilter = document.getElementById('tagFilter')?.value || '';
    const stateFilter = document.getElementById('stateFilter')?.value || '';
    const locatorFilter = document.getElementById('locatorFilter')?.value || '';

    console.log('🔍 Debug: Filter values:', { searchTerm, tagFilter, stateFilter, locatorFilter });

    filteredElements = scanResults.elements.filter(element => {
        // Search filter
        if (searchTerm) {
            const searchableText = [
                safeString(element.tagName),
                safeString(element.text),
                safeString(element.textContent?.cleanText),
                ...(element.locators?.primary?.map(l => safeString(l.selector)) || []),
                ...(element.locators?.secondary?.map(l => safeString(l.selector)) || []),
                ...Object.keys(element.attributes || {}),
                ...Object.values(element.attributes || {}).map(v => safeString(v))
            ].join(' ').toLowerCase();
            
            if (!searchableText.includes(searchTerm)) return false;
        }

        // Tag filter
        if (tagFilter && element.tagName !== tagFilter) return false;

        // State filter
        if (stateFilter) {
            if (stateFilter === 'form' && !element.elementState?.isFormElement) return false;
            if (stateFilter === 'interactive' && !element.elementState?.isInteractive) return false;
            if (stateFilter === 'static' && (element.elementState?.isFormElement || element.elementState?.isInteractive)) return false;
        }

        // Locator filter
        if (locatorFilter) {
            if (locatorFilter === 'has-id' && !element.attributes?.id) return false;
            if (locatorFilter === 'has-data' && !Object.keys(element.attributes || {}).some(key => key.startsWith('data-'))) return false;
            if (locatorFilter === 'has-class' && !element.attributes?.class) return false;
        }

        return true;
    });

    console.log('🔍 Debug: applyFilters result - filtered', filteredElements.length, 'from', scanResults.elements.length, 'elements');
    currentPage = 1; // Reset to first page
    displayElements();
    populateFilterOptions();
}

// Populate filter options based on available data
function populateFilterOptions() {
    if (!scanResults || !scanResults.elements) return;

    const tagFilter = document.getElementById('tagFilter');
    if (tagFilter) {
        const tags = [...new Set(scanResults.elements.map(el => safeString(el.tagName)))].sort();
        tagFilter.innerHTML = '<option value="">All Tags</option>' + 
            tags.map(tag => `<option value="${tag}">${safeString(tag).toUpperCase()}</option>`).join('');
    }
}

// Toggle between compact and detailed view
function toggleView(isCompact) {
    const table = document.querySelector('.elements-table');
    if (table) {
        if (isCompact) {
            table.classList.add('compact-view');
        } else {
            table.classList.remove('compact-view');
        }
    }
}

// Export to JSON function
function exportToJSON() {
    if (!scanResults) return;
    
    const dataToExport = {
        scanInfo: {
            url: scanResults.url,
            title: scanResults.title,
            timestamp: scanResults.timestamp,
            totalElements: filteredElements.length
        },
        elements: filteredElements
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elements-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function exportToCSV() {
    if (!filteredElements || filteredElements.length === 0) return;

    const headers = ['Index', 'Element Name', 'Tag', 'Confidence', 'Text', 'Shadow DOM', 'Primary Locators', 'Secondary Locators', 'Fallback Locators', 'XPath'];
    
    const rows = filteredElements.map((element, index) => [
        index + 1,
        `"${generateElementName(element).replace(/"/g, '""')}"`,
        safeString(element.tagName),
        Math.round((element.confidence || 0) * 100) + '%',
        safeString(element.text) ? `"${safeString(element.text).replace(/"/g, '""')}"` : '',
        element.isShadowDOM ? 'Yes' : 'No',
        (element.locators?.primary || []).map(l => safeString(l.selector)).join('; '),
        (element.locators?.secondary || []).map(l => safeString(l.selector)).join('; '),
        (element.locators?.fallback || []).map(l => safeString(l.selector)).join('; '),
        safeString(element.xpath)
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `element-scan-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function showNoData() {
    document.getElementById('elementsContainer').innerHTML = 
        '<div class="no-data">No scan results found. Please run a scan first.</div>';
}

// Function to highlight elements on the original page
async function highlightElementOnPage(selector) {
    try {
        console.log('🎯 Attempting to highlight element with selector:', selector);
        
        // Show immediate feedback
        showNotification('🔍 Searching for element...', 'info');
        
        // Get the current active tab to send the highlight message
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab || !tab.id) {
            console.error('❌ No active tab found');
            showNotification('❌ No active tab found', 'error');
            return;
        }
        
        console.log('📍 Active tab found:', tab.url);
        
        // Check if the tab URL matches the scanned page URL (more flexible matching)
        if (scanResults && scanResults.url) {
            const scannedUrl = new URL(scanResults.url).pathname;
            const currentUrl = new URL(tab.url).pathname;
            
            // For file:// URLs, compare the full path; for others, compare hostname + pathname
            const urlsMatch = tab.url.startsWith('file://') ? 
                tab.url.split('#')[0] === scanResults.url.split('#')[0] :
                new URL(tab.url).hostname === new URL(scanResults.url).hostname && 
                currentUrl === scannedUrl;
                
            if (!urlsMatch) {
                console.log('⚠️ Active tab URL does not match scanned page');
                console.log('   Current tab:', tab.url);
                console.log('   Scanned page:', scanResults.url);
                showNotification('⚠️ Please switch to the scanned page tab to highlight elements', 'warning');
                return;
            }
        }
        
        // Send message to content script to highlight the element
        console.log('📤 Sending highlight message to tab:', tab.id, 'for selector:', selector);
        
        try {
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'highlightElement',
                selector: selector
            });
            
            console.log('📥 Received response:', response);
            
            if (response && response.success) {
                if (response.found) {
                    console.log('✅ Element highlighted successfully');
                    showNotification('🎯 Element highlighted! Switch to the page tab to see it.', 'success');
                } else {
                    console.log('⚠️ Element not found for highlighting');
                    showNotification('⚠️ Element not found on current page', 'warning');
                }
            } else {
                console.error('❌ Failed to highlight element:', response?.error);
                showNotification('❌ Failed to highlight: ' + (response?.error || 'Unknown error'), 'error');
            }
        } catch (messageError) {
            console.error('❌ Error sending message to content script:', messageError);
            
            // Check if it's a content script injection issue
            if (messageError.message.includes('Could not establish connection') || 
                messageError.message.includes('Receiving end does not exist')) {
                
                console.log('🔄 Content script not found, attempting to inject...');
                
                try {
                    // Try to inject the content script
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                    
                    // Wait a moment for injection
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                    // Try highlighting again
                    const retryResponse = await chrome.tabs.sendMessage(tab.id, {
                        action: 'highlightElement',
                        selector: selector
                    });
                    
                    if (retryResponse && retryResponse.success && retryResponse.found) {
                        console.log('✅ Element highlighted successfully after script injection');
                        showNotification('🎯 Element highlighted! Script injected and element found.', 'success');
                    } else {
                        console.log('⚠️ Element not found after script injection');
                        showNotification('⚠️ Element not found on current page', 'warning');
                    }
                    
                } catch (injectionError) {
                    console.error('❌ Failed to inject content script:', injectionError);
                    showNotification('Cannot highlight on this page type', 'error');
                }
            } else {
                showNotification('Communication error with page: ' + messageError.message, 'error');
            }
        }
        
    } catch (error) {
        console.error('❌ Error highlighting element:', error);
        showNotification('Error highlighting element: ' + error.message, 'error');
    }
}

// Function to show notification messages
function showNotification(message, type = 'info') {
    console.log('🔔 Showing notification:', message, 'Type:', type);
    
    // Create notification element if it doesn't exist
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.cssText = `
            position: fixed !important;
            top: 20px !important;
            right: 20px !important;
            padding: 16px 20px !important;
            border-radius: 12px !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            z-index: 99999 !important;
            opacity: 0 !important;
            transition: all 0.3s ease !important;
            max-width: 400px !important;
            word-wrap: break-word !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
            border: 2px solid transparent !important;
            pointer-events: auto !important;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        `;
        document.body.appendChild(notification);
        console.log('📱 Created new notification element');
    }
    
    // Set styles based on type
    const colors = {
        success: { bg: '#10b981', text: 'white', border: '#059669' },
        error: { bg: '#ef4444', text: 'white', border: '#dc2626' },
        warning: { bg: '#f59e0b', text: 'white', border: '#d97706' },
        info: { bg: '#3b82f6', text: 'white', border: '#2563eb' }
    };
    
    const color = colors[type] || colors.info;
    notification.style.backgroundColor = color.bg + ' !important';
    notification.style.color = color.text + ' !important';
    notification.style.borderColor = color.border + ' !important';
    notification.textContent = message;
    
    // Show notification with animation
    notification.style.opacity = '1 !important';
    notification.style.transform = 'translateY(0) scale(1) !important';
    
    console.log('✅ Notification displayed:', message);
    
    // For highlighting actions, show longer duration
    const duration = message.includes('🎯') || message.includes('🔍') ? 6000 : 4000;
    
    // Hide after specified duration
    setTimeout(() => {
        if (notification) {
            notification.style.opacity = '0 !important';
            notification.style.transform = 'translateY(-10px) scale(0.95) !important';
            console.log('🔔 Notification hidden after', duration, 'ms');
        }
    }, duration);
}

// Helper function to highlight search terms in text
function highlightSearchTerm(text, searchTerm) {
    if (!text || !searchTerm) return escapeHtml(text || '');
    
    const safeText = safeString(text);
    const safeTerm = safeString(searchTerm).toLowerCase();
    
    if (!safeText || !safeTerm) return escapeHtml(safeText);
    
    // Escape HTML first, then apply highlighting
    const escapedText = escapeHtml(safeText);
    
    // Case-insensitive search and replace with highlighting
    const regex = new RegExp(`(${escapeRegex(safeTerm)})`, 'gi');
    return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Helper function to escape regex special characters
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper function to get current search term
function getCurrentSearchTerm() {
    const searchBox = document.getElementById('searchBox');
    return searchBox ? safeTrim(searchBox.value.toLowerCase()) : '';
}
