const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const assert = chai.assert;

defineSupportCode(function ({Given, When, Then, Before}) {
  const generatedOrganisationUnitId = generateIds();
  let organisationUnitWasCreated = false;

  // Clean up before each test run
  Before(function () {
    // auxiliar var for assertions
    this.organisationUnitData = {};               // body request
    this.organisationUnitId = null;               // id of organisation unit for test
    this.updatedDataToAssert = {};                // information to be asserted in later steps
    this.organisationUnitResponseStatus = null;   // http status returned on previous request
    this.organisationUnitResponseData = {};       // http response body returned on previous request
    this.organisationUnitErrorResponse = null;    // axios error returned on previous promise
    this.method = null;                           // http method to be used in later request
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
    this.method = 'post';

    properties.forEach(function (propertyKey, index) {
      this.updatedDataToAssert[propertyKey] = values[index];
      this.organisationUnitData[propertyKey] = values[index];
    }, this);

    this.organisationUnitData.id = generatedOrganisationUnitId;
  });

  When(/^I submit the organisation unit$/, function () {
    const world = this;

    return initializeOrganisationUnitPromise(world, world.organisationUnitData, world.method, world.organisationUnitId).then(function (response) {
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

    return initializeOrganisationUnitPromise(world, null, 'get', world.organisationUnitId).then(function (response) {
      Object.keys(world.updatedDataToAssert).forEach(function (propertyKey) {
        assert.equal(response.data[propertyKey], world.updatedDataToAssert[propertyKey], propertyKey + ' is wrong');
      });
    });
  });

  Given(/^I got the existing organisation unit to update$/, function () {
    const world = this;
    world.method = 'put';

    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(generatedOrganisationUnitId, 'Organisation Unit Id does not exist');

    world.organisationUnitId = generatedOrganisationUnitId;
    return initializeOrganisationUnitPromise(world, null, 'get', world.organisationUnitId).then(function (response) {
      assert.equal(response.status, 200, 'Status should be 200');
      world.organisationUnitData = response.data;
    });
  });

  When(/^I fill in some fields to change with data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    this.updatedDataToAssert = {};
    properties.forEach(function (propertyKey, index) {
      this.updatedDataToAssert[propertyKey] = values[index];
      this.organisationUnitData[propertyKey] = values[index];
    }, this);
  });

  Then(/^I should be informed that the organisation unit was updated$/, function () {
    const world = this;

    assert.equal(world.organisationUnitResponseStatus, 200, 'Organisation Unit was updated');
  });

  When(/^an existing parent organisation unit exists$/, function () {
    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(generatedOrganisationUnitId, 'Organisation Unit Id does not exist');
  });

  Then(/^I should be able to assign the existing organisation unit as a parent$/, function () {
    this.organisationUnitData.id = null;
    this.organisationUnitData.parent = {
      id: generatedOrganisationUnitId
    };
  });

  When(/^I update an existing organisation unit$/, function () {
    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    assert.isOk(generatedOrganisationUnitId, 'Organisation Unit Id does not exist');
    this.organisationUnitId = generatedOrganisationUnitId;
  });

  When(/^I provide a valid value: (.+), for a valid property: (.+)$/, function (value, property) {
    this.organisationUnitData[property] = value;
    this.updatedDataToAssert[property] = value;
    this.method = 'patch';
  });

  When(/^I provide an invalid value: (.+), for a valid property: (.+)$/, function (value, property) {
    this.organisationUnitData[property] = value;
    this.method = 'patch';
  });

  Then(/^I should receive an error message equal to: (.+).$/, function (errorMessage) {
    assert.equal(this.organisationUnitErrorResponse.response.status, 400, 'It should have returned error status of 400');
    assert.equal(this.organisationUnitErrorResponse.response.data.status, 'ERROR', 'It should have returned error status');
    assert.equal(this.organisationUnitErrorResponse.response.data.message, errorMessage, 'Error message should be ' + errorMessage);
  });

  When(/^I provide an invalid value: (.+), for an invalid property: (.+)$/, function (value, property) {
    this.organisationUnitData[property] = value;
    this.method = 'patch';
  });

  When(/^I provide a previous closed date as (.+)$/, function (previousDate) {
    this.organisationUnitData.closedDate = previousDate;
    this.updatedDataToAssert.closedDate = previousDate;
    this.method = 'patch';
  });

  When(/^I provide a later closed date as (.+)$/, function (laterDate) {
    this.organisationUnitData.closedDate = laterDate;
    this.method = 'patch';
  });

  When(/^I translate the name of an organisation unit for (.+) as (.+)$/, function (locale, translationValue) {
    const world = this;

    world.locale = locale;
    world.translationValue = translationValue;

    return initializeOrganisationUnitPromise(world, null, 'get', generatedOrganisationUnitId).then(function (response) {
      world.organisationUnitData = response.data;
      world.organisationUnitData.translations = [
        {
          property: 'NAME',
          locale: locale,
          value: translationValue
        }
      ];

      return initializeOrganisationUnitPromise(world, world.organisationUnitData, 'put', generatedOrganisationUnitId);
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

    return initializeOrganisationUnitPromise(world, null, 'get', generatedOrganisationUnitId).then(function (response) {
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

const initializeOrganisationUnitPromise = (world, organisationUnitData, method, organisationUnitId) => {
  let url = world.apiEndpoint + '/organisationUnits/';
  if (organisationUnitId) {
    url = url.concat(organisationUnitId);
  }

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
