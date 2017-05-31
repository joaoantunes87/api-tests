
var {defineSupportCode} = require('cucumber');
function CustomWorld() {
    this.apiEndpoint = "https://play.dhis2.org/dev/";
}

defineSupportCode(function({setWorldConstructor}) {
  setWorldConstructor(CustomWorld);
})
