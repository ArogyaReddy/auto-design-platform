# features/TheInternetLogin.feature

Feature: The Internet App Login

  Scenario: Successful login with valid credentials
    Given I am on "The Internet" login page
    When I enter username "tomsmith"
    And I enter password "SuperSecretPassword!"
    And I click the login button
    Then I should see a success message containing "You logged into a secure area!"
    And I should be on the secure area page