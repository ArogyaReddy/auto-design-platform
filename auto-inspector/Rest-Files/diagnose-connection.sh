#!/bin/bash

# Connection Test Script for Individual Element Scanning
echo "🔗 Universal Element Locator - Connection Diagnostic Test"
echo "========================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}📋 Diagnosing connection issues...${NC}"
echo ""

# Check manifest.json for permissions
echo -e "${YELLOW}🔍 Checking manifest.json permissions:${NC}"
if grep -q '"activeTab"' "$SCRIPT_DIR/manifest.json"; then
    echo -e "${GREEN}  ✅ activeTab permission found${NC}"
else
    echo -e "${RED}  ❌ activeTab permission missing${NC}"
fi

if grep -q '"scripting"' "$SCRIPT_DIR/manifest.json"; then
    echo -e "${GREEN}  ✅ scripting permission found${NC}"
else
    echo -e "${RED}  ❌ scripting permission missing${NC}"
fi

if grep -q '"storage"' "$SCRIPT_DIR/manifest.json"; then
    echo -e "${GREEN}  ✅ storage permission found${NC}"
else
    echo -e "${RED}  ❌ storage permission missing${NC}"
fi

# Check content script registration
echo -e "${YELLOW}🔍 Checking content script configuration:${NC}"
if grep -q '"content_scripts"' "$SCRIPT_DIR/manifest.json"; then
    echo -e "${GREEN}  ✅ Content scripts section found${NC}"
    if grep -q '"content.js"' "$SCRIPT_DIR/manifest.json"; then
        echo -e "${GREEN}  ✅ content.js registered${NC}"
    else
        echo -e "${RED}  ❌ content.js not registered${NC}"
    fi
else
    echo -e "${RED}  ❌ Content scripts section missing${NC}"
fi

# Check key files
echo -e "${YELLOW}🔍 Checking key implementation files:${NC}"
files_to_check=("popup.js" "content.js" "manifest.json")
for file in "${files_to_check[@]}"; do
    if [[ -f "$SCRIPT_DIR/$file" ]]; then
        size=$(wc -c < "$SCRIPT_DIR/$file")
        echo -e "${GREEN}  ✅ $file (${size} bytes)${NC}"
    else
        echo -e "${RED}  ❌ $file missing${NC}"
    fi
done

# Check popup.js for individual scanning functions
echo -e "${YELLOW}🔍 Checking popup.js for individual scanning:${NC}"
if grep -q "toggleElementScan" "$SCRIPT_DIR/popup.js"; then
    echo -e "${GREEN}  ✅ toggleElementScan function found${NC}"
else
    echo -e "${RED}  ❌ toggleElementScan function missing${NC}"
fi

if grep -q "startElementScan" "$SCRIPT_DIR/popup.js"; then
    echo -e "${GREEN}  ✅ startElementScan message handling found${NC}"
else
    echo -e "${RED}  ❌ startElementScan message handling missing${NC}"
fi

# Check content.js for message handlers
echo -e "${YELLOW}🔍 Checking content.js for message handlers:${NC}"
if grep -q "startElementScan" "$SCRIPT_DIR/content.js"; then
    echo -e "${GREEN}  ✅ startElementScan handler found${NC}"
else
    echo -e "${RED}  ❌ startElementScan handler missing${NC}"
fi

if grep -q "startIndividualElementScan" "$SCRIPT_DIR/content.js"; then
    echo -e "${GREEN}  ✅ startIndividualElementScan function found${NC}"
else
    echo -e "${RED}  ❌ startIndividualElementScan function missing${NC}"
fi

if grep -q "chrome.runtime.onMessage.addListener" "$SCRIPT_DIR/content.js"; then
    echo -e "${GREEN}  ✅ Message listener found${NC}"
else
    echo -e "${RED}  ❌ Message listener missing${NC}"
fi

echo ""
echo -e "${BLUE}🎯 CONNECTION ISSUE DIAGNOSIS:${NC}"
echo "================================"
echo ""
echo -e "${YELLOW}Most likely causes of 'Could not establish connection' error:${NC}"
echo ""
echo "1. 🔄 Content Script Injection Issues:"
echo "   • Content script not automatically injected"
echo "   • Manual injection failing"
echo "   • Script injection timing problems"
echo ""
echo "2. 📄 Page Access Issues:"
echo "   • Trying to scan Chrome internal pages (chrome://)"
echo "   • Extension pages or restricted URLs"
echo "   • Page not fully loaded when scanning starts"
echo ""
echo "3. ⚡ Timing Issues:"
echo "   • Message sent before content script ready"
echo "   • Content script initialization incomplete"
echo "   • Race condition between injection and messaging"
echo ""
echo "4. 🔧 Extension Configuration:"
echo "   • Missing permissions in manifest.json"
echo "   • Content script not properly registered"
echo "   • Extension context invalidated"
echo ""

echo -e "${GREEN}🛠 RECOMMENDED FIXES:${NC}"
echo "==================="
echo ""
echo "1. ✅ Enhanced Error Handling (Already Implemented):"
echo "   • Automatic content script injection in popup.js"
echo "   • Ping-pong communication test before sending messages"
echo "   • Retry mechanism with proper timing"
echo ""
echo "2. 📋 User Instructions:"
echo "   • Always refresh the page before first scan"
echo "   • Avoid Chrome internal pages (chrome://, chrome-extension://)"
echo "   • Wait for page to fully load before scanning"
echo ""
echo "3. 🧪 Testing Steps:"
echo "   • Open connection-test.html in a regular tab"
echo "   • Click extension icon to open popup"
echo "   • Try full page scan first to verify basic functionality"
echo "   • Then try individual element scanning"
echo ""

echo -e "${BLUE}📄 Test Page Available:${NC}"
echo "File: $SCRIPT_DIR/connection-test.html"
echo "URL:  file://$SCRIPT_DIR/connection-test.html"
echo ""

echo -e "${YELLOW}🚀 To test the fix:${NC}"
echo "=================="
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Reload the Universal Element Locator extension"
echo "3. Open connection-test.html in a new tab"
echo "4. Click the extension icon"
echo "5. Try individual element scanning"
echo ""
echo -e "${GREEN}✅ Connection diagnostic complete!${NC}"
