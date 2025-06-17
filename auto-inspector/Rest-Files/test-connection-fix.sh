#!/bin/bash

# Connection Fix Test Script
echo "🔗 Universal Element Locator - Connection Fix Test"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}🎯 Testing the connection fix for individual element scanning...${NC}"
echo ""

# Verify the fix is in place
echo -e "${YELLOW}🔍 Verifying connection fix implementation:${NC}"

if grep -q "ensureContentScriptConnection" "$SCRIPT_DIR/popup.js"; then
    echo -e "${GREEN}  ✅ ensureContentScriptConnection function found${NC}"
else
    echo -e "${RED}  ❌ ensureContentScriptConnection function missing${NC}"
fi

if grep -q "maxRetries = 3" "$SCRIPT_DIR/popup.js"; then
    echo -e "${GREEN}  ✅ Retry logic implemented${NC}"
else
    echo -e "${RED}  ❌ Retry logic missing${NC}"
fi

if grep -q "Connecting to page..." "$SCRIPT_DIR/popup.js"; then
    echo -e "${GREEN}  ✅ User feedback for connection process${NC}"
else
    echo -e "${RED}  ❌ Connection feedback missing${NC}"
fi

# Check content script improvements
echo -e "${YELLOW}🔍 Verifying content script improvements:${NC}"

if grep -q "universalElementLocatorListener" "$SCRIPT_DIR/content.js"; then
    echo -e "${GREEN}  ✅ Message listener management improved${NC}"
else
    echo -e "${RED}  ❌ Message listener management not improved${NC}"
fi

if grep -q "re-initializing" "$SCRIPT_DIR/content.js"; then
    echo -e "${GREEN}  ✅ Re-injection handling improved${NC}"
else
    echo -e "${RED}  ❌ Re-injection handling not improved${NC}"
fi

echo ""
echo -e "${CYAN}🧪 MANUAL TESTING INSTRUCTIONS:${NC}"
echo "================================="
echo ""
echo -e "${YELLOW}1. Install/Reload Extension:${NC}"
echo "   • Go to chrome://extensions/"
echo "   • Click reload button for Universal Element Locator"
echo ""
echo -e "${YELLOW}2. Open Debug Page:${NC}"
echo "   • Open: file://$SCRIPT_DIR/debug-connection.html"
echo "   • Keep Chrome DevTools open (F12 → Console tab)"
echo ""
echo -e "${YELLOW}3. Test Individual Element Scanning:${NC}"
echo "   • Click extension icon to open popup"
echo "   • Click '🎯 Scan Element' button"
echo "   • You should see 'Connecting to page...' status"
echo "   • Then 'Click on any element on the page to scan it'"
echo "   • Click on any test element on the debug page"
echo ""
echo -e "${YELLOW}4. Verify Console Messages:${NC}"
echo "   Look for these in DevTools Console:"
echo -e "${GREEN}   ✅ 'Attempt 1/3 to connect to content script'${NC}"
echo -e "${GREEN}   ✅ '✅ Content script connection successful'${NC}"
echo -e "${GREEN}   ✅ '🎯 Starting individual element scan mode'${NC}"
echo -e "${GREEN}   ✅ '🎯 Element selected for individual scan:'${NC}"
echo ""
echo -e "${YELLOW}5. Test Element Highlighting:${NC}"
echo "   • After scanning an element, click '✨ Highlight Element'"
echo "   • You should see 'Connecting to page...' again"
echo "   • Then 'Element highlighted on page'"
echo "   • The element should show a pulsing green border"
echo ""

echo -e "${BLUE}📋 EXPECTED IMPROVEMENTS:${NC}"
echo "========================="
echo -e "${GREEN}✅ Robust Connection Handling:${NC}"
echo "   • Up to 3 retry attempts for content script connection"
echo "   • Progressive delay between retries"
echo "   • Clear user feedback during connection process"
echo ""
echo -e "${GREEN}✅ Better Error Messages:${NC}"
echo "   • Specific guidance for connection failures"
echo "   • Instructions to refresh page when needed"
echo "   • Clear indication of restricted pages"
echo ""
echo -e "${GREEN}✅ Improved Content Script Management:${NC}"
echo "   • Prevents duplicate message listeners"
echo "   • Handles re-injection gracefully"
echo "   • Better initialization state management"
echo ""

echo -e "${RED}🚨 TROUBLESHOOTING:${NC}"
echo "==================="
echo -e "${YELLOW}If connection still fails:${NC}"
echo ""
echo "1. 🔄 Hard refresh the test page (Ctrl+Shift+R / Cmd+Shift+R)"
echo "2. 🔄 Reload the extension in chrome://extensions/"
echo "3. 📊 Check DevTools Console for specific error messages"
echo "4. 🚫 Ensure you're not on a chrome:// or chrome-extension:// page"
echo "5. 🔒 Check if the page has Content Security Policy restrictions"
echo ""
echo -e "${YELLOW}If retry logic doesn't work:${NC}"
echo "• The content script might be blocked by the page's CSP"
echo "• Try a different website or the debug page"
echo "• Check browser console for injection errors"
echo ""

echo -e "${GREEN}🎯 Test Pages Available:${NC}"
echo "========================"
echo "🔧 Debug page:      file://$SCRIPT_DIR/debug-connection.html"
echo "🧪 Connection test: file://$SCRIPT_DIR/connection-test.html"
echo "🎯 Individual scan: file://$SCRIPT_DIR/individual-scan-test.html"
echo ""

echo -e "${CYAN}🚀 Ready to test the connection fix!${NC}"
echo ""
echo -e "${BLUE}Press Enter to open the debug page...${NC}"
read -r

if [[ -f "$SCRIPT_DIR/debug-connection.html" ]]; then
    if command -v open &> /dev/null; then
        open "$SCRIPT_DIR/debug-connection.html"
        echo -e "${GREEN}✅ Debug page opened in default browser${NC}"
    else
        echo -e "${YELLOW}📄 Please manually open: file://$SCRIPT_DIR/debug-connection.html${NC}"
    fi
else
    echo -e "${RED}❌ Debug page not found${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Connection fix test script complete!${NC}"
echo -e "${BLUE}Follow the manual testing instructions above to verify the fix.${NC}"
