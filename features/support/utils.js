'use strict';

module.exports = (() => {
  let apiEndpoint = 'https://play.dhis2.org/demo/api/26'; // default
  let generateHtmlReport = true;
  const RESOURCE_TYPES = {
    OPTION_SET: 'option set',
    DATA_ELEMENT: 'data element',
    ORGANISATION_UNIT: 'organisation unit',
    DATASET: 'dataset',
    CATEGORY_COMBINATION: 'category combination'
  };

  const authorityExistsInUserRoles = (authority, userRoles = []) => {
    if (authority && userRoles.length > 0) {
      for (const index in userRoles) {
        const authorities = userRoles[index].authorities || [];
        if (authorities.includes(authority)) {
          return true;
        }
      }
    }

    return false;
  };

  const generateResourceTypeEndpoint = (resourceType) => {
    let endpoint = '';
    switch (resourceType) {
      case RESOURCE_TYPES.OPTION_SET:
        endpoint = apiEndpoint + '/optionSets';
        break;
      case RESOURCE_TYPES.ORGANISATION_UNIT:
        endpoint = apiEndpoint + '/organisationUnits';
        break;
      case RESOURCE_TYPES.DATA_ELEMENT:
        endpoint = apiEndpoint + '/dataElements';
        break;
      case RESOURCE_TYPES.DATASET:
        endpoint = apiEndpoint + '/dataSets';
        break;
      case RESOURCE_TYPES.CATEGORY_COMBINATION:
        endpoint = apiEndpoint + '/categoryCombos';
        break;
      default:
        throw new Error('There is no resource type defined for: ' + resourceType);
    }

    return endpoint;
  };

  return {
    resourceTypes: RESOURCE_TYPES,
    apiEndpoint: (newApiEndpoint) => {
      if (newApiEndpoint) {
        apiEndpoint = newApiEndpoint;
      } else {
        return apiEndpoint;
      }
    },
    generateHtmlReport: (generate) => {
      if (typeof generate === 'undefined') {
        return generateHtmlReport;
      } else {
        generateHtmlReport = generate;
      }
    },
    isAuthorisedToAddDataElementWith: (userRoles = []) => {
      return authorityExistsInUserRoles('F_DATAELEMENT_PUBLIC_ADD', userRoles);
    },
    isAuthorisedToAddOrganisationUnitWith: (userRoles = []) => {
      return authorityExistsInUserRoles('F_ORGANISATIONUNIT_ADD', userRoles);
    },
    isAuthorisedToAddOptionSetWith: (userRoles = []) => {
      return authorityExistsInUserRoles('F_OPTIONSET_PUBLIC_ADD', userRoles);
    },
    isAuthorisedToDeleteOptionSetWith: (userRoles = []) => {
      return authorityExistsInUserRoles('F_OPTIONSET_DELETE', userRoles);
    },
    isAuthorisedToAddDataSetWith: (userRoles = []) => {
      return authorityExistsInUserRoles('F_DATASET_PUBLIC_ADD', userRoles);
    },
    initializePromiseUrlUsingWorldContext: (world, url) => {
      return world.axios({
        method: world.method || 'get',
        url: url,
        data: world.requestData || {},
        auth: world.authRequestObject
      });
    },
    generateUniqIds: (numberOfIds) => {
      const currentTimestamp = Math.floor(Date.now() / 100);    // 11 digits
      const ids = [];
      const numberOfIdsTemp = numberOfIds || 1;
      for (let seed = 0; seed < numberOfIdsTemp; seed++) {
        ids.push((currentTimestamp - seed) + '');
      }

      return numberOfIds ? ids : ids[0];
    },
    generateUrlForResourceType: (resourceType) => {
      return generateResourceTypeEndpoint(resourceType);
    },
    generateUrlForResourceTypeWithId: (resourceType, resourceId) => {
      const endpoint = generateResourceTypeEndpoint(resourceType);

      if (resourceId) {
        return endpoint + '/' + resourceId;
      }

      return endpoint;
    },
    generateUrlToEndpointWithParams: (resourceType, paramsDictionary = {}) => {
      let url = generateResourceTypeEndpoint(resourceType) + '?';
      for (const key in paramsDictionary) {
        url = url + key + '=' + paramsDictionary[key] + '&';
      }

      return url;
    }
  };
})();
