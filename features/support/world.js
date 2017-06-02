
const {defineSupportCode} = require('cucumber');
function CustomWorld () {
  this.apiEndpoint = 'http://play.dhis2.org/dev/api/26/';
}

defineSupportCode(function ({setWorldConstructor}) {
  setWorldConstructor(CustomWorld);
});
