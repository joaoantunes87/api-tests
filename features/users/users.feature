Feature: User maintenance
As a user of DHIS2
I want to be able to add and manage users

     Background:
       Given that I am logged in
       And there are some user roles in the system
       And there are some organisation units in the system

     @createUser
     Scenario: Create a valid user without permissions
     When I want to create a new user with the following details:
     | username    | password      | surname | firstname |
     | bobby       | !BobbyTables1 | Tables  | Bobby     |
     And assign the user a user role
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed I have no permission to do that operation.

     Scenario: Create a valid user
     Given that I have the necessary permissions to add and delete users
     When I want to create a new user with the following details:
     | username    | password      | surname | firstname |
     | bobby       | !BobbyTables1 | Tables  | Bobby     |
     And assign the user a user role
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed that the user was successfully created.

     Scenario: Attempt to create a user with a bad password
     Given that I have the necessary permissions to add and delete users
     When I want to create a new user with the following details:
     | username      | password    | surname | firstname |
     | cueball       | opensesame  | Ball    | Cue     |
     And assign the user a user role
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed that the user's password was not acceptable
     And the user should not be created.

     Scenario: Attempt to create a user with no user role
     Given that I have the necessary permissions to add and delete users
     When I want to create a new user with the following details:
     | username       | password    | surname | firstname  |
     | beretguy       | q;PvN/8/    | Guy     | Beret      |
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed that the user requires a user role
     And the user should not be created.

     Scenario: Attempt to create a user with no surname
     Given that I have the necessary permissions to add and delete users
     When I want to create a new user with the following details:
     | username       | password    | surname | firstname     |
     | ponytail       | p79^mJuA    |         | ponytail      |
     And assign the user a user role
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed that the user requires a surname
     And the user should not be created.

     Scenario: Attempt to create a user with no firstname
     Given that I have the necessary permissions to add and delete users
     When I want to create a new user with the following details:
     | username       | password    | surname | firstname     |
     | hairy          | 2~#C8RgE    | hairy   |               |
     And assign the user a user role
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed that the user requires a firstname
     And the user should not be created.

     Scenario: Disable a user
     Given that I have the necessary permissions to add and delete users
     And a user already exists
     And user account is enabled
     When I disable the account
     Then I should be informed that the account was disabled
     And the user should not be able to login.

     Scenario: Enable a user
     Given that I have the necessary permissions to add and delete users
     And a user already exists
     And account is disabled
     When I enable the account
     Then I should be informed that the account was enabled
     And the user should be able to login.

     Scenario: Update a users password with a valid password
     Given that I have the necessary permissions to add and delete users
     And a user already exists
     When I update the users password to !BobbyTables2
     Then the system should inform me that the users password was updated.

     Scenario: Attempt to update a users password with a short password
     Given that I have the necessary permissions to add and delete users
     And a user already exists
     When I update the users password to A!1
     Then the system should inform me that the users password was too short.

     Scenario: Attempt to update a users password which does not have an upper case character
     Given that I have the necessary permissions to add and delete users
     And a user already exists
     When I update the users password to !bobbytables3
     Then the system should inform me that the users password must contain an upper case character.

     Scenario: Attempt to update a users password which does not have a special character
     Given that I have the necessary permissions to add and delete users
     And a user already exists
     When I update the users password to bobbytables04
     Then the system should inform me that the users password must contain a special character.

     Scenario: Delete a user
     Given that I have the necessary permissions to add and delete users
     And a user already exists
     When I delete user account
     Then I should be informed that the account was deleted
     And the user should not exist.
