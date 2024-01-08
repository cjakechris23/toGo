public with sharing class TR_TaskCounterClass {

    @AuraEnabled(cacheable=true)
    public static integer getTestExecutionRecord(String userId){
    return [SELECT COUNT() FROM TR_Test_Execution__c WHERE TR_Test_Outcome__c = 'Not Executed' AND TR_My_Test_Execution_as_Tester__c = TRUE ];
    }    

    @AuraEnabled(cacheable=true)
    public static integer getMyOwnTickets( String userId){
        return [SELECT COUNT() FROM TR_Ticket__c WHERE TR_Status__c = 'Ready for Testing' AND TR_My_Tickets_as_Tester__c = TRUE];
    }
}