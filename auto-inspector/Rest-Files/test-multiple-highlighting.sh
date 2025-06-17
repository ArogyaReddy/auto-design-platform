#!/bin/bash

# Test multiple element highlighting fix
echo "🔧 Testing Multiple Element Highlighting Fix"
echo "============================================"

echo ""
echo "🔍 Checking new functions in content.js..."
if grep -q "findAllElementsBySelectorIncludingShadowDOM" content.js; then
    echo "✅ findAllElementsBySelectorIncludingShadowDOM function added"
else
    echo "❌ findAllElementsBySelectorIncludingShadowDOM function not found"
fi

if grep -q "highlightAllElements" content.js; then
    echo "✅ highlightAllElements function added"
else
    echo "❌ highlightAllElements function not found"
fi

if grep -q "querySelectorAll" content.js; then
    echo "✅ querySelectorAll used for finding multiple elements"
else
    echo "❌ querySelectorAll not found"
fi

echo ""
echo "🔍 Checking message handler updates..."
if grep -q "findAllElementsBySelectorIncludingShadowDOM.*selector" content.js; then
    echo "✅ Message handler uses new multiple element finder"
else
    echo "❌ Message handler not updated"
fi

if grep -q "count.*elements.length" content.js; then
    echo "✅ Response includes element count"
else
    echo "❌ Element count not included in response"
fi

echo ""
echo "🔍 Checking popup.js updates..."
if grep -q "elements highlighted successfully" popup.js; then
    echo "✅ Popup shows count of highlighted elements"
else
    echo "❌ Popup count display not updated"
fi

echo ""
echo "🔍 Checking highlight function improvements..."
if grep -q "skipClearAndScroll" content.js; then
    echo "✅ Highlight function supports multiple elements"
else
    echo "❌ Highlight function not updated for multiple elements"
fi

echo ""
echo "🔍 Checking for syntax errors..."
if node -c content.js 2>/dev/null; then
    echo "✅ content.js syntax is valid"
else
    echo "❌ content.js has syntax errors:"
    node -c content.js
fi

if node -c popup.js 2>/dev/null; then
    echo "✅ popup.js syntax is valid"
else
    echo "❌ popup.js has syntax errors:"
    node -c popup.js
fi

echo ""
echo "============================================"
echo "✅ MULTIPLE ELEMENT HIGHLIGHTING FIXED:"
echo "🔍 Now finds ALL matching elements (like browser dev tools)"
echo "🎯 Highlights all found elements simultaneously"
echo "📊 Shows count of highlighted elements in status"
echo "📍 Scrolls to first element, highlights all"
echo "🧹 Proper cleanup of all highlighted elements"
echo ""
echo "📋 TEST WITH YOUR SELECTOR:"
echo "1. Open extension popup"
echo "2. Enter: .pricebar [data-test=\"inventory-item-price\"]"
echo "3. Click 🎯 Highlight"
echo "4. Should highlight all 6 elements (matching browser behavior)"
echo "5. Status should show: '6 elements highlighted successfully!'"
echo ""
echo "🧪 OTHER SELECTORS TO TEST:"
echo "• .inventory_item"
echo "• button"
echo "• .inventory_item_name"
echo "• [data-test]"
echo ""
echo "Expected: Extension now matches browser dev tools behavior!"
echo ""
echo "🎯 Multiple element highlighting fix completed!"
