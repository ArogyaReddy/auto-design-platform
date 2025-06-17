#!/bin/bash

echo "🧪 COMPREHENSIVE HIGHLIGHTING DEBUG TEST"
echo "========================================"

echo ""
echo "🔄 Starting Chrome with enhanced debugging..."

# Force close any existing Chrome instances to ensure clean state
echo "🔄 Closing existing Chrome instances..."
killall "Google Chrome" 2>/dev/null || true
sleep 2

echo "🚀 Opening Chrome with extension and test page..."

# Open Chrome with the extension
open -a "Google Chrome" --args --load-extension="/Users/arog/ADP/AutoExtractor/browser-extension" "/Users/arog/ADP/AutoExtractor/browser-extension/debug-unique-selectors.html"

echo ""
echo "🔍 DEBUGGING CHECKLIST:"
echo "======================="
echo ""
echo "1. 📋 Open DevTools (F12) → Console tab"
echo "2. 🔍 Look for these initialization messages:"
echo "   ✅ '🚀 CONTENT SCRIPT: Universal Element Locator initializing...'"
echo "   ✅ '🚀 CONTENT SCRIPT: Message listener added'"
echo "   ✅ '🚀 CONTENT SCRIPT: initialization complete!'"
echo ""
echo "3. 🧪 Test the contextual selector manually:"
echo "   📝 Run: document.querySelectorAll('#user-1-container [data-testid=\"action-menu-button\"]').length"
echo "   📝 Expected: 1"
echo ""
echo "4. 🎯 Open the extension popup and:"
echo "   📝 Click 'Scan Page Elements'"
echo "   📝 Look for the contextual selector in results"
echo "   📝 Click the '🎯 Test' button next to it"
echo ""
echo "5. 💡 Test Manual Highlight:"
echo "   📝 Enter: #user-1-container [data-testid=\"action-menu-button\"]"
echo "   📝 Click 'Highlight Element'"
echo ""
echo "🎯 EXPECTED HIGHLIGHTING BEHAVIOR:"
echo "=================================="
echo "✅ Console shows: '📥 CONTENT SCRIPT: Message received: highlightElement'"
echo "✅ Console shows: '🎯 HIGHLIGHT REQUEST RECEIVED - Selector: #user-1-container [data-testid=\"action-menu-button\"]'"
echo "✅ Console shows: '🔍 Found 1 elements for selector'"
echo "✅ Console shows: '✅ Successfully highlighted 1 elements'"
echo "✅ The 'Action Menu 1' button gets RED BORDER and YELLOW background"
echo "✅ Only the first button highlights, not the second one"
echo ""
echo "🔍 IF HIGHLIGHTING FAILS:"
echo "========================"
echo "❌ Check console for error messages"
echo "❌ Look for content script injection failures"
echo "❌ Verify the selector finds elements manually"
echo "❌ Check if popup shows error responses"
echo ""
echo "🎯 This test should definitively show if highlighting is working!"

# Wait a bit for Chrome to start
sleep 3

echo ""
echo "📋 Chrome should now be open - follow the checklist above!"
echo "🔍 Check the console output carefully for debugging messages."
