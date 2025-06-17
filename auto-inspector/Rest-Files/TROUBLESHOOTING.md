# 🔧 Extension Troubleshooting Guide

## "Could not establish connection. Receiving end does not exist" Error

This error occurs when the popup cannot communicate with the content script. Here are the solutions:

### 🚀 Quick Fixes (Try These First)

#### 1. Refresh and Retry

- **Refresh the webpage** (Cmd+R or F5)
- **Wait 2-3 seconds** for the page to fully load
- **Click the extension icon** and try scanning again

#### 2. Check Page Type

The extension cannot work on certain pages:

- ❌ `chrome://` pages (Chrome settings, extensions, etc.)
- ❌ `chrome-extension://` pages (other extensions)
- ❌ `file://` pages sometimes have restrictions
- ✅ `http://` and `https://` pages work best

#### 3. Reload the Extension

- Go to `chrome://extensions/`
- Find "Universal Element Locator"
- Click the **reload icon** (🔄)
- Try scanning again

#### 4. Re-inject Content Script

- Open browser console (`F12` → Console tab)
- Paste and run this code:

```javascript
// Manual content script injection test
chrome.runtime.sendMessage({ action: "ping" }, (response) => {
  if (response) {
    console.log("✅ Content script is working:", response);
  } else {
    console.log("❌ Content script not responding - try refreshing page");
  }
});
```

### 🔍 Advanced Debugging

#### Debug Console Commands

Open browser console (`F12`) and run these commands:

```javascript
// 1. Check if content script is loaded
console.log("Content script loaded:", !!window.universalElementLocatorInjected);

// 2. Check locator engine
console.log("Locator engine available:", !!window.universalLocatorEngine);

// 3. Test manual scan (if engine is available)
if (window.universalLocatorEngine) {
  window.universalLocatorEngine
    .scanElements({
      highlightElements: false,
      includeShadowDOM: true,
      includeHidden: false,
    })
    .then((results) => {
      console.log("✅ Manual scan results:", results);
    });
}

// 4. Check DOM elements
console.log(
  "Elements with data-testid:",
  document.querySelectorAll("[data-testid]").length
);
console.log("Elements with id:", document.querySelectorAll("[id]").length);
```

#### Extension Console Debugging

1. Go to `chrome://extensions/`
2. Click **"Service Worker"** under the extension
3. Check for error messages in the background console

#### Popup Console Debugging

1. Right-click the extension icon
2. Select **"Inspect popup"**
3. Check Console tab for errors

### 🛠️ Common Solutions

#### Issue: Content Script Not Loading

**Symptoms**: Extension popup works but scan fails immediately

**Solutions**:

1. Check manifest.json permissions:

```json
"permissions": ["activeTab", "scripting", "storage"],
"host_permissions": ["http://*/*", "https://*/*"]
```

2. Verify content script is declared:

```json
"content_scripts": [{
  "matches": ["<all_urls>"],
  "js": ["content.js"],
  "run_at": "document_end"
}]
```

3. Manual injection via popup (already implemented):

```javascript
await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  files: ["content.js"],
});
```

#### Issue: Page Access Denied

**Symptoms**: Error mentions "Cannot access" or "Extension context invalidated"

**Solutions**:

1. Navigate to a regular website (not chrome:// pages)
2. Ensure extension has proper permissions
3. Check if page has strict Content Security Policy (CSP)

#### Issue: Extension Context Invalidated

**Symptoms**: Error after extension reload/update

**Solutions**:

1. Close the popup completely
2. Refresh the webpage
3. Open popup again and retry

#### Issue: Scan Takes Too Long / Freezes

**Symptoms**: Scan button shows "Scanning..." indefinitely

**Solutions**:

1. Check page complexity (large pages take longer)
2. Disable "Include hidden elements" for faster scans
3. Refresh page and try again

### 📊 Performance Optimization

#### For Large Pages (500+ elements):

- Disable visual highlighting for faster scans
- Use "Include hidden elements" sparingly
- Consider scanning specific page sections

#### Expected Performance:

- **Small pages** (<100 elements): 50-100ms
- **Medium pages** (100-500 elements): 200-500ms
- **Large pages** (500+ elements): 1-3 seconds
- **Very large pages** (1000+ elements): 3-10 seconds

### 🔒 Security Considerations

#### If Extension Doesn't Work on Certain Sites:

Some websites block content scripts with:

- Strict Content Security Policy (CSP)
- Cross-origin restrictions
- iframe sandbox attributes

**Workaround**: Use the extension on similar but less restricted pages.

### 🧪 Test Page Validation

Use our test page to verify everything works:

```bash
# Open the test page
open /Users/arog/ADP/AutoExtractor/browser-extension/test-page.html
```

**Expected Results on Test Page**:

- Total Elements: 40-60
- Primary Locators: 15-25
- Secondary Locators: 20-35
- Scan Duration: <200ms
- No errors in console

### 📞 Still Having Issues?

#### Quick Checklist:

- [ ] Extension properly loaded in `chrome://extensions/`
- [ ] Developer mode is enabled
- [ ] Extension has permissions granted
- [ ] Testing on `http://` or `https://` page (not `chrome://`)
- [ ] Page is fully loaded before scanning
- [ ] Browser console shows no extension errors

#### Get More Help:

1. **Run Debug Script**: Use `/debug.js` in browser console
2. **Check Logs**: Look at extension background console
3. **Test Manual**: Try manual element scanning in console
4. **Reload Everything**: Extension, page, and browser if needed

#### Report Issues:

If problems persist, gather this info:

- Browser version: Chrome version
- Extension version: 1.0.0
- Page URL where issue occurs
- Console error messages
- Steps to reproduce

---

**Most connection issues are resolved by refreshing the page and ensuring you're not on a Chrome internal page.** 🎯
