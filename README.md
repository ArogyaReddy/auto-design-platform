# Auto-Design Platform

A comprehensive testing automation platform that provides multiple tools for creating, running, and managing end-to-end tests using Playwright and Cucumber.

## Components

### 🎯 [auto-design](./auto-design/)

**AI-Free Test Generation Platform**

- Generate Playwright tests from JIRA stories, text descriptions, images, and user recordings
- Support for multiple input methods: CLI and interactive UI
- Robust text analysis for converting natural language to test steps
- Templates for features, page objects, steps, and tests

### 🏃 [auto-runner](./auto-runner/)

**Advanced Test Execution Framework**

- Self-healing locators with automatic element recovery
- Multi-project support with organized test structure
- Comprehensive reporting and dashboard
- Data-driven testing capabilities

### 🔍 [auto-inspector](./auto-inspector/)

**Browser Extension for Element Analysis**

- Chrome extension for analyzing web page elements
- Smart selector generation and validation
- Element highlighting and inspection tools
- Shadow DOM support and compatibility

### 🎛️ [auto-filler](./auto-filler/)

**Smart Form Auto-Filling Extension**

- Intelligent form field detection and filling
- Machine learning-based field suggestions
- Playwright integration for test automation
- Scoring system for field matching accuracy

### 💻 [auto-coder](./auto-coder/)

**Code Generation and Analysis Tools**

- Advanced code generation strategies
- Template-based test creation
- Strategy pattern implementation for different input types
- Comprehensive error handling and validation

## Quick Start

### Prerequisites

- Node.js 16 or higher
- Chrome browser (for extensions)
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/auto-design-platform.git
cd auto-design-platform
```

2. Install dependencies for each component:

```bash
# Auto-Design Platform
cd auto-design && npm install && cd ..

# Auto-Runner Framework
cd auto-runner && npm install && cd ..

# Auto-Coder Tools
cd auto-coder && npm install && cd ..
```

3. Install browser extensions:

```bash
# Load auto-inspector and auto-filler as unpacked extensions in Chrome
# Navigate to chrome://extensions/, enable Developer mode, and load the respective folders
```

## Usage Examples

### Generate Tests from Text Description

```bash
cd auto-design
node run.js
# Select option 2: Generate from summary/text file
# Enter your test description
```

### Generate Tests from JIRA Story

```bash
cd auto-design
node run.js
# Select option 3: Generate from JIRA story
# Provide JIRA story text or file path
```

### Run Generated Tests

```bash
cd auto-runner
npm test
# Or use the dashboard: npm run dashboard
```

### Use Browser Extensions

1. Load `auto-inspector` in Chrome to analyze page elements
2. Load `auto-filler` to auto-fill forms during testing
3. Use both extensions together for comprehensive test creation

## Features

### ✨ Test Generation

- **Multiple Input Methods**: JIRA stories, text summaries, images, recordings
- **Natural Language Processing**: Convert human-readable descriptions to test steps
- **Template-Based Generation**: Consistent, maintainable test structure
- **AI-Free Operation**: No external AI dependencies, fully deterministic

### 🔧 Test Execution

- **Self-Healing Locators**: Automatic element recovery when selectors fail
- **Multi-Project Support**: Organize tests by project or feature
- **Data-Driven Testing**: JSON-based test data management
- **Comprehensive Reporting**: Detailed execution reports and dashboards

### 🛠️ Development Tools

- **Element Inspector**: Analyze and extract selectors from web pages
- **Form Auto-Filler**: Speed up test data entry and form filling
- **Code Generation**: Automated creation of page objects and step definitions
- **Template System**: Customizable templates for different test patterns

## Architecture

The platform follows a modular architecture with clear separation of concerns:

```
auto-design-platform/
├── auto-design/     # Core test generation engine
├── auto-runner/     # Test execution framework
├── auto-inspector/  # Browser extension for element analysis
├── auto-filler/     # Form auto-filling extension
└── auto-coder/      # Code generation utilities
```

Each component can be used independently or together as part of the complete platform.

## Documentation

- [Auto-Design README](./auto-design/README.md) - Test generation platform
- [Auto-Runner README](./auto-runner/README.md) - Test execution framework
- [Auto-Inspector Guide](./auto-inspector/Rest-Files/README.md) - Browser extension usage
- [Auto-Filler Guide](./auto-filler/md/AUTO_FILLER_GUIDE.md) - Form filling extension

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or contributions, please:

1. Check the documentation in each component's folder
2. Search existing issues in the GitHub repository
3. Create a new issue with detailed information about your problem or suggestion

---

**Built with ❤️ for the testing automation community**
