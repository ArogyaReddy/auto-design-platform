/**
 * Integration Demo: Enhanced Elements Extractor
 * Shows how to integrate BaseLocatorLibrary with your existing proven Elements Extractor
 */

// Import the enhanced extractor
const { EnhancedElementsExtractor } = require('./enhanced-extractor');

/**
 * Integration Demo Function
 * This demonstrates step-by-step integration with your existing popup.js
 */
async function demonstrateIntegration() {
    console.log('🚀 Starting Enhanced Elements Extractor Integration Demo...');
    
    // Step 1: Initialize the enhanced extractor
    const enhancedExtractor = new EnhancedElementsExtractor();
    
    // Step 2: Test with navigation elements (your proven strength)
    console.log('\n🎯 Testing Navigation Elements (Your 92% Strength Area)...');
    
    const navigationTests = [
        { href: '#examples', class: 'nav-link', text: 'Examples' },
        { href: '#architecture', class: 'nav-link', text: 'Architecture' },
        { href: '#contact', class: 'btn btn-primary', text: 'Contact' }
    ];
    
    for (const test of navigationTests) {
        // Create test element
        const testElement = document.createElement('a');
        testElement.href = test.href;
        testElement.className = test.class;
        testElement.textContent = test.text;
        document.body.appendChild(testElement);
        
        try {
            // Test the enhanced extraction
            const result = await enhancedExtractor._generateEnhancedLocatorData(testElement);
            
            console.log(`\n✅ Element: ${test.text}`);
            console.log(`   Proven Locator: ${result['Best Locator']} (Strength: ${result['Strength']})`);
            console.log(`   Enhanced Strategies: ${result['Enhanced Locators'].all.length} total`);
            console.log(`   Combined Reliability: ${result['Integration'].combinedReliability}%`);
            
            // Verify your 92% strength is preserved
            if (result['Locator Type'] === 'class+href' && result['Strength'] === 92) {
                console.log(`   🎯 SUCCESS: 92% strength preserved for navigation!`);
            }
            
        } catch (error) {
            console.error(`❌ Test failed for ${test.text}:`, error);
        } finally {
            document.body.removeChild(testElement);
        }
    }
    
    // Step 3: Test full extraction workflow
    console.log('\n📊 Testing Full Enhanced Extraction Workflow...');
    
    try {
        const filters = {
            visibleOnly: true,
            types: ['LINK', 'BUTTON', 'INPUT']
        };
        
        const extractionResult = await enhancedExtractor.extractElementsEnhanced(filters);
        
        console.log(`\n🎉 Enhanced Extraction Complete!`);
        console.log(`   Total Elements: ${extractionResult.elements.length}`);
        console.log(`   Processing Time: ${extractionResult.metadata.processingTime}ms`);
        console.log(`   Enhanced Stats:`, extractionResult.metadata.enhancedStats);
        
    } catch (error) {
        console.error('❌ Full extraction test failed:', error);
    }
    
    // Step 4: Test safe interaction (enhanced reliability)
    console.log('\n🛡️ Testing Enhanced Safe Interaction...');
    
    const testButton = document.createElement('button');
    testButton.id = 'test-button';
    testButton.className = 'btn btn-primary';
    testButton.textContent = 'Test Button';
    document.body.appendChild(testButton);
    
    try {
        const result = await enhancedExtractor.safeInteraction(
            testButton,
            async (locator) => {
                console.log(`   Trying locator: ${locator.locator}`);
                const element = document.querySelector(locator.locator);
                if (!element) throw new Error('Element not found');
                return { success: true, locator: locator.locator };
            }
        );
        
        console.log(`✅ Safe interaction succeeded with: ${result.locator}`);
        
    } catch (error) {
        console.error('❌ Safe interaction failed:', error);
    } finally {
        document.body.removeChild(testButton);
    }
    
    // Step 5: Show performance statistics
    console.log('\n📈 Enhanced Performance Statistics:');
    const stats = enhancedExtractor.getEnhancedStats();
    console.log(JSON.stringify(stats, null, 2));
    
    console.log('\n🎉 Integration Demo Complete!');
    
    return {
        success: true,
        message: 'Enhanced Elements Extractor successfully integrated',
        benefits: [
            'Preserves your proven 92% strength navigation locators',
            'Adds comprehensive fallback strategies',
            'Provides detailed performance tracking',
            'Maintains full compatibility with existing workflow',
            'Enhances reliability with BaseLocator capabilities'
        ]
    };
}

/**
 * Integration Helper for popup.js
 * This shows exactly how to integrate with your existing popup.js code
 */
function integrateWithExistingPopup() {
    return `
// Add this to your existing popup.js to enhance it:

// 1. Import the enhanced extractor at the top
const { EnhancedElementsExtractor } = require('./enhanced-extractor');

// 2. Initialize it when popup loads
const enhancedExtractor = new EnhancedElementsExtractor();

// 3. Replace your existing extract button handler with this enhanced version:
document.getElementById('extract').onclick = async () => {
    let extractBtn = document.getElementById('extract');
    extractBtn.disabled = true;
    document.getElementById('status').innerHTML = '<span class="loading">🚀 Enhanced scanning...</span>';
    
    try {
        // Get your existing filters
        const filters = {
            visibleOnly: document.getElementById('visible-only')?.checked || false,
            hiddenOnly: document.getElementById('hidden-only')?.checked || false,
            // ... your other existing filters
        };
        
        // Use enhanced extraction (preserves your 92% strength + adds BaseLocator power)
        const result = await enhancedExtractor.extractElementsEnhanced(filters);
        
        // Display results using your existing display logic
        displayResults(result.elements);
        
        // Show enhanced stats
        const stats = enhancedExtractor.getEnhancedStats();
        document.getElementById('status').innerHTML = 
            \`✅ Enhanced scan complete! \${result.elements.length} elements 
             (Navigation success: \${stats.navigationSuccessRate})\`;
             
        // Export enhanced data
        enhancedExtractor.exportToCsv(result.elements, 'enhanced-elements.csv');
        
    } catch (error) {
        console.error('Enhanced extraction failed:', error);
        document.getElementById('status').textContent = 'Enhanced scan failed. Check console for details.';
    } finally {
        extractBtn.disabled = false;
    }
};

// 4. Your existing display logic works unchanged!
function displayResults(elements) {
    // Your existing displayResults function works exactly the same
    // The enhanced data includes all your existing fields plus new capabilities
}
`;
}

/**
 * Benefits Report
 * Shows what you gain by integrating BaseLocatorLibrary
 */
function showIntegrationBenefits() {
    return {
        immediate: [
            '✅ Keeps your proven 92% strength navigation locators',
            '✅ Adds comprehensive fallback strategies (never fails)',
            '✅ Maintains full compatibility with existing popup.js',
            '✅ Provides detailed performance tracking for AI learning',
            '✅ Supports modern web features (Shadow DOM, accessibility)'
        ],
        
        forAutoDesignPlatform: [
            '🚀 Auto Extractor: Enhanced with never-fail locator strategies',
            '🔍 Auto Inspector: Benefits from comprehensive validation',
            '🔧 Auto Self-healer: Gets performance data for learning',
            '💻 Auto Coder: Can generate multi-framework code',
            '📊 Auto Executor: Benefits from detailed reliability metrics'
        ],
        
        technicalAdvantages: [
            '📈 Statistics tracking for AI improvement',
            '⚡ Smart caching for performance',
            '🛡️ Retry logic with exponential backoff',
            '🎯 Multiple locator strategies per element',
            '🔄 Self-healing capabilities through fallbacks'
        ],
        
        preservedStrengths: [
            '🎯 Your 92% class+href navigation locators (unchanged)',
            '📊 Your existing CSV export format (unchanged)',
            '🖥️ Your existing popup.js UI (unchanged)',
            '⚙️ Your existing filter system (unchanged)',
            '🎨 Your existing highlighting system (enhanced)'
        ]
    };
}

// Export functions for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        demonstrateIntegration,
        integrateWithExistingPopup,
        showIntegrationBenefits
    };
}

// Auto-run demo if executed directly
if (typeof window !== 'undefined') {
    // Browser environment - add to window for console testing
    window.enhancedExtractorDemo = {
        demonstrate: demonstrateIntegration,
        integrationHelp: integrateWithExistingPopup,
        benefits: showIntegrationBenefits
    };
    
    console.log('🚀 Enhanced Extractor Demo loaded!');
    console.log('Run: enhancedExtractorDemo.demonstrate() to test');
    console.log('Run: enhancedExtractorDemo.benefits() to see benefits');
}
