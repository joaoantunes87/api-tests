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
    return this.axios.get(dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
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
    const url = dhis2.generateUrlForResourceType(dhis2.resourceTypes.CATEGORY_OPTION);

    const createCategoryOption = (categoryOption) => {
      return world.axios({
        method: 'post',
        url: url,
        data: categoryOption,
        auth: world.authRequestObject
      });
    };

    return world.axios.all([createCategoryOption(this.categoryOption1), createCategoryOption(this.categoryOption2)])
      .then(world.axios.spread(function (categoryOption1Response, categoryOption2Response) {
        world.categoryOption1ResponseStatus = categoryOption1Response.status;
        world.categoryOption1ResponseData = categoryOption1Response.data;
        world.categoryOption2ResponseStatus = categoryOption2Response.status;
        world.categoryOption2ResponseData = categoryOption2Response.data;
      }));
  });

  When(/^I should be informed that the category options were created successfully.$/, function () {
    assert.equal(this.categoryOption1ResponseStatus, 201, 'Status should be 201');
    assert.equal(
      this.categoryOption1ResponseData.response.uid,
      categoryOptionId1,
      'First category option id should be the generated one'
    );
    categoryOption1WasCreated = true;

    assert.equal(this.categoryOption2ResponseStatus, 201, 'Status should be 201');
    assert.equal(
      this.categoryOption2ResponseData.response.uid,
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
    const world = this;
    const url = dhis2.generateUrlForResourceType(dhis2.resourceTypes.CATEGORY);

    world.requestData = world.category;
    return dhis2.initializePromiseUrlUsingWorldContext(world, url).then(function (response) {
      world.responseStatus = response.status;
      world.responseData = response.data;
    });
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
    const world = this;
    const url = dhis2.generateUrlForResourceType(dhis2.resourceTypes.CATEGORY_COMBINATION);

    world.requestData = world.categoryCombo;
    return dhis2.initializePromiseUrlUsingWorldContext(world, url).then(function (response) {
      world.responseStatus = response.status;
      world.responseData = response.data;
    });
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
    const world = this;
    world.method = 'delete';

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.CATEGORY_COMBINATION, generatedCategoryComboId)
    ).then(function (response) {
      world.responseStatus = response.status;
      world.responseData = response.data;
    }).catch(function (error) {
      world.responseData = error.response.data;
      world.responseStatus = error.response.status;
    });
  });
});
