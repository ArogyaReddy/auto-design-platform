/* global chrome */
// Ultra-basic popup - earliest prototype version

document.addEventListener('DOMContentLoaded', () => {
  console.log('Basic popup loading...');
  
  const statusEl = document.getElementById('status');
  const scanBtn = document.getElementById('scanButton');
  
  function showStatus(msg) {
    if (statusEl) statusEl.textContent = msg;
  }
  
  async function basicScan() {
    try {
      showStatus('Scanning...');
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'scanPage' });
      
      if (response && response.success) {
        showStatus(`Found ${response.count} elements!`);
        console.log('Scan results:', response.elements);
      } else {
        showStatus('Scan failed');
      }
    } catch (error) {
      console.log('Error:', error);
      showStatus('Error - try reloading page');
    }
  }
  
  // Simple connection test
  async function testConnection() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.startsWith('http')) {
        showStatus('Only works on web pages');
        return;
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
      if (response && response.success) {
        showStatus('Ready!');
      } else {
        showStatus('Not ready - reload page');
      }
    } catch (error) {
      showStatus('Not ready - reload page');
    }
  }
  
  if (scanBtn) scanBtn.onclick = basicScan;
  
  // Test connection on load
  testConnection();
});
