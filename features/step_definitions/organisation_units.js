const { defineSupportCode } = require('cucumber');
const chai = require('chai');
// const faker = require('faker');
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

// const initializeFakeOrganizationUnit = (world) => {
//   return {
//     name: faker.company.companyName(),
//     shortName: faker.company.companySuffix(),
//     openingDate: moment(faker.date.past()).format(world.momentDateFormat)
//   };
// };

const initializeOrganisationUnitPostPromise = (world, organisationUnitData) => {
  return world.axios({
    method: 'post',
    url: world.apiEndpoint + '/organisationUnits',
    data: organisationUnitData,
    auth: world.authRequestObject
  });
};

// const initializeOrganisationUnitPatchPromise = (world, organisationUnitId, organisationUnitUpdateRequest) => {
//   return world.axios({
//     method: 'patch',
//     url: world.apiEndpoint + '/organisationUnits/' + organisationUnitId,
//     data: organisationUnitUpdateRequest,
//     auth: world.authRequestObject
//   });
// };

const initializeOrganisationUnitGetPromise = (world, organisationUnitId) => {
  return world.axios({
    method: 'get',
    url: world.apiEndpoint + '/organisationUnits/' + organisationUnitId,
    auth: world.authRequestObject
  });
};

defineSupportCode(function ({Before, Given, When, Then}) {
  // Before(function () {
  //   const world = this;
  //
  //   return world.axios({
  //     method: 'get',
  //     url: world.apiEndpoint + '/schemas/organisationUnit.json?fields=properties[fieldName],properties[propertyType],properties[required],properties[writable],properties[klass],apiEndpoint',
  //     auth: {
  //       username: 'admin',
  //       password: 'district'
  //     }
  //   }).then(function (response) {
  //     world.organisationUnitSchema = response.data.properties.filter((property) => {
  //       return (property.writable && (property.klass === 'java.lang.String' ||
  //       property.klass === 'java.lang.Boolean' ||
  //       property.klass === 'java.util.Date' ||
  //       property.klass === 'java.lang.Integer'));
  //     });
  //   });
  // });

  const organisationUnitId = generateIds();

  Given(/^that I am logged in$/, function () {
    this.organisationUnitData = {};
    this.organisationUnitUpdateRequest = {};
  });

  Given(/^that I have the necessary permissions to add an organisation unit$/, function () {

  });

  When(/^I fill in all of the required fields with data:$/, function (data) {
    // this.organisationUnitData = initializeFakeOrganizationUnit(this);
    const properties = data.rawTable[0];
    const values = data.rawTable[1];
    properties.forEach(function (propertyKey, index) {
      this.organisationUnitData[propertyKey] = values[index];
    }, this);
    this.organisationUnitData.id = organisationUnitId;
    console.log('Data to send: ' + JSON.stringify(this.organisationUnitData));
  });

  When(/^I submit the organisation unit$/, function () {
    const world = this;

    return initializeOrganisationUnitPostPromise(this, this.organisationUnitData).then(function (response) {
      world.organisationUnitPostResponseStatus = response.status;
      world.organisationUnitPostResponseUid = response.data.response.uid;
    });
  });

  Then(/^I should be informed that the organisation unit was created$/, function () {
    assert.equal(this.organisationUnitPostResponseStatus, 201, 'Status should be 201');
    assert.equal(this.organisationUnitPostResponseUid, this.organisationUnitData.id, 'Organisation Unit Id was not returned');
  });

  Then(/^The returned data is the same as submitted.$/, function () {
    const world = this;

    return initializeOrganisationUnitGetPromise(world, this.organisationUnitData.id).then(function (response) {
      assert.equal(response.data.name, world.organisationUnitData.name, 'Name is wrong');
      assert.equal(response.data.shortName, world.organisationUnitData.shortName, 'Short name is wrong');
      assert.equal(moment(response.data.openingDate).format(world.momentDateFormat), world.organisationUnitData.openingDate, 'Opening Date is wrong');
    });
  });

  // When(/^an existing parent organisation unit exists$/, function () {
  //   const world = this;
  //   world.organisationUnitId = null;
  //
  //   return initializeOrganisationUnitPostPromise(this, initializeFakeOrganizationUnit(this)).then(function (response) {
  //     world.organisationUnitId = response.data.response.uid;
  //   });
  // });
  //
  // When(/^I create a new organisation unit$/, function () {
  //   this.organisationUnitData = initializeFakeOrganizationUnit(this);
  // });
  //
  // When(/^I should be able to assign the existing organisation unit as a parent$/, function () {
  //   this.organisationUnitData.parent = {
  //     id: this.organisationUnitId
  //   };
  // });
  //
  // When(/^I update an organisation unit$/, function () {
  //   this.organisationUnitUpdateRequest = {};
  // });
  //
  // When(/^I provide a valid (.+) for a valid (.+)$/, function (value, property) {
  //   this.organisationUnitUpdateRequest[property] = value;
  // });
  //
  // Then(/^I should be informed that the organisation unit was updated.$/, function () {
  //   const world = this;
  //   return initializeOrganisationUnitPatchPromise(world,
  //     organisationUnitId,
  //     world.organisationUnitUpdateRequest
  //   ).then(function (response) {
  //     assert.equal(response.status, 200, 'Organisation Unit was updated');
  //     return initializeOrganisationUnitGetPromise(world, organisationUnitId).then(function (response) {
  //       const keys = Object.keys(world.organisationUnitUpdateRequest);
  //       keys.forEach(function (key) {
  //         assert.equal(response.data[key], world.organisationUnitUpdateRequest[key], key + ' is wrong');
  //       });
  //     });
  //   });
  // });
  //
  // When(/^I provide an invalid (.+) of a valid (.+)$/, function (value, property) {
  //   this.organisationUnitUpdateRequest[property] = value;
  // });
  //
  // Then(/^I should receive an error message.$/, function () {
  //   return initializeOrganisationUnitPatchPromise(this,
  //     organisationUnitId,
  //     this.organisationUnitUpdateRequest
  //   ).then(function (response) {
  //     throw new Error('The request should have failed');   // it should fail
  //   }).catch(function (error) {
  //     // request failed
  //     if (error.response) {
  //       assert.equal(error.response.status, 500, 'It should have returned error status');
  //       assert.equal(error.response.data.status, 'ERROR', 'It should have returned error status');
  //       assert.property(error.response.data, 'message', 'It should have returned error message');
  //     } else {  // error thrown at then callback
  //       throw error;
  //     }
  //   });
  // });
  //
  // When(/^I provide an invalid (.+) of an invalid (.+)$/, function (value, property) {
  //   this.organisationUnitUpdateRequest[property] = value;
  // });
  //
  // Then(/^I should be informed that the organisation unit was not updated.$/, function () {
  //   return initializeOrganisationUnitPatchPromise(this,
  //     organisationUnitId,
  //     this.organisationUnitUpdateRequest
  //   ).then(function (response) {
  //     assert.equal(response.status, 204, 'Organisation Unit was not updated');
  //   });
  // });
  //
  // When(/^I have created an organisation unit with an opening date as (.+)$/, function (openingDate) {
  //   this.organisationUnitUpdateRequest = {};
  // });
  //
  // When(/^I provide a closed date as (.+)$/, function (closedDate) {
  //   this.organisationUnitUpdateRequest.closedDate = closedDate;
  // });
});
