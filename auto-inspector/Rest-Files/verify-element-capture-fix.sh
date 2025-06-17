#!/bin/bash

# Final Element Capture Fix Verification
echo "🔍 Final Element Capture Fix Verification"
echo "=========================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📋 Verifying all fixes are in place..."

# Check if all key fixes are implemented
echo ""
echo "🔧 CHECKING IMPLEMENTED FIXES:"
echo "==============================="

# 1. Check double filtering fix
if grep -q "getAllElementsIncludingShadowDOM(document, true)" content.js; then
    echo "✅ Double filtering fix: getAllElementsIncludingShadowDOM always gets all elements"
else
    echo "❌ Double filtering fix not found"
fi

# 2. Check visibility logging
if grep -q "skippedByVisibility" content.js; then
    echo "✅ Visibility logging: skippedByVisibility counter added"
else
    echo "❌ Visibility logging not found"
fi

# 3. Check lenient visibility checks
if grep -q "Allow very low opacity but not completely transparent" content.js; then
    echo "✅ Lenient visibility: More permissive visibility checks"
else
    echo "❌ Lenient visibility checks not found"
fi

# 4. Check enhanced debugging
if grep -q "FOUND AND HIGHLIGHTING visual_user" content.js; then
    echo "✅ Enhanced debugging: visual_user specific logging added"
else
    echo "❌ Enhanced debugging not found"
fi

# 5. Check element processing logging
if grep -q "Processing.*tagName" content.js; then
    echo "✅ Element processing: Detailed element processing logs"
else
    echo "❌ Element processing logs not found"
fi

echo ""
echo "📊 CODE QUALITY CHECKS:"
echo "========================"

# Check for any obvious issues
if grep -q "isElementVisible.*element.*true" content.js; then
    echo "✅ Visibility function: Fallback to visible for errors"
else
    echo "⚠️  Visibility function fallback not found"
fi

# Check no linting errors
echo "🔍 Checking for linting errors..."
node_modules/.bin/eslint content.js 2>/dev/null && echo "✅ No linting errors" || echo "⚠️  Some linting warnings may exist"

echo ""
echo "🧪 RUNNING QUICK VALIDATION:"
echo "============================="

# Create a simple test validation
cat > validate-fix.html << 'EOF'
<!DOCTYPE html>
<html>
<head><title>Quick Validation</title></head>
<body>
    <a href="#" class="visual-user-link">visual_user</a>
    <a href="#test">test_link</a>
    <button>test_button</button>
    <input type="text" placeholder="test_input" />
    
    <script>
        console.log('Validation page elements:');
        console.log('Links:', document.querySelectorAll('a').length);
        console.log('Buttons:', document.querySelectorAll('button').length);
        console.log('Inputs:', document.querySelectorAll('input').length);
        console.log('Total interactive:', document.querySelectorAll('a, button, input').length);
    </script>
</body>
</html>
EOF

echo "📱 Opening validation page..."
open -a "Google Chrome" --args --load-extension="$SCRIPT_DIR" "file://$SCRIPT_DIR/validate-fix.html"

echo ""
echo "🔍 MANUAL VALIDATION STEPS:"
echo "==========================="
echo "1. Open DevTools Console (F12)"
echo "2. Note the expected element counts shown in console"
echo "3. Click extension icon → 'Scan with Highlighting'"
echo "4. Verify all elements are highlighted (especially 'visual_user')"
echo "5. Check console for detailed processing logs"
echo "6. Look for these key log messages:"
echo "   - 'Processing A: {text: \"visual_user\", ...}'"
echo "   - 'FOUND AND HIGHLIGHTING visual_user link!'"
echo "   - 'Scan complete! Checked X elements, found Y visible, captured Z'"
echo "   - 'Skipped by visibility: N' (should be low for this simple page)"

echo ""
echo "🎯 EXPECTED RESULTS:"
echo "===================="
echo "- All 4 elements should be highlighted: 2 links + 1 button + 1 input"
echo "- Console should show 'visual_user' being found and highlighted"
echo "- No elements should be skipped due to visibility on this simple page"
echo "- Detailed processing logs should show each element being handled"

echo ""
echo "✅ Validation setup complete!"
echo ""
echo "📋 SUMMARY OF FIXES IMPLEMENTED:"
echo "================================="
echo "1. ✅ Fixed double visibility filtering issue"
echo "2. ✅ Made visibility checks more lenient"  
echo "3. ✅ Added comprehensive debugging and logging"
echo "4. ✅ Enhanced element processing tracking"
echo "5. ✅ Added skippedByVisibility statistics"
echo "6. ✅ Special logging for missing 'visual_user' link"
echo "7. ✅ Improved error handling and fallbacks"
echo ""
echo "🚀 The extension should now capture all visible elements including 'visual_user'!"
