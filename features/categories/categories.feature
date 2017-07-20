Feature: Category maintenance
As as user of DHIS2
I want to be able to add and manage categories. Categories are composed of groups
category options. Categories can be combined into category combinations

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add a category

      Scenario: Add some category options
        When I fill in the required fields for a category option like:
        | name            | shortName        |
        | Apples          | Apples           |
        | Oranges         | Oranges          |
        And I submit the category options to the server
        Then I should be informed that the category options were created successfully. 

      Scenario: Create a category
        Given I have already successfully created some category options #Like fruits
        When I fill in the required fields for a category:
        | name   | disaggregationType  |
        | Fruits | DISAGGREGATION      | 
        And I add my category options to the category #This should be from the previous step above.
        And I submit the category  to the server
        Then I should be informed that the category was created successfully.
    
    Scenario: Create a category combination
        Given I have already successfully created some categories # We should have two: Fruits and Color
        When I fill in the required fields for a category combination
        | name             | disaggregationType  |
        | Color of Fruits  | DISAGGREGATION      | 
        And I add my categoies to the category combination
        Then I should be informed that the category combination was created successfully
        And the category combination should have all of the category option combinations.
        
    Scenario: Delete a category combination 
        Given I have created a category combination 
        When I try to delete the category combination
        Then the system should inform me the category combination was successfully deleted
        But not if its associated with any other object.  
        
    

    