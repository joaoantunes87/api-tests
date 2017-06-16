Feature: Option set maintenance
As as user of DHIS2
I want to be able to add and manage option sets.

    Background:
        Given that I am logged in
        # Should not we check for DELETE permission as well?
        And that I have the necessary permissions to add an option set

        Scenario: Add an option set
            When I fill in all of the required fields for an option set with data:
            | name     | valueType |
            | Color_33 | TEXT      |
            And I submit the option set
            Then I should be informed that the option set was created
            And The current option set data is the same as submitted.

        Scenario: Add options to an option set
            Given that I have created an option set
            And that I specify some options to add:
            | name      | valueType |
            | Color_43  | TEXT      |
            | Size_43   | TEXT      |
            Then I submit the option set
            And I should be informed that the option set was updated
            And The current option set data is the same as submitted.

        Scenario: Remove an option
            Given that I have created an option set
            And it has at least one option
            Then I should be able to delete the option from the option set
            And I should be informed that the option set was delete
            And It was really deleted.

        # But only if there is no data associated with the option.
        # It should be tested with a test that tries to delete an option with data associated

        Scenario Outline: Rename an option
            Given that I have created an option set
            And it has at least one option
            And I change the name of the option to <name>
            And I submit the option set
            Then I should be informed that the option set was updated
            And The current option set data is the same as submitted.
            Examples:
            | name |
            | Color93 |
            | Color94 |

        # But I should not be able to change the option's code.
        # It should be tested with a test that tries to change an option's code
