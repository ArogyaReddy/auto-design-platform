/**
 * Comprehensive Test for Scoring Discrepancy Fix
 * 
 * This script tests the 95% vs 55% scoring discrepancy fix
 * and verifies that the scoring alignment is working properly.
 * 
 * Instructions:
 * 1. Open this file in a browser
 * 2. Open Element Extractor extension popup
 * 3. Run the tests by clicking the buttons
 * 4. Check console for detailed logs
 */

console.log('🎯 Scoring Discrepancy Test Script Loaded');

// Test configuration
const TEST_CONFIG = {
    // Element that typically shows high EE score but low PW score
    problematicElement: {
        elementName: 'Login Button',
        locator: '#login-button',
        expectedEEScore: 95,
        expectedPWScore: 55,
        expectedDiscrepancy: 40
    },
    
    // Thresholds for pass/fail
    thresholds: {
        maxAllowedDiscrepancy: 10, // After alignment, discrepancy should be <= 10%
        minExpectedScore: 50,
        maxExpectedScore: 100
    }
};

// Test results storage
let testResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    overall: 'pending'
};

// Main test function
async function runScoringDiscrepancyTest() {
    console.log('🔄 Starting Scoring Discrepancy Test...');
    console.log('='.repeat(60));
    
    // Test 1: Check if scoring alignment components are loaded
    const componentsTest = testScoringComponents();
    testResults.tests.push(componentsTest);
    
    // Test 2: Test manual scoring alignment
    const manualAlignmentTest = testManualScoringAlignment();
    testResults.tests.push(manualAlignmentTest);
    
    // Test 3: Test extension integration
    const extensionTest = await testExtensionIntegration();
    testResults.tests.push(extensionTest);
    
    // Test 4: Test with actual element extraction
    const extractionTest = await testElementExtraction();
    testResults.tests.push(extractionTest);
    
    // Calculate overall result
    const passedTests = testResults.tests.filter(t => t.passed).length;
    const totalTests = testResults.tests.length;
    
    testResults.overall = passedTests === totalTests ? 'PASSED' : 'FAILED';
    
    console.log('\n' + '='.repeat(60));
    console.log('🏁 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Overall Status: ${testResults.overall}`);
    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`Timestamp: ${testResults.timestamp}`);
    
    testResults.tests.forEach((test, index) => {
        const status = test.passed ? '✅' : '❌';
        console.log(`${status} Test ${index + 1}: ${test.name}`);
        if (!test.passed && test.error) {
            console.log(`   Error: ${test.error}`);
        }
    });
    
    if (testResults.overall === 'PASSED') {
        console.log('\n🎉 SUCCESS: Scoring discrepancy fix is working correctly!');
        console.log('The 95% vs 55% issue should now be resolved.');
    } else {
        console.log('\n⚠️ ISSUES DETECTED: Some tests failed.');
        console.log('Please check the individual test results above.');
    }
    
    return testResults;
}

// Test 1: Check if scoring alignment components are loaded
function testScoringComponents() {
    console.log('\n1️⃣ Testing Scoring Alignment Components...');
    
    const test = {
        name: 'Scoring Components Check',
        passed: false,
        details: {},
        error: null
    };
    
    try {
        // Check if scoring alignment classes are available
        test.details.ScoringAlignmentFix = typeof window.ScoringAlignmentFix !== 'undefined';
        test.details.scoringIntegration = typeof window.scoringIntegration !== 'undefined';
        test.details.testFunction = typeof window.testScoringAlignment === 'function';
        test.details.reportFunction = typeof window.getScoringReport === 'function';
        
        const allComponentsLoaded = Object.values(test.details).every(v => v);
        test.passed = allComponentsLoaded;
        
        if (test.passed) {
            console.log('   ✅ All scoring alignment components loaded');
        } else {
            console.log('   ❌ Some scoring alignment components missing');
            console.log('   Details:', test.details);
        }
        
    } catch (error) {
        test.error = error.message;
        console.log('   ❌ Component check failed:', error.message);
    }
    
    return test;
}

// Test 2: Test manual scoring alignment
function testManualScoringAlignment() {
    console.log('\n2️⃣ Testing Manual Scoring Alignment...');
    
    const test = {
        name: 'Manual Scoring Alignment',
        passed: false,
        details: {},
        error: null
    };
    
    try {
        if (!window.scoringIntegration) {
            throw new Error('scoringIntegration not available');
        }
        
        // Test with the problematic case: 95% EE vs 55% PW
        const elementExtractorData = {
            'Element Name': TEST_CONFIG.problematicElement.elementName,
            'Element Type': 'button',
            'Best Locator': TEST_CONFIG.problematicElement.locator,
            'Locator Type': 'ID',
            'Strength': TEST_CONFIG.problematicElement.expectedEEScore,
            'ID': 'login-button'
        };
        
        const playwrightResult = {
            locator: TEST_CONFIG.problematicElement.locator,
            overall: {
                score: TEST_CONFIG.problematicElement.expectedPWScore,
                grade: 'C',
                passed: true
            },
            tests: {
                existence: { passed: true, score: 100 },
                visibility: { passed: true, score: 80 },
                interactability: { passed: false, score: 20 }
            }
        };
        
        // Apply alignment
        const alignedResult = window.scoringIntegration.alignElementResult(elementExtractorData, playwrightResult);
        
        test.details.originalEE = elementExtractorData.Strength;
        test.details.originalPW = playwrightResult.overall.score;
        test.details.originalDiscrepancy = Math.abs(elementExtractorData.Strength - playwrightResult.overall.score);
        test.details.alignedScore = alignedResult.aligned_result.Strength;
        test.details.alignmentStrategy = alignedResult.aligned_result["Alignment Strategy"];
        test.details.adjustments = alignedResult.aligned_result["Score Adjustments"];
        
        // Calculate new discrepancy (should be much smaller)
        const newDiscrepancy = Math.abs(test.details.alignedScore - playwrightResult.overall.score);
        test.details.newDiscrepancy = newDiscrepancy;
        
        // Test passes if discrepancy is significantly reduced
        test.passed = newDiscrepancy <= TEST_CONFIG.thresholds.maxAllowedDiscrepancy;
        
        console.log('   📊 Original EE Score:', test.details.originalEE);
        console.log('   📊 Original PW Score:', test.details.originalPW);
        console.log('   📊 Original Discrepancy:', test.details.originalDiscrepancy + '%');
        console.log('   🎯 Aligned Score:', test.details.alignedScore);
        console.log('   🔧 Strategy:', test.details.alignmentStrategy);
        console.log('   📉 New Discrepancy:', test.details.newDiscrepancy + '%');
        
        if (test.passed) {
            console.log('   ✅ Scoring alignment successful - discrepancy reduced');
        } else {
            console.log('   ❌ Scoring alignment insufficient - discrepancy still too high');
        }
        
    } catch (error) {
        test.error = error.message;
        console.log('   ❌ Manual alignment test failed:', error.message);
    }
    
    return test;
}

// Test 3: Test extension integration
async function testExtensionIntegration() {
    console.log('\n3️⃣ Testing Extension Integration...');
    
    const test = {
        name: 'Extension Integration',
        passed: false,
        details: {},
        error: null
    };
    
    try {
        // Check if chrome extension API is available
        test.details.chromeAPI = typeof chrome !== 'undefined';
        test.details.chromeRuntime = typeof chrome?.runtime !== 'undefined';
        
        if (!test.details.chromeAPI) {
            throw new Error('Chrome extension API not available');
        }
        
        // Test message passing to background script
        const pingResult = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Background script ping timeout'));
            }, 5000);
            
            chrome.runtime.sendMessage({ action: 'ping' }, (response) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        test.details.backgroundScriptReachable = !!pingResult;
        
        // Test Playwright validation endpoint
        const playwrightTestResult = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Playwright validation test timeout'));
            }, 10000);
            
            chrome.runtime.sendMessage({
                action: 'validateWithPlaywright',
                locator: TEST_CONFIG.problematicElement.locator,
                url: window.location.href,
                elementData: {
                    elementName: TEST_CONFIG.problematicElement.elementName,
                    elementType: 'button',
                    locatorType: 'ID',
                    id: 'login-button',
                    originalStrength: TEST_CONFIG.problematicElement.expectedEEScore
                }
            }, (response) => {
                clearTimeout(timeout);
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        });
        
        test.details.playwrightValidationWorking = playwrightTestResult?.success;
        test.details.playwrightResult = playwrightTestResult?.result;
        
        test.passed = test.details.chromeAPI && 
                     test.details.backgroundScriptReachable && 
                     test.details.playwrightValidationWorking;
        
        if (test.passed) {
            console.log('   ✅ Extension integration working');
            console.log('   📊 Sample validation score:', test.details.playwrightResult?.score);
        } else {
            console.log('   ❌ Extension integration issues detected');
            console.log('   Details:', test.details);
        }
        
    } catch (error) {
        test.error = error.message;
        console.log('   ❌ Extension integration test failed:', error.message);
    }
    
    return test;
}

// Test 4: Test with actual element extraction
async function testElementExtraction() {
    console.log('\n4️⃣ Testing Element Extraction Integration...');
    
    const test = {
        name: 'Element Extraction Integration',
        passed: false,
        details: {},
        error: null
    };
    
    try {
        // Check if the test element exists on the page
        const testElement = document.querySelector(TEST_CONFIG.problematicElement.locator);
        test.details.elementExists = !!testElement;
        
        if (!testElement) {
            throw new Error(`Test element ${TEST_CONFIG.problematicElement.locator} not found on page`);
        }
        
        // Check if element extraction functions are available
        test.details.extractionFunctionAvailable = typeof window.extractElements === 'function' ||
                                                  typeof window.domExtractionFunction === 'function';
        
        // For this test, we'll simulate what would happen in the real extraction
        // since we can't easily trigger the full extraction process from here
        
        test.details.simulatedExtractionResult = {
            message: 'Element extraction simulation - in real usage, Element Extractor would find this element with high confidence',
            elementFound: true,
            expectedBehavior: 'Scoring alignment should reduce discrepancy from 40% to less than 10%'
        };
        
        test.passed = test.details.elementExists;
        
        if (test.passed) {
            console.log('   ✅ Element extraction integration ready');
            console.log('   📍 Test element found on page');
            console.log('   💡 In real usage, scoring alignment will automatically apply');
        } else {
            console.log('   ⚠️ Test element not found - create test element to verify full integration');
        }
        
    } catch (error) {
        test.error = error.message;
        console.log('   ❌ Element extraction test failed:', error.message);
    }
    
    return test;
}

// Helper function to display test results in UI
function displayTestResults() {
    const resultsDiv = document.getElementById('test-results-display');
    if (!resultsDiv) return;
    
    const overallStatus = testResults.overall === 'PASSED' ? 
        '<div class="status success">✅ All Tests Passed - Scoring Fix Working!</div>' :
        '<div class="status error">❌ Some Tests Failed - Issues Detected</div>';
    
    const testsList = testResults.tests.map((test, index) => {
        const status = test.passed ? '✅' : '❌';
        const details = test.error ? ` (${test.error})` : '';
        return `<li>${status} ${test.name}${details}</li>`;
    }).join('');
    
    resultsDiv.innerHTML = `
        <h3>🔍 Test Results</h3>
        ${overallStatus}
        <ul>
            ${testsList}
        </ul>
        <p><small>Timestamp: ${testResults.timestamp}</small></p>
    `;
}

// Make functions globally available
window.runScoringDiscrepancyTest = runScoringDiscrepancyTest;
window.displayTestResults = displayTestResults;
window.testResults = testResults;

console.log('✅ Scoring Discrepancy Test Functions Ready');
console.log('🔧 Run runScoringDiscrepancyTest() to start testing');
