#!/bin/bash

# Universal Compatibility Test
# Test the extension on various page types including local HTML files

set -e
cd "$(dirname "$0")"

echo "🔧 Universal Compatibility Test"
echo "================================"

# Create a test HTML file
echo "📄 Creating test HTML file..."
cat > /tmp/test-local-page.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Local Test Page</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .sample-button { background: #007cba; color: white; padding: 10px 20px; border: none; border-radius: 5px; }
        .sample-input { border: 1px solid #ccc; padding: 8px; margin: 5px; }
        .sample-link { color: #007cba; text-decoration: none; }
        .sample-image { width: 100px; height: 100px; background: #f0f0f0; }
    </style>
</head>
<body>
    <div class="container">
        <h1 id="main-title">Local HTML Test Page</h1>
        <p class="description">This page tests the Universal Element Locator extension on local HTML files.</p>
        
        <div class="form-section">
            <h2>Sample Form Elements</h2>
            <input type="text" class="sample-input" placeholder="Test input field" id="test-input">
            <button class="sample-button" id="test-button">Test Button</button>
            <select class="sample-select" name="test-select">
                <option value="">Select an option</option>
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
            </select>
        </div>
        
        <div class="content-section">
            <h2>Sample Content</h2>
            <p>This is a paragraph with <a href="#" class="sample-link">a test link</a>.</p>
            <div class="sample-image" data-testid="sample-image">Sample Image Div</div>
            <ul class="sample-list">
                <li data-value="item1">List Item 1</li>
                <li data-value="item2">List Item 2</li>
                <li data-value="item3">List Item 3</li>
            </ul>
        </div>
        
        <div class="table-section">
            <h2>Sample Table</h2>
            <table border="1" class="sample-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Value</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Test Row 1</td>
                        <td>100</td>
                        <td><button class="action-btn">Edit</button></td>
                    </tr>
                    <tr>
                        <td>Test Row 2</td>
                        <td>200</td>
                        <td><button class="action-btn">Edit</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</body>
</html>
EOF

echo "✅ Test HTML file created at: file:///tmp/test-local-page.html"

# Create a data URL test page
echo "📄 Creating data URL test content..."
DATA_URL="data:text/html,<!DOCTYPE html><html><head><title>Data URL Test</title></head><body><h1 id='data-title'>Data URL Test Page</h1><p class='test-paragraph'>This is a test paragraph in a data URL.</p><button id='data-button'>Test Button</button></body></html>"

echo "✅ Data URL created: $DATA_URL"

echo ""
echo "🧪 Testing Instructions:"
echo "========================"
echo ""
echo "1. RELOAD THE EXTENSION:"
echo "   - Go to chrome://extensions/"
echo "   - Find 'Universal Element Locator'"
echo "   - Click the reload button (circular arrow)"
echo ""
echo "2. TEST LOCAL HTML FILE:"
echo "   - Open a new tab and navigate to: file:///tmp/test-local-page.html"
echo "   - If prompted, allow file access for the extension"
echo "   - Click the extension icon and try scanning"
echo "   - Expected: Should work without any 'only works on web pages' warning"
echo ""
echo "3. TEST DATA URL:"
echo "   - Open a new tab and paste the data URL:"
echo "   - $DATA_URL"
echo "   - Click the extension icon and try scanning"
echo "   - Expected: Should work with data URLs"
echo ""
echo "4. TEST REGULAR WEBSITE:"
echo "   - Go to any regular website (e.g., https://example.com)"
echo "   - Click the extension icon and try scanning"
echo "   - Expected: Should work normally"
echo ""
echo "5. TEST BROWSER INTERNAL PAGES (Should be blocked):"
echo "   - Go to chrome://extensions/"
echo "   - Click the extension icon"
echo "   - Expected: Should show appropriate 'not supported' message"
echo ""
echo "🔍 What to Look For:"
echo "==================="
echo "- No 'This extension only works on web pages' warnings"
echo "- Extension should work on http://, https://, file://, and data: URLs"
echo "- Clear error messages for unsupported pages (chrome://, about:, etc.)"
echo "- Proper scanning functionality on all supported page types"
echo ""
echo "📝 Notes:"
echo "========="
echo "- For file:// URLs, you may need to enable 'Allow access to file URLs' in extension settings"
echo "- The extension should now show 'Ready to scan any webpage or HTML file!' in the popup"
echo "- Error messages should be helpful and guide users to supported page types"
