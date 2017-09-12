Feature: Manage DHIS2 apps
As as user of DHIS2
I want to be able to manage the apps in the system

    Background:
      Given that I am logged in

    @createUser
    Scenario: Add an app without permissions
      Given I have an application file at "dhis2-valid-app.zip"
      When I submit that application to the server
      Then I should be informed I have no permission to do that operation.

    Scenario: Add an app
      Given that I have the necessary permissions to manage apps
      And I have an application file at "dhis2-valid-app.zip"
      When I submit that application to the server
      Then I should be informed that the application was created successfully
      And I should be able find the application called "DHIS2 Empty App".

    Scenario: Install an app which is not in ZIP format
      Given that I have the necessary permissions to manage apps
      And I have an application file at "dhis2-valid-app.rar"
      When I submit that application to the server
      Then I should be informed that the application is invalid
      And receive the application error message "Zip file could not be read".

    Scenario: Install an app without a manifest
      Given that I have the necessary permissions to manage apps
      And I have an application file at "dhis2-app-no-manifest.zip"
      When I submit that application to the server
      Then I should be informed that the application is invalid
      And receive the application error message "Zip file requires a manifest file".

    Scenario: Install a with invalid manifest file
      Given that I have the necessary permissions to manage apps
      And I have an application file at "dhis2-app-invalid-manifest.zip"
      When I submit that application to the server
      Then I should be informed that the application is invalid
      And receive the application error message "Invalid JSON in app manifest file".

    Scenario: Delete an app
      Given that I have the necessary permissions to manage apps
      And I have an application file at "dhis2-valid-app.zip"
      And I submit that application to the server
      When I delete the application with key "dhis2-valid-app.zip"
      Then I should be informed that the application was delete successfully
      And I should not be able find the application called "DHIS2 Empty App".
