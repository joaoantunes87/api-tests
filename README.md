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
$ npm test -- --world-parameters  '{"apiEndpoint": "https://play.dhis2.org/demo/api/27"}'
```

## Run tests with Docker

```sh
$ docker-compose up
```
