const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  const generatedDataElementId = dhis2.generateUniqIds();
  let dataElementWasCreated = false;

  Given(/^that I have the necessary permissions to add a data element$/, function () {
    return this.axios.get(dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(
        dhis2.isAuthorisedToAddDataElementWith(response.data.userCredentials.userRoles),
        'Not Authorized to create Data Element'
      );
    });
  });

  Given(/^that I want to create a new data element$/, function () {
    this.method = 'post';
    this.requestData.id = generatedDataElementId;
  });

  Then(/^I should be informed that the data element was created$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Data Element Id was not returned');

    dataElementWasCreated = true;
    this.resourceId = this.responseData.response.uid;
  });

  Then(/^The current data element data is the same as submitted.$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, world.resourceId)
    ).then(function (response) {
      Object.keys(world.updatedDataToAssert).forEach(function (propertyKey) {
        assert.equal(response.data[propertyKey], world.updatedDataToAssert[propertyKey], propertyKey + ' is wrong');
      });
    });
  });

  Given(/^I got the existing data element to update$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    assert.equal(dataElementWasCreated, true, 'Data Element does not exist');
    assert.isOk(generatedDataElementId, 'Data Element Id does not exist');

    world.resourceId = generatedDataElementId;
    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, world.resourceId)
    ).then(function (response) {
      assert.equal(response.status, 200, 'Status should be 200');
      world.requestData = response.data;
      world.method = 'put';
    });
  });

  When(/^I translate the name of the data element for (.+) as (.+)$/, function (locale, translationValue) {
    const world = this;

    world.method = 'get';
    world.requestData = {};
    world.locale = locale;
    world.translationValue = translationValue;

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, generatedDataElementId)
    ).then(function (response) {
      world.requestData = response.data;
      world.requestData.translations = [
        {
          property: 'NAME',
          locale: locale,
          value: translationValue
        }
      ];

      world.method = 'put';
      return dhis2.initializePromiseUrlUsingWorldContext(
        world,
        dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, generatedDataElementId)
      );
    }).then(function (response) {
      assert.equal(response.status, 200, 'Organisation Unit was not updated');
    });
  });

  Then(/^I should see the translated name of the data element.$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, generatedDataElementId)
    ).then(function (response) {
      assert.equal(response.data.displayName, world.translationValue, 'Name is not translated');
    });
  });
});
