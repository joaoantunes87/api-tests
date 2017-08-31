const { defineSupportCode } = require('cucumber');
const chai = require('chai');
const dhis2 = require('../support/utils.js');

const assert = chai.assert;

defineSupportCode(function ({Given, When, Then}) {
  const generatedDataElementId = dhis2.generateUniqIds();
  let dataElementWasCreated = false;

  Given(/^that I have the necessary permissions to add a data element$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.apiEndpoint() + '/me?fields=userCredentials[userRoles[*]]',
      onSuccess: function (response) {
        assert.isOk(
          dhis2.isAuthorisedToAddDataElementWith(response.data.userCredentials.userRoles),
          'Not Authorized to create Data Element'
        );
      }
    });
  });

  When(/^I want to create a new data element$/, function () {
    this.method = 'post';
    this.requestData.id = generatedDataElementId;
  });

  When(/^I fill in the fields for the data element like:$/, function (data) {
    const properties = data.rawTable[0];
    const values = data.rawTable[1];

    this.updatedDataToAssert = {};
    properties.forEach(function (propertyKey, index) {
      this.updatedDataToAssert[propertyKey] = values[index];
      this.requestData[propertyKey] = values[index];
    }, this);
  });

  When(/^I submit the data element to the server$/, function () {
    return submitServerRequest(this);
  });

  Then(/^I should be informed that the data element was created$/, function () {
    assert.equal(this.responseStatus, 201, 'Status should be 201');
    assert.isOk(this.responseData.response.uid, 'Data Element Id was not returned');

    dataElementWasCreated = true;
    this.resourceId = this.responseData.response.uid;
  });

  Then(/^the data element has the same properties as those I supplied.$/, function () {
    const world = this;
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, world.resourceId),
      onSuccess: function (response) {
        Object.keys(world.updatedDataToAssert).forEach(function (propertyKey) {
          assert.equal(response.data[propertyKey], world.updatedDataToAssert[propertyKey], propertyKey + ' is wrong');
        });
      }
    });
  });

  When(/^I want to update an existing data element$/, function () {
    return prepareExistingDataElementToBeUpdated(this);
  });

  When(/^I want to delete an existing data element$/, function () {
    this.method = 'delete';
    this.requestData = {};

    assert.equal(dataElementWasCreated, true, 'Data Element does not exist');
    assert.isOk(generatedDataElementId, 'Data Element Id does not exist');

    this.resourceId = generatedDataElementId;
  });

  Then(/^I should be informed the data element was deleted$/, function () {
    assert.equal(this.responseStatus, 200, 'Status should be 200');

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, generatedDataElementId),
      onSuccess: function (response) {
        /* throw an error could be used here. Once here, this assert will always fail because onSuccess
           we can not have a 4** status, but using assert we keep the same style.
        */
        assert.equal(response.status, 404, 'Status should be 404');
      },
      onError: function (error) {
        assert.equal(error.response.status, 404, 'Status should be 404');
      },
      preventDefaultOnError: true
    });
  });

  When(/^submit the request to the server$/, function () {
    return submitServerRequest(this);
  });

  When(/^I want to translate an existing data element$/, function () {
    return prepareExistingDataElementToBeUpdated(this);
  });

  When(/^I translate the name of the data element for (.+) with (.+) as (.+)$/,
    function (language, locale, translationValue) {
      const world = this;
      world.locale = locale;
      world.translationValue = translationValue;

      return dhis2.sendApiRequest({
        url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, generatedDataElementId),
        onSuccess: function (response) {
          const requestData = response.data;
          requestData.translations = [
            {
              property: 'NAME',
              locale: locale,
              value: translationValue
            }
          ];

          return dhis2.sendApiRequest({
            url: dhis2.generateUrlForResourceTypeWithId(
              dhis2.resourceTypes.DATA_ELEMENT,
              generatedDataElementId),
            method: 'put',
            requestData: requestData,
            onSuccess: function (response) {
              assert.equal(response.status, 200, 'Data Element was not updated');
            }
          });
        }
      });
    }
  );

  Then(/^I should see the (.+) of the data element.$/, function (translationValue) {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, generatedDataElementId),
      onSuccess: function (response) {
        assert.equal(response.data.displayName, translationValue, 'Name is not translated');
      }
    });
  });

  When(/^I search for data elements by a (.+) which has a (.+)$/, function (property, value) {
    this.searchProperty = property;
    this.searchValue = value;
  });

  When(/^I send the search request$/, function () {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceType(dhis2.resourceTypes.DATA_ELEMENT) + '?' +
            'fields=' + this.searchProperty + '&' +
            'filter=' + this.searchProperty + ':eq:' + this.searchValue + '&' +
            'paging=false',
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Response Status is ok');
        assert.property(response.data, 'dataElements', 'It should return data elements');
      }
    }, this);
  });

  Then(/^I should only see the data elements which have a (.+) with the same (.+).$/,
    function (searchProperty, searchValue) {
      for (const dataElement of this.responseData.dataElements) {
        assert.equal(
          dataElement[searchProperty],
          searchValue,
          'The ' + searchProperty + ' should be ' + searchValue
        );
      }
    }
  );

  const submitServerRequest = (world) => {
    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, world.resourceId),
      requestData: world.requestData,
      method: world.method,
      preventDefaultOnError: true
    }, world);
  };

  const prepareExistingDataElementToBeUpdated = (world) => {
    assert.equal(dataElementWasCreated, true, 'Data Element does not exist');
    assert.isOk(generatedDataElementId, 'Data Element Id does not exist');
    world.resourceId = generatedDataElementId;

    return dhis2.sendApiRequest({
      url: dhis2.generateUrlForResourceTypeWithId(dhis2.resourceTypes.DATA_ELEMENT, generatedDataElementId),
      onSuccess: function (response) {
        assert.equal(response.status, 200, 'Status should be 200');
        world.requestData = response.data;
        world.method = 'put';
      }
    });
  };
});
