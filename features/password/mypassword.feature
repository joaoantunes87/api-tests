Feature: Password maintenance
As a user of DHIS2
I want to be able manage my own password

    Background:
      Given that I am logged in

    @createUser
    Scenario: Valid password
      When I change my password to !XPTOqwerty2
      Then I should see a message that my password was successfully changed
      And I should not be able to login using the old password
      And I should be able to login using the new password

    @createUser
    Scenario: Password without a digit
      When I change my password to ABCdefg!
      Then I should receive error message Password must have at least one digit

    @createUser
    Scenario: Password without upper case
      When I change my password to abcdefg123!
      Then I should receive error message Password must have at least one upper case

    @createUser
    Scenario: Password without a special character
      When I change my password to ABCDefg123
      Then I should receive error message Password must have at least one special character

    @createUser
    Scenario: Password with my username
      Given My username is bobby
      When I change my password to !Abcdebobbygf123
      Then I should receive error message Username/Email must not be a part of password

    @createUser
    Scenario Outline: Password with a generic word
      When I change my password to <password>
      Then I should receive error message Password must not have any generic word
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
      Given I change my password to !XPTOqwerty2
      And I change my password to !XPTOqwerty3
      And I change my password to !XPTOqwerty4
      And I change my password to !XPTOqwerty5
      And I change my password to !XPTOqwerty6
      And I change my password to !XPTOqwerty7
      And I change my password to !XPTOqwerty8
      And I change my password to !XPTOqwerty9
      And I change my password to !XPTOqwerty10
      And I change my password to !XPTOqwerty11
      And I change my password to !XPTOqwerty12
      And I change my password to !XPTOqwerty13
      And I change my password to !XPTOqwerty14
      And I change my password to !XPTOqwerty15
      And I change my password to !XPTOqwerty16
      And I change my password to !XPTOqwerty17
      And I change my password to !XPTOqwerty18
      And I change my password to !XPTOqwerty19
      And I change my password to !XPTOqwerty20
      And I change my password to !XPTOqwerty21
      And I change my password to !XPTOqwerty22
      And I change my password to !XPTOqwerty23
      And I change my password to !XPTOqwerty24
      And I change my password to !XPTOqwerty25
      And I change my password to !XPTOqwerty25
      Then I should receive error message Password must not be one of the previous 24 passwords
