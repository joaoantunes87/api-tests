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
$ npm test -- --world-parameters "{\"baseUrl\":\"https://play.dhis2.org/demo\",\"apiVersion\":27, \"generateHtmlReport\":false}"
```

Available parameters are:

| Name | Default value | Description |
| --- | --- | --- |
| `baseUrl` | Defined inside `utils.js` file | The API host to use to run the tests  |
| `apiVersion` | Defined inside `utils.js` file | The API version to use to run the tests  |
| `generateHtmlReport` | `true` | Whether an HTML report should be generated or not |

## Run tests with Docker

Set the environment variable `DHIS2_GENERATE_HTML_REPORT` to `true` if you want an html report to be generated at reports folder:

```sh
$ export DHIS2_GENERATE_HTML_REPORT=true
```

Define the environment variable `DHIS2_FEATURE` to only execute a specific feature file:

```sh
$ export DHIS2_FEATURE=features/users/users.feature
```

Set the environment `DHIS2_LOG_MODE` to `debug` to log debug messages:

```sh
$ export DHIS2_LOG_MODE=debug
```

Start tests execution:

```sh
$ ./run.sh # or run.bat for Windows
```
