#!/bin/bash

# Test script to verify string method error fixes
echo "🔧 Testing String Method Error Fixes..."

# Create a comprehensive test page with various edge cases that might cause string errors
cat > test-string-errors.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>String Error Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ccc; }
        .test-section h3 { margin-top: 0; color: #333; }
        .hidden { display: none; }
        .empty-element { width: 50px; height: 50px; background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>String Method Error Test Page</h1>
    
    <div class="test-section">
        <h3>Elements with Null/Undefined Text</h3>
        <div id="null-text"></div>
        <span data-testid="empty-span"></span>
        <p class="empty-p"></p>
    </div>

    <div class="test-section">
        <h3>Elements with Non-String Values</h3>
        <div id="numeric-content">12345</div>
        <span data-value="0">Zero Value</span>
        <input type="number" value="123.45" name="numeric-input">
    </div>

    <div class="test-section">
        <h3>Elements with Special Characters</h3>
        <div title="Special chars: &lt;&gt;&amp;&quot;">Special Content</div>
        <span data-special='{"key": "value"}'>JSON Data</span>
        <p>Unicode: 🚀 🌟 ✨ 💎</p>
    </div>

    <div class="test-section">
        <h3>Hidden and Invisible Elements</h3>
        <div class="hidden">Hidden Content</div>
        <span style="display: none;">Invisible Span</span>
        <div style="visibility: hidden;">Visibility Hidden</div>
        <div class="empty-element"></div>
    </div>

    <div class="test-section">
        <h3>Form Elements</h3>
        <form>
            <input type="text" placeholder="Text Input" name="text-field">
            <input type="email" value="" placeholder="Email" required>
            <select name="dropdown">
                <option value="">Select Option</option>
                <option value="1">Option 1</option>
            </select>
            <textarea placeholder="Textarea content"></textarea>
            <button type="submit">Submit</button>
        </form>
    </div>

    <div class="test-section">
        <h3>Dynamic Content (Added via JavaScript)</h3>
        <div id="dynamic-container"></div>
    </div>

    <script>
        // Add some dynamic content that might have edge cases
        const container = document.getElementById('dynamic-container');
        
        // Element with null/undefined properties
        const dynamicDiv = document.createElement('div');
        dynamicDiv.textContent = null; // This will be converted but might cause issues
        dynamicDiv.setAttribute('data-null', null);
        dynamicDiv.setAttribute('data-undefined', undefined);
        container.appendChild(dynamicDiv);
        
        // Element with number attributes
        const numDiv = document.createElement('div');
        numDiv.setAttribute('data-number', 42);
        numDiv.textContent = 'Dynamic Content';
        container.appendChild(numDiv);
        
        // Element with object/array attributes (should be stringified)
        const objDiv = document.createElement('div');
        objDiv.setAttribute('data-object', JSON.stringify({test: 'value'}));
        objDiv.textContent = 'Object Data';
        container.appendChild(objDiv);

        // Set some problematic properties directly on elements
        setTimeout(() => {
            const elements = document.querySelectorAll('div, span, p');
            elements.forEach((el, index) => {
                // Simulate some edge cases that might occur in real scenarios
                if (index % 3 === 0) {
                    el._customProperty = null;
                }
                if (index % 5 === 0) {
                    el._numberProperty = 123;
                }
            });
        }, 100);
    </script>
</body>
</html>
EOF

echo "✅ Created test page: test-string-errors.html"

# Run the extension test
echo "🔍 Testing extension with edge case elements..."

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
echo "📝 Please:"
echo "   1. Click the extension icon"
echo "   2. Click 'Scan This Page'"
echo "   3. Click 'View Detailed Results'"
echo "   4. Check for any 'text.trim is not a function' errors in the table"
echo "   5. Look for any other JavaScript errors in the browser console"

# Get absolute path to test file
TEST_FILE="$(pwd)/test-string-errors.html"

$CHROME_CMD --load-extension="$(pwd)" "file://$TEST_FILE" &

echo ""
echo "🔍 Expected Results:"
echo "   ✅ No 'text.trim is not a function' errors"
echo "   ✅ All elements should render properly in the table"
echo "   ✅ Text content should display correctly or show 'No text content'"
echo "   ✅ Attributes and other fields should display safely"
echo ""
echo "💡 If you see any string method errors, please check the browser console for details."
