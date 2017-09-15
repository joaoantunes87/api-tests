'use strict';
const fs = require('fs');
const axios = require('axios');
const querystring = require('querystring');
module.exports = (() => {
  const baseUrl = process.env.DHIS2_BASE_URL || 'https://play.dhis2.org/demo';  // default
  const apiVersion = process.env.DHIS2_API_VERSION || 27;                          // default
  const generateHtmlReport = process.env.DHIS2_GENERATE_HTML_REPORT
    ? process.env.DHIS2_GENERATE_HTML_REPORT.toLowerCase() === 'true' : false;

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
    CATEGORY_OPTION_COMBO: 'category option combo',
    CATEGORY: 'category',
    USER_ROLE: 'user role',
    USER: 'user',
    APPLICATION: 'application',
    META_DATA: 'metadata',
    ORGANISATION_UNIT_LEVEL: 'organisation unit level'
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
      case RESOURCE_TYPES.CATEGORY_OPTION_COMBO:
        endpoint = apiEndpoint() + '/categoryOptionCombos';
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
      case RESOURCE_TYPES.META_DATA:
        endpoint = apiEndpoint() + '/metadata';
        break;
      case RESOURCE_TYPES.ORGANISATION_UNIT_LEVEL:
        endpoint = apiEndpoint() + '/organisationUnitLevels';
        break;
      default:
        throw new Error('There is no resource type defined for: ' + resourceType);
    }

    return endpoint;
  };

  return {
    resourceTypes: RESOURCE_TYPES,
    debug: debug,
    baseUrl: () => {
      return baseUrl;
    },
    apiVersion: () => {
      return apiVersion;
    },
    isDockerEnv: () => {
      return baseUrl === 'http://web:8080';
    },
    defaultBasicAuth: AUTH_REQUEST_OBJECT,
    apiEndpoint: apiEndpoint,
    generateHtmlReport: () => {
      return generateHtmlReport;
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
      const url = options.url;
      const requestHeaders = options.headers || {};
      const requestMethod = options.method || 'get';
      let requestData = {};

      if (!url) {
        throw new Error('Url is required!');
      }

      let authentication = null;
      if (!options.authenticationNotNeeded) {         // authentication needed
        if (options.authentication) {                 // not default auth
          authentication = options.authentication;
        } else if (world && world.userUsername && world.userPassword) {
          authentication = {
            username: world.userUsername,
            password: world.userPassword
          };
        } else {                                      // default auth
          authentication = AUTH_REQUEST_OBJECT;
        }
      }

      if (options.requestData) {
        requestData = options.multipartFormRequest
          ? querystring.stringify(options.requestData) : options.requestData;
      }

      debug('URL: ' + url);
      debug('METHOD: ' + requestMethod);
      debug('REQUEST DATA: ' + JSON.stringify(requestData, null, 2));
      debug('AUTH: ' + JSON.stringify(authentication, null, 2));

      return axios({
        headers: requestHeaders,
        method: requestMethod,
        url: url,
        data: requestData,
        auth: authentication
      }).then(function (response) {
        debug('RESPONSE STATUS: ' + response.status);
        debug('RESPONSE DATA: ' + JSON.stringify(response.data, null, 2));
        if (world) {
          world.responseStatus = response.status;
          world.responseData = response.data;
        }

        if (options.onSuccess) {
          return options.onSuccess(response);
        }
      }).catch(function (error) {
        debug('ERROR WAS CAUGHT: ' + url);
        if (error && error.response) {
          debug('RESPONSE STATUS: ' + error.response.status);
          debug('RESPONSE DATA: ' + JSON.stringify(error.response.data, null, 2));

          if (world) {
            world.responseData = error.response.data;
            world.responseStatus = error.response.status;
          }
        }

        if (options.onError) {
          return options.onError(error);
        }

        if (!options.preventDefaultOnError) {
          debug('ERROR WAS THROWN for ' + url + ':' + (error || new Error('Unexpected Error')));
          throw (error || new Error('Unexpected Error'));
        }
      });
    },
    sendMultipleApiRequests: (options) => {
      if (!options.requests || options.requests.length === 0) {
        throw new Error('Requests are required!');
      } else {
        return axios.all(options.requests.filter(Boolean));
      }
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
