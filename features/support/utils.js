'use strict';

module.exports = {
  apiEndpoint: 'http://play.dhis2.org/dev/api/27',            // default
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
  }
};
