var chai = require('chai');
var axios = require('axios');

var assert = chai.assert;    // Using Assert style

var {defineSupportCode} = require('cucumber');

defineSupportCode(function({Given, When, Then}) {

  Given('I open up the application', function() {

  });

  When('I login as {stringInDoubleQuotes} with password as {stringInDoubleQuotes}', function (username, password) {
    this.username = username;
    this.password = password;
  });

  Then('I should be authenticated', function () {
    return axios.get('https://play.dhis2.org/dev/api/me',
     {
       auth: {
         username: this.username,
         password: this.password
       }
     }).then(function(response) {
        assert.equal(response.status, 200, 'Success');
     });
  });

  Then('I should be not be authenticated', function () {
    return axios.get('https://play.dhis2.org/dev/api/me',
     {
       auth: {
         username: this.username,
         password: this.password
       }
     }).catch(function(error) {
        assert.equal(error.response.status, 401, 'Success');
     });
  });

});
