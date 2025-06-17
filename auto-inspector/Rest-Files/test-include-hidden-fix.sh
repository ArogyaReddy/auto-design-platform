#!/bin/bash

# Test includeHidden Parameter Fix
echo "🧪 Testing includeHidden Parameter Fix..."

# Create test page with hidden elements
cat > /Users/arog/ADP/AutoExtractor/browser-extension/test-include-hidden-fix.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Include Hidden Parameter Test</title>
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
        .visible-element {
            background: #e8f5e8;
            padding: 10px;
            margin: 5px 0;
        }
        .hidden-display-none {
            display: none;
            background: #ffebee;
            padding: 10px;
            margin: 5px 0;
        }
        .hidden-visibility-hidden {
            visibility: hidden;
            background: #fff3e0;
            padding: 10px;
            margin: 5px 0;
        }
        .hidden-opacity-zero {
            opacity: 0;
            background: #f3e5f5;
            padding: 10px;
            margin: 5px 0;
        }
        .offscreen {
            position: absolute;
            left: -9999px;
            background: #e0f2f1;
            padding: 10px;
        }
    </style>
</head>
<body>
    <h1>Include Hidden Parameter Test</h1>
    <p>This page tests the includeHidden parameter functionality with various hidden element types.</p>

    <!-- Visible elements -->
    <div class="section">
        <h2>Visible Elements</h2>
        <button id="visible-btn-1" class="visible-element">Visible Button 1</button>
        <input id="visible-input-1" class="visible-element" placeholder="Visible input">
        <div id="visible-div-1" class="visible-element" data-testid="visible-content">Visible div content</div>
    </div>

    <!-- Hidden elements - display: none -->
    <div class="section">
        <h2>Hidden Elements (display: none)</h2>
        <button id="hidden-btn-1" class="hidden-display-none" data-testid="hidden-button">Hidden Button (display: none)</button>
        <input id="hidden-input-1" class="hidden-display-none" placeholder="Hidden input (display: none)">
        <div id="hidden-div-1" class="hidden-display-none" data-testid="hidden-content">Hidden div (display: none)</div>
    </div>

    <!-- Hidden elements - visibility: hidden -->
    <div class="section">
        <h2>Hidden Elements (visibility: hidden)</h2>
        <button id="hidden-btn-2" class="hidden-visibility-hidden" data-testid="visibility-hidden-button">Hidden Button (visibility: hidden)</button>
        <input id="hidden-input-2" class="hidden-visibility-hidden" placeholder="Hidden input (visibility: hidden)">
        <div id="hidden-div-2" class="hidden-visibility-hidden" data-testid="visibility-hidden-content">Hidden div (visibility: hidden)</div>
    </div>

    <!-- Hidden elements - opacity: 0 -->
    <div class="section">
        <h2>Hidden Elements (opacity: 0)</h2>
        <button id="hidden-btn-3" class="hidden-opacity-zero" data-testid="opacity-zero-button">Hidden Button (opacity: 0)</button>
        <input id="hidden-input-3" class="hidden-opacity-zero" placeholder="Hidden input (opacity: 0)">
        <div id="hidden-div-3" class="hidden-opacity-zero" data-testid="opacity-zero-content">Hidden div (opacity: 0)</div>
    </div>

    <!-- Offscreen elements -->
    <div class="section">
        <h2>Offscreen Elements</h2>
        <button id="offscreen-btn" class="offscreen" data-testid="offscreen-button">Offscreen Button</button>
        <input id="offscreen-input" class="offscreen" placeholder="Offscreen input">
        <div id="offscreen-div" class="offscreen" data-testid="offscreen-content">Offscreen div content</div>
    </div>

    <!-- Zero-size elements -->
    <div class="section">
        <h2>Zero-size Elements</h2>
        <button id="zero-size-btn" style="width: 0; height: 0; overflow: hidden;" data-testid="zero-size-button">Zero Size Button</button>
        <div id="zero-size-div" style="width: 0; height: 0; overflow: hidden;" data-testid="zero-size-content">Zero size div</div>
    </div>

    <script>
        console.log('✅ Include Hidden test page loaded');
        console.log('📊 Element counts:');
        console.log('   - Visible elements: 3');
        console.log('   - display:none elements: 3'); 
        console.log('   - visibility:hidden elements: 3');
        console.log('   - opacity:0 elements: 3');
        console.log('   - Offscreen elements: 3');
        console.log('   - Zero-size elements: 2');
        console.log('   - Total: 17 elements (3 visible + 14 hidden)');
    </script>
</body>
</html>
EOF

echo "📄 Created test page: test-include-hidden-fix.html"

echo ""
echo "🔧 Testing Instructions:"
echo "1. Load the extension in Chrome (Developer mode)"
echo "2. Navigate to: file://$(pwd)/test-include-hidden-fix.html"
echo "3. Click the extension icon and scan the page (normal scan)"
echo "4. Note the element count - should be ~3-5 visible elements only"
echo "5. Check the console for debug info about filtering"
echo ""

echo "✅ Expected Results with includeHidden=false (default):"
echo "   - Should find only ~3-5 visible elements"
echo "   - Hidden elements should be filtered out in getAllElementsIncludingShadowDOM"
echo "   - No 'skippedByVisibility' references in console"
echo "   - Debug stats should show: totalChecked, visibleFound, skippedByTag, shadowDOMFound"
echo ""

echo "🎯 Code Verification:"
echo "   - includeHidden parameter is now properly used in getAllElementsIncludingShadowDOM"
echo "   - Visibility filtering happens once in the initial collection"
echo "   - No duplicate visibility checks in the main scanning loop"
echo "   - All references to skippedByVisibility have been removed"
echo ""

# Open the test page
if command -v open >/dev/null 2>&1; then
    echo "🌐 Opening test page..."
    open "file://$(pwd)/test-include-hidden-fix.html"
else
    echo "📋 Test page path: file://$(pwd)/test-include-hidden-fix.html"
fi

echo "✅ includeHidden parameter fix test setup complete!"
