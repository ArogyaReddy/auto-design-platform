#!/bin/bash

echo "🔧 Testing Element Scan Fixes v2"
echo "================================="

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📁 Working directory: $SCRIPT_DIR"

# Check if Chrome is available
if command -v google-chrome &> /dev/null; then
    CHROME_CMD="google-chrome"
elif command -v google-chrome-stable &> /dev/null; then
    CHROME_CMD="google-chrome-stable"
elif command -v chromium &> /dev/null; then
    CHROME_CMD="chromium"
elif command -v chromium-browser &> /dev/null; then
    CHROME_CMD="chromium-browser"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ -d "/Applications/Google Chrome.app" ]]; then
        CHROME_CMD="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    elif [[ -d "/Applications/Chromium.app" ]]; then
        CHROME_CMD="/Applications/Chromium.app/Contents/MacOS/Chromium"
    else
        echo "❌ Chrome/Chromium not found on macOS"
        exit 1
    fi
else
    echo "❌ Chrome/Chromium not found. Please install Chrome or Chromium."
    exit 1
fi

echo "✅ Found browser: $CHROME_CMD"

# Create test page path
TEST_PAGE="$SCRIPT_DIR/test-element-scan.html"

if [[ ! -f "$TEST_PAGE" ]]; then
    echo "❌ Test page not found: $TEST_PAGE"
    exit 1
fi

echo "✅ Test page found"

echo ""
echo "🚀 Starting Chrome with FIXED v2 extension..."
echo ""
echo "LATEST FIXES APPLIED:"
echo "✅ Fixed instruction banner removal (using ID selector)"
echo "✅ Added element locators popup directly on webpage"
echo "✅ Added comprehensive debugging throughout the flow"
echo "✅ Added fallback for when popup is closed"
echo "✅ Enhanced locator generation and display"
echo ""
echo "NEW FEATURES:"
echo "🎯 Locators popup appears on the webpage itself"
echo "🎯 Copy and Test buttons work directly from the popup"
echo "🎯 Better element information display"
echo "🎯 Proper cleanup of scan mode UI elements"
echo ""
echo "CRITICAL TESTS:"
echo "1. Instruction banner disappears after element click"
echo "2. Locators popup appears on the webpage"
echo "3. Primary/Secondary/Fallback sections are visible"
echo "4. Copy and Test buttons work correctly"
echo ""

# Launch Chrome with extension
"$CHROME_CMD" \
    --load-extension="$SCRIPT_DIR" \
    --new-window \
    --disable-web-security \
    --disable-features=VizDisplayCompositor \
    "file://$TEST_PAGE" \
    2>/dev/null &

CHROME_PID=$!

echo "Chrome launched with PID: $CHROME_PID"
echo ""
echo "🧪 STEP-BY-STEP TESTING:"
echo "========================"
echo ""
echo "STEP 1: Activate Element Scan"
echo "□ Click extension icon (puzzle piece)"
echo "□ Click '🎯 Scan Element' button"
echo "□ Verify blue instruction banner appears at top"
echo "□ Verify page has subtle blue border"
echo ""
echo "STEP 2: Test Hover Highlighting"
echo "□ Hover over different elements (buttons, inputs, text)"
echo "□ Verify orange outline appears on hover"
echo "□ Verify highlighting follows mouse smoothly"
echo "□ Try nested elements and complex structures"
echo ""
echo "STEP 3: Test Element Selection"
echo "□ Click on any element (try a button with ID first)"
echo "□ Verify instruction banner DISAPPEARS immediately"
echo "□ Verify blue border overlay DISAPPEARS"
echo "□ Verify locators popup APPEARS on the webpage"
echo ""
echo "STEP 4: Verify Locators Popup"
echo "□ Check that popup shows element information (tag, text, ID, classes)"
echo "□ Verify Primary Locators section (green background)"
echo "□ Verify Secondary Locators section (yellow background)  "
echo "□ Verify Fallback Locators section (red background)"
echo "□ Check that each locator has Copy and Test buttons"
echo ""
echo "STEP 5: Test Copy/Test Functionality"
echo "□ Click 'Copy' button on any locator"
echo "□ Verify button changes to '✅ Copied!' temporarily"
echo "□ Click 'Test' button on the same locator"
echo "□ Verify it highlights the element (red border style)"
echo "□ Verify button shows result ('✅ Found N!' or '❌ None found')"
echo ""
echo "STEP 6: Test Different Elements"
echo "□ Close the popup and try again with different elements:"
echo "  - Form input (should have ID, name, data attributes)"
echo "  - Table cell (should have positional selectors)"
echo "  - Button (should have text-based selectors)"
echo "  - Nested div (should have contextual selectors)"
echo ""
echo "DEBUGGING HELP:"
echo "- Open Developer Tools (F12)"
echo "- Check Console tab for debug messages starting with '🎯'"
echo "- Look for errors in red"
echo "- Verify element scan flow messages"
echo ""
echo "Press Ctrl+C to close test when done"

# Wait for Chrome to close or user to interrupt
wait $CHROME_PID 2>/dev/null

echo ""
echo "🏁 Test completed!"
echo ""
echo "EXPECTED RESULTS:"
echo "✅ Instruction banner disappears after element selection"
echo "✅ Locators popup appears directly on the webpage"
echo "✅ Primary/Secondary/Fallback sections are properly displayed"
echo "✅ Copy and Test functionality works seamlessly"
echo "✅ No JavaScript errors in console"
echo "✅ Clean scan mode entry and exit"
