const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then, Before, After}) {
  Before({tags: '@createOrganisationUnit'}, function () {
    this.organisationUnitId = dhis2.generateUniqIds();
    this.requestData = {
      id: this.organisationUnitId,
      name: 'Organisation Unit for Tests' + this.organisationUnitId,  // make it unique
      shortName: 'ORGT' + this.organisationUnitId,                    // make it unique
      openingDate: '2017-09-11T00:00:00.000'
    };

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.ORGANISATION_UNIT),
      requestData: this.requestData,
      method: 'post',
      onSuccess: function (response) {
        assert.equal(response.data.httpStatusCode, 201, 'Message http status code should be 201');
        assert.equal(response.status, 201, 'Status should be 201');
        assert.equal(response.data.status, 'OK', 'Message status property should be OK');
        assert.equal(response.data.httpStatus, 'Created', 'Message http status property should be Created');
        assert.isOk(response.data.response.uid, 'Organisation Unit Id was not returned');
      }
    }, this);
  });

  const generatedOrganisationUnitId = dhis2.generateUniqIds();
  let organisationUnitWasCreated = false;

  Given(/^that I have the necessary permissions to add an organisation unit$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]',
      onSuccess: function (response) {
        assert.isOk(
          dhis2.isAuthorisedToAddOrganisationUnitWith(response.data.userCredentials.userRoles),
          'Not Authorized to create OrganisationUnit'
        );
      }
    }, this);
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

  When(/^I should be informed I have no permission to do that operation.$/, function () {
    assert.equal(this.responseStatus, 403, 'Status should be 403');
  });

  Then(/^I should be informed that the organisation unit was created$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Organisation Unit Id was not returned');

    organisationUnitWasCreated = true;
    this.resourceId = this.responseData.response.uid;
  });

  Then(/^The current organisation unit data is the same as submitted.$/, function () {
    const world = this;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, world.resourceId),
      onSuccess: function (response) {
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
              assert.equal(
                response.data[propertyKey],
                world.updatedDataToAssert[propertyKey], propertyKey + ' is wrong'
              );
          }
        });
      }
    }, world);
  });

  Given(/^I got the existing organisation unit to update$/, function () {
    const world = this;

    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(generatedOrganisationUnitId, 'Organisation Unit Id does not exist');

    world.resourceId = generatedOrganisationUnitId;
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, world.resourceId),
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Status should be 200');
        world.requestData = response.data;
        world.method = 'put';
      }
    }, world);
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
    world.locale = locale;
    world.translationValue = translationValue;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, generatedOrganisationUnitId),
      onSuccess: function (response) {
        const requestData = response.data;
        requestData.translations = [
          {
            property: 'NAME',
            locale: locale,
            value: translationValue
          }
        ];

        return dhis2.sendApiRequest({
          url: dhis2.generateUrlForResourceTypeWithId(
            dhis2.resourceTypes.ORGANISATION_UNIT,
            generatedOrganisationUnitId),
          method: 'put',
          requestData: requestData,
          onSuccess: function (response) {
            assert.equal(response.status, 200, 'Organisation Unit was not updated');
          }
        });
      }
    }, world);
  });

  Then(/^I should be able to view the translated name.$/, function () {
    const world = this;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, generatedOrganisationUnitId),
      onSuccess: function (response) {
        assert.equal(response.data.displayName, world.translationValue, 'Name is not translated');
      }
    }, world);
  });

  When(/^there is a dataset in the system$/, function () {
    const world = this;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATASET),
      onSuccess: function (response) {
        assert.isAtLeast(response.data.dataSets.length, 1, 'It shoud have at least one dataset');
      }
    }, world);
  });

  When(/^I update the datasets of the organisation unit$/, function () {
    const dataSets = [{
      id: this.responseData.dataSets[0].id
    }];
    this.requestData.dataSets = dataSets;
    this.updatedDataToAssert.dataSets = dataSets;
    this.method = 'put';
  });

  When(/^I change the parent organisation unit to itself$/, function () {
    const world = this;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, world.organisationUnitId),
      onSuccess: function (response) {
        world.requestData = response.data;
        world.requestData.parent = {
          id: world.organisationUnitId
        };
        world.resourceId = world.organisationUnitId;
        world.method = 'put';
      }
    }, world);
  });

  When(/^I create an organisation unit with parent as scenario organisation unit and with data:$/, function (data) {
    const world = this;
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    properties.forEach(function (propertyKey, index) {
      this.requestData[propertyKey] = values[index];
    }, this);

    this.requestData.parent = {
      id: this.organisationUnitId
    };

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.ORGANISATION_UNIT),
      requestData: world.requestData,
      method: 'post',
      onSuccess: function (response) {
        assert.equal(response.data.httpStatusCode, 201, 'Message http status code should be 201');
        assert.equal(response.status, 201, 'Status should be 201');
        assert.equal(response.data.status, 'OK', 'Message status property should be OK');
        assert.equal(response.data.httpStatus, 'Created', 'Message http status property should be Created');
        assert.isOk(response.data.response.uid, 'Organisation Unit Id was not returned');
        world.createdOrganisationUnitId = response.data.response.uid;
      }
    }, world);
  });

  When(/^I change the parent of scenario organisation unit to the created one$/, function () {
    const world = this;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, world.organisationUnitId),
      onSuccess: function (response) {
        world.requestData = response.data;
        world.requestData.parent = {
          id: world.createdOrganisationUnitId
        };
        world.resourceId = world.organisationUnitId;
        world.method = 'put';
      }
    }, world);
  });
});

const submitServerRequest = (world) => {
  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, world.resourceId),
    requestData: world.requestData,
    method: world.method,
    preventDefaultOnError: true
  }, world);
};
