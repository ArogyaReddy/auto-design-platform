#!/bin/bash

# Individual Element Scanning Test Script
# Tests the new individual element scanning and highlighting functionality

echo "🎯 Universal Element Locator - Individual Scan Test"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Testing individual element scanning functionality...${NC}"

# Check if Chrome is available
if ! command -v google-chrome &> /dev/null && ! command -v chromium &> /dev/null; then
    echo -e "${RED}❌ Chrome or Chromium not found. Please install Chrome to run this test.${NC}"
    exit 1
fi

# Set Chrome command
CHROME_CMD="google-chrome"
if ! command -v google-chrome &> /dev/null; then
    CHROME_CMD="chromium"
fi

echo -e "${GREEN}✅ Chrome found: $CHROME_CMD${NC}"

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTENSION_DIR="$SCRIPT_DIR"
TEST_PAGE="$SCRIPT_DIR/individual-scan-test.html"

echo -e "${BLUE}📁 Extension directory: $EXTENSION_DIR${NC}"
echo -e "${BLUE}📄 Test page: $TEST_PAGE${NC}"

# Check if extension files exist
echo -e "${YELLOW}🔍 Checking extension files...${NC}"

required_files=(
    "manifest.json"
    "popup.html"
    "popup.js"
    "content.js"
    "individual-scan-test.html"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [[ -f "$EXTENSION_DIR/$file" ]]; then
        echo -e "${GREEN}  ✅ $file${NC}"
    else
        echo -e "${RED}  ❌ $file${NC}"
        missing_files+=("$file")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    echo -e "${RED}❌ Missing required files. Please ensure all extension files are present.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All required files found${NC}"

# Check manifest.json content
echo -e "${YELLOW}🔍 Checking manifest.json...${NC}"
if grep -q '"manifest_version": 3' "$EXTENSION_DIR/manifest.json"; then
    echo -e "${GREEN}  ✅ Manifest V3 format${NC}"
else
    echo -e "${RED}  ❌ Invalid manifest format${NC}"
    exit 1
fi

if grep -q '"content_scripts"' "$EXTENSION_DIR/manifest.json"; then
    echo -e "${GREEN}  ✅ Content scripts configured${NC}"
else
    echo -e "${RED}  ❌ Content scripts not configured${NC}"
    exit 1
fi

# Start Chrome with extension loaded
echo -e "${YELLOW}🚀 Starting Chrome with extension loaded...${NC}"

# Create a temporary user data directory
TEMP_USER_DATA=$(mktemp -d)
trap "rm -rf $TEMP_USER_DATA" EXIT

# Launch Chrome with the extension
$CHROME_CMD \
    --user-data-dir="$TEMP_USER_DATA" \
    --load-extension="$EXTENSION_DIR" \
    --new-window \
    "file://$TEST_PAGE" \
    --disable-web-security \
    --disable-features=VizDisplayCompositor \
    --disable-gpu-sandbox \
    --no-sandbox &

CHROME_PID=$!

echo -e "${GREEN}✅ Chrome launched with PID: $CHROME_PID${NC}"
echo -e "${GREEN}✅ Extension loaded from: $EXTENSION_DIR${NC}"
echo -e "${GREEN}✅ Test page opened: file://$TEST_PAGE${NC}"

echo ""
echo -e "${BLUE}🧪 MANUAL TESTING INSTRUCTIONS:${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${YELLOW}1. Look for the Universal Element Locator extension icon in Chrome${NC}"
echo -e "${YELLOW}2. Click on the extension icon to open the popup${NC}"
echo -e "${YELLOW}3. You should see:${NC}"
echo -e "   - 🔍 Scan Page Elements button"
echo -e "   - Individual Element Tools section with:"
echo -e "     • 🎯 Scan Element button"
echo -e "     • ✨ Highlight Element button (initially disabled)"
echo ""
echo -e "${YELLOW}4. Test Individual Element Scanning:${NC}"
echo -e "   a) Click '🎯 Scan Element' button"
echo -e "   b) The button should change to '🎯 Click Element to Scan'"
echo -e "   c) Hover over elements on the test page - they should get a dashed outline"
echo -e "   d) Click on any element (try buttons, inputs, links, divs, etc.)"
echo -e "   e) The popup should show element information"
echo -e "   f) The '✨ Highlight Element' button should become enabled"
echo ""
echo -e "${YELLOW}5. Test Element Highlighting:${NC}"
echo -e "   a) After scanning an element, click '✨ Highlight Element'"
echo -e "   b) The scanned element should be highlighted with a pulsing green border"
echo -e "   c) The highlight should disappear after 5 seconds"
echo ""
echo -e "${YELLOW}6. Test Different Element Types:${NC}"
echo -e "   - Try scanning buttons with different attributes"
echo -e "   - Try form inputs (text, email, select)"
echo -e "   - Try links and navigation elements"
echo -e "   - Try table cells and headers"
echo -e "   - Try nested elements and spans"
echo ""
echo -e "${YELLOW}7. Expected Behavior:${NC}"
echo -e "   ✅ Scan mode should activate/deactivate properly"
echo -e "   ✅ Elements should highlight on hover during scan mode"
echo -e "   ✅ Clicking an element should capture its locators"
echo -e "   ✅ Element info should display in popup"
echo -e "   ✅ Highlight function should work for scanned elements"
echo -e "   ✅ Multiple scan cycles should work without issues"
echo ""
echo -e "${GREEN}🔧 TROUBLESHOOTING:${NC}"
echo -e "================================"
echo -e "${GREEN}If the extension doesn't work:${NC}"
echo "1. Check the Chrome DevTools Console for errors"
echo "2. Reload the extension in chrome://extensions/"
echo "3. Refresh the test page"
echo "4. Try right-clicking on the page and selecting 'Inspect' > 'Console'"
echo ""
echo -e "${BLUE}📊 Browser Console Checks:${NC}"
echo "Open DevTools (F12) and look for these messages:"
echo "✅ '🎯 Universal Element Locator: Content script loaded'"
echo "✅ '🚀 Universal Element Locator: Initializing extension'"
echo "✅ '🎯 Individual element scan mode activated' (when scanning)"
echo "✅ '🎯 Element selected for individual scan:' (when clicking element)"
echo ""
echo -e "${YELLOW}Press Enter when done testing to close Chrome...${NC}"
read -r

# Clean up
echo -e "${BLUE}🧹 Cleaning up...${NC}"
kill $CHROME_PID 2>/dev/null || true
wait $CHROME_PID 2>/dev/null || true

echo -e "${GREEN}✅ Test completed!${NC}"
echo ""
echo -e "${BLUE}📋 TEST REPORT:${NC}"
echo "==============="
echo "Extension Directory: $EXTENSION_DIR"
echo "Test Page: $TEST_PAGE" 
echo "Chrome PID: $CHROME_PID"
echo "Temporary User Data: $TEMP_USER_DATA"
echo ""
echo -e "${YELLOW}If you encountered any issues, please check:${NC}"
echo "1. All extension files are present and valid"
echo "2. Chrome DevTools Console for error messages"
echo "3. Extension permissions in chrome://extensions/"
echo ""
echo -e "${GREEN}🎯 Individual Element Scanning Test Complete!${NC}"
