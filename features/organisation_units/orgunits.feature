Feature: Organisation unit maintenance
As as user of DHIS2
I want to be able to add and manage organisation units

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add an organisation unit

      Scenario: Add an organisation unit
        When I fill in all of the required fields with data:
        | name            | shortName       | openingDate |
        | Organization 1  | ORG             | 2016-09-23T00:00:00.000  |
        And I submit the organisation unit
        Then I should be informed that the organisation unit was created
        And The returned data is the same as submitted.

      Scenario: Update added organisation unit
        Given I got the existing organisation unit to update
        When I fill in some fields to change with data:
        | name                    | shortName       | openingDate |
        | Organization 1 Updated  | ORGU            | 2016-09-24T00:00:00.000  |
        And I submit the organisation unit
        Then I should be informed that the organisation unit was updated
        And The returned data is the same as submitted.

      Scenario: Assign a parent to an organsiation unit
        When an existing parent organisation unit exists
        And I fill in all of the required fields with data:
        | name            | shortName       | openingDate |
        | Organization 2  | ORG             | 2016-06-23T00:00:00.000  |
        Then I should be able to assign the existing organisation unit as a parent
        And I submit the organisation unit
        Then I should be informed that the organisation unit was created
        And The returned data is the same as submitted.

      Scenario Outline: Update valid properties of an organisation unit with valid values
        When I update an existing organisation unit
        And  I provide a valid value: <value> for a valid property: <property>
        And I submit the organisation unit
        Then I should be informed that the organisation unit was updated
        And The returned data is the same as submitted.
        Examples:
        | property | value |
        | coordinates | [-11.4197,8.1039] |
        | openingDate | 1970-01-01T00:00:00.000 |

      Scenario Outline: Update properties of an organisation unit with invalid values
        When I update an existing organisation unit
        And I provide an invalid value: <value> of a valid property: <property>
        And I submit the organisation unit
        Then I should receive an error message.
        Examples:
        | property | value |
        | coordinates | [-190.4197,8.1039] |
        | openingDate | 1970-02-31T00:00:00.000 |

      Scenario Outline: Update non-existent properties of an organisation unit
        When I update an existing organisation unit
        And I provide an invalid value: <value> of an invalid property: <property>
        And I submit the organisation unit
        Then I should be informed that the organisation unit was not updated.
        Examples:
        | property | value |
        | cordinate | [-190.4197,8.1039] |
        | startTime | 1970-02-28T00:00:00.000 |

      Scenario Outline: Define an end date for an organisation unit
        When I update an existing organisation unit
        And I provide a previous closed date as <pastDate>
        And I submit the organisation unit
        Then I should receive an error message.
        Examples:
        | pastDate |
        | 2015-01-30T00:00:00.000 |
        | 1970-02-25T00:00:00.000 |

      Scenario Outline: Define an end date for an organisation unit
        When I update an existing organisation unit
        And I provide a later closed date as <futureDate>
        And I submit the organisation unit
        Then I should be informed that the organisation unit was updated
        And The returned data is the same as submitted.
        Examples:
        | futureDate |
        | 2017-06-12T00:00:00.000 |
        | 2017-06-13T00:00:00.000 |

      Scenario Outline: Translate an organisation unit name
        When I translate the name of an organisation unit for <locale> as <translation>
        And I select the same locale as I translated the organisation unit
        Then I should be able to view the translated name.
        Examples:
        | locale | translation |
        | pt | Organização 1 |
        | es | Organización 1 |
