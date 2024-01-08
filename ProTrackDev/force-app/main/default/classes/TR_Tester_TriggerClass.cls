/***************************************************************************************************************************
 * Name:        FXA_Tester_TriggerClass
 * Description: The class used by the trigger FXA_Tester_Trigger 
 *              on TR_Tester__c to handle logical operations 
 *              for dml operations
 *
 * Version History
 * Date             Developer               Comments
 * ---------------  --------------------    --------------------------------------------------------------------------------
 * 12/07/2017       Josephine Del Mundo             Created   
 ****************************************************************************************************************************/
public without sharing class TR_Tester_TriggerClass {  
    /*  Description: creates TR_Test_Execution__c and TR_Test_Execution_Step__c records
     *  Author: Del Mundo, Josephine
     *  Date Created: 12-JUL-2017
     *  Input Parameters: list<TR_Tester__c> 
     *  Return: none
     */    
    public static void routineAfterInsert(list<TR_Tester__c> trigger_new) {
        List<TR_Test_Execution__c> execList = new List<TR_Test_Execution__c>();
        List<TR_Test_Execution_Step__c> stepcList = new List<TR_Test_Execution_Step__c>();
        Set<Id> scriptIds = new Set<Id>();
        
        for(TR_Tester__c rec : trigger_new){
            scriptIds.add(rec.TR_Test_Template__c);
        }
        
        Map<Id, TR_Test_Script__c> scriptMap = new Map<Id,TR_Test_Script__c>([SELECT TR_Project__c,TR_User_Story__c
                                                        FROM TR_Test_Script__c WHERE Id IN :scriptIds]);
                                                        
        Map<Id, TR_User_Story__c> userMap = new Map<Id, TR_User_Story__c>(); 
        if(!scriptMap.isEmpty()){
            Set<Id> userStoryIds = new Set<Id>();
            for(TR_Test_Script__c rec :  scriptMap.values()){
                if(rec.TR_User_Story__c != null) userStoryIds.add(rec.TR_User_Story__c);
            }
            
            Map<Id, TR_User_Story__c> userStorySprintId = new Map<Id, TR_User_Story__c>([SELECT TR_Allocated_Sprint__c 
                                                             FROM TR_User_Story__c
                                                             WHERE Id IN: userStoryIds]);
                                                             
            List<TR_Test_Script_Step__c> testScriptList = new List<TR_Test_Script_Step__c>([SELECT Name,TR_Action_Long__c,
                                                                TR_Action__c,TR_Expected_Result__c,TR_Ranked_Sequence__c,
                                                                TR_Sequence_Last_Updated_By__c,TR_Test_Script__c,
                                                                TR_Tester_Role__c
                                                                FROM TR_Test_Script_Step__c
                                                                WHERE TR_Test_Script__c IN:scriptIds]);
            for(TR_Tester__c rec : trigger_new){
                if(!scriptMap.isEmpty() && scriptMap.containsKey(rec.TR_Test_Template__c)){
                execList.add(new TR_Test_Execution__c(TR_Template__c = rec.TR_Test_Template__c,
                            TR_User_Story__c = (scriptMap.get(rec.TR_Test_Template__c).TR_User_Story__c),
                            TR_Project__c = (scriptMap.get(rec.TR_Test_Template__c).TR_Project__c),
                            TR_Tester__c = rec.TR_User__c,
                            TR_Test_Phase__c = rec.TR_Test_Phase__c,
                            TR_Tester_Relationship__c = rec.Id,
                            TR_Sprint__c = (userStorySprintId.containsKey(scriptMap.get(rec.TR_Test_Template__c).TR_User_Story__c) 
                                            ? userStorySprintId.get(scriptMap.get(rec.TR_Test_Template__c).TR_User_Story__c).TR_Allocated_Sprint__c 
                                            : null)));
                }
            }
            
            if(!execList.isEmpty()){
                insert execList;
                
                for(integer i = 0; i< execList.size(); i++){
                    for(TR_Test_Script_Step__c rec : testScriptList){
                        stepcList.add(new TR_Test_Execution_Step__c(TR_Test_Execution__c = execList[i].Id,
                                                                    TR_Template_Step__c = rec.Id,
                                                                    TR_Expected_Result__c = rec.TR_Expected_Result__c,
                                                                    TR_Action__c = rec.TR_Action__c,
                                                                    TR_Tester_Role__c = rec.TR_Tester_Role__c));    
                    }
                }
                if(!stepcList.isEmpty()){
                    insert stepcList;
                }
                
            }
        }
    }//end of routineAfterInsert
    
    
}