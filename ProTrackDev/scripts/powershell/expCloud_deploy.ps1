Write-Host "Install Packages for the first time" -ForegroundColor green
$targetOrg = Read-Host -Prompt 'Enter target Org'

Write-Host "Publish ProTrack Experience Cloud" -ForegroundColor yellow
sfdx force:source:deploy -p ./deploy/expCloudConfig/source/main/default/ -u $targetOrg -w 100
Write-Host "Publish Experience Cloud created" -ForegroundColor green

Write-Host "Publish ProTrack Experience Cloud" -ForegroundColor yellow
sfdx force:community:publish --name 'ProTrack' -u $targetOrg
Write-Host "Publish Experience Cloud created" -ForegroundColor green