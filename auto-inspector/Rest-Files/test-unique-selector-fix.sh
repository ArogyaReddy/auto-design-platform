#!/bin/bash

echo "🔧 Testing Unique Selector Detection Fix"
echo "========================================"

# Open the test page
echo "📄 Opening debug test page..."
cd /Users/arog/ADP/AutoExtractor/browser-extension
if [ -f "debug-unique-selectors.html" ]; then
    echo "✅ Test page exists"
else
    echo "❌ Test page not found"
    exit 1
fi

echo ""
echo "🧪 Manual Testing Steps:"
echo "1. Load the Universal Element Locator extension in Chrome (Developer mode)"
echo "2. Open the debug-unique-selectors.html page"
echo "3. Use 'Scan Element' mode and select any action button"
echo "4. Verify the popup shows correct unique flags:"
echo "   - Basic selector: [data-testid=\"action-menu-button\"] should be ❌ (7 elements)"
echo "   - Contextual: #user-1-container [data-testid=\"action-menu-button\"] should be ✅ (1 element)"
echo "5. Click 🎯 Test buttons to verify highlighting works"
echo "6. Test both movable popup and extension highlighting"
echo ""

echo "🎯 Expected Fixes:"
echo "=================="
echo "✅ Contextual selectors now show correct unique flags"
echo "✅ Test buttons in popup highlight elements correctly"
echo "✅ Improved debugging output in console"
echo "✅ Proper selector validation and testing"
echo ""

echo "🔍 Debugging Commands (use in browser console):"
echo "================================================"
echo "testSelector('[data-testid=\"action-menu-button\"]')  // Should find 7 elements"
echo "testSelector('#user-1-container [data-testid=\"action-menu-button\"]')  // Should find 1 element"
echo "testSelector('[data-testid=\"save-button\"]')  // Should find 1 element"
echo ""

echo "🚀 If still seeing issues, check:"
echo "1. Chrome DevTools Console for any errors"
echo "2. Network tab for any failed resource loads"
echo "3. Extension popup for any error messages"
echo "4. Extension background page console (chrome://extensions/)"

# Generate test selectors
echo ""
echo "📝 Test Selectors to Check:"
echo "============================"
echo "[data-testid=\"action-menu-button\"] -> Should be non-unique (7 matches)"
echo "#user-1-container [data-testid=\"action-menu-button\"] -> Should be unique (1 match)"
echo "#user-2-container [data-testid=\"action-menu-button\"] -> Should be unique (1 match)"
echo "#users-table tr:nth-child(1) [data-testid=\"action-menu-button\"] -> Should be unique (1 match)"
echo "[data-testid=\"save-button\"] -> Should be unique (1 match)"
echo "#unique-save-btn -> Should be unique (1 match)"
echo ""

echo "✅ Test preparation complete!"
echo "Please follow the manual testing steps above."
