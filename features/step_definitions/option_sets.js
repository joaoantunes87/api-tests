const { defineSupportCode } = require('cucumber');
const dhis2 = require('../support/utils.js');
const chai = require('chai');
const assert = chai.assert;

defineSupportCode(function ({Given, When, Then, Before}) {
  const generatedOptionSetId = dhis2.generateUniqIds();
  let optionSetWasCreated = false;

  // Clean up before each test run
  Before(function () {
    // auxiliar var for assertions
    this.resourceIdToDelete = null;       // resource id to be deleted
    this.resourceOptionsCountBefore = 0;  // options count before test done
  });

  Given(/^that I have the necessary permissions to add an option set$/, function () {
    return this.axios.get(dhis2.getApiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(isAuthorisedToAddOptionSetWith(response.data.userCredentials.userRoles), 'Not Authorized to create OrganisationUnit');
    });
  });

  Given(/^that I have the necessary permissions to delete an option set$/, function () {
    return this.axios.get(dhis2.getApiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(isAuthorisedToDeleteOptionSetWith(response.data.userCredentials.userRoles), 'Not Authorized to create OrganisationUnit');
    });
  });

  When(/^I fill in all of the required fields for an option set with data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    properties.forEach(function (propertyKey, index) {
      this.updatedDataToAssert[propertyKey] = values[index];
      this.requestData[propertyKey] = values[index];
    }, this);

    this.requestData.id = generatedOptionSetId;
    this.method = 'post';
  });

  Then(/^I should be informed that the option set was created$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Id was not returned');

    optionSetWasCreated = true;
    this.resourceId = this.responseData.response.uid;
  });

  Then(/^The current option set data is the same as submitted.$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(world, dhis2.generateUrlForOptionSetWithId(world.resourceId)).then(function (response) {
      world.responseData = response.data;
      assertUpdateDataWithResponseData(world);
    });
  });

  Given(/^that I have created an option set$/, function () {
    assert.equal(optionSetWasCreated, true, 'Option Set does not exist');
    assert.isOk(generatedOptionSetId, 'Id does not exist');
    this.resourceId = generatedOptionSetId;
  });

  When(/^that I specify some options to add:$/, function (data) {
    const dataTable = data.rawTable;
    const properties = dataTable[0];
    const options = [];

    for (let i = 1; i < data.rawTable.length; i++) {
      const option = {};

      properties.forEach(function (propertyKey, index) {
        option[propertyKey] = dataTable[i][index];
      }, this);

      options.push(option);
    }

    this.updatedDataToAssert.options = options;
    this.requestData.options = options;
    this.method = 'patch';
  });

  Given(/^I should be informed that the option set was updated$/, function () {
    assert.equal(this.responseStatus, 200, 'It should have been updated');
  });

  Then(/^it has at least one option$/, function () {
    const world = this;
    world.method = 'get';

    return dhis2.initializePromiseUrlUsingWorldContext(world, dhis2.generateUrlForOptionSetWithId(world.resourceId)).then(function (response) {
      world.resourceOptionsCountBefore = response.data.options.length;
      assert.isAtLeast(world.resourceOptionsCountBefore, 1, 'It shoud have at least one options');
      world.resourceIdToDelete = response.data.options[0].id;
    });
  });

  Then(/^I delete the option from the option set$/, function () {
    const world = this;

    return world.axios({
      method: 'delete',
      url: dhis2.getApiEndpoint() + '/optionSets/' + world.resourceId + '/options/' + world.resourceIdToDelete,
      auth: world.authRequestObject
    }).then(function (response) {
      world.responseStatus = response.status;
      world.responseData = response.data;
    }).catch(function (error) {
      world.errorResponse = error;
    });
  });

  Then(/^I should be informed that the option set was delete$/, function () {
    assert.equal(this.responseStatus, 204, 'Status should be 204');
  });

  Then(/^It was really deleted.$/, function () {
    const world = this;

    return world.axios({
      method: 'get',
      url: dhis2.getApiEndpoint() + '/optionSets/' + world.resourceId + '/options/' + world.resourceIdToDelete,
      auth: world.authRequestObject
    }).catch(function (error) {
      assert.equal(error.response.status, 404, 'Status should be 404');
      world.method = 'get';
      world.requestData = {};
      return dhis2.initializePromiseUrlUsingWorldContext(world, dhis2.generateUrlForOptionSetWithId(world.resourceId));
    }).then(function (response) {
      assert.equal(response.data.options.length, world.resourceOptionsCountBefore - 1, 'Option Set does not have the right options');
    });
  });

  Then(/^I change the name of the option to (.+)$/, function (value) {
    this.requestData['name'] = value;
    this.updatedDataToAssert['name'] = value;
    this.method = 'patch';
  });

  Then(/^I change the code of the option to (.+)$/, function (value) {
    this.requestData['code'] = value;
    this.method = 'patch';
  });
});

const isAuthorisedToAddOptionSetWith = (userRoles = []) => {
  return dhis2.authorityExistsInUserRoles('F_OPTIONSET_PUBLIC_ADD', userRoles);
};

const isAuthorisedToDeleteOptionSetWith = (userRoles = []) => {
  return dhis2.authorityExistsInUserRoles('F_OPTIONSET_DELETE', userRoles);
};

const assertUpdateDataWithResponseData = (world) => {
  Object.keys(world.updatedDataToAssert).forEach(function (propertyKey) {
    if (propertyKey === 'options') {
      const optionSetsSentToAddCount = world.updatedDataToAssert.options.lenght;
      const optionSetsReturnedCount = world.responseData.options.lenght;
      assert.equal(optionSetsSentToAddCount, optionSetsReturnedCount, 'Option Sets added does not match');
    } else {
      assert.equal(world.responseData[propertyKey], world.updatedDataToAssert[propertyKey], propertyKey + ' is wrong');
    }
  });
};
