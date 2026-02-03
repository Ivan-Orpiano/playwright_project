const testData = require('../test-data/users.json');

class TestHelpers {
  /**
   * Get test user credentials by type
   * @param {string} userType - Type of user (e.g., 'standard', 'locked', 'invalid')
   * @returns {object} User credentials object
   */
  static getUser(userType) {
    // Check in valid users first
    if (testData.validUsers[userType]) {
      return testData.validUsers[userType];
    }
    // Then check invalid users
    if (testData.invalidUsers[userType]) {
      return testData.invalidUsers[userType];
    }
    throw new Error(`User type '${userType}' not found in test data`);
  }

  /**
   * Get checkout information by type
   * @param {string} infoType - Type of checkout info (e.g., 'valid', 'missingFirstName')
   * @returns {object} Checkout information object
   */
  static getCheckoutInfo(infoType) {
    if (testData.checkoutInfo[infoType]) {
      return testData.checkoutInfo[infoType];
    }
    throw new Error(`Checkout info type '${infoType}' not found in test data`);
  }

  /**
   * Get product name from test data
   * @param {string} productKey - Key for the product (e.g., 'backpack', 'bikeLight')
   * @returns {string} Product name
   */
  static getProduct(productKey) {
    if (testData.products[productKey]) {
      return testData.products[productKey];
    }
    throw new Error(`Product '${productKey}' not found in test data`);
  }

  /**
   * Generate random email for unique test data
   * @returns {string} Random email address
   */
  static generateRandomEmail() {
    const timestamp = Date.now();
    return `testuser_${timestamp}@example.com`;
  }

  /**
   * Wait for a specific condition to be true
   * Useful for custom waiting logic beyond Playwright's built-in waits
   * @param {Function} condition - Function that returns boolean
   * @param {number} timeout - Maximum time to wait in milliseconds
   * @param {number} interval -
   */
  static async waitForCondition(condition, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Extract numeric value from price string
   * Example: "$29.99" => 29.99
   * @param {string} priceString - Price string with currency symbol
   * @returns {number} Numeric price value
   */
  static extractPrice(priceString) {
    return parseFloat(priceString.replace(/[^0-9.]/g, ''));
  }

  /**
   * Format date to readable string
   * Useful for test reporting and logging
   * @returns {string} Formatted date string
   */
  static getFormattedDate() {
    const now = new Date();
    return now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
  }

  /**
   * Generate unique test ID for naming screenshots or test runs
   * @param {string} testName - Name of the test
   * @returns {string} Unique test identifier
   */
  static generateTestId(testName) {
    const timestamp = Date.now();
    const sanitized = testName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    return `${sanitized}_${timestamp}`;
  }
}

module.exports = TestHelpers;