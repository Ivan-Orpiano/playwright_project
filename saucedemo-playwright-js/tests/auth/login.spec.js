

const { test, expect } = require('@playwright/test');
const LoginPage = require('../../pages/LoginPage');
const ProductsPage = require('../../pages/ProductsPage');
const TestHelpers = require('../../utils/testHelpers');
const { ERROR_MESSAGES } = require('../../utils/constants');

// Test hooks - run before each test to setup clean state
test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigateToLogin();
});

// Group related tests using test.describe
test.describe('Login Functionality', () => {
  
  test('should login successfully with valid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    const user = TestHelpers.getUser('standard');
    
    // Perform login
    await loginPage.login(user.username, user.password);
    
    // Assertions - verify successful login
    // Why multiple assertions: Provides comprehensive validation
    await expect(page).toHaveURL(/inventory\.html/); // URL changes to inventory
    expect(await productsPage.isOnProductsPage()).toBeTruthy(); // Verify page content
    expect(await productsPage.getPageTitle()).toBe('Products'); // Verify page title
  });


  test('should display error for locked out user', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const user = TestHelpers.getUser('lockedOut');
    
    // Attempt login with locked user
    await loginPage.login(user.username, user.password);
    
    // Verify error is displayed and user stays on login page
    expect(await loginPage.isErrorDisplayed()).toBeTruthy();
    expect(await loginPage.getErrorMessage()).toBe(ERROR_MESSAGES.LOCKED_USER);
    expect(await loginPage.isOnLoginPage()).toBeTruthy(); // Should not proceed
  });


  test('should display error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const user = TestHelpers.getUser('invalidCredentials');
    
    await loginPage.login(user.username, user.password);
    
    // Verify appropriate error message
    expect(await loginPage.isErrorDisplayed()).toBeTruthy();
    expect(await loginPage.getErrorMessage()).toBe(ERROR_MESSAGES.INVALID_CREDENTIALS);
  });

  test('should display error when username is empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const user = TestHelpers.getUser('emptyUsername');
    
    await loginPage.login(user.username, user.password);
    
    expect(await loginPage.isErrorDisplayed()).toBeTruthy();
    expect(await loginPage.getErrorMessage()).toBe(ERROR_MESSAGES.USERNAME_REQUIRED);
  });


  test('should display error when password is empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const user = TestHelpers.getUser('emptyPassword');
    
    await loginPage.login(user.username, user.password);
    
    expect(await loginPage.isErrorDisplayed()).toBeTruthy();
    expect(await loginPage.getErrorMessage()).toBe(ERROR_MESSAGES.PASSWORD_REQUIRED);
  });

  test('should display error when both fields are empty', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.login('', '');
    
    expect(await loginPage.isErrorDisplayed()).toBeTruthy();
    // Username error takes precedence
    expect(await loginPage.getErrorMessage()).toBe(ERROR_MESSAGES.USERNAME_REQUIRED);
  });


  test('should display all login page elements', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    // Verify critical elements are visible
    expect(await loginPage.isVisible(loginPage.usernameInput)).toBeTruthy();
    expect(await loginPage.isVisible(loginPage.passwordInput)).toBeTruthy();
    expect(await loginPage.isVisible(loginPage.loginButton)).toBeTruthy();
    expect(await loginPage.isVisible(loginPage.loginLogo)).toBeTruthy();
  });

  test('should allow login for different valid user types', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const productsPage = new ProductsPage(page);
    
    // Test with performance user
    const performanceUser = TestHelpers.getUser('performance');
    await loginPage.login(performanceUser.username, performanceUser.password);
    expect(await productsPage.isOnProductsPage()).toBeTruthy();
    
    // Logout and test with problem user
    await productsPage.logout();
    const problemUser = TestHelpers.getUser('problem');
    await loginPage.login(problemUser.username, problemUser.password);
    expect(await productsPage.isOnProductsPage()).toBeTruthy();
  });

  test('should allow error message to be dismissed', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const user = TestHelpers.getUser('invalidCredentials');
    
    await loginPage.login(user.username, user.password);
    
    // Verify error is displayed
    expect(await loginPage.isErrorDisplayed()).toBeTruthy();
    
    // Close error message
    await loginPage.closeErrorMessage();
    
    // Verify error is no longer visible
    expect(await loginPage.isErrorDisplayed()).toBeFalsy();
  });
});