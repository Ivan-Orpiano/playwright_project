// @ts-check
// @ts-ignore
const { defineConfig, devices } = require('@playwright/test');



module.exports = defineConfig({
  testDir: './tests',
  
  timeout: 30 * 1000,
  
  // Test execution settings
  fullyParallel: true, // Run tests in parallel for faster execution
  // @ts-ignore
  forbidOnly: !!process.env.CI, // Fail CI if test.only is committed
  // @ts-ignore
  retries: process.env.CI ? 2 : 0, // Retry failed tests twice in CI, none locally
  // @ts-ignore
  workers: process.env.CI ? 1 : undefined, // Run serially in CI, parallel locally
  

  reporter: [
    ['html'], 
    ['list'], 
    ['json', { outputFile: 'test-results/results.json' }] 
  ],
  

  use: {
    
    baseURL: 'https://www.saucedemo.com',
    
   
    headless: true,
    viewport: { width: 1280, height: 720 }, 
    
   
    screenshot: 'only-on-failure', 
    video: 'retain-on-failure', 
    trace: 'retain-on-failure', 
    
 
    actionTimeout: 10 * 1000, // 10 seconds
    

    navigationTimeout: 15 * 1000, // 15 seconds
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  outputDir: 'test-results/',
});