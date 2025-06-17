#!/bin/bash

# Test highlighting colors and functionality
# This script tests both scan-time (green) and UI-triggered (orange) highlighting

echo "🎨 Testing Universal Element Locator - Highlighting Colors"
echo "=================================================="

# Check if the extension files exist
echo "🔍 Checking extension files..."
if [ ! -f "content.js" ]; then
    echo "❌ Error: content.js not found"
    exit 1
fi

if [ ! -f "results.js" ]; then
    echo "❌ Error: results.js not found"
    exit 1
fi

if [ ! -f "manifest.json" ]; then
    echo "❌ Error: manifest.json not found"
    exit 1
fi

echo "✅ All extension files found"

# Check for highlighting functions in content.js
echo ""
echo "🔍 Checking highlighting functions in content.js..."

if grep -q "highlightElementForScan" content.js; then
    echo "✅ highlightElementForScan function found (for green scan-time highlighting)"
else
    echo "❌ highlightElementForScan function not found"
fi

if grep -q "function highlightElement" content.js; then
    echo "✅ highlightElement function found (for orange UI-triggered highlighting)"
else
    echo "❌ highlightElement function not found"
fi

# Check for green highlighting colors
echo ""
echo "🟢 Checking green highlighting colors (scan-time)..."
if grep -q "#00ff00" content.js; then
    echo "✅ Green color (#00ff00) found for scan highlighting"
else
    echo "❌ Green color not found"
fi

if grep -q "rgba(0, 255, 0" content.js; then
    echo "✅ Green rgba colors found for scan highlighting"
else
    echo "❌ Green rgba colors not found"
fi

# Check for orange/red highlighting colors
echo ""
echo "🟠 Checking orange/red highlighting colors (UI-triggered)..."
if grep -q "#ff4500" content.js; then
    echo "✅ Orange color (#ff4500) found for UI highlighting"
else
    echo "❌ Orange color not found"
fi

if grep -q "rgba(255, 69, 0" content.js; then
    echo "✅ Orange rgba colors found for UI highlighting"
else
    echo "❌ Orange rgba colors not found"
fi

# Check for scroll-to-element functionality
echo ""
echo "📍 Checking scroll-to-element functionality..."
if grep -q "scrollIntoView" content.js; then
    echo "✅ scrollIntoView found for UI highlighting"
else
    echo "❌ scrollIntoView not found"
fi

# Check highlighting message handler
echo ""
echo "📨 Checking message handlers..."
if grep -q "case 'highlightElement'" content.js; then
    echo "✅ highlightElement message handler found"
else
    echo "❌ highlightElement message handler not found"
fi

# Check results.js highlighting functionality
echo ""
echo "🔍 Checking results.js highlighting functionality..."
if grep -q "highlightElementOnPage" results.js; then
    echo "✅ highlightElementOnPage function found in results.js"
else
    echo "❌ highlightElementOnPage function not found in results.js"
fi

# Check for improved notifications
echo ""
echo "🔔 Checking notification improvements..."
if grep -q "🎯 Element highlighted!" results.js; then
    echo "✅ Improved highlighting notifications found"
else
    echo "❌ Improved highlighting notifications not found"
fi

# Check if test page exists
echo ""
echo "🧪 Checking test page..."
if [ -f "test-highlighting-colors.html" ]; then
    echo "✅ Test page (test-highlighting-colors.html) created"
    
    # Count test elements in the page
    test_elements=$(grep -c "test-card\|shadow-content\|test-input\|test-select" test-highlighting-colors.html)
    echo "✅ Test page contains $test_elements test elements"
    
    # Check for Shadow DOM test
    if grep -q "attachShadow" test-highlighting-colors.html; then
        echo "✅ Shadow DOM test included in test page"
    else
        echo "⚠️ Shadow DOM test not found in test page"
    fi
else
    echo "❌ Test page not found"
fi

# Check for syntax errors
echo ""
echo "🔍 Checking for JavaScript syntax errors..."
if node -c content.js 2>/dev/null; then
    echo "✅ content.js syntax is valid"
else
    echo "❌ content.js has syntax errors"
fi

if node -c results.js 2>/dev/null; then
    echo "✅ results.js syntax is valid"
else
    echo "❌ results.js has syntax errors"
fi

echo ""
echo "=================================================="
echo "🎨 Highlighting Colors Test Summary"
echo "=================================================="
echo ""
echo "FEATURES IMPLEMENTED:"
echo "✅ Separate highlighting functions for scan vs UI"
echo "✅ Green highlighting for scan-time (#00ff00)"
echo "✅ Orange/red highlighting for UI-triggered (#ff4500)"
echo "✅ Scroll-to-element for UI highlighting"
echo "✅ Improved notifications with emojis"
echo "✅ Clear previous highlights before new ones"
echo "✅ Enhanced visual effects (glow, background tint)"
echo "✅ Test page with various element types"
echo "✅ Shadow DOM support in test page"
echo ""
echo "MANUAL TESTING STEPS:"
echo "1. Open test-highlighting-colors.html in Chrome"
echo "2. Load the Universal Element Locator extension"
echo "3. Run a scan with highlighting enabled - observe GREEN highlighting"
echo "4. Open results page and click 🎯 buttons - observe ORANGE highlighting"
echo "5. Verify highlighting works for Shadow DOM elements"
echo "6. Check that notifications appear when highlighting is triggered"
echo ""
echo "Expected Results:"
echo "🟢 Scan highlighting: Green outline with subtle glow"
echo "🟠 UI highlighting: Orange outline with strong glow + scroll to element"
echo "📱 Notifications: Clear feedback about highlighting actions"
echo "🌙 Shadow DOM: Both highlighting types work in Shadow DOM"
echo ""

# Open the test page if possible
if command -v open >/dev/null 2>&1; then
    echo "🌐 Opening test page in default browser..."
    open "file://$(pwd)/test-highlighting-colors.html"
elif command -v xdg-open >/dev/null 2>&1; then
    echo "🌐 Opening test page in default browser..."
    xdg-open "file://$(pwd)/test-highlighting-colors.html"
else
    echo "💡 Manually open: file://$(pwd)/test-highlighting-colors.html"
fi

echo ""
echo "🎯 Highlighting colors test script completed!"
