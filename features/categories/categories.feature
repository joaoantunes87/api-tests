Feature: Category maintenance
As user of DHIS2
I want to be able to add and manage categories. Categories are composed of groups
category options. Categories can be combined into category combinations

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add a category

      Scenario: Add some category options
        When I fill in the required fields for a category option like:
        | name        | shortName      |
        | Apples      | Apples         |
        | Oranges     | Oranges        |
        And I submit that category options to the server
        Then I should be informed that the category options were created successfully.

      Scenario: Create category
        Given I have already successfully created some category options
        When I fill in the required fields for a category:
        | name   | dataDimensionType |
        | Fruits | DISAGGREGATION    |
        And I add my category options to the category
        And I submit that category to the server
        Then I should be informed that the category was created successfully.

      Scenario: Create a category combination
        Given I have already successfully created some categories
        When I fill in the required fields for a category combination:
        | name             | dataDimensionType  |
        | Color of Fruits  | DISAGGREGATION      |
        And I add my categories to the category combination
        And I submit that category combination to the server
        Then I should be informed that the category combination was created successfully
        And the category combination should have all of the category option combinations.

      Scenario Outline: Delete a category combination with associated objects
        Given I have created a category combination with associated objects
        When I try to delete the category combination
        Then I should receive an error message equal to: <errorMessage>.
        Examples:
        | errorMessage |
        | A category combination with associated objects cannot be deleted |

      Scenario: Delete a category combination without associated objects
        Given I have created a category combination without associated objects
        When I try to delete the category combination
        Then the system should inform me the category combination was successfully deleted
