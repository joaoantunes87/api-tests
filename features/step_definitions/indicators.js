const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  Given(/^I have the necessary permissions to add and delete indicators$/, function () {
    return this.axios.get(dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(
        dhis2.isAuthorisedToAddIndicatorsWith(response.data.userCredentials.userRoles),
        'Not Authorized to add Indicator'
      );

      assert.isOk(
        dhis2.isAuthorisedToDeleteIndicatorsWith(response.data.userCredentials.userRoles),
        'Not Authorized to delete Indicator'
      );
    });
  });

  When(/^I fill in the fields for an indicator type with valid data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    properties.forEach(function (propertyKey, index) {
      const value = (values[index] && propertyKey === 'factor') ? parseFloat(values[index]) : values[index];
      this.requestData[propertyKey] = value;
    }, this);

    this.method = 'post';
  });

  When(/^I submit that indicator type to the server$/, function () {
    return submitIndicatorTypeRequestToServer(this);
  });

  Then(/^I should be informed that the indicator type was created successfully.$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Indicator Id was not returned');
  });

  Then(/^I should be informed that indicator type is invalid$/, function () {
    assert.equal(this.responseStatus, 409, 'Status should be 409');
  });

  Then(/^receive the message "(.+)".$/, function (errorMessage) {
    checkForErrorMessage(errorMessage, this);
  });
});

const submitIndicatorTypeRequestToServer = (world) => {
  const url = dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.INDICATOR_TYPE, world.resourceId);

  return dhis2.initializePromiseUrlUsingWorldContext(world, url).then(function (response) {
    world.responseStatus = response.status;
    world.responseData = response.data;
  }).catch(function (error) {
    console.error(JSON.stringify(error.response.data, null, 2));
    world.responseData = error.response.data;
    world.responseStatus = error.response.status;
  });
};

const checkForErrorMessage = (message, world) => {
  assert.equal(world.responseData.status, 'ERROR', 'Status should be ERROR');
  assert.isOk(world.responseData.response.errorReports, 'No error reports');
  let messageFound = false;
  for (const errorReport of world.responseData.response.errorReports) {
    if (errorReport.message === message) {
      messageFound = true;
      break;
    }
  }
  assert.isOk(messageFound, 'No error message');
};
