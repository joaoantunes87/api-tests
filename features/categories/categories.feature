Feature: Category maintenance
As user of DHIS2
I want to be able to add and manage categories. Categories are composed of groups
category options. Categories can be combined into category combinations

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add a category

      Scenario: Add some category options
        When I fill in the required fields for a category option like:
        | name           | shortName        |
        | Apples         | Apples          |
        | Oranges        | Oranges         |
        And I submit category options to the server
        Then I should be informed that the category options were created successfully.

      Scenario: Create a category
        Given I have already successfully created some category options
        When I fill in the required fields for a category:
        | name   | dataDimensionType  |
        | Fruits | DISAGGREGATION     |
        | Colors | DISAGGREGATION     |
        And I add my category options to the category
        And I submit the category to the server
        Then I should be informed that the category was created successfully.

    Scenario: Create a category combination
        Given I have already successfully created some categories
        When I fill in the required fields for a category combination
        | name             | dataDimensionType  |
        | Color of Fruits  | DISAGGREGATION      |
        And I add my categories to the category combination
        Then I should be informed that the category combination was created successfully
        And the category combination should have all of the category option combinations.
