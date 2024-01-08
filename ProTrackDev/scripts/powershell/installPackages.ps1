Write-Host "Install Packages for the first time" -ForegroundColor green
$targetOrg = Read-Host -Prompt 'Enter target Org'

Write-Host "Installing Salesforce KickBoard" -ForegroundColor yellow
sfdx force:package:install --package="04t5e000000NmWZAA0" -u $targetOrg -w 30
Write-Host "Finished installing Salesforce KickBoard" -ForegroundColor green