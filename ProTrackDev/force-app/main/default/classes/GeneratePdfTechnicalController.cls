public class GeneratePdfTechnicalController {
  public List<TR_Technical_Design__c> techDesignList { get; set; }
  List<TR_Technical_Design__c> allTechDesignList { get; set; }
  public List<GeneratePdfFunctionalController.EpicStoryWrapper> epicStoryWrapperList {
    get;
    set;
  }

  public GeneratePdfTechnicalController(
    ApexPages.StandardController stdController
  ) {
    TR_Release__c releaseRecord = (TR_Release__c) stdController.getRecord();
    Set<Id> userStoriesIds = new Set<Id>();
    List<TR_User_Story__c> userStoriesList = [
      SELECT
        Id,
        Name,
        TR_Allocated_Sprint__r.Name,
        TR_Epic_Name__c,
        TR_Allocated_Release__r.Name
      FROM TR_User_Story__c
      WHERE TR_Allocated_Release__c = :releaseRecord.Id
    ];
    Map<String, List<TR_User_Story__c>> epicStoryMap = new Map<String, List<TR_User_Story__c>>();
    //find all user stories'
    for (TR_User_Story__c userStory : userStoriesList) {
      userStoriesIds.add(userStory.Id);
      List<TR_User_Story__c> tmpMap = new List<TR_User_Story__c>();
      if (epicStoryMap.containsKey(userStory.TR_Epic_Name__c)) {
        tmpMap = epicStoryMap.get(userStory.TR_Epic_Name__c);
      }
      tmpMap.add(userStory);
      epicStoryMap.put(userStory.TR_Epic_Name__c, tmpMap);
    }

    epicStoryWrapperList = new List<GeneratePdfFunctionalController.EpicStoryWrapper>();
    for (String epicName : epicStoryMap.keySet()) {
      epicStoryWrapperList.add(
        new GeneratePdfFunctionalController.EpicStoryWrapper(
          epicName,
          epicStoryMap.get(epicName)
        )
      );
    }
    Set<Id> techDesignIdSet = new Set<Id>();
    System.debug('31-->' + userStoriesIds);
    for (TR_Design_User_Story_Association__c designUser : [
      SELECT Id, TR_Technical_Design__c
      FROM TR_Design_User_Story_Association__c
      WHERE TR_User_Story__c IN :userStoriesIds
    ]) {
      techDesignIdSet.add(designUser.TR_Technical_Design__c);
    }
    techDesignList = [
      SELECT
        id,
        Name,
        TR_Design_Name__c,
        OwnerId,
        TR_Design_Type__c,
        TR_Complexity__c,
        TR_Overview__c,
        TR_Data_Model__c,
        TR_User_Interface_UI__c,
        TR_Objects__c,
        TR_Fields__c,
        TR_Apex_Classes__c,
        TR_Apex_Trigger__c,
        TR_Other_Components__c,
        TR_Page_Layouts__c,
        TR_Visualforce_Pages__c,
        TR_Aura_Component__c,
        TR_Lightning_Web_Component__c,
        TR_Lightning_Page__c,
        TR_Flows__c,
        (
          SELECT
            id,
            name,
            TR_User_Story__r.Name,
            TR_User_Story__r.TR_Project__r.Name,
            TR_User_Story__r.TR_Allocated_Release__r.Name
          FROM Design_User_Story_Associations__r
        )
      FROM TR_Technical_Design__c
      WHERE id IN :techDesignIdSet
      ORDER BY CreatedDate DESC
    ];
    //SELECT  id,Name, TR_Project__r.Name, TR_Design_Name__c, TR_Lightning_Web_Component__c, (select id,name,TR_User_Story__r.Name from Design_User_Story_Associations__r) FROM TR_Technical_Design__c
  }
}
