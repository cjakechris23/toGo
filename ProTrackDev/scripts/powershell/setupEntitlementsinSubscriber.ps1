Write-Host "Deploys Entitlement Process in Tracker Target Org. Needs to have Tracker already installed" -ForegroundColor green
$targetOrg = Read-Host -Prompt 'Enter Target Org Alias'

Write-Host "Deploying Entitlements to $targetOrg" -ForegroundColor yellow
sfdx force:source:deploy -p ./force-app/main/default/standardValueSets/ -w 30 -u $targetOrg
sfdx force:source:deploy -p ./force-app/main/default/objectTranslations/ -w 30 -u $targetOrg
sfdx force:source:deploy -p ./force-app/main/default/settings/BusinessHours.settings-meta.xml -w 30 -u $targetOrg
sfdx force:source:deploy -p ./force-app/main/default/objects/Case/businessProcesses/ -w 30 -u $targetOrg
sfdx force:source:deploy -p ./force-app/main/default/objects/Case/Case.object-meta.xml -w 30 -u $targetOrg
sfdx force:source:deploy -p "deploy/entitlementConfig/entitlementProcesses/ams process.entitlementProcess-meta.xml" -u $targetOrg
Write-Host "Finished deploying Entitlements to $targetOrg" -ForegroundColor green

Write-Host "Setting up Entitlement records" -ForegroundColor yellow
sfdx force:apex:execute -f ./scripts/apex/entitlementProcessConfiguration.apex -u $targetOrg
Write-Host "Finished setting up Entitlement records" -ForegroundColor green