Feature: Password maintenance
As a user of DHIS2
I want to be able manage my own password

    Background:
      Given that I am logged in
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
