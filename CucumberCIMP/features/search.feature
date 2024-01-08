Feature: Search

    This is just a comment

    Scenario: User can search for results

        Given I am on the home page
        When I search for "bank"
        Then I should see results