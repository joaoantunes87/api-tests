const axios = require('axios');
const chai = require('chai');
const { defineSupportCode } = require('cucumber');
const dhis2 = require('./utils.js');
const reporter = require('cucumber-html-reporter');

const assert = chai.assert;

function CustomWorld ({ parameters }) {
  if (parameters.apiEndpoint) {
    dhis2.setApiEndpoint(parameters.apiEndpoint);
  }

  this.authRequestObject = {
    username: 'admin',
    password: 'district'
  };
  this.axios = axios;
  this.axios.defaults.headers.post['Content-Type'] = 'application/json';
  this.axios.defaults.headers.post['Accept'] = 'application/json';
}

defineSupportCode(function ({ setWorldConstructor, registerHandler, Given, When, Then, Before, After }) {
  setWorldConstructor(CustomWorld);

  Before(function () {
    // auxiliar var for assertions
    this.requestData = {};                // body request
    this.resourceId = null;               // id of resource for test
    this.updatedDataToAssert = {};        // information to be asserted in later steps
    this.responseStatus = null;           // http status returned on previous request
    this.responseData = {};               // http response body returned on previous request
    this.errorResponse = null;            // axios error returned on previous promise
    this.method = null;                   // http method to be used in later request
  });

  // html reports
  registerHandler('AfterFeatures', function (features, callback) {
    const options = {
      theme: 'bootstrap',
      jsonFile: 'reports/cucumber_report.json',
      output: 'reports/cucumber_report.html',
      reportSuiteAsScenarios: true,
      launchReport: true
    };

    reporter.generate(options);
  });

  When(/^I submit the (.+)$/, function (resourceType) {
    const world = this;
    const url = dhis2.generateUrlForResourceTypeWithId(resourceType, world.resourceId);

    return dhis2.initializePromiseUrlUsingWorldContext(world, url).then(function (response) {
      world.responseStatus = response.status;
      world.responseData = response.data;
    }).catch(function (error) {
      world.errorResponse = error;
    });
  });

  Then(/^I should receive an error message equal to: (.+).$/, function (errorMessage) {
    assert.equal(this.errorResponse.response.status, 400, 'It should have returned error status of 400');
    assert.equal(this.errorResponse.response.data.status, 'ERROR', 'It should have returned error status');
    assert.equal(this.errorResponse.response.data.message, errorMessage, 'Error message should be ' + errorMessage);
  });

  When(/^I fill in the fields for the (.+) with data:$/, function (resourceType, data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    this.updatedDataToAssert = {};
    properties.forEach(function (propertyKey, index) {
      this.updatedDataToAssert[propertyKey] = values[index];
      this.requestData[propertyKey] = values[index];
    }, this);
  });

  Then(/^I should be informed that the (.+) was updated$/, function (resourceType) {
    assert.equal(this.responseStatus, 200, 'The ' + resourceType + ' should have been updated');
  });

  When(/^I select the correct locale for the logged user$/, function () {
    return this.axios({
      method: 'post',
      url: dhis2.getApiEndpoint() + '/userSettings/keyDbLocale?value=' + this.locale,
      auth: this.authRequestObject
    }).then(function (response) {
      assert.equal(response.status, 200, 'Locale setting was not updated');
    });
  });
});
