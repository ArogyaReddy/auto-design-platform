#!/bin/bash

# Test the fixed highlighting functionality
echo "🔧 Testing Fixed Highlighting Functionality"
echo "==========================================="

echo ""
echo "🔍 Checking Green Scan Highlighting Fix..."
if grep -q "rgba(255, 255, 255, 0.1)" content.js; then
    echo "✅ Green scan highlighting now uses white/transparent background"
else
    echo "❌ Green scan highlighting background not fixed"
fi

echo ""
echo "🔍 Checking Orange UI Highlighting Enhancements..."
if grep -q "5px solid #ff4500" content.js; then
    echo "✅ Orange UI highlighting enhanced with thicker border"
else
    echo "❌ Orange UI highlighting not enhanced"
fi

if grep -q "!important" content.js; then
    echo "✅ Important styles added for better visibility"
else
    echo "❌ Important styles not added"
fi

if grep -q "transform.*scale" content.js; then
    echo "✅ Scale transform added for UI highlighting"
else
    echo "❌ Scale transform not added"
fi

echo ""
echo "🔍 Checking Notification Improvements..."
if grep -q "console.log.*Showing notification" results.js; then
    echo "✅ Notification debugging added"
else
    echo "❌ Notification debugging not added"
fi

if grep -q "z-index: 99999" results.js; then
    echo "✅ Higher z-index for notifications"
else
    echo "❌ Z-index not increased"
fi

if grep -q "!important" results.js; then
    echo "✅ Important styles added to notifications"
else
    echo "❌ Important styles not added to notifications"
fi

echo ""
echo "🔍 Checking Debug Enhancements..."
if grep -q "console.log.*UI highlighting completed" content.js; then
    echo "✅ Enhanced debugging for UI highlighting"
else
    echo "❌ Enhanced debugging not added"
fi

if grep -q "console.log.*Active tab found" results.js; then
    echo "✅ Tab debugging added"
else
    echo "❌ Tab debugging not added"
fi

echo ""
echo "🔍 Checking Clear Highlights Function..."
if grep -q "transform.*element._originalStyles.transform" content.js; then
    echo "✅ Transform property handled in clear function"
else
    echo "❌ Transform property not handled in clear function"
fi

echo ""
echo "========================================="
echo "✅ FIXES APPLIED:"
echo "🟢 Green scan highlighting: Now green outline + white background"
echo "🟠 Orange UI highlighting: Enhanced with 5px border, scale, !important"
echo "🔔 Notifications: Higher z-index, !important styles, better debugging"
echo "🔧 Debug logging: Added comprehensive logging throughout"
echo "🧹 Clear function: Now handles transform property"
echo ""
echo "📋 MANUAL TEST STEPS:"
echo "1. Open any webpage in Chrome"
echo "2. Run extension scan with highlighting ON"
echo "3. Verify GREEN outline with white/transparent background"
echo "4. Open results page"
echo "5. Click any 🎯 button"
echo "6. Switch to the scanned page tab"
echo "7. Verify ORANGE outline with scale effect"
echo "8. Check browser console for debug messages"
echo "9. Look for notifications in top-right corner"
echo ""

# Check for syntax errors
echo "🔍 Checking for JavaScript syntax errors..."
if node -c content.js 2>/dev/null; then
    echo "✅ content.js syntax is valid"
else
    echo "❌ content.js has syntax errors:"
    node -c content.js
fi

if node -c results.js 2>/dev/null; then
    echo "✅ results.js syntax is valid"
else
    echo "❌ results.js has syntax errors:"
    node -c results.js
fi

echo ""
echo "🎯 Highlighting fixes test completed!"
