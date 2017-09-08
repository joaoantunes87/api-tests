[![Build Status](https://travis-ci.org/dhis2/api-tests.svg?branch=master)](https://travis-ci.org/dhis2/api-tests)

# DHIS2 API Testing

Repository for DHIS2 API Testing.

## Technology stack

* [Cucumber](https://cucumber.io/): Framework for test automation using Behaviour Driven Development
* [Axios](https://github.com/mzabriskie/axios): Promise based HTTP client for Node.js used to execute HTTP requests to DHIS2 REST API
* [Chaijs](http://chaijs.com/): BDD/TDD assertion library
* [Cucumber-html-report](https://github.com/gkushang/cucumber-html-reporter): Library used to generate HTML report after all test cases are executed
* [Docker](https://www.docker.com/): Used to bootstrap a clean environment which executes all case tests using an isolated web application for the REST API and a custom database

## How to add new tests

1. Create a [Gherkin](https://cucumber.io/docs/reference) file inside `features` folder. A new folder should be created for each individual module (e.g. `/features/organisation_units` for organisation unit related test cases)
2. Create a JavaScript file inside  `step_definitions` folder to execute the steps defined on the previous point. Check [Cucumber.js documentation](https://github.com/cucumber/cucumber-js) for more details

## Tests Execution

Set the environment variable `DHIS2_GENERATE_HTML_REPORT` to `false` to skip the HTML report generation:

```sh
$ export DHIS2_GENERATE_HTML_REPORT=false
```

Define the environment variable `DHIS2_FEATURE` to only execute a specific feature file:

```sh
$ export DHIS2_FEATURE=features/users/users.feature
```

Set the environment `DHIS2_LOG_MODE` to `debug` to log debug messages:

```sh
$ export DHIS2_LOG_MODE=debug
```

Set the environment `DHIS2_API_VERSION` to desired api version to be tested:

```sh
$ export DHIS2_API_VERSION=27
```

Start tests execution:

```sh
$ ./run.sh # or run.bat for Windows
```

## Local Execution
A local execution should not be used since it will not guarantee an expected state of DHIS2 Web Application for the tests. However, you might use it following these directions:

Make sure you have the required NPM dependencies installed:

```sh
$ npm install
```

Run tests with the default API endpoint:

```sh
$ npm test
```

Run tests overriding the default API endpoint:
<br>Set the environment `DHIS2_BASE_URL` to desired DHIS2 Web endpoint:

```sh
$ export DHIS2_BASE_URL=https://play.dhis2.org/demo
```

```sh
$ npm test
```

All environment variables mentioned before might be used.
