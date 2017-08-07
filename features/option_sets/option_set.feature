Feature: Option set maintenance
As as user of DHIS2
I want to be able to add and manage option sets.

    Background:
        Given that I am logged in

        Scenario: Add an option set
            And that I have the necessary permissions to add an option set
            And that I want to create a new option set
            When I fill in the fields for the options set with data:
            | name  | valueType |
            | Color | TEXT      |
            And I submit the option set
            Then I should be informed that the option set was created
            And The current option set data is the same as submitted.

        Scenario: Add options to an option set
            And that I have the necessary permissions to add an option set
            And that I have created an option set
            And that I specify some options to add:
            | name      | code      |
            | color     | color     |
            | size      | size      |
            Then I submit the option set
            And I should be informed that the option set was updated
            And The current option set data is the same as submitted.

        Scenario: Remove an option from option set
            And that I have the necessary permissions to delete an option
            And that I have created an option set
            And it has at least one option
            Then I delete the option from the option set
            And I should be informed that the option set was deleted
            And It was really deleted.

        Scenario Outline: Rename an option set
            And that I have created an option set
            When I change the name of the option set to <name>
            And I submit the option set
            Then I should be informed that the option set was updated
            And The current option set data is the same as submitted.
            Examples:
            | name |
            | Color007 |

        Scenario Outline: Update code of an option set
            And that I have created an option set
            When I change the code of the option set to <code>
            And I submit the option set
            Then I should receive an error message equal to: <errorMessage>.
            Examples:
            | code  | errorMessage |
            | COLOR |  The property code cannot be changed |

        Scenario Outline: Remove an option set with data associated
            And that I have the necessary permissions to delete an option set
            And that I have created an option set
            And it has at least one option
            Then I delete the option set
            And I should receive an error message equal to: <errorMessage>.
            Examples:
            | errorMessage |
            | The option cannot be removed |
