Feature: Datasets maintenance
As as user of DHIS2
I want to be able to add and manage datasets
Data sets are collections of data elements, indicators and data entry forms.
They are used to collect data at assigned organisation units.

    Background:
      Given that I am logged in

      @createUser
      Scenario: Create a dataset without permissions
        Given that I want to create a new dataset
        When I fill in the fields for the dataset with data:
        | name            | periodType   |
        | Foo data set    | Monthly      |
        And I submit the dataset
        Then I should be informed I have no permission to do that operation.

      Scenario: Create a dataset
        Given that I have the necessary permissions to add a dataset
        And that I want to create a new dataset
        When I fill in the fields for the dataset with data:
        | name            | periodType   |
        | Foo data set    | Monthly      |
        And I submit the dataset
        Then I should be informed that the dataset was created
        And The current dataset data is the same as submitted.

      Scenario Outline: Define a valid expiry days of a data set
        Given that I have the necessary permissions to add a dataset
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
        Given that I have the necessary permissions to add a dataset
        When I update an existing dataset
        And I change the expiry days to <expiryDays>
        And I submit the dataset
        # FIXME Checking for a  500 status code. In the future it should be changed to a 40X.
        Then I should receive a 500 error message equal to: <errorMessage>.
        Examples:
        | expiryDays | errorMessage |
        | -10.5 | Can not construct instance of int from String value ("-10.5"): not a valid Integer value\\n at [Source: {"expiryDays":"-10.5"}; line: 1, column: 15] (through reference chain: org.hisp.dhis.dataset.DataSet["expiryDays"]) |
        | 10.5 | Can not construct instance of int from String value ("10.5"): not a valid Integer value\\n at [Source: {"expiryDays":"10.5"}; line: 1, column: 15] (through reference chain: org.hisp.dhis.dataset.DataSet["expiryDays"]) |
        | foo | Can not construct instance of int from String value ("foo"): not a valid Integer value\\n at [Source: {"expiryDays":"foo"}; line: 1, column: 15] (through reference chain: org.hisp.dhis.dataset.DataSet["expiryDays"]) |

      Scenario Outline: Define a valid dataset period type
        Given that I have the necessary permissions to add a dataset
        When I update an existing dataset
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
      @ignore
      Scenario: Define a category combination of a dataset
        Given that I have the necessary permissions to add a dataset
        When I update an existing dataset
        And there is a category combination with a dimension of type attribute
        When I update the category combination of the dataset
        And I submit the dataset
        Then I should be informed that the dataset was updated
        And The current dataset data is the same as submitted.
      @ignore
      Scenario: Add data elements to a existing data set
        Given that I have the necessary permissions to add a dataset
        When I update an existing dataset
        And there are some aggregate data elements in the system
        When I add some data elements to the dataset
        And I submit the dataset
        Then I should be informed that the dataset was updated
        And The current dataset data is the same as submitted.
      @ignore
      Scenario: Add indicators to a data set
        Given that I have the necessary permissions to add a dataset
        When I update an existing dataset
        And there are some indicators in the system
        When I add indicators to the dataset
        And I submit the dataset
        Then I should be informed that the dataset was updated
        And The current dataset data is the same as submitted.

      Scenario: Assign an organisation units to a dataset
        Given that I have the necessary permissions to add a dataset
        When I update an existing dataset
        And there are some organisation units in the system
        When I add some organisation units to the dataset
        And I submit the dataset
        Then I should be informed that the dataset was updated
        And The current dataset data is the same as submitted.

      Scenario: Assign a valid data input period to a data set
        Given that I have the necessary permissions to add a dataset
        When I update an existing dataset
        When I set the data input periods for the dataset:
        | openingDate               | closingData             | period |
        | 2016-10-01T00:00:00.000   | 2016-10-31T23:59:59.999 | 201610 |
        | 2016-11-01T00:00:00.000   | 2016-11-30T23:59:59.999 | 201611 |
        And I submit the dataset
        Then I should be informed that the dataset was updated
        And The current dataset data is the same as submitted.

      Scenario: Attempt to assign a data input period to a data set whose start date is before the end date
        Given that I have the necessary permissions to add a dataset
        When I update an existing dataset
        When I set the data input periods for the dataset:
        | openingDate               | closingData             | period |
        | 2016-10-31T23:59:59.999   | 2016-10-01T00:00:00.000 | 201610 |
        And I submit the dataset
        Then I should be informed that the dataset was not updated
        And the server should show me an error message equal to "closingDate could not be after openingDate".

      Scenario: Attempt to assign a data input period with a different periodicity
        Given that I have the necessary permissions to add a dataset
        When I update an existing dataset
        When I set the data input periods for the dataset:
        | openingDate               | closingData             | period |
        | 2016-10-01T00:00:00.000   | 2016-12-31T23:59:59.999 | 2016Q4 |
        And I submit the dataset
        Then I should be informed that the dataset was not updated
        And the server should show me an error message equal to "periodicity could not be different".
      @ignore
      Scenario: Specify a category combination within a data set (Data set element)
        Given that I have the necessary permissions to add a dataset
        And I update an existing dataset
        When I add a data element with no category combination to the data set
        Then the data set element should have the same category combination of the data element itself.
      @ignore
      Scenario: Update a non-specified category combination of a data element which is part of a dataset
        Given that I have the necessary permissions to add a dataset
        And I update an existing dataset
        When I change the category combination of the data element
        Then the data set element should have the same category combination of the data element itself.
      @ignore
      Scenario: Update a specified category combination of a data element which is part of a dataset
        Given that I have the necessary permissions to add a dataset
        And I update an existing dataset
        And I have specified a category combination for a data element in that dataset
        When I change the category combination of the data element
        Then the data set element should remain unchanged.
