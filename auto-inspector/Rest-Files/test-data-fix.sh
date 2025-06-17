#!/bin/bash

echo "🔧 Testing Empty Table Data Fix"
echo "==============================="

echo "✅ Changes made to debug the issue:"
echo "1. ✅ Added detailed logging to createElementRow function"
echo "2. ✅ Added logging to applyFilters function"
echo "3. ✅ Simplified createTextContentDisplay to handle multiple text sources"
echo "4. ✅ Simplified createAttributesDisplay with better error handling"
echo "5. ✅ Added console logs to trace data flow"
echo ""

echo "🔍 Test process:"
echo "1. Load the extension in Chrome"
echo "2. Open the browser console (F12)"
echo "3. Navigate to a test page (like full-width-test.html)"
echo "4. Click the extension icon and run a scan"
echo "5. Check the console for debug messages"
echo ""

echo "🎯 Look for these debug messages in console:"
echo "- '🔍 Debug: Raw storage result:'"
echo "- '🔍 Debug: scanResults loaded:'"
echo "- '🔍 Debug: applyFilters called, elements:'"
echo "- '🔍 Debug: Creating row for element:'"
echo "- '🔍 Debug: Element structure keys:'"
echo "- '🔍 Debug: createTextContentDisplay called with element:'"
echo "- '🔍 Debug: createAttributesDisplay called with:'"
echo ""

echo "💡 What the debug logs will tell us:"
echo "- If data is being loaded from storage correctly"
echo "- If elements have the expected data structure"
echo "- Which text/attribute fields are available in the elements"
echo "- If the helper functions are receiving the right data"
echo ""

echo "🚀 Quick test with sample page:"
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "open full-width-test.html"
else
    echo "xdg-open full-width-test.html"
fi

echo ""
echo "📋 Expected outcomes:"
echo "- Console will show the actual structure of scanned elements"
echo "- We'll see which data fields are missing or have different names"
echo "- Table should start showing actual data instead of 'No text content'"
echo ""

echo "✨ Debug session ready! Check browser console for detailed logs."
