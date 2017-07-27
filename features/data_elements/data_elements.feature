Feature: Data element maintenance
As as user of DHIS2
I want to be able to add and manage data elements

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add a data element

      Scenario: Add a data element
        When I want to create a new data element
        And I fill in the fields for the data element like:
        | name            | shortName       | domainType | valueType    | aggregationType   |
        | Foo data element| FOO             | AGGREGATE  | NUMBER       | SUM               |
        And I submit the data element to the server
        Then I should be informed that the data element was created
        And the data element has the same properties as those I supplied.

      Scenario: Update an existing data element
        When I want to update an existing data element
        And I fill in the fields for the data element like:
        | name                    | shortName       | valueType |
        | Bar data element        |  BAR            | INTEGER   |
        And I submit the data element to the server
        Then I should be informed that the data element was updated
        And the data element has the same properties as those I supplied.

      Scenario: Delete an existing data element
        When I want to delete an existing data element
        And submit the request to the server
        Then I should be informed the data element was deleted
        But only if no other objects depend on the data element.

      Scenario Outline: Translate a data element
        When I want to translate an existing data element
        And I translate the name of the data element for <language> with <locale> as <translation>
        And I select the correct <locale>
        Then I should see the <translation> of the data element.
        Examples:
        | language   | locale | translation |
        | Portuguese | pt   | Qux |
        | Spanish    | es   | Baz |

      Scenario Outline: Filter data elements
          When I search for data elements by a <property> which has a <value> 
          And I send the search request
          Then I should only see the data elements which have a <property> with the same <value>.
          Examples:
          | property | value |
          | domainType | AGGREGATE |
          | aggregationType | SUM |

