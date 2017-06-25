const { defineSupportCode } = require('cucumber');
const axios = require('axios');

function CustomWorld ({ parameters }) {
  this.apiEndpoint = parameters.apiEndpoint || 'https://play.dhis2.org/demo/api/26';
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
