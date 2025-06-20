#!/bin/bash

echo "🔄 Testing Highlighting Fix"
echo "==========================="

echo ""
echo "Test Steps:"
echo "==========="
echo "1. 🌐 Chrome should be opening with the debug page"
echo "2. 🔧 Open Chrome DevTools (F12) and go to Console tab"
echo "3. 🎯 Use the extension popup to scan the page elements"
echo "4. 🧪 Test the contextual selector: #user-1-container [data-testid=\"action-menu-button\"]"
echo "5. 🎯 Click the Test button next to this selector in the popup"
echo "6. 💡 Manual test: Enter the selector in the 'Manual Highlight' field and click Highlight"
echo ""

echo "Expected Results:"
echo "=================="
echo "✅ Console should show detailed debugging messages"
echo "✅ The first 'Action Menu 1' button should be highlighted with red border"
echo "✅ Console should show: '🎯 HIGHLIGHT REQUEST RECEIVED'"
echo "✅ Console should show: '✅ Successfully highlighted 1 elements'"
echo "✅ The button should have visible red border and yellow background"
echo ""

echo "Debugging Commands to run in Console:"
echo "====================================="
echo ""
echo "// Test 1: Check if content script is loaded"
echo "console.log('Content script loaded:', typeof window.universalLocatorInjected !== 'undefined');"
echo ""
echo "// Test 2: Check selector manually"
echo "document.querySelectorAll('#user-1-container [data-testid=\"action-menu-button\"]').length"
echo ""
echo "// Test 3: Run our debug script"
echo "// Copy and paste the content of debug-script.js"
echo ""

echo "🎯 Focus: The button in 'User 1 Container' should highlight, not the others"
echo "🔍 If highlighting still doesn't work, check console for error messages"
