#!/bin/bash

# Test script to validate the results fix
echo "🧪 Universal Element Locator - Results Fix Validation"
echo "=================================================="

# Check if files exist
echo "📁 Checking core files..."
files=("content.js" "popup.js" "results.js" "manifest.json")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - MISSING"
        exit 1
    fi
done

echo ""
echo "🔍 Checking data structure compatibility..."

# Check content.js for proper response structure
if grep -q "confidence.*position.*locators" content.js; then
    echo "✅ content.js - Enhanced element data structure"
else
    echo "❌ content.js - Missing enhanced data structure"
fi

# Check popup.js for proper data saving
if grep -q "url.*title.*timestamp.*elements" popup.js; then
    echo "✅ popup.js - Proper scan data format"
else
    echo "❌ popup.js - Missing proper scan data format"
fi

# Check for proper file references
if grep -q "content_simple.js" popup.js; then
    echo "❌ popup.js - Still references wrong content script file"
else
    echo "✅ popup.js - Correct content script reference"
fi

echo ""
echo "📊 Validating element data structure..."

# Extract sample from content.js to show the structure
echo "Sample element structure from content.js:"
grep -A 10 -B 2 "confidence.*Math.random" content.js | head -15

echo ""
echo "🎯 Extension Status: READY FOR TESTING"
echo "======================================" 
echo ""
echo "To test the fix:"
echo "1. Load the extension in Chrome (Developer mode)"
echo "2. Open: file://$(pwd)/test-results-fix.html"
echo "3. Click extension icon → Scan Page Elements"
echo "4. Results page should show actual scanned elements with details"
echo ""
echo "Expected results:"
echo "• Popup shows 'Connected' status"
echo "• Scan completes successfully"
echo "• Results page opens automatically" 
echo "• Elements table populated with actual page elements"
echo "• Statistics show non-zero counts"
echo "• Each element shows confidence, locators, and position data"
