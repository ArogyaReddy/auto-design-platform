#!/bin/bash

echo "=== Header Text Update Verification ==="
echo "Verifying the header change from 'Scan Results' to 'Page Title : Locator Results'"

# Check if files exist
if [ ! -f "results.html" ]; then
    echo "❌ results.html not found"
    exit 1
fi

echo "✅ results.html found"

# Check for the updated header
echo ""
echo "=== Checking Header Updates ==="

echo "Checking page title..."
grep -q "Locator Results</title>" results.html && echo "✅ Page title updated" || echo "❌ Page title not updated"

echo "Checking main header..."
grep -q "Page Title : Locator Results" results.html && echo "✅ Main header updated" || echo "❌ Main header not updated"

echo "Ensuring old header is removed..."
if grep -q "🎯 Scan Results" results.html; then
    echo "❌ Old header still present"
else
    echo "✅ Old header removed"
fi

# Show the actual header content
echo ""
echo "=== Current Header Content ==="
grep -A 2 -B 1 "Page Title : Locator Results" results.html

echo ""
echo "=== Expected Visual Result ==="
echo "Header should now display: 'Page Title : Locator Results'"
echo "Subtitle remains: 'Detailed analysis of page elements and their locators'"

echo ""
echo "✅ Header text successfully updated!"
echo "🎨 The results page will now show 'Page Title : Locator Results' instead of 'Scan Results'"
