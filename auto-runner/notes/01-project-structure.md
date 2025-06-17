AI-Playwright-Framework/
├── features/
│   ├── dynamic_registration.feature
│   ├── SauceDemoProductFilter.feature  (Formerly GoogleSearch.feature)
│   ├── login_with_data_manager.feature
│   └── (other .feature files you might have)
├── features/step_definitions/
│   ├── login_steps.js
│   ├── product_steps.js  (Formerly google_steps.js)
│   └── registration_steps.js
├── features/support/
│   └── world.js
├── utils/
│   ├── data_manager.js
│   └── self_healing_locator.js
├── dashboard/
│   ├── app.js
│   └── views/
│       └── index.ejs
├── reports/
│   └── (This folder will be created by Cucumber, no need to manually create files here)
├── .vscode/
│   ├── launch.json
│   └── settings.json
├── cucumber.js
├── package.json
└── (other project files like .eslintrc.js, playwright.config.js etc.)