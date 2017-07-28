[![Build Status](https://travis-ci.org/dhis2/api-tests.svg?branch=master)](https://travis-ci.org/dhis2/api-tests)

# DHIS2 API Testing

Repository for DHIS2 API Testing.

# Technology Stack
* [Cucumber](https://cucumber.io/): Framework for test automation using Behaviour Driven Development;
* [Axios](https://github.com/mzabriskie/axios): Promise based HTTP client for node.js used to execute HTTP requests to DHIS2 REST API;
* [Chaijs](http://chaijs.com/): BDD/TDD assertion library;
* [Cucumber-html-report](https://github.com/gkushang/cucumber-html-reporter): Library used to generate HTML report after all test cases are executed;
* [Docker](https://www.docker.com/): Used to bootstrap a clean environment which executes all case tests using an isolated web application for the REST API and a custom database;

# How to add Test Cases
1. Create [Gherkin](https://cucumber.io/docs/reference) file at features folder. If it is a new module create a specific folder for that. For example **/features/organisation_units** for organisation unit related test cases;
2. Create a javascript file at **step_definitions** folder to execute steps defined on previous point. Check **cucumber-js** documentation [here](https://github.com/cucumber/cucumber-js);

## Run tests locally

Make sure you have the required NPM dependencies installed:

```sh
$ npm install
```

Run tests with the default API endpoint:

```sh
$ npm test
```

Run tests overriding the default API endpoint:

```sh
$ npm test -- --world-parameters "{\"apiEndpoint\":\"https://play.dhis2.org/demo/api/26\",\"generateHtmlReport\":false}"
```

Available parameters are:

| Name | Default value | Description |
| --- | --- | --- |
| `apiEndpoint` | Defined inside `utils.js` file | The API endpoint to use to run the tests  |
| `generateHtmlReport` | `true` | Whether an HTML report should be generated or not |

## Run tests with Docker

Set the environment variable `DHIS2_GENERATE_HTML_REPORT` to `false` to skip the HTML report generation:

```sh
$ export DHIS2_GENERATE_HTML_REPORT=false
```

Start Docker:

```sh
$ docker-compose up --build --abort-on-container-exit
```
