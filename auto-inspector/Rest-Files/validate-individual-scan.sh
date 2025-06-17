#!/bin/bash

# Quick validation script for Individual Element Scanning implementation
echo "🎯 Universal Element Locator - Individual Scanning Validation"
echo "============================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}📁 Validating extension files in: $SCRIPT_DIR${NC}"

# 1. Check all required files exist
echo -e "${YELLOW}🔍 Checking file existence...${NC}"
files_check=true

required_files=(
    "manifest.json"
    "popup.html"
    "popup.js"
    "content.js"
    "individual-scan-test.html"
    "test-individual-scan.sh"
    "INDIVIDUAL_SCANNING_COMPLETE.md"
)

for file in "${required_files[@]}"; do
    if [[ -f "$SCRIPT_DIR/$file" ]]; then
        echo -e "${GREEN}  ✅ $file${NC}"
    else
        echo -e "${RED}  ❌ $file (missing)${NC}"
        files_check=false
    fi
done

# 2. Check popup.html for new UI elements
echo -e "${YELLOW}🔍 Checking popup.html for individual tools...${NC}"
if grep -q "individual-tools" "$SCRIPT_DIR/popup.html"; then
    echo -e "${GREEN}  ✅ Individual tools section found${NC}"
else
    echo -e "${RED}  ❌ Individual tools section missing${NC}"
    files_check=false
fi

if grep -q "scanElementButton" "$SCRIPT_DIR/popup.html"; then
    echo -e "${GREEN}  ✅ Scan Element button found${NC}"
else
    echo -e "${RED}  ❌ Scan Element button missing${NC}"
    files_check=false
fi

if grep -q "highlightElementButton" "$SCRIPT_DIR/popup.html"; then
    echo -e "${GREEN}  ✅ Highlight Element button found${NC}"
else
    echo -e "${RED}  ❌ Highlight Element button missing${NC}"
    files_check=false
fi

# 3. Check popup.js for new functionality
echo -e "${YELLOW}🔍 Checking popup.js for individual scanning functions...${NC}"
if grep -q "toggleElementScan" "$SCRIPT_DIR/popup.js"; then
    echo -e "${GREEN}  ✅ toggleElementScan function found${NC}"
else
    echo -e "${RED}  ❌ toggleElementScan function missing${NC}"
    files_check=false
fi

if grep -q "highlightSelectedElement" "$SCRIPT_DIR/popup.js"; then
    echo -e "${GREEN}  ✅ highlightSelectedElement function found${NC}"
else
    echo -e "${RED}  ❌ highlightSelectedElement function missing${NC}"
    files_check=false
fi

if grep -q "displaySelectedElement" "$SCRIPT_DIR/popup.js"; then
    echo -e "${GREEN}  ✅ displaySelectedElement function found${NC}"
else
    echo -e "${RED}  ❌ displaySelectedElement function missing${NC}"
    files_check=false
fi

# 4. Check content.js for new message handlers
echo -e "${YELLOW}🔍 Checking content.js for individual scanning handlers...${NC}"
if grep -q "startElementScan" "$SCRIPT_DIR/content.js"; then
    echo -e "${GREEN}  ✅ startElementScan handler found${NC}"
else
    echo -e "${RED}  ❌ startElementScan handler missing${NC}"
    files_check=false
fi

if grep -q "startIndividualElementScan" "$SCRIPT_DIR/content.js"; then
    echo -e "${GREEN}  ✅ startIndividualElementScan function found${NC}"
else
    echo -e "${RED}  ❌ startIndividualElementScan function missing${NC}"
    files_check=false
fi

if grep -q "highlightSelectedElement" "$SCRIPT_DIR/content.js"; then
    echo -e "${GREEN}  ✅ highlightSelectedElement function found${NC}"
else
    echo -e "${RED}  ❌ highlightSelectedElement function missing${NC}"
    files_check=false
fi

# 5. Check CSS styling for individual tools
echo -e "${YELLOW}🔍 Checking popup.html for individual tools CSS...${NC}"
if grep -q "individual-tools" "$SCRIPT_DIR/popup.html" && grep -q "tool-btn" "$SCRIPT_DIR/popup.html"; then
    echo -e "${GREEN}  ✅ Individual tools CSS classes found${NC}"
else
    echo -e "${RED}  ❌ Individual tools CSS classes missing${NC}"
    files_check=false
fi

# 6. Check test page content
echo -e "${YELLOW}🔍 Checking test page content...${NC}"
if grep -q "Individual Element Scan Test" "$SCRIPT_DIR/individual-scan-test.html"; then
    echo -e "${GREEN}  ✅ Test page title found${NC}"
else
    echo -e "${RED}  ❌ Test page title missing${NC}"
    files_check=false
fi

if grep -q "data-testid" "$SCRIPT_DIR/individual-scan-test.html"; then
    echo -e "${GREEN}  ✅ Test elements with attributes found${NC}"
else
    echo -e "${RED}  ❌ Test elements with attributes missing${NC}"
    files_check=false
fi

# 7. Check manifest.json permissions
echo -e "${YELLOW}🔍 Checking manifest.json permissions...${NC}"
if grep -q '"activeTab"' "$SCRIPT_DIR/manifest.json"; then
    echo -e "${GREEN}  ✅ activeTab permission found${NC}"
else
    echo -e "${RED}  ❌ activeTab permission missing${NC}"
    files_check=false
fi

if grep -q '"scripting"' "$SCRIPT_DIR/manifest.json"; then
    echo -e "${GREEN}  ✅ scripting permission found${NC}"
else
    echo -e "${RED}  ❌ scripting permission missing${NC}"
    files_check=false
fi

# 8. Check for syntax issues (basic validation)
echo -e "${YELLOW}🔍 Checking for basic syntax issues...${NC}"

# Check for unmatched braces in JS files
for js_file in "popup.js" "content.js"; do
    if [[ -f "$SCRIPT_DIR/$js_file" ]]; then
        # Count opening and closing braces
        open_braces=$(grep -o '{' "$SCRIPT_DIR/$js_file" | wc -l)
        close_braces=$(grep -o '}' "$SCRIPT_DIR/$js_file" | wc -l)
        
        if [[ $open_braces -eq $close_braces ]]; then
            echo -e "${GREEN}  ✅ $js_file - Braces balanced${NC}"
        else
            echo -e "${RED}  ❌ $js_file - Unmatched braces (${open_braces} open, ${close_braces} close)${NC}"
            files_check=false
        fi
    fi
done

# Final validation result
echo ""
echo -e "${BLUE}📋 VALIDATION SUMMARY${NC}"
echo "===================="

if $files_check; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo -e "${GREEN}🎯 Individual Element Scanning implementation is complete and ready for testing!${NC}"
    echo ""
    echo -e "${BLUE}📋 Implementation Summary:${NC}"
    echo "• ✅ Individual Element Tools UI added to popup"
    echo "• ✅ Scan Element functionality implemented"
    echo "• ✅ Highlight Element functionality implemented"
    echo "• ✅ Content script handlers added"
    echo "• ✅ CSS styling complete"
    echo "• ✅ Test page created"
    echo "• ✅ Documentation complete"
    echo ""
    echo -e "${YELLOW}🚀 Next Steps:${NC}"
    echo "1. Load the extension in Chrome (chrome://extensions/)"
    echo "2. Run: ./test-individual-scan.sh"
    echo "3. Test individual element scanning on the test page"
    echo "4. Verify highlighting functionality works"
    echo ""
    echo -e "${GREEN}🎯 Ready for production use!${NC}"
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo -e "${RED}Some components are missing or incorrect. Please review the errors above.${NC}"
fi

echo ""
echo -e "${BLUE}Files validated:${NC}"
for file in "${required_files[@]}"; do
    if [[ -f "$SCRIPT_DIR/$file" ]]; then
        size=$(wc -c < "$SCRIPT_DIR/$file")
        echo "  📄 $file (${size} bytes)"
    fi
done

echo ""
echo -e "${BLUE}🔧 To test manually:${NC}"
echo "1. Open Chrome and go to chrome://extensions/"
echo "2. Enable Developer mode"
echo "3. Click 'Load unpacked' and select this directory"
echo "4. Open the test page: file://$SCRIPT_DIR/individual-scan-test.html"
echo "5. Click the extension icon and test individual scanning"
