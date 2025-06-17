#!/bin/bash

# Comprehensive diagnosis script for empty results issue
echo "🔧 Comprehensive Empty Results Diagnosis..."

# Create a minimal test page with guaranteed elements
cat > minimal-diagnosis.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Minimal Diagnosis Page</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-div { background: #f0f0f0; padding: 10px; margin: 10px 0; }
    </style>
</head>
<body>
    <h1 id="test-heading" class="main-heading" data-testid="heading">Diagnosis Page</h1>
    
    <button id="test-btn" class="primary-button" data-role="submit" type="button">
        Test Button
    </button>
    
    <input 
        id="test-input" 
        type="text" 
        class="form-input" 
        name="test-field" 
        placeholder="Enter text"
        data-testid="text-input"
    />
    
    <div id="test-div" class="test-div content-section" data-content="main">
        This is test content with meaningful text.
    </div>
    
    <a href="#" id="test-link" class="nav-link" data-target="home">Home Link</a>
    
    <script>
        // Log page readiness
        console.log('📄 Diagnosis page loaded');
        console.log('📊 Page elements with IDs:', document.querySelectorAll('[id]').length);
        console.log('📊 Elements with classes:', document.querySelectorAll('[class]').length);
        console.log('📊 Elements with data attributes:', document.querySelectorAll('[data-testid], [data-role], [data-content], [data-target]').length);
        
        // Function to test extension manually
        window.testExtensionData = function() {
            console.log('🧪 Manual extension test...');
            
            // Check if content script is loaded
            if (window.universalLocatorInjected) {
                console.log('✅ Content script detected');
                
                // Manually trigger scan for testing
                chrome.runtime.sendMessage({action: 'ping'}, (response) => {
                    console.log('🔄 Ping response:', response);
                });
                
            } else {
                console.log('❌ Content script not detected');
            }
        };
        
        // Add button to test manually
        const testButton = document.createElement('button');
        testButton.textContent = 'Test Extension Manually';
        testButton.onclick = window.testExtensionData;
        testButton.style.cssText = 'position: fixed; top: 10px; right: 10px; z-index: 9999; background: #007acc; color: white; padding: 10px; border: none; border-radius: 4px;';
        document.body.appendChild(testButton);
    </script>
</body>
</html>
EOF

echo "✅ Created minimal diagnosis page: minimal-diagnosis.html"

# Create diagnosis script
cat > diagnose-in-console.js << 'EOF'
// Paste this in browser console to diagnose the issue step by step

console.log('🔍 Starting step-by-step diagnosis...');

// Step 1: Check storage
async function step1_checkStorage() {
    console.log('\n📦 STEP 1: Checking Chrome Storage...');
    try {
        const result = await chrome.storage.local.get(['scanResults']);
        if (result.scanResults) {
            console.log('✅ Storage has scan results');
            console.log('📊 Elements count:', result.scanResults.elements?.length || 0);
            
            if (result.scanResults.elements?.length > 0) {
                const firstEl = result.scanResults.elements[0];
                console.log('🔍 First element sample:', {
                    tagName: firstEl.tagName,
                    attributeKeys: Object.keys(firstEl.attributes || {}),
                    contextKeys: Object.keys(firstEl.context || {}),
                    locatorCounts: {
                        primary: firstEl.locators?.primary?.length || 0,
                        secondary: firstEl.locators?.secondary?.length || 0,
                        fallback: firstEl.locators?.fallback?.length || 0
                    }
                });
                
                return { success: true, data: result.scanResults };
            } else {
                console.log('❌ No elements in scan results');
                return { success: false, reason: 'No elements in storage' };
            }
        } else {
            console.log('❌ No scan results in storage');
            return { success: false, reason: 'No scan results in storage' };
        }
    } catch (error) {
        console.log('❌ Storage check failed:', error);
        return { success: false, reason: 'Storage error', error };
    }
}

// Step 2: Check content script
function step2_checkContentScript() {
    console.log('\n🔧 STEP 2: Checking Content Script...');
    
    if (window.universalLocatorInjected) {
        console.log('✅ Content script is injected');
        return { success: true };
    } else {
        console.log('❌ Content script not detected');
        return { success: false, reason: 'Content script not injected' };
    }
}

// Step 3: Test scan manually
async function step3_testScan() {
    console.log('\n🎯 STEP 3: Testing Manual Scan...');
    
    return new Promise((resolve) => {
        try {
            chrome.runtime.sendMessage({action: 'scanPage'}, (response) => {
                if (response && response.success) {
                    console.log('✅ Manual scan successful');
                    console.log('📊 Scan results:', {
                        elementCount: response.results?.length || 0,
                        stats: response.stats
                    });
                    
                    if (response.results?.length > 0) {
                        console.log('🔍 First scanned element:', response.results[0]);
                        resolve({ success: true, data: response });
                    } else {
                        console.log('❌ Scan returned no elements');
                        resolve({ success: false, reason: 'No elements returned from scan' });
                    }
                } else {
                    console.log('❌ Manual scan failed:', response);
                    resolve({ success: false, reason: 'Scan failed', response });
                }
            });
        } catch (error) {
            console.log('❌ Manual scan error:', error);
            resolve({ success: false, reason: 'Scan error', error });
        }
    });
}

// Run full diagnosis
async function runFullDiagnosis() {
    console.log('🚀 Running full diagnosis...');
    
    const step1 = await step1_checkStorage();
    const step2 = step2_checkContentScript();
    const step3 = await step3_testScan();
    
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('Storage check:', step1.success ? '✅ PASS' : '❌ FAIL - ' + step1.reason);
    console.log('Content script:', step2.success ? '✅ PASS' : '❌ FAIL - ' + step2.reason);
    console.log('Manual scan:', step3.success ? '✅ PASS' : '❌ FAIL - ' + step3.reason);
    
    if (!step1.success && !step2.success && !step3.success) {
        console.log('\n🔥 DIAGNOSIS: Complete system failure');
        console.log('💡 SOLUTION: Reload extension and page');
    } else if (!step1.success && step3.success) {
        console.log('\n🔥 DIAGNOSIS: Storage/data flow issue');
        console.log('💡 SOLUTION: Check popup.js data saving logic');
    } else if (step1.success && step3.success) {
        console.log('\n🔥 DIAGNOSIS: Display/rendering issue in results.js');
        console.log('💡 SOLUTION: Check results.js display functions');
    } else {
        console.log('\n🔥 DIAGNOSIS: Mixed issues - check specific failed steps');
    }
}

// Auto-run diagnosis
runFullDiagnosis();
EOF

echo "✅ Created console diagnosis script: diagnose-in-console.js"

# Check if Chrome is available
if ! command -v google-chrome &> /dev/null && ! command -v chromium &> /dev/null; then
    echo "❌ Chrome/Chromium not found. Please install Chrome to run the test."
    exit 1
fi

# Find Chrome executable
CHROME_CMD="google-chrome"
if ! command -v google-chrome &> /dev/null; then
    CHROME_CMD="chromium"
fi

echo ""
echo "🚀 Launching comprehensive diagnosis..."
echo ""
echo "📋 Diagnosis Steps:"
echo "   1. Open browser console (F12)"
echo "   2. Copy and paste the content of 'diagnose-in-console.js' into console"
echo "   3. The script will automatically run a step-by-step diagnosis"
echo "   4. Based on results, you'll get specific next steps"
echo ""
echo "🔍 What the diagnosis checks:"
echo "   • Chrome storage data integrity"
echo "   • Content script injection status"
echo "   • Manual scan functionality"
echo "   • Data flow from scan to storage to display"
echo ""

# Get absolute path to test file
TEST_FILE="$(pwd)/minimal-diagnosis.html"

$CHROME_CMD --load-extension="$(pwd)" "file://$TEST_FILE" &

echo "📝 Manual Steps:"
echo "   1. Open the diagnosis page in browser"
echo "   2. Open browser console (F12)"
echo "   3. Copy content from 'diagnose-in-console.js' and paste in console"
echo "   4. Review the diagnosis results"
echo "   5. Follow the suggested solution based on which step fails"
