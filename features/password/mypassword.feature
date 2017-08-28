Feature: Password maintenance
As a user of DHIS2
I want to be able manage my own password

     Background:
       Given that I am logged in
    
    Scenario: Password without a digit
        When I change my password to 
        | ABCdefg! |
        Then I should see a message that my password must have at least one digit.

    Scenario: Password without upper case
        When I change my password to 
        | abcdefg123! |
        Then I should see a message that my password must have an uppercase character.

     Scenario: Password without a special character
        When I change my password to 
        | ABCDefg123 |
        Then I should see a message that my password must have an special character.

    Scenario: Password with an my username
        When I change my password to my username with '!Abcdegf123'
        Then I should see a message that my password cannot contain my username.

    Scenario: Valid password
        When I change my password a valid password
        And the password has at least the required number of characters
        And the password has an upper case character
        And the password has a special character
        And the password has a number
        Then I should see a message that my password was successfully changed. 

    Scenario: Use of historical passwords
        Given I have generated 24 valid passwords
        And the password has at least the required number of characters
        And the password has an upper case character
        And the password has a special character
        And the password has a number
        When I change my password to each of the passwords
        And I change my password again any of the passwords
        I should receive a message that I cannot use a previous password. 
      
