const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  let oauth2ClientCreated = false;
  let oauth2ClientId = null;
  let secret = null;
  let accessToken = null;
  let refreshToken = null;

  const oauth2Client = {
    name: 'OAuth2 Testing Client',
    cid: 'testing',
    grantTypes: [
      'password',
      'refresh_token',
      'authorization_code'
    ]
  };

  Given(/^I have added a OAUTH2 client to the system$/, function () {
    if (oauth2ClientCreated && oauth2ClientId) {
      return;
    }

    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/oAuth2Clients',
      requestData: oauth2Client,
      method: 'post',
      onSuccess: function (response) {
        assert.equal(response.status, 201, 'OAUTH2 client was not created');
        assert.isOk(response.data.response.uid, 'OAUTH2 client id was not returned');

        oauth2ClientCreated = true;
        oauth2ClientId = response.data.response.uid;
        return dhis2.sendApiRequest({
          url: dhis2.apiEndpoint() + '/oAuth2Clients/' + oauth2ClientId,
          onSuccess: function (response) {
            assert.equal(response.status, 200, 'Response status was not OK');
            assert.isOk(response.data.secret, 'Response returned no secret');
            secret = response.data.secret;
          }
        });
      },
      onError: function (error) {
        throw error;
      }
    }, this);
  });

  When(/^I request a grant type password token from the server$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.baseUrl() + '/uaa/oauth/token',
      requestData: {
        'username': dhis2.defaultBasicAuth.username,
        'password': dhis2.defaultBasicAuth.password,
        'grant_type': 'password'
      },
      method: 'post',
      multipartFormRequest: true,
      authentication: {
        username: oauth2Client.cid,
        password: secret
      },
      onError: function (error) {
        throw error;
      }
    }, this);
  });

  Then(/^the server should provide me with a valid authentication token$/, function () {
    assert.equal(this.responseStatus, 200, 'Authentication token was not created');
  });

  Then(/^the token should contain an expiry time$/, function () {
    assert.isOk(this.responseData.expires_in, 'Authentication token contains no expiry time');
  });

  Then(/^the token should contain a scope$/, function () {
    assert.isOk(this.responseData.scope, 'Authentication token contains no scope');
  });

  Then(/^the token should contain an access token$/, function () {
    assert.isOk(this.responseData.access_token, 'Authentication token contains no access token');
    accessToken = this.responseData.access_token;
  });

  Then(/^the token should contain a refresh token$/, function () {
    assert.isOk(this.responseData.refresh_token, 'Authentication token contains no refresh token');
    refreshToken = this.responseData.refresh_token;
  });

  Then(/^the token should have a token type of bearer.$/, function () {
    assert.equal(this.responseData.token_type, 'bearer', 'Token type is not bearer');
  });

  Given(/^I have a valid token from the server$/, function () {
    assert.isOk(accessToken, 'There is no token');
  });

  When(/^I use the access token to authenticate with the server$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me',
      headers: {'Authorization': 'Bearer ' + accessToken},
      authenticationNotNeeded: true
    }, this);
  });

  When(/^request my account information$/, function () {

  });

  When(/^I should see my account information.$/, function () {
    assert.equal(this.responseStatus, 200, 'Account information was not returned');
    assert.isOk(this.responseData.id, 'User id should have been returned');
  });

  Given(/^I have a valid OAUTH2 token$/, function () {
    assert.isOk(refreshToken, 'There is no token');
  });

  When(/^I request a fresh token from the server using my existing token$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.baseUrl() + '/uaa/oauth/token',
      requestData: {
        'refresh_token': refreshToken,
        'grant_type': 'refresh_token'
      },
      method: 'post',
      multipartFormRequest: true,
      authentication: {
        username: oauth2Client.cid,
        password: secret
      },
      onError: function (error) {
        throw error;
      }
    }, this);
  });

  Then(/^the response should be the same as my existing token.$/, function () {
    assert.equal(this.responseStatus, 200, 'Auth token was not returned');
    assert.isOk(this.responseData.access_token, 'Access Token was not returned');
  });
});
