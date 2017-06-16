const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const assert = chai.assert;

defineSupportCode(function ({Given, When, Then, Before}) {
  const generatedOptionSetId = generateIds();
  let optionSetWasCreated = false;

  // Clean up before each test run
  Before(function () {
    // auxiliar var for assertions
    this.requestData = {};                // body request
    this.resourceId = null;               // id of resource for test
    this.updatedDataToAssert = {};        // information to be asserted in later steps
    this.responseStatus = null;           // http status returned on previous request
    this.responseData = {};               // http response body returned on previous request
    this.errorResponse = null;            // axios error returned on previous promise
    this.method = null;                   // http method to be used in later request
    this.resourceIdToDelete = null;       // resource id to be deleted
    this.resourceOptionsCountBefore = 0;  // options count before test done
  });

  Given(/^that I have the necessary permissions to add an option set$/, function () {
    return this.axios.get(this.apiEndpoint + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(isAuthorisedToAddOptionSetWith(response.data.userCredentials.userRoles), 'Not Authorized to create OrganisationUnit');
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

  When(/^I submit the option set$/, function () {
    const world = this;

    return initializeOptionSetPromise(world, world.requestData, world.method, world.resourceId).then(function (response) {
      world.responseStatus = response.status;
      world.responseData = response.data;
    }).catch(function (error) {
      world.errorResponse = error;
    });
  });

  Then(/^I should be informed that the option set was created$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Id was not returned');

    optionSetWasCreated = true;
    this.resourceId = this.responseData.response.uid;
  });

  Then(/^The current option set data is the same as submitted.$/, function () {
    const world = this;

    return initializeOptionSetPromise(world, null, 'get', world.resourceId).then(function (response) {
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

    return initializeOptionSetPromise(world, null, 'get', world.resourceId).then(function (response) {
      world.resourceOptionsCountBefore = response.data.options.length;
      assert.isAtLeast(world.resourceOptionsCountBefore, 1, 'It shoud have at least one options');
      world.resourceIdToDelete = response.data.options[0].id;
    });
  });

  Then(/^I should be able to delete the option from the option set$/, function () {
    const world = this;

    return world.axios({
      method: 'delete',
      url: world.apiEndpoint + '/optionSets/' + world.resourceId + '/options/' + world.resourceIdToDelete,
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
      url: world.apiEndpoint + '/optionSets/' + world.resourceId + '/options/' + world.resourceIdToDelete,
      auth: world.authRequestObject
    }).catch(function (error) {
      assert.equal(error.response.status, 404, 'Status should be 404');
      return initializeOptionSetPromise(world, null, 'get', world.resourceId);
    }).then(function (response) {
      assert.equal(response.data.options.length, world.resourceOptionsCountBefore - 1, 'Option Set does not have the right options');
    });
  });

  Then(/^I change the name of the option to (.+)$/, function (value) {
    this.requestData['name'] = value;
    this.updatedDataToAssert['name'] = value;
    this.method = 'patch';
  });
});

/* just a test for now. Possible to be removed. At least to be moved to a reasuble place  */
const generateIds = (numberOfIds) => {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const currentTimestamp = Math.floor(Date.now() / 1000);   // 10 digits
  const ids = [];
  const numberOfIdsTemp = numberOfIds || 1;
  for (let seed = 0; seed < numberOfIdsTemp; seed++) {
    const letter = alphabet[seed % alphabet.length];
    ids.push(letter + currentTimestamp);
  }

  return numberOfIds ? ids : ids[0];
};

const initializeOptionSetPromise = (world, optionSetData, method, optionSetId = '') => {
  const url = world.apiEndpoint + '/optionSets/' + (optionSetId === null ? '' : optionSetId);
  return world.axios({
    method: method,
    url: url,
    data: optionSetData,
    auth: world.authRequestObject
  });
};

const isAuthorisedToAddOptionSetWith = (userRoles = []) => {
  for (const index in userRoles) {
    const authorities = userRoles[index].authorities || [];
    if (authorities.includes('F_OPTIONSET_PUBLIC_ADD')) {
      return true;
    }
  }
  return false;
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
