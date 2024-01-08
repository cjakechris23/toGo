/* @Description: 
 * @Author: Josephine Del Mundo
 * @Date Created: 28-JUl-2017
 */
trigger TR_Test_Script_Step_Trigger on TR_Test_Script_Step__c (after insert, after update) {
    TR_Test_Script_Step_TriggerClass.routineAfterUpsert(trigger.new, trigger.oldMap);
}