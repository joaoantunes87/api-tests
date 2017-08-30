const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then, Before, After}) {
  Before({tags: '@createUser'}, function () {
    this.resourceId = dhis2.generateUniqIds();
    this.requestData = {
      id: this.resourceId,
      firstName: 'Bobby',
      surname: 'Tables',
      userCredentials: {
        username: 'bobby',
        password: '!BobbyTables1',
        userInfo: {
          id: this.resourceId
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
        assert.equal(response.status, 200, 'Status should be 200');
      }
    });
  });

  After({tags: '@createUser'}, function () {
    const world = this;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.resourceId),
      method: 'delete',
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Status should be 200');
        return dhis2.sendApiRequest({
          url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.resourceId),
          onError: function (error) {
            assert.equal(error.response.status, 404, 'Status should be 404');
          }
        });
      }
    });
  });

  When(/^I change my password to "(.+)"$/, function (password) {
    const world = this;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.resourceId),
      authentication: {
        username: world.userUsername,
        password: world.userPassword
      },
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Status should be 200');
        world.requestData = response.data;
        world.requestData.userCredentials.password = password;
        world.method = 'put';
        return submitServerRequest(world);
      }
    });
  });

  Then(/^I should receive error message "(.+)".$/, function (errorMessage) {
    checkForErrorMessage(errorMessage, this);
  });

  Given(/^My username is "(.+)"$/, function (username) {
    assert.equal(this.userUsername, username, 'Username should be: ' + username);
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
  assert.equal(world.responseStatus, 200, 'Status should be 400');
  assert.equal(world.responseData.status, 'ERROR', 'Status should be ERROR');
  assert.equal(world.responseData.typeReports[0].objectReports[0].errorReports[0].message, message);
};
