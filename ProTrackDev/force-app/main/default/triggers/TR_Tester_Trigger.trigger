/* @Description: Tester trigger for FXA
 * @Author: Josephine Del Mundo
 * @Date Created: 12-JUl-2017
 */
trigger TR_Tester_Trigger on TR_Tester__c  (after insert) {
	TR_Tester_TriggerClass.routineAfterInsert(trigger.new);
}