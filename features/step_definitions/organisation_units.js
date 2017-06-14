const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  const organisationUnitId = generateIds();
  let organisationUnitWasCreated = false;

  Given(/^that I am logged in$/, function () {
    this.organisationUnitData = {};
    this.updatedData = {};

    return this.axios.get(this.apiEndpoint + '/me', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.equal(response.status, 200, 'Response Status is ok');
      assert.property(response, 'data', 'User id was returned');
    });
  });

  Given(/^that I have the necessary permissions to add an organisation unit$/, function () {
    return this.axios.get(this.apiEndpoint + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(isAuthorisedToAddOrganisationUnitWith(response.data.userCredentials.userRoles), 'Not Authorized to create OrganisationUnit');
    });
  });

  When(/^I fill in all of the required fields with data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    properties.forEach(function (propertyKey, index) {
      this.updatedData[propertyKey] = values[index];
      this.organisationUnitData[propertyKey] = values[index];
    }, this);

    this.organisationUnitData.id = organisationUnitId;
    this.method = 'post';
  });

  When(/^I submit the organisation unit$/, function () {
    const world = this;

    return initializeOrganisationUnitPromiseWithData(world, world.organisationUnitData, world.method, world.organisationUnitId).then(function (response) {
      world.organisationUnitResponseStatus = response.status;
      world.organisationUnitResponseData = response.data;
    }).catch(function (error) {
      world.organisationUnitErrorResponse = error;
    });
  });

  Then(/^I should be informed that the organisation unit was created$/, function () {
    assert.equal(this.organisationUnitResponseStatus, 201, 'Status should be 201');
    assert.isOk(this.organisationUnitResponseData.response.uid, 'Organisation Unit Id was not returned');

    organisationUnitWasCreated = true;
    this.organisationUnitId = this.organisationUnitResponseData.response.uid;
  });

  Then(/^The returned data is the same as submitted.$/, function () {
    const world = this;

    return initializeOrganisationUnitGetPromise(world, world.organisationUnitId).then(function (response) {
      Object.keys(world.updatedData).forEach(function (propertyKey) {
        assert.equal(response.data[propertyKey], world.updatedData[propertyKey], propertyKey + ' is wrong');
      });
    });
  });

  Given(/^I got the existing organisation unit to update$/, function () {
    const world = this;
    world.method = 'put';

    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(organisationUnitId, 'Organisation Unit Id does not exist');

    world.organisationUnitId = organisationUnitId;
    return initializeOrganisationUnitGetPromise(world, organisationUnitId).then(function (response) {
      assert.equal(response.status, 200, 'Status should be 200');
      world.organisationUnitData = response.data;
    });
  });

  When(/^I fill in some fileds to change with data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    this.updatedData = {};
    properties.forEach(function (propertyKey, index) {
      this.updatedData[propertyKey] = values[index];
      this.organisationUnitData[propertyKey] = values[index];
    }, this);
  });

  When(/^an existing parent organisation unit exists$/, function () {
    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(organisationUnitId, 'Organisation Unit Id does not exist');
  });

  Then(/^I should be able to assign the existing organisation unit as a parent$/, function () {
    this.organisationUnitData.id = null;
    this.organisationUnitData.parent = {
      id: organisationUnitId
    };
  });

  When(/^I update an existing organisation unit$/, function () {
    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(organisationUnitId, 'Organisation Unit Id does not exist');
    this.organisationUnitId = organisationUnitId;
  });

  When(/^I provide a valid (.+) for a valid (.+)$/, function (value, property) {
    this.organisationUnitData[property] = value;
    this.updatedData[property] = value;
    this.method = 'patch';
  });

  Then(/^I should be informed that the organisation unit was updated$/, function () {
    const world = this;

    assert.equal(world.organisationUnitResponseStatus, 200, 'Organisation Unit was updated');
  });

  When(/^I provide an invalid (.+) of a valid (.+)$/, function (value, property) {
    this.organisationUnitData[property] = value;
    this.method = 'patch';
  });

  Then(/^I should receive an error message.$/, function () {
    assert.isOk(this.organisationUnitErrorResponse, 'It should have returned an error');
    assert.equal(this.organisationUnitErrorResponse.response.status, 500, 'It should have returned error status of 500');
    assert.equal(this.organisationUnitErrorResponse.response.data.status, 'ERROR', 'It should have returned error status');
    assert.property(this.organisationUnitErrorResponse.response.data, 'message', 'It should have returned error message');
  });

  When(/^I provide an invalid (.+) of an invalid (.+)$/, function (value, property) {
    this.organisationUnitData[property] = value;
    this.method = 'patch';
  });

  Then(/^I should be informed that the organisation unit was not updated.$/, function () {
    assert.equal(this.organisationUnitResponseStatus, 204, 'Organisation Unit was not updated');
  });

  When(/^I provide a closed date as (.+)$/, function (closedDate) {
    this.organisationUnitData.closedDate = closedDate;
    this.method = 'patch';
  });

  When(/^I translate the name of an organisation unit for (.+) as (.+)$/, function (locale, translationValue) {
    const world = this;

    world.locale = locale;
    world.translationValue = translationValue;

    return initializeOrganisationUnitGetPromise(world, organisationUnitId).then(function (response) {
      world.organisationUnitData = response.data;
      world.organisationUnitData.translations = [
        {
          property: 'NAME',
          locale: locale,
          value: translationValue
        }
      ];

      return initializeOrganisationUnitPromiseWithData(world, world.organisationUnitData, 'put', organisationUnitId);
    }).then(function (response) {
      assert.equal(response.status, 200, 'Organisation Unit was not updated');
    });
  });

  When(/^I select the same locale as I translated the organisation unit$/, function () {
    return this.axios({
      method: 'post',
      url: this.apiEndpoint + '/userSettings/keyDbLocale?value=' + this.locale,
      auth: this.authRequestObject
    }).then(function (response) {
      assert.equal(response.status, 200, 'Locale setting was not updated');
    });
  });

  Then(/^I should be able to view the translated name.$/, function () {
    const world = this;

    return initializeOrganisationUnitGetPromise(world, organisationUnitId).then(function (response) {
      assert.equal(response.data.displayName, world.translationValue, 'Name is not translated');
    });
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

const initializeOrganisationUnitGetPromise = (world, organisationUnitId) => {
  return world.axios({
    method: 'get',
    url: world.apiEndpoint + '/organisationUnits/' + organisationUnitId,
    auth: world.authRequestObject
  });
};

const initializeOrganisationUnitPromiseWithData = (world, organisationUnitData, method, organisationUnitId = '') => {
  const url = world.apiEndpoint + '/organisationUnits/' + organisationUnitId;

  return world.axios({
    method: method,
    url: url,
    data: organisationUnitData,
    auth: world.authRequestObject
  });
};

const isAuthorisedToAddOrganisationUnitWith = (userRoles = []) => {
  for (const index in userRoles) {
    const authorities = userRoles[index].authorities || [];
    if (authorities.includes('F_ORGANISATIONUNIT_ADD')) {
      return true;
    }
  }
  return false;
};
