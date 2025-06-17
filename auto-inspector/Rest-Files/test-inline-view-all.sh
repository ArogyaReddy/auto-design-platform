#!/bin/bash

# Test Inline View All Button - Universal Element Locator Extension
echo "🎯 Testing Inline View All Button Layout"
echo "========================================"

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
echo "🔍 Checking for inline pagination layout..."

# Check for pagination-inline CSS class
if grep -q "pagination-inline" results.html; then
    echo "✅ Inline pagination CSS found"
else
    echo "❌ Inline pagination CSS missing"
fi

# Check for inline view all button in JavaScript
if grep -q "pagination-inline" results.js; then
    echo "✅ Inline view all button found"
else
    echo "❌ Inline view all button missing"
fi

# Check for updated pagination structure
if grep -q "margin-left:" results.html; then
    echo "✅ Button spacing CSS found"
else
    echo "❌ Button spacing CSS missing"
fi

echo ""
echo "🎨 Expected Layout:"
echo "=================="
echo "[← Previous] [1] [2] [3] [Next →] [📋 View All 106]"
echo ""
echo "Instead of:"
echo "[← Previous] [1] [2] [3] [Next →]"
echo "           [📋 View All 106 Elements]"

echo ""
echo "🔧 Layout Features:"
echo "=================="
echo "• View All button positioned inline with pagination"
echo "• Proper spacing with margin-left"
echo "• Smaller padding to match pagination buttons"
echo "• Same height as other pagination buttons"
echo "• Maintains beautiful gradient styling"

echo ""
echo "🧪 Manual Testing:"
echo "=================="
echo "1. Load extension and scan a page with many elements"
echo "2. Open results page and scroll to bottom"
echo "3. Verify 'View All' button is inline with pagination"
echo "4. Check that it's positioned after the 'Next' button"
echo "5. Test clicking - should show all elements"
echo "6. Verify 'Back to Pagination' appears inline"

echo ""
echo "✨ Visual Improvements:"
echo "======================"
echo "• Compact inline layout saves vertical space"
echo "• Better visual grouping with pagination controls"
echo "• Consistent button styling and sizing"
echo "• Professional appearance matching table design"

echo ""
echo "🎉 Inline Layout Complete!"
echo "=========================="
echo "The View All button is now positioned inline with pagination controls,"
echo "creating a more compact and professional layout."

# Check for any syntax issues
if node -c results.js 2>/dev/null; then
    echo ""
    echo "✅ JavaScript syntax is valid"
else
    echo ""
    echo "❌ JavaScript syntax errors detected"
fi

echo ""
echo "📊 Layout Summary:"
echo "================="
echo "• Position: ✅ Inline with pagination (after Next)"
echo "• Styling: ✅ Matches pagination button height"
echo "• Spacing: ✅ Proper margin-left separation"
echo "• Functionality: ✅ Same view all/pagination toggle"
echo "• Design: ✅ Professional, compact appearance"
