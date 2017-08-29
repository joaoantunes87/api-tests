'use strict';
const fs = require('fs');
const axios = require('axios');
const querystring = require('querystring');
module.exports = (() => {
  let baseUrl = 'https://play.dhis2.org/demo';  // default
  let apiVersion = 27;                          // default
  let generateHtmlReport = true;

  const apiEndpoint = () => {
    return baseUrl + '/api/' + apiVersion;
  };

  const LOG_DEBUG_MODE = 'debug';
  const ALL_AUTHORITY = 'ALL';
  const RESOURCE_TYPES = {
    OPTION_SET: 'option set',
    OPTION: 'option',
    DATA_ELEMENT: 'data element',
    ORGANISATION_UNIT: 'organisation unit',
    DATASET: 'dataset',
    CATEGORY_COMBINATION: 'category combination',
    INDICATOR: 'indicator',
    INDICATOR_TYPE: 'indicator type',
    CATEGORY_OPTION: 'category option',
    CATEGORY: 'category',
    USER_ROLE: 'user role',
    USER: 'user',
    APPLICATION: 'application'
  };

  const AUTH_REQUEST_OBJECT = {
    username: 'admin',
    password: 'district'
  };

  const onDebugMode = process.env.DHIS2_LOG_MODE === LOG_DEBUG_MODE;

  const isAuthorisedTo = (authority, userRoles = []) => {
    if (authority && userRoles.length > 0) {
      for (const index in userRoles) {
        const authorities = userRoles[index].authorities || [];
        if (authorities.includes(ALL_AUTHORITY) || authorities.includes(authority)) {
          return true;
        }
      }
    }

    return false;
  };

  const debug = (message) => {
    if (message && onDebugMode) {
      console.log(message);
    }
  };

  const generateResourceTypeEndpoint = (resourceType) => {
    let endpoint = '';
    switch (resourceType) {
      case RESOURCE_TYPES.OPTION_SET:
        endpoint = apiEndpoint() + '/optionSets';
        break;
      case RESOURCE_TYPES.OPTION:
        endpoint = apiEndpoint() + '/options';
        break;
      case RESOURCE_TYPES.ORGANISATION_UNIT:
        endpoint = apiEndpoint() + '/organisationUnits';
        break;
      case RESOURCE_TYPES.DATA_ELEMENT:
        endpoint = apiEndpoint() + '/dataElements';
        break;
      case RESOURCE_TYPES.DATASET:
        endpoint = apiEndpoint() + '/dataSets';
        break;
      case RESOURCE_TYPES.CATEGORY_COMBINATION:
        endpoint = apiEndpoint() + '/categoryCombos';
        break;
      case RESOURCE_TYPES.INDICATOR:
        endpoint = apiEndpoint() + '/indicators';
        break;
      case RESOURCE_TYPES.INDICATOR_TYPE:
        endpoint = apiEndpoint() + '/indicatorTypes';
        break;
      case RESOURCE_TYPES.CATEGORY_OPTION:
        endpoint = apiEndpoint() + '/categoryOptions';
        break;
      case RESOURCE_TYPES.CATEGORY:
        endpoint = apiEndpoint() + '/categories';
        break;
      case RESOURCE_TYPES.USER:
        endpoint = apiEndpoint() + '/users';
        break;
      case RESOURCE_TYPES.USER_ROLE:
        endpoint = apiEndpoint() + '/userRoles';
        break;
      case RESOURCE_TYPES.APPLICATION:
        endpoint = apiEndpoint() + '/apps';
        break;
      default:
        throw new Error('There is no resource type defined for: ' + resourceType);
    }

    return endpoint;
  };

  return {
    resourceTypes: RESOURCE_TYPES,
    debug: debug,
    baseUrl: (newBaseUrl) => {
      if (newBaseUrl) {
        baseUrl = newBaseUrl;
      } else {
        return baseUrl;
      }
    },
    apiVersion: (newApiVersion) => {
      if (newApiVersion) {
        apiVersion = newApiVersion;
      } else {
        return apiVersion;
      }
    },
    defaultBasicAuth: AUTH_REQUEST_OBJECT,
    apiEndpoint: apiEndpoint,
    generateHtmlReport: (generate) => {
      if (typeof generate === 'undefined') {
        return generateHtmlReport;
      } else {
        generateHtmlReport = generate;
      }
    },
    isAuthorisedToAddDataElementWith: (userRoles = []) => {
      return isAuthorisedTo('F_DATAELEMENT_PUBLIC_ADD', userRoles);
    },
    isAuthorisedToAddOrganisationUnitWith: (userRoles = []) => {
      return isAuthorisedTo('F_ORGANISATIONUNIT_ADD', userRoles);
    },
    isAuthorisedToAddOptionSetWith: (userRoles = []) => {
      return isAuthorisedTo('F_OPTIONSET_PUBLIC_ADD', userRoles);
    },
    isAuthorisedToDeleteOptionSetWith: (userRoles = []) => {
      return isAuthorisedTo('F_OPTIONSET_DELETE', userRoles);
    },
    isAuthorisedToDeleteOptionWith: (userRoles = []) => {
      return isAuthorisedTo('F_OPTIONSET_DELETE', userRoles);
    },
    isAuthorisedToAddDataSetWith: (userRoles = []) => {
      return isAuthorisedTo('F_DATASET_PUBLIC_ADD', userRoles);
    },
    isAuthorisedToAddCategoryComboWith: (userRoles = []) => {
      return isAuthorisedTo('F_CATEGORY_COMBO_PUBLIC_ADD', userRoles);
    },
    isAuthorisedToAddCategoryOptionWith: (userRoles = []) => {
      return isAuthorisedTo('F_CATEGORY_OPTION_PUBLIC_ADD', userRoles);
    },
    isAuthorisedToAddCategoryWith: (userRoles = []) => {
      return isAuthorisedTo('F_CATEGORY_PUBLIC_ADD', userRoles);
    },
    isAuthorisedToAddUsersWith: (userRoles = []) => {
      return isAuthorisedTo('F_USER_ADD', userRoles);
    },
    isAuthorisedToDeleteUsersWith: (userRoles = []) => {
      return isAuthorisedTo('F_USER_DELETE', userRoles);
    },
    isAuthorisedToAddIndicatorsWith: (userRoles = []) => {
      return isAuthorisedTo('F_INDICATOR_PUBLIC_ADD', userRoles);
    },
    isAuthorisedToDeleteIndicatorsWith: (userRoles = []) => {
      return isAuthorisedTo('F_INDICATOR_DELETE', userRoles);
    },
    isAuthorisedToManageApplicationWith: (userRoles = []) => {
      return isAuthorisedTo('M_dhis-web-maintenance-appmanager', userRoles);
    },
    sendApiRequest: (options, world) => {
      if (!options.url) {
        throw new Error('Url is required!');
      }

      let authentication = null;
      if (!options.authenticationNotNeeded) {         // authentication needed
        if (options.authentication) {                 // not default auth
          authentication = options.authentication;
        } else {                                      // default auth
          authentication = AUTH_REQUEST_OBJECT;
        }
      }

      let requestData = {};
      if (options.requestData) {
        requestData = options.multipartFormRequest
          ? querystring.stringify(options.requestData) : options.requestData;
      }

      debug('URL: ' + options.url);
      debug('METHOD: ' + options.method);
      debug('REQUEST DATA: ' + JSON.stringify(requestData, null, 2));
      debug('AUTH: ' + JSON.stringify(authentication, null, 2));

      return axios({
        headers: options.headers || {},
        method: options.method || 'get',
        url: options.url,
        data: requestData,
        auth: authentication
      }).then(function (response) {
        debug('THEN PROMISE');
        if (world) {
          world.responseStatus = response.status;
          world.responseData = response.data;
        }

        if (options.onSuccess) {
          return options.onSuccess(response);
        }
      }).catch(function (error) {
        if (error && error.response) {
          debug('ERROR RESPONSE STATUS: ' + error.response.status);
          debug('ERROR RESPONSE DATA: ' + JSON.stringify(error.response.data, null, 2));
        } else {
          throw error;
        }

        if (world) {
          world.responseData = error.response.data;
          world.responseStatus = error.response.status;
        }

        if (options.onError) {
          return options.onError(error);
        }

        if (!options.preventDefaultOnError) {
          throw error;
        }
      });
    },
    sendMultipleApiRequests: (options) => {
      if (!options.requests) {
        throw new Error('Requests are required!');
      }

      return axios.all(options.requests).then(function (responses) {
        if (options.onComplete) {
          options.onComplete();
        }
      });
    },
    generateUniqIds: (numberOfIds) => {
      const alphabet = 'abcdefghijklmnopqrstuvwxyz';
      const currentTimestamp = Math.floor(Date.now() / 1000);   // 10 digits
      const ids = [];
      const numberOfIdsTemp = numberOfIds || 1;
      for (let seed = 0; seed < numberOfIdsTemp; seed++) {
        const letter = alphabet[seed % alphabet.length];
        ids.push(letter + currentTimestamp);
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
    loadFileFromPath: (path) => {
      return fs.createReadStream(path);
    }
  };
})();
