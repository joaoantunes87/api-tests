const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  Given(/^I create a new user with the following details:$/, function (data) {
    this.resourceId = dhis2.generateUniqIds();

    const values = data.rawTable[1];
    this.requestData = {
      id: this.resourceId,
      firstName: values[3],
      surname: values[2],
      userCredentials: {
        username: values[0],
        password: values[1],
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
