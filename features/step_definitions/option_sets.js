const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then, Before}) {
  const generatedOptionSetId = dhis2.generateUniqIds();
  let optionSetWasCreated = false;

  Given(/^that I have the necessary permissions to add an option set$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]',
      onSuccess: function (response) {
        assert.isOk(
          dhis2.isAuthorisedToAddOptionSetWith(response.data.userCredentials.userRoles),
          'Not Authorized to create OrganisationUnit'
        );
      }
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

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.OPTION_SET, world.resourceId),
      onSuccess: function (response) {
        Object.keys(world.updatedDataToAssert).forEach(function (propertyKey) {
          if (propertyKey === 'options') {
            const optionSetsSentToAddCount = world.updatedDataToAssert.options.lenght;
            const optionSetsReturnedCount = response.data.options.lenght;
            assert.equal(optionSetsSentToAddCount, optionSetsReturnedCount, 'Option Sets added does not match');
          } else {
            assert.equal(response.data[propertyKey], world.updatedDataToAssert[propertyKey], propertyKey + ' is wrong');
          }
        });
      }
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

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.OPTION_SET, world.resourceId),
      onSuccess: function (response) {
        world.requestData = response.data;
        const optionCreationRequests = options.map((option) => {
          return dhis2.sendApiRequest({
            url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.OPTION),
            requestData: option,
            method: 'post',
            onSuccess: function (response) {
              dhis2.debug('OPTION CREATED: ' + response.data.response.uid);
              world.requestData.options.push({id: response.data.response.uid});
              world.updatedDataToAssert.options.push({id: response.data.response.uid});
              dhis2.debug('OPTION SET REQUEST DATA: ' + JSON.stringify(world.requestData.options, null, 2));
            }
          });
        });

        world.method = 'put';
        world.resourceId = generatedOptionSetId;

        return dhis2.sendMultipleApiRequests({
          requests: optionCreationRequests
        });
      }
    });
  });

  Given(/^that I have the necessary permissions to delete an option$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]',
      onSuccess: function (response) {
        assert.isOk(
          dhis2.isAuthorisedToDeleteOptionWith(response.data.userCredentials.userRoles),
          'Not Authorized to delete Option'
        );
      }
    });
  });

  Then(/^it has at least one option$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.OPTION_SET, this.resourceId),
      onSuccess: function (response) {
        assert.isAtLeast(response.data.options.length, 1, 'It shoud have at least one options');
      }
    }, this);
  });

  Then(/^I delete the option from the option set$/, function () {
    const world = this;
    world.resourceIdToDelete = world.responseData.options[0].id;

    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/optionSets/' + world.resourceId + '/options/' + world.resourceIdToDelete,
      method: 'delete'
    }, world);
  });

  Then(/^I should be informed that the option set was deleted$/, function () {
    assert.equal(this.responseStatus, 204, 'Status should be 204');
  });

  Then(/^It was really deleted.$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/optionSets/' + this.resourceId + '/options/' + this.resourceIdToDelete,
      onError: function (error) {
        assert.equal(error.response.status, 404, 'Status should be 404');
      }
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
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]',
      onSuccess: function (response) {
        assert.isOk(
          dhis2.isAuthorisedToDeleteOptionSetWith(response.data.userCredentials.userRoles),
          'Not Authorized to delete Option'
        );
      }
    });
  });

  Then(/^I delete the option set$/, function () {
    const world = this;
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.OPTION_SET, generatedOptionSetId),
      method: 'delete'
    }, world);
  });
});

const submitServerRequest = (world) => {
  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.OPTION_SET, world.resourceId),
    requestData: world.requestData,
    method: world.method
  }, world);
};
