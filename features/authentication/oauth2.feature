Feature: OAUTH2 Authentication
As as user of DHIS2
I want to be able to allow my apps and users
to authenticate in different ways, including OAUTH2.

  Background:
    Given I have added a OAUTH2 client to the system

  Scenario: Get an OAUTH2 token from the server
     When I request a grant type password token from the server
     Then the server should provide me with a valid authentication token
      And the token should contain an expiry time
      And the token should contain a scope
      And the token should contain an access token
      And the token should contain a refresh token
      And the token should have a token type of bearer.

  Scenario: Use an OAUTH2 token to request my credentials
    Given I have a valid token from the server
     When I use the access token to authenticate with the server
      And request my account information
     Then I should see my account information.

  Scenario: Use an OAUTH2 token to get a refreshed token
    Given I have a valid OAUTH2 token
     When I request a fresh token from the server using my existing token
     Then the response should be the same as my existing token.

  #TODO 1.2.2.4. Grant type authorization_code
