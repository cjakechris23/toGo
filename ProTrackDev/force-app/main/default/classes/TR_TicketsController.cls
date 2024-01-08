public with sharing class TR_TicketsController {
    public TR_TicketsController() {

    }
    @AuraEnabled(cacheable=true)
    public static List<TR_Ticket__c> getTickets(Integer offsetCount){
        return [
            SELECT TR_NameHyperLink__c, 
            Name, TR_User_Story__c, 
            TR_Project__c, 
            TR_Status__c, 
            TR_Business_Impact__c, 
            TR_Ext_View_Ticket__c, 
            TR_Problem__c from TR_Ticket__c 
            WHERE TR_Status__c = 'Ready for Testing' 
            AND TR_My_Tickets_as_Tester__c = TRUE
            ORDER BY Name
            LIMIT 50 offset:offsetCount
        ];
    }
}