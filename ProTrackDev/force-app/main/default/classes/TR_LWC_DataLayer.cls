public with sharing class TR_LWC_DataLayer {
  @AuraEnabled(cacheable=true)
  public static List<TR_Test_Execution_Step__c> getTRTestExecutionStepByTestExecutionId(
    Id TestExecutionId
  ) {
    System.debug('TheOTestExecutionIdfficeIs:' + TestExecutionId);
    return [
      SELECT
        Id,
        Name,
        TR_Sequence__c,
        TR_Action__c,
        TR_Expected_Result__c,
        TR_Tips__c,
        TR_Step_Outcome__c,
        TR_Comments__c
      FROM TR_Test_Execution_Step__c
      WHERE TR_Test_Execution__c = :TestExecutionId
      ORDER BY TR_Sequence__c ASC
    ];
  }

  @AuraEnabled
  public static string updateTestExecutionSteps(Object data) {
    List<TR_Test_Execution_Step__c> testExecutionStepsToUpdate = (List<TR_Test_Execution_Step__c>) JSON.deserialize(
         JSON.serialize(data),
         List<TR_Test_Execution_Step__c>.class
    );
    try {
        update testExecutionStepsToUpdate;
        return 'Success: records updated successfully';
    }
    catch (Exception e) {
        return 'The following exception has occurred: ' + e.getMessage();
    }}

  @AuraEnabled(cacheable=true)
  public static List<TR_Ticket__c> getTicketsByTestExecutionId(
    Id TestExecutionId
  ) {
    return [
      SELECT
        Id,
        Name,
        TR_Problem__c,
        TR_Problem_Description__c,
        TR_Status__c,
        TR_Business_Impact__c,
        CreatedDate
      FROM TR_Ticket__c
      WHERE TR_Test_Execution__c = :TestExecutionId
      ORDER BY CreatedDate DESC
    ];
  }

  @AuraEnabled
  public static void createTicket(
    String problem,
    String problemDescription,
    String comments,
    String businessImpact,
    String ticketType,
    String status,
    String testScript,
    String project,
    String loggedBy,
    String testExecution,
    String testPhase,
    String userStory,
    String tester
  ) {
    TR_Ticket__c ticket = new TR_Ticket__c();
    ticket.TR_Problem__c = problem;
    ticket.TR_Problem_Description__c = problemDescription;
    ticket.TR_Functional_Comment__c = comments; 
    ticket.TR_Business_Impact__c = businessImpact;
    ticket.TR_Ticket_Type__c = ticketType;
    ticket.TR_Status__c = status;
    ticket.TR_Test_Script__c = testScript;
    ticket.TR_Project__c = project;
    ticket.TR_Logged_by__c = loggedBy;
    ticket.TR_Test_Execution__c = testExecution;
    ticket.TR_Test_Phase__c = testPhase;
    ticket.TR_User_Story__c = userStory;
    ticket.TR_Tester__c = tester;
    try{
        insert ticket;
    } catch (Exception ex){
        throw new AuraHandledException(ex.getMessage());
    }
  }
}
