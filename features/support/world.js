const { defineSupportCode } = require('cucumber');
const axios = require('axios');
const chai = require('chai');
const dhis2 = require('./utils.js');
const reporter = require('cucumber-html-reporter');

const assert = chai.assert;

function CustomWorld ({ parameters }) {
  if (parameters.hasOwnProperty('apiEndpoint')) {
    dhis2.apiEndpoint(parameters.apiEndpoint);
  }

  if (parameters.hasOwnProperty('generateHtmlReport')) {
    dhis2.generateHtmlReport(parameters.generateHtmlReport);
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
      launchReport: false
    };

    if (dhis2.generateHtmlReport()) {
      reporter.generate(options);
    }

    callback();
  });

  Then(/^I should receive an error message equal to: (.+).$/, function (errorMessage) {
    assert.equal(this.errorResponse.response.status, 400, 'It should have returned error status of 400');
    assert.equal(this.errorResponse.response.data.status, 'ERROR', 'It should have returned error status');
    assert.equal(this.errorResponse.response.data.message, errorMessage, 'Error message should be ' + errorMessage);
  });

  Then(/^I should be informed that the (.+) was updated$/, function (resourceType) {
    assert.equal(this.responseStatus, 200, 'The ' + resourceType + ' should have been updated');
  });

  When(/^I select the correct (.+)$/, function (locale) {
    return this.axios({
      method: 'post',
      url: dhis2.apiEndpoint() + '/userSettings/keyDbLocale?value=' + locale,
      auth: this.authRequestObject
    }).then(function (response) {
      assert.equal(response.status, 200, 'Locale setting was not updated');
    });
  });
});
