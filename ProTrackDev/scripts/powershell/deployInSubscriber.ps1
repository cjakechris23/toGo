Write-Host "Deploy Tracker Light Package to an existing or new subscriber" -ForegroundColor green
$targetOrg = Read-Host -Prompt 'Enter Target Org Alias'
$packageVersionId = Read-Host -Prompt 'Enter Package Version ID to be deployed in Target Org'
$password = Read-Host -Prompt 'Enter Package Version Password'

Write-Host "Deploying Package Version $packageVersionId into $targetOrg" -ForegroundColor yellow
sfdx force:package:install -p $packageVersionId -u $targetOrg -w 30 -k $password -r -s AllUsers
Write-Host "Finished installing package in $targetOrg" -ForegroundColor green

Write-Host "Deploying components non compatible with Unlocked Packages to $targetOrg" -ForegroundColor yellow
sfdx force:source:deploy -p ./force-app/main/default/profiles -w 30 -u $targetOrg
Write-Host "Finished deploying components to $targetOrg" -ForegroundColor green

Write-Host "Opening $targetOrg in browser" -ForegroundColor green
sfdx force:org:open -u $targetOrg
