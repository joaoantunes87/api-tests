const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  const generatedDatasetId = dhis2.generateUniqIds();
  let datasetWasCreated = false;

  Given(/^that I have the necessary permissions to add a dataset$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]',
      onSuccess: function (response) {
        assert.isOk(
          dhis2.isAuthorisedToAddDataSetWith(response.data.userCredentials.userRoles),
          'Not Authorized to create Dataset'
        );
      }
    }, this);
  });

  Given(/^that I want to create a new dataset$/, function () {
    this.method = 'post';
    this.requestData.id = generatedDatasetId;
  });

  When(/^I fill in the fields for the dataset with data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    this.updatedDataToAssert = {};
    properties.forEach(function (propertyKey, index) {
      this.updatedDataToAssert[propertyKey] = values[index];
      this.requestData[propertyKey] = values[index];
    }, this);
  });

  When(/^I submit the dataset$/, function () {
    return submitServerRequest(this);
  });

  Then(/^I should be informed that the dataset was created$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Dataset Id was not returned');

    datasetWasCreated = true;
    this.resourceId = this.responseData.response.uid;
  });

  Then(/^The current dataset data is the same as submitted.$/, function () {
    const world = this;
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATASET, world.resourceId),
      onSuccess: function (response) {
        Object.keys(world.updatedDataToAssert).forEach(function (propertyKey) {
          switch (propertyKey) {
            case 'categoryCombo':
              assert.deepEqual(
                response.data[propertyKey],
                world.updatedDataToAssert[propertyKey],
                propertyKey + ' is wrong');
              break;
            case 'dataSetElements':
            case 'indicators':
            case 'organisationUnits':
            case 'dataInputPeriods':
              assert.sameDeepMembers(
                response.data[propertyKey],
                world.updatedDataToAssert[propertyKey],
                propertyKey + ' is wrong');
              break;
            default:
              assert.equal(
                response.data[propertyKey],
                world.updatedDataToAssert[propertyKey], propertyKey + ' is wrong'
              );
          }
        });
      }
    }, world);
  });

  When(/^I update an existing dataset$/, function () {
    assert.equal(datasetWasCreated, true, 'Dataset does not exist');
    assert.isOk(generatedDatasetId, 'Dataset Id does not exist');
    this.resourceId = generatedDatasetId;
    this.method = 'patch';
  });

  When(/^I change the expiry days to (.+)$/, function (value) {
    this.requestData.expiryDays = value;
    this.updatedDataToAssert.expiryDays = value;
  });

  When(/^I change the periodType to (.+)$/, function (value) {
    this.requestData.periodType = value;
    this.updatedDataToAssert.periodType = value;
  });

  Given(/^there is a category combination with a dimension of type attribute$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.CATEGORY_COMBINATION) +
            '?filter=dataDimensionType:eq:ATTRIBUTE',
      onSuccess: function (response) {
        assert.isAtLeast(
          response.data.categoryCombos.length,
          1,
          'It shoud have at least one category combination with a a dimension of type attribute'
        );
      }
    }, this);
  });

  When(/^I update the category combination of the dataset$/, function () {
    const world = this;
    const categoryCombo = {
      id: world.responseData.categoryCombos[0].id
    };
    this.requestData.categoryCombo = categoryCombo;
    this.updatedDataToAssert.categoryCombo = categoryCombo;
  });

  When(/^there are some aggregate data elements in the system$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.DATA_ELEMENT) +
            '?filter=domainType:eq:AGGREGATE',
      onSuccess: function (response) {
        assert.isAtLeast(
          response.data.dataElements.length,
          1,
          'It shoud have at least one aggregate data element'
        );
      }
    }, this);
  });

  When(/^I add some data elements to the dataset$/, function () {
    const dataSetElements = [{
      id: this.responseData.dataElements[0].id
    }];
    this.requestData.dataSetElements = dataSetElements;
    this.updatedDataToAssert.dataSetElements = dataSetElements;
  });

  When(/^there are some indicators in the system$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.INDICATOR),
      onSuccess: function (response) {
        assert.isAtLeast(
          response.data.indicators.length,
          1,
          'It shoud have at least one indicator'
        );
      }
    }, this);
  });

  When(/^I add indicators to the dataset$/, function () {
    const indicators = [{
      id: this.responseData.indicators[0].id
    }];
    this.requestData.indicators = indicators;
    this.updatedDataToAssert.indicators = indicators;
  });

  When(/^I add some organisation units to the dataset$/, function () {
    const organisationUnits = [{
      id: this.responseData.organisationUnits[0].id
    }];
    this.requestData.organisationUnits = organisationUnits;
    this.updatedDataToAssert.organisationUnits = organisationUnits;
  });

  When(/^I set the data input periods for the dataset:$/, function (data) {
    const dataTable = data.rawTable;
    const properties = dataTable[0];
    const dataInputPeriods = [];

    for (let i = 1; i < data.rawTable.length; i++) {
      const dataInputPeriod = {};

      properties.forEach(function (propertyKey, index) {
        if (propertyKey === 'period') {
          dataInputPeriod.period = {id: dataTable[i][index]};
        } else {
          dataInputPeriod[propertyKey] = dataTable[i][index];
        }
      }, this);

      dataInputPeriods.push(dataInputPeriod);
    }

    this.updatedDataToAssert.dataInputPeriods = dataInputPeriods;
    this.requestData.dataInputPeriods = dataInputPeriods;
  });

  Then(/^I should be informed that the dataset was not updated$/, function (resourceType) {
    assert.equal(this.responseStatus, 400, 'The status should have been 400');
  });

  Then(/^the server should show me an error message equal to "(.+)".$/, function (errorMessage) {
    assert.equal(this.responseStatus, 400, 'It should have returned error status of 400');
    assert.equal(this.responseData.status, 'ERROR', 'It should have returned error status');
    assert.equal(this.responseData.message, errorMessage, 'Error message should be ' + errorMessage);
  });
});

const submitServerRequest = (world) => {
  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATASET, world.resourceId),
    requestData: world.requestData,
    method: world.method,
    preventDefaultOnError: true
  }, world);
};
