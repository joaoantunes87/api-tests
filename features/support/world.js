const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('./utils.js');
const reporter = require('cucumber-html-reporter');

const assert = chai.assert;

function CustomWorld ({ parameters }) {
  if (parameters.hasOwnProperty('baseUrl')) {
    dhis2.baseUrl(parameters.baseUrl);
  }

  if (parameters.hasOwnProperty('apiVersion')) {
    dhis2.apiVersion(parameters.apiVersion);
  }

  if (parameters.hasOwnProperty('generateHtmlReport')) {
    dhis2.generateHtmlReport(parameters.generateHtmlReport);
  }
}

defineSupportCode(function ({ setWorldConstructor, registerHandler, Given, When, Then }) {
  setWorldConstructor(CustomWorld);

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
    assert.equal(this.responseStatus, 400, 'It should have returned error status of 400');
    assert.equal(this.responseData.status, 'ERROR', 'It should have returned error status');
    assert.equal(this.responseData.message, errorMessage, 'Error message should be ' + errorMessage);
  });

  Then(/^I should be informed that the (.+) was updated$/, function (resourceType) {
    assert.equal(this.responseStatus, 200, 'The ' + resourceType + ' should have been updated');
  });

  When(/^I select the correct (.+)$/, function (locale) {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/userSettings/keyDbLocale?value=' + locale,
      method: 'post',
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Locale setting was not updated');
      }
    });
  });

  When(/^there are some organisation units in the system$/, function () {
    const world = this;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.ORGANISATION_UNIT),
      onSuccess: function (response) {
        assert.isAtLeast(
          response.data.organisationUnits.length,
          1,
          'It shoud have at least one organisation unit'
        );
        world.organisationUnits = response.data.organisationUnits;
      }
    });
  });
});
