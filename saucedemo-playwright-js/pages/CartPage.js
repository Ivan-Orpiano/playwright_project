const BasePage = require('./BasePage');

class CartPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Header elements
    this.pageTitle = page.locator('.title');
    this.continueShoppingButton = page.locator('[data-test="continue-shopping"]');
    this.checkoutButton = page.locator('[data-test="checkout"]');
    
    // Cart items
    this.cartItems = page.locator('.cart_item');
    this.cartItemNames = page.locator('.inventory_item_name');
    this.cartItemPrices = page.locator('.inventory_item_price');
    this.cartItemQuantities = page.locator('.cart_quantity');
    this.cartItemDescriptions = page.locator('.inventory_item_desc');
    
    // Empty cart message (when no items in cart)
    this.emptyCartMessage = page.locator('.removed_cart_item');
  }

  /**
   * Verify we're on the cart page
   * @returns {boolean} True if on cart page
   */
  async isOnCartPage() {
    const url = await this.getCurrentUrl();
    const titleText = await this.getText(this.pageTitle);
    return url.includes('/cart.html') && titleText === 'Your Cart';
  }

  /**
   * Get page title
   * @returns {string} Page title text
   */
  async getPageTitle() {
    return await this.getText(this.pageTitle);
  }

  /**
   * Get number of items in cart
   * @returns {number} Count of cart items
   */
  async getCartItemCount() {
    return await this.getElementCount(this.cartItems);
  }

  /**
   * Check if cart is empty
   * @returns {boolean} True if cart has no items
   */
  async isCartEmpty() {
    const count = await this.getCartItemCount();
    return count === 0;
  }

  /**
   * Get all product names in cart
   * Useful for verifying correct items were added
   * @returns {Promise<string[]>} Array of product names
   */
  async getAllCartItemNames() {
    return await this.getAllTextContents(this.cartItemNames);
  }

  /**
   * Get all product prices in cart
   * @returns {Promise<string[]>} Array of prices
   */
  async getAllCartItemPrices() {
    return await this.getAllTextContents(this.cartItemPrices);
  }

  /**
   * Get all product quantities in cart
   * @returns {Promise<string[]>} Array of quantities
   */
  async getAllCartItemQuantities() {
    return await this.getAllTextContents(this.cartItemQuantities);
  }

  /**
   * Check if specific product is in cart
   * @param {string} productName - Name of the product
   * @returns {boolean} True if product is in cart
   */
  async isProductInCart(productName) {
    const itemNames = await this.getAllCartItemNames();
    return itemNames.includes(productName);
  }

  /**
   * Remove product from cart by name
   * @param {string} productName - Name of the product to remove
   * 
   * Why by name: More maintainable than index-based removal
   * and matches real user behavior (removing specific items)
   */
  async removeProductFromCart(productName) {
    const productNameId = productName.toLowerCase().replace(/\s+/g, '-');
    const removeButton = this.page.locator(`[data-test="remove-${productNameId}"]`);
    await this.click(removeButton);
  }

  /**
   * Get price of specific product in cart
   * @param {string} productName - Name of the product
   * @returns {string} Price string
   */
  async getProductPrice(productName) {
    // Find cart item with this product name
    const cartItem = this.page.locator('.cart_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName })
    });
    const priceElement = cartItem.locator('.inventory_item_price');
    return await this.getText(priceElement);
  }

  /**
   * Get quantity of specific product in cart
   * @param {string} productName - Name of the product
   * @returns {number} Quantity
   */
  async getProductQuantity(productName) {
    const cartItem = this.page.locator('.cart_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName })
    });
    const quantityElement = cartItem.locator('.cart_quantity');
    const quantityText = await this.getText(quantityElement);
    return parseInt(quantityText, 10);
  }

  /**
   * Get description of specific product in cart
   * @param {string} productName - Name of the product
   * @returns {string} Product description
   */
  async getProductDescription(productName) {
    const cartItem = this.page.locator('.cart_item', {
      has: this.page.locator('.inventory_item_name', { hasText: productName })
    });
    const descElement = cartItem.locator('.inventory_item_desc');
    return await this.getText(descElement);
  }

  /**
   * Click Continue Shopping button to return to products page
   */
  async continueShopping() {
    await this.click(this.continueShoppingButton);
  }

  /**
   * Click Checkout button to proceed to checkout
   */
  async proceedToCheckout() {
    await this.click(this.checkoutButton);
  }

  /**
   * Verify checkout button is enabled
   * Button should only be enabled when cart has items
   * @returns {boolean} True if checkout button is enabled
   */
  async isCheckoutButtonEnabled() {
    return await this.isEnabled(this.checkoutButton);
  }

  /**
   * Calculate total price of all items in cart
   * Useful for price validation tests
   * @returns {number} Total price
   */
  async calculateTotalPrice() {
    const prices = await this.getAllCartItemPrices();
    let total = 0;
    
    for (const priceString of prices) {
      // Remove $ and convert to number
      const price = parseFloat(priceString.replace('$', ''));
      total += price;
    }
    
    return total;
  }

  /**
   * Remove all items from cart
   * Useful for cleanup or testing empty cart scenarios
   */
  async removeAllItems() {
    const itemCount = await this.getCartItemCount();
    
    // Remove items in reverse order to avoid stale element issues
    for (let i = itemCount - 1; i >= 0; i--) {
      const removeButtons = this.page.locator('[data-test^="remove-"]');
      const button = removeButtons.nth(i);
      await this.click(button);
      // Small wait for UI to update
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Verify all cart items have images
   * @returns {boolean} True if all items have visible images
   */
  async areAllItemImagesVisible() {
    const images = this.page.locator('.cart_item_img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const isVisible = await images.nth(i).isVisible();
      if (!isVisible) {
        return false;
      }
    }
    return true;
  }
}

module.exports = CartPage;