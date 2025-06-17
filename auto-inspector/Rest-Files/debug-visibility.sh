#!/bin/bash

# Enhanced debugging script for visibility filtering validation
echo "🔧 Enhanced Visibility Debugging Script"
echo "======================================="
echo

echo "📋 This script will help you debug the visibility filtering step by step."
echo

# Check if the extension files are present
echo "1️⃣  Checking extension files..."
FILES=("content.js" "popup.js" "results.js" "manifest.json")
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
    fi
done
echo

# Check the content.js for key functions
echo "2️⃣  Checking visibility functions in content.js..."
if grep -q "isElementVisible" content.js; then
    echo "  ✅ isElementVisible function found"
    echo "  📝 Function checks for:"
    grep -A 10 "function isElementVisible" content.js | grep -E "(display|visibility|opacity|width|height|offscreen)" | sed 's/^/    - /'
else
    echo "  ❌ isElementVisible function not found"
fi
echo

if grep -q "getCleanText" content.js; then
    echo "  ✅ getCleanText function found"
    echo "  📝 Function filters out:"
    grep -A 15 "function getCleanText" content.js | grep -E "(function|console|var|const|let)" | sed 's/^/    - /'
else
    echo "  ❌ getCleanText function not found"
fi
echo

# Show what elements should be filtered
echo "3️⃣  Visibility filtering rules in effect:"
echo "  🚫 Elements with display: none"
echo "  🚫 Elements with visibility: hidden" 
echo "  🚫 Elements with opacity: 0"
echo "  🚫 Elements with zero width or height"
echo "  🚫 Elements positioned far offscreen"
echo "  🚫 Script and style elements"
echo "  🚫 Text containing JavaScript code patterns"
echo

# Show debugging console commands
echo "4️⃣  Console debugging commands:"
echo "  After running a scan, open browser DevTools and run these commands:"
echo
echo "  // Check what elements are being processed"
echo "  document.querySelectorAll('*').length"
echo
echo "  // Check visibility filtering"
echo "  Array.from(document.querySelectorAll('*')).filter(el => {"
echo "    if (['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'TITLE'].includes(el.tagName)) return false;"
echo "    const style = getComputedStyle(el);"
echo "    return style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) !== 0;"
echo "  }).length"
echo
echo "  // Check for hidden elements that might slip through"
echo "  Array.from(document.querySelectorAll('.hidden-display, .hidden-visibility, .hidden-opacity, .zero-size, .offscreen')).forEach(el => {"
echo "    console.log('Hidden element:', el, 'Computed style:', getComputedStyle(el));"
echo "  });"
echo

# Show what to look for in results
echo "5️⃣  What to verify in scan results:"
echo "  ✅ Results count should be reasonable (20-40 elements for test page)"
echo "  ✅ No elements with text containing 'hidden'"
echo "  ✅ No JavaScript code snippets in text column"
echo "  ✅ All visible form elements should be present"
echo "  ✅ All visible buttons and links should be present"
echo "  ✅ Locator columns should be populated with IDs, classes, data attributes"
echo

echo "6️⃣  Expected visible elements on test page:"
EXPECTED_ELEMENTS=(
    "#main-title"
    "#section-visible" 
    "#visible-text"
    "#primary-btn"
    "#secondary-btn"
    "#username"
    "#email"
    "#country"
    "#comments"
    ".feature-item"
    ".footer-text"
)

for element in "${EXPECTED_ELEMENTS[@]}"; do
    echo "  ✅ $element"
done
echo

echo "7️⃣  Elements that should be EXCLUDED:"
EXCLUDED_ELEMENTS=(
    "Text: 'This text is hidden with display: none'"
    "Text: 'This text is hidden with visibility: hidden'"
    "Text: 'This text is hidden with opacity: 0'"
    "Text: 'This text has zero size'"
    "Text: 'This text is positioned offscreen'"
    "Any JavaScript code like 'console.log', 'function()', 'var '"
)

for element in "${EXCLUDED_ELEMENTS[@]}"; do
    echo "  🚫 $element"
done
echo

echo "8️⃣  Testing procedure:"
echo "  1. Load the extension in Chrome"
echo "  2. Open the visibility-test.html page"
echo "  3. Click the extension icon"
echo "  4. Run a scan"
echo "  5. Verify results match expectations above"
echo "  6. Check browser console for any error messages"
echo

echo "🔍 Ready to test? (Press Enter to continue)"
read

echo "✅ Testing procedure outlined. Happy debugging!"
