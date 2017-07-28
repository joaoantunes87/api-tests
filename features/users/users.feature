Feature: User maintenance
As as user of DHIS2
I want to be able to add and manage users

    Background:
      Given that I am logged in
      And that I have the necessary permissions to and and delete users
      And there are some user roles in the system
      And there are some organisation units in the system

    Scenario: Create a valid user
     When I want to create a new user with the following details:
     | username    | password     | surname | firstname |
     | bobby       | !BobbyTables1 | Tables  | Bobby     |
     And assign the user a user role
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed that the user was successfully created.

     Scenario: Attempt to create a user with a bad password
     When I want to create a new user with the following details:
     | username      | password    | surname | firstname |
     | cueball       | opensesame  | Ball    | Cue     |
     And assign the user a user role
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed that the user's password was not acceptable
     And the user should not be created.
    
    Scenario: Attempt to create a user with no user role
     When I want to create a new user with the following details:
     | username       | password    | surname | firstname  |
     | beretguy       | q;PvN/8/    | Guy     | Beret      |
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed that the user requires a user role
     And the user should not be created.

    Scenario: Attempt to create a user with no surname
     When I want to create a new user with the following details:
     | username       | password    | surname | firstname     |
     | ponytail       | p79^mJuA    |         | ponytail      |
     And assign the user a user role
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed that the user requires a surname
     And the user should not be created.

    Scenario: Attempt to create a user with no firstname
     When I want to create a new user with the following details:
     | username       | password    | surname | firstname     |
     | hairy          | 2~#C8RgE    | hairy   |               |
     And assign the user a user role
     And assign the user a data capture organisation unit
     And submit the user to the server
     Then I should be informed that the user requires a firstname
     And the user should not be created.


     Scenario: Disable a user
     Given a user called Megan exists
     And Megan's account is enabled
     When I disable the account
     Then I should be informed that the account was disabled
     And the user should not be able to login.

     Scenario: Enable a user
     Given a user called Danish exists
     And Danish's account is disabled
     When I enable the account
     Then I should be informed that the account was enabled
     And the user should be able to login.


     Scenario: Delete a user
     Given a user called Randall exists
     When I delete Randall's account
     Then I should be informed that the account was deleted
     And the user should not exist.

    Scenario: Update a users password with a valid password
    Given a user called BlackHat exists
    When I update the users password
    And the new password has enough characters
    And the new password has an upper case character
    And the new password has a special characger
    Then the system should inform me that the users password was updated.

    Scenario: Attempt to update a users password with a short password
    Given a user called BlackHat exists
    When I update the users password
    And the new password does not have enough characters
    And the new password has an upper case character
    And the new password has a special characger
    Then the system should inform me that the users password was too short.

    Scenario: Attempt to update a users password which does not have an upper case character
    Given a user called BlackHat exists
    When I update the users password
    And the new password has enough characters
    And the new password has no upper case character
    And the new password has a special characger
    Then the system should inform me that the users password must contain an upper case character.

    Scenario: Attempt to update a users password which does not have a special character
    Given a user called BlackHat exists
    When I update the users password
    And the new password has enough characters
    And the new password has an upper case character
    And the new password does not have  special characger
    Then the system should inform me that the users password must contain a special character.

