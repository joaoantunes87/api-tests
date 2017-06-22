const { defineSupportCode } = require('cucumber');
const dhis2 = require('./utils.js');
const axios = require('axios');

function CustomWorld ({ parameters }) {
  if (parameters.apiEndpoint) {
    dhis2.apiEndpoint = parameters.apiEndpoint;
  }

  this.authRequestObject = {
    username: 'admin',
    password: 'district'
  };
  this.axios = axios;
  this.axios.defaults.headers.post['Content-Type'] = 'application/json';
  this.axios.defaults.headers.post['Accept'] = 'application/json';
}

defineSupportCode(function ({ setWorldConstructor, Before }) {
  setWorldConstructor(CustomWorld);

  Before(function () {
    // auxiliar var for assertions
    this.requestData = {};                // body request
    this.resourceId = null;               // id of resource for test
    this.updatedDataToAssert = {};        // information to be asserted in later steps
    this.responseStatus = null;           // http status returned on previous request
    this.responseData = {};               // http response body returned on previous request
    this.errorResponse = null;            // axios error returned on previous promise
    this.method = null;                   // http method to be used in later request
  });
});
