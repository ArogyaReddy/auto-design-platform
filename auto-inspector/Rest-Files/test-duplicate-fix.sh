#!/bin/bash

# Test Content Script Duplicate Variable Fix
echo "🔧 Testing Content Script Duplicate Variable Fix"
echo "=============================================="

cd "$(dirname "$0")"

echo ""
echo "📁 Checking content.js file..."

if [[ -f "content.js" ]]; then
    echo "✅ content.js found"
else
    echo "❌ content.js missing"
    exit 1
fi

echo ""
echo "🔍 Checking for duplicate variable declarations..."

# Check for multiple let/const/var declarations of highlightedElements
duplicate_count=$(grep -c "^\s*\(let\|const\|var\)\s\+highlightedElements" content.js)
if [[ $duplicate_count -eq 0 ]]; then
    echo "✅ No local variable declarations found (using window.highlightedElements)"
elif [[ $duplicate_count -eq 1 ]]; then
    echo "❌ Found 1 local variable declaration - should use window.highlightedElements"
else
    echo "❌ Found $duplicate_count local variable declarations - DUPLICATE ISSUE!"
fi

# Check for window.highlightedElements usage
window_usage=$(grep -c "window\.highlightedElements" content.js)
if [[ $window_usage -gt 0 ]]; then
    echo "✅ Using window.highlightedElements ($window_usage occurrences)"
else
    echo "❌ Not using window.highlightedElements"
fi

# Check for injection guard
if grep -q "universalLocatorInjected" content.js; then
    echo "✅ Injection guard found"
else
    echo "❌ Injection guard missing"
fi

# Check for listener guard
if grep -q "universalLocatorListenerAdded" content.js; then
    echo "✅ Listener guard found"
else
    echo "❌ Listener guard missing"
fi

echo ""
echo "🔧 JavaScript Syntax Check:"
echo "=========================="
if node -c content.js 2>/dev/null; then
    echo "✅ content.js syntax is valid"
else
    echo "❌ content.js has syntax errors"
    echo "Details:"
    node -c content.js
    exit 1
fi

echo ""
echo "🔍 Checking key functions..."

# Check for highlightElement function
if grep -q "function highlightElement" content.js; then
    echo "✅ highlightElement function found"
else
    echo "❌ highlightElement function missing"
fi

# Check for clearAllHighlighting function
if grep -q "function clearAllHighlighting" content.js; then
    echo "✅ clearAllHighlighting function found"
else
    echo "❌ clearAllHighlighting function missing"
fi

echo ""
echo "🧪 Expected Fix Summary:"
echo "======================="
echo "• Variable scope: window.highlightedElements (global)"
echo "• Injection guard: Prevents multiple script loading"
echo "• Listener guard: Prevents duplicate event listeners"
echo "• No local variable declarations that could conflict"

echo ""
echo "🎯 What Was Fixed:"
echo "=================="
echo "• Moved 'let highlightedElements = []' to 'window.highlightedElements = []'"
echo "• Updated all references to use window.highlightedElements"
echo "• Added listener guard to prevent duplicate event listeners"
echo "• Maintained existing injection guard for script loading"

echo ""
echo "✨ Benefits:"
echo "==========="
echo "• No more 'Identifier already declared' errors"
echo "• Prevents conflicts when content script loads multiple times"
echo "• Maintains highlighting functionality across page navigation"
echo "• Robust error handling for dynamic page content"

echo ""
if [[ $duplicate_count -eq 0 ]] && [[ $window_usage -gt 0 ]]; then
    echo "🎉 Fix Successful!"
    echo "================="
    echo "The duplicate variable declaration issue has been resolved."
    echo "Content script will no longer throw 'Identifier already declared' errors."
else
    echo "⚠️  Fix Incomplete"
    echo "================"
    echo "There may still be duplicate variable issues."
    echo "Check the content script manually for remaining conflicts."
fi

echo ""
echo "📋 Testing Instructions:"
echo "======================="
echo "1. Reload the extension in Chrome"
echo "2. Navigate to any webpage"
echo "3. Open browser console (F12)"
echo "4. Click extension icon and scan page"
echo "5. Verify no 'Identifier already declared' errors appear"
echo "6. Test element highlighting works correctly"
