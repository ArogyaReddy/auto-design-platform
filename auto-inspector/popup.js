/* global chrome */
// Popup script - Enhanced with highlighting and separate view results

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup initializing...');
  
  const statusEl = document.getElementById('status');
  const scanBtn = document.getElementById('scanButton');
  const scanAreaBtn = document.getElementById('scanAreaButton');
  const viewResultsBtn = document.getElementById('viewResultsButton');
  
  // Debug: Check if all elements are found
  console.log('🔧 POPUP DEBUG: Elements found:', {
    scanBtn: !!scanBtn,
    scanAreaBtn: !!scanAreaBtn, 
    viewResultsBtn: !!viewResultsBtn,
    statusEl: !!statusEl
  });
  
  // Test the enable function immediately
  setTimeout(() => {
    console.log('🔧 POPUP DEBUG: Testing enableViewResults function...');
    enableViewResults(true);
  }, 1000);
  
  let scanResults = null;
  
  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }
  
  function enableViewResults(enable = true) {
    console.log('📦 POPUP: enableViewResults called with:', enable);
    if (viewResultsBtn) {
      viewResultsBtn.disabled = !enable;
      console.log('📦 POPUP: View Results button disabled state:', viewResultsBtn.disabled);
    } else {
      console.log('📦 POPUP: View Results button not found!');
    }
  }
  
  async function scanWithHighlighting() {
    try {
      setStatus('Scanning and highlighting elements...');
      if (scanBtn) scanBtn.disabled = true;
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url) {
        console.log('🔍 Popup: No tab or URL available:', { tab: !!tab, url: tab?.url });
        setStatus('No active tab found');
        if (scanBtn) scanBtn.disabled = false;
        return;
      }
      
      // Check if URL is supported (exclude browser internal pages)
      const url = tab.url;
      const isSupported = url.startsWith('http://') || 
                         url.startsWith('https://') || 
                         url.startsWith('file://') ||
                         url.startsWith('data:text/html');
      
      const isBlocked = url.startsWith('chrome://') || 
                       url.startsWith('chrome-extension://') ||
                       url.startsWith('moz-extension://') ||
                       url.startsWith('about:') ||
                       url.startsWith('edge://') ||
                       url.startsWith('brave://');
      
      if (!isSupported || isBlocked) {
        console.log('🔍 Popup: Unsupported URL:', { url, isSupported, isBlocked });
        setStatus('This page type is not supported - please try a website or HTML file');
        if (scanBtn) scanBtn.disabled = false;
        return;
      }
      
      console.log('🔍 Popup: Starting scan on tab:', { id: tab.id, url: tab.url });
      
      // Ensure content script is injected
      try {
        console.log('🔍 Popup: Injecting content script...');
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log('🔍 Popup: Content script injected successfully');
      } catch (error) {
        console.log('🔍 Popup: Content script injection error:', error);
        if (error.message.includes('Cannot access')) {
          setStatus('Cannot access this page - try a different website or enable file access');
          if (scanBtn) scanBtn.disabled = false;
          return;
        }
      }
      
      // Wait for script to be ready and test communication
      console.log('🔍 Popup: Waiting for content script to be ready...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Test if content script is responsive
      try {
        const pingResponse = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
        console.log('🔍 Popup: Content script ping response:', pingResponse);
        if (!pingResponse || !pingResponse.success) {
          console.log('🔍 Popup: Content script not responding to ping');
          setStatus('Content script not ready - please try again');
          if (scanBtn) scanBtn.disabled = false;
          return;
        }
      } catch (pingError) {
        console.log('🔍 Popup: Content script ping failed:', pingError);
        setStatus('Cannot communicate with page - please try again');
        if (scanBtn) scanBtn.disabled = false;
        return;
      }
      
      // Check highlighting preference
      const highlightEnabled = document.getElementById('highlightDuringScan')?.checked ?? true;
      
      // Start scan with highlighting
      let scanResponse = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!scanResponse && retryCount < maxRetries) {
        try {
          console.log(`🔍 Popup: Scan attempt ${retryCount + 1}/${maxRetries}`);
          
          // Send scan message with highlighting option
          scanResponse = await chrome.tabs.sendMessage(tab.id, { 
            action: 'scanPageWithHighlighting',
            options: {
              highlight: highlightEnabled,
              includeShadowDOM: document.getElementById('includeShadowDOM')?.checked ?? true,
              includeHidden: document.getElementById('includeHidden')?.checked ?? false
            }
          });
          
          console.log(`🔍 Popup: Scan attempt ${retryCount + 1} response:`, scanResponse);
          
          if (!scanResponse) {
            console.log(`🔍 Popup: No response received on attempt ${retryCount + 1}`);
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`🔍 Popup: Retrying in 1000ms...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            continue;
          }
          
          if (!scanResponse.success) {
            console.log(`🔍 Popup: Scan failed on attempt ${retryCount + 1}:`, scanResponse.error || 'Unknown error');
            retryCount++;
            if (retryCount < maxRetries) {
              console.log(`🔍 Popup: Retrying in 1000ms...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            continue;
          }
          
          // Success - break out of retry loop
          break;
          
        } catch (error) {
          console.log(`🔍 Popup: Scan attempt ${retryCount + 1} error:`, error);
          
          if (error.message.includes('Receiving end does not exist')) {
            console.log('🔍 Popup: Content script disconnected, re-injecting...');
            try {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
              });
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (injectionError) {
              console.log('🔍 Popup: Re-injection failed:', injectionError);
            }
          }
          
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`🔍 Popup: Retrying in 1000ms...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!scanResponse || !scanResponse.success) {
        console.log('🔍 Popup: All scan attempts failed');
        console.log('🔍 Popup: Final scan response:', scanResponse);
        
        let errorMessage = 'Scan failed - please try again';
        if (scanResponse && scanResponse.error) {
          errorMessage = `Scan failed: ${scanResponse.error}`;
        }
        
        setStatus(errorMessage);
        if (scanBtn) scanBtn.disabled = false;
        return;
      }
      
      console.log('🔍 Popup: Raw scan response:', scanResponse);
      
      if (scanResponse && scanResponse.success) {
        console.log('🔍 Popup: Scan response details:', {
          hasResults: !!scanResponse.results,
          resultsLength: scanResponse.results ? scanResponse.results.length : 'undefined',
          resultsType: typeof scanResponse.results,
          firstResult: scanResponse.results && scanResponse.results[0] ? {
            tagName: scanResponse.results[0].tagName,
            hasAttributes: !!scanResponse.results[0].attributes,
            attributeKeys: scanResponse.results[0].attributes ? Object.keys(scanResponse.results[0].attributes) : 'no attributes',
            hasContext: !!scanResponse.results[0].context,
            hasLocators: !!scanResponse.results[0].locators,
            primaryLocators: scanResponse.results[0].locators?.primary?.length || 0,
            secondaryLocators: scanResponse.results[0].locators?.secondary?.length || 0,
            fallbackLocators: scanResponse.results[0].locators?.fallback?.length || 0,
            hasTextContent: !!scanResponse.results[0].textContent,
            textContentKeys: scanResponse.results[0].textContent ? Object.keys(scanResponse.results[0].textContent) : 'no textContent'
          } : 'no first result'
        });
        
        setStatus(`Scan complete! Found ${scanResponse.stats.totalElements} elements`);
        
        // Prepare scan results
        scanResults = {
          url: tab.url,
          title: tab.title,
          timestamp: new Date().toISOString(),
          duration: scanResponse.stats.scanDuration || 100,
          totalElements: scanResponse.stats.totalElements || 0,
          elementsWithPrimary: scanResponse.stats.primaryElements || 0,
          elementsWithSecondary: scanResponse.stats.secondaryElements || 0,
          shadowDOMElements: scanResponse.stats.shadowElements || 0,
          elements: scanResponse.results || []
        };
        
        console.log('🔍 Popup: Prepared scan data:', {
          elementsLength: scanResults.elements.length,
          firstElementDebug: scanResults.elements[0] ? {
            tagName: scanResults.elements[0].tagName,
            hasAttributes: !!scanResults.elements[0].attributes,
            attributeCount: scanResults.elements[0].attributes ? Object.keys(scanResults.elements[0].attributes).length : 0,
            hasContext: !!scanResults.elements[0].context,
            hasLocators: !!scanResults.elements[0].locators,
            locatorCounts: {
              primary: scanResults.elements[0].locators?.primary?.length || 0,
              secondary: scanResults.elements[0].locators?.secondary?.length || 0,
              fallback: scanResults.elements[0].locators?.fallback?.length || 0
            }
          } : 'no first element'
        });
        
        // Validate data quality before saving
        const hasValidData = scanResults.elements.some(element => {
          const hasAttributes = element.attributes && Object.keys(element.attributes).length > 0;
          const hasLocators = element.locators && (
            (element.locators.primary && element.locators.primary.length > 0) ||
            (element.locators.secondary && element.locators.secondary.length > 0) ||
            (element.locators.fallback && element.locators.fallback.length > 0)
          );
          return hasAttributes || hasLocators;
        });
        
        if (!hasValidData) {
          console.warn('⚠️ Warning: Scan data appears to be empty or invalid.');
          setStatus('Scan completed but data appears empty - please try again');
          if (scanBtn) scanBtn.disabled = false;
          return;
        }
        
        // Save scan results
        await chrome.storage.local.clear();
        await chrome.storage.local.set({ scanResults });
        
        // Enable view results button
        enableViewResults(true);
        setStatus('Scan complete! Click "View Scanned Results" to see details');
        
        // Clear highlighting after a delay
        setTimeout(async () => {
          try {
            await chrome.tabs.sendMessage(tab.id, { action: 'clearHighlighting' });
          } catch (error) {
            console.log('Note: Could not clear highlighting:', error.message);
          }
        }, 3000);
        
      } else {
        setStatus('Scan failed - please try again');
      }
    } catch (error) {
      console.log('Scan failed:', error);
      setStatus('Scan failed - please try again');
    } finally {
      if (scanBtn) scanBtn.disabled = false;
    }
  }
  
  async function scanArea() {
    try {
      setStatus('Click on any area to scan its elements...');
      if (scanAreaBtn) scanAreaBtn.disabled = true;
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url) {
        setStatus('No active tab found');
        if (scanAreaBtn) scanAreaBtn.disabled = false;
        return;
      }
      
      // Check if URL is supported
      const url = tab.url;
      const isSupported = url.startsWith('http://') || 
                         url.startsWith('https://') || 
                         url.startsWith('file://') ||
                         url.startsWith('data:text/html');
      
      const isBlocked = url.startsWith('chrome://') || 
                       url.startsWith('chrome-extension://') ||
                       url.startsWith('moz-extension://') ||
                       url.startsWith('about:') ||
                       url.startsWith('edge://') ||
                       url.startsWith('brave://');
      
      if (isBlocked) {
        setStatus('❌ Cannot scan browser internal pages');
        if (scanAreaBtn) scanAreaBtn.disabled = false;
        return;
      }
      
      if (!isSupported) {
        setStatus('❌ URL not supported for scanning');
        if (scanAreaBtn) scanAreaBtn.disabled = false;
        return;
      }
      
      // Inject content script if needed and start area scan mode
      try {
        // Try to communicate with content script first
        let response = null;
        try {
          response = await chrome.tabs.sendMessage(tab.id, { 
            action: 'startAreaScanMode'
          });
        } catch (error) {
          console.log('Content script not available, injecting...');
        }
        
        // If no response, inject content script
        if (!response) {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          
          // Wait a bit for injection
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try again
          response = await chrome.tabs.sendMessage(tab.id, { 
            action: 'startAreaScanMode'
          });
        }
         if (response && response.success) {
          setStatus('✨ Area scan mode active! Click on any container/area to scan its elements. Results will appear when you reopen this popup.');
          
          // No need for complex message listening since popup will close when user clicks
          // Just disable the button and let the user know to reopen popup after scanning
          if (scanAreaBtn) scanAreaBtn.disabled = false;
          
        } else {
          setStatus('❌ Failed to activate area scan mode');
          if (scanAreaBtn) scanAreaBtn.disabled = false;
        }
        
      } catch (error) {
        console.error('Failed to inject content script:', error);
        setStatus('❌ Failed to prepare page for scanning');
        if (scanAreaBtn) scanAreaBtn.disabled = false;
      }
      
    } catch (error) {
      console.error('Area scan failed:', error);
      setStatus('❌ Area scan failed - please try again');
      if (scanAreaBtn) scanAreaBtn.disabled = false;
    }
  }
  
  function handleAreaScanResults(results, containerInfo) {
    console.log('📦 POPUP: handleAreaScanResults called with:', results, containerInfo);
    try {
      setStatus(`✅ Area scan complete! Found ${results.elements.length} elements in ${containerInfo.tagName}`);
      
      // Prepare scan results in the same format as full page scan
      scanResults = {
        url: containerInfo.url,
        title: `Area Scan: ${containerInfo.tagName}${containerInfo.id ? '#' + containerInfo.id : ''}${containerInfo.className ? '.' + containerInfo.className.split(' ')[0] : ''}`,
        timestamp: new Date().toISOString(),
        scanType: 'area',
        containerInfo: containerInfo,
        duration: results.scanDuration || 100,
        totalElements: results.elements.length,
        elements: results.elements || []
      };
      
      console.log('📦 POPUP: Prepared scan results:', scanResults);
      
      // Save scan results
      chrome.storage.local.clear().then(() => {
        console.log('📦 POPUP: Storage cleared, saving new results...');
        chrome.storage.local.set({ scanResults }).then(() => {
          console.log('📦 POPUP: Scan results saved to storage');
          // Enable view results button
          enableViewResults(true);
          setStatus(`✅ Area scan complete! Found ${results.elements.length} elements. Click "View Results" to see details.`);
          
          // Clear highlighting after a delay
          setTimeout(async () => {
            try {
              const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
              await chrome.tabs.sendMessage(tab.id, { action: 'clearHighlighting' });
            } catch (error) {
              console.log('Note: Could not clear highlighting:', error.message);
            }
          }, 3000);
        }).catch(error => {
          console.error('📦 POPUP: Failed to save results to storage:', error);
          setStatus('❌ Failed to save scan results');
        });
      }).catch(error => {
        console.error('📦 POPUP: Failed to clear storage:', error);
        setStatus('❌ Failed to prepare storage for results');
      });
      
    } catch (error) {
      console.error('📦 POPUP: Failed to handle area scan results:', error);
      setStatus('❌ Failed to process area scan results');
    } finally {
      if (scanAreaBtn) scanAreaBtn.disabled = false;
    }
  }

  async function viewResults() {
    if (!scanResults) {
      setStatus('No scan results available - please scan first');
      return;
    }
    
    // Open results page
    chrome.tabs.create({ url: 'results.html' });
  }
  
  // Manual highlight functionality
  const manualSelector = document.getElementById('manualSelector');
  const manualHighlightBtn = document.getElementById('manualHighlightBtn');
  const scanElementBtn = document.getElementById('scanElement');
  const testEnableBtn = document.getElementById('testEnableButton');
  
  // Element scan mode state
  let isElementScanMode = false;
  
  async function toggleElementScanMode() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.id) {
        setStatus('No active tab found');
        return;
      }
      
      if (isElementScanMode) {
        // Stop scan mode
        setStatus('Stopping element scan mode...');
        
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'stopElementScan'
        });
        
        if (response && response.success) {
          isElementScanMode = false;
          if (scanElementBtn) {
            scanElementBtn.textContent = '🎯 Scan Element';
            scanElementBtn.disabled = false;
          }
          setStatus('Element scan mode stopped');
        } else {
          setStatus('Failed to stop element scan mode');
        }
      } else {
        // Start scan mode
        setStatus('Starting element scan mode...');
        if (scanElementBtn) {
          scanElementBtn.textContent = '⏹️ Stop Scan';
        }
        
        // Ensure content script is injected
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.log('Content script injection error:', error);
        }
        
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'startElementScan'
        });
        
        if (response && response.success) {
          isElementScanMode = true;
          setStatus('✅ Element scan mode active! Switch to the page and hover over elements.');
          
          // Listen for scanned element data
          setupElementScanListener();
        } else {
          setStatus('Failed to start element scan mode');
          if (scanElementBtn) {
            scanElementBtn.textContent = '🎯 Scan Element';
          }
        }
      }
    } catch (error) {
      console.error('Element scan mode error:', error);
      setStatus('Element scan failed: ' + error.message);
      if (scanElementBtn) {
        scanElementBtn.textContent = '🎯 Scan Element';
        scanElementBtn.disabled = false;
      }
    }
  }
  
  function setupElementScanListener() {
    console.log('🎯 Setting up element scan listener...');
    
    // Listen for messages from content script about scanned elements
    const messageListener = (message) => {
      console.log('🎯 Popup received message:', message);
      
      if (message.action === 'elementScanned') {
        console.log('🎯 Element scanned:', message.elementData);
        showElementLocators(message.elementData);
        
        // Reset scan mode
        isElementScanMode = false;
        if (scanElementBtn) {
          scanElementBtn.textContent = '🎯 Scan Element';
        }
        
        // Remove this listener
        chrome.runtime.onMessage.removeListener(messageListener);
      } else if (message.action === 'elementScanError') {
        console.error('🎯 Element scan error:', message.error);
        setStatus('Element scan error: ' + message.error);
        
        // Reset scan mode
        isElementScanMode = false;
        if (scanElementBtn) {
          scanElementBtn.textContent = '🎯 Scan Element';
        }
        
        // Remove this listener
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
    
    chrome.runtime.onMessage.addListener(messageListener);
    console.log('🎯 Element scan listener added');
  }
  
  function showElementLocators(elementData) {
    console.log('🎯 showElementLocators called with:', elementData);
    // Create and show element locators popup
    createElementLocatorsPopup(elementData);
  }
  
  function createElementLocatorsPopup(elementData) {
    console.log('🎯 createElementLocatorsPopup called with:', elementData);
    
    // Remove existing popup if any
    const existingPopup = document.getElementById('element-locators-popup');
    if (existingPopup) {
      existingPopup.remove();
      console.log('🎯 Removed existing popup');
    }
    
    const popup = document.createElement('div');
    popup.id = 'element-locators-popup';
    popup.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      border-radius: 8px;
      max-width: 800px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      color: #333;
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 20px;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: between;
      align-items: center;
    `;
    
    const title = document.createElement('h2');
    title.style.cssText = `
      margin: 0;
      font-size: 18px;
      flex: 1;
    `;
    title.textContent = `Element Locators: ${elementData.tagName.toUpperCase()}`;
    
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
      background: #f0f0f0;
      border: none;
      border-radius: 4px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeBtn.textContent = '✕ Close';
    closeBtn.onclick = () => popup.remove();
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    const body = document.createElement('div');
    body.style.cssText = `padding: 20px;`;
    
    // Element info
    const infoSection = document.createElement('div');
    infoSection.style.cssText = `margin-bottom: 20px;`;
    
    const elementInfo = document.createElement('div');
    elementInfo.style.cssText = `
      background: #f8f9fa;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 15px;
    `;
    
    elementInfo.innerHTML = `
      <div style="margin-bottom: 10px;">
        <strong>Tag:</strong> ${elementData.tagName.toUpperCase()}
        ${elementData.isShadowDOM ? ' <span style="color: #e67e22; font-weight: bold;">(Shadow DOM)</span>' : ''}
      </div>
      ${elementData.textContent.cleanText ? `<div style="margin-bottom: 10px;"><strong>Text:</strong> "${elementData.textContent.cleanText}"</div>` : ''}
      ${elementData.attributes.id ? `<div style="margin-bottom: 10px;"><strong>ID:</strong> ${elementData.attributes.id}</div>` : ''}
      ${elementData.attributes.class ? `<div style="margin-bottom: 10px;"><strong>Classes:</strong> ${elementData.attributes.class}</div>` : ''}
      <div><strong>Position:</strong> ${elementData.position.x}, ${elementData.position.y} (${elementData.position.width}x${elementData.position.height})</div>
    `;
    
    infoSection.appendChild(elementInfo);
    
    // Locators sections
    const locatorSections = [
      { title: 'Primary Locators (Recommended)', locators: elementData.locators.primary, style: 'background: #d4edda; border-left: 4px solid #28a745;' },
      { title: 'Secondary Locators', locators: elementData.locators.secondary, style: 'background: #fff3cd; border-left: 4px solid #ffc107;' },
      { title: 'Fallback Locators', locators: elementData.locators.fallback, style: 'background: #f8d7da; border-left: 4px solid #dc3545;' }
    ];
    
    locatorSections.forEach(section => {
      if (section.locators.length > 0) {
        const sectionDiv = document.createElement('div');
        sectionDiv.style.cssText = `margin-bottom: 20px;`;
        
        const sectionTitle = document.createElement('h3');
        sectionTitle.style.cssText = `
          margin: 0 0 10px 0;
          font-size: 16px;
          color: #333;
        `;
        sectionTitle.textContent = `${section.title} (${section.locators.length})`;
        
        sectionDiv.appendChild(sectionTitle);
        
        section.locators.forEach((locator) => {
          const locatorDiv = document.createElement('div');
          locatorDiv.style.cssText = `
            ${section.style}
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          `;
          
          const selectorDiv = document.createElement('div');
          selectorDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 5px;
          `;
          
          const selectorText = document.createElement('code');
          selectorText.style.cssText = `
            flex: 1;
            background: rgba(0, 0, 0, 0.05);
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 12px;
            word-break: break-all;
          `;
          selectorText.textContent = locator.selector;
          
          const copyBtn = document.createElement('button');
          copyBtn.style.cssText = `
            background: #007bff;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 11px;
            white-space: nowrap;
          `;
          copyBtn.textContent = '📋 Copy';
          copyBtn.onclick = () => {
            navigator.clipboard.writeText(locator.selector);
            copyBtn.textContent = '✅ Copied!';
            setTimeout(() => {
              copyBtn.textContent = '📋 Copy';
            }, 2000);
          };
          
          const highlightBtn = document.createElement('button');
          highlightBtn.style.cssText = `
            background: #28a745;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 4px 8px;
            cursor: pointer;
            font-size: 11px;
            white-space: nowrap;
          `;
          highlightBtn.textContent = '🎯 Test';
          highlightBtn.onclick = async () => {
            try {
              console.log('🎯 POPUP: Attempting to highlight:', locator.selector);
              highlightBtn.textContent = '🔍 Finding...';
              
              const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
              if (!tab || !tab.id) {
                console.error('❌ POPUP: No active tab found');
                highlightBtn.textContent = '❌ No Tab';
                setTimeout(() => {
                  highlightBtn.textContent = '🎯 Test';
                }, 2000);
                return;
              }
              
              console.log('📤 POPUP: Sending message to tab:', tab.id, 'selector:', locator.selector);
              
              const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'highlightElement',
                selector: locator.selector
              });
              
              console.log('📥 POPUP: Received response:', response);
              
              if (response && response.success) {
                if (response.found) {
                  console.log('✅ POPUP: Element highlighted successfully');
                  highlightBtn.textContent = `✅ Found ${response.count}!`;
                } else {
                  console.log('⚠️ POPUP: Element not found');
                  highlightBtn.textContent = '❌ Not Found';
                }
              } else {
                console.error('❌ POPUP: Failed to highlight:', response?.error);
                highlightBtn.textContent = '❌ Error';
              }
              
              setTimeout(() => {
                highlightBtn.textContent = '🎯 Test';
              }, 3000);
              
            } catch (error) {
              console.error('❌ POPUP: Error in highlight:', error);
              
              // Check for content script injection issue
              if (error.message.includes('Could not establish connection') || 
                  error.message.includes('Receiving end does not exist')) {
                console.log('🔄 POPUP: Content script not found, attempting injection...');
                highlightBtn.textContent = '🔄 Injecting...';
                
                try {
                  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
                  await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    files: ['content.js']
                  });
                  
                  // Wait for injection
                  await new Promise(resolve => setTimeout(resolve, 200));
                  
                  // Retry highlighting
                  const retryResponse = await chrome.tabs.sendMessage(tab.id, {
                    action: 'highlightElement',
                    selector: locator.selector
                  });
                  
                  if (retryResponse && retryResponse.success && retryResponse.found) {
                    console.log('✅ POPUP: Highlighted after injection');
                    highlightBtn.textContent = `✅ Found ${retryResponse.count}!`;
                  } else {
                    console.log('❌ POPUP: Still not found after injection');
                    highlightBtn.textContent = '❌ Not Found';
                  }
                } catch (retryError) {
                  console.error('❌ POPUP: Retry failed:', retryError);
                  highlightBtn.textContent = '❌ Failed';
                }
              } else {
                highlightBtn.textContent = '❌ Error';
              }
              
              setTimeout(() => {
                highlightBtn.textContent = '🎯 Test';
              }, 3000);
            }
          };
          
          selectorDiv.appendChild(selectorText);
          selectorDiv.appendChild(copyBtn);
          selectorDiv.appendChild(highlightBtn);
          
          const metaDiv = document.createElement('div');
          metaDiv.style.cssText = `
            font-size: 11px;
            color: #666;
            margin-top: 5px;
          `;
          
          let metaInfo = `Type: ${locator.type}`;
          if (locator.isUnique !== undefined) {
            metaInfo += ` | Unique: ${locator.isUnique ? '✅' : '❌'}`;
          }
          if (locator.shadowDOM) {
            metaInfo += ' | Shadow DOM';
          }
          if (locator.note) {
            metaInfo += ` | Note: ${locator.note}`;
          }
          
          metaDiv.textContent = metaInfo;
          
          locatorDiv.appendChild(selectorDiv);
          locatorDiv.appendChild(metaDiv);
          
          sectionDiv.appendChild(locatorDiv);
        });
        
        body.appendChild(sectionDiv);
      }
    });
    
    content.appendChild(header);
    content.appendChild(body);
    popup.appendChild(content);
    
    document.body.appendChild(popup);
    
    // Auto-focus first copy button for keyboard users
    const firstCopyBtn = popup.querySelector('button[onclick]');
    if (firstCopyBtn) {
      firstCopyBtn.focus();
    }
    
    setStatus('Element scanned! Review locators in the popup.');
  }
  
  async function manualHighlight() {
    try {
      const selector = manualSelector?.value?.trim();
      if (!selector) {
        setStatus('Please enter a CSS selector');
        return;
      }
      
      setStatus('Highlighting element with selector: ' + selector);
      if (manualHighlightBtn) manualHighlightBtn.disabled = true;
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.id) {
        setStatus('No active tab found');
        if (manualHighlightBtn) manualHighlightBtn.disabled = false;
        return;
      }
      
      console.log('🎯 Manual highlight: Sending to tab', tab.id, 'selector:', selector);
      
      // Send highlight message to content script
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'highlightElement',
        selector: selector
      });
      
      console.log('🎯 Manual highlight response:', response);
      
      if (response && response.success) {
        if (response.found) {
          const count = response.count || 1;
          if (count === 1) {
            setStatus('✅ Element highlighted successfully! Check the page.');
          } else {
            setStatus(`✅ ${count} elements highlighted successfully! Check the page.`);
          }
        } else {
          setStatus('⚠️ No elements found with selector: ' + selector);
        }
      } else {
        setStatus('❌ Failed to highlight: ' + (response?.error || 'Unknown error'));
      }
      
    } catch (error) {
      console.error('Manual highlight error:', error);
      
      // Check if it's a content script issue
      if (error.message.includes('Could not establish connection') || 
          error.message.includes('Receiving end does not exist')) {
        
        console.log('🔄 POPUP: Manual highlight - injecting content script...');
        setStatus('🔄 Injecting content script...');
        
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
          
          // Wait for injection
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Retry highlighting
          const retryResponse = await chrome.tabs.sendMessage(tab.id, {
            action: 'highlightElement',
            selector: selector
          });
          
          if (retryResponse && retryResponse.success && retryResponse.found) {
            const count = retryResponse.count || 1;
            setStatus(`✅ ${count} elements highlighted after injection! Check the page.`);
          } else {
            setStatus('⚠️ No elements found after injection: ' + selector);
          }
        } catch (retryError) {
          console.error('❌ POPUP: Manual highlight retry failed:', retryError);
          setStatus('❌ Failed to inject content script and highlight');
        }
      } else {
        setStatus('❌ Highlight failed: ' + error.message);
      }
    } finally {
      if (manualHighlightBtn) manualHighlightBtn.disabled = false;
    }
  }
  
  // Wire up events
  if (scanBtn) scanBtn.onclick = scanWithHighlighting;
  if (scanAreaBtn) scanAreaBtn.onclick = scanArea;
  if (viewResultsBtn) viewResultsBtn.onclick = viewResults;
  if (manualHighlightBtn) manualHighlightBtn.onclick = manualHighlight;
  if (scanElementBtn) scanElementBtn.onclick = toggleElementScanMode;
  if (testEnableBtn) testEnableBtn.onclick = () => {
    console.log('🔧 POPUP DEBUG: Test button clicked, enabling view results...');
    enableViewResults(true);
    // Also create fake results for testing
    scanResults = {
      url: 'test://example.com',
      title: 'Test Results',
      timestamp: new Date().toISOString(),
      scanType: 'test',
      totalElements: 5,
      elements: [
        { id: 'test1', tagName: 'div', locators: { primary: [{ selector: '#test1' }] } },
        { id: 'test2', tagName: 'button', locators: { primary: [{ selector: '#test2' }] } }
      ]
    };
    setStatus('🔧 Test: View Results button enabled with fake data');
  };
  
  // Enable Enter key in the selector input
  if (manualSelector) {
    manualSelector.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        manualHighlight();
      }
    });
    
    // Auto-clear status when typing
    manualSelector.addEventListener('input', () => {
      if (manualSelector.value.trim()) {
        setStatus('Ready to highlight: ' + manualSelector.value.trim());
      } else {
        setStatus('Ready to scan any webpage or HTML file!');
      }
    });
  }
  
  // Set initial state
  setStatus('Ready to scan any webpage or HTML file!');
  enableViewResults(false);
  
  // Check for any pending area scan results when popup opens
  setTimeout(async () => {
    try {
      console.log('📦 POPUP: Checking for pending area scan results...');
      
      // Check storage first
      const data = await chrome.storage.local.get(['areaScanResults']);
      if (data.areaScanResults && data.areaScanResults.timestamp > Date.now() - 60000) {
        console.log('📦 POPUP: Found pending area scan results in storage');
        handleAreaScanResults(data.areaScanResults.results, data.areaScanResults.containerInfo);
        chrome.storage.local.remove(['areaScanResults']);
        return;
      }
      
      // Also check background script
      const response = await chrome.runtime.sendMessage({ action: 'getAreaScanResults' });
      if (response && response.results) {
        console.log('📦 POPUP: Found pending area scan results in background');
        handleAreaScanResults(response.results, response.containerInfo);
      }
    } catch (error) {
      console.log('📦 POPUP: No pending results found:', error.message);
    }
  }, 100);
});
