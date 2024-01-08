# About ProTrack SEA

Trcker SEA is a package crated by Deloitte SEA to help customers that do not have project methodologies tools  so we can provide a tool where we can track user stories, tickets and test scripts. This tool is often installed in a sandbox of the client

# PRE Manual Steps

 Experience Cloud pre manual steps (to be executed only if the org has communicty cloud licenses):
 - Enable Digital Experience (setup -> Digital Experiences -> Settings -> "Enable Digital Experiences")
 - Fill in a sub domain (something like "external-site")

Before installing the unlocked package (contct jsolerburguera@deloitte.com please make sure that you have enabled the following settings) :
 - Chatter (setup -> Chatter Settings -> Check the checkbox "Enabled")
 - Chatter Update their own modificaitons (setup -> Chatter Settings -> Post and Comment Modification)
 - Path  (setup -> Path Settings -> Click on "Enable")
 - Create a custom label TR_exp_cloud_base_url that will contain the URL of the Community (Setup -> Custom Labels -> "New Custom Label")
    - Short Description : ProTrack Exp Cloud Base URL
    - Name: TR_exp_cloud_base_url
    - Value: {The experience cloud URL with the sub domain that has been setup in the previous step, like in the following format: "https://protrack-developer-edition.na213.force.com". If no experience cloud has been deployed, create anyways the custom label and put any random value on it}

 Entitlement pre manual steps: 
 - Entitlements (setup -> Entitlement Settings -> Check checkbox "Enable Entitlement Management")
 - Entitlement Versioning (setup -> Entitlement Settings -> Check checkbox "Enable Entitlement Versioning")


# First Deployment

  - Intall the package in the target org by running the following command: 
 ```./scripts/powershell/deployInSubscriber.ps1```

  - Install all the external packages: 
```./scripts/powershell/installPackages.ps1```

  - If you want to create Entitlement Process in sandbox or target ProTrack sandbox, run the following script: 
 ```./scripts/powershell/setupEntitlementsinSubscriber.ps1```

  - If you want to deploy Experience Cloud for Testers, run the following scripts:
 ```./scripts/powershell/expCloud_preSteps.ps1```

 then once the site is publisher run the following: 
 ```./scripts/powershell/expCloud_deploy.ps1```

# Publishing Packages
To publish a new version of the unlocked package, make sure in VS Code you checked out from develop branch. Then you run the following command: 
```./scripts/powershell/createNewPackageVersion.ps1```
This will create a new package version of Tracker. You will be able to retrie the Subscriber Package Version Id, that you can paste into the Release record in Tracker. This ID is very important because we will need it as an identifier to deploy this specific version of Tracker in our target orgs later on.

# Upgrading Packages
To upgrade the package in a subscriber org, request for the last version of the package sf-protrack (you can also check in master branch) :
```sfdx force:package:version:list```
Then run the following command: 
```./scripts/powershell/deployInSubscriber.ps1```

# Scratch Org Creation
To create a scratch org for development of new user stories, make sure you have Powershell installed installed in your machine. Then checkout / refresh from remote develop branch in your VS Code and run the following command:
```./scripts/powershell/createNewScratchOrg.ps1```
