Write-Host "Create new Package Version" -ForegroundColor green
$password = Read-Host -Prompt 'Enter Package password'

Write-Host "Creating new package" -ForegroundColor yellow
sfdx force:package:version:create -p sf-protrack --skipvalidation -k $password -w 60
Write-Host "Finished installing package in $targetOrg" -ForegroundColor green

