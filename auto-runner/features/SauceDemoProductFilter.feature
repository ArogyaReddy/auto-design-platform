# features/SauceDemoProductFilter.feature
Feature: Product Filter on SauceDemo

  Scenario: User filters products by name (A to Z)
    Given a user navigates to the SauceDemo login page
    When the user logs in with "standard_user" and "secret_sauce"
    And the user filters products by "Name (A to Z)"
    Then the products should be sorted by "Name (A to Z)"