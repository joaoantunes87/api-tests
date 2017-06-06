Feature: Option set maintenance
As as user of DHIS2
I want to be able to add and manage option sets. 


    Background:
        Given that  I am logged in
        And that I have the necessary permissions to add an option set

        Scenario: Add an option set
            When I create a new option set
            And specify the option set name
            And specify a correct value type
            Then I should be informed that the option set has been created. 

        Scenario: Add options to an option set
            Given that I have created a option set
            And that I specify a name and code for an option
            Then I should be able to add a new option to the option set. 
            And I should be infomed that the option was added. 
        
        Scenario: Remove an option 
            Given that I have created a option set
            And it has at least one option
            Then I should be able to delete the option from the option set
            But only if there is no data associated with the option. 

        Scenario: Rename an option 
            Given that I have created a option set
            And it has at least one option
            Then I should be able to change the name of the option
            But I should not be able to change the option's code. 