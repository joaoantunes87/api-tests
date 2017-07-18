Feature: Organisation unit maintenance
As as user of DHIS2
I want to be able to add and manage organisation units

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add an organisation unit

      Scenario: Add an organisation unit
        And that I want to create a new organisation unit
        When I fill in the fields for the organisation unit with data:
        | name            | shortName       | openingDate |
        | Organization 1  | ORG             | 2016-09-23T00:00:00.000  |
        And I submit the organisation unit
        Then I should be informed that the organisation unit was created
        And The current organisation unit data is the same as submitted.

      Scenario: Update added organisation unit
        And I got the existing organisation unit to update
        When I fill in the fields for the organisation unit with data:
        | name                    | shortName       | openingDate |
        | Organization 1 Updated  | ORGU            | 2016-09-24T00:00:00.000  |
        And I submit the organisation unit
        Then I should be informed that the organisation unit was updated
        And The current organisation unit data is the same as submitted.

      Scenario: Assign a parent to an organsiation unit
        And that I want to create a new organisation unit
        When an existing parent organisation unit exists
        And I fill in the fields for the organisation unit with data:
        | name            | shortName       | openingDate |
        | Organization 2  | ORG             | 2016-06-23T00:00:00.000  |
        Then I should be able to assign the existing organisation unit as a parent
        And I submit the organisation unit
        Then I should be informed that the organisation unit was created
        And The current organisation unit data is the same as submitted.

      Scenario Outline: Update valid properties of an organisation unit with valid values
        When I update an existing organisation unit
        And  I provide a valid value: <value>, for a valid property: <property>
        And I submit the organisation unit
        Then I should be informed that the organisation unit was updated
        And The current organisation unit data is the same as submitted.
        Examples:
        | property | value |
        | coordinates | [-11.4197,8.1039] |
        | openingDate | 1970-01-01T00:00:00.000 |

      Scenario Outline: Update properties of an organisation unit with invalid values
        When I update an existing organisation unit
        And I provide an invalid value: <value>, for a valid property: <property>
        And I submit the organisation unit
        Then I should receive an error message equal to: <errorMessage>.
        Examples:
        | property | value | errorMessage |
        | coordinates | [-190.4197,8.1039] | The coordinates value is not valid |
        | openingDate | 1970-02-31T00:00:00.000 | The openingDate value is not valid |

      Scenario Outline: Update non-existent properties of an organisation unit
        When I update an existing organisation unit
        And I provide an invalid value: <value>, for an invalid property: <property>
        And I submit the organisation unit
        Then I should receive an error message equal to: <errorMessage>.
        Examples:
        | property | value | errorMessage |
        | cordinate | [-190.4197,8.1039] | The property cordinate does not exist |
        | startTime | 1970-02-28T00:00:00.000 | The property startTime does not exist |

      Scenario Outline: Define an end date for an organisation unit
        When I update an existing organisation unit
        And I provide a previous closed date as <pastClosedDate>
        And I submit the organisation unit
        Then I should receive an error message equal to: <errorMessage>.
        Examples:
        | pastClosedDate | errorMessage |
        | 2015-01-30T00:00:00.000 | The value for closedDate should be later than openingDate |

      Scenario Outline: Define an end date for an organisation unit
        When I update an existing organisation unit
        And I provide a later closed date as <futureClosedDate>
        And I submit the organisation unit
        Then I should be informed that the organisation unit was updated
        And The current organisation unit data is the same as submitted.
        Examples:
        | futureClosedDate |
        | 2017-06-12T00:00:00.000 |

      Scenario Outline: Translate an organisation unit name
        When I translate the name of the organisation unit for <locale> as <translation>
        And I select the correct locale for the logged user
        Then I should be able to view the translated name.
        Examples:
        | locale | translation |
        | pt | Organização 1 |
        | es | Organización 1 |

      Scenario: Assign a data set to organisation units
        And I got the existing organisation unit to update
        And there is a dataset in the system
        When I update the datasets of the organisation unit
        And I submit the organisation unit
        Then I should be informed that the organisation unit was updated
        And The current organisation unit data is the same as submitted.