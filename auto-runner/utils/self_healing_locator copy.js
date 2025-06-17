// utils/self_healing_locator.js
const { expect } = require('@playwright/test');

const healedLocators = []; // Array to store successful healing records

/**
 * Attempts to locate an element using a primary locator. If it fails,
 * it tries a series of fallback strategies.
 * @param {import('@playwright/test').Page} page - The Playwright Page object.
 * @param {string | import('@playwright/test').Locator} primaryLocator - The initial CSS selector or Playwright Locator.
 * @param {string} elementName - A human-readable name for the element being located.
 * @param {object} fallbackStrategies - An object containing fallback strategies.
 * @param {string} [fallbackStrategies.testId] - A data-testid attribute value.
 * @param {string} [fallbackStrategies.text] - Visible text content.
 * @param {string} [fallbackStrategies.role] - ARIA role (e.g., 'button', 'textbox'). Can be combined with 'name'.
 * @param {string} [fallbackStrategies.name] - ARIA name (e.g., label for input, text for button).
 * @param {string} [fallbackStrategies.altText] - Alt text for images or other elements.
 * @param {string} [fallbackStrategies.title] - Title attribute value.
 * @param {string} [fallbackStrategies.css] - A fallback CSS selector.
 * param {number} [timeout=60000] - Custom timeout for locating the element.
 * @returns {Promise<import('@playwright/test').Locator>} A Promise that resolves to a Playwright Locator.
 * @throws {Error} If the element cannot be located after all strategies.
 */
async function selfHealingLocator(
    page,
    primaryLocator,
    elementName,
    fallbackStrategies = {},
    options = {}
) {
    let locator = page.locator(primaryLocator, options);
    let found = false;
    let usedStrategy = 'Primary Locator';
    let suggestedNewLocator = primaryLocator; // Start with primary, update if healed
    const timeout = options.timeout || 60000;

    // Try with primary locator first
    try {
        await locator.waitFor({ state: 'visible', timeout: timeout });
        found = true;
        console.log(`[Self-Healing] Found '${elementName}' using Primary Locator: '${primaryLocator}'`);
        return locator;
    } catch (e) {
        console.warn(`[Self-Healing] Primary locator failed for '${elementName}' (${primaryLocator}). Trying fallbacks...`);
    }

    // --- Fallback Strategies (ordered by robustness/preference) ---

    // 1. ByRole + Name (highly robust)
    if (!found && fallbackStrategies.role) {
        try {
            locator = page.getByRole(fallbackStrategies.role, { name: fallbackStrategies.name, exact: true });
            await locator.waitFor({ state: 'visible', timeout: timeout });
            found = true;
            usedStrategy = `ByRole('${fallbackStrategies.role}', {name: '${fallbackStrategies.name}'})`;
            suggestedNewLocator = `page.getByRole('${fallbackStrategies.role}', {name: '${fallbackStrategies.name}'})`;
            console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
        } catch (e) {
            console.warn(`[Self-Healing] Fallback ByRole failed for '${elementName}'.`);
        }
    }

    // 2. ByTestId (very robust)
    if (!found && fallbackStrategies.testId) {
        try {
            locator = page.getByTestId(fallbackStrategies.testId);
            await locator.waitFor({ state: 'visible', timeout: timeout });
            found = true;
            usedStrategy = `ByTestId('${fallbackStrategies.testId}')`;
            suggestedNewLocator = `page.getByTestId('${fallbackStrategies.testId}')`;
            console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
        } catch (e) {
            console.warn(`[Self-Healing] Fallback ByTestId failed for '${elementName}'.`);
        }
    }

    // 3. ByText (robust for visible text)
    if (!found && fallbackStrategies.text) {
        try {
            locator = page.getByText(fallbackStrategies.text, { exact: true });
            await locator.waitFor({ state: 'visible', timeout: timeout });
            found = true;
            usedStrategy = `ByText('${fallbackStrategies.text}')`;
            suggestedNewLocator = `page.getByText('${fallbackStrategies.text}')`;
            console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
        } catch (e) {
            console.warn(`[Self-Healing] Fallback ByText failed for '${elementName}'.`);
        }
    }

    // 4. ByAltText (for images/elements with alt text)
    if (!found && fallbackStrategies.altText) {
        try {
            locator = page.getByAltText(fallbackStrategies.altText, { exact: true });
            await locator.waitFor({ state: 'visible', timeout: timeout });
            found = true;
            usedStrategy = `ByAltText('${fallbackStrategies.altText}')`;
            suggestedNewLocator = `page.getByAltText('${fallbackStrategies.altText}')`;
            console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
        } catch (e) {
            console.warn(`[Self-Healing] Fallback ByAltText failed for '${elementName}'.`);
        }
    }

    // 5. ByTitle (for elements with title attribute)
    if (!found && fallbackStrategies.title) {
        try {
            locator = page.getByTitle(fallbackStrategies.title, { exact: true });
            await locator.waitFor({ state: 'visible', timeout: timeout });
            found = true;
            usedStrategy = `ByTitle('${fallbackStrategies.title}')`;
            suggestedNewLocator = `page.getByTitle('${fallbackStrategies.title}')`;
            console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
        } catch (e) {
            console.warn(`[Self-Healing] Fallback ByTitle failed for '${elementName}'.`);
        }
    }

    // 6. Fallback CSS (if all semantic locators fail)
    if (!found && fallbackStrategies.css) {
        try {
            locator = page.locator(fallbackStrategies.css, options);
            await locator.waitFor({ state: 'visible', timeout: timeout });
            found = true;
            usedStrategy = `CSS Selector ('${fallbackStrategies.css}')`;
            suggestedNewLocator = `page.locator('${fallbackStrategies.css}')`;
            console.log(`[Self-Healing] Healed '${elementName}' using ${usedStrategy}`);
        } catch (e) {
            console.warn(`[Self-Healing] Fallback CSS failed for '${elementName}'.`);
        }
    }

    // If a fallback worked, record the healing event
    if (found) {
        healedLocators.push({
            elementName: elementName,
            originalLocator: primaryLocator,
            healedLocator: suggestedNewLocator,
            strategyUsed: usedStrategy,
            timestamp: new Date().toISOString()
        });
        return locator;
    }

    // If no fallback worked, throw an error
    if (!found) {
        const errorMessage = `[Self-Healing] Failed to locate '${elementName}' using primary locator '${primaryLocator}' and all fallback strategies.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
}

module.exports = {
    selfHealingLocator,
    healedLocators
};