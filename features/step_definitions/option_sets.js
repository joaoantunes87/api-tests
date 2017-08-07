const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then, Before}) {
  const generatedOptionSetId = dhis2.generateUniqIds();
  let optionSetWasCreated = false;

  Given(/^that I have the necessary permissions to add an option set$/, function () {
    return this.axios.get(dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(
        dhis2.isAuthorisedToAddOptionSetWith(response.data.userCredentials.userRoles),
        'Not Authorized to create OrganisationUnit'
      );
    });
  });

  When(/^that I want to create a new option set$/, function () {
    this.requestData.id = generatedOptionSetId;
    this.method = 'post';
  });

  When(/^I submit the option set$/, function () {
    return submitServerRequest(this);
  });

  When(/^I fill in the fields for the options set with data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    this.updatedDataToAssert = {};
    properties.forEach(function (propertyKey, index) {
      this.updatedDataToAssert[propertyKey] = values[index];
      this.requestData[propertyKey] = values[index];
    }, this);
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

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.OPTION_SET, world.resourceId)
    ).then(function (response) {
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
    const world = this;
    const dataTable = data.rawTable;
    const properties = dataTable[0];
    const options = [];
    world.updatedDataToAssert = { options: [] };

    for (let i = 1; i < data.rawTable.length; i++) {
      const option = {};

      properties.forEach(function (propertyKey, index) {
        option[propertyKey] = dataTable[i][index];
      }, this);

      options.push(option);
    }

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.OPTION_SET, world.resourceId)
    ).then(function (response) {
      world.requestData = response.data;
      const optionCreationRequests = options.map((option) => {
        return world.axios({
          method: 'post',
          url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.OPTION),
          data: option,
          auth: world.authRequestObject
        }).then(function (response) {
          dhis2.debug('OPTION CREATED: ' + response.data.response.uid);
          world.requestData.options.push({id: response.data.response.uid});
          world.updatedDataToAssert.options.push({id: response.data.response.uid});
          dhis2.debug('OPTION SET REQUEST DATA: ' + JSON.stringify(world.requestData.options, null, 2));
        });
      });

      world.method = 'put';
      world.resourceId = generatedOptionSetId;
      return world.axios.all(optionCreationRequests);
    });
  });

  Given(/^that I have the necessary permissions to delete an option$/, function () {
    return this.axios.get(dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(
        dhis2.isAuthorisedToDeleteOptionWith(response.data.userCredentials.userRoles),
        'Not Authorized to delete Option'
      );
    });
  });

  Then(/^it has at least one option$/, function () {
    const world = this;
    world.method = 'get';

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.OPTION_SET, world.resourceId)
    ).then(function (response) {
      assert.isAtLeast(response.data.options.length, 1, 'It shoud have at least one options');
      world.responseData = response.data;
    });
  });

  Then(/^I delete the option from the option set$/, function () {
    const world = this;
    world.resourceIdToDelete = world.responseData.options[0].id;

    return world.axios({
      method: 'delete',
      url: dhis2.apiEndpoint() + '/optionSets/' + world.resourceId + '/options/' + world.resourceIdToDelete,
      auth: world.authRequestObject
    }).then(function (response) {
      world.responseStatus = response.status;
      world.responseData = response.data;
    }).catch(function (error) {
      world.responseData = error.response.data;
      world.responseStatus = error.response.status;
    });
  });

  Then(/^I should be informed that the option set was deleted$/, function () {
    assert.equal(this.responseStatus, 204, 'Status should be 204');
  });

  Then(/^It was really deleted.$/, function () {
    const world = this;

    return world.axios({
      method: 'get',
      url: dhis2.apiEndpoint() + '/optionSets/' + world.resourceId + '/options/' + world.resourceIdToDelete,
      auth: world.authRequestObject
    }).catch(function (error) {
      assert.equal(error.response.status, 404, 'Status should be 404');
    });
  });

  Then(/^I change the name of the option set to (.+)$/, function (value) {
    this.requestData['name'] = value;
    this.updatedDataToAssert['name'] = value;
    this.method = 'patch';
  });

  Then(/^I change the code of the option set to (.+)$/, function (value) {
    this.requestData['code'] = value;
    this.method = 'patch';
  });

  Given(/^that I have the necessary permissions to delete an option set$/, function () {
    return this.axios.get(dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(
        dhis2.isAuthorisedToDeleteOptionSetWith(response.data.userCredentials.userRoles),
        'Not Authorized to delete Option'
      );
    });
  });

  Then(/^I delete the option set$/, function () {
    const world = this;
    world.method = 'delete';

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.OPTION_SET, generatedOptionSetId)
    ).then(function (response) {
      world.responseStatus = response.status;
      world.responseData = response.data;
    }).catch(function (error) {
      world.responseData = error.response.data;
      world.responseStatus = error.response.status;
    });
  });
});

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

const submitServerRequest = (world) => {
  const url = dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.OPTION_SET, world.resourceId);

  return dhis2.initializePromiseUrlUsingWorldContext(world, url).then(function (response) {
    world.responseStatus = response.status;
    world.responseData = response.data;
  }).catch(function (error) {
    console.error(JSON.stringify(error.response.data, null, 2));
    world.responseData = error.response.data;
    world.responseStatus = error.response.status;
  });
};
