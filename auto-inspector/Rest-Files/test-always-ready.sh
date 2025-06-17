#!/bin/bash

# Test script to verify the extension is always ready
echo "🚀 Testing Always Ready Extension..."

# Create a simple test page
cat > test-always-ready.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Always Ready Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
        .test-section h3 { margin-top: 0; color: #333; }
    </style>
</head>
<body>
    <h1>Always Ready Test Page</h1>
    
    <div class="test-section">
        <h3>Test Elements</h3>
        <button id="test-button">Test Button</button>
        <input type="text" placeholder="Test Input" name="test-input">
        <div class="test-div">Test Div Content</div>
        <span data-testid="test-span">Test Span</span>
    </div>

    <div class="test-section">
        <h3>Instructions</h3>
        <p>This page tests the "Always Ready" extension behavior:</p>
        <ol>
            <li>Open the extension popup by clicking the extension icon</li>
            <li>The popup should immediately show "Ready to scan any webpage!"</li>
            <li>There should be NO "Not connected" or "Disconnected" messages</li>
            <li>There should be NO "Retry Connection" button</li>
            <li>The "Scan Page Elements" button should be immediately clickable</li>
            <li>Clicking scan should work instantly without any retry needed</li>
        </ol>
    </div>

    <div class="test-section">
        <h3>Expected Results</h3>
        <ul>
            <li>✅ Extension popup opens immediately</li>
            <li>✅ Shows "Ready to scan any webpage!" status</li>
            <li>✅ No connection checking or retry logic</li>
            <li>✅ Scan works on first click</li>
            <li>✅ Results page opens with element data</li>
        </ul>
    </div>
</body>
</html>
EOF

echo "✅ Created test page: test-always-ready.html"

# Check if Chrome is available
if ! command -v google-chrome &> /dev/null && ! command -v chromium &> /dev/null; then
    echo "❌ Chrome/Chromium not found. Please install Chrome to run the test."
    exit 1
fi

# Find Chrome executable
CHROME_CMD="google-chrome"
if ! command -v google-chrome &> /dev/null; then
    CHROME_CMD="chromium"
fi

# Launch Chrome with the extension and test page
echo "🚀 Launching Chrome with extension..."
echo ""
echo "🔍 Test Steps:"
echo "   1. Click the extension icon in the toolbar"
echo "   2. Verify it shows 'Ready to scan any webpage!' immediately"
echo "   3. Verify there are NO connection status messages"
echo "   4. Verify there is NO 'Retry Connection' button"
echo "   5. Click 'Scan Page Elements' - it should work immediately"
echo "   6. Verify the results page opens with scanned elements"
echo ""

# Get absolute path to test file
TEST_FILE="$(pwd)/test-always-ready.html"

$CHROME_CMD --load-extension="$(pwd)" "file://$TEST_FILE" &

echo "✅ Expected Behavior:"
echo "   🟢 Popup shows 'Ready to scan any webpage!' immediately"
echo "   🟢 No connection checking delays"
echo "   🟢 No retry buttons or error states"
echo "   🟢 Scan works on first click"
echo ""
echo "❌ Avoid These Behaviors:"
echo "   🔴 'Not connected - click retry' messages"
echo "   🔴 'Disconnected' status"
echo "   🔴 'Retry Connection' buttons"
echo "   🔴 Delays before the extension is ready"
