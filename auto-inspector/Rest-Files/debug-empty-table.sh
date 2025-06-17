#!/bin/bash

echo "🔍 Debugging Empty Table Issue"
echo "==============================="

echo "📋 Potential causes to investigate:"
echo "1. Data not being loaded from storage"
echo "2. applyFilters() being called too early"
echo "3. Filter elements not found causing issues"
echo "4. Data processing/display logic broken"
echo ""

echo "🧪 Testing steps:"
echo "1. Load extension and scan a test page"
echo "2. Open browser console (F12)"
echo "3. Check for any JavaScript errors"
echo "4. Look for debug messages like:"
echo "   - '🔍 Debug: Raw storage result:'"
echo "   - '✅ Debug: scanResults loaded:'"
echo "   - '🔍 Debug: filteredElements after assignment:'"
echo "   - '🔍 Debug: displayElements() called'"
echo ""

echo "🔧 Quick browser console test:"
echo "After scanning a page, run these in console:"
echo ""
echo "// Check if data is loaded"
echo "chrome.storage.local.get(['scanResults'], (result) => {"
echo "  console.log('Storage data:', result);"
echo "});"
echo ""
echo "// Check current variables"
echo "console.log('scanResults:', scanResults);"
echo "console.log('filteredElements:', filteredElements);"
echo ""
echo "// Check if filter elements exist"
echo "console.log('stateFilter exists:', !!document.getElementById('stateFilter'));"
echo "console.log('locatorFilter exists:', !!document.getElementById('locatorFilter'));"
echo ""

echo "🎯 Most likely issue:"
echo "Based on the screenshot showing rows with no data, the problem is likely:"
echo "- Elements are being detected (table has rows)"
echo "- But element data is not being populated correctly"
echo "- This suggests a data processing issue, not a loading issue"
echo ""

echo "🚀 Test page to use:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "open full-width-test.html"
else
    echo "xdg-open full-width-test.html"
fi

echo ""
echo "✨ Debug session ready!"
