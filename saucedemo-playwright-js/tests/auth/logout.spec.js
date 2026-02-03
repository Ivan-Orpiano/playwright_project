const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');
const TestHelpers = require('../../utils/testHelpers');

test.describe('Logout Functionality', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const user = TestHelpers.getUser('standard');
    
    await loginPage.navigateToLogin();
    await loginPage.login(user.username, user.password);
  });

   test('should logout successfully and redirect to login page', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const loginPage = new LoginPage(page);
    
    // Perform logout
    await productsPage.logout();
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/^https:\/\/www\.saucedemo\.com\/?$/);
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
    
    // Verify login elements are visible again
    expect(await loginPage.isVisible(loginPage.usernameInput)).toBeTruthy();
    expect(await loginPage.isVisible(loginPage.loginButton)).toBeTruthy();
  });

  test('should not allow access to inventory page after logout', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const loginPage = new LoginPage(page);
    
    // Logout
    await productsPage.logout();
    
    // Try to navigate back to inventory page
    await page.goto('/inventory.html');
    
    // Should be redirected back to login page
    await expect(page).toHaveURL(/^https:\/\/www\.saucedemo\.com\/?$/);
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
  });

  test('should open menu and display logout option', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    
    // Open hamburger menu
    await productsPage.openMenu();
    
    // Verify logout link is visible in menu
    expect(await productsPage.isVisible(productsPage.logoutLink)).toBeTruthy();
  });

  test('should allow re-login after logout', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    const loginPage = new LoginPage(page);
    const user = TestHelpers.getUser('standard');
    
    // Logout
    await productsPage.logout();
    expect(await loginPage.isOnLoginPage()).toBeTruthy();
    
    // Login again
    await loginPage.login(user.username, user.password);
    
    // Verify successful re-login
    expect(await productsPage.isOnProductsPage()).toBeTruthy();
  });
});