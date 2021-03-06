const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  const generatedUserId = dhis2.generateUniqIds();
  let userCreated = false;
  let userUsername = null;
  let userPassword = null;

  Given(/^that I have the necessary permissions to add and delete users$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]',
      onSuccess: function (response) {
        assert.isOk(
          dhis2.isAuthorisedToAddUsersWith(response.data.userCredentials.userRoles),
          'Not Authorized to add users'
        );
        assert.isOk(
          dhis2.isAuthorisedToDeleteUsersWith(response.data.userCredentials.userRoles),
          'Not Authorized to delete users'
        );
      }
    }, this);
  });

  Given(/^there are some user roles in the system$/, function () {
    const world = this;
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.USER_ROLE),
      onSuccess: function (response) {
        assert.isAtLeast(
          response.data.userRoles.length,
          1,
          'It shoud have at least one user role'
        );
        world.userRoles = response.data.userRoles;
      }
    }, world);
  });

  When(/^I want to create a new user with the following details:$/, function (data) {
    const userId = userCreated ? dhis2.generateUniqIds() : generatedUserId;
    this.method = 'post';

    const values = data.rawTable[1];
    this.requestData = {
      id: userId,
      firstName: values[3],
      surname: values[2],
      userCredentials: {
        username: values[0],
        password: values[1],
        userInfo: {
          id: userId
        }
      }
    };
  });

  When(/^assign the user a user role$/, function () {
    this.requestData.userCredentials.userRoles = [{id: this.userRoles[0].id}];
  });

  When(/^assign the user a data capture organisation unit$/, function () {
    this.requestData.organisationUnits = [{id: this.organisationUnits[0].id}];
  });

  When(/^submit the user to the server$/, function () {
    return submitServerRequest(this);
  });

  Then(/^I should be informed that the user was successfully created.$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'User Id was not returned');

    userCreated = true;
    userUsername = this.requestData.userCredentials.username;
    userPassword = this.requestData.userCredentials.password;
  });

  Then(/^I should be informed that the user's password was not acceptable$/, function () {
    checkForErrorMessage(
      'Property `password` requires a valid password, was given `' + this.requestData.userCredentials.password + '`.',
      this
    );
  });

  Then(/^the user should not be created.$/, function () {
    assert.equal(this.responseStatus, 400, 'Status should be 400');
  });

  Then(/^I should be informed that the user requires a user role$/, function () {
    checkForErrorMessage(
      'Missing required property `userRoles`.',
      this
    );
  });

  Then(/^I should be informed that the user requires a surname$/, function () {
    checkForErrorMessage(
      'Missing required property `surname`.',
      this
    );
  });

  Then(/^I should be informed that the user requires a firstname$/, function () {
    checkForErrorMessage(
      'Missing required property `firstName`.',
      this
    );
  });

  Given(/^a user already exists$/, function () {
    assert.isOk(userCreated, 'User was not created');
    this.resourceId = generatedUserId;
  });

  Given(/^user account is enabled$/, function () {
    const world = this;
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.resourceId),
      onSuccess: function (response) {
        assert.isNotOk(response.data.userCredentials.disabled, 'User is disabled');
        world.requestData = response.data;
      }
    }, world);
  });

  When(/^I disable the account$/, function () {
    this.method = 'put';
    this.requestData.userCredentials.disabled = true;
    return submitServerRequest(this);
  });

  Then(/^I should be informed that the account was disabled$/, function () {
    assert.equal(this.responseStatus, 200, 'Status should be 200');
  });

  Then(/^the user should not be able to login.$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me',
      authentication: {
        username: userUsername,
        password: userPassword
      },
      onError: function (error) {
        assert.equal(error.response.status, 401, 'Authentication should have failed.');
      }
    }, this);
  });

  Given(/^account is disabled$/, function () {
    const world = this;
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.resourceId),
      onSuccess: function (response) {
        assert.isOk(response.data.userCredentials.disabled, 'User is enabled');
        world.requestData = response.data;
      }
    });
  });

  When(/^I enable the account$/, function () {
    this.method = 'put';
    this.requestData.userCredentials.disabled = false;
    return submitServerRequest(this);
  });

  Then(/^I should be informed that the account was enabled$/, function () {
    assert.equal(this.responseStatus, 200, 'Status should be 200');
  });

  Then(/^the user should be able to login.$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me',
      authentication: {
        username: userUsername,
        password: userPassword
      },
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Response Status was not ok');
        assert.isOk(response.data.id, 'User id should have been returned');
      }
    }, this);
  });

  When(/^I update the users password to (.*)$/, function (password) {
    const world = this;
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.resourceId),
      onSuccess: function (response) {
        world.method = 'put';
        world.requestData = response.data;
        world.requestData.userCredentials.password = password;
        return submitServerRequest(world);
      }
    }, world);
  });

  Then(/^the system should inform me that the users password was updated.$/, function () {
    assert.equal(this.responseStatus, 200, 'Status should be 200');
  });

  Then(/^the system should inform me that the users password was too short.$/, function () {
    checkForErrorMessage(
      'Allowed length range for property `password` is [8 to 60], but given length was 3.',
      this
    );
  });

  Then(/^the system should inform me that the users password must contain an upper case character.$/, function () {
    checkForErrorMessage(
      'Property `password` requires a valid password, was given `' + this.requestData.userCredentials.password + '`.',
      this
    );
  });

  Then(/^the system should inform me that the users password must contain a special character.$/, function () {
    checkForErrorMessage(
      'Property `password` requires a valid password, was given `' + this.requestData.userCredentials.password + '`.',
      this
    );
  });

  When(/^I delete user account$/, function () {
    this.method = 'delete';
    this.resourceId = generatedUserId;

    return submitServerRequest(this);
  });

  Then(/^I should be informed that the account was deleted$/, function () {
    assert.equal(this.responseStatus, 200, 'Status should be 200');
    assert.equal(this.responseData.status, 'OK', 'Status should be 200');
  });

  Then(/^the user should not exist.$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, this.resourceId),
      onSuccess: function (response) {
        /* throw an error could be used here. Once here, this assert will always fail because onSuccess
           we can not have a 4** status, but using assert we keep the same style.
        */
        assert.equal(response.status, 404, 'Status should be 404');
      },
      onError: function (error) {
        assert.equal(error.response.status, 404, 'Status should be 404');
      },
      preventDefaultOnError: true
    }, this);
  });
});

const submitServerRequest = (world) => {
  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.resourceId),
    requestData: world.requestData,
    method: world.method,
    preventDefaultOnError: true
  }, world);
};

const checkForErrorMessage = (message, world) => {
  assert.equal(world.responseStatus, 400, 'Status should be 400');
  assert.equal(world.responseData.status, 'ERROR', 'Status should be ERROR');
  assert.equal(world.responseData.typeReports[0].objectReports[0].errorReports[0].message, message);
};
