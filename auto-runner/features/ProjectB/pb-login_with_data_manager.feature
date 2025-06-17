# features/login_with_data_manager.feature
@pb-login-with-data-manager
Feature: User Login with Data Manager

  Scenario: Successful login with standard user from data manager
    Given I am on the login page
    When I log in as a "standard_user" user
    Then I should be redirected to the products page

  Scenario: Login with locked out user from data manager
    Given I am on the login page
    When I log in as a "locked_out_user" user
    Then I should see an error message "Epic sadface: Sorry, this user has been locked out."