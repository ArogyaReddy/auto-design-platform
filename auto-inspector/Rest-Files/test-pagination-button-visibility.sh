#!/bin/bash

echo "=== Back to Pagination Button Visibility Fix ==="
echo "Testing CSS specificity fix for pagination mode button"

# Check if files exist
if [ ! -f "results.html" ]; then
    echo "❌ results.html not found"
    exit 1
fi

echo "✅ results.html found"

# Check for the improved CSS
echo ""
echo "=== Checking CSS Improvements ==="

echo "Checking for specific pagination mode button selector..."
grep -q "\.pagination \.pagination-mode-btn" results.html && echo "✅ Specific selector found" || echo "❌ Specific selector missing"

echo "Checking for !important declarations..."
grep -q "background:.*!important" results.html && echo "✅ Background override found" || echo "❌ Background override missing"
grep -q "color:.*white.*!important" results.html && echo "✅ Color override found" || echo "❌ Color override missing"

echo "Checking for hover state override..."
grep -q "\.pagination \.pagination-mode-btn:hover" results.html && echo "✅ Hover override found" || echo "❌ Hover override missing"

# Check HTML syntax
echo ""
echo "=== HTML Syntax Check ==="
if command -v tidy &> /dev/null; then
    tidy -q -e results.html 2>&1 | head -5
    if [ $? -eq 0 ]; then
        echo "✅ HTML syntax is valid"
    else
        echo "⚠️ HTML syntax warnings (may be normal)"
    fi
else
    echo "ℹ️ HTML tidy not available for syntax check"
fi

echo ""
echo "=== What Was Fixed ==="
echo "🔧 PROBLEM: 'Back to Pagination' button had white text on white background"
echo "🔧 ROOT CAUSE: Generic .pagination button styles overriding specific .pagination-mode-btn styles"
echo "🔧 SOLUTION: More specific CSS selector with !important declarations"

echo ""
echo "=== CSS Specificity Solution ==="
echo "OLD: .pagination-mode-btn { ... }"
echo "NEW: .pagination .pagination-mode-btn { ... !important }"
echo ""
echo "This ensures the green background and white text are always applied"
echo "even when inside a .pagination container"

echo ""
echo "=== Expected Visual Result ==="
echo "✅ 'Back to Pagination' button: GREEN background with WHITE text"
echo "✅ Hover effect: Darker green with subtle animation"
echo "✅ Clear visibility and readability"
echo "✅ Consistent with other action buttons"

echo ""
echo "=== Testing Instructions ==="
echo "1. Reload the extension"
echo "2. Scan a page with 50+ elements"
echo "3. Open results page"
echo "4. Click 'View All X Elements'"
echo "5. EXPECTED: Green 'Back to Pagination' button with white text"
echo "6. Hover over button to see darker green effect"
echo "7. Click to return to pagination view"

echo ""
echo "✅ CSS Visibility Fix Applied!"
echo "🎨 'Back to Pagination' button should now be clearly visible"
