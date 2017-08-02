const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const querystring = require('querystring');
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

  const basicAuth = {
    username: 'admin',
    password: 'district'
  };

  Given(/^I have added a OAUTH2 client to the system$/, function () {
    if (oauth2ClientCreated && oauth2ClientId) {
      return;
    }

    const world = this;
    return world.axios({
      method: 'post',
      url: dhis2.apiEndpoint() + '/oAuth2Clients',
      data: oauth2Client,
      auth: basicAuth
    }).then(function (response) {
      assert.equal(response.status, 201, 'OAUTH2 client was not created');
      assert.isOk(response.data.response.uid, 'OAUTH2 client id was not returned');

      oauth2ClientCreated = true;
      oauth2ClientId = response.data.response.uid;
      return world.axios({
        method: 'get',
        url: dhis2.apiEndpoint() + '/oAuth2Clients/' + oauth2ClientId,
        data: {},
        auth: basicAuth
      }).then(function (response) {
        assert.equal(response.status, 200, 'Response status was not OK');
        assert.isOk(response.data.secret, 'Response returned no secret');
        secret = response.data.secret;
      });
    }).catch(function (error) {
      dhis2.debug('ERROR: ' + JSON.stringify(error.response.data));
      throw error;
    });
  });

  When(/^I request a grant type password token from the server$/, function () {
    const world = this;

    return this.axios({
      method: 'post',
      url: dhis2.baseUrl() + '/uaa/oauth/token',
      data: querystring.stringify({
        'username': basicAuth.username,
        'password': basicAuth.password,
        'grant_type': 'password'
      }),
      auth: {
        username: oauth2Client.cid,
        password: secret
      }
    }).then(function (response) {
      dhis2.debug('GRANT TYPE PASSWORD: ' + JSON.stringify(response.data));
      world.responseStatus = response.status;
      world.responseData = response.data;
    }).catch(function (error) {
      dhis2.debug('ERROR: ' + JSON.stringify(error.response.data));
      throw error;
    });
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
    const world = this;

    return this.axios.get(dhis2.apiEndpoint() + '/me', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(function (response) {
      world.responseStatus = response.status;
      world.responseData = response.data;
    });
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
    const world = this;

    return this.axios({
      method: 'post',
      url: dhis2.baseUrl() + '/uaa/oauth/token',
      data: querystring.stringify({
        'refresh_token': refreshToken,
        'grant_type': 'refresh_token'
      }),
      auth: {
        username: oauth2Client.cid,
        password: secret
      }
    }).then(function (response) {
      dhis2.debug('GRANT TYPE REFRESH TOKEN: ' + JSON.stringify(response.data));
      world.responseStatus = response.status;
      world.responseData = response.data;
    });
  });

  Then(/^the response should be the same as my existing token.$/, function () {
    assert.equal(this.responseStatus, 200, 'Auth token was not returned');
    assert.isOk(this.responseData.access_token, 'Access Token was not returned');
  });
});
