Feature: Password maintenance
As a user of DHIS2
I want to be able manage my own password

    Background:
      Given that I am logged in

    @createUser
    Scenario: Valid password
      When I change my password to !BobbyTables2
      Then I should see a message that my password was successfully changed.

    @createUser
    Scenario: Password without a digit
      When I change my password to ABCdefg!
      Then I should receive error message Property `password` requires a valid password, was given `ABCdefg!`..

    @createUser
    Scenario: Password without upper case
      When I change my password to abcdefg123!
      Then I should receive error message Property `password` requires a valid password, was given `abcdefg123!`..

    @createUser
    Scenario: Password without a special character
      When I change my password to ABCDefg123
      Then I should receive error message Property `password` requires a valid password, was given `ABCDefg123`..

    @createUser
    Scenario: Password with my username
      Given My username is bobby
      When I change my password to !Abcdebobbygf123
      Then I should receive error message Property `password` requires a valid password, was given `!Abcdebobbygf123`..

    @createUser
    Scenario Outline: Password with a generic word
      When I change my password to <password>
      Then I should receive error message Property `password` requires a valid password, was given `<password>`..
      Examples:
      | password              |
      | user!jLDx4b9          |
      | admin!jLDx4b9         |
      | system!jLDx4b9        |
      | administrator!jLDx4b9 |
      | username!jLDx4b9      |
      | password!jLDx4b9      |
      | login!jLDx4b9         |
      | manager!jLDx4b9       |

    @createUser
    Scenario: Use of historical passwords
      Given I change my password to !BobbyTables2
      And I change my password to !BobbyTables3
      And I change my password to !BobbyTables4
      And I change my password to !BobbyTables5
      And I change my password to !BobbyTables6
      And I change my password to !BobbyTables7
      And I change my password to !BobbyTables8
      And I change my password to !BobbyTables9
      And I change my password to !BobbyTables10
      And I change my password to !BobbyTables11
      And I change my password to !BobbyTables12
      And I change my password to !BobbyTables13
      And I change my password to !BobbyTables14
      And I change my password to !BobbyTables15
      And I change my password to !BobbyTables16
      And I change my password to !BobbyTables17
      And I change my password to !BobbyTables18
      And I change my password to !BobbyTables19
      And I change my password to !BobbyTables20
      And I change my password to !BobbyTables21
      And I change my password to !BobbyTables22
      And I change my password to !BobbyTables23
      And I change my password to !BobbyTables24
      And I change my password to !BobbyTables25
      And I change my password to !BobbyTables25
      Then I should receive error message Property `password` requires a valid password, was given `!BobbyTables25`..
