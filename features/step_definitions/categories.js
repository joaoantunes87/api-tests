const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  const generatedCategoryOptionsId = dhis2.generateUniqIds(2);
  const categoryOptionId1 = generatedCategoryOptionsId[1];
  const categoryOptionId2 = generatedCategoryOptionsId[2];
  let categoryOption1WasCreated = false;
  let categoryOption2WasCreated = false;

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

  When(/^I submit category options to the server$/, function () {
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
    assert.isOk(this.categoryOption1ResponseData.response.uid, 'First category option id was not returned');
    categoryOption1WasCreated = true;

    assert.equal(this.categoryOption2ResponseStatus, 201, 'Status should be 201');
    assert.isOk(this.categoryOption2ResponseData.response.uid, 'Second category option id was not returned');
    categoryOption2WasCreated = true;
  });

  When(/^I have already successfully created some category options$/, function () {
    assert.isOk(categoryOption1WasCreated, 'First category option was not created');
    assert.isOk(categoryOption2WasCreated, 'Second category option was not created');
  });
});
