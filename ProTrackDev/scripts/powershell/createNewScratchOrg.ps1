Write-Host "Create new scratch Org" -ForegroundColor green
$targetOrg = Read-Host -Prompt 'Enter New Org Alias'
$sourceOrg = Read-Host -Prompt 'Enter Source Org from where to copy test data'

Write-Host "Creating new scratch org $targetOrg" -ForegroundColor yellow
sfdx force:org:create -f config/project-scratch-def.json -d 30 -a $targetOrg -s -w 30
Write-Host "Finished creating new scratch org $targetOrg" -ForegroundColor green

Write-Host "Deploying pre steps to $targetOrg" -ForegroundColor yellow
sfdx force:source:deploy -p "deploy/oneTimeDeployment/CustomLabels.labels-meta.xml" -u $targetOrg
Write-Host "Finished deploying pre steps to $targetOrg" -ForegroundColor green

Write-Host "Deploying source to $targetOrg" -ForegroundColor yellow
sfdx force:source:push -u $targetOrg -f
Write-Host "Finished deploying source to $targetOrg" -ForegroundColor green

Write-Host "Deploying Entitlements to $targetOrg" -ForegroundColor yellow
sfdx force:source:deploy -p "deploy/entitlementConfig/entitlementProcesses/ams process.entitlementProcess-meta.xml" -u $targetOrg
Write-Host "Finished deploying Entitlements to $targetOrg" -ForegroundColor green

Write-Host "Setting up Entitlement records" -ForegroundColor yellow
sfdx force:apex:execute -f ./scripts/apex/entitlementProcessConfiguration.apex -u $targetOrg
Write-Host "Finished setting up Entitlement records" -ForegroundColor green

Write-Host "Copying test data from $sourceOrg to $targetOrg" -ForegroundColor yellow
sfdx sfdmu:run -s $sourceOrg -u $targetOrg -p ./scripts/sfdmu/
Write-Host "Finished copying test data from $sourceOrg to $targetOrg" -ForegroundColor green

Write-Host "Installing Salesforce KickBoard" -ForegroundColor yellow
sfdx force:package:install --package="04t5e000000NmWZAA0" -u $targetOrg -w 30
Write-Host "Finished installing Salesforce KickBoard" -ForegroundColor green

Write-Host "Opening $targetOrg in browser" -ForegroundColor green
sfdx force:org:open -u $targetOrg
