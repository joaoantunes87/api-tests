'use strict';

module.exports = (() => {
  let apiEndpoint = 'http://play.dhis2.org/dev/api/27'; // default

  return {
    getApiEndpoint: () => {
      return apiEndpoint;
    },
    setApiEndpoint: (newApiEndpoint) => {
      apiEndpoint = newApiEndpoint;
    },
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
      // console.log('URL: ' + url);
      // console.log('METHOD: ' + world.method);
      // console.log('BODY: ' + JSON.stringify(world.requestData));
      return world.axios({
        method: world.method || 'get',
        url: url,
        data: world.requestData || {},
        auth: world.authRequestObject
      });
    },
    generateUrlForOptionSetWithId: (optionSetId) => {
      const url = apiEndpoint + '/optionSets/';
      if (optionSetId) {
        return url.concat(optionSetId);
      }

      return url;
    },
    generateUrlForOrganisationUnitWithId: (organisationUnitId) => {
      const url = apiEndpoint + '/organisationUnits/';
      if (organisationUnitId) {
        return url.concat(organisationUnitId);
      }

      return url;
    }
  };
})();
