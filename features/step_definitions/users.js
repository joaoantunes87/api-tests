const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  Given(/^that I have the necessary permissions to add and delete users$/, function () {
    return this.axios.get(dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]', {
      auth: this.authRequestObject
    }).then(function (response) {
      assert.isOk(
        dhis2.isAuthorisedToAddUsersWith(response.data.userCredentials.userRoles),
        'Not Authorized to add users'
      );
      assert.isOk(
        dhis2.isAuthorisedToDeleteUsersWith(response.data.userCredentials.userRoles),
        'Not Authorized to delete users'
      );
    });
  });

  Given(/^there are some user roles in the system$/, function () {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      this,
      dhis2.generateUrlForResourceType(dhis2.resourceTypes.USER_ROLE)
    ).then(function (response) {
      assert.isAtLeast(
        response.data.userRoles.length,
        1,
        'It shoud have at least one user role'
      );
      world.userRoles = response.data.userRoles;
    });
  });

  When(/^I want to create a new user with the following details:$/, function (data) {
    this.method = 'post';

    const values = data.rawTable[1];
    this.requestData = {
      firstName: values[3],
      surname: values[2],
      userCredentials: {
        username: values[0],
        password: values[1]
      }
    };
  });

  When(/^assign the user a user role$/, function () {
    this.requestData.userCredentials.userRoles = [{id: this.userRoles[0].id}];
  });

  When(/^assign the user a data capture organisation unit$/, function () {
    this.requestData.organisationUnits = [{id: this.organisationUnits[0].id}];
  });

  When(/^submit the user to the server$/, function () {
    return submitServerRequest(this);
  });

  Then(/^I should be informed that the user was successfully created.$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'User Id was not returned');
  });

  Then(/^I should be informed that the user's password was not acceptable$/, function () {
    assert.equal(this.responseStatus, 400, 'Status should be 400');
    assert.isOk(this.responseData.response.errorReports, 'No error reports');
    // TODO check password message
  });

  Then(/^the user should not be created.$/, function () {
    assert.equal(this.responseStatus, 400, 'Status should be 400');
  });

  Then(/^I should be informed that the user requires a user role$/, function () {
    assert.equal(this.responseStatus, 400, 'Status should be 400');
    assert.isOk(this.responseData.response.errorReports, 'No error reports');
    // TODO check user roles missing message
  });

  Then(/^I should be informed that the user requires a surname$/, function () {
    assert.equal(this.responseStatus, 400, 'Status should be 400');
    assert.isOk(this.responseData.response.errorReports, 'No error reports');
    // TODO check surname missing message
  });

  Then(/^I should be informed that the user requires a firstname$/, function () {
    assert.equal(this.responseStatus, 400, 'Status should be 400');
    assert.isOk(this.responseData.response.errorReports, 'No error reports');
    // TODO check firstname missing message
  });

  Given(/^a user called (.*) exists$/, function (username) {
    const world = this;
    world.method = 'get';
    world.requestData = {};

    return dhis2.initializePromiseUrlUsingWorldContext(
      world,
      dhis2.generateUrlForResourceType(dhis2.resourceTypes.USER) + '?' +
        'fields=id&' +
        'filter=firstName:eq:' + username
    ).then(function (response) {
      assert.equal(response.status, 200, 'Response Status is ok');
      assert.isAtLeast(
        response.data.users.length,
        1,
        'It shoud have at least one user'
      );
      world.resourceId = response.data.users[0].id;
    });
  });

  When(/^I delete user account$/, function () {
    this.method = 'delete';

    return submitServerRequest(this);
  });

  Then(/^I should be informed that the account was deleted$/, function () {
    assert.equal(this.responseStatus, 204, 'Status should be 204');
  });

  Then(/^the user should not exist.$/, function () {
    const url = dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, this.resourceId);
    this.method = 'get';

    return dhis2.initializePromiseUrlUsingWorldContext(this, url).catch(function (error) {
      assert.equal(error.response.status, 404, 'Status should be 204');
    });
  });
});

const submitServerRequest = (world) => {
  const url = dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.USER, world.resourceId);

  return dhis2.initializePromiseUrlUsingWorldContext(world, url).then(function (response) {
    dhis2.debug('SUCCESS STATUS: ' + response.status);
    dhis2.debug('SUCCESS RESPONSE: ' + JSON.stringify(response.data, null, 2));
    world.responseStatus = response.status;
    world.responseData = response.data;
  }).catch(function (error) {
    dhis2.debug('ERROR STATUS: ' + error.response.status);
    console.error(JSON.stringify(error.response.data, null, 2));
    world.errorResponse = error;
  });
};
