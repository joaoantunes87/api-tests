Feature: Indicator maintenance
As user of DHIS2
I want to be able to add and manage indicators. Indicators are defined by
a mathematical formula containing data elements and their category option combinations.

    Background:
      Given that I am logged in
      And  I have the necessary permissions to add and delete indicators
    
    Scenario: Add a valid indicator type
        When I fill in the fields for an indicator type with valid data:
        | name    | factor |
        | Percent | 100    |
        And I submit that indicator type to the server
        Then I should be informed that the indicator type was created successfully.

    Scenario: Add an indicator type with decimal factor
        When I fill in the fields for an indicator type with valid data:
        | name     | factor    |
        | PercentZ | 100.1     |
        And I submit that indicator type to the server
        Then I should be informed that indicator type is invalid
        And receive the message "Allowed range for numeric property `factor` is [0 to 2,147,483,647], but number given was 100.1.".

    Scenario: Add an indicator type with negative factor
        When I fill in the fields for an indicator type with valid data:
        | name     | factor    |
        | Perzent  | -1        |
        And I submit that indicator type to the server
        Then I should be informed that indicator type is invalid
        And receive the message "Allowed range for numeric property `factor` is [0 to 2,147,483,647], but number given was -1.".

    Scenario: Add an indicator type without name
        When I fill in the fields for an indicator type with valid data:
        | name     | factor    |
        |          | 100       |
        And I submit that indicator type to the server
        Then I should be informed that indicator type is invalid
        And receive the message "Missing required property `name`.".

    Scenario: Add an indicator type without factor
        When I fill in the fields for an indicator type with valid data:
        | name     | factor    |
        | Persent  |           |
        And I submit that indicator type to the server
        Then I should be informed that indicator type is invalid
        And receive the message "Missing required property `name`.".

    @ignore
    Scenario: Add a valid indicator without a denominator
        Given I have a data element called Foo and Bar in the system
        And that these data elements have category option combinations Baz and QuX respectively
        And that an indicator type called Number exists
        When I fill in the required fields for an indicator
        | name | shortName | indicatorType |
        | Spam | Spam      | Number        |
        And I define the indicator formula
        | numerator        |
        | Foo.Baz + Bar.Qux|
        And I submit the indicator to the server
        Then I should be informed that the indicator was created
        And the indicator should correspond to what I submitted.
    @ignore
    Scenario: Add a valid indicator with a numerator and denominator
        Given I have a data element called Foo and Bar in the system
        And that these data elements have category option combinations Baz and QuX respectively
        And that an indicator type called Percent exists
        When I fill in the required fields for an indicator
        | name | shortName | indicatorType |
        | Eggs | Eggs      | Percent       |
        And I define the indicator formula
        | numerator        | denominator   |
        | Foo.Baz          | Bar.Qux       |
        And I submit the indicator to the server
        Then I should be informed that the indicator was created
        And the indicator should correspond to what I submitted.
