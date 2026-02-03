

const BasePage = require('./BasePage');

class ProductsPage extends BasePage {
  constructor(page) {
    super(page);
    
 
    this.pageTitle = page.locator('.title');
    this.shoppingCartLink = page.locator('.shopping_cart_link');
    this.shoppingCartBadge = page.locator('.shopping_cart_badge');
    this.hamburgerMenu = page.locator('#react-burger-menu-btn');
    
    
    this.sortDropdown = page.locator('[data-test="product_sort_container"]');
    
    // Product list elements
    this.inventoryItems = page.locator('.inventory_item');
    this.inventoryItemNames = page.locator('.inventory_item_name');
    this.inventoryItemPrices = page.locator('.inventory_item_price');
    this.inventoryItemDescriptions = page.locator('.inventory_item_desc');
    
    // Side menu items (appears after clicking hamburger)
    this.logoutLink = page.locator('#logout_sidebar_link');
    this.allItemsLink = page.locator('#inventory_sidebar_link');
    this.aboutLink = page.locator('#about_sidebar_link');
    this.resetAppLink = page.locator('#reset_sidebar_link');
  }

  /**
   * Verify user successfully landed on products page
   * @returns {boolean} True if on products page
   */
  async isOnProductsPage() {
    const url = await this.getCurrentUrl();
    const titleText = await this.getText(this.pageTitle);
    return url.includes('/inventory.html') && titleText === 'Products';
  }

  /**
   * Get page title text
   * @returns {string} Page title
   */
  async getPageTitle() {
    return await this.getText(this.pageTitle);
  }

  /**
   * Get count of products displayed on page
   * @returns {number} Number of products
   */
  async getProductCount() {
    return await this.getElementCount(this.inventoryItems);
  }

  /**
   * Get all product names currently displayed
   * Useful for sorting validation
   * @returns {Promise<string[]>} Array of product names
   */
  async getAllProductNames() {
    return await this.getAllTextContents(this.inventoryItemNames);
  }

  /**
   * Get all product prices currently displayed
   * @returns {Promise<string[]>} Array of price strings (e.g., ["$29.99", "$9.99"])
   */
  async getAllProductPrices() {
    return await this.getAllTextContents(this.inventoryItemPrices);
  }

  /**
   * Sort products using dropdown
   * @param {string} sortOption - Sort option value (e.g., 'lohi', 'hilo', 'az', 'za')
   * 
   * Why string parameter: Makes tests more readable and matches actual dropdown values
   */
  async sortProducts(sortOption) {
    await this.selectOption(this.sortDropdown, sortOption);
    // Small wait for UI to update after sorting
    await this.page.waitForTimeout(500);
  }

  /**
   * Get currently selected sort option
   * @returns {string} Selected sort value
   */
  async getCurrentSortOption() {
    return await this.sortDropdown.inputValue();
  }

  /**
   * Add product to cart by product name
   * @param {string} productName - Name of the product to add
   * 
   * Why by name: More readable in tests than index-based approach
   * Dynamic locator based on product name makes it flexible
   */
  async addProductToCart(productName) {
    // Find the add to cart button for specific product
    // Using data-test attribute which follows pattern: add-to-cart-{product-name-lowercased-and-hyphenated}
    const productNameId = productName.toLowerCase().replace(/\s+/g, '-');
    const addButton = this.page.locator(`[data-test="add-to-cart-${productNameId}"]`);
    await this.click(addButton);
  }

  /**
   * Remove product from cart by product name
   * @param {string} productName - Name of the product to remove
   */
  async removeProductFromCart(productName) {
    const productNameId = productName.toLowerCase().replace(/\s+/g, '-');
    const removeButton = this.page.locator(`[data-test="remove-${productNameId}"]`);
    await this.click(removeButton);
  }

  /**
   * Check if product's "Remove" button is visible (meaning it's in cart)
   * @param {string} productName - Name of the product
   * @returns {boolean} True if remove button is visible
   */
  async isProductInCart(productName) {
    const productNameId = productName.toLowerCase().replace(/\s+/g, '-');
    const removeButton = this.page.locator(`[data-test="remove-${productNameId}"]`);
    return await this.isVisible(removeButton);
  }

  /**
   * Get cart item count from badge
   * Returns 0 if badge is not visible (empty cart)
   * @returns {number} Cart item count
   */
  async getCartItemCount() {
    const isBadgeVisible = await this.isVisible(this.shoppingCartBadge);
    if (!isBadgeVisible) {
      return 0;
    }
    const badgeText = await this.getText(this.shoppingCartBadge);
    return parseInt(badgeText, 10);
  }

  /**
   * Click on shopping cart icon to navigate to cart page
   */
  async goToCart() {
    await this.click(this.shoppingCartLink);
  }

  /**
   * Open hamburger menu
   */
  async openMenu() {
    await this.click(this.hamburgerMenu);
    // Wait for menu animation to complete
    await this.waitForElement(this.logoutLink);
  }

  /**
   * Logout from application
   * Must open menu first, then click logout
   */
  async logout() {
    await this.openMenu();
    await this.click(this.logoutLink);
  }

  /**
   * Reset app state (clears cart)
   * Useful for test cleanup
   */
  async resetAppState() {
    await this.openMenu();
    await this.click(this.resetAppLink);
  }

  /**
   * Get price of a specific product by name
   * @param {string} productName - Name of the product
   * @returns {string} Price string (e.g., "$29.99")
   */
  async getProductPrice(productName) {
    // Find the product item containing this name
    const productItem = this.page.locator('.inventory_item', { 
      has: this.page.locator('.inventory_item_name', { hasText: productName }) 
    });
    const priceElement = productItem.locator('.inventory_item_price');
    return await this.getText(priceElement);
  }

  /**
   * Get description of a specific product by name
   * @param {string} productName - Name of the product
   * @returns {string} Product description
   */
  async getProductDescription(productName) {
    const productItem = this.page.locator('.inventory_item', { 
      has: this.page.locator('.inventory_item_name', { hasText: productName }) 
    });
    const descElement = productItem.locator('.inventory_item_desc');
    return await this.getText(descElement);
  }

  /**
   * Click on product name to view product details
   * @param {string} productName - Name of the product
   */
  async clickProductName(productName) {
    const productLink = this.page.locator('.inventory_item_name', { hasText: productName });
    await this.click(productLink);
  }

  /**
   * Verify all products have images loaded
   * @returns {boolean} True if all images are loaded
   */
  async areAllProductImagesLoaded() {
    const images = this.page.locator('.inventory_item_img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const isVisible = await img.isVisible();
      if (!isVisible) {
        return false;
      }
    }
    return true;
  }
}

module.exports = ProductsPage;