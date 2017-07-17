Feature: Data element maintenance
As as user of DHIS2
I want to be able to add and manage data elements

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add a data element

      Scenario: Add a data element
        And that I want to create a new data element
        When I fill in the fields for the data element with data:
        | name            | shortName       | domainType | valueType    | aggregationType   |
        | Foo data element| FOO             | AGGREGATE  | NUMBER       | SUM               |
        And I submit the data element
        Then I should be informed that the data element was created
        And The current data element data is the same as submitted.

      Scenario: Update an existing data element
        And I got the existing data element to update
        When I fill in the fields for the data element with data:
        | name                    | shortName       | valueType |
        | Bar data element        |  BAR            | INTEGER   |
        And I submit the data element
        Then I should be informed that the data element was updated
        And The current data element data is the same as submitted.

      Scenario Outline: Translate a data element
        And I got the existing data element to update
        When I translate the name of the data element for <locale> as <translation>
        And I select the correct locale for the logged user
        Then I should see the translated name of the data element.
        Examples:
        | locale | translation |
        | pt | Qux |
        | es | Baz |

      Scenario Outline: Filter data elements
          When I search for data elements by property <property> with value <value>
          And I send the search request
          Then I should receive data elements filtered.
          Examples:
          | property | value |
          | domainType | AGGREGATE |
          | aggregationType | SUM |
