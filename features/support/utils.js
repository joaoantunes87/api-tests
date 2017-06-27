'use strict';

module.exports = (() => {
  let apiEndpoint = 'https://play.dhis2.org/demo/api/26'; // default
  const RESOURCE_TYPES = {
    OPTION_SET: 'option set',
    DATA_ELEMENT: 'data element',
    ORGANISATION_UNIT: 'organisation unit'
  };

  return {
    getApiEndpoint: () => {
      return apiEndpoint;
    },
    setApiEndpoint: (newApiEndpoint) => {
      apiEndpoint = newApiEndpoint;
    },
    resourceTypes: RESOURCE_TYPES,
    generateUniqIds: (numberOfIds) => {
      const currentTimestamp = Math.floor(Date.now() / 100);    // 11 digits
      const ids = [];
      const numberOfIdsTemp = numberOfIds || 1;
      for (let seed = 0; seed < numberOfIdsTemp; seed++) {
        ids.push(currentTimestamp - seed);
      }

      return numberOfIds ? ids : ids[0];
    },
    authorityExistsInUserRoles: (authority, userRoles = []) => {
      if (authority && userRoles.length > 0) {
        for (const index in userRoles) {
          const authorities = userRoles[index].authorities || [];
          if (authorities.includes(authority)) {
            return true;
          }
        }
      }

      return false;
    },
    initializePromiseUrlUsingWorldContext: (world, url) => {
      return world.axios({
        method: world.method || 'get',
        url: url,
        data: world.requestData || {},
        auth: world.authRequestObject
      });
    },
    generateUrlForResourceTypeWithId: (resourceType, resourceId) => {
      let url = '';
      switch (resourceType) {
        case RESOURCE_TYPES.OPTION_SET:
          url = apiEndpoint + '/optionSets/';
          break;
        case RESOURCE_TYPES.ORGANISATION_UNIT:
          url = apiEndpoint + '/organisationUnits/';
          break;
        case RESOURCE_TYPES.DATA_ELEMENT:
          url = apiEndpoint + '/dataElements/';
          break;
        default:
          throw new Error('There is no resource type defined for: ' + resourceType);
      }

      if (resourceId) {
        return url.concat(resourceId);
      }

      return url;
    }
  };
})();
