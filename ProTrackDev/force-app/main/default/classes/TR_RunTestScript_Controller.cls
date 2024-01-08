public class TR_RunTestScript_Controller {

    private final TR_Test_Execution__c texec;
    public List<TR_Test_Execution_Step__c> TestSp{get;set;}
    public List<TR_Ticket__c> bugs{get;set;}
    public boolean isnewBugs{get;set;}
    public string testId{get;set;}
    public string testName{get;set;}
    public boolean stepsComplete{get;set;}
    private Id projectId;
    public TR_Test_Script__c template{get;set;}
    private static final string defaultTicketStat = 'Raised';
    private list<String> texecFields; 
    private Id testUserId;
    public string testerRole {get;set;}
    
    public TR_RunTestScript_Controller(ApexPages.StandardController stdController) {
        stdController.addFields(new list<String>{'TR_Template__c','TR_Test_Phase__c','TR_Tester__c','Id'});
        this.texec = (TR_Test_Execution__c)stdController.getRecord();
        projectId = [SELECT TR_Project__c FROM TR_Test_Execution__c WHERE Id =: this.texec.Id].TR_Project__c;
        TestSp = [SELECT TR_Sequence__c,Name,TR_Action__c,TR_Expected_Result__c,TR_Step_Outcome__c,TR_Comments__c,TR_Tips__c,Id,
                         TR_Tester_Role__c
                  FROM TR_Test_Execution_Step__c WHERE TR_Test_Execution__c =: this.texec.Id
                  ORDER BY TR_Sequence__c ASC];
        if(TestSP.isEmpty() || TestSp == null){ TestSp = new List<TR_Test_Execution_Step__c>();}
        bugs = new List<TR_Ticket__c>();
        template = [SELECT Id,TR_User_Story__r.Id,TR_User_Story__r.TR_Allocated_Sprint__c,TR_Tester_Role__c
                    FROM TR_Test_Script__c WHERE Id =: this.texec.TR_Template__c];
        testUserId = [SELECT Id FROM TR_Tester__c
                      WHERE TR_User__c =: this.texec.TR_Tester__c
                      AND TR_Test_Template__c =: this.texec.TR_Template__c
                      LIMIT 1].Id;
        isnewBugs = false;
        testId = '';
        testName = '';
        stepsComplete = false;
    }
    
    public void addBug(){
        isnewBugs = true;
        bugs.add(new TR_Ticket__c());
        testId =  System.currentPageReference().getParameters().get('testId');
        if(bugs.size() > 0){
            for(integer i = 0; i< bugs.size(); i++){
                bugs[i].TR_Project__c = projectId;
                bugs[i].TR_User_Story__c = template.TR_User_Story__r.Id;
                bugs[i].TR_Sprint__c = template.TR_User_Story__r.TR_Allocated_Sprint__c;
                bugs[i].TR_Status__c = defaultTicketStat;
                bugs[i].TR_Tester__c = testUserId;
                bugs[i].TR_Log_Time__c = system.now();
                bugs[i].TR_Logged_by__c = system.userInfo.getUserId();
                bugs[i].TR_Test_Phase__c = this.texec.TR_Test_Phase__c;
                bugs[i].TR_Test_Script__c = this.texec.TR_Template__c;
            }
        }
    }
    
    public PageReference AttachFile() {
        if(TestSp.size() > 0){
            update TestSp;
        }
        testId =  System.currentPageReference().getParameters().get('testId');
        testName =  System.currentPageReference().getParameters().get('testName');
        PageReference redirect = new PageReference('/p/attach/NoteAttach?parentname='+testName+'&pid='+testId
                                                    +'&retURL='+'/apex/TR_RunTestScript?Id='+texec.Id); 
        redirect.setRedirect(true); 
    
        return redirect;
    }
    
    public PageReference  save(){
        try{
            insert bugs;

            if(TestSp.size() > 0){
                update TestSp;
            }
            
            update texec;
        }catch(Exception ex){
            
        }
        
        if(!string.isBlank(texec.TR_Overall_Test_Comments__c) && !string.isBlank(texec.TR_Test_Outcome__c)){
            PageReference backToPrevious = new PageReference('/'+texec.Id);
            backToPrevious.setRedirect(true); 
            return backToPrevious;  
        }else{
            stepsComplete = true;
            ApexPages.addMessage(
            new ApexPages.message(ApexPages.Severity.FATAL,system.label.TR_Test_Execution_Message_01));
            return null;
        }
    }

}