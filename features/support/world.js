const { defineSupportCode } = require('cucumber');
const axios = require('axios');

function CustomWorld ({ parameters }) {
  this.apiEndpoint = parameters.apiEndpoint || 'http://play.dhis2.org/dev/api/27';
  this.momentDateFormat = 'YYYY-MM-DD';
  this.authRequestObject = {
    username: 'admin',
    password: 'district'
  };
  this.axios = axios;
  this.axios.defaults.headers.post['Content-Type'] = 'application/json';
  this.axios.defaults.headers.post['Accept'] = 'application/json';
}

defineSupportCode(function ({ setWorldConstructor }) {
  setWorldConstructor(CustomWorld);
});
