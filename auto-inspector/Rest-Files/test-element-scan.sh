#!/bin/bash

echo "🎯 Element Scan Functionality Test"
echo "=================================="

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

# Check if manifest.json exists
if [[ ! -f "$SCRIPT_DIR/manifest.json" ]]; then
    echo "❌ manifest.json not found in $SCRIPT_DIR"
    exit 1
fi

echo "✅ Extension manifest found"

# Create test page path
TEST_PAGE="$SCRIPT_DIR/test-element-scan.html"

if [[ ! -f "$TEST_PAGE" ]]; then
    echo "❌ Test page not found: $TEST_PAGE"
    exit 1
fi

echo "✅ Test page found"

# Check if the key files exist
echo "🔍 Checking extension files..."

FILES_TO_CHECK=("content.js" "popup.js" "popup.html" "background.js")
for file in "${FILES_TO_CHECK[@]}"; do
    if [[ -f "$SCRIPT_DIR/$file" ]]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done

echo ""
echo "🚀 Starting Chrome with extension and test page..."
echo ""
echo "INSTRUCTIONS:"
echo "1. Chrome will open with the extension loaded and test page"
echo "2. Click the extension icon in the toolbar (puzzle piece icon)"
echo "3. Click the '🎯 Scan Element' button in the popup"
echo "4. Switch back to the test page tab"
echo "5. Hover over different elements to see hover highlighting (orange outline)"
echo "6. Click on any element to scan it and view its locators"
echo "7. Use the 'Copy' buttons to copy selectors"
echo "8. Use the 'Test' buttons to highlight elements using the copied selectors"
echo "9. Press ESC to exit scan mode"
echo ""
echo "TEST ELEMENTS TO TRY:"
echo "- Buttons with different data attributes"
echo "- Form inputs with IDs and names"
echo "- Table cells and rows"
echo "- Nested elements with complex structure"
echo "- Shadow DOM elements (if supported)"
echo "- List items with data attributes"
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
echo "🧪 TESTING CHECKLIST:"
echo "====================="
echo ""
echo "BASIC FUNCTIONALITY:"
echo "□ Extension icon appears in toolbar"
echo "□ Extension popup opens when clicked"
echo "□ 'Scan Element' button is visible and clickable"
echo "□ Clicking 'Scan Element' shows success message"
echo "□ Scan mode overlay appears on the page"
echo "□ Instructions are shown at the top of the page"
echo ""
echo "HOVER HIGHLIGHTING:"
echo "□ Hovering over elements shows orange outline"
echo "□ Hover highlight follows mouse smoothly"
echo "□ Previous hover highlight is cleared when moving to new element"
echo "□ Hover works on different element types (buttons, inputs, divs, etc.)"
echo ""
echo "ELEMENT SELECTION:"
echo "□ Clicking on element exits scan mode"
echo "□ Locators popup appears after clicking element"
echo "□ Popup shows element information (tag, text, attributes)"
echo "□ Primary, Secondary, and Fallback locators are categorized"
echo "□ Each locator has Copy and Test buttons"
echo ""
echo "LOCATOR QUALITY:"
echo "□ ID-based locators are shown as primary (if element has ID)"
echo "□ Data attribute locators are prioritized"
echo "□ Class-based locators are in secondary section"
echo "□ XPath and positional locators are in fallback section"
echo "□ Locators are marked as unique/non-unique"
echo ""
echo "COPY & TEST FUNCTIONALITY:"
echo "□ Copy buttons successfully copy selectors to clipboard"
echo "□ Test buttons highlight the element on the page"
echo "□ Test highlighting uses the manual highlight style (red border)"
echo "□ Multiple Test clicks work correctly"
echo ""
echo "EDGE CASES:"
echo "□ Elements without IDs work correctly"
echo "□ Elements with special characters in attributes work"
echo "□ Nested elements generate appropriate contextual selectors"
echo "□ Dynamically added elements (click 'Add Dynamic Element') work"
echo "□ Shadow DOM elements are detected (if browser supports)"
echo ""
echo "EXIT CONDITIONS:"
echo "□ ESC key exits scan mode"
echo "□ Clicking 'Stop Scan' button exits scan mode"
echo "□ All overlays and highlights are cleaned up on exit"
echo "□ Extension popup resets to normal state"
echo ""
echo "Press Ctrl+C to stop the test and close Chrome"

# Wait for Chrome to close or user to interrupt
wait $CHROME_PID 2>/dev/null

echo ""
echo "🏁 Test completed!"
echo ""
echo "If you found any issues, please check:"
echo "- Browser console for JavaScript errors"
echo "- Extension console for background script errors"
echo "- Network tab for failed resource loads"
echo ""
echo "For debugging:"
echo "- Right-click extension icon → 'Inspect popup' for popup debugging"
echo "- F12 on test page for content script debugging"
echo "- chrome://extensions for extension management"
