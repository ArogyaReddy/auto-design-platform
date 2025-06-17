#!/bin/bash

# Debug script to check what data is being scanned and stored
echo "🔍 Debugging Empty Results Issue..."

# Create a test page with simple, visible elements
cat > debug-empty-results.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug Empty Results</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            line-height: 1.6;
        }
        .test-section { 
            margin: 20px 0; 
            padding: 15px; 
            border: 2px solid #007acc; 
            background: #f0f8ff;
            border-radius: 8px;
        }
        .test-button {
            background: #007acc;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        .test-input {
            padding: 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
            margin: 5px;
        }
    </style>
</head>
<body>
    <h1 id="main-heading">Debug Empty Results Test Page</h1>
    
    <div class="test-section">
        <h2>Simple Test Elements</h2>
        <p>These elements should always have data when scanned:</p>
        
        <button id="test-button-1" class="test-button" data-testid="primary-button">
            Primary Test Button
        </button>
        
        <input 
            type="text" 
            id="test-input-1" 
            class="test-input" 
            placeholder="Test input field"
            name="test-field"
            data-testid="primary-input"
        >
        
        <div id="test-div-1" class="content-div" data-role="content">
            This is a test div with meaningful content.
        </div>
        
        <a href="#" id="test-link-1" class="test-link" data-testid="primary-link">
            Test Link Text
        </a>
        
        <span id="test-span-1" class="highlight" data-label="important">
            Important span content
        </span>
    </div>
    
    <div class="test-section">
        <h2>Debug Information</h2>
        <p>When you scan this page:</p>
        <ol>
            <li><strong>Expected elements:</strong> At least 5-10 visible elements</li>
            <li><strong>Expected data per element:</strong>
                <ul>
                    <li>Attributes (id, class, data-* attributes)</li>
                    <li>Context (parent info, position)</li>
                    <li>State (interactive, form element, etc.)</li>
                    <li>Primary locators (ID, data-testid)</li>
                    <li>Secondary locators (class, name, type)</li>
                    <li>Fallback locators (tagName, position)</li>
                    <li>Position & size information</li>
                    <li>Styling information</li>
                </ul>
            </li>
            <li><strong>Text content:</strong> Should show actual text like "Primary Test Button"</li>
        </ol>
    </div>

    <div class="test-section">
        <h2>Debugging Steps</h2>
        <ol>
            <li>Open browser console (F12)</li>
            <li>Scan this page with the extension</li>
            <li>Check console for content script logs</li>
            <li>Look for scan results in the detailed view</li>
            <li>If data is missing, check the logs for errors</li>
        </ol>
    </div>

    <script>
        // Add some debugging info to console
        console.log('🔍 Debug page loaded');
        console.log('🔍 Total elements on page:', document.querySelectorAll('*').length);
        console.log('🔍 Visible elements with IDs:', document.querySelectorAll('[id]').length);
        console.log('🔍 Elements with data attributes:', document.querySelectorAll('[data-testid], [data-role], [data-label]').length);
        
        // Log when content script injection occurs
        let scriptInjectionCount = 0;
        const originalInnerHTML = document.documentElement.innerHTML;
        
        // Monitor for content script injection
        setTimeout(() => {
            if (window.universalLocatorInjected) {
                console.log('✅ Content script successfully injected');
            } else {
                console.log('❌ Content script not detected');
            }
        }, 1000);
    </script>
</body>
</html>
EOF

echo "✅ Created debug page: debug-empty-results.html"

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

# Launch Chrome with the extension and test page
echo "🚀 Launching Chrome with extension and debug page..."
echo ""
echo "🔍 Debug Process:"
echo "   1. Open the browser console (F12) to see debug logs"
echo "   2. Click the extension icon to open popup"
echo "   3. Click 'Scan Page Elements'"
echo "   4. Watch console for content script logs during scan"
echo "   5. Check if detailed results show actual data or empty fields"
echo ""
echo "📊 What to Look For:"
echo "   ✅ Content script logs showing elements found"
echo "   ✅ Scan results with non-empty attributes, context, locators"
echo "   ✅ Text content showing actual text like 'Primary Test Button'"
echo "   ❌ All fields showing 'No attributes', 'No context', etc."
echo "   ❌ Console errors during scan"
echo ""

# Get absolute path to test file
TEST_FILE="$(pwd)/debug-empty-results.html"

$CHROME_CMD --load-extension="$(pwd)" "file://$TEST_FILE" &

echo "💡 Troubleshooting Tips:"
echo "   • If you see empty results, check browser console for errors"
echo "   • Look for content script injection messages"
echo "   • Check if scan response contains actual element data"
echo "   • Verify storage is working properly"
