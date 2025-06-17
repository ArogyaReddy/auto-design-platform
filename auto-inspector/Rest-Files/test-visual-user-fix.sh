#!/bin/bash

# Test Visual User Link Capture
echo "🔍 Testing 'visual_user' Link Capture Fix..."
echo "=============================================="

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create a simple test page focusing on the issue
cat > test-visual-user-link.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual User Link Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            line-height: 1.6;
        }
        .visual-user-link {
            color: blue;
            text-decoration: underline;
            display: inline;
            visibility: visible;
            opacity: 1;
        }
        .test-links {
            margin: 20px 0;
        }
        .test-links a {
            margin: 0 10px;
            color: #007bff;
            text-decoration: none;
        }
        .test-links a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <h1>Visual User Link Test</h1>
    <p>Testing if the 'visual_user' link gets captured and highlighted:</p>
    
    <div class="test-links">
        <a href="#" class="visual-user-link">visual_user</a>
        <a href="/test1">Test Link 1</a>
        <a href="/test2">Test Link 2</a>
        <a href="/test3">Test Link 3</a>
    </div>
    
    <p>All four links above should be captured and highlighted during scan.</p>
    
    <script>
        // Track highlighting
        let highlightedElements = [];
        
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    const element = mutation.target;
                    if (element.style.backgroundColor && element.style.backgroundColor.includes('rgb')) {
                        const elementInfo = {
                            tag: element.tagName,
                            text: element.textContent?.trim(),
                            id: element.id,
                            class: element.className,
                            href: element.href
                        };
                        highlightedElements.push(elementInfo);
                        console.log('Element highlighted:', elementInfo);
                        
                        // Special check for visual_user
                        if (element.textContent?.trim() === 'visual_user') {
                            console.log('✅ SUCCESS: visual_user link was highlighted!');
                        }
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['style']
        });
        
        // Helper function to check results
        window.checkVisualUserCapture = function() {
            console.log('=== VISUAL USER CAPTURE TEST ===');
            console.log('Total highlighted elements:', highlightedElements.length);
            
            const visualUserHighlighted = highlightedElements.some(el => 
                el.text === 'visual_user'
            );
            
            const allLinks = document.querySelectorAll('a');
            console.log('Total links on page:', allLinks.length);
            console.log('Expected highlights: 4 links');
            console.log('Actual highlights:', highlightedElements.filter(el => el.tag === 'A').length);
            
            if (visualUserHighlighted) {
                console.log('✅ SUCCESS: visual_user link was captured and highlighted');
            } else {
                console.log('❌ FAILURE: visual_user link was NOT captured/highlighted');
                
                // Debug the element
                const visualUserEl = document.querySelector('.visual-user-link');
                if (visualUserEl) {
                    console.log('Element exists:', visualUserEl);
                    console.log('Computed styles:', {
                        display: getComputedStyle(visualUserEl).display,
                        visibility: getComputedStyle(visualUserEl).visibility,
                        opacity: getComputedStyle(visualUserEl).opacity
                    });
                    console.log('Bounding rect:', visualUserEl.getBoundingClientRect());
                } else {
                    console.log('Element not found in DOM');
                }
            }
            
            return {
                success: visualUserHighlighted,
                totalHighlighted: highlightedElements.length,
                expectedLinks: allLinks.length,
                highlightedLinks: highlightedElements.filter(el => el.tag === 'A').length
            };
        };
        
        // Auto-run check after 3 seconds (time for scan to complete)
        setTimeout(() => {
            console.log('Auto-running visual_user capture check...');
            window.checkVisualUserCapture();
        }, 3000);
    </script>
</body>
</html>
EOF

echo "📱 Opening focused test page..."
open -a "Google Chrome" --args --load-extension="$SCRIPT_DIR" "file://$SCRIPT_DIR/test-visual-user-link.html"

echo ""
echo "🔍 TESTING STEPS:"
echo "=================="
echo "1. Wait for page to load completely"
echo "2. Click extension icon"
echo "3. Click 'Scan with Highlighting'"
echo "4. Watch console for highlighting messages"
echo "5. After scan, run: checkVisualUserCapture()"
echo "6. Look for '✅ SUCCESS: visual_user link was highlighted' message"
echo ""
echo "🎯 Expected Result:"
echo "==================="
echo "- All 4 links should be highlighted in green"
echo "- Console should show 'visual_user link was highlighted'"
echo "- checkVisualUserCapture() should return success: true"
echo ""
echo "📋 Debug Commands (if test fails):"
echo "===================================="
echo "// Check element visibility manually"
echo "const el = document.querySelector('.visual-user-link');"
echo "console.log('Element:', el);"
echo "console.log('Styles:', getComputedStyle(el));"
echo "console.log('Rect:', el.getBoundingClientRect());"
echo ""

sleep 2
echo "✅ Test ready. Please perform the scan and check results."
