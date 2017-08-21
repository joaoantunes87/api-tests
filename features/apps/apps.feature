Feature: Manage DHIS2 apps
As as user of DHIS2
I want to be able to manage the apps in the system

    Background:
      Given that I am logged in
      And that I have the necessary permissions to add and delete apps

    Scenario: Upload an app which is not in  ZIP format
        When I upload an app which is not a valid ZIP file
        Then I should see an error message
        And I should not be able to open the app.

    Scenario: Add an app without a manifest
        Given I have created an app without a manifest
        And I package the app in a file format other than ZIP
        When I upload the app to the server
        Then I should see an error message
        And I should not be able to open the app.

    Scenario: Add an app
        Given I have created an app with a manifest and homepage
        And I package the app as a ZIP file
        When I upload the app to the server
        Then the server should inform me that the app was installed
        And I should be able to open the app. 

    Scenario: Delete an app
        Given I have added an app to the server
        When I delete the app
        Then the server should inform me the app was deleted
        And I should not be able to open the app.