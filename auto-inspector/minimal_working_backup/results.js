// Results page JavaScript for Universal Element Locator Extension
// This file handles the detailed results page functionality

let scanResults = null;
let filteredElements = [];
let currentPage = 1;
const itemsPerPage = 50;

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await loadScanResults();
    setupEventListeners();
});

async function loadScanResults() {
    try {
        const result = await chrome.storage.local.get(['scanResults']);
        if (result.scanResults) {
            scanResults = result.scanResults;
            displayResults();
        } else {
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

    // Update statistics
    displayStatistics();

    // Populate filters
    populateFilters();

    // Display elements
    filteredElements = scanResults.elements || [];
    displayElements();
}

function displayStatistics() {
    const stats = [
        { label: 'Total Elements', value: scanResults.totalElements || 0, color: '#667eea' },
        { label: 'Primary Locators', value: scanResults.elementsWithPrimary || 0, color: '#10b981' },
        { label: 'Secondary Locators', value: scanResults.elementsWithSecondary || 0, color: '#f59e0b' },
        { label: 'Shadow DOM', value: scanResults.shadowDOMElements || 0, color: '#8b5cf6' }
    ];

    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = stats.map(stat => `
        <div class="stat-card" style="background: linear-gradient(135deg, ${stat.color}, ${stat.color}dd)">
            <div class="stat-number">${stat.value}</div>
            <div class="stat-label">${stat.label}</div>
        </div>
    `).join('');
}

function populateFilters() {
    // Populate tag filter
    const tagFilter = document.getElementById('tagFilter');
    const tags = [...new Set((scanResults.elements || []).map(el => el.tagName))].sort();
    
    tagFilter.innerHTML = '<option value="">All Tags</option>' + 
        tags.map(tag => `<option value="${tag}">${tag.toUpperCase()}</option>`).join('');
}

function displayElements() {
    const container = document.getElementById('elementsContainer');
    
    if (filteredElements.length === 0) {
        container.innerHTML = '<div class="no-data">No elements found matching the current filters.</div>';
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(filteredElements.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageElements = filteredElements.slice(startIndex, endIndex);

    // Create table with wrapper
    const tableContent = `
        <div class="table-wrapper">
            <table class="elements-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Element Name</th>
                        <th>Tag</th>
                        <th>Confidence</th>
                        <th>Text</th>
                        <th>Primary Locators</th>
                        <th>Secondary Locators</th>
                        <th>Fallback Locators</th>
                        <th>Position</th>
                    </tr>
                </thead>
                <tbody>
                    ${pageElements.map((element, index) => createElementRow(element, startIndex + index)).join('')}
                </tbody>
            </table>
        </div>
    `;

    const pagination = createPagination(totalPages);
    container.innerHTML = tableContent + pagination;
}

function createElementRow(element, index) {
    const confidence = (element.confidence * 100).toFixed(0);
    const confidenceClass = confidence >= 80 ? 'confidence-high' : 
                          confidence >= 60 ? 'confidence-medium' : 'confidence-low';

    const shadowIndicator = element.isShadowDOM ? '<span class="shadow-indicator">🌑</span>' : '';
    
    // Generate element name based on available attributes
    const elementName = generateElementName(element);

    return `
        <tr>
            <td>${index + 1}</td>
            <td><span class="element-name" title="${elementName}">${elementName}</span></td>
            <td><span class="element-tag">${element.tagName.toUpperCase()}</span> ${shadowIndicator}</td>
            <td><span class="confidence-badge ${confidenceClass}">${confidence}%</span></td>
            <td title="${element.text}">${element.text ? element.text.substring(0, 30) + (element.text.length > 30 ? '...' : '') : '-'}</td>
            <td>${createLocatorsList(element.locators.primary, 'primary')}</td>
            <td>${createLocatorsList(element.locators.secondary, 'secondary')}</td>
            <td>${createLocatorsList(element.locators.fallback, 'fallback')}</td>
            <td>${element.position ? `${element.position.x},${element.position.y}` : '-'}</td>
        </tr>
    `;
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
                const match = locator.selector.match(/#([^.\s\[]+)/);
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
    if (element.text && element.text.trim().length > 0 && element.text.length <= 50) {
        return element.text.trim();
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
                const match = locator.selector.match(/\.([^.\s\[]+)/);
                if (match && !match[1].match(/^(btn|button|input|div|span|container)$/i)) {
                    return match[1];
                }
            }
        }
    }
    
    // 6. Default to tag name with index
    return `${element.tagName.toLowerCase()}_element`;
}

function createLocatorsList(locators, type) {
    if (!locators || locators.length === 0) return '-';
    
    const locatorId = `locators_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return `<div class="locators-list" data-locator-id="${locatorId}">
        <div class="locators-header">
            <button class="copy-btn" data-action="copy-all" data-type="${type}" title="Copy all ${type} locators">
                📋 Copy All
            </button>
        </div>
        ${locators.map((loc, index) => 
            `<div class="locator-item locator-${type}" data-locator="${escapeHtml(loc.selector)}">
                <div class="locator-type">${loc.type}:</div>
                <div class="locator-value" title="${escapeHtml(loc.selector)}">${escapeHtml(loc.selector)}</div>
                <button class="copy-single-btn" data-action="copy-single" data-locator="${escapeHtml(loc.selector)}" title="Copy this locator">📋</button>
            </div>`
        ).join('')}
    </div>`;
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
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
    if (totalPages <= 1) return '';

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
        pages.push(`
            <button data-page="${i}" ${i === currentPage ? 'class="active"' : ''}>
                ${i}
            </button>
        `);
    }

    return `
        <div class="pagination">
            <button data-page="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''}>
                ← Previous
            </button>
            ${pages.join('')}
            <button data-page="${currentPage + 1}" ${currentPage === totalPages ? 'disabled' : ''}>
                Next →
            </button>
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
    // Search functionality
    document.getElementById('searchBox').addEventListener('input', applyFilters);
    document.getElementById('confidenceFilter').addEventListener('change', applyFilters);
    document.getElementById('tagFilter').addEventListener('change', applyFilters);
    
    // Export functionality
    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
    
    // Pagination event delegation
    document.getElementById('elementsContainer').addEventListener('click', function(event) {
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
            }
        }
    });
}

function applyFilters() {
    if (!scanResults || !scanResults.elements) return;

    const searchTerm = document.getElementById('searchBox').value.toLowerCase();
    const confidenceFilter = document.getElementById('confidenceFilter').value;
    const tagFilter = document.getElementById('tagFilter').value;

    filteredElements = scanResults.elements.filter(element => {
        // Search filter
        const matchesSearch = !searchTerm || 
            element.tagName.toLowerCase().includes(searchTerm) ||
            (element.text && element.text.toLowerCase().includes(searchTerm)) ||
            JSON.stringify(element.locators).toLowerCase().includes(searchTerm);

        // Confidence filter
        const confidence = element.confidence * 100;
        const matchesConfidence = !confidenceFilter ||
            (confidenceFilter === 'high' && confidence >= 80) ||
            (confidenceFilter === 'medium' && confidence >= 60 && confidence < 80) ||
            (confidenceFilter === 'low' && confidence < 60);

        // Tag filter
        const matchesTag = !tagFilter || element.tagName === tagFilter;

        return matchesSearch && matchesConfidence && matchesTag;
    });

    currentPage = 1;
    displayElements();
}

function exportToCSV() {
    if (!filteredElements || filteredElements.length === 0) return;

    const headers = ['Index', 'Element Name', 'Tag', 'Confidence', 'Text', 'Shadow DOM', 'Primary Locators', 'Secondary Locators', 'Fallback Locators', 'XPath'];
    
    const rows = filteredElements.map((element, index) => [
        index + 1,
        `"${generateElementName(element).replace(/"/g, '""')}"`,
        element.tagName,
        Math.round(element.confidence * 100) + '%',
        element.text ? `"${element.text.replace(/"/g, '""')}"` : '',
        element.isShadowDOM ? 'Yes' : 'No',
        element.locators.primary.map(l => l.selector).join('; '),
        element.locators.secondary.map(l => l.selector).join('; '),
        element.locators.fallback.map(l => l.selector).join('; '),
        element.xpath || ''
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
