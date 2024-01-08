/***************************************************************************************************************************
 * Name:        FXA_Tester_TriggerClass
 * Description: The class used by the trigger TR_Test_Script_Step_Trigger
 *              on TR_Test_Script_Step__c to handle logical operations 
 *              for dml operations
 *
 * Version History
 * Date             Developer               Comments
 * ---------------  --------------------    --------------------------------------------------------------------------------
 * 28/07/2017       Josephine Del Mundo             Created   
 ****************************************************************************************************************************/
public without sharing class TR_Test_Script_Step_TriggerClass {  
    
    public static void routineAfterUpsert(list<TR_Test_Script_Step__c> newRecords, Map<Id, TR_Test_Script_Step__c> oldMap) {
        Map<Id,TR_Test_Script_Step__c> scriptStepMap = new Map<Id, TR_Test_Script_Step__c>();
        for(TR_Test_Script_Step__c step : newRecords){
            if((oldMap == null || step.TR_Action__c != oldMap.get(step.Id).TR_Action__c)){
                scriptStepMap.put(step.Id, step);
            }
            if((oldMap == null || step.TR_Expected_Result__c != oldMap.get(step.Id).TR_Expected_Result__c)){
                scriptStepMap.put(step.Id, step);
            }
        }
  
        if(!scriptStepMap.isEmpty()){
            List<TR_Test_Execution_Step__c> execStepList = new List<TR_Test_Execution_Step__c>();
            List<TR_Test_Execution_Step__c> execstepRecs = [SELECT Id, TR_Action__c,TR_Template_Step__c,TR_Expected_Result__c
                                                            FROM TR_Test_Execution_Step__c
                                                            WHERE TR_Template_Step__c IN :scriptStepMap.keySet()];
            if(!execstepRecs.isEmpty()){
                for(TR_Test_Execution_Step__c rec : execstepRecs){
                    rec.TR_Action__c = scriptStepMap.get(rec.TR_Template_Step__c).TR_Action__c;
                    rec.TR_Expected_Result__c = scriptStepMap.get(rec.TR_Template_Step__c).TR_Expected_Result__c;
                    execStepList.add(rec);
                }
            }

            update execStepList;
        }
                                                       
    }
}