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
$ npm test -- --world-parameters "{\"apiEndpoint\":\"https://play.dhis2.org/demo/api/27\",\"generateHtmlReport\":false}"
```

## Run tests with Docker
### Environment Setup
Before starting the Docker environment it is needed to define some variable environments. We have two options:</br>
**Create .env file(example)**
```
DHIS2_GENERATE_HTML_REPORT=false
```

**Define environment variables on terminal(example)**

```sh
$ export DHIS2_GENERATE_HTML_REPORT=false
```

### Start Docker Environment
```sh
$ docker-compose up --build --abort-on-container-exit
```
