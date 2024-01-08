public with sharing class TR_TestExecutionController {
    public TR_TestExecutionController() {

    }
    @AuraEnabled(cacheable=true)
    public static List<TR_Test_Execution__c> getTestExecutions(Integer offSetCount){
        return [
            SELECT Name, 
            TR_Test_Title__c, 
            TR_Deadline__c, 
            TR_Status__c, 
            TR_Ext_Execute_Now__c from TR_Test_Execution__c
            WHERE TR_My_Test_Execution_as_Tester__c = TRUE
            AND TR_Test_Outcome__c = 'Not Executed'
            ORDER BY TR_Deadline__c, Name
            LIMIT 50 OFFSET :offSetCount
        ];
    }
}