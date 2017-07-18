Feature: Datasets maintenance
As as user of DHIS2
I want to be able to add and manage datasets
Data sets are collections of data elements, indicators and data entry forms.
They are used to collect data at assigned organisation units.

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add a dataset

      Scenario: Create a dataset
        And that I want to create a new dataset
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
      And I got the existing dataset to update
      And there is a category combination with a dimension of type attribute
      When I update the category combination of the dataset
      And I submit the dataset
      Then I should be informed that the dataset was updated
      And The current dataset data is the same as submitted.

      Scenario: Add data elements to a data set
      And I got the existing dataset to update
      And there are some aggregate data elements in the system
      When I add data elements to the dataset
      And I submit the dataset
      Then I should be informed that the dataset was updated
      And The current dataset data is the same as submitted.

      Scenario: Add indicators to a data set
      And I got the existing dataset to update
      And there are some indicators in the system
      When I add indicators to the dataset
      And I submit the dataset
      Then I should be informed that the dataset was updated
      And The current dataset data is the same as submitted.
