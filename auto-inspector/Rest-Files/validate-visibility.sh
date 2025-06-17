#!/bin/bash

# Final validation script for visibility filtering
echo "🎯 Final Visibility Validation Script"
echo "====================================="
echo

echo "This script validates that the Universal Element Locator extension"
echo "correctly captures and locates ONLY visible elements."
echo

# Open the test page
echo "🌐 Opening visibility test page..."
open "file:///Users/arog/ADP/AutoExtractor/browser-extension/visibility-test.html"

echo
echo "📋 Quick Validation Checklist:"
echo
echo "1️⃣  Load the extension and scan the test page"
echo "2️⃣  Verify these elements ARE captured:"
echo "    ✅ Main title (h1#main-title)"
echo "    ✅ Section header (h2#section-visible)"
echo "    ✅ Visible paragraph (p#visible-text)"
echo "    ✅ Submit button (button#primary-btn)"
echo "    ✅ Cancel button (button#secondary-btn)"
echo "    ✅ Username input (input#username)"
echo "    ✅ Email input (input#email)"
echo "    ✅ Country select (select#country)"
echo "    ✅ Comments textarea (textarea#comments)"
echo "    ✅ Feature list items (.feature-item)"
echo "    ✅ Footer text (.footer-text)"
echo
echo "3️⃣  Verify these elements are NOT captured:"
echo "    🚫 'This text is hidden with display: none'"
echo "    🚫 'This text is hidden with visibility: hidden'"
echo "    🚫 'This text is hidden with opacity: 0'"
echo "    🚫 'This text has zero size'"
echo "    🚫 'This text is positioned offscreen'"
echo "    🚫 JavaScript code (console.log, function, var, etc.)"
echo
echo "4️⃣  Check locator quality:"
echo "    ✅ Primary locators: IDs, data attributes, name attributes"
echo "    ✅ Secondary locators: classes, aria-labels, types, placeholders"
echo "    ✅ Fallback locators: tag names, positions"
echo
echo "5️⃣  Validate text content:"
echo "    ✅ Clean, meaningful text (no code snippets)"
echo "    ✅ Reasonable length (not truncated unnecessarily)"
echo "    ✅ No JavaScript patterns in displayed text"
echo

echo "🔧 Browser Console Commands for Debugging:"
echo "=========================================="
echo
echo "// Count total elements on page"
echo "document.querySelectorAll('*').length"
echo
echo "// Count elements that should be visible"
echo "Array.from(document.querySelectorAll('*')).filter(el => {"
echo "  if (['SCRIPT', 'STYLE', 'META', 'LINK', 'HEAD', 'TITLE'].includes(el.tagName)) return false;"
echo "  const style = getComputedStyle(el);"
echo "  const rect = el.getBoundingClientRect();"
echo "  return style.display !== 'none' && "
echo "         style.visibility !== 'hidden' && "
echo "         parseFloat(style.opacity) !== 0 && "
echo "         rect.width > 0 && rect.height > 0;"
echo "}).length"
echo
echo "// Verify specific test elements are visible"
echo "const testElements = ['#main-title', '#visible-text', '#primary-btn', '#username'];"
echo "testElements.forEach(sel => {"
echo "  const el = document.querySelector(sel);"
echo "  const style = getComputedStyle(el);"
echo "  console.log(sel, 'visible:', style.display !== 'none' && style.visibility !== 'hidden');"
echo "});"
echo
echo "// Check for hidden elements"
echo "const hiddenSelectors = ['.hidden-display', '.hidden-visibility', '.hidden-opacity'];"
echo "hiddenSelectors.forEach(sel => {"
echo "  const els = document.querySelectorAll(sel);"
echo "  console.log(sel, 'count:', els.length, 'should be filtered out');"
echo "});"
echo

echo "📊 Expected Results Summary:"
echo "============================="
echo "Total elements on test page: ~100+"
echo "Visible elements (after filtering): ~25-35"
echo "Elements with IDs: ~10-15"
echo "Elements with classes: ~20-30"
echo "Elements with data attributes: ~8-12"
echo

echo "✅ If all checks pass, the visibility filtering is working correctly!"
echo "❌ If any hidden elements appear in results, review the isElementVisible function."
echo "🔧 If JavaScript code appears in text, review the getCleanText function."
echo

echo "Press Enter when validation is complete..."
read
echo "🎉 Visibility validation completed!"
