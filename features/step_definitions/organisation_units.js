const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const faker = require('faker');
const moment = require('moment');

const assert = chai.assert;

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

const initializeFakeOrganizationUnit = (world) => {
  return {
    name: faker.company.companyName(),
    shortName: faker.company.companySuffix(),
    openingDate: moment(faker.date.past()).format(world.momentDateFormat)
  };
};

const initializeOrganisationUnitPostPromise = (world, organisationUnitData) => {
  return world.axios({
    method: 'post',
    url: world.apiEndpoint + '/organisationUnits',
    data: organisationUnitData,
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

const initializeOrganisationUnitGetPromise = (world, organisationUnitId) => {
  return world.axios({
    method: 'get',
    url: world.apiEndpoint + '/organisationUnits/' + organisationUnitId,
    auth: world.authRequestObject
  });
};

defineSupportCode(function ({Before, Given, When, Then}) {
  /* Before(function () {
    const world = this;

    return world.axios({
      method: 'get',
      url: world.apiEndpoint + '/schemas/organisationUnit.json',
      auth: {
        username: 'admin',
        password: 'district'
      }
    }).then(function (response) {
      world.organisationUnitSchema = response.data;
    });
  }); */

  const organisationUnitId = generateIds();

  Before(function () {
    const world = this;

    world.organisationUnitData = {};
    world.organisationUnitUpdateRequest = {};
  });

  Given(/^that I am logged in$/, function () {

  });

  When(/^that I have the necessary permissions to add an organisation unit$/, function () {

  });

  When(/^I fill in all of the required fields correctly$/, function () {
    this.organisationUnitData = initializeFakeOrganizationUnit(this);
    this.organisationUnitData.id = organisationUnitId;
  });

  When(/^I submit the organisation unit$/, function () {

  });

  Then(/^I should be informed that the organisation unit was created.$/, function () {
    const world = this;

    return initializeOrganisationUnitPostPromise(this, this.organisationUnitData).then(function (response) {
      assert.equal(response.status, 201, 'Status should be 201');
      assert.property(response.data.response, 'uid', 'Organisation Unit Id must be returned');
      return initializeOrganisationUnitGetPromise(world, response.data.response.uid).then(function (response) {
        assert.equal(response.data.name, world.organisationUnitData.name, 'Organisation Unit name must be equal to name sent');
        assert.equal(response.data.shortName, world.organisationUnitData.shortName, 'Organisation Unit short name sent');
        assert.equal(moment(response.data.openingDate).format(world.momentDateFormat), world.organisationUnitData.openingDate, 'OrganisationUnit Opening Date is correct');
      });
    });
  });

  When(/^an existing parent organisation unit exists$/, function () {
    const world = this;
    world.organisationUnitId = null;

    return initializeOrganisationUnitPostPromise(this, initializeFakeOrganizationUnit(this)).then(function (response) {
      world.organisationUnitId = response.data.response.uid;
    });
  });

  When(/^I create a new organisation unit$/, function () {
    this.organisationUnitData = initializeFakeOrganizationUnit(this);
  });

  When(/^I should be able to assign the existing organisation unit as a parent$/, function () {
    this.organisationUnitData.parent = {
      id: this.organisationUnitId
    };
  });

  When(/^I update an organisation unit$/, function () {
    this.organisationUnitUpdateRequest = {};
  });

  When(/^I provide a valid (.+) for a valid (.+)$/, function (value, property) {
    this.organisationUnitUpdateRequest[property] = value;
  });

  Then(/^I should be informed that the organisation unit was updated.$/, function () {
    return initializeOrganisationUnitPatchPromise(this,
      organisationUnitId,
      this.organisationUnitUpdateRequest
    ).then(function (response) {
      assert.equal(response.status, 200, 'Organisation Unit was updated');
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
        assert.equal(error.response.status, 500, 'A error happened');
        assert.equal(error.response.data.status, 'ERROR', 'A error happened');
        assert.property(error.response.data, 'message', 'User id was returned');
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

  When(/^I have created an organisation unit with an opening date as (.+)$/, function (openingDate) {
    this.organisationUnitUpdateRequest = {};
  });

  When(/^I provide a closed date as (.+)$/, function (closedDate) {
    this.organisationUnitUpdateRequest.closedDate = closedDate;
  });
});
