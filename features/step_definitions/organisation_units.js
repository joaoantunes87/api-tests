const { defineSupportCode } = require('cucumber');
const dhis2 = require('../support/utils.js');
const chai = require('chai');
const assert = chai.assert;

defineSupportCode(function ({Given, When, Then, Before}) {
  const generatedOrganisationUnitId = dhis2.generateUniqIds();
  let organisationUnitWasCreated = false;

  Given(/^that I have the necessary permissions to add an organisation unit$/, function () {
    return this.axios.get(dhis2.getApiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(isAuthorisedToAddOrganisationUnitWith(response.data.userCredentials.userRoles), 'Not Authorized to create OrganisationUnit');
    });
  });

  When(/^I fill in all of the required fields with data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];
    this.method = 'post';

    properties.forEach(function (propertyKey, index) {
      this.updatedDataToAssert[propertyKey] = values[index];
      this.requestData[propertyKey] = values[index];
    }, this);

    this.requestData.id = generatedOrganisationUnitId;
  });

  Then(/^I should be informed that the organisation unit was created$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Organisation Unit Id was not returned');

    organisationUnitWasCreated = true;
    this.resourceId = this.responseData.response.uid;
  });

  Then(/^The returned data is the same as submitted.$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(world, dhis2.generateUrlForOrganisationUnitWithId(world.resourceId)).then(function (response) {
      Object.keys(world.updatedDataToAssert).forEach(function (propertyKey) {
        assert.equal(response.data[propertyKey], world.updatedDataToAssert[propertyKey], propertyKey + ' is wrong');
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
    return dhis2.initializePromiseUrlUsingWorldContext(world, dhis2.generateUrlForOrganisationUnitWithId(world.resourceId)).then(function (response) {
      assert.equal(response.status, 200, 'Status should be 200');
      world.requestData = response.data;
      world.method = 'put';
    });
  });

  When(/^I fill in some fields to change with data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    this.updatedDataToAssert = {};
    properties.forEach(function (propertyKey, index) {
      this.updatedDataToAssert[propertyKey] = values[index];
      this.requestData[propertyKey] = values[index];
    }, this);
  });

  Then(/^I should be informed that the organisation unit was updated$/, function () {
    const world = this;

    assert.equal(world.responseStatus, 200, 'Organisation Unit was updated');
  });

  When(/^an existing parent organisation unit exists$/, function () {
    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(generatedOrganisationUnitId, 'Organisation Unit Id does not exist');
  });

  Then(/^I should be able to assign the existing organisation unit as a parent$/, function () {
    this.requestData.id = null;
    this.requestData.parent = {
      id: generatedOrganisationUnitId
    };
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

  When(/^I translate the name of an organisation unit for (.+) as (.+)$/, function (locale, translationValue) {
    const world = this;

    world.method = 'get';
    world.requestData = {};
    world.locale = locale;
    world.translationValue = translationValue;

    return dhis2.initializePromiseUrlUsingWorldContext(world, dhis2.generateUrlForOrganisationUnitWithId(generatedOrganisationUnitId)).then(function (response) {
      world.requestData = response.data;
      world.requestData.translations = [
        {
          property: 'NAME',
          locale: locale,
          value: translationValue
        }
      ];

      world.method = 'put';
      return dhis2.initializePromiseUrlUsingWorldContext(world, dhis2.generateUrlForOrganisationUnitWithId(generatedOrganisationUnitId));
    }).then(function (response) {
      assert.equal(response.status, 200, 'Organisation Unit was not updated');
    });
  });

  When(/^I select the same locale as I translated the organisation unit$/, function () {
    return this.axios({
      method: 'post',
      url: dhis2.getApiEndpoint() + '/userSettings/keyDbLocale?value=' + this.locale,
      auth: this.authRequestObject
    }).then(function (response) {
      assert.equal(response.status, 200, 'Locale setting was not updated');
    });
  });

  Then(/^I should be able to view the translated name.$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(world, dhis2.generateUrlForOrganisationUnitWithId(generatedOrganisationUnitId)).then(function (response) {
      assert.equal(response.data.displayName, world.translationValue, 'Name is not translated');
    });
  });
});

const isAuthorisedToAddOrganisationUnitWith = (userRoles = []) => {
  return dhis2.authorityExistsInUserRoles('F_ORGANISATIONUNIT_ADD', userRoles);
};
