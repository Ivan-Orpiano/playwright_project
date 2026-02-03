

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page - Playwright page object
   */
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   * @param {string} url - URL to navigate to (can be relative to baseURL)
   */
  async goto(url) {
    await this.page.goto(url);
  }

  /**
   * Get current page URL
   * @returns {string} Current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Get page title
   * @returns {string} Page title
   */
  async getTitle() {
    return await this.page.title();
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click on an element using locator
   * @param {import('@playwright/test').Locator} locator - Element locator
   */
  async click(locator) {
    await locator.click();
  }

  /**
   * Fill input field with text
   * @param {import('@playwright/test').Locator} locator - Input field locator
   * @param {string} text - Text to fill
   */
  async fill(locator, text) {
    await locator.fill(text);
  }

  /**
   * Get text content from an element
   * @param {import('@playwright/test').Locator} locator - Element locator
   * @returns {string} Text content
   */
  async getText(locator) {
    return await locator.textContent();
  }

  /**
   * Check if element is visible
   * @param {import('@playwright/test').Locator} locator - Element locator
   * @returns {boolean} True if visible, false otherwise
   */
  async isVisible(locator) {
    return await locator.isVisible();
  }

  /**
   * Check if element is enabled
   * @param {import('@playwright/test').Locator} locator - Element locator
   * @returns {boolean} True if enabled, false otherwise
   */
  async isEnabled(locator) {
    return await locator.isEnabled();
  }

  /**
   * Wait for element to be visible
   * @param {import('@playwright/test').Locator} locator - Element locator
   * @param {number} timeout - Optional timeout in milliseconds
   */
  async waitForElement(locator, timeout = 10000) {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Get count of elements matching locator
   * @param {import('@playwright/test').Locator} locator - Element locator
   * @returns {number} Count of elements
   */
  async getElementCount(locator) {
    return await locator.count();
  }

  /**
   * Select option from dropdown by value
   * @param {import('@playwright/test').Locator} locator - Dropdown locator
   * @param {string} value - Option value to select
   */
  async selectOption(locator, value) {
    await locator.selectOption(value);
  }

  /**
   * Take screenshot of current page
   * @param {string} screenshotName - Name for the screenshot file
   */
  async takeScreenshot(screenshotName) {
    await this.page.screenshot({ 
      path: `screenshots/${screenshotName}.png`,
      fullPage: true 
    });
  }

  /**
   * Get all text contents from multiple elements
   * Useful for getting list of product names, prices, etc.
   * @param {import('@playwright/test').Locator} locator - Elements locator
   * @returns {Promise<string[]>} Array of text contents
   */
  async getAllTextContents(locator) {
    return await locator.allTextContents();
  }

  /**
   * Refresh the current page
   */
  async refresh() {
    await this.page.reload();
  }

  /**
   * Go back to previous page
   */
  async goBack() {
    await this.page.goBack();
  }

  /**
   * Scroll element into view
   * @param {import('@playwright/test').Locator} locator - Element locator
   */
  async scrollIntoView(locator) {
    await locator.scrollIntoViewIfNeeded();
  }
}

module.exports = BasePage;