#!/bin/bash

# Test script for validating visibility filtering in Universal Element Locator Extension
# This script opens a test page and provides instructions for manual testing

echo "🔍 Universal Element Locator - Visibility Test"
echo "=============================================="
echo

# Get the absolute path of the test file
TEST_FILE="/Users/arog/ADP/AutoExtractor/browser-extension/visibility-test.html"

if [ ! -f "$TEST_FILE" ]; then
    echo "❌ Error: Test file not found at $TEST_FILE"
    exit 1
fi

echo "📝 Test Instructions:"
echo "1. Make sure the Universal Element Locator extension is loaded in Chrome"
echo "2. The test page will open in your browser"
echo "3. Click the extension icon and run a scan"
echo "4. Verify the results show ONLY visible elements"
echo
echo "✅ Expected Results:"
echo "  - Should find approximately 20-30 visible elements"
echo "  - Should NOT include any hidden elements (display:none, visibility:hidden, opacity:0)"
echo "  - Should NOT include script content or JavaScript code"
echo "  - Should include proper locators (ID, class, data attributes)"
echo "  - Text should be clean and meaningful (no code snippets)"
echo
echo "❌ Should NOT appear in results:"
echo "  - 'This text is hidden with display: none'"
echo "  - 'This text is hidden with visibility: hidden'"
echo "  - 'This text is hidden with opacity: 0'"
echo "  - 'This text has zero size'"
echo "  - 'This text is positioned offscreen'"
echo "  - Any JavaScript code like 'console.log', 'function', 'var', etc."
echo

echo "🌐 Opening test page..."
open "file://$TEST_FILE"

echo
echo "🔍 Manual Testing Checklist:"
echo "□ Extension icon is visible and clickable"
echo "□ Page scan completes successfully"
echo "□ Results page opens with element data"
echo "□ Only visible elements are listed"
echo "□ Hidden elements are properly filtered out"
echo "□ JavaScript/script content is excluded"
echo "□ Locator columns show appropriate data"
echo "□ Text content is clean and meaningful"
echo "□ Element count is reasonable (20-30 elements)"
echo
echo "📊 Check these specific elements should be INCLUDED:"
echo "  - #main-title (h1 with ID and data-testid)"
echo "  - #visible-text (p with ID and class)"
echo "  - .primary-button (button with multiple classes)"
echo "  - form inputs (#username, #email, etc.)"
echo "  - .feature-item list items"
echo
echo "🚫 Check these should be EXCLUDED:"
echo "  - Any elements with 'hidden' in the text"
echo "  - Script content or JavaScript code"
echo "  - Elements with zero dimensions"
echo "  - Offscreen positioned elements"
echo
echo "🔧 If issues are found:"
echo "  - Check browser console for error messages"
echo "  - Verify extension is properly loaded"
echo "  - Look for specific error patterns in the logs"
echo
echo "Press Enter when testing is complete..."
read

echo "✅ Visibility test completed!"
