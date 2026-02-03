const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');
const CartPage = require('../../pages/CartPage');
const CheckoutPage = require('../../pages/CheckoutPage');
const TestHelpers = require('../../utils/testHelpers');
const { ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../../utils/constants');

test.describe('Checkout Flow', () => {
  
  let loginPage, productsPage, cartPage, checkoutPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    cartPage = new CartPage(page);
    checkoutPage = new CheckoutPage(page);
    
    const user = TestHelpers.getUser('standard');
    const backpack = TestHelpers.getProduct('backpack');
    
    // Setup: Login and add product
    await loginPage.navigateToLogin();
    await loginPage.login(user.username, user.password);
    await productsPage.addProductToCart(backpack);
    await productsPage.goToCart();
  });

  // ==================== Checkout Information Tests ====================
  test('should complete checkout successfully with valid information', async ({ page }) => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    
    // Navigate to checkout
    await cartPage.proceedToCheckout();
    expect(await checkoutPage.isOnCheckoutInfoPage()).toBeTruthy();
    
    // Fill information and continue
    await checkoutPage.completeCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    // Verify on overview page
    expect(await checkoutPage.isOnCheckoutOverviewPage()).toBeTruthy();
    
    // Complete order
    await checkoutPage.clickFinish();
    
    // Verify order completion
    expect(await checkoutPage.isOnCheckoutCompletePage()).toBeTruthy();
    const headerText = await checkoutPage.getCompleteHeader();
    expect(headerText).toContain(SUCCESS_MESSAGES.ORDER_COMPLETE);
  });

  test('should display error when first name is missing', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('missingFirstName');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    // Should show error and stay on same page
    expect(await checkoutPage.isErrorDisplayed()).toBeTruthy();
    expect(await checkoutPage.getErrorMessage()).toBe(ERROR_MESSAGES.FIRSTNAME_REQUIRED);
    expect(await checkoutPage.isOnCheckoutInfoPage()).toBeTruthy();
  });

  test('should display error when last name is missing', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('missingLastName');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    expect(await checkoutPage.isErrorDisplayed()).toBeTruthy();
    expect(await checkoutPage.getErrorMessage()).toBe(ERROR_MESSAGES.LASTNAME_REQUIRED);
  });

  test('should display error when postal code is missing', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('missingPostalCode');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    expect(await checkoutPage.isErrorDisplayed()).toBeTruthy();
    expect(await checkoutPage.getErrorMessage()).toBe(ERROR_MESSAGES.POSTAL_CODE_REQUIRED);
  });

  test('should display error when all checkout fields are empty', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.clickContinue();
    
    // First name error should appear first
    expect(await checkoutPage.isErrorDisplayed()).toBeTruthy();
    expect(await checkoutPage.getErrorMessage()).toBe(ERROR_MESSAGES.FIRSTNAME_REQUIRED);
  });

  test('should return to cart when cancel is clicked on info page', async ({ page }) => {
    await cartPage.proceedToCheckout();
    await checkoutPage.clickCancel();
    
    // Should be back on cart page
    await expect(page).toHaveURL(/cart\.html/);
    expect(await cartPage.isOnCartPage()).toBeTruthy();
  });

 
  test('should allow error message to be dismissed on checkout page', async () => {
    await cartPage.proceedToCheckout();
    await checkoutPage.clickContinue(); // Trigger error
    
    expect(await checkoutPage.isErrorDisplayed()).toBeTruthy();
    
    await checkoutPage.closeErrorMessage();
    
    expect(await checkoutPage.isErrorDisplayed()).toBeFalsy();
  });

  // ==================== Checkout Overview Tests ====================


  test('should display correct products on checkout overview page', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    const backpack = TestHelpers.getProduct('backpack');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    // Verify on overview page
    expect(await checkoutPage.isOnCheckoutOverviewPage()).toBeTruthy();
    
    // Verify product is listed
    const productNames = await checkoutPage.getOverviewProductNames();
    expect(productNames).toContain(backpack);
  });

  test('should calculate correct total with tax on overview page', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    // Verify calculation
    const itemTotal = await checkoutPage.getItemTotal();
    const tax = await checkoutPage.getTaxAmount();
    const total = await checkoutPage.getTotalAmount();
    
    // Item total should be greater than 0
    expect(itemTotal).toBeGreaterThan(0);
    
    // Tax should be greater than 0
    expect(tax).toBeGreaterThan(0);
    
    // Total should equal item total + tax
    expect(await checkoutPage.isTotalCalculationCorrect()).toBeTruthy();
  });

  test('should display payment information on overview page', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    const paymentInfo = await checkoutPage.getPaymentInfo();
    expect(paymentInfo).toBeTruthy();
    expect(paymentInfo.length).toBeGreaterThan(0);
  });

  /**
   * Shipping information display test
   */
  test('should display shipping information on overview page', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    const shippingInfo = await checkoutPage.getShippingInfo();
    expect(shippingInfo).toBeTruthy();
    expect(shippingInfo.length).toBeGreaterThan(0);
  });

  test('should return to products page when cancel is clicked on overview', async ({ page }) => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    await checkoutPage.clickCancelOnOverview();
    
    // Should return to products page
    await expect(page).toHaveURL(/inventory\.html/);
  });

  // ==================== Checkout Complete Tests ====================

  test('should display success message on checkout complete page', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutFlow(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    const headerText = await checkoutPage.getCompleteHeader();
    const messageText = await checkoutPage.getCompleteText();
    
    expect(headerText).toContain(SUCCESS_MESSAGES.ORDER_COMPLETE);
    expect(messageText).toBeTruthy();
    expect(messageText.length).toBeGreaterThan(0);
  });

  test('should display success image on completion page', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutFlow(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    expect(await checkoutPage.isSuccessImageDisplayed()).toBeTruthy();
  });

  test('should return to products page when back home is clicked', async ({ page }) => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutFlow(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    await checkoutPage.clickBackHome();
    
    // Should be on products page
    await expect(page).toHaveURL(/inventory\.html/);
    expect(await productsPage.isOnProductsPage()).toBeTruthy();
  });

  test('should clear cart after successful checkout', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutFlow(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    // Return home and check cart
    await checkoutPage.clickBackHome();
    
    // Cart should be empty
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe(0);
  });


  test('should complete checkout with multiple items', async () => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    const bikeLight = TestHelpers.getProduct('bikeLight');
    const tshirt = TestHelpers.getProduct('boltTshirt');
    
    // Add more items
    await cartPage.continueShopping();
    await productsPage.addProductToCart(bikeLight);
    await productsPage.addProductToCart(tshirt);
    await productsPage.goToCart();
    
    // Proceed with checkout
    await cartPage.proceedToCheckout();
    await checkoutPage.completeCheckoutFlow(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    
    // Verify success
    expect(await checkoutPage.isOrderCompleted()).toBeTruthy();
  });


  test('should complete full e2e purchase flow', async ({ page }) => {
    const checkoutInfo = TestHelpers.getCheckoutInfo('valid');
    

    expect(await cartPage.getCartItemCount()).toBe(1);
    
    // Checkout
    await cartPage.proceedToCheckout();
    expect(await checkoutPage.isOnCheckoutInfoPage()).toBeTruthy();
    
    // Fill info
    await checkoutPage.fillCheckoutInformation(
      checkoutInfo.firstName,
      checkoutInfo.lastName,
      checkoutInfo.postalCode
    );
    await checkoutPage.clickContinue();
    
    // Verify overview
    expect(await checkoutPage.isOnCheckoutOverviewPage()).toBeTruthy();
    const itemCount = await checkoutPage.getOverviewItemCount();
    expect(itemCount).toBe(1);
    
    // Finish
    await checkoutPage.clickFinish();
    
    // Verify completion
    expect(await checkoutPage.isOnCheckoutCompletePage()).toBeTruthy();
    expect(await checkoutPage.isOrderCompleted()).toBeTruthy();
    
    // Return home
    await checkoutPage.clickBackHome();
    expect(await productsPage.isOnProductsPage()).toBeTruthy();
  });
});