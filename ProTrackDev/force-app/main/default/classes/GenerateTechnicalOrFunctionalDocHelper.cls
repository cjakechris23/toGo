public with sharing class GenerateTechnicalOrFunctionalDocHelper {
  @AuraEnabled(cacheable=true)
  public static void invokeGenerateDocument(
    GenerateTechnicalOrFunctionalDocHelper.ParametersWrapper paramWrp
  ) {
    generateDocumentAndSaveToFiles(JSON.serialize(paramWrp));
  }
  @future(callout=true)
  public static void generateDocumentAndSaveToFiles(String paramWrpString) {
    try {
      String currentTime =
        DateTime.Now().year() +
        '-' +
        DateTime.Now().month() +
        '-' +
        DateTime.Now().day() +
        ' ' +
        DateTime.Now().hour() +
        ':' +
        DateTime.Now().minute() +
        ':' +
        DateTime.Now().second();
      GenerateTechnicalOrFunctionalDocHelper.ParametersWrapper paramWrp = (GenerateTechnicalOrFunctionalDocHelper.ParametersWrapper) JSON.deserialize(
        paramWrpString,
        GenerateTechnicalOrFunctionalDocHelper.ParametersWrapper.class
      );
      ContentVersion conVer = new ContentVersion();
      conVer.ContentLocation = 'S';
      conVer.PathOnClient =
        paramWrp.documentType +
        ' Document ' +
        currentTime +
        '.pdf';
      conVer.Title =
        paramWrp.documentType +
        ' Document ' +
        '-V' +
        paramWrp.version +
        '-' +
        currentTime;

      Pagereference pageRef;
      if (paramWrp.documentType == 'Technical') {
        pageRef = Page.GenerateTechnicalPdf;
      } else if (paramWrp.documentType == 'Functional') {
        pageRef = Page.GenerateFunctionalPdf;
      }
      pageRef.getParameters().put('Id', paramWrp.releaseId);
      pageRef.getParameters().put('version', paramWrp.version);
      conVer.VersionData = pageRef.getContentAsPDF();
      insert conVer;

      Id conDoc = [
        SELECT ContentDocumentId
        FROM ContentVersion
        WHERE Id = :conVer.Id
      ]
      .ContentDocumentId;
      ContentDocumentLink conDocLink = new ContentDocumentLink();
      conDocLink.LinkedEntityId = paramWrp.releaseId;
      conDocLink.ContentDocumentId = conDoc;
      conDocLink.shareType = 'V';
      insert conDocLink;
    } catch (Exception e) {
      System.debug('Exception in Generating Document' + e);
    }
  }

  public class ParametersWrapper {
    @AuraEnabled
    public string releaseId { get; set; }
    @AuraEnabled
    public String documentType { get; set; }
    @AuraEnabled
    public String version { get; set; }
  }
}
