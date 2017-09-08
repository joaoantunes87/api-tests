const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');
const FormData = require('form-data');
const path = require('path');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  Given(/^that I have the necessary permissions to manage apps$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]',
      onSuccess: function (response) {
        assert.isOk(
          dhis2.isAuthorisedToManageApplicationWith(response.data.userCredentials.userRoles),
          'Not Authorized to manage apps'
        );
      }
    }, this);
  });

  Given(/^I have an application file at "(.+)"$/, function (filename) {
    const filePath = path.join(path.resolve('.'), '/features/apps/' + filename);

    this.requestData = new FormData();
    this.requestData.append('file', dhis2.loadFileFromPath(filePath));
  });

  When(/^I submit that application to the server$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.APPLICATION),
      headers: this.requestData.getHeaders(),
      requestData: this.requestData,
      method: 'post',
      preventDefaultOnError: true
    }, this);
  });

  Then(/^I should be informed that the application was created successfully$/, function () {
    assert.equal(this.responseStatus, 204, 'Http Status Code should be 204');
  });

  Then(/^I should be able find the application called "(.+)".$/, function (applicationName) {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.APPLICATION) + '?filter=name:eq:' + applicationName,
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Http Status Code should be 200');
        assert.equal(response.data.length, 1, 'It should have found one application');
        assert.equal(response.data[0].name, applicationName, 'App found should be called ' + applicationName);
      }
    }, this);
  });

  Then(/^I should be informed that the application is invalid$/, function () {
    assert.equal(this.responseStatus, 409, 'Http Status Code should be 409');
    assert.equal(this.responseData.status, 'ERROR', 'Status should be ERROR');
  });

  Then(/^receive the application error message "(.+)".$/, function (errorMessage) {
    assert.equal(this.responseData.message, errorMessage, 'Error Message should be ' + errorMessage);
  });

  When(/^I delete the application with key "(.+)"$/, function (appKey) {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.APPLICATION, appKey),
      method: 'delete',
      preventDefaultOnError: true
    }, this);
  });

  Then(/^I should be informed that the application was delete successfully$/, function () {
    assert.equal(this.responseStatus, 204, 'Http Status Code should be 204');
  });

  Then(/^I should not be able find the application called "(.+)".$/, function (applicationName) {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.APPLICATION) + '?filter=name:eq:' + applicationName,
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Http Status Code should be 200');
        assert.equal(response.data.length, 0, 'It should have found no applications');
      }
    }, this);
  });
});
