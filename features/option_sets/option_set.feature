Feature: Option set maintenance
As as user of DHIS2
I want to be able to add and manage option sets.

    Background:
        Given that I am logged in

        Scenario: Add an option set
            And that I have the necessary permissions to add an option set
            When I fill in all of the required fields for an option set with data:
            | name     | valueType |
            | Color_66 | TEXT      |
            And I submit the option set
            Then I should be informed that the option set was created
            And The current option set data is the same as submitted.

        Scenario: Add options to an option set
            And that I have the necessary permissions to add an option set
            And that I have created an option set
            And that I specify some options to add:
            | name      | valueType |
            | Color_76  | TEXT      |
            | Size_76   | TEXT      |
            Then I submit the option set
            And I should be informed that the option set was updated
            And The current option set data is the same as submitted.

        Scenario: Remove an option with no data associated
            And that I have the necessary permissions to delete an option set
            And that I have created an option set
            And it has at least one option
            Then I delete the option from the option set
            And I should be informed that the option set was delete
            And It was really deleted.

        Scenario Outline: Rename an option
            Given that I have created an option set
            And it has at least one option
            And I change the name of the option to <name>
            And I submit the option set
            Then I should be informed that the option set was updated
            And The current option set data is the same as submitted.
            Examples:
            | name |
            | Color116 |

        Scenario Outline: Update code of an option
            Given that I have created an option set
            And it has at least one option
            And I change the code of the option to <code>
            And I submit the option set
            Then I should receive an error message equal to: <errorMessage>.
            Examples:
            | code | errorMessage |
            | COLOR |  The property code can not be changed |

        Scenario Outline: Remove an option with data associated
            And that I have the necessary permissions to delete an option set
            And that I have created an option set
            And it has at least one option
            Then I delete the option set
            And I should receive an error message equal to: <errorMessage>.
            Examples:
            | errorMessage |
            | The option can not be removed |
