Feature: Manage DHIS2 apps
As as user of DHIS2
I want to be able to manage the apps in the system

    Background:
      Given that I am logged in
      And that I have the necessary permissions to manage apps
    @ignore
    Scenario: Add an app
      Given I have a valid application ZIP file at "dhis2-clippy-app.zip"
      When I submit that application to the server
      Then I should be informed that the application was created successfully
      And I should be able to open the application.

    Scenario: Install an app which is not in ZIP format
      Given I have an application which is not a valid ZIP file at "dhis2-clippy-app.html"
      When I submit that application to the server
      Then I should be informed that the application is invalid
      And receive the application error message "Zip file could not be read".
    @ignore
    Scenario: Install an app without a manifest
      Given I have an application without a manifest at "dhis2-clippy-app-no-manifest.zip"
      When I submit that application to the server
      Then I should be informed that the application is invalid
      And receive the application error message "Zip file requires a manifest file".
    @ignore
    Scenario: Delete an app
      Given I have an application using ZIP file called "dhis2-clippy-app.zip"
      When I delete the app
      Then the server should inform me the app was deleted
      And I should not be able to open the application.
