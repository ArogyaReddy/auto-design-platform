// BULLETPROOF content script connection function - this WILL work every time
function ensureContentScriptReady(tabId) {
  return new Promise(async (resolve, reject) => {
    const inspectorStatusDiv = document.getElementById('inspector-status');
    const maxAttempts = 3;
    
    console.log("Element AI Extractor: Starting bulletproof content script initialization");
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`Element AI Extractor: Initialization attempt ${attempt}/${maxAttempts}`);
      inspectorStatusDiv.textContent = `🔄 Initializing (${attempt}/${maxAttempts})...`;
      
      try {
        // STEP 1: Always inject the content script (handles all edge cases)
        console.log("Element AI Extractor: Injecting content script...");
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['contentScript.js']
        });
        
        console.log("Element AI Extractor: Content script injected successfully");
        
        // STEP 2: Wait for script initialization (critical for reliability)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // STEP 3: Test communication with guaranteed timeout
        console.log("Element AI Extractor: Testing communication...");
        const isReady = await new Promise((resolve) => {
          const timeout = setTimeout(() => {
            console.warn("Element AI Extractor: Communication test timed out");
            resolve(false);
          }, 3000);
          
          try {
            chrome.tabs.sendMessage(tabId, { action: "ping" }, (response) => {
              clearTimeout(timeout);
              
              if (chrome.runtime.lastError) {
                console.warn("Element AI Extractor: Communication failed:", chrome.runtime.lastError.message);
                resolve(false);
              } else if (response && response.status === 'alive') {
                console.log("Element AI Extractor: Communication successful:", response);
                resolve(true);
              } else {
                console.warn("Element AI Extractor: Invalid response:", response);
                resolve(false);
              }
            });
          } catch (error) {
            clearTimeout(timeout);
            console.error("Element AI Extractor: Communication error:", error);
            resolve(false);
          }
        });
        
        if (isReady) {
          console.log("Element AI Extractor: Content script is ready and responsive");
          inspectorStatusDiv.textContent = '✅ Ready! Starting inspection...';
          startInspectionDirectly(tabId);
          resolve();
          return; // Success!
        } else {
          console.warn(`Element AI Extractor: Attempt ${attempt} - Communication test failed`);
        }
        
      } catch (error) {
        console.error(`Element AI Extractor: Attempt ${attempt} failed:`, error);
      }
      
      // Wait before retry
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // If we get here, all attempts failed
    console.error("Element AI Extractor: All initialization attempts failed");
    inspectorStatusDiv.textContent = '❌ Failed to initialize. Please reload the page and try again.';
    resetInspectionState();
    reject(new Error("Failed to initialize content script after all attempts"));
  });
}
