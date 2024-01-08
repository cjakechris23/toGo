public  with sharing class TR_SequenceTestSteps_Controller  {
    public List<TR_Test_Script_Step__c> TestSteps {get;set;}
    public Id scriptID {get;set;}
    public string sortedIDs{get;set;}
    public string UpdatedTSId {get;set;}
    public List<TR_Test_Script_Step__c> Steps {get;set;}
    public static List<TR_Test_Script_Step__c> StepOrder {get;set;}
    
    public TR_SequenceTestSteps_Controller(){
        scriptID = ApexPages.currentPage().getParameters().get('TKR_Test_Templates'); 
        if(scriptID != null){
            TestSteps = [SELECT TR_Action__c, TR_Action_Long__c,
                                TR_Expected_Result__c, TR_Ranked_Sequence__c,
                                TR_Sequence_Last_Updated_By__r.Name, TR_Test_Script__c,
                                Id,Name
                         FROM TR_Test_Script_Step__c WHERE TR_Test_Script__c =: scriptID
                         ORDER BY TR_Ranked_Sequence__c ASC];
        }
    }
    
    @RemoteAction
    public static List<TR_Test_Script_Step__c> updateSortOrder(List<String> sortedIDs, String UpdatedTSId) {
        Set<String> stepsId = new Set<String>();
        Map<String, Integer> seqOrderMap = new Map<String, Integer>();
        for(String ids : sortedIDs){
            stepsId.add(ids.left(18));
        }
        StepOrder = [SELECT TR_Action__c, TR_Action_Long__c,
                    TR_Expected_Result__c, TR_Ranked_Sequence__c,
                    TR_Sequence_Last_Updated_By__c,
                    TR_Sequence_Last_Updated_By__r.Name, TR_Test_Script__c,
                    Id,Name
                    FROM TR_Test_Script_Step__c WHERE Id IN: stepsId];
        
        Integer index;            
        for(Integer i = 0; i < sortedIDs.size(); i++){
            index = i+1;
            seqOrderMap.put(sortedIDs[i].left(18), index);    
        } 
        
        for(TR_Test_Script_Step__c rec : StepOrder){
            if(seqOrderMap.containsKey(rec.Id)){
                rec.TR_Ranked_Sequence__c = Decimal.valueOf(seqOrderMap.get(rec.Id));
                rec.TR_Sequence_Last_Updated_By__c = userinfo.getuserid();
            }
        }
        update StepOrder;

        return StepOrder;
                
    }
}