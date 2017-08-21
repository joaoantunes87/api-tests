Feature: Manage DHIS2 apps
As as user of DHIS2
I want to be able to manage the apps in the system

    Background:
      Given that I am logged in
      And that I have the necessary permissions to manage apps

      Scenario: Add an app
        Given I have a valid application ZIP file called "dhis2-clippy-app.zip"
        When I submit that application to the server
        Then I should be informed that the application was created successfully
        And I should be able to open the app.

    Scenario: Install an app which is not in ZIP format
        Given I try to install an app which is not a valid ZIP file using file "dhis2-clippy-app.html"
        When I submit that application to the server
        Then I should be informed that the application is invalid
        And receive the message "Zip file could not be read".

    Scenario: Install an app without a manifest
        Given I try to install an app without a manifest using file "dhis2-clippy-app-no-manifest.zip"
        When I submit that application to the server
        Then I should be informed that the application is invalid
        And receive the message "Zip file requires a manifest file".

    Scenario: Delete an app
        Given I have an application using ZIP file called "dhis2-clippy-app.zip"
        When I delete the app
        Then the server should inform me the app was deleted
        And I should not be able to open the app.
