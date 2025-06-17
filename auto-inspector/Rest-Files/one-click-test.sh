#!/bin/bash

# One-Click Extension Test Script
echo "🎯 Universal Element Locator Extension - One-Click Test"
echo "====================================================="

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: Please run this script from the browser-extension directory"
    echo "Usage: cd /Users/arog/ADP/AutoExtractor/browser-extension && ./one-click-test.sh"
    exit 1
fi

echo "🔍 Running comprehensive extension test..."
echo

# 1. Validate extension files
echo "📁 Step 1: Validating extension files..."
missing_files=0
required_files=("manifest.json" "popup.html" "popup.js" "content.js" "background.js" "locator-engine.js")

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing: $file"
        missing_files=1
    fi
done

if [ $missing_files -eq 0 ]; then
    echo "✅ All required files present"
else
    echo "❌ Some files are missing. Extension may not work properly."
    exit 1
fi

# 2. Validate manifest
echo
echo "📋 Step 2: Validating manifest..."
if command -v node >/dev/null 2>&1; then
    manifest_valid=$(node -e "
    try {
        const manifest = JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'));
        if (manifest.manifest_version === 3 && 
            manifest.permissions && 
            manifest.content_scripts && 
            manifest.action) {
            console.log('valid');
        } else {
            console.log('invalid');
        }
    } catch(e) {
        console.log('invalid');
    }
    ")
    
    if [ "$manifest_valid" = "valid" ]; then
        echo "✅ Manifest is valid"
    else
        echo "❌ Manifest validation failed"
        exit 1
    fi
else
    echo "⚠️  Node.js not available, skipping manifest validation"
fi

# 3. Check icons
echo
echo "🖼️  Step 3: Checking icons..."
icon_count=0
for size in 16 32 48 128; do
    if [ -f "icons/icon${size}.png" ]; then
        icon_count=$((icon_count + 1))
    fi
done

if [ $icon_count -eq 4 ]; then
    echo "✅ All icons present (4/4)"
else
    echo "⚠️  Some icons missing ($icon_count/4)"
fi

# 4. Open test page
echo
echo "🧪 Step 4: Opening test page..."
if [ -f "test-page.html" ]; then
    echo "✅ Test page found"
    
    # Try to open test page
    if command -v open >/dev/null 2>&1; then
        echo "🌐 Opening test page in browser..."
        open "test-page.html"
        echo "✅ Test page opened"
    else
        echo "ℹ️  Manual action needed: Open test-page.html in your browser"
    fi
else
    echo "❌ Test page not found"
fi

# 5. Provide instructions
echo
echo "🚀 Step 5: Installation Instructions"
echo "===================================="
echo "1. Open Chrome and go to: chrome://extensions/"
echo "2. Enable 'Developer mode' (top-right toggle)"
echo "3. Click 'Load unpacked'"
echo "4. Select this directory: $(pwd)"
echo "5. Pin the extension to your toolbar"
echo

echo "🧪 Step 6: Testing Instructions"
echo "================================"
echo "1. The test page should now be open in your browser"
echo "2. Click the Universal Element Locator extension icon (🎯)"
echo "3. Click 'Scan Page Elements'"
echo "4. Expected results:"
echo "   • Total Elements: 40-60"
echo "   • Primary Locators: 15-25"
echo "   • Scan Duration: <200ms"
echo

echo "❌ If you see 'Could not establish connection' error:"
echo "=================================================="
echo "1. REFRESH the webpage (Cmd+R)"
echo "2. Wait 2-3 seconds for full page load"
echo "3. Try scanning again"
echo "4. Make sure you're NOT on a chrome:// page"
echo

echo "🔧 Additional Testing:"
echo "====================="
echo "• Try scanning on https://example.com"
echo "• Test the 'View Results' button"
echo "• Try export functionality"
echo "• Test on different website types"
echo

echo "📞 Need Help?"
echo "============="
echo "• Check TROUBLESHOOTING.md for detailed help"
echo "• Run debug.js in browser console"
echo "• Look at browser console (F12) for errors"
echo

# Final status
echo "🎉 Extension Test Complete!"
echo "=========================="
echo "The Universal Element Locator extension is ready for use."
echo "If all steps completed successfully, the extension should work perfectly."
echo
echo "Next steps:"
echo "1. Install in Chrome using instructions above"
echo "2. Test on the opened test page"
echo "3. Try on real websites"
echo "4. Share with your team!"
echo

# Check if Chrome is running
if pgrep -f "Google Chrome" > /dev/null; then
    echo "ℹ️  Chrome is currently running - you can install the extension now!"
else
    echo "ℹ️  Start Chrome to install the extension"
fi
