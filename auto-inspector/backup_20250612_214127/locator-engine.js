// Enhanced locator engine for browser extension
// This is a simplified version of our Universal Element Locator for browser use

(function() {
  'use strict';

  if (window.universalLocatorEngine) {
    return; // Already loaded
  }

  window.universalLocatorEngine = {
    version: '1.0.0',
    
    // Main scanning function
    async scanElements(options = {}) {
      const startTime = performance.now();
      const results = {
        elements: [],
        statistics: {
          total: 0,
          withPrimary: 0,
          withSecondary: 0,
          shadowDOM: 0,
          byTag: {},
          confidence: { high: 0, medium: 0, low: 0 }
        },
        options: options,
        timestamp: new Date().toISOString()
      };

      try {
        const elements = this.getAllElements(options);
        console.log(`🔍 Found ${elements.length} elements to analyze`);

        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const elementData = this.analyzeElement(element, i);
          
          if (elementData) {
            results.elements.push(elementData);
            this.updateStatistics(results.statistics, elementData);
            
            if (options.highlightElements) {
              this.highlightElement(element, elementData.confidence);
            }
          }
        }

        results.statistics.total = results.elements.length;
        const endTime = performance.now();
        results.duration = Math.round(endTime - startTime);

        console.log(`✅ Scan completed in ${results.duration}ms`);
        return results;

      } catch (error) {
        console.error('❌ Scan failed:', error);
        throw error;
      }
    },

    getAllElements(options) {
      const elements = [];
      const seen = new WeakSet();

      // Get all elements from main document
      const allElements = document.querySelectorAll('*');
      
      for (const element of allElements) {
        if (seen.has(element)) continue;
        seen.add(element);

        // Skip unwanted elements
        if (this.shouldSkipElement(element, options)) {
          continue;
        }

        elements.push(element);

        // Handle Shadow DOM
        if (options.includeShadowDOM && element.shadowRoot) {
          const shadowElements = this.getShadowElements(element.shadowRoot, seen);
          elements.push(...shadowElements);
        }
      }

      return elements;
    },

    getShadowElements(shadowRoot, seen) {
      const elements = [];
      const shadowElements = shadowRoot.querySelectorAll('*');
      
      for (const element of shadowElements) {
        if (!seen.has(element)) {
          seen.add(element);
          if (!this.shouldSkipElement(element, { includeHidden: true })) {
            elements.push(element);
          }
        }
      }
      
      return elements;
    },

    shouldSkipElement(element, options) {
      // Skip certain tag types
      const skipTags = ['SCRIPT', 'STYLE', 'META', 'HEAD', 'TITLE', 'LINK'];
      if (skipTags.includes(element.tagName)) {
        return true;
      }

      // Skip hidden elements if not requested
      if (!options.includeHidden && !this.isVisible(element)) {
        return true;
      }

      return false;
    },

    isVisible(element) {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             style.opacity !== '0' &&
             rect.width > 0 && 
             rect.height > 0;
    },

    analyzeElement(element, index) {
      const locators = this.generateLocators(element);
      
      // Skip elements with no useful locators
      if (this.getTotalLocators(locators) === 0) {
        return null;
      }

      return {
        index: index,
        tagName: element.tagName.toLowerCase(),
        locators: locators,
        confidence: this.calculateConfidence(locators),
        attributes: this.getAttributes(element),
        text: this.getText(element),
        rect: this.getRect(element),
        visible: this.isVisible(element),
        shadowDOM: this.isInShadowDOM(element),
        xpath: this.generateXPath(element),
        selector: this.getBestSelector(locators)
      };
    },

    generateLocators(element) {
      const locators = {
        primary: [],
        secondary: [],
        fallback: []
      };

      // PRIMARY LOCATORS
      this.addDataTestId(element, locators.primary);
      this.addId(element, locators.primary);
      this.addName(element, locators.primary);
      this.addAriaLabel(element, locators.primary);

      // SECONDARY LOCATORS
      this.addClass(element, locators.secondary);
      this.addPlaceholder(element, locators.secondary);
      this.addText(element, locators.secondary);
      this.addType(element, locators.secondary);

      // FALLBACK LOCATORS
      this.addXPath(element, locators.fallback);
      this.addNthChild(element, locators.fallback);
      this.addTagSelector(element, locators.fallback);

      return locators;
    },

    // PRIMARY LOCATOR GENERATORS
    addDataTestId(element, locators) {
      const testId = element.getAttribute('data-testid');
      if (testId) {
        locators.push({
          type: 'data-testid',
          selector: `[data-testid="${testId}"]`,
          playwright: `[data-testid="${testId}"]`,
          selenium: `By.cssSelector('[data-testid="${testId}"]')`,
          confidence: 0.95
        });
      }
    },

    addId(element, locators) {
      if (element.id) {
        locators.push({
          type: 'id',
          selector: `#${element.id}`,
          playwright: `#${element.id}`,
          selenium: `By.id('${element.id}')`,
          confidence: 0.9
        });
      }
    },

    addName(element, locators) {
      const name = element.getAttribute('name');
      if (name) {
        locators.push({
          type: 'name',
          selector: `[name="${name}"]`,
          playwright: `[name="${name}"]`,
          selenium: `By.name('${name}')`,
          confidence: 0.85
        });
      }
    },

    addAriaLabel(element, locators) {
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel) {
        locators.push({
          type: 'aria-label',
          selector: `[aria-label="${ariaLabel}"]`,
          playwright: `[aria-label="${ariaLabel}"]`,
          selenium: `By.cssSelector('[aria-label="${ariaLabel}"]')`,
          confidence: 0.8
        });
      }
    },

    // SECONDARY LOCATOR GENERATORS
    addClass(element, locators) {
      if (element.className && typeof element.className === 'string') {
        const classes = element.className.trim().split(/\s+/);
        if (classes.length > 0 && classes.length <= 3) {
          const classSelector = '.' + classes.join('.');
          locators.push({
            type: 'class',
            selector: `${element.tagName.toLowerCase()}${classSelector}`,
            playwright: `${element.tagName.toLowerCase()}${classSelector}`,
            selenium: `By.cssSelector('${element.tagName.toLowerCase()}${classSelector}')`,
            confidence: 0.7
          });
        }
      }
    },

    addPlaceholder(element, locators) {
      const placeholder = element.getAttribute('placeholder');
      if (placeholder) {
        locators.push({
          type: 'placeholder',
          selector: `[placeholder="${placeholder}"]`,
          playwright: `[placeholder="${placeholder}"]`,
          selenium: `By.cssSelector('[placeholder="${placeholder}"]')`,
          confidence: 0.75
        });
      }
    },

    addText(element, locators) {
      const text = this.getText(element);
      if (text && text.length <= 50 && text.length >= 2) {
        locators.push({
          type: 'text',
          selector: `text="${text}"`,
          playwright: `text="${text}"`,
          selenium: `By.xpath('//*[text()="${text}"]')`,
          confidence: 0.65
        });
      }
    },

    addType(element, locators) {
      const type = element.getAttribute('type');
      if (type && ['input', 'button'].includes(element.tagName.toLowerCase())) {
        locators.push({
          type: 'input-type',
          selector: `${element.tagName.toLowerCase()}[type="${type}"]`,
          playwright: `${element.tagName.toLowerCase()}[type="${type}"]`,
          selenium: `By.cssSelector('${element.tagName.toLowerCase()}[type="${type}"]')`,
          confidence: 0.6
        });
      }
    },

    // FALLBACK LOCATOR GENERATORS
    addXPath(element, locators) {
      const xpath = this.generateXPath(element);
      locators.push({
        type: 'xpath',
        selector: xpath,
        playwright: xpath,
        selenium: `By.xpath('${xpath}')`,
        confidence: 0.5
      });
    },

    addNthChild(element, locators) {
      const nthChild = this.getNthChild(element);
      if (nthChild) {
        locators.push({
          type: 'nth-child',
          selector: nthChild,
          playwright: nthChild,
          selenium: `By.cssSelector('${nthChild}')`,
          confidence: 0.4
        });
      }
    },

    addTagSelector(element, locators) {
      locators.push({
        type: 'tag',
        selector: element.tagName.toLowerCase(),
        playwright: element.tagName.toLowerCase(),
        selenium: `By.tagName('${element.tagName.toLowerCase()}')`,
        confidence: 0.3
      });
    },

    // UTILITY FUNCTIONS
    generateXPath(element) {
      if (element.id) {
        return `//*[@id="${element.id}"]`;
      }

      const parts = [];
      let current = element;

      while (current && current.nodeType === Node.ELEMENT_NODE) {
        let index = 1;
        let sibling = current.previousElementSibling;
        
        while (sibling) {
          if (sibling.tagName === current.tagName) {
            index++;
          }
          sibling = sibling.previousElementSibling;
        }

        const tagName = current.tagName.toLowerCase();
        const part = index > 1 ? `${tagName}[${index}]` : tagName;
        parts.unshift(part);

        current = current.parentElement;
      }

      return '/' + parts.join('/');
    },

    getNthChild(element) {
      const parent = element.parentElement;
      if (!parent) return null;

      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(element) + 1;
      
      return `${element.tagName.toLowerCase()}:nth-child(${index})`;
    },

    getText(element) {
      return element.textContent?.trim().substring(0, 100) || '';
    },

    getAttributes(element) {
      const attrs = {};
      for (const attr of element.attributes) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    },

    getRect(element) {
      const rect = element.getBoundingClientRect();
      return {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    },

    isInShadowDOM(element) {
      let parent = element.parentNode;
      while (parent) {
        if (parent.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          return true;
        }
        parent = parent.parentNode || parent.host;
      }
      return false;
    },

    getTotalLocators(locators) {
      return locators.primary.length + locators.secondary.length + locators.fallback.length;
    },

    calculateConfidence(locators) {
      let maxConfidence = 0;
      
      ['primary', 'secondary', 'fallback'].forEach(category => {
        locators[category].forEach(locator => {
          maxConfidence = Math.max(maxConfidence, locator.confidence);
        });
      });

      return maxConfidence;
    },

    getBestSelector(locators) {
      // Return the highest confidence selector
      const allLocators = [
        ...locators.primary,
        ...locators.secondary,
        ...locators.fallback
      ];

      if (allLocators.length === 0) return null;

      return allLocators.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
    },

    updateStatistics(stats, elementData) {
      // Update tag counts
      const tag = elementData.tagName;
      stats.byTag[tag] = (stats.byTag[tag] || 0) + 1;

      // Update locator strategy counts
      if (elementData.locators.primary.length > 0) {
        stats.withPrimary++;
      }
      if (elementData.locators.secondary.length > 0) {
        stats.withSecondary++;
      }

      // Update confidence distribution
      if (elementData.confidence >= 0.8) {
        stats.confidence.high++;
      } else if (elementData.confidence >= 0.6) {
        stats.confidence.medium++;
      } else {
        stats.confidence.low++;
      }

      // Update shadow DOM count
      if (elementData.shadowDOM) {
        stats.shadowDOM++;
      }
    },

    highlightElement(element, confidence) {
      const rect = element.getBoundingClientRect();
      const color = this.getConfidenceColor(confidence);
      
      const highlight = document.createElement('div');
      highlight.style.cssText = `
        position: fixed;
        top: ${rect.top}px;
        left: ${rect.left}px;
        width: ${rect.width}px;
        height: ${rect.height}px;
        border: 2px solid ${color};
        background: ${color}20;
        pointer-events: none;
        z-index: 999999;
        transition: opacity 0.3s ease;
        box-shadow: 0 0 10px ${color}40;
      `;
      
      highlight.className = 'universal-locator-highlight';
      document.body.appendChild(highlight);

      // Animate highlight
      setTimeout(() => {
        if (highlight.parentNode) {
          highlight.style.opacity = '0';
          setTimeout(() => {
            if (highlight.parentNode) {
              highlight.parentNode.removeChild(highlight);
            }
          }, 300);
        }
      }, 2000);
    },

    getConfidenceColor(confidence) {
      if (confidence >= 0.8) return '#00ff00'; // Green
      if (confidence >= 0.6) return '#ffaa00'; // Orange
      return '#ff4444'; // Red
    }
  };

  console.log('🚀 Universal Locator Engine loaded');

})();
