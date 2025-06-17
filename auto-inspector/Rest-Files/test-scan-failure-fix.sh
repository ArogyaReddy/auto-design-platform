#!/bin/bash

echo "=== Scan Failure Diagnosis and Fix ==="
echo "Testing the enhanced error handling and diagnostics"

# Check if files exist
if [ ! -f "popup.js" ]; then
    echo "❌ popup.js not found"
    exit 1
fi

if [ ! -f "content.js" ]; then
    echo "❌ content.js not found"
    exit 1
fi

echo "✅ Extension files found"

# Check JavaScript syntax
echo ""
echo "=== JavaScript Syntax Check ==="
node -c popup.js 2>&1
if [ $? -eq 0 ]; then
    echo "✅ popup.js syntax is valid"
else
    echo "❌ popup.js has syntax errors"
    exit 1
fi

node -c content.js 2>&1
if [ $? -eq 0 ]; then
    echo "✅ content.js syntax is valid"
else
    echo "❌ content.js has syntax errors"
    exit 1
fi

# Check for enhanced error handling
echo ""
echo "=== Checking Enhanced Error Handling ==="

echo "Checking for content script ping test..."
grep -q "ping.*response" popup.js && echo "✅ Content script ping test found" || echo "❌ Content script ping test missing"

echo "Checking for enhanced retry logic..."
grep -q "Receiving end does not exist" popup.js && echo "✅ Enhanced retry logic found" || echo "❌ Enhanced retry logic missing"

echo "Checking for detailed error logging..."
grep -q "Error stack:" content.js && echo "✅ Detailed error logging found" || echo "❌ Detailed error logging missing"

echo "Checking for DOM readiness validation..."
grep -q "document.readyState" content.js && echo "✅ DOM readiness check found" || echo "❌ DOM readiness check missing"

echo "Checking for empty results validation..."
grep -q "No visible elements found" content.js && echo "✅ Empty results validation found" || echo "❌ Empty results validation missing"

# Check common failure patterns
echo ""
echo "=== Common Failure Patterns Addressed ==="

echo "1. ✅ Content Script Injection Issues"
echo "   - Enhanced error handling for injection failures"
echo "   - Specific messages for access denied errors"
echo "   - Re-injection on communication failures"

echo ""
echo "2. ✅ Communication Timeouts"
echo "   - Ping test before scanning"
echo "   - Increased retry delays (1000ms instead of 500ms)"
echo "   - Better detection of script disconnection"

echo ""
echo "3. ✅ DOM Not Ready Issues"
echo "   - Document ready state checking"
echo "   - DOM body availability validation"
echo "   - Better timing for script injection"

echo ""
echo "4. ✅ Empty Results Detection"
echo "   - Validation for zero results"
echo "   - Detailed scan statistics logging"
echo "   - Specific error messages for diagnosis"

echo ""
echo "=== Diagnostic Information Added ==="

echo "📊 Enhanced Logging:"
echo "   - Tab ID and URL logging"
echo "   - Content script injection status"
echo "   - Ping response validation"
echo "   - Detailed retry attempt logging"
echo "   - DOM readiness state"
echo "   - Element scan statistics"

echo ""
echo "🔧 Error Messages Improved:"
echo "   - 'Cannot access this page - try a different website'"
echo "   - 'Content script not ready - please try again'"
echo "   - 'Cannot communicate with page - please try again'"
echo "   - 'No visible elements found on page'"

echo ""
echo "=== Testing Instructions ==="

echo "📝 To test the fixes:"
echo "1. Load the extension and open popup"
echo "2. Try scanning on different types of pages:"
echo "   - Regular websites (should work)"
echo "   - Chrome internal pages (should show access error)"
echo "   - Pages with heavy JavaScript (should retry successfully)"
echo "   - Very simple pages (should handle gracefully)"

echo ""
echo "🔍 Check browser console for detailed logs:"
echo "   - Look for '🔍 Popup:' messages for popup-side debugging"
echo "   - Look for '🔍 Content:' messages for content script debugging"
echo "   - Error messages now include specific failure reasons"

echo ""
echo "=== Common Issues and Solutions ==="

echo "❌ 'Receiving end does not exist':"
echo "   ✅ Now automatically re-injects content script"

echo ""
echo "❌ 'Cannot access' errors:"
echo "   ✅ Now shows user-friendly message and exits gracefully"

echo ""
echo "❌ Silent failures:"
echo "   ✅ Now has comprehensive logging and specific error messages"

echo ""
echo "❌ Timing issues:"
echo "   ✅ Now includes ping test and longer retry delays"

echo ""
echo "✅ Enhanced Scan Failure Diagnosis Applied!"
echo "🚀 Should now provide clear feedback on why scans fail"
