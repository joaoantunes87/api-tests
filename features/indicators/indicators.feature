Feature: Indicator maintenance
As user of DHIS2
I want to be able to add and manage indicators. Indicators are defined by
a mathematical formula containing data elements and their category option combinations. 


    Background:
      Given that I am logged in
      And  I have the necessary permissions to add and delete indicators
      And  I have some data elements with a category combination already defined


    Scenario: Add a valid indicator type
       When I fill in the  fields for an indicator type with valid data:
        | name    | factor |
        | Percent | 100    |
        And I submit that indicator type to the server
        Then I should be informed that the indicator type was created successfully.
    
    Scenario: Add an invalid indicator type
        When I fill in the  fields for an indicator type with invalid data:
        | name     | factor    |
        | PercentZ | 100.1     |
        | Perzent  | -1        |
        |          | 100       |
        | Persent  |           |
        And I submit that indicator type to the server
        Then I should be informed that the indicator type was not valid
        And the indicdator type should not exist.

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