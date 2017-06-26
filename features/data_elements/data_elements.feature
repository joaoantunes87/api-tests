Feature: Organisation unit maintenance
As as user of DHIS2
I want to be able to add and manage data elements

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add a data element

      Scenario: Add a data element
        When I fill in all of the required fields for a data element with data:
        | name            | shortName       | domainType | valueType    | aggregationType   |
        | Foo data element| FOO             | AGGREGATE  | NUMBER       | SUM               |
        And I submit the data element
        Then I should be informed that the data element was created
        And The current data element data is the same as submitted.

      Scenario: Update an existing data element
        Given  a data element called "Foo data element" exists
        When I alter  some of the existing fields:
        | name                    | shortName       | valueType |
        | Bar data element        |  BAR            | INTEGER   |
        Then I should be informed that the data element was updated
        And corresponds to what I submitted.

      Scenario Outline: Translate a data element
        Given  a data element called "Foo data element" exists
        When I translate the name of a data element for <locale> as <translation>
        And my selected <locale> matches the translation <locale>
        Then I should see the translated name of the data element.
        Examples:
        | locale | translation |
        | pt | Qux |
        | es | Baz |
