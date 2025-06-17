#!/bin/bash

# Test Shadow DOM Prefix Removal and Highlighting Fix
echo "🧪 Testing Shadow DOM Prefix Removal and Highlighting Fix..."

# Create test page specifically for this fix
cat > /Users/arog/ADP/AutoExtractor/browser-extension/test-shadow-dom-highlight-fix.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shadow DOM Highlight Fix Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            padding: 20px; 
            line-height: 1.6;
        }
        .section { 
            margin: 20px 0; 
            padding: 15px; 
            border: 1px solid #ddd; 
            border-radius: 8px;
        }
        .shadow-container { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 5px;
            margin: 10px 0;
        }
        .regular-element {
            background: #e3f2fd;
            padding: 10px;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <h1>Shadow DOM Highlight Fix Test</h1>
    <p>This page tests that Shadow DOM elements no longer have "/* Shadow DOM */" prefix in selectors and can be highlighted properly.</p>

    <!-- Regular DOM elements for comparison -->
    <div class="section">
        <h2>Regular DOM Elements</h2>
        <button id="regular-btn" class="btn-primary" data-testid="regular-button">Regular Button</button>
        <input id="regular-input" class="form-control" placeholder="Regular input">
        <div class="regular-element">Regular div element</div>
    </div>

    <!-- Shadow DOM elements -->
    <div class="section">
        <h2>Shadow DOM Elements</h2>
        <div id="shadow-host-1" class="shadow-container">
            <p>Shadow Host 1 - check inner elements</p>
        </div>
        <div id="shadow-host-2" class="shadow-container">
            <p>Shadow Host 2 - check inner elements</p>
        </div>
        <div id="shadow-host-3" class="shadow-container">
            <p>Shadow Host 3 - nested shadow content</p>
        </div>
    </div>

    <!-- Regular elements for more testing -->
    <div class="section">
        <h2>More Test Elements</h2>
        <form id="test-form">
            <label for="test-email">Email:</label>
            <input type="email" id="test-email" name="email" data-testid="email-input">
            
            <label for="test-select">Select:</label>
            <select id="test-select" name="choice" data-testid="choice-select">
                <option value="1">Option 1</option>
                <option value="2">Option 2</option>
            </select>
            
            <button type="submit" id="submit-btn" data-testid="submit-action">Submit</button>
        </form>
    </div>

    <script>
        // Create Shadow DOM content with various element types
        const shadowHost1 = document.getElementById('shadow-host-1');
        const shadow1 = shadowHost1.attachShadow({mode: 'open'});
        shadow1.innerHTML = `
            <style>
                .shadow-content { 
                    background: #fff3cd; 
                    padding: 10px; 
                    border-radius: 5px;
                }
                button { 
                    background: #007bff; 
                    color: white; 
                    padding: 8px 12px; 
                    border: none;
                    border-radius: 4px;
                    margin: 5px;
                    cursor: pointer;
                }
                input {
                    padding: 5px;
                    margin: 5px;
                    border: 1px solid #ccc;
                    border-radius: 3px;
                }
            </style>
            <div class="shadow-content">
                <h3>Shadow DOM Content 1</h3>
                <button id="shadow-btn-1" data-shadow="true" class="shadow-button">Shadow Button 1</button>
                <input type="text" id="shadow-input-1" placeholder="Shadow input 1" data-testid="shadow-text">
                <div class="nested-shadow" data-role="container">
                    <span>Shadow span content</span>
                </div>
            </div>
        `;

        const shadowHost2 = document.getElementById('shadow-host-2');
        const shadow2 = shadowHost2.attachShadow({mode: 'open'});
        shadow2.innerHTML = `
            <style>
                .shadow-content { 
                    background: #d1ecf1; 
                    padding: 10px; 
                    border-radius: 5px;
                }
                .action-btn {
                    background: #28a745;
                    color: white;
                    padding: 6px 10px;
                    border: none;
                    border-radius: 3px;
                    margin: 3px;
                }
            </style>
            <div class="shadow-content">
                <h3>Shadow DOM Content 2</h3>
                <button id="shadow-btn-2" class="action-btn" data-testid="action-menu-button">Action Menu</button>
                <button id="shadow-btn-3" class="action-btn" data-testid="action-menu-button">Another Action</button>
                <div class="nested-shadow">
                    <p>Nested paragraph in shadow</p>
                    <input type="password" id="shadow-password" placeholder="Shadow password">
                </div>
            </div>
        `;

        const shadowHost3 = document.getElementById('shadow-host-3');
        const shadow3 = shadowHost3.attachShadow({mode: 'open'});
        shadow3.innerHTML = `
            <style>
                .deeply-nested { 
                    background: #f8d7da; 
                    padding: 8px; 
                    margin: 5px;
                    border-radius: 4px;
                }
            </style>
            <div class="shadow-content">
                <h3>Shadow DOM Content 3 - Deeply Nested</h3>
                <div class="deeply-nested">
                    <div class="level-2">
                        <div class="level-3">
                            <button id="deep-shadow-btn" data-testid="deep-action" class="deep-button">Deep Shadow Button</button>
                            <span class="deep-text">Deep shadow text</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        console.log('✅ Shadow DOM test page loaded successfully');
        console.log('📋 Test Elements Created:');
        console.log('   - Regular DOM: #regular-btn, #regular-input, .regular-element');
        console.log('   - Shadow DOM 1: #shadow-btn-1, #shadow-input-1, .nested-shadow');
        console.log('   - Shadow DOM 2: #shadow-btn-2, #shadow-btn-3, #shadow-password');
        console.log('   - Shadow DOM 3: #deep-shadow-btn, .deep-text');
    </script>
</body>
</html>
EOF

echo "📄 Created test page: test-shadow-dom-highlight-fix.html"

echo ""
echo "🔧 Testing Instructions:"
echo "1. Load the extension in Chrome (Developer mode)"
echo "2. Navigate to: file://$(pwd)/test-shadow-dom-highlight-fix.html"
echo "3. Click the extension icon and scan the page"
echo "4. In the results page, verify:"
echo "   ✓ Shadow DOM elements do NOT have '/* Shadow DOM */' prefix in selectors"
echo "   ✓ All selectors are clean (e.g., '#shadow-btn-1' not '/* Shadow DOM */ #shadow-btn-1')"
echo "   ✓ Click the 🎯 highlight button next to any locator"
echo "   ✓ Switch back to the test page tab"
echo "   ✓ Verify the element is highlighted with green outline"
echo "   ✓ Test both regular DOM and Shadow DOM element highlighting"
echo ""

echo "🎯 Specific Elements to Test Highlighting:"
echo "   - Regular: #regular-btn, #regular-input"
echo "   - Shadow DOM: #shadow-btn-1, #shadow-btn-2, #deep-shadow-btn"
echo "   - Data attributes: [data-testid=\"action-menu-button\"]"
echo ""

echo "✅ Expected Results:"
echo "   - All selectors should be clean without '/* Shadow DOM */' prefix"
echo "   - Highlighting should work for both regular and Shadow DOM elements"
echo "   - Toast notifications should appear when highlighting"
echo "   - Elements should have green outline and shadow when highlighted"
echo ""

# Open the test page
if command -v open >/dev/null 2>&1; then
    echo "🌐 Opening test page..."
    open "file://$(pwd)/test-shadow-dom-highlight-fix.html"
else
    echo "📋 Test page path: file://$(pwd)/test-shadow-dom-highlight-fix.html"
fi

echo "✅ Shadow DOM prefix removal and highlighting fix test setup complete!"
