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
          return assertMetadata(metadata);
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

// FIXME move to an accessible place to be reusable
const assertOrganisationUnitLevel = (organisationUnitLevel) => {
  if (!organisationUnitLevel || !organisationUnitLevel.id) {
    return;
  }

  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.ORGANISATION_UNIT_LEVEL, organisationUnitLevel.id),
    onSuccess: function (response) {
      dhis2.debug('ASSERT ORGANISATION UNIT LEVEL');
      Object.keys(organisationUnitLevel).forEach(function (propertyKey) {
        assert.equal(
          response.data[propertyKey],
          organisationUnitLevel[propertyKey],
          propertyKey + ' is wrong'
        );
      });
    }
  });
};

// FIXME move to an accessible place to be reusable
const assertCategory = (category) => {
  if (!category || !category.id) {
    return;
  }

  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.CATEGORY, category.id),
    onSuccess: function (response) {
      dhis2.debug('ASSERT CATEGORY');
      for (const propertyKey of Object.keys(category)) {
        switch (propertyKey) {
          case 'categoryOptions':
            assert.sameDeepMembers(
              response.data[propertyKey],
              category[propertyKey],
              propertyKey + ' is wrong');
            break;
          default:
            assert.equal(
              response.data[propertyKey],
              category[propertyKey], propertyKey + ' is wrong'
            );
        }
      }
    }
  });
};

// FIXME move to an accessible place to be reusable
const assertCategoryOption = (categoryOption) => {
  if (!categoryOption || !categoryOption.id) {
    return;
  }

  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.CATEGORY_OPTION, categoryOption.id),
    onSuccess: function (response) {
      dhis2.debug('ASSERT CATEGORY OPTION');
      for (const propertyKey of Object.keys(categoryOption)) {
        assert.equal(
          response.data[propertyKey],
          categoryOption[propertyKey],
          propertyKey + ' is wrong'
        );
      }
    }
  });
};

// FIXME move to an accessible place to be reusable
const assertDataSet = (dataSet) => {
  if (!dataSet || !dataSet.id) {
    return;
  }

  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATASET, dataSet.id),
    onSuccess: function (response) {
      dhis2.debug('ASSERT DATA SET');
      for (const propertyKey of Object.keys(dataSet)) {
        switch (propertyKey) {
          case 'categoryCombo':
          case 'user':
            assert.deepEqual(
              response.data[propertyKey],
              dataSet[propertyKey],
              propertyKey + ' is wrong');
            break;
          case 'dataSetElements':
          case 'organisationUnits':
            assert.sameDeepMembers(
              response.data[propertyKey],
              dataSet[propertyKey],
              propertyKey + ' is wrong');
            break;
          default:
            assert.equal(
              response.data[propertyKey],
              dataSet[propertyKey], propertyKey + ' is wrong'
            );
        }
      }
    }
  });
};

const assertDataElement = (dataElement) => {
  if (!dataElement || !dataElement.id) {
    return;
  }

  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, dataElement.id),
    onSuccess: function (response) {
      dhis2.debug('ASSERT DATA ELEMENT');
      for (const propertyKey of Object.keys(dataElement)) {
        switch (propertyKey) {
          case 'categoryCombo':
          case 'user':
            assert.deepEqual(
              response.data[propertyKey],
              dataElement[propertyKey],
              propertyKey + ' is wrong');
            break;
          case 'translations':
            assert.sameDeepMembers(
              response.data[propertyKey],
              dataElement[propertyKey],
              propertyKey + ' is wrong');
            break;
          default:
            assert.equal(
              response.data[propertyKey],
              dataElement[propertyKey], propertyKey + ' is wrong'
            );
        }
      }
    }
  });
};

const assertCategoryOptionCombo = (categoryOptionCombo) => {
  if (!categoryOptionCombo || !categoryOptionCombo.id) {
    return;
  }

  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.CATEGORY_OPTION_COMBO, categoryOptionCombo.id),
    onSuccess: function (response) {
      dhis2.debug('ASSERT CATEGORY OPTION COMBO');
      for (const propertyKey of Object.keys(categoryOptionCombo)) {
        switch (propertyKey) {
          case 'categoryCombo':
            assert.deepEqual(
              response.data[propertyKey],
              categoryOptionCombo[propertyKey],
              propertyKey + ' is wrong');
            break;
          case 'categoryOptions':
            assert.sameDeepMembers(
              response.data[propertyKey],
              categoryOptionCombo[propertyKey],
              propertyKey + ' is wrong');
            break;
          default:
            assert.equal(
              response.data[propertyKey],
              categoryOptionCombo[propertyKey], propertyKey + ' is wrong'
            );
        }
      }
    }
  });
};

const assertCategoryCombo = (categoryCombo) => {
  if (!categoryCombo || !categoryCombo.id) {
    return;
  }

  return dhis2.sendApiRequest({
    url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.CATEGORY_COMBINATION, categoryCombo.id),
    onSuccess: function (response) {
      dhis2.debug('ASSERT CATEGORY COMBO');
      for (const propertyKey of Object.keys(categoryCombo)) {
        switch (propertyKey) {
          case 'categories':
            assert.sameDeepMembers(
              response.data[propertyKey],
              categoryCombo[propertyKey],
              propertyKey + ' is wrong');
            break;
          default:
            assert.equal(
              response.data[propertyKey],
              categoryCombo[propertyKey], propertyKey + ' is wrong'
            );
        }
      }
    }
  });
};

const assertMetadata = (metadata) => {
  const requests = [];

  // Organisation Units
  if (metadata.organisationUnits && Array.isArray(metadata.organisationUnits)) {
    for (const organisationUnit of metadata.organisationUnits) {
      requests.push(assertOrganisationUnit(organisationUnit));
    }
  }

  // Organisation Unit Levels
  if (metadata.organisationUnitLevels && Array.isArray(metadata.organisationUnitLevels)) {
    for (const organisationUnitLevel of metadata.organisationUnitLevels) {
      requests.push(assertOrganisationUnitLevel(organisationUnitLevel));
    }
  }

  // Data Elements
  if (metadata.dataElements && Array.isArray(metadata.dataElements)) {
    for (const dataElement of metadata.dataElements) {
      requests.push(assertDataElement(dataElement));
    }
  }

  // Datasets
  if (metadata.dataSets && Array.isArray(metadata.dataSets)) {
    for (const dataSet of metadata.dataSets) {
      requests.push(assertDataSet(dataSet));
    }
  }

  // Category Options
  if (metadata.categoryOptions && Array.isArray(metadata.categoryOptions)) {
    for (const categoryOption of metadata.categoryOptions) {
      requests.push(assertCategoryOption(categoryOption));
    }
  }

  // Category Option Combos
  if (metadata.categoryOptionCombos && Array.isArray(metadata.categoryOptionCombos)) {
    for (const categoryOptionCombo of metadata.categoryOptionCombos) {
      requests.push(assertCategoryOptionCombo(categoryOptionCombo));
    }
  }

  // Categores
  if (metadata.categories && Array.isArray(metadata.categories)) {
    for (const category of metadata.categories) {
      requests.push(assertCategory(category));
    }
  }

  // Category Combos
  if (metadata.categoryCombos && Array.isArray(metadata.categoryCombos)) {
    for (const categoryCombo of metadata.categoryCombos) {
      requests.push(assertCategoryCombo(categoryCombo));
    }
  }

  return dhis2.sendMultipleApiRequests({
    requests: requests
  });
};
