// AI-Playwright-Framework/cucumber.js (Modern Object-Style Configuration)
// AI-Playwright-Framework/cucumber.js
module.exports = {
  default: {
    paths: ['features/**/*.feature'], // This tells Cucumber to find all features by default
    requireModule: ['@babel/register'],
    require: [
      'features/step_definitions/**/*.js',
      'features/support/**/*.js' // Loads world.js where setDefaultTimeout is
    ],
    format: [
      'summary' // Keep it simple, or add 'progress-bar', 'html:reports/cucumber-report.html'
    ],
    // timeout is now handled by setDefaultTimeout in your support code (e.g., world.js)
    // If you still had 'timeout: 60000' here, it's fine, but setDefaultTimeout takes precedence.
    publishQuiet: true
  },

  // --- NEW PROFILE for running specific feature files ---
  specific_features_run: {
    // NO 'paths' key here intentionally!
    requireModule: ['@babel/register'],
    require: [
      'features/step_definitions/**/*.js',
      'features/support/**/*.js' // Crucial for loading World, hooks, setDefaultTimeout
    ],
    format: [
      'summary' // Or your preferred formatters for this run type
      // 'html:reports/cucumber-report-specific.html' // Optionally, a different report file
    ],
    // Timeout will be inherited from setDefaultTimeout called in your support files.
    // If you needed a different timeout specifically for this profile, you could add:
    // timeout: 75000,
    // publishQuiet: true,
    worldParameters: {
      // any specific parameters for this type of run if needed
    }
  }
};

// module.exports = {
//   default: {
//     paths: ['features/**/*.feature'],
//     requireModule: ['@babel/register'], // For ES6+ syntax
//     require: ['features/step_definitions/**/*.js', 'features/support/**/*.js'],
//     format: [
//       'summary', // For summary output
//       'progress-bar', // For console output
//       'html:reports/cucumber-report.html' // Generates an HTML report
//     ],

//     formatOptions: {
//       snippetInterface: 'async-await' // Generates snippets with async/await
//     },
//     worldParameters: {
//       // Example: debug: true, targetApp: 'https://www.saucedemo.com/'
//     },
//     timeout: 60000 // Timeout in milliseconds (60 seconds)
//   }
// };
