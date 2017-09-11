const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then, Before, After}) {
  Before({tags: '@createUser'}, function () {
    this.userId = dhis2.generateUniqIds();
    this.requestData = {
      id: this.userId,
      firstName: 'Bobby',
      surname: 'Tables',
      userCredentials: {
        username: 'bobby',
        password: '!XPTOqwerty1',
        userInfo: {
          id: this.userId
        }
      }
    };

    this.userUsername = this.requestData.userCredentials.username;
    this.userPassword = this.requestData.userCredentials.password;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.USER),
      requestData: this.requestData,
      method: 'post',
      onSuccess: function (response) {
        // FIXME API returns a 200 with a JSON message where status property is OK
        // FIXME status code should be 201
        // assert.equal(response.status, 201, 'Status should be 201');
        assert.equal(response.data.status, 'OK', 'Message status property should be OK');
      }
    });
  });

  After({tags: '@createUser'}, function () {
    const world = this;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.userId),
      method: 'delete',
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Status should be 200');
        return dhis2.sendApiRequest({
          url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.userId),
          onError: function (error) {
            assert.equal(error.response.status, 404, 'Status should be 404');
          }
        });
      }
    });
  });

  When(/^I change my password to (.+)$/, function (password) {
    const world = this;
    world.oldPassword = world.userPassword;
    world.newPassword = password;

    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me',
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Status should be 200');
        world.requestData = response.data;
        world.requestData.userCredentials.password = password;
        return dhis2.sendApiRequest({
          url: dhis2.apiEndpoint() + '/me',
          requestData: world.requestData,
          method: 'put',
          onSuccess: function (response) {
            world.userPassword = password;
          },
          preventDefaultOnError: true
        }, world);
      }
    }, world);
  });

  Then(/^I should see a message that my password was successfully changed$/, function () {
    assert.equal(this.responseStatus, 200, 'Status should be 200');
  });

  Then(/^I should not be able to login using the old password$/, function () {
    this.userPassword = this.oldPassword;

    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me',
      onError: function (error) {
        assert.equal(error.response.status, 401, 'Authentication should have failed.');
      }
    }, this);
  });

  Then(/^I should be able to login using the new password$/, function () {
    this.userPassword = this.newPassword;

    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me',
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Response Status was not ok');
        assert.isOk(response.data.id, 'User id should have been returned');
      }
    }, this);
  });

  Then(/^I should receive error message (.+)$/, function (errorMessage) {
    checkForErrorMessage(errorMessage, this);
  });

  Given(/^My username is (.+)$/, function (username) {
    assert.equal(this.userUsername, username, 'Username should be: ' + username);
  });

  Then(/^I should receive a conflict error message (.+)$/, function (errorMessage) {
    checkForConflictErrorMessage(errorMessage, this);
  });
});

const checkForErrorMessage = (message, world) => {
  assert.equal(world.responseStatus, 400, 'Status should be 400');
  assert.equal(world.responseData.status, 'ERROR', 'Status should be ERROR');
  assert.equal(world.responseData.message, message);
};

const checkForConflictErrorMessage = (message, world) => {
  assert.equal(world.responseStatus, 409, 'Status should be 409');
  assert.equal(world.responseData.status, 'ERROR', 'Status should be ERROR');
  assert.equal(world.responseData.message, message);
};
