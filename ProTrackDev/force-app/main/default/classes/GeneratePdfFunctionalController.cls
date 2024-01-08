public class GeneratePdfFunctionalController {
  public List<EpicStoryWrapper> epicStoryWrapperList { get; set; }

  public GeneratePdfFunctionalController(
    ApexPages.StandardController stdController
  ) {
    TR_Release__c releaseRecord = (TR_Release__c) stdController.getRecord();
    Map<String, List<TR_User_Story__c>> epicStoryMap = new Map<String, List<TR_User_Story__c>>();
    //find all user stories'
    for (TR_User_Story__c userStory : [
      SELECT
        Id,
        Name,
        TR_Allocated_Sprint__r.Name,
        TR_As_a__c,
        TR_I_want_to__c,
        TR_So_that__c,
        TR_Story_Title__c,
        TR_Project__r.Name,
        TR_Epic_Name__c,
        TR_Status__c,
        TR_Priority__c,
        TR_Approval_Status__c,
        TR_Cancellation_Reason__c,
        TR_External_ID__c,
        TR_Acceptance_Criteria__c,
        TR_Allocated_Release__r.Name
      FROM TR_User_Story__c
      WHERE TR_Allocated_Release__c = :releaseRecord.Id
      ORDER BY TR_Epic_Name__c, Id NULLS FIRST
    ]) {
      List<TR_User_Story__c> tmpMap = new List<TR_User_Story__c>();
      if (epicStoryMap.containsKey(userStory.TR_Epic_Name__c)) {
        tmpMap = epicStoryMap.get(userStory.TR_Epic_Name__c);
      }
      tmpMap.add(userStory);
      epicStoryMap.put(userStory.TR_Epic_Name__c, tmpMap);
    }

    epicStoryWrapperList = new List<EpicStoryWrapper>();
    for (String epicName : epicStoryMap.keySet()) {
      epicStoryWrapperList.add(
        new EpicStoryWrapper(epicName, epicStoryMap.get(epicName))
      );
    }
  }

  public class EpicStoryWrapper {
    public String epicName { get; set; }
    public List<TR_User_Story__c> userStories { get; set; }
    public EpicStoryWrapper(
      String epicName,
      List<TR_User_Story__c> userStories
    ) {
      this.epicName = epicName;
      this.userStories = userStories;
    }
  }
}
