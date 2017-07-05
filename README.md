# DHIS2 API Testing

Repository for DHIS2 API Testing.

## Running tests

The available CLI commands are described below.

### Install NPM dependencies

```sh
$ npm install
```

### Run tests without Docker

Run with the default API endpoint:

```sh
$ npm test
```

Override the default API endpoint:

```sh
$ npm test -- --world-parameters  '{"apiEndpoint": "http://play.dhis2.org/dev/api/27"}'
```

### Run tests with
```sh
$ docker-compose up
```
