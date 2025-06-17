# features/dynamic_registration.feature
Feature: Dynamic User Registration

  Scenario: Register a unique new user
    Given I am on the user registration page
    When I register with dynamic user data
    Then the user should be successfully registered
    And I should see a success message