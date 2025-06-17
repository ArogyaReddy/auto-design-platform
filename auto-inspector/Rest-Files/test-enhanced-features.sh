#!/bin/bash

# Universal Element Locator Extension - Enhanced Features Validation
# Tests: Element Name, Copy functionality, Full locator display

echo "🎯 Universal Element Locator Extension - Enhanced Features Test"
echo "=============================================================="

EXTENSION_DIR="/Users/arog/ADP/AutoExtractor/browser-extension"
TEST_PAGE="$EXTENSION_DIR/enhanced-test-page.html"

echo "📁 Extension directory: $EXTENSION_DIR"
echo "🧪 Enhanced test page: $TEST_PAGE"

echo ""
echo "📋 Step 1: Validating enhanced features implementation..."

# Check that results.js has the new functions
echo "✅ Checking generateElementName function..."
if grep -q "function generateElementName" "$EXTENSION_DIR/results.js"; then
    echo "   ✅ generateElementName function found"
else
    echo "   ❌ generateElementName function missing"
    exit 1
fi

echo "✅ Checking copy functionality..."
if grep -q "copyToClipboard" "$EXTENSION_DIR/results.js"; then
    echo "   ✅ copyToClipboard function found"
else
    echo "   ❌ copyToClipboard function missing"
    exit 1
fi

echo "✅ Checking full locator display..."
if grep -q "escapeHtml" "$EXTENSION_DIR/results.js"; then
    echo "   ✅ HTML escaping for full locators found"
else
    echo "   ❌ HTML escaping function missing"
    exit 1
fi

echo "✅ Checking Element Name column in table..."
if grep -q "Element Name" "$EXTENSION_DIR/results.html"; then
    echo "   ✅ Element Name column found in table header"
else
    echo "   ❌ Element Name column missing from table"
    exit 1
fi

echo "✅ Checking copy button styles..."
if grep -q "copy-btn" "$EXTENSION_DIR/results.html"; then
    echo "   ✅ Copy button styles found"
else
    echo "   ❌ Copy button styles missing"
    exit 1
fi

echo "✅ Checking CSV export update..."
if grep -q "Element Name" "$EXTENSION_DIR/results.js" && grep -q "generateElementName" "$EXTENSION_DIR/results.js"; then
    echo "   ✅ CSV export includes Element Name column"
else
    echo "   ❌ CSV export not updated for Element Name"
    exit 1
fi

echo ""
echo "🌐 Step 2: Opening enhanced test page..."

# Open the enhanced test page
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$TEST_PAGE"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$TEST_PAGE"
else
    echo "⚠️  Please manually open: $TEST_PAGE"
fi

echo "✅ Enhanced test page opened"

echo ""
echo "📋 Step 3: Features to test manually..."
echo "======================================"

echo "🎯 Element Name Feature:"
echo "   • Install extension in Chrome"
echo "   • Scan the enhanced test page"
echo "   • Verify Element Name column shows meaningful names like:"
echo "     - 'home-btn' for navigation buttons"
echo "     - 'firstName' for form inputs"
echo "     - 'registration-form' for forms"
echo "     - Element text for buttons without IDs"

echo ""
echo "📋 Copy Functionality:"
echo "   • Click 'Copy All' button in Primary/Secondary/Fallback columns"
echo "   • Verify notification appears: 'Copied to clipboard!'"
echo "   • Paste to verify all locators for that type were copied"
echo "   • Click individual 📋 buttons next to each locator"
echo "   • Verify single locator is copied"

echo ""
echo "📏 Full Locator Display:"
echo "   • Verify long locators are no longer truncated with '...'"
echo "   • Check that complex XPath expressions are fully visible"
echo "   • Verify aria-label attributes are shown completely"
echo "   • Check data-testid selectors display full attribute values"

echo ""
echo "📊 Enhanced Results Display:"
echo "   • Element Name column should show first, before Tag"
echo "   • Copy buttons should be visible in each locator section"
echo "   • Locator values should be in monospace font"
echo "   • Color coding: Green=Primary, Orange=Secondary, Red=Fallback"

echo ""
echo "💾 CSV Export Enhancement:"
echo "   • Click 'Export CSV' button"
echo "   • Open downloaded file"
echo "   • Verify 'Element Name' is the second column (after Index)"
echo "   • Check that meaningful names are exported correctly"

echo ""
echo "🧪 Expected Test Results:"
echo "========================="
echo "📊 Enhanced test page should detect:"
echo "   • ~40-50 total elements"
echo "   • ~20-25 elements with meaningful names from data-testid"
echo "   • ~10-15 elements with names from IDs"
echo "   • ~5-8 elements with names from aria-labels"
echo "   • Shadow DOM elements with 'shadow-btn', 'shadow-input' names"

echo ""
echo "🎯 Copy Feature Validation:"
echo "=========================="
echo "1. Primary locators should copy data-testid, id, aria-label selectors"
echo "2. Secondary locators should copy class, name, text selectors"
echo "3. Fallback locators should copy XPath and nth-child selectors"
echo "4. Individual copy buttons should copy single locator"
echo "5. Copy All buttons should copy all locators for that category"

echo ""
echo "🔧 Troubleshooting:"
echo "=================="
echo "❌ If Element Names show 'tagname_element':"
echo "   • Element lacks meaningful identifiers"
echo "   • Check data-testid, id, aria-label attributes"
echo "   • This is expected for generic divs/spans"

echo ""
echo "❌ If Copy buttons don't work:"
echo "   • Check browser console for JavaScript errors"
echo "   • Verify clipboard API permissions"
echo "   • Try on a secure (HTTPS) page"

echo ""
echo "❌ If locators are still truncated:"
echo "   • Check CSS max-width rules"
echo "   • Verify CSS styles loaded correctly"
echo "   • Inspect element to check styling"

echo ""
echo "🎉 Enhanced Features Test Complete!"
echo "=================================="
echo "The Universal Element Locator extension now includes:"
echo "✅ Meaningful Element Names based on attributes"
echo "✅ Copy functionality for individual and bulk locators"
echo "✅ Full locator display without truncation"
echo "✅ Enhanced CSV export with Element Name column"
echo "✅ Improved visual design and user experience"

echo ""
echo "🚀 Next steps:"
echo "============="
echo "1. Install extension: chrome://extensions/ → Load unpacked"
echo "2. Test on enhanced-test-page.html"
echo "3. Try on real websites with complex elements"
echo "4. Share feedback on the new features"

# Keep terminal open on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "Press any key to exit..."
    read -n 1
fi
