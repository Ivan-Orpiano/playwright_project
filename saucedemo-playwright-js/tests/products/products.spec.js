const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');
const TestHelpers = require('../../utils/testHelpers');
const { SORT_OPTIONS } = require('../../utils/constants');

test.describe('Products Page Functionality', () => {
  
  let loginPage, productsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    productsPage = new ProductsPage(page);
    const user = TestHelpers.getUser('standard');
    
    await loginPage.navigateToLogin();
    await loginPage.login(user.username, user.password);
  });


  test('should load products page with all elements', async ({ page }) => {
    // Verify URL
    await expect(page).toHaveURL(/inventory\.html/);
    
    // Verify page title
    expect(await productsPage.getPageTitle()).toBe('Products');
    
    // Verify products are displayed
    const productCount = await productsPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
    
    // Verify cart icon is visible
    expect(await productsPage.isVisible(productsPage.shoppingCartLink)).toBeTruthy();
  });


  test('should display correct number of products', async () => {
    const productCount = await productsPage.getProductCount();
    expect(productCount).toBe(6); // SauceDemo has 6 products
  });

  
  test('should sort products by name A to Z', async () => {
    // Default sort should be A-Z
    const currentSort = await productsPage.getCurrentSortOption();
    expect(currentSort).toBe(SORT_OPTIONS.NAME_A_TO_Z);
    
    const productNames = await productsPage.getAllProductNames();
    
    // Verify products are in alphabetical order
    const sortedNames = [...productNames].sort();
    expect(productNames).toEqual(sortedNames);
  });


  test('should sort products by name Z to A', async () => {
    await productsPage.sortProducts(SORT_OPTIONS.NAME_Z_TO_A);
    
    const productNames = await productsPage.getAllProductNames();
    
    // Verify products are in reverse alphabetical order
    const sortedNames = [...productNames].sort().reverse();
    expect(productNames).toEqual(sortedNames);
  });


  test('should sort products by price low to high', async () => {
    await productsPage.sortProducts(SORT_OPTIONS.PRICE_LOW_TO_HIGH);
    
    const priceStrings = await productsPage.getAllProductPrices();
    
    // Convert price strings to numbers
    const prices = priceStrings.map(price => 
      TestHelpers.extractPrice(price)
    );
    
    // Verify prices are in ascending order
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
  });


  test('should sort products by price high to low', async () => {
    await productsPage.sortProducts(SORT_OPTIONS.PRICE_HIGH_TO_LOW);
    
    const priceStrings = await productsPage.getAllProductPrices();
    const prices = priceStrings.map(price => 
      TestHelpers.extractPrice(price)
    );
    
    // Verify prices are in descending order
    for (let i = 0; i < prices.length - 1; i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
    }
  });


  test('should display product name, price, and description for all products', async () => {
    const productNames = await productsPage.getAllProductNames();
    const productPrices = await productsPage.getAllProductPrices();
    
    // Every product should have a name
    expect(productNames.length).toBe(6);
    productNames.forEach(name => {
      expect(name).toBeTruthy();
      expect(name.length).toBeGreaterThan(0);
    });
    
    // Every product should have a price
    expect(productPrices.length).toBe(6);
    productPrices.forEach(price => {
      expect(price).toMatch(/\$\d+\.\d{2}/); // Price format $XX.XX
    });
  });

  
  test('should display images for all products', async () => {
    const allImagesLoaded = await productsPage.areAllProductImagesLoaded();
    expect(allImagesLoaded).toBeTruthy();
  });

  test('should get price for specific product', async () => {
    const backpackProduct = TestHelpers.getProduct('backpack');
    const price = await productsPage.getProductPrice(backpackProduct);
    
    // Price should be in correct format
    expect(price).toMatch(/\$\d+\.\d{2}/);
    // Price should be a number when parsed
    const numericPrice = TestHelpers.extractPrice(price);
    expect(numericPrice).toBeGreaterThan(0);
  });
  
  test('should display product description', async () => {
    const backpackProduct = TestHelpers.getProduct('backpack');
    const description = await productsPage.getProductDescription(backpackProduct);
    
    expect(description).toBeTruthy();
    expect(description.length).toBeGreaterThan(0);
  });

  test('should show empty cart initially', async () => {
    const cartCount = await productsPage.getCartItemCount();
    expect(cartCount).toBe(0);
  });

  test('should navigate to cart page when cart icon is clicked', async ({ page }) => {
    await productsPage.goToCart();
    await expect(page).toHaveURL(/cart\.html/);
  });


  test('should open hamburger menu and display options', async () => {
    await productsPage.openMenu();
    
    // Verify menu options are visible
    expect(await productsPage.isVisible(productsPage.logoutLink)).toBeTruthy();
    expect(await productsPage.isVisible(productsPage.allItemsLink)).toBeTruthy();
    expect(await productsPage.isVisible(productsPage.aboutLink)).toBeTruthy();
    expect(await productsPage.isVisible(productsPage.resetAppLink)).toBeTruthy();
  });

  test('should navigate to product details when product name is clicked', async ({ page }) => {
    const backpackProduct = TestHelpers.getProduct('backpack');
    await productsPage.clickProductName(backpackProduct);
    
    // Should navigate to product detail page
    await expect(page).toHaveURL(/inventory-item\.html/);
  });
});