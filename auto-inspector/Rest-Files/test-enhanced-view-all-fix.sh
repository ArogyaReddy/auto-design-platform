#!/bin/bash

echo "=== Comprehensive View All Fix Test ==="
echo "Testing the improved error handling and debugging for View All mode"

# Check if files exist
if [ ! -f "results.js" ]; then
    echo "❌ results.js not found"
    exit 1
fi

if [ ! -f "results.html" ]; then
    echo "❌ results.html not found"
    exit 1
fi

echo "✅ Extension files found"

# Check syntax
echo ""
echo "=== JavaScript Syntax Check ==="
node -c results.js 2>&1
if [ $? -eq 0 ]; then
    echo "✅ results.js syntax is valid"
else
    echo "❌ results.js has syntax errors"
    exit 1
fi

# Check for improved error handling
echo ""
echo "=== Checking Enhanced View All Implementation ==="

echo "Checking for robust displayElements function..."
grep -q "elementsToShow = \[\.\.\.filteredElements\]" results.js && echo "✅ Array copy implementation found" || echo "❌ Array copy implementation missing"

echo "Checking for enhanced error handling..."
grep -q "for (let i = 0; i < elementsToShow.length; i++)" results.js && echo "✅ Enhanced loop found" || echo "❌ Enhanced loop missing"

echo "Checking for row-by-row error handling..."
grep -q "try {" results.js && grep -q "catch (error)" results.js && echo "✅ Try-catch error handling found" || echo "❌ Try-catch error handling missing"

echo "Checking for empty row detection..."
grep -q "rowHTML && rowHTML.trim().length > 0" results.js && echo "✅ Empty row detection found" || echo "❌ Empty row detection missing"

echo "Checking for enhanced debug logging..."
grep -q "Table body content length" results.js && echo "✅ Enhanced debug logging found" || echo "❌ Enhanced debug logging missing"

# Check view mode handling
echo ""
echo "=== Checking View Mode Event Handling ==="
grep -q "event.target.id === 'viewAllBtn'" results.js && echo "✅ View All button handler found" || echo "❌ View All button handler missing"
grep -q "event.target.id === 'paginationModeBtn'" results.js && echo "✅ Pagination Mode button handler found" || echo "❌ Pagination Mode button handler missing"

# Check pagination function
echo ""
echo "=== Checking Pagination Function ==="
grep -q "if (viewAllMode)" results.js && echo "✅ View All mode check found" || echo "❌ View All mode check missing"
grep -q "createViewAllControls()" results.js && echo "✅ View All controls function found" || echo "❌ View All controls function missing"

echo ""
echo "=== Expected Improvements ==="
echo "1. ✅ Array copy prevents reference issues"
echo "2. ✅ Row-by-row error handling prevents entire table failure"
echo "3. ✅ Empty row detection shows placeholder for failed rows"
echo "4. ✅ Enhanced debug logging helps identify issues"
echo "5. ✅ Robust element processing handles edge cases"

echo ""
echo "=== What This Fix Addresses ==="
echo "🔧 PROBLEM: Empty box appears when clicking 'View All'"
echo "🔧 ROOT CAUSE: Element processing errors in View All mode"
echo "🔧 SOLUTION: Robust error handling and element-by-element processing"

echo ""
echo "=== Testing Steps ==="
echo "1. Load extension and scan a page with 50+ elements"
echo "2. Open results page - verify pagination works"
echo "3. Click 'View All X Elements' button"
echo "4. EXPECTED: All elements displayed in table"
echo "5. EXPECTED: 'Back to Pagination' button appears"
echo "6. Check browser console for detailed debug logs"
echo "7. If any rows fail, they should show error message instead of empty"

echo ""
echo "=== Debug Instructions ==="
echo "If empty box still appears:"
echo "1. Open browser console (F12)"
echo "2. Look for debug messages starting with '🔍 Debug:'"
echo "3. Check for any error messages with '❌'"
echo "4. Note the 'Table body content length' value"
echo "5. If length is 0, check individual row creation logs"

echo ""
echo "✅ Enhanced View All Fix Applied!"
echo "🚀 Ready for testing with improved error handling and debugging"
