#!/bin/bash

echo "🔍 Testing Contextual Selector Highlighting Issue"
echo "================================================="

# Check if extension is loaded
echo "1. Opening Chrome with extension..."

# Open the debug page with the extension
open -a "Google Chrome" --args --load-extension="/Users/arog/ADP/AutoExtractor/browser-extension" "/Users/arog/ADP/AutoExtractor/browser-extension/debug-unique-selectors.html"

echo ""
echo "Manual Test Steps:"
echo "=================="
echo "1. Open Chrome DevTools (F12)"
echo "2. Go to Console tab"
echo "3. Test the contextual selector manually:"
echo ""
echo "   // Test 1: Basic querySelector"
echo "   document.querySelectorAll('#user-1-container [data-testid=\"action-menu-button\"]')"
echo ""
echo "4. In the extension popup, click the 'Test' button for:"
echo "   #user-1-container [data-testid=\"action-menu-button\"]"
echo ""
echo "5. Check console for debugging output"
echo ""
echo "Expected Results:"
echo "=================="
echo "- querySelector should find 1 element"
echo "- Extension Test button should highlight the button"
echo "- Console should show detailed debugging messages"
echo ""
echo "🎯 Focus on the selector: #user-1-container [data-testid=\"action-menu-button\"]"
