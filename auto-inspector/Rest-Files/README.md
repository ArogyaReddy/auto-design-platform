# Universal Element Locator - Browser Extension

A powerful Chrome extension that can scan and generate locators for any web elements on any page, including Shadow DOM elements. Built with the Universal Element Locator Library.

## 🚀 Features

- **Universal Element Scanning**: Analyze all elements on any webpage
- **Multi-Strategy Locators**: Generate primary, secondary, and fallback locators
- **Shadow DOM Support**: Detect and handle Shadow DOM elements
- **Visual Highlighting**: See elements highlighted during scanning
- **Cross-Tool Compatibility**: Generate selectors for Playwright and Selenium
- **Detailed Results**: View comprehensive scan results with statistics
- **Export Functionality**: Export results to JSON or CSV
- **Real-Time Statistics**: Track scan performance and element counts

## 📦 Installation

### From Source (Development)

1. **Clone the repository**:

   ```bash
   git clone [repository-url]
   cd AutoExtractor/browser-extension
   ```

2. **Load in Chrome**:

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `browser-extension` folder

3. **Pin the Extension**:
   - Click the extensions icon (puzzle piece) in Chrome toolbar
   - Find "Universal Element Locator" and click the pin icon

### From Chrome Web Store

_(Coming soon)_

## 🎯 Usage

### Quick Start

1. **Navigate to any webpage** you want to analyze
2. **Click the extension icon** in your Chrome toolbar
3. **Configure scan options**:
   - ✅ Highlight elements during scan
   - ✅ Include Shadow DOM elements
   - ⬜ Include hidden elements
4. **Click "🔍 Scan Page Elements"**
5. **View results** in the popup or click "📋 View Results" for detailed analysis

### Scan Options

- **Highlight Elements**: Visually highlight each element as it's scanned
- **Include Shadow DOM**: Scan elements inside Shadow DOM components
- **Include Hidden**: Include elements that are not visible (display:none, etc.)

### Understanding Results

#### Statistics Dashboard

- **Total Elements**: Number of scannable elements found
- **Primary Locators**: Elements with high-confidence selectors (data-testid, id, etc.)
- **Secondary Locators**: Elements with medium-confidence selectors (class, text, etc.)
- **Shadow DOM**: Elements found within Shadow DOM

#### Confidence Levels

- 🟢 **High (≥80%)**: Primary locators (data-testid, id, name, aria-label)
- 🟡 **Medium (60-79%)**: Secondary locators (class, placeholder, text)
- 🔴 **Low (<60%)**: Fallback locators (xpath, nth-child)

## 📊 Generated Locators

### Primary Locators (Highest Confidence)

- `data-testid` attributes
- `id` attributes
- `name` attributes
- `aria-label` attributes

### Secondary Locators (Medium Confidence)

- CSS class selectors
- `placeholder` attributes
- Text content selectors
- Input type selectors

### Fallback Locators (Lower Confidence)

- XPath expressions
- CSS nth-child selectors
- Tag name selectors

## 🔧 Technical Details

### Architecture

```
browser-extension/
├── manifest.json          # Extension configuration
├── popup.html            # Extension popup UI
├── popup.js              # Popup logic and communication
├── content.js            # Content script for page interaction
├── background.js         # Background service worker
├── locator-engine.js     # Core locator generation engine
├── content.css          # Styling for page overlays
├── results.html         # Detailed results page
└── icons/               # Extension icons
```

### Key Components

1. **Content Script (`content.js`)**:

   - Scans DOM elements on the active page
   - Handles Shadow DOM traversal
   - Applies visual highlighting
   - Communicates with popup

2. **Locator Engine (`locator-engine.js`)**:

   - Generates multiple locator strategies
   - Calculates confidence scores
   - Handles cross-tool compatibility
   - Processes element attributes

3. **Popup Interface (`popup.html/js`)**:

   - Provides user controls
   - Displays scan statistics
   - Manages data export
   - Links to detailed results

4. **Results Page (`results.html`)**:
   - Detailed element analysis
   - Filtering and search
   - Pagination for large datasets
   - CSV export functionality

### Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Edge (Chromium-based)
- ⏳ Firefox (planned)
- ⏳ Safari (planned)

## 🎨 UI Features

### Popup Interface

- **Gradient Design**: Modern purple/blue gradient theme
- **Real-time Stats**: Live updating scan statistics
- **Progress Indicators**: Visual feedback during scanning
- **Export Options**: JSON and CSV download capabilities

### Results Page

- **Responsive Layout**: Works on all screen sizes
- **Advanced Filtering**: Search by tag, confidence, content
- **Pagination**: Handle large datasets efficiently
- **Interactive Elements**: Hover effects and tooltips

## 🔍 Advanced Features

### Shadow DOM Handling

The extension can detect and analyze elements within Shadow DOM:

- Traverses shadow roots automatically
- Generates specialized selectors for shadow elements
- Marks shadow elements in results with 🌑 indicator

### Element Analysis

For each element, the extension captures:

- Tag name and attributes
- Position and dimensions
- Text content (truncated)
- Visibility status
- Shadow DOM status
- Generated XPath

### Performance Optimization

- Efficient DOM traversal algorithms
- Progressive scanning with progress updates
- Memory-conscious element processing
- Optimized highlighting animations

## 📈 Performance Metrics

Typical performance on various page types:

- **Simple Pages** (< 100 elements): ~50-100ms
- **Medium Pages** (100-500 elements): ~200-500ms
- **Complex Pages** (500+ elements): ~1-3 seconds
- **Heavy SPAs** (1000+ elements): ~3-10 seconds

## 🛠️ Development

### Building from Source

1. **Clone the repository**
2. **Install dependencies** (for main library):
   ```bash
   npm install
   ```
3. **Test the extension**:
   - Load in Chrome as unpacked extension
   - Test on various websites
   - Check console for any errors

### File Structure

```javascript
// Key files and their purpose:
manifest.json; // Extension metadata and permissions
popup.html / js; // Main user interface
content.js; // Page analysis logic
locator - engine.js; // Core locator generation
background.js; // Extension lifecycle management
results.html; // Detailed results viewer
```

### Testing

Test the extension on various types of websites:

- Static HTML pages
- React/Vue/Angular SPAs
- Sites with Shadow DOM (Polymer, LitElement)
- Complex forms and interactive elements
- Pages with iframes

## 🐛 Troubleshooting

### Common Issues

**Extension not working on some sites**:

- Check if site blocks content scripts
- Verify extension permissions are granted
- Look for CSP (Content Security Policy) restrictions

**Scan results missing elements**:

- Try enabling "Include hidden elements"
- Check if elements are inside iframes
- Verify Shadow DOM scanning is enabled

**Performance issues**:

- Large pages may take longer to scan
- Consider scanning specific sections
- Check browser memory usage

**Highlighting not visible**:

- Elements may be off-screen
- Check if page CSS overrides extension styles
- Try refreshing the page and rescanning

### Debug Mode

Enable debug logging by opening browser console:

```javascript
// In browser console, set debug mode
localStorage.setItem("universalLocatorDebug", "true");
```

## 🔒 Privacy & Security

- **No Data Collection**: Extension doesn't send data to external servers
- **Local Storage Only**: All results stored locally in browser
- **Minimal Permissions**: Only requests necessary permissions
- **Open Source**: All code is publicly auditable

## 📄 License

This extension is part of the Universal Element Locator Library project.
See the main project LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: See main project README
- **Community**: Join our discussions

---

**Happy Element Locating! 🎯**
