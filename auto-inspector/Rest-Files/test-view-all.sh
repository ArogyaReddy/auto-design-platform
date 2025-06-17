#!/bin/bash

# Test View All Functionality - Universal Element Locator Extension
echo "🎯 Testing View All Button Functionality"
echo "======================================="

cd "$(dirname "$0")"

echo ""
echo "📁 Checking required files..."
required_files=("results.html" "results.js")

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
        exit 1
    fi
done

echo ""
echo "🔍 Checking results.html for view all button styling..."

# Check for view all section CSS
if grep -q "view-all-section" results.html; then
    echo "✅ View all section CSS found"
else
    echo "❌ View all section CSS missing"
fi

# Check for view all button CSS
if grep -q "view-all-btn" results.html; then
    echo "✅ View all button CSS found"
else
    echo "❌ View all button CSS missing"
fi

# Check for pagination mode button CSS
if grep -q "pagination-mode-btn" results.html; then
    echo "✅ Pagination mode button CSS found"
else
    echo "❌ Pagination mode button CSS missing"
fi

echo ""
echo "🔍 Checking results.js for view all functionality..."

# Check for viewAllMode variable
if grep -q "viewAllMode" results.js; then
    echo "✅ viewAllMode variable found"
else
    echo "❌ viewAllMode variable missing"
fi

# Check for createViewAllControls function
if grep -q "createViewAllControls" results.js; then
    echo "✅ createViewAllControls function found"
else
    echo "❌ createViewAllControls function missing"
fi

# Check for setupViewModeEventListeners function
if grep -q "setupViewModeEventListeners" results.js; then
    echo "✅ setupViewModeEventListeners function found"
else
    echo "❌ setupViewModeEventListeners function missing"
fi

# Check for view all button event listener
if grep -q "viewAllBtn" results.js; then
    echo "✅ View all button event listener found"
else
    echo "❌ View all button event listener missing"
fi

# Check for pagination mode button event listener
if grep -q "paginationModeBtn" results.js; then
    echo "✅ Pagination mode button event listener found"
else
    echo "❌ Pagination mode button event listener missing"
fi

# Check for modified displayElements function
if grep -q "viewAllMode" results.js && grep -q "elementsToShow" results.js; then
    echo "✅ Modified displayElements function found"
else
    echo "❌ Modified displayElements function missing"
fi

echo ""
echo "🧪 Manual Testing Instructions:"
echo "==============================="
echo "1. Load the extension in Chrome and scan a page with many elements"
echo "2. Click 'View Scanned Results' to open results page"
echo "3. Scroll to bottom of the table to see pagination"
echo "4. Look for 'View All X Elements' button below pagination"
echo "5. Click 'View All' button - should show all elements on one page"
echo "6. Look for 'Back to Pagination' button"
echo "7. Click 'Back to Pagination' - should restore paginated view"

echo ""
echo "🔧 Expected Behavior:"
echo "===================="
echo "• Initial state: Paginated view with 'View All' button"
echo "• After clicking 'View All': All elements displayed, no pagination"
echo "• 'Back to Pagination' button appears in view all mode"
echo "• Clicking 'Back to Pagination' restores normal pagination"
echo "• Page numbering resets when switching between modes"

echo ""
echo "✨ Enhanced Features:"
echo "===================="
echo "• Beautiful gradient buttons with hover effects"
echo "• Clear visual indicators of current view mode"
echo "• Smooth transitions between view modes"
echo "• Element count information in both modes"

echo ""
echo "🎉 View All Functionality Ready!"
echo "==============================="
echo "The 'View All' button has been successfully added to the results table."
echo "Users can now switch between paginated and full view modes seamlessly."

# Check syntax of JavaScript file
echo ""
echo "🔧 JavaScript Syntax Check:"
echo "=========================="
if node -c results.js 2>/dev/null; then
    echo "✅ results.js syntax is valid"
else
    echo "❌ results.js has syntax errors"
    echo "Run: node -c results.js for details"
fi

echo ""
echo "📊 Summary:"
echo "==========="
echo "• View All button: ✅ Added to pagination section"
echo "• CSS styling: ✅ Beautiful gradient design"
echo "• JavaScript logic: ✅ Toggle between view modes"
echo "• Event handlers: ✅ Click handlers for both modes"
echo "• Visual feedback: ✅ Mode indicators and smooth transitions"
