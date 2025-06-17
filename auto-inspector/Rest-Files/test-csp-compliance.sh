#!/bin/bash

# Universal Element Locator Extension - CSP Compliance Test
# This script verifies that the extension is CSP compliant

echo "🔒 Universal Element Locator Extension - CSP Compliance Test"
echo "============================================================"

# Check if Chrome is available
if ! command -v google-chrome &> /dev/null && ! command -v chromium &> /dev/null; then
    echo "⚠️  Chrome/Chromium not found. Please install Chrome to run this test."
    exit 1
fi

EXTENSION_DIR="/Users/arog/ADP/AutoExtractor/browser-extension"
TEST_PAGE="$EXTENSION_DIR/test-csp.html"

echo "📁 Extension directory: $EXTENSION_DIR"
echo "🧪 Test page: $TEST_PAGE"

# Validate extension files
echo ""
echo "📋 Step 1: Validating CSP-compliant files..."

# Check that results.html has no inline scripts
if grep -q "<script>" "$EXTENSION_DIR/results.html" && grep -q "function\|let\|const\|var" "$EXTENSION_DIR/results.html"; then
    echo "❌ Found inline JavaScript in results.html"
    echo "   This violates Content Security Policy"
    exit 1
else
    echo "✅ results.html has no inline JavaScript"
fi

# Check that results.js exists and has the required functions
if [ ! -f "$EXTENSION_DIR/results.js" ]; then
    echo "❌ results.js not found"
    exit 1
else
    echo "✅ results.js exists"
fi

# Check for onclick handlers in results.js
if grep -q "onclick=" "$EXTENSION_DIR/results.js"; then
    echo "❌ Found inline onclick handlers in results.js"
    echo "   This violates Content Security Policy"
    exit 1
else
    echo "✅ No inline onclick handlers found"
fi

# Check that required functions exist in results.js
required_functions=("loadScanResults" "displayResults" "setupEventListeners" "goToPage" "createPagination")
for func in "${required_functions[@]}"; do
    if grep -q "function $func" "$EXTENSION_DIR/results.js"; then
        echo "✅ Function $func found"
    else
        echo "❌ Function $func missing"
        exit 1
    fi
done

echo ""
echo "🌐 Step 2: Opening CSP test page..."

# Open the CSP test page
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$TEST_PAGE"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open "$TEST_PAGE"
else
    echo "⚠️  Please manually open: $TEST_PAGE"
fi

echo "✅ CSP test page opened"

echo ""
echo "📋 Step 3: Manual verification required..."
echo "=========================================="
echo "1. Open browser developer tools (F12)"
echo "2. Look at the Console tab"
echo "3. Check for CSP violations (they will appear in red)"
echo "4. The iframe should load the results page without errors"
echo "5. If you see 'CSP Test: External script loaded successfully' - the test passed"

echo ""
echo "🔧 Expected behavior:"
echo "====================="
echo "✅ No CSP violation errors in console"
echo "✅ Results page loads in the iframe"
echo "✅ Pagination buttons work (if clicked)"
echo "✅ External script message appears in console"

echo ""
echo "❌ If you see CSP violations:"
echo "============================"
echo "• Look for 'Refused to execute inline script' errors"
echo "• Look for 'Refused to execute inline event handler' errors"
echo "• Check the specific file and line number mentioned"

echo ""
echo "🎉 CSP Compliance Test Complete!"
echo "================================"
echo "If no errors appear in the console, the extension is CSP compliant."
echo "The results page can now be safely used in strict CSP environments."

# Keep terminal open on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "Press any key to exit..."
    read -n 1
fi
