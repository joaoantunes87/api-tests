Feature: Datasets maintenance
As as user of DHIS2
I want to be able to add and manage datasets
Data sets are collections of data elements, indicators and data entry forms.
They are used to collect data at assigned organisation units.

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add a dataset

      Scenario: Create a dataset
        Given that I want to create a new dataset
        When I fill in the fields for the dataset with data:
        | name            | periodType   | categoryCombination  |
        | Foo data set    | Monthly      | None                 |
        And I submit the dataset
        Then I should be informed that the dataset was created
        And The current dataset data is the same as submitted.

      Scenario Outline: Define a valid expiry days of a data set
        When I update an existing dataset
        And I change the expiry days to <expiryDays>
        And I submit the dataset
        Then I should be informed that the dataset was updated
        And The current dataset data is the same as submitted.
        Examples:
        | expiryDays |
        | -10 |
        | 0   |
        | 10  |

        Scenario Outline: Define an invalid expiry days of a data set
        When I update an existing dataset
        And I change the expiry days to <expiryDays>
        And I submit the dataset
        Then I should receive an error message equal to: <errorMessage>.
        Examples:
        | expiryDays | errorMessage |
        | -10.5 | The expiryDays value is not valid |
        | 10.5 | The expiryDays value is not valid |
        | foo | The expiryDays value is not valid |

      Scenario Outline: Define a valid dataset period type
        And I got the existing dataset to update
        And I change the periodType to <periodType>
        And I submit the dataset
        Then I should be informed that the dataset was updated
        And The current dataset data is the same as submitted.
        Examples:
        | periodType |
        | Daily |
        | Weekly |
        | Monthly |
        | Quarterly |

      Scenario: Define a category combination of a dataset
      Given there is already a data set
      And there is a category combination with a dimension of type attribute
      When I update the category combination of the dataset
      And I submit the dataset
      Then I should be informed that the dataset was updated
      And The current dataset data is the same as submitted.

      Scenario: Add data elements to a existing data set
      Given there is already a data set
      And there are some aggregate data elements in the system
      When I add some data elements to the dataset
      And I submit the dataset
      Then I should be informed that the dataset was updated
      And The current dataset data is the same as submitted.

      Scenario: Add indicators to a data set
      Given there is already a data set
      And there are some indicators in the system
      When I add indicators to the dataset
      And I submit the dataset
      Then I should be informed that the dataset was updated
      And The current dataset data is the same as submitted.

      Scenario: Assign an organisation units to a dataset
      Given there is already a data set
      And there are some organisation units in the system
      When I add some organisation units to the dataset
      And I submit the dataset
      Then I should be informed that the dataset was updated
      And The current dataset data is the same as submitted.

      Scenario: Assign a valid data input period to a data set
      Given I have created a dataset
      When I set the data input periods for the dataset
      And the start date is before the end date
      And the periodicity of the specified period is the same as the dataset
      Then I should be informed that the dataset was updated
      And the current dataset data is the same as submitted

      Scenario: Attempt to assign a data input period to a data set whose start date is before the end date
      Given I have created a dataset
      When I set the data input periods for the dataset
      And the start date is after the end date
      Then the dataset should not be updated
      And the server should show me an error message.

      Scenario: Attempt to assign a data input period  with a different periodicity
      Given I have created a dataset
      When I set the data input periods for the dataset
      And periodicity of the data input period differs from the dataset itself
      Then I should be informed that the dataset was not updated
      And the server should show me an error message.

      Scenario: Specify a category combination within a data set (Data set element)
      Given I have created a dataset
      When I add a data element to a data set
      And  I do not specify a category combination for the data element
      Then the data set element should have the same category combination of the data element itself.

      Scenario: Update a non-specified category combination of a data element which is part of a dataset
      Given I have created a dataset
      And I have not specified a category combination for a data element in that dataset
      When I change the category combination of the data element
      Then the data set element should have the same category combination of the data element itself.

      Scenario: Update a specified category combination of a data element which is part of a dataset
      Given I have created a dataset
      And I have specified a category combination for a data element in that dataset
      When I change the category combination of the data element
      Then the data set element should remain unchanged.
