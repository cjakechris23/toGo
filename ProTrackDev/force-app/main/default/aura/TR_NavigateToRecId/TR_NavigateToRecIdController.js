({ 
    init : function(component, event, helper) { 
        console.log('Nav ComponentCall');
        console.log(component.get("v.recId"));
        var url = "/lightning/r/TR_Test_Script__c/"+component.get("v.recId")+"/view";
        console.log('Nav before fire');
        console.log(url);
        window.location.href = url;
    } 
})