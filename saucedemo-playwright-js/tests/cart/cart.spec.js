const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');
const CartPage = require('../../pages/CartPage');
const TestHelpers = require('../../utils/testHelpers');

test.describe('Shopping Cart Functionality', () => {
  
  let loginPage, productsPage, cartPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    const user = TestHelpers.getUser('standard');
    
    await loginPage.navigateToLogin();
    await loginPage.login(user.username, user.password);
  });

  // ==================== Add to Cart Tests ====================

  test('should add single product to cart', async () => {
    const backpackProduct = TestHelpers.getProduct('backpack');
    
    // Add product to cart
    await productsPage.addProductToCart(backpackProduct);
    
    // Verify cart badge shows 1 item
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe(1);
    
    // Verify button text changed to "Remove"
    expect(await productsPage.isProductInCart(backpackProduct)).toBeTruthy();
  });

  test('should add multiple products to cart', async () => {
    const backpack = TestHelpers.getProduct('backpack');
    const bikeLight = TestHelpers.getProduct('bikeLight');
    const tshirt = TestHelpers.getProduct('boltTshirt');
    
    // Add three products
    await productsPage.addProductToCart(backpack);
    await productsPage.addProductToCart(bikeLight);
    await productsPage.addProductToCart(tshirt);
    
    // Verify cart badge shows 3 items
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe(3);
  });

  test('should update cart badge count as items are added', async () => {
    const backpack = TestHelpers.getProduct('backpack');
    const bikeLight = TestHelpers.getProduct('bikeLight');
    
    // Initially cart should be empty
    expect(await productsPage.getCartItemCount()).toBe(0);
    
    // Add first item
    await productsPage.addProductToCart(backpack);
    expect(await productsPage.getCartItemCount()).toBe(1);
    
    // Add second item
    await productsPage.addProductToCart(bikeLight);
    expect(await productsPage.getCartItemCount()).toBe(2);
  });

  // ==================== Remove from Cart Tests ====================

  test('should remove product from cart on products page', async () => {
    const backpack = TestHelpers.getProduct('backpack');
    
    // Add then remove
    await productsPage.addProductToCart(backpack);
    expect(await productsPage.getCartItemCount()).toBe(1);
    
    await productsPage.removeProductFromCart(backpack);
    expect(await productsPage.getCartItemCount()).toBe(0);
    
    // Verify button text changed back to "Add to cart"
    expect(await productsPage.isProductInCart(backpack)).toBeFalsy();
  });

  test('should remove one product while keeping others in cart', async () => {
    const backpack = TestHelpers.getProduct('backpack');
    const bikeLight = TestHelpers.getProduct('bikeLight');
    const tshirt = TestHelpers.getProduct('boltTshirt');
    
    // Add three products
    await productsPage.addProductToCart(backpack);
    await productsPage.addProductToCart(bikeLight);
    await productsPage.addProductToCart(tshirt);
    expect(await productsPage.getCartItemCount()).toBe(3);
    
    // Remove middle product
    await productsPage.removeProductFromCart(bikeLight);
    
    // Should have 2 items remaining
    expect(await productsPage.getCartItemCount()).toBe(2);
    expect(await productsPage.isProductInCart(backpack)).toBeTruthy();
    expect(await productsPage.isProductInCart(tshirt)).toBeTruthy();
  });

  // ==================== Cart Page Tests ====================

  test('should navigate to cart page and display added items', async ({ page }) => {
    const backpack = TestHelpers.getProduct('backpack');
    const bikeLight = TestHelpers.getProduct('bikeLight');
    
    // Add items and navigate to cart
    await productsPage.addProductToCart(backpack);
    await productsPage.addProductToCart(bikeLight);
    await productsPage.goToCart();
    
    // Verify cart page loaded
    expect(await cartPage.isOnCartPage()).toBeTruthy();
    await expect(page).toHaveURL(/cart\.html/);
    
    // Verify correct items are in cart
    expect(await cartPage.getCartItemCount()).toBe(2);
    expect(await cartPage.isProductInCart(backpack)).toBeTruthy();
    expect(await cartPage.isProductInCart(bikeLight)).toBeTruthy();
  });

  test('should display correct product details in cart', async () => {
    const backpack = TestHelpers.getProduct('backpack');
    
    // Get price from products page
    const productPagePrice = await productsPage.getProductPrice(backpack);
    
    // Add to cart and navigate
    await productsPage.addProductToCart(backpack);
    await productsPage.goToCart();
    
    // Verify details match
    const cartPrice = await cartPage.getProductPrice(backpack);
    expect(cartPrice).toBe(productPagePrice);
    
    // Verify quantity is 1
    const quantity = await cartPage.getProductQuantity(backpack);
    expect(quantity).toBe(1);
  });

  test('should remove product from cart page', async () => {
    const backpack = TestHelpers.getProduct('backpack');
    
    // Add item, go to cart, and remove
    await productsPage.addProductToCart(backpack);
    await productsPage.goToCart();
    
    expect(await cartPage.getCartItemCount()).toBe(1);
    
    await cartPage.removeProductFromCart(backpack);
    
    // Cart should be empty
    expect(await cartPage.isCartEmpty()).toBeTruthy();
  });

  test('should display empty cart when no items added', async ({ page }) => {
    await productsPage.goToCart();
    
    expect(await cartPage.isOnCartPage()).toBeTruthy();
    expect(await cartPage.isCartEmpty()).toBeTruthy();
    expect(await cartPage.getCartItemCount()).toBe(0);
  });

  test('should return to products page when continue shopping is clicked', async ({ page }) => {
    const backpack = TestHelpers.getProduct('backpack');
    
    await productsPage.addProductToCart(backpack);
    await productsPage.goToCart();
    
    // Click continue shopping
    await cartPage.continueShopping();
    
    // Should be back on products page
    await expect(page).toHaveURL(/inventory\.html/);
    expect(await productsPage.isOnProductsPage()).toBeTruthy();
  });


  test('should persist cart items when navigating between pages', async () => {
    const backpack = TestHelpers.getProduct('backpack');
    const bikeLight = TestHelpers.getProduct('bikeLight');
    
    // Add items
    await productsPage.addProductToCart(backpack);
    await productsPage.addProductToCart(bikeLight);
    
    // Go to cart
    await productsPage.goToCart();
    expect(await cartPage.getCartItemCount()).toBe(2);
    
    // Return to products
    await cartPage.continueShopping();
    expect(await productsPage.getCartItemCount()).toBe(2);
    
    // Back to cart again
    await productsPage.goToCart();
    expect(await cartPage.getCartItemCount()).toBe(2);
  });

  test('should get all product names from cart', async () => {
    const backpack = TestHelpers.getProduct('backpack');
    const bikeLight = TestHelpers.getProduct('bikeLight');
    const tshirt = TestHelpers.getProduct('boltTshirt');
    
    await productsPage.addProductToCart(backpack);
    await productsPage.addProductToCart(bikeLight);
    await productsPage.addProductToCart(tshirt);
    await productsPage.goToCart();
    
    const cartItemNames = await cartPage.getAllCartItemNames();
    
    expect(cartItemNames).toContain(backpack);
    expect(cartItemNames).toContain(bikeLight);
    expect(cartItemNames).toContain(tshirt);
    expect(cartItemNames.length).toBe(3);
  });


  test('should calculate correct total price for cart items', async () => {
    const backpack = TestHelpers.getProduct('backpack');
    const bikeLight = TestHelpers.getProduct('bikeLight');
    
    await productsPage.addProductToCart(backpack);
    await productsPage.addProductToCart(bikeLight);
    await productsPage.goToCart();
    
    // Get individual prices
    const backpackPrice = TestHelpers.extractPrice(
      await cartPage.getProductPrice(backpack)
    );
    const bikeLightPrice = TestHelpers.extractPrice(
      await cartPage.getProductPrice(bikeLight)
    );
    
    // Calculate expected total
    const expectedTotal = backpackPrice + bikeLightPrice;
    
    // Get actual total from cart
    const actualTotal = await cartPage.calculateTotalPrice();
    
    expect(actualTotal).toBe(expectedTotal);
  });


  test('should enable checkout button when cart has items', async () => {
    const backpack = TestHelpers.getProduct('backpack');
    
    // Empty cart - checkout should still be enabled (SauceDemo allows empty checkout)
    await productsPage.goToCart();
    expect(await cartPage.isCheckoutButtonEnabled()).toBeTruthy();
    
    // Add item
    await cartPage.continueShopping();
    await productsPage.addProductToCart(backpack);
    await productsPage.goToCart();
    
    // Checkout should be enabled
    expect(await cartPage.isCheckoutButtonEnabled()).toBeTruthy();
  });
});