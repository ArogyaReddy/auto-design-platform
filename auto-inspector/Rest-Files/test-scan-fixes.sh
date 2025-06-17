#!/bin/bash

echo "🔧 Testing Element Scan Fixes"
echo "=============================="

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
echo "🚀 Starting Chrome with FIXED extension..."
echo ""
echo "FIXES APPLIED:"
echo "✅ Removed backdrop-filter blur from overlay"
echo "✅ Reduced overlay opacity to be less intrusive"
echo "✅ Fixed duplicate variable declaration issue"
echo "✅ Added proper scope protection for scan mode variables"
echo ""
echo "TESTING FOCUS:"
echo "🎯 Element Scan Mode should now work without blur"
echo "🎯 Page elements should be clearly visible and interactive"
echo "🎯 No JavaScript errors should occur"
echo "🎯 Hover highlighting should work smoothly"
echo ""
echo "INSTRUCTIONS:"
echo "1. Click the extension icon (puzzle piece)"
echo "2. Click '🎯 Scan Element' button"
echo "3. Verify the page is NOT blurred"
echo "4. Hover over elements to see orange highlighting"
echo "5. Click on any element to scan it"
echo "6. Verify the locators popup appears"
echo "7. Press ESC to exit scan mode"
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
echo "🧪 VERIFICATION CHECKLIST:"
echo "=========================="
echo ""
echo "BLUR FIX VERIFICATION:"
echo "□ Page elements are clearly visible (not blurred)"
echo "□ Text is crisp and readable"
echo "□ Only a subtle blue border appears around the page"
echo "□ Background has minimal transparency"
echo ""
echo "INTERACTION VERIFICATION:"
echo "□ Can hover over all page elements"
echo "□ Orange outline appears on hover"
echo "□ Elements are clearly highlighted"
echo "□ Hover highlight follows mouse smoothly"
echo ""
echo "FUNCTIONALITY VERIFICATION:"
echo "□ No JavaScript errors in console (F12)"
echo "□ Element selection works on click"
echo "□ Locators popup appears after selection"
echo "□ ESC key exits scan mode properly"
echo "□ Scan mode overlay disappears completely"
echo ""
echo "EDGE CASE TESTING:"
echo "□ Try hovering over buttons, inputs, text, divs"
echo "□ Test nested elements (hover deep elements)"
echo "□ Test form elements and interactive components"
echo "□ Verify Shadow DOM elements work (if present)"
echo ""
echo "If any issues remain:"
echo "- Check browser console (F12) for errors"
echo "- Ensure extension is properly loaded"
echo "- Try refreshing the page and retesting"
echo ""
echo "Press Ctrl+C to close test when done"

# Wait for Chrome to close or user to interrupt
wait $CHROME_PID 2>/dev/null

echo ""
echo "🏁 Test completed!"
echo ""
echo "If the fixes worked correctly, you should have seen:"
echo "✅ No page blur during scan mode"
echo "✅ Clear visibility of all page elements"
echo "✅ Smooth orange hover highlighting"
echo "✅ No JavaScript console errors"
echo "✅ Working element selection and scanning"
