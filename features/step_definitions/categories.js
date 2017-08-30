const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  const generatedCategoryOptionIds = dhis2.generateUniqIds(2);
  const categoryOptionId1 = generatedCategoryOptionIds[0];
  const categoryOptionId2 = generatedCategoryOptionIds[1];
  let categoryOption1WasCreated = false;
  let categoryOption2WasCreated = false;

  const generatedCategoryId = dhis2.generateUniqIds();
  let categoryWasCreated = false;

  const generatedCategoryComboId = dhis2.generateUniqIds();
  let categoryComboWasCreated = false;

  Given(/^that I have the necessary permissions to add a category$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]',
      onSuccess: function (response) {
        assert.isOk(
          dhis2.isAuthorisedToAddCategoryComboWith(response.data.userCredentials.userRoles),
          'Not Authorized to create Category Combo'
        );

        assert.isOk(
          dhis2.isAuthorisedToAddCategoryOptionWith(response.data.userCredentials.userRoles),
          'Not Authorized to create Category Option'
        );

        assert.isOk(
          dhis2.isAuthorisedToAddCategoryWith(response.data.userCredentials.userRoles),
          'Not Authorized to create Category'
        );
      }
    });
  });

  When(/^I fill in the required fields for a category option like:$/, function (data) {
    this.categoryOption1 = {
      id: categoryOptionId1,
      name: data.rawTable[1][0],
      shortName: data.rawTable[1][1]
    };

    this.categoryOption2 = {
      id: categoryOptionId2,
      name: data.rawTable[2][0],
      shortName: data.rawTable[2][1]
    };
  });

  When(/^I submit that category options to the server$/, function () {
    const world = this;
    world.categoryOption1Response = {};
    world.categoryOption2Response = {};
    const createCategoryOption = (categoryOption, categoryOptionResponse) => {
      return dhis2.sendApiRequest({
        url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.CATEGORY_OPTION),
        requestData: categoryOption,
        method: 'post',
        onSuccess: function (response) {
          categoryOptionResponse.status = response.status;
          categoryOptionResponse.data = response.data;
        }
      });
    };

    return dhis2.sendMultipleApiRequests({
      requests: [
        createCategoryOption(world.categoryOption1, world.categoryOption1Response),
        createCategoryOption(world.categoryOption2, world.categoryOption2Response)
      ]
    });
  });

  When(/^I should be informed that the category options were created successfully.$/, function () {
    assert.equal(this.categoryOption1Response.status, 201, 'Status should be 201');
    assert.equal(
      this.categoryOption1Response.data.response.uid,
      categoryOptionId1,
      'First category option id should be the generated one'
    );
    categoryOption1WasCreated = true;

    assert.equal(this.categoryOption2Response.status, 201, 'Status should be 201');
    assert.equal(
      this.categoryOption2Response.data.response.uid,
      categoryOptionId2,
      'Second category option id should be the generated one'
    );
    categoryOption2WasCreated = true;
  });

  Given(/^I have already successfully created some category options$/, function () {
    assert.isOk(categoryOption1WasCreated, 'First category option was not created');
    assert.isOk(categoryOption2WasCreated, 'Second category option was not created');
  });

  When(/^I fill in the required fields for a category:$/, function (data) {
    this.method = 'post';
    this.category = {
      id: generatedCategoryId,
      name: data.rawTable[1][0],
      dataDimensionType: data.rawTable[1][1]
    };
  });

  When(/^I add my category options to the category$/, function () {
    this.category.categoryOptions = [{id: categoryOptionId1}, {id: categoryOptionId2}];
  });

  When(/^I submit that category to the server$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.CATEGORY),
      requestData: this.category,
      method: this.method,
      preventDefaultOnError: true
    }, this);
  });

  Then(/^I should be informed that the category was created successfully.$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.equal(this.responseData.response.uid, generatedCategoryId, 'Category id should be the generated one');
    categoryWasCreated = true;
  });

  Given(/^I have already successfully created some categories$/, function () {
    assert.isOk(categoryWasCreated, 'Category was created');
  });

  When(/^I fill in the required fields for a category combination:$/, function (data) {
    this.method = 'post';
    this.categoryCombo = {
      id: generatedCategoryComboId,
      name: data.rawTable[1][0],
      dataDimensionType: data.rawTable[1][1]
    };
  });

  When(/^I add my categories to the category combination$/, function () {
    this.categoryCombo.categories = [{id: generatedCategoryId}];
  });

  When(/^I submit that category combination to the server$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.CATEGORY_COMBINATION),
      requestData: this.categoryCombo,
      method: this.method,
      preventDefaultOnError: true
    }, this);
  });

  Then(/^I should be informed that the category combination was created successfully$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.equal(
      this.responseData.response.uid,
      generatedCategoryComboId,
      'Category Combo id should be the generated one'
    );
    categoryComboWasCreated = true;
  });

  Given(/^I have created a category combination with associated objects$/, function () {
    assert.isOk(categoryComboWasCreated, 'Category was created');
  });

  When(/^I try to delete the category combination$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.CATEGORY_COMBINATION, generatedCategoryComboId),
      method: 'delete'
    }, this);
  });
});
