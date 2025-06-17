# features/SauceDemoProductFilter.feature
@login-feature
Feature: User Login with Data Manager
  Scenario: Successful login with standard user from data manager
    Given User is on the SauceDemo login page
    When User attempts to login as "standard_user" user
    # Then User should be redirected to the SauceDemo products page

    # features/login.feature (or login_with_data_manager.feature)
Scenario: Successful login with standard user from data manager
  Given User is on the SauceDemo login page
  When User attempts to login as "standard_user" user
  And User clicks the login button
  Then User should be redirected to the SauceDemo products page
