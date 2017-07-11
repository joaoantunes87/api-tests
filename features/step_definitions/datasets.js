const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  const generatedDatasetId = dhis2.generateUniqIds();
  const attributeCategoryCombinationId = 'O4VaNks6tta';
  const aggregateDataElementIds = ['pgzNTiQwMES', 'OCU92ttHmic'];
  const aggregateIndicatorIds = ['ReUHfIn0pTQ', 'bASXd9ukRGD'];
  let datasetWasCreated = false;

  Given(/^that I have the necessary permissions to add a dataset$/, function () {
    return this.axios.get(dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(
        dhis2.isAuthorisedToAddDataSetWith(response.data.userCredentials.userRoles),
        'Not Authorized to create Dataset'
      );
    });
  });

  Given(/^that there are some data elements in the system$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT)
    ).then(function (response) {
      assert.isAtLeast(response.data.dataElements.length, 1, 'It shoud have at least one data element');
    });
  });

  Given(/^that there are some organisation units in the system$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT)
    ).then(function (response) {
      assert.isAtLeast(response.data.organisationUnits.length, 1, 'It shoud have at least one organisation unit');
    });
  });

  Given(/^that I want to create a new dataset$/, function () {
    this.method = 'post';
    this.requestData.id = generatedDatasetId;
  });

  Then(/^I should be informed that the dataset was created$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Dataset Id was not returned');

    datasetWasCreated = true;
    this.resourceId = this.responseData.response.uid;
  });

  Then(/^The current dataset data is the same as submitted.$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATASET, world.resourceId)
    ).then(function (response) {
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
            assert.sameDeepMembers(
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

  Given(/^I got the existing dataset to update$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    assert.equal(datasetWasCreated, true, 'Dataset does not exist');
    assert.isOk(generatedDatasetId, 'Dataset Id does not exist');

    world.resourceId = generatedDatasetId;
    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATASET, world.resourceId)
    ).then(function (response) {
      assert.equal(response.status, 200, 'Status should be 200');
      world.requestData = response.data;
      world.method = 'put';
    });
  });

  When(/^I change the periodType to (.+)$/, function (value) {
    this.requestData.periodType = value;
    this.updatedDataToAssert.periodType = value;
  });

  When(/^there is a category combination with a dimension of type attribute$/, function () {
    assert.isOk(generatedDatasetId, 'O4VaNks6tta');
  });

  When(/^I update the category combination of the dataset$/, function () {
    const categoryCombo = {
      id: attributeCategoryCombinationId
    };
    this.requestData.categoryCombo = categoryCombo;
    this.updatedDataToAssert.categoryCombo = categoryCombo;
  });

  When(/^there are some aggregate data elements in the system$/, function () {
    assert.isAtLeast(aggregateDataElementIds.length, 1, 'It shoud have at least one aggregate data element');
  });

  When(/^I add data elements to the dataset$/, function () {
    const dataSetElements = [];
    for (const id of aggregateDataElementIds) {
      dataSetElements.push({
        id: id
      });
    }
    this.requestData.dataSetElements = dataSetElements;
    this.updatedDataToAssert.dataSetElements = dataSetElements;
  });

  When(/^there are some indicators in the system$/, function () {
    assert.isAtLeast(aggregateIndicatorIds.length, 1, 'It shoud have at least one indicator');
  });

  When(/^I add indicators to the dataset$/, function () {
    const indicators = [];
    for (const id of aggregateIndicatorIds) {
      indicators.push({
        id: id
      });
    }
    this.requestData.indicators = indicators;
    this.updatedDataToAssert.indicators = indicators;
  });
});
