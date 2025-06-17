/* global chrome */
// Popup script - Simple working version from 11:19 era

document.addEventListener('DOMContentLoaded', () => {
  console.log('Popup initializing...');
  
  const statusEl = document.getElementById('status');
  const connectionEl = document.getElementById('connectionStatus');
  const scanBtn = document.getElementById('scanButton');
  const retryBtn = document.getElementById('retryConnection');
  
  function setStatus(msg, isError = false) {
    if (statusEl) statusEl.textContent = msg;
    if (connectionEl) connectionEl.textContent = isError ? 'Disconnected' : 'Connected';
    if (retryBtn) retryBtn.style.display = isError ? 'block' : 'none';
    if (scanBtn) scanBtn.disabled = isError;
  }
  
  async function checkConnection() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url.startsWith('http')) {
        setStatus('Only works on web pages', true);
        return;
      }
      
      // Simple ping test
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
      
      if (response && response.success) {
        setStatus('Ready to scan any webpage!');
      } else {
        setStatus('Not connected - click retry', true);
      }
    } catch (error) {
      console.log('Connection check failed:', error);
      setStatus('Not connected - click retry', true);
    }
  }
  
  async function scan() {
    try {
      setStatus('Scanning page elements...');
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });
      
      if (response && response.success) {
        setStatus(`Scan complete! Found ${response.stats.totalElements} elements`);
        
        // Prepare scan results in the format expected by results.js
        const scanData = {
          url: tab.url,
          title: tab.title,
          timestamp: new Date().toISOString(),
          duration: response.stats.scanDuration || 100,
          totalElements: response.stats.totalElements || 0,
          elementsWithPrimary: response.stats.primaryElements || 0,
          elementsWithSecondary: response.stats.secondaryElements || 0,
          shadowDOMElements: response.stats.shadowElements || 0,
          elements: response.results || []
        };
        
        // Save results and open results page
        chrome.storage.local.set({ scanResults: scanData });
        chrome.tabs.create({ url: 'results.html' });
      } else {
        setStatus('Scan failed - try retry', true);
      }
    } catch (error) {
      console.log('Scan failed:', error);
      setStatus('Scan failed - try retry', true);
    }
  }
  
  async function retry() {
    try {
      setStatus('Connecting...');
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Inject content script
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      
      // Wait and check
      setTimeout(checkConnection, 500);
    } catch (error) {
      console.log('Retry failed:', error);
      setStatus('Retry failed', true);
    }
  }
  
  // Wire up events
  if (scanBtn) scanBtn.onclick = scan;
  if (retryBtn) retryBtn.onclick = retry;
  
  // Initial check
  checkConnection();
});
