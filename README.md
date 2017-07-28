[![Build Status](https://travis-ci.org/dhis2/api-tests.svg?branch=master)](https://travis-ci.org/dhis2/api-tests)

# DHIS2 API Testing

Repository for DHIS2 API Testing.

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
$ npm test -- --tags "not @ignore" --world-parameters "{\"apiEndpoint\":\"https://play.dhis2.org/demo/api/26\",\"generateHtmlReport\":false}"
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
