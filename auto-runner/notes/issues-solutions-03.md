➜  AI-Playwright-Framework npm test

> ai-automation-framework@1.0.0 test
> cucumber-js -p default

This Node.js version (v20.19.2) has not been tested with this version of Cucumber; it should work normally, but please raise an issue if you see anything unexpected.
..[@faker-js/faker]: faker.phone.number(format) is deprecated since v8.1 and will be removed in v9.0. Please use faker.phone.number(), faker.string.numeric() or faker.helpers.fromRegExp() instead.
[DataManager] Generating new user: Dusty_Casper1235a1
[Registration Step] Attempting to register user: Dusty_Casper1235a1
F--[Self-Healing] Primary locator failed for 'First Name Input' (#firstName). Trying fallbacks...
[Self-Healing] Fallback ByTestId failed for 'First Name Input'.
[Self-Healing] Failed to locate 'First Name Input' using primary locator '#firstName' and all fallback strategies.
F..[DataManager] Loaded data from: users.json
[Login Step] Logging in as user type: standard_user
F-[Self-Healing] Primary locator failed for 'Username Input' (#user-name). Trying fallbacks...
[Self-Healing] Fallback ByTestId failed for 'Username Input'.
[Self-Healing] Fallback ByAltText failed for 'Username Input'.
[Self-Healing] Fallback ByTitle failed for 'Username Input'.
[Self-Healing] Failed to locate 'Username Input' using primary locator '#user-name' and all fallback strategies.
F..[Login Step] Logging in as user type: locked_out_user
F-[Self-Healing] Primary locator failed for 'Username Input' (#user-name). Trying fallbacks...
[Self-Healing] Fallback ByTestId failed for 'Username Input'.
[Self-Healing] Fallback ByAltText failed for 'Username Input'.
[Self-Healing] Fallback ByTitle failed for 'Username Input'.
[Self-Healing] Failed to locate 'Username Input' using primary locator '#user-name' and all fallback strategies.
F..F--[Self-Healing] Primary locator failed for 'Username Input' (#user-name). Trying fallbacks...
[Self-Healing] Fallback ByTestId failed for 'Username Input'.
[Self-Healing] Failed to locate 'Username Input' using primary locator '#user-name' and all fallback strategies.
F

Failures:

1) Scenario: Register a unique new user # features/dynamic_registration.feature:4
   ✔ Before # features/support/world.js:32
   ✔ Given I am on the user registration page # features/step_definitions/registration_steps.js:9
   ✖ When I register with dynamic user data # features/step_definitions/registration_steps.js:14
   TypeError: selfHealingLocator(...).fill is not a function
   at CustomWorld.<anonymous> (/Users/arog/AI/AI-Playwright-Framework/features/step_definitions/registration_steps.js:20:100)
    - Then the user should be successfully registered # features/step_definitions/registration_steps.js:35
    - And I should see a success message # features/step_definitions/registration_steps.js:39
      ✖ After # features/support/world.js:36
      Error: [Self-Healing] Failed to locate 'First Name Input' using primary locator '#firstName' and all fallback strategies.
      at selfHealingLocator (/Users/arog/AI/AI-Playwright-Framework/utils/self_healing_locator.js:149:15)

2) Scenario: Successful login with standard user from data manager # features/login_with_data_manager.feature:4
   ✔ Before # features/support/world.js:32
   ✔ Given I am on the login page # features/step_definitions/login_steps.js:7
   ✖ When I log in as a "standard_user" user # features/step_definitions/login_steps.js:17
   TypeError: selfHealingLocator(...).fill is not a function
   at CustomWorld.<anonymous> (/Users/arog/AI/AI-Playwright-Framework/features/step_definitions/login_steps.js:27:8)
    - Then I should be redirected to the products page # features/step_definitions/login_steps.js:38
      ✖ After # features/support/world.js:36
      Error: [Self-Healing] Failed to locate 'Username Input' using primary locator '#user-name' and all fallback strategies.
      at selfHealingLocator (/Users/arog/AI/AI-Playwright-Framework/utils/self_healing_locator.js:149:15)

3) Scenario: Login with locked out user from data manager # features/login_with_data_manager.feature:9
   ✔ Before # features/support/world.js:32
   ✔ Given I am on the login page # features/step_definitions/login_steps.js:7
   ✖ When I log in as a "locked_out_user" user # features/step_definitions/login_steps.js:17
   TypeError: selfHealingLocator(...).fill is not a function
   at CustomWorld.<anonymous> (/Users/arog/AI/AI-Playwright-Framework/features/step_definitions/login_steps.js:27:8)
    - Then I should see an error message "Epic sadface: Sorry, this user has been locked out." # features/step_definitions/login_steps.js:42
      ✖ After # features/support/world.js:36
      Error: [Self-Healing] Failed to locate 'Username Input' using primary locator '#user-name' and all fallback strategies.
      at selfHealingLocator (/Users/arog/AI/AI-Playwright-Framework/utils/self_healing_locator.js:149:15)

4) Scenario: User filters products by name (A to Z) # features/SauceDemoProductFilter.feature:4
   ✔ Before # features/support/world.js:32
   ✔ Given a user navigates to the SauceDemo login page # features/step_definitions/product_steps.js:9
   ✖ When the user logs in with "standard_user" and "secret_sauce" # features/step_definitions/product_steps.js:13
   TypeError: selfHealingLocator(...).fill is not a function
   at CustomWorld.<anonymous> (/Users/arog/AI/AI-Playwright-Framework/features/step_definitions/product_steps.js:18:8)
    - And the user filters products by "Name (A to Z)" # features/step_definitions/product_steps.js:30
    - Then the products should be sorted by "Name (A to Z)" # features/step_definitions/product_steps.js:37
      ✖ After # features/support/world.js:36
      Error: [Self-Healing] Failed to locate 'Username Input' using primary locator '#user-name' and all fallback strategies.
      at selfHealingLocator (/Users/arog/AI/AI-Playwright-Framework/utils/self_healing_locator.js:149:15)

4 scenarios (4 failed)
14 steps (4 failed, 6 skipped, 4 passed)
0m02.393s (executing steps: 0m02.378s)
➜  AI-Playwright-Framework



=======


