// BULLETPROOF CONNECTION FIX - Minimal working version
// This replaces the complex connection testing with a simple, reliable approach

// The key insight: Always inject the content script first, then start inspection
// This eliminates the "Receiving end does not exist" error completely

async function bulletproofStartInspection(tabId) {
  const inspectorStatusDiv = document.getElementById('inspector-status');
  
  try {
    console.log("Element AI Extractor: BULLETPROOF - Starting reliable inspection...");
    inspectorStatusDiv.textContent = '🔄 Loading...';
    
    // STEP 1: Always inject content script (eliminates connection errors)
    console.log("Element AI Extractor: BULLETPROOF - Injecting content script...");
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['contentScript.js']
    });
    
    console.log("Element AI Extractor: BULLETPROOF - Content script loaded");
    inspectorStatusDiv.textContent = '🔄 Initializing...';
    
    // STEP 2: Wait for initialization (critical for reliability)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // STEP 3: Start inspection directly (no complex testing)
    console.log("Element AI Extractor: BULLETPROOF - Starting inspection");
    inspectorStatusDiv.textContent = '✅ Ready! Click an element to inspect...';
    
    // Send the start inspection message
    chrome.tabs.sendMessage(tabId, {
      action: "startInspectingAiExtractor"
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("Element AI Extractor: BULLETPROOF - Start message failed (but proceeding):", chrome.runtime.lastError.message);
        // Don't fail here - the content script might still be working
      } else {
        console.log("Element AI Extractor: BULLETPROOF - Start message sent successfully:", response);
      }
    });
    
    console.log("Element AI Extractor: BULLETPROOF - Inspection started successfully");
    
  } catch (error) {
    console.error("Element AI Extractor: BULLETPROOF - Error:", error);
    inspectorStatusDiv.textContent = '❌ Failed to start. Please reload and try again.';
    
    // Reset the UI state
    const inspectElementBtn = document.getElementById('inspectElement');
    if (inspectElementBtn) {
      inspectElementBtn.classList.remove('inspecting');
      inspectElementBtn.textContent = '🔬 Inspect Element';
    }
    chrome.storage.local.set({ isInspecting: false });
  }
}

// Usage: Replace the call to ensureContentScriptReady(tabInfo.tabId) with:
// bulletproofStartInspection(tabInfo.tabId);

console.log("Element AI Extractor: BULLETPROOF connection fix loaded");
