#!/bin/bash

echo "🔍 Element AI Extractor - Final Scope Fix Verification"
echo "====================================================="
echo ""

# Check we're in the right directory
if [ ! -f "popup.js" ] || [ ! -f "contentScript.js" ] || [ ! -f "manifest.json" ]; then
    echo "❌ Error: Run this script from the bots/elementsExtractor directory"
    exit 1
fi

echo "✅ Found extension files in current directory"
echo ""

# Test 1: JavaScript Syntax Validation
echo "📋 Test 1: JavaScript Syntax Validation"
echo "----------------------------------------"

for file in popup.js contentScript.js background.js; do
    if node -c "$file" 2>/dev/null; then
        echo "✅ $file: Syntax valid"
    else
        echo "❌ $file: Syntax error found!"
        node -c "$file"
        exit 1
    fi
done
echo ""

# Test 2: Critical Function Location Check
echo "📋 Test 2: Function Scope Verification"
echo "--------------------------------------"

# Check if functions are in global scope (not inside DOMContentLoaded)
if grep -q "^function startInspectionDirectly" popup.js; then
    echo "✅ startInspectionDirectly: Found in global scope"
else
    echo "❌ startInspectionDirectly: NOT found in global scope"
    exit 1
fi

if grep -q "^function resetInspectionState" popup.js; then
    echo "✅ resetInspectionState: Found in global scope"
else
    echo "❌ resetInspectionState: NOT found in global scope"
    exit 1
fi

if grep -q "^async function bulletproofStartInspection" popup.js; then
    echo "✅ bulletproofStartInspection: Found in global scope"
else
    echo "❌ bulletproofStartInspection: NOT found in global scope"
    exit 1
fi
echo ""

# Test 3: Function Call Verification
echo "📋 Test 3: Function Call Chain Verification"
echo "-------------------------------------------"

# Check that bulletproofStartInspection is called from the inspect button handler
if grep -q "bulletproofStartInspection(tabInfo.tabId)" popup.js; then
    echo "✅ bulletproofStartInspection: Called correctly from button handler"
else
    echo "❌ bulletproofStartInspection: NOT called from button handler"
    exit 1
fi

# Check that startInspectionDirectly is called from bulletproofStartInspection
if grep -A10 "async function bulletproofStartInspection" popup.js | grep -q "startInspectionDirectly"; then
    echo "✅ startInspectionDirectly: Called correctly from bulletproofStartInspection"
else
    echo "❌ startInspectionDirectly: NOT called from bulletproofStartInspection"
    exit 1
fi

# Check that resetInspectionState is called in error scenarios
if grep -A20 "async function bulletproofStartInspection" popup.js | grep -q "resetInspectionState"; then
    echo "✅ resetInspectionState: Called correctly in error handling"
else
    echo "❌ resetInspectionState: NOT called in error handling"
    exit 1
fi
echo ""

# Test 4: DOM Element References
echo "📋 Test 4: DOM Element References"
echo "---------------------------------"

if grep -q "getElementById('inspector-status')" popup.js; then
    echo "✅ inspector-status element: Referenced correctly"
else
    echo "❌ inspector-status element: NOT referenced"
    exit 1
fi

if grep -q "getElementById('inspectElement')" popup.js; then
    echo "✅ inspectElement button: Referenced correctly"
else
    echo "❌ inspectElement button: NOT referenced"
    exit 1
fi
echo ""

# Test 5: Extension Manifest Check
echo "📋 Test 5: Extension Manifest Validation"
echo "----------------------------------------"

if [ -f "manifest.json" ]; then
    if python3 -m json.tool manifest.json > /dev/null 2>&1; then
        echo "✅ manifest.json: Valid JSON format"
    else
        echo "❌ manifest.json: Invalid JSON format"
        exit 1
    fi
else
    echo "❌ manifest.json: File not found"
    exit 1
fi

# Check for required permissions
if grep -q "scripting" manifest.json && grep -q "storage" manifest.json && grep -q "activeTab" manifest.json; then
    echo "✅ manifest.json: Required permissions present"
else
    echo "❌ manifest.json: Missing required permissions"
    exit 1
fi
echo ""

# Final Summary
echo "🎉 FINAL VERIFICATION RESULT"
echo "============================"
echo "✅ All scope fix verifications PASSED!"
echo ""
echo "📊 Summary:"
echo "  • JavaScript syntax: ✅ Valid"
echo "  • Function scope: ✅ Correctly moved to global"
echo "  • Function calls: ✅ Properly connected"
echo "  • DOM references: ✅ Correctly implemented"
echo "  • Manifest: ✅ Valid and complete"
echo ""
echo "🚀 The extension is ready for testing!"
echo ""
echo "To test the extension:"
echo "1. Load the extension in Chrome (chrome://extensions/)"
echo "2. Navigate to: file:///$(pwd)/../../apps/test-bulletproof-inspection.html"
echo "3. Click the extension icon and then 'Inspect Element'"
echo "4. Click on page elements to verify inspection works"
echo "5. Check console for any ReferenceError messages (should be none)"
echo ""
echo "If you see any ReferenceError related to function accessibility,"
echo "please check that the functions are actually being called in the"
echo "correct context and that the scope fixes are properly applied."
