/**
 * Quick diagnostic test for scoring alignment in the extension
 * 
 * Run this in the browser console when the Element Extractor popup is open
 * to verify that scoring alignment is working properly.
 */

function runScoringAlignmentDiagnostic() {
    console.log('🔍 Running Scoring Alignment Diagnostic...');
    console.log('='.repeat(50));
    
    const results = {
        timestamp: new Date().toISOString(),
        tests: {},
        overall: 'unknown'
    };
    
    // Test 1: Check if scoring alignment files are loaded
    console.log('1️⃣ Checking if scoring alignment components are loaded...');
    results.tests.componentsLoaded = {
        ScoringAlignmentFix: typeof window.ScoringAlignmentFix !== 'undefined',
        scoringIntegration: typeof window.scoringIntegration !== 'undefined',
        testScoringAlignment: typeof window.testScoringAlignment === 'function',
        getScoringReport: typeof window.getScoringReport === 'function'
    };
    
    console.log('   ScoringAlignmentFix:', results.tests.componentsLoaded.ScoringAlignmentFix ? '✅' : '❌');
    console.log('   scoringIntegration:', results.tests.componentsLoaded.scoringIntegration ? '✅' : '❌');
    console.log('   testScoringAlignment():', results.tests.componentsLoaded.testScoringAlignment ? '✅' : '❌');
    console.log('   getScoringReport():', results.tests.componentsLoaded.getScoringReport ? '✅' : '❌');
    
    // Test 2: Check if alignment functions work
    console.log('\n2️⃣ Testing alignment functions...');
    if (window.scoringIntegration) {
        try {
            // Test with sample data similar to the 95% vs 55% case
            const sampleEEData = {
                'Element Name': 'Login Button',
                'Element Type': 'button',
                'Best Locator': '#login-button',
                'Locator Type': 'ID',
                'Strength': 95,
                'ID': 'login-button'
            };
            
            const samplePWResult = {
                locator: '#login-button',
                overall: {
                    score: 55,
                    grade: 'C',
                    passed: true
                },
                tests: {
                    existence: { passed: true, score: 100 },
                    visibility: { passed: true, score: 80 },
                    interactability: { passed: false, score: 20 }
                }
            };
            
            const alignedResult = window.scoringIntegration.alignElementResult(sampleEEData, samplePWResult);
            results.tests.alignmentTest = {
                success: true,
                input: {
                    elementExtractor: sampleEEData.Strength,
                    playwright: samplePWResult.overall.score
                },
                output: {
                    alignedScore: alignedResult.aligned_result.Strength,
                    strategy: alignedResult.aligned_result["Alignment Strategy"],
                    adjustments: alignedResult.aligned_result["Score Adjustments"]
                }
            };
            
            console.log('   ✅ Alignment test successful!');
            console.log('   📊 Original EE Score:', sampleEEData.Strength);
            console.log('   📊 Original PW Score:', samplePWResult.overall.score);
            console.log('   🎯 Aligned Score:', alignedResult.aligned_result.Strength);
            console.log('   🔧 Strategy:', alignedResult.aligned_result["Alignment Strategy"]);
            console.log('   ⚙️ Adjustments:', alignedResult.aligned_result["Score Adjustments"]);
            
        } catch (error) {
            results.tests.alignmentTest = {
                success: false,
                error: error.message
            };
            console.log('   ❌ Alignment test failed:', error.message);
        }
    } else {
        results.tests.alignmentTest = {
            success: false,
            error: 'scoringIntegration not available'
        };
        console.log('   ❌ scoringIntegration not available');
    }
    
    // Test 3: Check extension context
    console.log('\n3️⃣ Checking extension context...');
    results.tests.extensionContext = {
        chrome: typeof chrome !== 'undefined',
        chromeRuntime: typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined',
        popup: window.location.href.includes('popup.html')
    };
    
    console.log('   Chrome API:', results.tests.extensionContext.chrome ? '✅' : '❌');
    console.log('   Chrome Runtime:', results.tests.extensionContext.chromeRuntime ? '✅' : '❌');
    console.log('   In Popup:', results.tests.extensionContext.popup ? '✅' : '❌');
    
    // Overall assessment
    const componentsPassed = Object.values(results.tests.componentsLoaded).every(v => v);
    const alignmentPassed = results.tests.alignmentTest.success;
    const extensionPassed = results.tests.extensionContext.chrome && results.tests.extensionContext.chromeRuntime;
    
    if (componentsPassed && alignmentPassed && extensionPassed) {
        results.overall = 'success';
        console.log('\n🎉 DIAGNOSTIC RESULT: SUCCESS');
        console.log('✅ Scoring alignment is properly configured and working!');
        console.log('✅ The 95% vs 55% discrepancy should now be resolved.');
    } else if (componentsPassed && alignmentPassed) {
        results.overall = 'partial';
        console.log('\n⚠️ DIAGNOSTIC RESULT: PARTIAL SUCCESS');
        console.log('✅ Scoring alignment components are working');
        console.log('⚠️ Extension context may need attention');
    } else {
        results.overall = 'failure';
        console.log('\n❌ DIAGNOSTIC RESULT: FAILURE');
        console.log('❌ Scoring alignment is not properly configured');
        
        if (!componentsPassed) {
            console.log('🔧 SOLUTION: Reload the extension and ensure scoring-alignment files are loaded');
        }
        if (!alignmentPassed) {
            console.log('🔧 SOLUTION: Check scoring alignment implementation');
        }
    }
    
    console.log('\n📋 Next Steps:');
    console.log('1. Open Element Extractor extension popup');
    console.log('2. Extract elements from a test page');
    console.log('3. Look for elements with large score discrepancies');
    console.log('4. Run Playwright validation and check if scores are aligned');
    console.log('5. Check browser console for alignment log messages');
    
    console.log('='.repeat(50));
    
    return results;
}

// Auto-run if in extension context
if (typeof chrome !== 'undefined' && window.location.href.includes('popup.html')) {
    // Run after a short delay to ensure all components are loaded
    setTimeout(runScoringAlignmentDiagnostic, 1000);
}

// Make function globally available
window.runScoringAlignmentDiagnostic = runScoringAlignmentDiagnostic;

console.log('🔍 Scoring alignment diagnostic loaded. Run runScoringAlignmentDiagnostic() to test.');
