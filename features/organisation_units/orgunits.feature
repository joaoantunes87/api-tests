Feature: Organisation unit maintenance
As as user of DHIS2
I want to be able to add and manage organisation units

    Background:
        Given that  I am logged in
        And that I have the necessary permissions to add an organisation unit
    
    Scenario: Add an organisation unit
        When I fill in all of the required fields correctly
        And I submit the organisation unit
        Then I should be informed that the organisation unit was created.
    
    Scenario: Assign a parent to an organsiation unit
        Given that an existing parent organisation unit exists
        When I create a new organisation unit
        Then I should be able to assign the existing organisation unit as a parent
        And I should be informed that the organisation unit was created.

    Scenario: Update properties of an organisation unit with valid values
        When I update an organisation unit
        And provide valid <property> as <values>
        Then I should be informed that the organisation unit was updated.
        | property | values |
        | coordinate values | [-11.4197,8.1039] |
        | start date | 1970-01-01T00:00:00.000 |
        
    Scenario: Update properties of an organisation unit with invalid values
        When I update an organisation unit
        And provide invalid <property> as <values>
        Then I should be informed that the organisation unit was updated.
        | property | values |
        | coordinate values | [-190.4197,8.1039] |
        | start date | 1970-02-31T00:00:00.000 |

    Scenario: Translate an organisation unit name
        When I translate the name of an organisation unit
        And I select the same locale as I translated the organisation unit
        Then I should be able to view the translated name.