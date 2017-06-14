const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const moment = require('moment');
const assert = chai.assert;

defineSupportCode(function ({Before, Given, When, Then}) {
  const organisationUnitId = generateIds();
  let organisationUnitWasCreated = false;

  Given(/^that I am logged in$/, function () {
    /* Test done at authentication.feature. Basic Auth in all requests */
    this.organisationUnitData = {};
    this.organisationUnitUpdateRequest = {};
  });

  Given(/^that I have the necessary permissions to add an organisation unit$/, function () {

  });

  When(/^I fill in all of the required fields with data:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];
    properties.forEach(function (propertyKey, index) {
      this.organisationUnitData[propertyKey] = values[index];
    }, this);
  });

  When(/^I submit the organisation unit$/, function () {
    const world = this;

    // OrganisationUnit to be used for other tests not created yet. For that we want a specific id
    if (organisationUnitWasCreated === false) {
      world.organisationUnitData.id = organisationUnitId;
    }

    return initializeOrganisationUnitPostPromise(world, world.organisationUnitData).then(function (response) {
      world.organisationUnitPostResponseStatus = response.status;
      world.organisationUnitPostResponseUid = response.data.response.uid;
    });
  });

  Then(/^I should be informed that the organisation unit was created$/, function () {
    assert.equal(this.organisationUnitPostResponseStatus, 201, 'Status should be 201');
    assert.isOk(this.organisationUnitPostResponseUid, 'Organisation Unit Id was not returned');
    if (this.organisationUnitPostResponseStatus === 201 && this.organisationUnitPostResponseUid === organisationUnitId) {
      organisationUnitWasCreated = true;
    }
  });

  Then(/^The returned data is the same as submitted.$/, function () {
    const world = this;

    return initializeOrganisationUnitGetPromise(world, this.organisationUnitPostResponseUid).then(function (response) {
      assert.equal(response.data.name, world.organisationUnitData.name, 'Name is wrong');
      assert.equal(response.data.shortName, world.organisationUnitData.shortName, 'Short name is wrong');
      assert.equal(moment(response.data.openingDate).format(world.momentDateFormat), world.organisationUnitData.openingDate, 'Opening Date is wrong');
    });
  });

  When(/^an existing parent organisation unit exists$/, function () {
    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
  });

  Then(/^I should be able to assign the existing organisation unit as a parent$/, function () {
    this.organisationUnitData.parent = {
      id: organisationUnitId
    };
  });

  When(/^I update an existing organisation unit$/, function () {
    assert.equal(organisationUnitWasCreated, true, 'Organisation Unit does not exist');
    this.organisationUnitUpdateRequest = {};
  });

  When(/^I provide a valid (.+) for a valid (.+)$/, function (value, property) {
    this.organisationUnitUpdateRequest[property] = value;
  });

  Then(/^I should be informed that the organisation unit was updated.$/, function () {
    const world = this;
    return initializeOrganisationUnitPatchPromise(world,
      organisationUnitId,
      world.organisationUnitUpdateRequest
    ).then(function (response) {
      assert.equal(response.status, 200, 'Organisation Unit was updated');
      return initializeOrganisationUnitGetPromise(world, organisationUnitId).then(function (response) {
        const keys = Object.keys(world.organisationUnitUpdateRequest);
        keys.forEach(function (key) {
          assert.equal(response.data[key], world.organisationUnitUpdateRequest[key], key + ' is wrong');
        });
      });
    });
  });

  When(/^I provide an invalid (.+) of a valid (.+)$/, function (value, property) {
    this.organisationUnitUpdateRequest[property] = value;
  });

  Then(/^I should receive an error message.$/, function () {
    return initializeOrganisationUnitPatchPromise(this,
      organisationUnitId,
      this.organisationUnitUpdateRequest
    ).then(function (response) {
      throw new Error('The request should have failed');   // it should fail
    }).catch(function (error) {
      // request failed
      if (error.response) {
        assert.equal(error.response.status, 500, 'It should have returned error status');
        assert.equal(error.response.data.status, 'ERROR', 'It should have returned error status');
        assert.property(error.response.data, 'message', 'It should have returned error message');
      } else {  // error thrown at then callback
        throw error;
      }
    });
  });

  When(/^I provide an invalid (.+) of an invalid (.+)$/, function (value, property) {
    this.organisationUnitUpdateRequest[property] = value;
  });

  Then(/^I should be informed that the organisation unit was not updated.$/, function () {
    return initializeOrganisationUnitPatchPromise(this,
      organisationUnitId,
      this.organisationUnitUpdateRequest
    ).then(function (response) {
      assert.equal(response.status, 204, 'Organisation Unit was not updated');
    });
  });

  When(/^I provide a closed date as (.+)$/, function (closedDate) {
    this.organisationUnitUpdateRequest.closedDate = closedDate;
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

      return initializeOrganisationUnitPutPromise(world, organisationUnitId, world.organisationUnitData);
    }).then(function (response) {
      assert.equal(response.status, 200, 'Organisation Unit was not updated');
    }).catch(function (error) {
      console.log('Error: ' + JSON.stringify(error.response.data));
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

const initializeOrganisationUnitPostPromise = (world, organisationUnitData) => {
  return world.axios({
    method: 'post',
    url: world.apiEndpoint + '/organisationUnits',
    data: organisationUnitData,
    auth: world.authRequestObject
  });
};

const initializeOrganisationUnitGetPromise = (world, organisationUnitId) => {
  return world.axios({
    method: 'get',
    url: world.apiEndpoint + '/organisationUnits/' + organisationUnitId,
    auth: world.authRequestObject
  });
};

const initializeOrganisationUnitPatchPromise = (world, organisationUnitId, organisationUnitUpdateRequest) => {
  return world.axios({
    method: 'patch',
    url: world.apiEndpoint + '/organisationUnits/' + organisationUnitId,
    data: organisationUnitUpdateRequest,
    auth: world.authRequestObject
  });
};

const initializeOrganisationUnitPutPromise = (world, organisationUnitId, organisationUnitUpdateRequest) => {
  return world.axios({
    method: 'put',
    url: world.apiEndpoint + '/organisationUnits/' + organisationUnitId,
    data: organisationUnitUpdateRequest,
    auth: world.authRequestObject
  });
};
