const { defineSupportCode } = require('cucumber');
const axios = require('axios');

function CustomWorld ({ parameters }) {
  this.apiEndpoint = parameters.apiEndpoint || 'http://play.dhis2.org/dev/api/27';
  this.authRequestObject = {
    username: 'admin',
    password: 'district'
  };
  this.axios = axios;
  this.axios.defaults.headers.post['Content-Type'] = 'application/json';
}

defineSupportCode(function ({ setWorldConstructor }) {
  setWorldConstructor(CustomWorld);
});
