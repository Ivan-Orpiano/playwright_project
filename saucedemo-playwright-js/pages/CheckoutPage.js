const BasePage = require('./BasePage');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    
    // ===== Checkout Information =====
    this.pageTitle = page.locator('.title');
    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator('[data-test="cancel"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('[data-test="error-button"]');
    
    // ===== Checkout Overview =====
    this.cartItems = page.locator('.cart_item');
    this.itemTotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel = page.locator('.summary_tax_label');
    this.totalLabel = page.locator('.summary_total_label');
    this.finishButton = page.locator('[data-test="finish"]');
    this.cancelButtonOverview = page.locator('[data-test="cancel"]');
    
    // Payment and shipping info on overview page
    this.paymentInfo = page.locator('[data-test="payment-info-value"]');
    this.shippingInfo = page.locator('[data-test="shipping-info-value"]');
    
    // ===== STEP 3: Checkout Complete =====
    this.completeHeader = page.locator('.complete-header');
    this.completeText = page.locator('.complete-text');
    this.backHomeButton = page.locator('[data-test="back-to-products"]');
    this.ponyExpressImage = page.locator('.pony_express');
  }

  // ==================== Information Page Methods ====================

  /**
   * Verify we're on checkout information page (Step 1)
   * @returns {boolean} True if on checkout info page
   */
  async isOnCheckoutInfoPage() {
    const url = await this.getCurrentUrl();
    const titleText = await this.getText(this.pageTitle);
    return url.includes('/checkout-step-one.html') && 
           titleText === 'Checkout: Your Information';
  }

  /**
   * Fill checkout information form
   * @param {string} firstName - First name
   * @param {string} lastName - Last name
   * @param {string} postalCode - Postal/ZIP code
   * 
   * Why separate parameters: Makes it explicit what data is needed
   * and allows partial form filling for negative tests
   */
  async fillCheckoutInformation(firstName, lastName, postalCode) {
    await this.fill(this.firstNameInput, firstName);
    await this.fill(this.lastNameInput, lastName);
    await this.fill(this.postalCodeInput, postalCode);
  }

  async clickContinue() {
    await this.click(this.continueButton);
  }

  /**
   * Complete checkout information step (fill and continue)
   * @param {string} firstName 
   * @param {string} lastName 
   * @param {string} postalCode 
   * 
   * Why combined method: Common happy path - fill all fields and proceed
   */
  async completeCheckoutInformation(firstName, lastName, postalCode) {
    await this.fillCheckoutInformation(firstName, lastName, postalCode);
    await this.clickContinue();
  }

  async clickCancel() {
    await this.click(this.cancelButton);
  }

  /**
   * Get error message on checkout info page
   * @returns {string} Error message text
   */
  async getErrorMessage() {
    await this.waitForElement(this.errorMessage);
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if error message is displayed
   * @returns {boolean} True if error is visible
   */
  async isErrorDisplayed() {
    return await this.isVisible(this.errorMessage);
  }

  /**
   * Close error message
   */
  async closeErrorMessage() {
    await this.click(this.errorCloseButton);
  }

  async clearCheckoutFields() {
    await this.firstNameInput.clear();
    await this.lastNameInput.clear();
    await this.postalCodeInput.clear();
  }


  /**
   * Verify we're on checkout overview page (Step 2)
   * @returns {boolean} True if on overview page
   */
  async isOnCheckoutOverviewPage() {
    const url = await this.getCurrentUrl();
    const titleText = await this.getText(this.pageTitle);
    return url.includes('/checkout-step-two.html') && 
           titleText === 'Checkout: Overview';
  }

  /**
   * Get number of items in checkout overview
   * @returns {number} Item count
   */
  async getOverviewItemCount() {
    return await this.getElementCount(this.cartItems);
  }

  /**
   * Get item total (subtotal before tax)
   * @returns {number} Item total as number
   */
  async getItemTotal() {
    const text = await this.getText(this.itemTotalLabel);
    // Extract number from "Item total: $XX.XX"
    const match = text.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get tax amount
   * @returns {number} Tax amount as number
   */
  async getTaxAmount() {
    const text = await this.getText(this.taxLabel);
    const match = text.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Get total amount (item total + tax)
   * @returns {number} Total amount as number
   */
  async getTotalAmount() {
    const text = await this.getText(this.totalLabel);
    const match = text.match(/\$([0-9.]+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  /**
   * Verify total calculation is correct
   * Total should equal item total + tax
   * @returns {boolean} True if calculation is correct
   */
  async isTotalCalculationCorrect() {
    const itemTotal = await this.getItemTotal();
    const tax = await this.getTaxAmount();
    const total = await this.getTotalAmount();
    
    // Use toFixed to handle floating point precision
    const expectedTotal = (itemTotal + tax).toFixed(2);
    const actualTotal = total.toFixed(2);
    
    return expectedTotal === actualTotal;
  }

  /**
   * Get payment information text
   * @returns {string} Payment info
   */
  async getPaymentInfo() {
    return await this.getText(this.paymentInfo);
  }

  /**
   * Get shipping information text
   * @returns {string} Shipping info
   */
  async getShippingInfo() {
    return await this.getText(this.shippingInfo);
  }

  /**
   * Click Finish button to complete order
   */
  async clickFinish() {
    await this.click(this.finishButton);
  }

  /**
   * Click Cancel on overview page to return to products
   */
  async clickCancelOnOverview() {
    await this.click(this.cancelButtonOverview);
  }

  /**
   * Get all product names on overview page
   * @returns {Promise<string[]>} Array of product names
   */
  async getOverviewProductNames() {
    const nameElements = this.page.locator('.inventory_item_name');
    return await this.getAllTextContents(nameElements);
  }

  // ==================== Complete Page Methods ====================

  /**
   * Verify we're on checkout complete page
   * @returns {boolean} True if on complete page
   */
  async isOnCheckoutCompletePage() {
    const url = await this.getCurrentUrl();
    return url.includes('/checkout-complete.html');
  }

  /**
   * Get order completion header text
   * @returns {string} Header text (should be "Thank you for your order!")
   */
  async getCompleteHeader() {
    return await this.getText(this.completeHeader);
  }

  /**
   * Get order completion message text
   * @returns {string} Completion message
   */
  async getCompleteText() {
    return await this.getText(this.completeText);
  }

  /**
   * Check if success image is displayed
   * @returns {boolean} True if pony express image is visible
   */
  async isSuccessImageDisplayed() {
    return await this.isVisible(this.ponyExpressImage);
  }

  /**
   * Click Back Home button to return to products page
   */
  async clickBackHome() {
    await this.click(this.backHomeButton);
  }

  /**
   * Verify order was successfully completed
   * Checks both header text and URL
   * @returns {boolean} True if order completed successfully
   */
  async isOrderCompleted() {
    const isOnCompletePage = await this.isOnCheckoutCompletePage();
    const header = await this.getCompleteHeader();
    return isOnCompletePage && header.includes('Thank you for your order');
  }


  /**
   * Complete entire checkout flow in one method
   * Useful for happy path tests
   * @param {string} firstName 
   * @param {string} lastName 
   * @param {string} postalCode 
   */
  async completeCheckoutFlow(firstName, lastName, postalCode) {
    // Step 1: Fill information
    await this.fillCheckoutInformation(firstName, lastName, postalCode);
    await this.clickContinue();
    
    // Step 2: Verify overview and finish
    await this.waitForElement(this.finishButton);
    await this.clickFinish();
    
    // Step 3: Verify completion
    await this.waitForElement(this.completeHeader);
  }
}

module.exports = CheckoutPage;