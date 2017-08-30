const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  Given(/^I open up the application$/, function () {
  });

  When(/^I login as "(.+)" with password as "(.+)"$/, function (username, password) {
    this.username = username;
    this.password = password;
  });

  Then(/^I should be authenticated$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me',
      authentication: {
        username: this.username,
        password: this.password
      },
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Response Status was not ok');
        assert.isOk(response.data.id, 'User id should have been returned');
      }
    });
  });

  Then(/^I should be not be authenticated$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me',
      authentication: {
        username: this.username,
        password: this.password
      },
      onError: function (error) {
        assert.equal(error.response.status, 401, 'Authentication should have failed.');
      }
    });
  });

  Given(/^that I am logged in$/, function () {
    let auth = dhis2.defaultBasicAuth;
    if (this.userUsername && this.userPassword) {
      auth = {
        username: this.userUsername,
        password: this.userPassword
      };
    }

    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me',
      authentication: auth,
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Response Status was not ok');
        assert.isOk(response.data.id, 'User id should have been returned');
      }
    });
  });
});
