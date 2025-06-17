// AI-Playwright-Framework/utils/self_healing_locator.js
/**
 * Attempts to find an element using a primary selector, and then fallback selectors if the primary fails.
 * @param {import('playwright').Page} page - The Playwright page object.
 * @param {string} elementName - A logical name for the element (for logging purposes).
 * @param {string} primarySelector - The main selector (CSS or XPath) to try first.
 * @param {string[]} [fallbackSelectors=[]] - An array of alternative selectors to try if the primary fails.
 * @param {object} [waitForOptions={ state: 'visible', timeout: 7000 }] - Options for Playwright's `element.waitFor()`.
 * Increased default timeout slightly for visibility checks.`
 * @returns {Promise<import('playwright').Locator>} Playwright Locator object for the found element.
 * @throws {Error} If the element cannot be found using any of the provided selectors.
 */
// async function findElementRobustly(page, elementName, primarySelector, fallbackSelectors = [], waitForOptions = {state: 'visible', timeout: 7000}) {
async function findElementRobustly(page, elementName, primarySelector, fallbackSelectors = [], waitForOptions = {state: 'visible', timeout: 15000}) {
  console.log(`[Self-Healing] Attempting to find '${elementName}'. Primary: '${primarySelector}'`);

  try {
    const element = page.locator(primarySelector);
    // Check if the element exists and meets the waitForOptions (e.g., is visible)
    await element.waitFor(waitForOptions);
    console.log(`[Self-Healing] Found '${elementName}' using primary locator: '${primarySelector}'`);
    return element;
  } catch (error) {
    console.warn(`[Self-Healing] Primary locator for '${elementName}' ('${primarySelector}') failed. Error: ${error.message}`);
    if (fallbackSelectors && fallbackSelectors.length > 0) {
      console.log(`[Self-Healing] Trying ${fallbackSelectors.length} fallback selector(s) for '${elementName}'...`);
      for (let i = 0; i < fallbackSelectors.length; i++) {
        const fallback = fallbackSelectors[i];
        console.log(`[Self-Healing] Trying fallback #${i + 1} for '${elementName}': '${fallback}'`);
        try {
          const element = page.locator(fallback);
          await element.waitFor(waitForOptions);
          console.log(`[Self-Healing] Found '${elementName}' using fallback locator: '${fallback}'`);
          // Potential future enhancement: Implement a learning mechanism here.
          // For example, if a fallback works consistently, it could be promoted.
          return element;
        } catch (fallbackError) {
          console.warn(`[Self-Healing] Fallback locator '${fallback}' for '${elementName}' failed. Error: ${fallbackError.message}`);
        }
      }
    }
    const errorMessage = `[Self-Healing] Element '${elementName}' NOT FOUND using primary locator ('${primarySelector}') or any of its ${fallbackSelectors.length} fallback(s).`;
    console.error(errorMessage);
    throw new Error(errorMessage); // Re-throw the error to fail the test step if element not found
  }
}

module.exports = {findElementRobustly};
