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
    return this.axios.get(dhis2.apiEndpoint() + '/me', {
      auth: {
        username: this.username,
        password: this.password
      }
    }).then(function (response) {
      assert.equal(response.status, 200, 'Response Status was not ok');
      assert.isOk(response.data.id, 'User id should have been returned');
    });
  });

  Then(/^I should be not be authenticated$/, function () {
    return this.axios.get(dhis2.apiEndpoint() + '/me', {
      auth: {
        username: this.username,
        password: this.password
      }
    }).catch(function (error) {
      assert.equal(error.response.status, 401, 'Success');
    });
  });

  Given(/^that I am logged in$/, function () {
    return this.axios.get(dhis2.apiEndpoint() + '/me', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.equal(response.status, 200, 'Response Status is ok');
      assert.isOk(response.data.id, 'User id should have been returned');
    });
  });
});
