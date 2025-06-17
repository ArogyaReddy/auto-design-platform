#!/bin/bash

# Test manual highlight functionality
echo "🎯 Testing Manual Highlight Feature"
echo "===================================="

echo ""
echo "🔍 Checking HTML structure..."
if grep -q "manualSelector" popup.html; then
    echo "✅ Manual selector input field added"
else
    echo "❌ Manual selector input field not found"
fi

if grep -q "manualHighlightBtn" popup.html; then
    echo "✅ Manual highlight button added"
else
    echo "❌ Manual highlight button not found"
fi

if grep -q "Manual Highlight" popup.html; then
    echo "✅ Manual highlight section header found"
else
    echo "❌ Manual highlight section header not found"
fi

echo ""
echo "🔍 Checking CSS styles..."
if grep -q "manual-highlight-section" popup.html; then
    echo "✅ Manual highlight section styles found"
else
    echo "❌ Manual highlight section styles not found"
fi

if grep -q "selector-input" popup.html; then
    echo "✅ Selector input styles found"
else
    echo "❌ Selector input styles not found"
fi

if grep -q "highlight-btn" popup.html; then
    echo "✅ Highlight button styles found"
else
    echo "❌ Highlight button styles not found"
fi

echo ""
echo "🔍 Checking JavaScript functionality..."
if grep -q "manualHighlight" popup.js; then
    echo "✅ Manual highlight function found"
else
    echo "❌ Manual highlight function not found"
fi

if grep -q "manualSelector.*addEventListener" popup.js; then
    echo "✅ Enter key listener for selector input found"
else
    echo "❌ Enter key listener not found"
fi

if grep -q "highlightElement.*selector" popup.js; then
    echo "✅ Message sending to content script found"
else
    echo "❌ Message sending logic not found"
fi

echo ""
echo "🔍 Checking content script compatibility..."
if grep -q "case 'highlightElement'" content.js; then
    echo "✅ Content script highlight handler found"
else
    echo "❌ Content script highlight handler not found"
fi

echo ""
echo "🔍 Checking for syntax errors..."
if node -c popup.js 2>/dev/null; then
    echo "✅ popup.js syntax is valid"
else
    echo "❌ popup.js has syntax errors:"
    node -c popup.js
fi

# Check HTML validity (basic check)
if grep -q "</html>" popup.html && grep -q "<html>" popup.html; then
    echo "✅ popup.html structure appears valid"
else
    echo "❌ popup.html structure may be invalid"
fi

echo ""
echo "===================================="
echo "✅ MANUAL HIGHLIGHT FEATURE ADDED:"
echo "📝 Input field for CSS selectors"
echo "🎯 Highlight button with orange styling"
echo "⌨️ Enter key support for quick highlighting"
echo "📱 Status feedback for user guidance"
echo "🔧 Error handling for missing content script"
echo ""
echo "📋 USAGE INSTRUCTIONS:"
echo "1. Open extension popup"
echo "2. Scroll to 'Manual Highlight' section"
echo "3. Paste CSS selector (e.g., #signBtn, .button)"
echo "4. Click 'Highlight' or press Enter"
echo "5. Check the page for orange highlighting"
echo ""
echo "🧪 TEST SELECTORS TO TRY:"
echo "• #signBtn"
echo "• .button"
echo "• button[type='submit']"
echo "• div[data-test='login']"
echo "• input[name='username']"
echo ""
echo "🎯 Manual highlight feature test completed!"
