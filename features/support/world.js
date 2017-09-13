const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('./utils.js');
const fs = require('fs');
const reporter = require('cucumber-html-reporter');
const path = require('path');

const assert = chai.assert;

defineSupportCode(function ({ registerHandler, Given, When, Then, Before }) {
  Before(function () {
    // auxiliar var for assertions
    this.requestData = {};                // body request
    this.resourceId = null;               // id of resource for test
    this.updatedDataToAssert = {};        // information to be asserted in later steps
    this.responseStatus = null;           // http status returned on previous request
    this.responseData = {};               // http response body returned on previous request
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

  registerHandler('BeforeFeatures', function () {
    // Known env, we can load metadata
    // needed to allow local runs
    if (dhis2.isDockerEnv()) {
      dhis2.debug('BEFORE FEATURES');
      const filePath = path.join(path.resolve('.'), '/data/metadata.json');
      const metadata = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return dhis2.sendApiRequest({
        url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.META_DATA),
        requestData: metadata,
        method: 'post',
        onSuccess: function (response) {
          // TODO assert metadata
          return assertOrganisationUnits(metadata.organisationUnits);
        }
      });
    }
  });

  Then(/^I should receive an error message equal to: (.+).$/, function (errorMessage) {
    assert.equal(this.responseStatus, 400, 'It should have returned error status of 400');
    assert.equal(this.responseData.status, 'ERROR', 'It should have returned error status');
    assert.equal(this.responseData.message, errorMessage, 'Error message should be ' + errorMessage);
  });

  Then(/^I should receive a ([\d]{3}) error message equal to: (.*?).$/, function (statusCode, errorMessage) {
    assert.equal(this.responseStatus, statusCode, 'It should have returned error status of ' + statusCode);
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
    }, world);
  });
});

const assertOrganisationUnits = (organisationUnits) => {
  if (!organisationUnits || organisationUnits.length === 0) {
    return;
  }
  // FIXME move to an accessible place to be reusable
  const assertOrganisationUnit = (organisationUnit) => {
    if (!organisationUnit || !organisationUnit.id) {
      return;
    }

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT, organisationUnit.id),
      onSuccess: function (response) {
        dhis2.debug('ASSERT ORGANISATION UNIT');
        Object.keys(organisationUnit).forEach(function (propertyKey) {
          switch (propertyKey) {
            case 'parent':
              assert.deepEqual(
                response.data[propertyKey],
                organisationUnit[propertyKey],
                propertyKey + ' is wrong');
              break;
            case 'dataSets':
              assert.sameDeepMembers(
                response.data[propertyKey],
                organisationUnit[propertyKey],
                propertyKey + ' is wrong');
              break;
            default:
              assert.equal(
                response.data[propertyKey],
                organisationUnit[propertyKey], propertyKey + ' is wrong'
              );
          }
        });
      }
    });
  };

  const organisationUnitAssertionRequests = organisationUnits.map((organisationUnit) => {
    return assertOrganisationUnit(organisationUnit);
  });

  return dhis2.sendMultipleApiRequests({
    requests: organisationUnitAssertionRequests
  });
};
