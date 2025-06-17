#!/bin/bash

echo "=== Testing View All Debug ==="
echo "This test will check the view all functionality in detail"

# Check if extension files exist
if [ ! -f "results.js" ]; then
    echo "❌ results.js not found"
    exit 1
fi

if [ ! -f "results.html" ]; then
    echo "❌ results.html not found"
    exit 1
fi

echo "✅ Files found"

# Check for view all button in results.js
echo ""
echo "=== Checking View All Button Implementation ==="
grep -n "viewAllBtn" results.js
grep -n "viewAllMode" results.js

echo ""
echo "=== Checking Event Listeners ==="
grep -A 10 -B 2 "viewAllBtn" results.js

echo ""
echo "=== Checking displayElements function ==="
grep -A 20 "if (viewAllMode)" results.js

echo ""
echo "=== Checking createPagination function ==="
grep -A 10 "function createPagination" results.js

echo "✅ Debug check complete"
