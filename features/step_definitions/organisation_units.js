const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const faker = require('faker');
const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  Given(/^that I am logged in$/, function () {
  });

  When(/^that I have the necessary permissions to add an organisation unit$/, function () {

  });

  When(/^I fill in all of the required fields correctly$/, function () {
    this.name = faker.company.companyName();
    this.shortName = faker.company.companySuffix();
    this.openingDate = faker.date.past();
  });

  When(/^I submit the organisation unit$/, function () {

  });

  Then(/^I should be informed that the organisation unit was created.$/, function () {
    return this.axios({
      method: 'post',
      url: this.apiEndpoint + '/organisationUnits',
      data: {
        name: this.name,
        shortName: this.shortName,
        openingDate: this.openingDate
      },
      auth: {
        username: 'admin',
        password: 'district'
      }
    }).then(function (response) {
      assert.equal(response.status, 201, 'Organisation Unit was created');
      assert.property(response.data.response, 'uid', 'Organisation Unit Id was returned');
    });
  });

  When(/^I update an organisation unit$/, function () {
    const world = this;
    world.organisationUnitId = null;
    world.organisationUnitUpdateRequest = {};

    return this.axios({
      method: 'post',
      url: this.apiEndpoint + '/organisationUnits',
      data: {
        name: faker.company.companyName(),
        shortName: faker.company.companySuffix(),
        openingDate: faker.date.past()
      },
      auth: {
        username: 'admin',
        password: 'district'
      }
    }).then(function (response) {
      world.organisationUnitId = response.data.response.uid;
    });
  });

  When(/^I provide a valid (.+) for a valid (.+)$/, function (value, property) {
    this.organisationUnitUpdateRequest[property] = value;
  });

  Then(/^I should be informed that the organisation unit was updated.$/, function () {
    return this.axios({
      method: 'patch',
      url: this.apiEndpoint + '/organisationUnits/' + this.organisationUnitId,
      data: this.organisationUnitUpdateRequest,
      auth: {
        username: 'admin',
        password: 'district'
      }
    }).then(function (response) {
      assert.equal(response.status, 200, 'Organisation Unit was updated');
    });
  });

  When(/^I provide an invalid (.+) of a valid (.+)$/, function (value, property) {
    this.organisationUnitUpdateRequest[property] = value;
  });

  Then(/^I should receive an error message.$/, function () {
    return this.axios({
      method: 'patch',
      url: this.apiEndpoint + '/organisationUnits/' + this.organisationUnitId,
      data: this.organisationUnitUpdateRequest,
      auth: {
        username: 'admin',
        password: 'district'
      }
    }).then(function (response) {
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
    return this.axios({
      method: 'patch',
      url: this.apiEndpoint + '/organisationUnits/' + this.organisationUnitId,
      data: this.organisationUnitUpdateRequest,
      auth: {
        username: 'admin',
        password: 'district'
      }
    }).then(function (response) {
      assert.equal(response.status, 204, 'Organisation Unit was not updated');
    });
  });

  When(/^I have created an organisation unit with an opening date as (.+)$/, function (openingDate) {
    const world = this;
    world.organisationUnitId = null;
    world.organisationUnitUpdateRequest = {};

    return this.axios({
      method: 'post',
      url: this.apiEndpoint + '/organisationUnits',
      data: {
        name: faker.company.companyName(),
        shortName: faker.company.companySuffix(),
        openingDate: openingDate
      },
      auth: {
        username: 'admin',
        password: 'district'
      }
    }).then(function (response) {
      world.organisationUnitId = response.data.response.uid;
    });
  });

  When(/^I provide a closed date as (.+)$/, function (closedDate) {
    this.organisationUnitUpdateRequest['closedDate'] = closedDate;
  });
});
