module.exports = {
  // Application URLs
  URLS: {
    BASE_URL: 'https://www.saucedemo.com',
    INVENTORY: '/inventory.html',
    CART: '/cart.html',
    CHECKOUT_STEP_ONE: '/checkout-step-one.html',
    CHECKOUT_STEP_TWO: '/checkout-step-two.html',
    CHECKOUT_COMPLETE: '/checkout-complete.html',
  },

  // Timeouts (in milliseconds)
  TIMEOUTS: {
    SHORT: 3000,    
    MEDIUM: 5000,   
    LONG: 10000,    
  },

  SORT_OPTIONS: {
    NAME_A_TO_Z: 'az',
    NAME_Z_TO_A: 'za',
    PRICE_LOW_TO_HIGH: 'lohi',
    PRICE_HIGH_TO_LOW: 'hilo',
  },

  ERROR_MESSAGES: {
    LOCKED_USER: 'Epic sadface: Sorry, this user has been locked out.',
    INVALID_CREDENTIALS: 'Epic sadface: Username and password do not match any user in this service',
    USERNAME_REQUIRED: 'Epic sadface: Username is required',
    PASSWORD_REQUIRED: 'Epic sadface: Password is required',
    FIRSTNAME_REQUIRED: 'Error: First Name is required',
    LASTNAME_REQUIRED: 'Error: Last Name is required',
    POSTAL_CODE_REQUIRED: 'Error: Postal Code is required',
  },

  SUCCESS_MESSAGES: {
    ORDER_COMPLETE: 'Thank you for your order!',
    ORDER_DISPATCHED: 'Your order has been dispatched',
  },
};
