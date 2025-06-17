#!/bin/bash

# Test script for debug version of content script
echo "🔧 Testing Debug Content Script..."

echo "✅ Debug version is now active"
echo ""
echo "🔍 Test Process:"
echo "   1. Extension is now using content-debug.js (simplified version)"
echo "   2. Open browser console (F12) to see detailed debug logs"
echo "   3. Navigate to any webpage or use the debug page"
echo "   4. Scan the page with the extension"
echo "   5. Check console for detailed element processing logs"
echo ""

# Check if the debug page exists, if not create a simple one
if [ ! -f "debug-empty-results.html" ]; then
    cat > debug-simple-test.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Simple Debug Test</title>
</head>
<body>
    <h1 id="heading">Test Heading</h1>
    <button id="btn" class="test-btn">Test Button</button>
    <input type="text" id="input" placeholder="Test input">
    <div class="content">Test Content</div>
</body>
</html>
EOF
    echo "✅ Created simple test page: debug-simple-test.html"
    TEST_FILE="$(pwd)/debug-simple-test.html"
else
    TEST_FILE="$(pwd)/debug-empty-results.html"
fi

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

echo "🚀 Launching Chrome with debug extension..."
echo ""
echo "📋 Debug Checklist:"
echo "   ✅ Browser console open (F12)"
echo "   ✅ Look for 'Debug content script starting...' message"
echo "   ✅ Scan page and watch for detailed element logs"
echo "   ✅ Check if elements have actual attribute data"
echo "   ✅ Verify results table shows real data, not 'No attributes'"
echo ""

$CHROME_CMD --load-extension="$(pwd)" "file://$TEST_FILE" &

echo "💡 If you still see empty results:"
echo "   • Check console for any JavaScript errors"
echo "   • Look for 'Debug: Processing element X' messages"
echo "   • Verify element data in console logs shows actual attributes"
echo "   • If console shows good data but table is empty, it's a display issue"
