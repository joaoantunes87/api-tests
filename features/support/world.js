const { defineSupportCode } = require('cucumber');

function CustomWorld ({ parameters }) {
  this.apiEndpoint = parameters.apiEndpoint || 'http://play.dhis2.org/dev/api/27';
}

defineSupportCode(function ({ setWorldConstructor }) {
  setWorldConstructor(CustomWorld);
});
