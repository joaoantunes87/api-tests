const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const axios = require('axios');
const reporter = require('cucumber-html-reporter');
const dhis2 = require('./utils.js');
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

    let url = '';
    if (resourceType === 'option set') {
      url = dhis2.generateUrlForOptionSetWithId(world.resourceId);
    } else if (resourceType === 'organisation unit') {
      url = dhis2.generateUrlForOrganisationUnitWithId(world.resourceId);
    }

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
});
