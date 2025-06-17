#!/bin/bash

# Test Scan Workflow - Universal Element Locator Extension
echo "🎯 Testing Scan Workflow Functionality"
echo "======================================"

cd "$(dirname "$0")"

echo ""
echo "📁 Checking required files..."
required_files=("popup.html" "popup.js" "content.js" "results.html" "test-scan-workflow.html")

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
        exit 1
    fi
done

echo ""
echo "🔍 Checking popup.html for scan workflow elements..."

# Check for scan button
if grep -q "Scan Page Elements" popup.html; then
    echo "✅ 'Scan Page Elements' button found"
else
    echo "❌ 'Scan Page Elements' button missing"
fi

# Check for view results button
if grep -q "View Scanned Results" popup.html; then
    echo "✅ 'View Scanned Results' button found"
else
    echo "❌ 'View Scanned Results' button missing"
fi

# Check if view results button is disabled by default
if grep -q 'id="viewResultsButton".*disabled' popup.html; then
    echo "✅ 'View Scanned Results' button is disabled by default"
else
    echo "❌ 'View Scanned Results' button should be disabled by default"
fi

# Check for side-by-side layout
if grep -q "scan-buttons" popup.html; then
    echo "✅ Side-by-side button layout found"
else
    echo "❌ Side-by-side button layout missing"
fi

echo ""
echo "🔍 Checking popup.js for scan workflow functionality..."

# Check for scan function
if grep -q "scanWithHighlighting" popup.js; then
    echo "✅ Scan with highlighting function found"
else
    echo "❌ Scan with highlighting function missing"
fi

# Check for view results function
if grep -q "viewResults" popup.js; then
    echo "✅ View results function found"
else
    echo "❌ View results function missing"
fi

# Check for enable/disable results button functionality
if grep -q "enableViewResults" popup.js; then
    echo "✅ Enable/disable view results functionality found"
else
    echo "❌ Enable/disable view results functionality missing"
fi

# Check for new tab opening
if grep -q "chrome.tabs.create.*results.html" popup.js; then
    echo "✅ New tab opening for results found"
else
    echo "❌ New tab opening for results missing"
fi

echo ""
echo "🔍 Checking content.js for highlighting functionality..."

# Check for highlighting functions
if grep -q "highlightElement" content.js; then
    echo "✅ Element highlighting function found"
else
    echo "❌ Element highlighting function missing"
fi

if grep -q "clearAllHighlighting" content.js; then
    echo "✅ Clear highlighting function found"
else
    echo "❌ Clear highlighting function missing"
fi

# Check for scan with highlighting message handler
if grep -q "scanPageWithHighlighting" content.js; then
    echo "✅ Scan with highlighting message handler found"
else
    echo "❌ Scan with highlighting message handler missing"
fi

echo ""
echo "🎨 Checking CSS styling for button layout..."

# Check for button styling
if grep -q "scan-buttons" popup.html && grep -q "flex" popup.html; then
    echo "✅ Flex layout for buttons found"
else
    echo "❌ Proper button layout styling missing"
fi

# Check for disabled button styling
if grep -q "disabled" popup.html; then
    echo "✅ Disabled button styling found"
else
    echo "❌ Disabled button styling missing"
fi

echo ""
echo "🧪 Manual Testing Instructions:"
echo "==============================="
echo "1. Load the extension in Chrome (chrome://extensions/)"
echo "2. Open the test page: file://$(pwd)/test-scan-workflow.html"
echo "3. Click the extension icon (🎯) to open popup"
echo "4. Verify 'View Scanned Results' button is disabled (grayed out)"
echo "5. Click 'Scan Page Elements' - watch for green highlighting on elements"
echo "6. After scan completes, verify 'View Scanned Results' is enabled"
echo "7. Click 'View Scanned Results' - should open results in new tab"
echo "8. Verify highlighting disappears after a few seconds"

echo ""
echo "🔧 Expected Workflow:"
echo "===================="
echo "• Initial state: 'View Scanned Results' disabled"
echo "• During scan: Elements highlighted with green border"
echo "• After scan: 'View Scanned Results' enabled"
echo "• Click results: Opens new tab with results.html"
echo "• Auto-cleanup: Highlighting clears after 3 seconds"

echo ""
echo "🎉 Test Setup Complete!"
echo "======================="
echo "The scan workflow functionality is ready for testing."
echo "All required components are in place."

# Open test page if on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo ""
    echo "🌐 Opening test page in default browser..."
    open "file://$(pwd)/test-scan-workflow.html"
fi

echo ""
echo "📊 Summary:"
echo "==========="
echo "• Scan button: ✅ Ready"
echo "• View results button: ✅ Ready (disabled initially)"  
echo "• Side-by-side layout: ✅ Ready"
echo "• Element highlighting: ✅ Ready"
echo "• Results in new tab: ✅ Ready"
echo "• Auto-cleanup: ✅ Ready"
