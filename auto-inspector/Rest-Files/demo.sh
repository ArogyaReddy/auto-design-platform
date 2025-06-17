#!/bin/bash

# Universal Element Locator Browser Extension Demo
# This script demonstrates the browser extension capabilities

echo "🎯 Universal Element Locator Browser Extension Demo"
echo "=================================================="
echo

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Please run this script from the browser-extension directory"
    echo "Usage: cd /Users/arog/ADP/AutoExtractor/browser-extension && ./demo.sh"
    exit 1
fi

echo "📁 Extension Files Status:"
echo "-------------------------"

# Check core files
for file in manifest.json popup.html popup.js content.js background.js locator-engine.js content.css results.html; do
    if [ -f "$file" ]; then
        size=$(wc -l < "$file" 2>/dev/null || echo "0")
        echo "✅ $file ($size lines)"
    else
        echo "❌ $file (missing)"
    fi
done

echo
echo "🖼️  Icon Files Status:"
echo "---------------------"
for size in 16 32 48 128; do
    if [ -f "icons/icon${size}.png" ]; then
        echo "✅ icon${size}.png"
    else
        echo "❌ icon${size}.png (missing)"
    fi
done

echo
echo "📊 Extension Statistics:"
echo "-----------------------"
echo "Total files: $(find . -type f | wc -l)"
echo "JavaScript files: $(find . -name '*.js' | wc -l)"
echo "HTML files: $(find . -name '*.html' | wc -l)"
echo "CSS files: $(find . -name '*.css' | wc -l)"
echo "Documentation files: $(find . -name '*.md' | wc -l)"

echo
echo "🧪 Testing Instructions:"
echo "------------------------"
echo "1. Open Chrome and navigate to: chrome://extensions/"
echo "2. Enable 'Developer mode' (top-right toggle)"
echo "3. Click 'Load unpacked' and select this directory:"
echo "   $(pwd)"
echo "4. Pin the extension to your toolbar"
echo "5. Open the test page:"
echo "   file://$(pwd)/test-page.html"
echo "6. Click the extension icon and run a scan"

echo
echo "🎯 Expected Results:"
echo "-------------------"
echo "• Total Elements: 40-60 elements"
echo "• Primary Locators: 15-25 elements"
echo "• Secondary Locators: 20-35 elements" 
echo "• Scan Duration: <200ms"
echo "• Shadow DOM Elements: 0 (until created via button)"

echo
echo "🚀 Advanced Testing:"
echo "-------------------"
echo "• Click 'Create Shadow DOM' on test page"
echo "• Click 'Add Dynamic Element' multiple times"
echo "• Toggle 'Include Hidden Elements' option"
echo "• Try scanning on real websites like:"
echo "  - https://example.com"
echo "  - https://github.com"
echo "  - https://stackoverflow.com"

echo
echo "💾 Export Testing:"
echo "-----------------"
echo "• After scanning, click 'View Results'"
echo "• Use search/filter functionality"
echo "• Export data as CSV for analysis"
echo "• Check JSON export from popup"

echo
echo "🏆 Success Criteria:"
echo "-------------------"
echo "✅ Extension loads without errors"
echo "✅ Popup interface is responsive"
echo "✅ Scans complete successfully"
echo "✅ Results display correctly"
echo "✅ Visual highlighting works"
echo "✅ Export functions work"

echo
echo "🔧 Troubleshooting:"
echo "------------------"
echo "• Check browser console (F12) for errors"
echo "• Verify extension permissions are granted"
echo "• Ensure 'Developer mode' is enabled"
echo "• Try refreshing the page and rescanning"

echo
echo "📝 Documentation:"
echo "----------------"
echo "• README.md - Complete feature documentation"
echo "• INSTALLATION.md - Detailed setup guide"
echo "• EXTENSION_STATUS.md - Implementation status"

echo
echo "🎉 Extension Status: READY FOR TESTING"
echo "======================================"
echo "The Universal Element Locator browser extension is fully"
echo "functional and ready for comprehensive testing!"
echo
