Feature: Password maintenance
As a user of DHIS2
I want to be able manage my own password

    Background:
      Given that I am logged in

    Scenario: Password without a digit
      Given I create a new user with the following details:
      | username    | password      | surname | firstname |
      | bobby       | !BobbyTables1 | Tables  | Bobby     |
      When I change my password to "ABCdefg!"
      Then I should receive error message "Property `password` requires a valid password, was given `ABCdefg!`.".

    Scenario: Password without upper case
      Given I create a new user with the following details:
      | username    | password      | surname | firstname |
      | lowerbobby  | !BobbyTables1 | Tables  | Bobby     |
      When I change my password to "abcdefg123!"
      Then I should receive error message "Property `password` requires a valid password, was given `abcdefg123!`.".

    Scenario: Password without a special character
      Given I create a new user with the following details:
      | username            | password      | surname | firstname |
      | nospecialcharacter  | !BobbyTables1 | Tables  | Bobby     |
      When I change my password to "ABCDefg123"
      Then I should receive error message "Property `password` requires a valid password, was given `ABCDefg123`.".

    Scenario: Password with my username
      Given I create a new user with the following details:
      | username            | password      | surname | firstname |
      | john  | !BobbyTables1 | Tables  | Bobby     |
      When I change my password to "!Abcdejohngf123"
      Then I should receive error message "Property `password` requires a valid password, was given `!Abcdejohngf123`.".
    @ignore
    Scenario Outline: Password with a generic word
      When I change my password to any of these <passwords>
      Then I should see message that my password cannot contain generic words.
      Examples:
      | passwords             |
      | user!jLDx4b9          |
      | admin!jLDx4b9         |
      | system!jLDx4b9        |
      | administrator!jLDx4b9 |
      | username!jLDx4b9      |
      | password!jLDx4b9      |
      | login!jLDx4b9         |
      | manager!jLDx4b9       |
    @ignore
    Scenario: Valid password
      When I change my password a valid password
      And the password has at least the required number of characters
      And the password has an upper case character
      And the password has a special character
      And the password has a number
      And the password does not contain my username
      And the password does not contain my email address
      Then I should see a message that my password was successfully changed.
    @ignore
    Scenario: Use of historical passwords
      Given I have generated 24 valid passwords
      And the password has at least the required number of characters
      And the password has an upper case character
      And the password has a special character
      And the password has a number
      And the password does not contain my username
      And the password does not contain my email address
      When I change my password to each of the passwords
      And I change my password again any of the passwords
      Then I should receive a message that I cannot use a previous password.
