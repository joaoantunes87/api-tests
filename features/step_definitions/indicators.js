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
    assert.isOk(this.responseData.response.uid, 'Indicator Type Id was not returned');
  });

  Then(/^I should be informed that indicator type is invalid$/, function () {
    assert.equal(this.responseStatus, 409, 'Status should be 409');
  });

  Then(/^receive the message "(.+)".$/, function (errorMessage) {
    checkForErrorMessage(errorMessage, this);
  });

  Given(/^I create the following category combinations:$/, function (data) {
    const world = this;
    const properties = data.rawTable[0];
    const dataTable = data.rawTable;
    const categoryCombos = [];

    for (let i = 1; i < data.rawTable.length; i++) {
      const categoryCombo = {};

      properties.forEach(function (propertyKey, index) {
        categoryCombo[propertyKey] = dataTable[i][index];
      }, this);

      categoryCombos.push(categoryCombo);
    }

    const categoryComboRequests = categoryCombos.map((categoryCombo) => {
      return world.axios({
        method: 'post',
        url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.CATEGORY_COMBINATION),
        data: categoryCombo,
        auth: world.authRequestObject
      }).then(function (response) {
        assert.equal(response.status, 201, 'Status should be 201');
        assert.equal(response.data.response.uid, categoryCombo.id, 'Category Combo Id should be: ' + categoryCombo.id);
      });
    });

    return world.axios.all(categoryComboRequests);
  });

  Given(/^I create the following data elements:$/, function (data) {
    const world = this;
    const properties = data.rawTable[0];
    const dataTable = data.rawTable;
    const dataElements = [];

    for (let i = 1; i < data.rawTable.length; i++) {
      const dataElement = {};

      properties.forEach(function (propertyKey, index) {
        dataElement[propertyKey] = propertyKey === 'categoryCombo' ? {id: dataTable[i][index]} : dataTable[i][index];
      });

      dataElements.push(dataElement);
    }

    const dataElementRequests = dataElements.map((dataElement) => {
      return world.axios({
        method: 'post',
        url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.DATA_ELEMENT),
        data: dataElement,
        auth: world.authRequestObject
      }).then(function (response) {
        assert.equal(response.status, 201, 'Status should be 201');
        assert.equal(response.data.response.uid, dataElement.id, 'Data Element Id should be: ' + dataElement.id);
      });
    });

    return world.axios.all(dataElementRequests);
  });

  Given(/^I create an indicator type:$/, function (data) {
    const world = this;
    const properties = data.rawTable[0];
    const dataTable = data.rawTable;
    const indicatorType = {};

    for (let i = 1; i < data.rawTable.length; i++) {
      properties.forEach(function (propertyKey, index) {
        indicatorType[propertyKey] = dataTable[i][index];
      });
    }

    return world.axios({
      method: 'post',
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.INDICATOR_TYPE),
      data: indicatorType,
      auth: world.authRequestObject
    }).then(function (response) {
      assert.equal(response.status, 201, 'Status should be 201');
      assert.equal(response.data.response.uid, indicatorType.id, 'Indicator Type Id should be: ' + indicatorType.id);
    }).catch(function (error) {
      console.error(JSON.stringify(error.response.data, null, 2));
    });
  });

  When(/^I fill in the required fields for an indicator$/, function (data) {
    const world = this;
    const properties = data.rawTable[0];
    const dataTable = data.rawTable;
    world.requestData = {};
    world.updatedDataToAssert = {};

    for (let i = 1; i < data.rawTable.length; i++) {
      properties.forEach(function (propertyKey, index) {
        const value = propertyKey === 'indicatorType' ? {id: dataTable[i][index]} : dataTable[i][index];
        world.requestData[propertyKey] = value;
        world.updatedDataToAssert[propertyKey] = value;
      });
    }
  });

  When(/^I define the indicator formula$/, function (data) {
    const world = this;
    const properties = data.rawTable[0];
    const dataTable = data.rawTable;

    for (let i = 1; i < data.rawTable.length; i++) {
      properties.forEach(function (propertyKey, index) {
        world.requestData[propertyKey] = dataTable[i][index];
        world.updatedDataToAssert[propertyKey] = dataTable[i][index];
      });
    }
  });

  When(/^I submit the indicator to the server$/, function () {
    this.method = 'post';
    return submitIndicatorRequestToServer(this);
  });

  Then(/^I should be informed that the indicator was created$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Indicator Id was not returned');
  });

  Then(/^the indicator should correspond to what I submitted.$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.INDICATOR, world.responseData.response.uid)
    ).then(function (response) {
      Object.keys(world.updatedDataToAssert).forEach(function (propertyKey) {
        switch (propertyKey) {
          case 'indicatorType':
            assert.deepEqual(
              response.data[propertyKey],
              world.updatedDataToAssert[propertyKey],
              propertyKey + ' is wrong');
            break;
          default:
            assert.equal(response.data[propertyKey], world.updatedDataToAssert[propertyKey], propertyKey + ' is wrong');
        }
      });
    });
  });

  Then(/^I should be informed that indicator is invalid$/, function () {
    assert.equal(this.responseStatus, 409, 'Status should be 409');
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

const submitIndicatorRequestToServer = (world) => {
  const url = dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.INDICATOR, world.resourceId);

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
