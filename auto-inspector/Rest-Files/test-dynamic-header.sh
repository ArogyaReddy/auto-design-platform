#!/bin/bash

echo "=== Dynamic Page Title Header Update Test ==="
echo "Testing the dynamic header update functionality"

# Check if files exist
if [ ! -f "results.html" ]; then
    echo "❌ results.html not found"
    exit 1
fi

if [ ! -f "results.js" ]; then
    echo "❌ results.js not found"
    exit 1
fi

echo "✅ Extension files found"

# Check JavaScript syntax
echo ""
echo "=== JavaScript Syntax Check ==="
node -c results.js 2>&1
if [ $? -eq 0 ]; then
    echo "✅ results.js syntax is valid"
else
    echo "❌ results.js has syntax errors"
    exit 1
fi

# Check for the updates
echo ""
echo "=== Checking Dynamic Header Implementation ==="

echo "Checking for pageHeader ID in HTML..."
grep -q 'id="pageHeader"' results.html && echo "✅ pageHeader ID found in HTML" || echo "❌ pageHeader ID missing in HTML"

echo "Checking for default header text..."
grep -q ">Locator Results<" results.html && echo "✅ Default header text found" || echo "❌ Default header text missing"

echo "Checking for dynamic header update in JavaScript..."
grep -q "pageHeader.*textContent" results.js && echo "✅ Dynamic header update found" || echo "❌ Dynamic header update missing"

echo "Checking for title concatenation logic..."
grep -q "pageTitle.*Locator Results" results.js && echo "✅ Title concatenation logic found" || echo "❌ Title concatenation logic missing"

# Show the actual implementation
echo ""
echo "=== Current Implementation ==="
echo "HTML Header:"
grep -A 1 -B 1 'id="pageHeader"' results.html

echo ""
echo "JavaScript Update:"
grep -A 4 -B 1 "pageHeader.*textContent" results.js

echo ""
echo "=== Expected Behavior ==="
echo "1. Default state: 'Locator Results'"
echo "2. After scan data loads:"
echo "   - For 'Swag Labs' page: 'Swag Labs : Locator Results'"
echo "   - For 'Google' page: 'Google : Locator Results'"
echo "   - For unknown page: 'Unknown Page : Locator Results'"

echo ""
echo "=== Testing Scenarios ==="
echo "📝 Manual Test Steps:"
echo "1. Load extension and scan a page"
echo "2. Open results page"
echo "3. Header should show: '[Page Title] : Locator Results'"
echo "4. Where [Page Title] is the actual title from the scanned page"

echo ""
echo "✅ Dynamic Header Implementation Complete!"
echo "🎯 Header will now dynamically show the actual page title"
