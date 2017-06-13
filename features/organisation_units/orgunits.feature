Feature: Organisation unit maintenance
As as user of DHIS2
I want to be able to add and manage organisation units

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add an organisation unit

      Scenario: Add an organisation unit
        When I fill in all of the required fields with data:
        | name            | shortName       | openingDate |
        | Organization 1  | ORG             | 2016-09-23  |
        And I submit the organisation unit
        Then I should be informed that the organisation unit was created
        And The returned data is the same as submitted.

      Scenario: Assign a parent to an organsiation unit
        When an existing parent organisation unit exists
        And I fill in all of the required fields with data:
        | name            | shortName       | openingDate |
        | Organization 2  | ORG             | 2016-06-23  |
        Then I should be able to assign the existing organisation unit as a parent
        And I submit the organisation unit
        Then I should be informed that the organisation unit was created
        And The returned data is the same as submitted.

      Scenario Outline: Update valid properties of an organisation unit with valid values
        When I update an organisation unit
        And  I provide a valid <value> for a valid <property>
        Then I should be informed that the organisation unit was updated.
        #This should be a 200
        Examples:
        | property | value |
        | coordinates | [-11.4197,8.1039] |
        | openingDate | 1970-01-01T00:00:00.000 |

      Scenario Outline: Update properties of an organisation unit with invalid values
        When I update an existing organisation unit
        And I provide an invalid <value> of a valid <property>
        Then I should receive an error message.
        #A bit unknown at this point, but expect a 500.
        Examples:
        | property | value |
        | coordinates | [-190.4197,8.1039] |
        | openingDate | 1970-02-31T00:00:00.000 |

      Scenario Outline: Update non-existent properties of an organisation unit
        When I update an existing organisation unit
        And I provide an invalid <value> of an invalid <property>
        Then I should be informed that the organisation unit was not updated.
        #Also a bit unknown but assume a 204.
        Examples:
        | property | value |
        | cordinate | [-190.4197,8.1039] |
        | startTime | 1970-02-28T00:00:00.000 |

      Scenario: Translate an organisation unit name
        When I translate the name of an organisation unit
        And I select the same locale as I translated the organisation unit
        Then I should be able to view the translated name.

      Scenario Outline: Define an end date for an organisation unit
        When I update an existing organisation unit
        And I provide a closed date as <pastDate>
        Then I should receive an error message.
        Examples:
        | pastDate |
        | 2015-01-30T00:00:00.000 |
        | 1970-02-25T00:00:00.000 |

      Scenario Outline: Define an end date for an organisation unit
        When I update an existing organisation unit
        And I provide a closed date as <futureDate>
        Then I should be informed that the organisation unit was updated.
        Examples:
        | futureDate |
        | 2017-06-12T00:00:00.000 |
        | 2017-06-13T00:00:00.000 |
