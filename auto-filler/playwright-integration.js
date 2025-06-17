/**
 * Playwright Element Validator Integration for Element Extractor
 * 
 * This script adds Playwright validation capabilities directly to your Element Extractor.
 * It provides a seamless integration that validates elements in real-time and enhances
 * your extraction results with Playwright compatibility scores.
 */

class PlaywrightIntegration {
    constructor() {
        this.isEnabled = false;
        this.validationCache = new Map();
        this.pendingValidations = new Set();
        this.stats = {
            totalValidated: 0,
            excellentElements: 0,
            goodElements: 0,
            poorElements: 0,
            averageScore: 0
        };
        
        this.log('🎭 Playwright Integration initialized');
    }

    /**
     * Initialize Playwright integration with Element Extractor
     */
    async initialize() {
        try {
            // Check if Playwright validation service is available
            const isAvailable = await this.checkPlaywrightAvailability();
            
            if (isAvailable) {
                this.isEnabled = true;
                this.addPlaywrightUI();
                this.enhanceElementExtraction();
                this.addValidationIndicators();
                
                this.log('✅ Playwright integration activated');
                return true;
            } else {
                this.log('⚠️ Playwright service not available. Running in fallback mode.');
                this.addFallbackUI();
                return false;
            }
        } catch (error) {
            this.log('❌ Failed to initialize Playwright integration:', error);
            return false;
        }
    }

    /**
     * Check if Playwright validation service is available
     */
    async checkPlaywrightAvailability() {
        try {
            // Try to send a test message to background script
            const response = await new Promise((resolve) => {
                chrome.runtime.sendMessage({
                    action: 'playwright_health_check'
                }, (response) => {
                    resolve(response);
                });
            });
            
            return response && response.available;
        } catch (error) {
            return false;
        }
    }

    /**
     * Add Playwright validation UI elements
     */
    addPlaywrightUI() {
        // Add Playwright validation button to the main UI
        const extractButton = document.querySelector('#extract-elements-btn');
        if (extractButton && extractButton.parentNode) {
            const playwrightBtn = document.createElement('button');
            playwrightBtn.id = 'playwright-validate-btn';
            playwrightBtn.className = 'btn btn-secondary playwright-btn';
            playwrightBtn.innerHTML = '🎭 Validate with Playwright';
            playwrightBtn.title = 'Validate extracted elements with Playwright for automation compatibility';
            
            playwrightBtn.addEventListener('click', () => this.validateAllElements());
            
            extractButton.parentNode.insertBefore(playwrightBtn, extractButton.nextSibling);
        }

        // Add validation mode toggle
        const controlsArea = document.querySelector('.controls-section') || document.querySelector('#controls');
        if (controlsArea) {
            const toggleContainer = document.createElement('div');
            toggleContainer.className = 'playwright-toggle-container';
            toggleContainer.innerHTML = `
                <label class="playwright-toggle">
                    <input type="checkbox" id="auto-playwright-validation" />
                    <span>🎭 Auto-validate with Playwright</span>
                    <small>Automatically validate elements as they're extracted</small>
                </label>
            `;
            
            controlsArea.appendChild(toggleContainer);
            
            // Add toggle event listener
            const autoToggle = document.getElementById('auto-playwright-validation');
            if (autoToggle) {
                autoToggle.addEventListener('change', (e) => {
                    this.autoValidationEnabled = e.target.checked;
                    this.log(this.autoValidationEnabled ? 'Auto-validation enabled' : 'Auto-validation disabled');
                });
            }
        }

        // Add Playwright stats panel
        this.addStatsPanel();
    }

    /**
     * Add fallback UI when Playwright is not available
     */
    addFallbackUI() {
        const extractButton = document.querySelector('#extract-elements-btn');
        if (extractButton && extractButton.parentNode) {
            const infoBtn = document.createElement('button');
            infoBtn.className = 'btn btn-info playwright-info-btn';
            infoBtn.innerHTML = '💡 Enable Playwright';
            infoBtn.title = 'Click to learn how to enable Playwright validation';
            
            infoBtn.addEventListener('click', () => this.showPlaywrightSetupInfo());
            
            extractButton.parentNode.insertBefore(infoBtn, extractButton.nextSibling);
        }
    }

    /**
     * Add statistics panel for Playwright validation
     */
    addStatsPanel() {
        const resultsArea = document.querySelector('#results') || document.querySelector('.results-section');
        if (resultsArea) {
            const statsPanel = document.createElement('div');
            statsPanel.id = 'playwright-stats-panel';
            statsPanel.className = 'playwright-stats-panel';
            statsPanel.innerHTML = `
                <div class="stats-header">
                    <h4>🎭 Playwright Validation Stats</h4>
                    <button id="refresh-stats-btn" class="btn-small">🔄 Refresh</button>
                </div>
                <div class="stats-content">
                    <div class="stat-item">
                        <span class="stat-label">Total Validated:</span>
                        <span class="stat-value" id="total-validated">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Excellent (A+/A):</span>
                        <span class="stat-value excellent" id="excellent-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Good (B/C):</span>
                        <span class="stat-value good" id="good-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Poor (D/F):</span>
                        <span class="stat-value poor" id="poor-count">0</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Average Score:</span>
                        <span class="stat-value" id="average-score">0%</span>
                    </div>
                </div>
            `;
            
            resultsArea.insertBefore(statsPanel, resultsArea.firstChild);
            
            // Add refresh button listener
            document.getElementById('refresh-stats-btn').addEventListener('click', () => {
                this.updateStatsDisplay();
            });
        }
    }

    /**
     * Enhance the element extraction process with Playwright validation
     */
    enhanceElementExtraction() {
        // Hook into the existing extraction process
        const originalExtraction = window.domExtractionFunction;
        if (originalExtraction) {
            window.domExtractionFunction = async (filters) => {
                const originalResults = originalExtraction(filters);
                
                // Add Playwright validation if auto-validation is enabled
                if (this.autoValidationEnabled && this.isEnabled) {
                    this.log('🔄 Auto-validating extracted elements...');
                    return await this.enhanceExtractionResults(originalResults);
                }
                
                return originalResults;
            };
        }
    }

    /**
     * Enhance extraction results with Playwright validation
     */
    async enhanceExtractionResults(originalResults) {
        if (!originalResults || !Array.isArray(originalResults)) {
            return originalResults;
        }

        const enhancedResults = [];
        
        for (const item of originalResults) {
            const locator = item['Best Locator'] || item.locator;
            
            if (locator && !this.pendingValidations.has(locator)) {
                try {
                    this.pendingValidations.add(locator);
                    
                    const validation = await this.validateElementWithPlaywright(locator, {
                        elementName: item['Element Name'],
                        elementType: item['Element Type'],
                        originalStrength: item['Strength']
                    });
                    
                    // Enhance the item with Playwright data
                    const enhancedItem = {
                        ...item,
                        'Playwright Score': validation.score,
                        'Playwright Grade': validation.grade,
                        'Playwright Compatible': validation.passed ? 'Yes' : 'No',
                        'Locator Quality': validation.quality,
                        'Validation Status': validation.status,
                        'Alternative Locators': validation.alternatives ? validation.alternatives.slice(0, 2).join(' | ') : '',
                        'Recommendations': validation.recommendations ? validation.recommendations.slice(0, 1).join('; ') : ''
                    };
                    
                    enhancedResults.push(enhancedItem);
                    this.updateStats(validation);
                    
                } catch (error) {
                    this.log(`⚠️ Validation failed for ${locator}:`, error);
                    enhancedResults.push({
                        ...item,
                        'Playwright Score': 0,
                        'Playwright Grade': 'F',
                        'Playwright Compatible': 'Error',
                        'Validation Status': 'Failed'
                    });
                } finally {
                    this.pendingValidations.delete(locator);
                }
            } else {
                enhancedResults.push(item);
            }
        }
        
        this.updateStatsDisplay();
        return enhancedResults;
    }

    /**
     * Validate a single element with Playwright
     */
    async validateElementWithPlaywright(locator, context = {}) {
        // Check cache first
        const cacheKey = `${locator}:${JSON.stringify(context)}`;
        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey);
        }

        try {
            this.log(`🔍 Validating: ${locator}`);
            
            // Send validation request to background script
            const response = await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Validation timeout'));
                }, 30000); // 30 second timeout
                
                chrome.runtime.sendMessage({
                    action: 'validate_playwright_element',
                    locator: locator,
                    context: context,
                    url: window.location.href
                }, (response) => {
                    clearTimeout(timeout);
                    
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });

            if (response && response.success) {
                const validation = {
                    score: response.data.score || 0,
                    grade: response.data.grade || 'F',
                    passed: response.data.passed || false,
                    quality: response.data.quality || 'Poor',
                    status: 'Validated',
                    alternatives: response.data.alternatives || [],
                    recommendations: response.data.recommendations || [],
                    timestamp: Date.now()
                };
                
                // Cache the result
                this.validationCache.set(cacheKey, validation);
                
                return validation;
            } else {
                throw new Error(response ? response.error : 'Unknown validation error');
            }
            
        } catch (error) {
            this.log(`❌ Validation error for ${locator}:`, error);
            
            const fallbackValidation = {
                score: this.calculateFallbackScore(locator),
                grade: this.calculateFallbackGrade(locator),
                passed: false,
                quality: this.assessFallbackQuality(locator),
                status: 'Fallback',
                alternatives: [],
                recommendations: ['Enable Playwright service for full validation'],
                timestamp: Date.now()
            };
            
            return fallbackValidation;
        }
    }

    /**
     * Validate all currently extracted elements
     */
    async validateAllElements() {
        const extractedElements = this.getCurrentExtractedElements();
        
        if (!extractedElements || extractedElements.length === 0) {
            this.showMessage('No elements found to validate. Please extract elements first.', 'warning');
            return;
        }

        this.showMessage(`🎭 Validating ${extractedElements.length} elements with Playwright...`, 'info');
        
        try {
            const validatedElements = await this.enhanceExtractionResults(extractedElements);
            
            // Update the display with validated elements
            this.updateElementsDisplay(validatedElements);
            
            // Update stats
            this.updateStatsDisplay();
            
            this.showMessage(`✅ Validation completed! ${validatedElements.length} elements validated.`, 'success');
            
        } catch (error) {
            this.log('❌ Batch validation failed:', error);
            this.showMessage('❌ Validation failed. Please try again.', 'error');
        }
    }

    /**
     * Get currently extracted elements from the UI
     */
    getCurrentExtractedElements() {
        // This would need to integrate with your existing element extraction display logic
        // For now, returning empty array - you'd replace this with actual extraction logic
        if (window.currentExtractedElements) {
            return window.currentExtractedElements;
        }
        
        // Try to get from table if displayed
        const table = document.querySelector('#elements-table, .elements-table');
        if (table) {
            return this.parseElementsFromTable(table);
        }
        
        return [];
    }

    /**
     * Parse elements from displayed table
     */
    parseElementsFromTable(table) {
        const elements = [];
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                elements.push({
                    'Element Name': cells[0]?.textContent?.trim() || '',
                    'Element Type': cells[1]?.textContent?.trim() || '',
                    'Best Locator': cells[2]?.textContent?.trim() || '',
                    'Locator Type': cells[3]?.textContent?.trim() || '',
                    'Strength': parseInt(cells[4]?.textContent?.trim()) || 0
                });
            }
        });
        
        return elements;
    }

    /**
     * Update the elements display with validation results
     */
    updateElementsDisplay(validatedElements) {
        // Store for future reference
        window.currentExtractedElements = validatedElements;
        
        // Trigger a re-render of the elements table with enhanced data
        if (window.renderElementsTable) {
            window.renderElementsTable(validatedElements);
        }
        
        // Add visual indicators
        this.addValidationIndicators();
    }

    /**
     * Add visual validation indicators to the UI
     */
    addValidationIndicators() {
        // Add CSS classes for validation status
        const rows = document.querySelectorAll('#elements-table tbody tr, .elements-table tbody tr');
        
        rows.forEach(row => {
            const gradeCell = row.querySelector('.playwright-grade');
            if (gradeCell) {
                const grade = gradeCell.textContent.trim();
                
                // Remove existing classes
                row.classList.remove('playwright-excellent', 'playwright-good', 'playwright-poor');
                
                // Add appropriate class
                if (['A+', 'A'].includes(grade)) {
                    row.classList.add('playwright-excellent');
                } else if (['B', 'C'].includes(grade)) {
                    row.classList.add('playwright-good');
                } else if (['D', 'F'].includes(grade)) {
                    row.classList.add('playwright-poor');
                }
            }
        });
    }

    /**
     * Update statistics display
     */
    updateStatsDisplay() {
        const totalElem = document.getElementById('total-validated');
        const excellentElem = document.getElementById('excellent-count');
        const goodElem = document.getElementById('good-count');
        const poorElem = document.getElementById('poor-count');
        const averageElem = document.getElementById('average-score');
        
        if (totalElem) totalElem.textContent = this.stats.totalValidated;
        if (excellentElem) excellentElem.textContent = this.stats.excellentElements;
        if (goodElem) goodElem.textContent = this.stats.goodElements;
        if (poorElem) poorElem.textContent = this.stats.poorElements;
        if (averageElem) averageElem.textContent = `${this.stats.averageScore}%`;
    }

    /**
     * Update internal statistics
     */
    updateStats(validation) {
        this.stats.totalValidated++;
        
        if (validation.score >= 80) {
            this.stats.excellentElements++;
        } else if (validation.score >= 60) {
            this.stats.goodElements++;
        } else {
            this.stats.poorElements++;
        }
        
        // Update average score
        const totalScore = (this.stats.averageScore * (this.stats.totalValidated - 1)) + validation.score;
        this.stats.averageScore = Math.round(totalScore / this.stats.totalValidated);
    }

    /**
     * Calculate fallback score when Playwright is not available
     */
    calculateFallbackScore(locator) {
        let score = 0;
        
        // Basic scoring based on locator patterns
        if (locator.includes('data-testid') || locator.includes('data-test')) score += 40;
        if (locator.includes('#') && !locator.includes(' ')) score += 30;
        if (locator.includes('[aria-label=')) score += 25;
        if (locator.includes('[role=')) score += 20;
        if (locator.includes('.') && !locator.includes(' > ')) score += 15;
        
        // Penalties
        if (locator.includes(':nth-child') || locator.includes(' > ')) score -= 20;
        if (locator.includes('text=')) score -= 10;
        
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Calculate fallback grade
     */
    calculateFallbackGrade(locator) {
        const score = this.calculateFallbackScore(locator);
        if (score >= 80) return 'A';
        if (score >= 60) return 'B';
        if (score >= 40) return 'C';
        if (score >= 20) return 'D';
        return 'F';
    }

    /**
     * Assess fallback quality
     */
    assessFallbackQuality(locator) {
        const score = this.calculateFallbackScore(locator);
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Poor';
    }

    /**
     * Show setup information for Playwright
     */
    showPlaywrightSetupInfo() {
        const modal = document.createElement('div');
        modal.className = 'playwright-setup-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🎭 Enable Playwright Validation</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    <p>To enable Playwright validation, you need to:</p>
                    <ol>
                        <li><strong>Install dependencies:</strong>
                            <code>npm install playwright</code>
                        </li>
                        <li><strong>Run the validation service:</strong>
                            <code>npm run test:playwright</code>
                        </li>
                        <li><strong>Reload this extension</strong></li>
                    </ol>
                    
                    <div class="benefits">
                        <h4>💡 Benefits of Playwright Validation:</h4>
                        <ul>
                            <li>✅ Real browser testing of your locators</li>
                            <li>📊 Compatibility scores for automation tools</li>
                            <li>💡 Alternative locator suggestions</li>
                            <li>🎯 Element interaction testing</li>
                            <li>📈 Quality metrics and reporting</li>
                        </ul>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="window.open('${window.location.origin}/PLAYWRIGHT_VALIDATOR_README.md')">
                        📚 View Documentation
                    </button>
                    <button class="btn btn-secondary close-modal">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add close listeners
        modal.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    /**
     * Show message to user
     */
    showMessage(message, type = 'info') {
        // Create or update message element
        let messageElem = document.getElementById('playwright-message');
        if (!messageElem) {
            messageElem = document.createElement('div');
            messageElem.id = 'playwright-message';
            messageElem.className = 'playwright-message';
            
            const container = document.querySelector('#results') || document.body;
            container.insertBefore(messageElem, container.firstChild);
        }
        
        messageElem.className = `playwright-message ${type}`;
        messageElem.textContent = message;
        
        // Auto-hide after 5 seconds for non-error messages
        if (type !== 'error') {
            setTimeout(() => {
                if (messageElem.parentNode) {
                    messageElem.parentNode.removeChild(messageElem);
                }
            }, 5000);
        }
    }

    /**
     * Enhance CSV export with Playwright data
     */
    enhanceCSVExport() {
        // Hook into existing CSV export functionality
        const originalExport = window.exportToCSV || window.exportElementsToCSV;
        
        if (originalExport) {
            window.exportToCSV = (elements, filename = 'enhanced-elements-extract.csv') => {
                // Ensure elements have Playwright data
                const enhancedElements = elements.map(element => ({
                    ...element,
                    'Playwright Score': element['Playwright Score'] || 'Not validated',
                    'Playwright Grade': element['Playwright Grade'] || 'N/A',
                    'Playwright Compatible': element['Playwright Compatible'] || 'Unknown',
                    'Locator Quality': element['Locator Quality'] || 'Unknown'
                }));
                
                return originalExport(enhancedElements, filename);
            };
        }
    }

    /**
     * Utility logging function
     */
    log(...args) {
        console.log('[PlaywrightIntegration]', ...args);
    }
}

// CSS styles for Playwright integration
const playwrightStyles = `
<style>
.playwright-btn {
    background: linear-gradient(135deg, #9333ea, #c084fc);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    margin-left: 8px;
    transition: all 0.2s ease;
}

.playwright-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
}

.playwright-toggle-container {
    margin: 10px 0;
    padding: 10px;
    background: #f8fafc;
    border-radius: 6px;
    border-left: 4px solid #9333ea;
}

.playwright-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
}

.playwright-toggle input[type="checkbox"] {
    margin: 0;
}

.playwright-toggle small {
    display: block;
    color: #6b7280;
    font-size: 0.875rem;
    margin-left: 24px;
}

.playwright-stats-panel {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 8px;
}

.stats-header h4 {
    margin: 0;
    color: #1f2937;
}

.btn-small {
    padding: 4px 8px;
    font-size: 0.75rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 4px;
    cursor: pointer;
}

.stats-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f9fafb;
    border-radius: 6px;
}

.stat-label {
    font-weight: 500;
    color: #374151;
}

.stat-value {
    font-weight: 600;
    font-size: 1.1em;
}

.stat-value.excellent {
    color: #10b981;
}

.stat-value.good {
    color: #f59e0b;
}

.stat-value.poor {
    color: #ef4444;
}

.playwright-excellent {
    background-color: #ecfdf5 !important;
    border-left: 4px solid #10b981;
}

.playwright-good {
    background-color: #fffbeb !important;
    border-left: 4px solid #f59e0b;
}

.playwright-poor {
    background-color: #fef2f2 !important;
    border-left: 4px solid #ef4444;
}

.playwright-message {
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-weight: 500;
}

.playwright-message.info {
    background: #dbeafe;
    color: #1e40af;
    border: 1px solid #93c5fd;
}

.playwright-message.success {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
}

.playwright-message.warning {
    background: #fef3c7;
    color: #92400e;
    border: 1px solid #fcd34d;
}

.playwright-message.error {
    background: #fee2e2;
    color: #dc2626;
    border: 1px solid #fca5a5;
}

.playwright-setup-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.modal-content {
    background: white;
    border-radius: 8px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
    margin: 0;
    color: #1f2937;
}

.close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
}

.close-btn:hover {
    background: #f3f4f6;
}

.modal-body {
    padding: 20px;
}

.modal-body code {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
}

.benefits {
    margin-top: 20px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 6px;
    border-left: 4px solid #9333ea;
}

.benefits h4 {
    margin-top: 0;
    color: #1f2937;
}

.benefits ul {
    margin-bottom: 0;
}

.benefits li {
    margin: 6px 0;
}

.modal-footer {
    display: flex;
    gap: 12px;
    padding: 20px;
    border-top: 1px solid #e5e7eb;
    justify-content: flex-end;
}

.btn {
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s ease;
}

.btn-primary {
    background: #9333ea;
    color: white;
}

.btn-primary:hover {
    background: #7c3aed;
}

.btn-secondary {
    background: #f3f4f6;
    color: #374151;
    border-color: #d1d5db;
}

.btn-secondary:hover {
    background: #e5e7eb;
}
</style>
`;

// Add styles to page
document.head.insertAdjacentHTML('beforeend', playwrightStyles);

// Initialize Playwright integration when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.playwrightIntegration = new PlaywrightIntegration();
        window.playwrightIntegration.initialize();
    });
} else {
    window.playwrightIntegration = new PlaywrightIntegration();
    window.playwrightIntegration.initialize();
}

// Export for use in other scripts
window.PlaywrightIntegration = PlaywrightIntegration;
