DELETE FROM oauth2clientgranttypes;
DELETE FROM oauth2clientredirecturis;
DELETE FROM oauth_access_token;
DELETE FROM oauth_refresh_token;
DELETE FROM oauth2client;
DELETE FROM userrolemembers where userid != (select userid from users where username = 'admin');
DELETE FROM previouspasswords;
DELETE FROM usermembership;
DELETE FROM users WHERE username != 'admin';

DELETE FROM organisationunittranslations;
DELETE FROM organisationunit;

DELETE FROM optionvalue;
DELETE FROM optionset;

DELETE FROM dataset;

DELETE FROM dataelementtranslations;
DELETE FROM dataelement;

/* Organisation Units for Case Tests */
INSERT INTO organisationunit (organisationunitid, uid, name, shortname, created, lastupdated, openingdate) values (1001, 'a1501747207', 'Organisation Unit Testing', 'ORG T', current_timestamp, current_timestamp, current_timestamp);
