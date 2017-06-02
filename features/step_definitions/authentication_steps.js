const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const axios = require('axios');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  Given('I open up the application', function () {
  });

  When('I login as {stringInDoubleQuotes} with password as {stringInDoubleQuotes}', function (username, password) {
    this.username = username;
    this.password = password;
  });

  Then('I should be authenticated', function () {
    return axios.get(this.apiEndpoint + 'me', {
      auth: {
        username: this.username,
        password: this.password
      }
    }).then(function (response) {
      assert.equal(response.status, 200, 'Success');
    });
  });

  Then('I should be not be authenticated', function () {
    return axios.get(this.apiEndpoint + 'me', {
      auth: {
        username: this.username,
        password: this.password
      }
    }).catch(function (error) {
      assert.equal(error.response.status, 401, 'Success');
    });
  });
});
