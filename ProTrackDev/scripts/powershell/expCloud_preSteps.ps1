Write-Host "Install Packages for the first time" -ForegroundColor green
$targetOrg = Read-Host -Prompt 'Enter target Org'

Write-Host "Creating ProTrack Experience Cloud" -ForegroundColor yellow
sfdx force:community:create --name 'ProTrack' --urlpathprefix 'protrack'  --templatename 'Partner Central' -u $targetOrg
Write-Host "ProTrack Experience Cloud created" -ForegroundColor green