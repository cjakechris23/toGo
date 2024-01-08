//Create a Dummy account 
Account dummyAccount = new Account();
dummyAccount.Name = 'Dummy';
insert dummyAccount;

// Get the default business hours
BusinessHours bh = [SELECT Id FROM BusinessHours WHERE IsDefault=true limit 1];

//Get the Entitlement Process required
SlaProcess ep = [SELECT Id, description, name From SlaProcess Where Name='AMS Process' order by VersionNumber DESC limit 1];

//Create Entitlement Records   
Entitlement dummyEntitlement = new Entitlement();
dummyEntitlement.AccountId = dummyAccount.Id;
dummyEntitlement.Name = 'AMS Process';  
dummyEntitlement.BusinessHoursId = bh.Id;
dummyEntitlement.StartDate = Date.newInstance(2000, 01, 01);
dummyEntitlement.SlaProcessId = ep.Id;
insert dummyEntitlement;
