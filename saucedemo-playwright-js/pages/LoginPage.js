
const BasePage = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.locator('[data-test="username"]');
    this.passwordInput = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.errorMessage = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('[data-test="error-button"]');
    
    this.loginLogo = page.locator('.login_logo');
  }

  async navigateToLogin() {
    await this.goto('/');
  }

  /**
   * Perform login action with username and password
   * @param {string} username - Username to login with
   * @param {string} password - Password to login with
   * 
   * Why separate method: Encapsulates the multi-step login process
   * into a single, reusable action
   */
  async login(username, password) {
    await this.fill(this.usernameInput, username);
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }


  async loginAsStandardUser() {
    await this.login('standard_user', 'secret_sauce');
  }

  /**
   * Get error message text when login fails
   * @returns {string} Error message text
   */
  async getErrorMessage() {
    // Wait for error to appear before getting text
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


  async closeErrorMessage() {
    await this.click(this.errorCloseButton);
  }

  /**
   * Check if login button is enabled
   * @returns {boolean} True if button is enabled
   */
  async isLoginButtonEnabled() {
    return await this.isEnabled(this.loginButton);
  }

  /**
   * Get the login logo text
   * Useful for verifying we're on the correct page
   * @returns {string} Logo text
   */
  async getLoginLogoText() {
    return await this.getText(this.loginLogo);
  }


  async clearFields() {
    await this.usernameInput.clear();
    await this.passwordInput.clear();
  }

  /**
   * Check if we're on login page by verifying URL
   * @returns {boolean} True if on login page
   */
  async isOnLoginPage() {
    const url = await this.getCurrentUrl();
    return url === 'https://www.saucedemo.com/' || url.endsWith('saucedemo.com/');
  }

  /**
   * Get placeholder text for username field
   * Useful for UI validation tests
   * @returns {string} Placeholder text
   */
  async getUsernamePlaceholder() {
    return await this.usernameInput.getAttribute('placeholder');
  }

  /**
   * Get placeholder text for password field
   * @returns {string} Placeholder text
   */
  async getPasswordPlaceholder() {
    return await this.passwordInput.getAttribute('placeholder');
  }
}

module.exports = LoginPage;