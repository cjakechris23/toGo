public with sharing class TR_RunTestExecution_Controller {
    
    @AuraEnabled
    public static TR_Test_Execution__c retrieveTestExecutionData(Id testExecutionId) {
        TR_Test_Execution__c testExecution = [
            SELECT Id, Name,TR_Project__c, TR_Sprint__c, TR_Template__c, TR_User_Story__c, TR_Test_Phase__c
            FROM TR_Test_Execution__c WHERE Id =: testExecutionId LIMIT 1
        ];
       
        return testExecution;
        
    }

    @AuraEnabled
    public static List<Id> retrieveTestStepsIds(Id testExecutionId) {
        Map<Id, TR_Test_Execution_Step__c> stepMap = retrieveTestStepsMap(testExecutionId);
        List<Id> stepIdList = new List<Id>(stepMap.keyset());

        return stepIdList;
    }
    @AuraEnabled
    public static Map<ID, TR_Test_Execution_Step__c> retrieveTestStepsMap(Id testExecutionId) {
        Map<Id, TR_Test_Execution_Step__c> stepMap = new Map<Id, TR_Test_Execution_Step__c>();
        
        for(TR_Test_Execution_Step__c testStep:[
            SELECT TR_Sequence__c,Name,TR_Action__c,TR_Expected_Result__c, TR_Step_Outcome__c,TR_Comments__c,TR_Tips__c,Id,TR_Tester_Role__c
            FROM TR_Test_Execution_Step__c 
            WHERE TR_Test_Execution__c =: testExecutionId
            ORDER BY TR_Sequence__c ASC]){

            stepMap.put(testStep.id,testStep);
            
        }

        
        return stepMap;
        
    }
    @AuraEnabled
    public static List<Id> retrieveTestTicketIds(Id testScriptId) {
        Map<Id, TR_Ticket__c> ticketMap = retrieveTestTicketsMapbyTestScript(testScriptId);
        List<Id> ticketIdList = new List<Id>(ticketMap.keyset());
        return ticketIdList;
        
    }
    @AuraEnabled
    public static List<Id> retrieveTestTicketIdsbyExecution(Id testExecutionId) {
        Map<Id, TR_Ticket__c> ticketMap = retrieveTestTicketsMapbyExecution(testExecutionId);
        List<Id> ticketIdList = new List<Id>(ticketMap.keyset());
        return ticketIdList;
        
    }
    @AuraEnabled
    public static Map<ID, TR_Ticket__c> retrieveTestTicketsMapbyTestScript(Id testScriptId) {
        Map<Id, TR_Ticket__c> stepMap = new Map<Id, TR_Ticket__c>();
        
        for(TR_Ticket__c testTicket:[
            SELECT Id, Name
            FROM TR_Ticket__c 
            WHERE TR_Test_Script__c =: testScriptId]){

            stepMap.put(testTicket.id,testTicket); 
        }
        return stepMap;
    }
    @AuraEnabled
    public static Map<ID, TR_Ticket__c> retrieveTestTicketsMapbyExecution(Id testExecutionId) {
        Map<Id, TR_Ticket__c> ticketMap = new Map<Id, TR_Ticket__c>();
        
        for(TR_Ticket__c testTicket:[
            SELECT Id, Name
            FROM TR_Ticket__c 
            WHERE TR_Test_Execution__c =: testExecutionId]){

            ticketMap.put(testTicket.id,testTicket); 
        }

        return ticketMap;
    }
    @AuraEnabled
    public static String retrieverelatedTestScriptIds(Id testExecutionId) {
        Id templateId = [
            SELECT TR_Template__c 
            FROM TR_Test_Execution__c 
            WHERE Id =: testExecutionId 
        ].TR_Template__c;
       
        return templateId;
        
    }

    @AuraEnabled
    public static void updateTestExecutionStatustoStarted(Id testExecutionStepId) {
        system.System.debug('testExecutionStepId');
        system.System.debug(testExecutionStepId);
        Id execId = [SELECT TR_Test_Execution__c FROM TR_Test_Execution_Step__c WHERE Id =: testExecutionStepId].TR_Test_Execution__c;
        
        system.System.debug('execId');
        system.System.debug(execId);

        TR_Test_Execution__c testExec= new TR_Test_Execution__c();

        testExec = [SELECT Id, TR_Status__c FROM TR_Test_Execution__c WHERE Id =: execId LIMIT 1];
        
        if(testExec.TR_Status__c != 'Started'){
            testExec.TR_Status__c = 'Started';
        }

        update testExec;
        
    }
}
