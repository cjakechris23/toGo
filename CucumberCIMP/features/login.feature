Feature: The Zero Web App Security Website

  Scenario Outline: As a user, I cannot login with invalid credentials

    Given I am on the login page
    When I login with <username> and <password>
    Then I should see error message

    Examples:
      | username | password            |  
      | tomsmith | SuperSecretPassword!|
      | foobar   | barfoo              |

  Scenario: Single login attempt

    Given I am on the login page 
    When I login with invalid credentials
    Then I should see error message     
