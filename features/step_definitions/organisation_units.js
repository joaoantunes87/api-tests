const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  const generatedOrganisationUnitId = dhis2.generateUniqIds();
  let organisationUnitWasCreated = false;

  Given(/^that I have the necessary permissions to add an organisation unit$/, function () {
    return this.axios.get(dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(
        dhis2.isAuthorisedToAddOrganisationUnitWith(response.data.userCredentials.userRoles),
        'Not Authorized to create OrganisationUnit'
      );
    });
  });

  Given(/^that I want to create a new organisation unit$/, function () {
    this.method = 'post';
    this.requestData.id = generatedOrganisationUnitId;
  });

  When(/^I fill in the fields for the organisation unit with data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    this.updatedDataToAssert = {};
    properties.forEach(function (propertyKey, index) {
      this.updatedDataToAssert[propertyKey] = values[index];
      this.requestData[propertyKey] = values[index];
    }, this);
  });

  When(/^I submit the organisation unit$/, function () {
    return submitServerRequest(this);
  });

  Then(/^I should be informed that the organisation unit was created$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Organisation Unit Id was not returned');

    organisationUnitWasCreated = true;
    this.resourceId = this.responseData.response.uid;
  });

  Then(/^The current organisation unit data is the same as submitted.$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, world.resourceId)
    ).then(function (response) {
      Object.keys(world.updatedDataToAssert).forEach(function (propertyKey) {
        switch (propertyKey) {
          case 'parent':
            assert.deepEqual(
              response.data[propertyKey],
              world.updatedDataToAssert[propertyKey],
              propertyKey + ' is wrong');
            break;
          case 'dataSets':
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

  Given(/^I got the existing organisation unit to update$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(generatedOrganisationUnitId, 'Organisation Unit Id does not exist');

    world.resourceId = generatedOrganisationUnitId;
    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, world.resourceId)
    ).then(function (response) {
      assert.equal(response.status, 200, 'Status should be 200');
      world.requestData = response.data;
      world.method = 'put';
    });
  });

  When(/^an existing parent organisation unit exists$/, function () {
    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(generatedOrganisationUnitId, 'Organisation Unit Id does not exist');
  });

  Then(/^I should be able to assign the existing organisation unit as a parent$/, function () {
    this.requestData.id = null;
    const parent = {
      id: generatedOrganisationUnitId
    };
    this.requestData.parent = parent;
    this.updatedDataToAssert.parent = parent;
  });

  When(/^I update an existing organisation unit$/, function () {
    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(generatedOrganisationUnitId, 'Organisation Unit Id does not exist');
    this.resourceId = generatedOrganisationUnitId;
  });

  When(/^I provide a valid value: (.+), for a valid property: (.+)$/, function (value, property) {
    this.requestData[property] = value;
    this.updatedDataToAssert[property] = value;
    this.method = 'patch';
  });

  When(/^I provide an invalid value: (.+), for a valid property: (.+)$/, function (value, property) {
    this.requestData[property] = value;
    this.method = 'patch';
  });

  When(/^I provide an invalid value: (.+), for an invalid property: (.+)$/, function (value, property) {
    this.requestData[property] = value;
    this.method = 'patch';
  });

  When(/^I provide a previous closed date as (.+)$/, function (previousDate) {
    this.requestData.closedDate = previousDate;
    this.updatedDataToAssert.closedDate = previousDate;
    this.method = 'patch';
  });

  When(/^I provide a later closed date as (.+)$/, function (laterDate) {
    this.requestData.closedDate = laterDate;
    this.method = 'patch';
  });

  When(/^I translate the name of the organisation unit for (.+) as (.+)$/, function (locale, translationValue) {
    const world = this;

    world.method = 'get';
    world.requestData = {};
    world.locale = locale;
    world.translationValue = translationValue;

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, generatedOrganisationUnitId)
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
        dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, generatedOrganisationUnitId)
      );
    }).then(function (response) {
      assert.equal(response.status, 200, 'Organisation Unit was not updated');
    });
  });

  Then(/^I should be able to view the translated name.$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, generatedOrganisationUnitId)
    ).then(function (response) {
      assert.equal(response.data.displayName, world.translationValue, 'Name is not translated');
    });
  });

  When(/^there is a dataset in the system$/, function () {
    const world = this;
    world.method = 'get';

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATASET, null)
    ).then(function (response) {
      assert.isAtLeast(response.data.dataSets.length, 1, 'It shoud have at least one dataset');
      world.responseData = response.data;
    });
  });

  When(/^I update the datasets of the organisation unit$/, function () {
    const dataSets = [{
      id: this.responseData.dataSets[0].id
    }];
    this.requestData.dataSets = dataSets;
    this.updatedDataToAssert.dataSets = dataSets;
    this.method = 'put';
  });
});

const submitServerRequest = (world) => {
  const url = dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, world.resourceId);

  return dhis2.initializePromiseUrlUsingWorldContext(world, url).then(function (response) {
    world.responseStatus = response.status;
    world.responseData = response.data;
  }).catch(function (error) {
    console.error(JSON.stringify(error.response.data, null, 2));
    world.responseData = error.response.data;
    world.responseStatus = error.response.status;
  });
};
