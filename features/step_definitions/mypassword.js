const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  Given(/^I create a new user with the following details:$/, function (data) {
    this.resourceId = dhis2.generateUniqIds();
    this.method = 'post';

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

    return dhis2.initializePromiseUrlUsingWorldContext(
      this,
      dhis2.generateUrlForResourceType(dhis2.resourceTypes.USER)
    ).then(function (response) {
      assert.equal(response.status, 200, 'Status should be 201');
    });
  });

  When(/^I change my password to "(.+)"$/, function (password) {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.resourceId)
    ).then(function (response) {
      assert.equal(response.status, 200, 'Status should be 200');
      world.requestData = response.data;
      world.requestData.userCredentials.password = password;
      world.method = 'put';
      return submitServerRequest(world);
    });
  });

  Then(/^I should receive error message "(.+)".$/, function (errorMessage) {
    checkForErrorMessage(errorMessage, this);
  });
});

const submitServerRequest = (world) => {
  const url = dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.resourceId);

  return dhis2.initializePromiseUrlUsingWorldContext(world, url).then(function (response) {
    dhis2.debug('SUCCESS STATUS: ' + response.status);
    dhis2.debug('SUCCESS RESPONSE: ' + JSON.stringify(response.data, null, 2));
    world.responseStatus = response.status;
    world.responseData = response.data;
  }).catch(function (error) {
    dhis2.debug('ERROR STATUS: ' + error.response.status);
    dhis2.debug('ERROR RESPOONSE: ' + JSON.stringify(error.response.data, null, 2));
    world.responseData = error.response.data;
    world.responseStatus = error.response.status;
  });
};

const checkForErrorMessage = (message, world) => {
  assert.equal(world.responseStatus, 200, 'Status should be 400');
  assert.equal(world.responseData.status, 'ERROR', 'Status should be ERROR');
  assert.equal(world.responseData.typeReports[0].objectReports[0].errorReports[0].message, message);
};
