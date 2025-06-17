#!/bin/bash

# Extension Installation Verification Script
echo "🎯 Universal Element Locator Extension - Installation Verification"
echo "=================================================================="
echo

# Check if we're in the browser extension directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: Please run this script from the browser-extension directory"
    echo "Expected location: /Users/arog/ADP/AutoExtractor/browser-extension"
    exit 1
fi

echo "📁 Checking Extension Files..."
echo "------------------------------"

# Essential files check
declare -a required_files=(
    "manifest.json"
    "popup.html" 
    "popup.js"
    "content.js"
    "background.js"
    "locator-engine.js"
    "content.css"
    "results.html"
)

all_files_present=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        all_files_present=false
    fi
done

# Check icons
echo
echo "🖼️  Checking Icon Files..."
echo "-------------------------"
declare -a icon_sizes=("16" "32" "48" "128")
all_icons_present=true
for size in "${icon_sizes[@]}"; do
    if [ -f "icons/icon${size}.png" ]; then
        echo "✅ icon${size}.png"
    else
        echo "❌ icon${size}.png (missing)"
        all_icons_present=false
    fi
done

echo
echo "🔍 Validating manifest.json..."
echo "-----------------------------"
if command -v node >/dev/null 2>&1; then
    node -e "
    try {
        const manifest = JSON.parse(require('fs').readFileSync('manifest.json', 'utf8'));
        console.log('✅ manifest.json is valid JSON');
        console.log('✅ Extension name:', manifest.name);
        console.log('✅ Version:', manifest.version);
        console.log('✅ Manifest version:', manifest.manifest_version);
        console.log('✅ Permissions:', manifest.permissions.join(', '));
        
        if (manifest.content_scripts && manifest.content_scripts.length > 0) {
            console.log('✅ Content scripts configured');
        } else {
            console.log('❌ No content scripts configured');
        }
        
        if (manifest.background) {
            console.log('✅ Background script configured');
        } else {
            console.log('❌ No background script configured');
        }
    } catch (error) {
        console.log('❌ manifest.json validation failed:', error.message);
    }
    "
else
    echo "⚠️  Node.js not available, skipping JSON validation"
fi

echo
echo "📊 Extension Statistics:"
echo "-----------------------"
total_files=$(find . -type f | wc -l)
js_files=$(find . -name "*.js" | wc -l)
html_files=$(find . -name "*.html" | wc -l)
css_files=$(find . -name "*.css" | wc -l)

echo "Total files: $total_files"
echo "JavaScript files: $js_files"
echo "HTML files: $html_files"
echo "CSS files: $css_files"

echo
echo "🔧 Installation Instructions:"
echo "----------------------------"
echo "1. Open Google Chrome"
echo "2. Navigate to: chrome://extensions/"
echo "3. Enable 'Developer mode' (toggle in top-right)"
echo "4. Click 'Load unpacked'"
echo "5. Select this directory: $(pwd)"
echo "6. Pin the extension to your toolbar"

echo
echo "🧪 Testing Instructions:"
echo "-----------------------"
echo "1. Open this test page: file://$(pwd)/test-page.html"
echo "2. Click the extension icon (🎯) in your toolbar"
echo "3. Click 'Scan Page Elements'"
echo "4. You should see scan results with statistics"
echo "5. Try the 'View Results' button for detailed analysis"

echo
echo "🐛 Troubleshooting:"
echo "------------------"
echo "If you see 'Could not establish connection' error:"
echo "• Refresh the webpage and try scanning again"
echo "• Check that you're not on a chrome:// page"
echo "• Open browser console (F12) for detailed error messages"
echo "• Ensure extension permissions are granted"

echo
if [ "$all_files_present" = true ] && [ "$all_icons_present" = true ]; then
    echo "🎉 Status: READY FOR INSTALLATION"
    echo "=================================="
    echo "All required files are present. The extension is ready to be loaded in Chrome!"
else
    echo "⚠️  Status: INCOMPLETE"
    echo "===================="
    echo "Some required files are missing. Please ensure all files are present before installation."
fi

echo
echo "📝 Need Help?"
echo "• Check README.md for detailed documentation"
echo "• Review INSTALLATION.md for setup guide"
echo "• Use debug.js script in browser console for troubleshooting"
