/**
 * @FileName            : SurveySendController.cls
 * @Description         : Controller for surveySendModule LWC
 * @Author              : Cleo Perez
 * ==================================================================================================
 * @History
 * Version      Date                Author                                      Description
 * 1.0          15/11/2022          Cleo Perez (cleperez@deloitte.com)          Initial Version
 **/

public with sharing class SurveySendController {
    /**
     * @description      Retrieves OrgWideAddress records used in From Address lookup field
     * @param            searchKey       String             Search key used to filter results
     * @return           List<SurveyLookupSearchResult>     List of Name & Address values formatted in SurveyLookupSearchResult object
     **/
    @AuraEnabled(cacheable=true)
    public static List<SurveyLookupSearchResult> searchFromEmail(String searchKey) {
        List<SurveyLookupSearchResult> results = new List<SurveyLookupSearchResult>();

        String query = 'SELECT Id, DisplayName, Address  FROM OrgWideEmailAddress ';

        if (String.isNotBlank(searchKey) && String.isNotEmpty(searchKey)) {
            String strKey = '%' + searchKey + '%';
            query += 'WHERE DisplayName LIKE :strKey OR Address LIKE :strKey ORDER BY DisplayName ASC LIMIT 5';
        } else {
            query += 'ORDER BY DisplayName ASC LIMIT 5';

            /*  Optional: Adds Running User email details into the From Address selection
            results.add(
                new SurveyLookupSearchResult(UserInfo.getUserId(), 'User', 'standard:people', UserInfo.getName(), UserInfo.getUserEmail())
            );  
            */
        }

        for (OrgWideEmailAddress owe : Database.query(query)) {
            results.add(new SurveyLookupSearchResult(owe.Id, 'OrgWideEmailAddress', 'standard:people', owe.DisplayName, owe.Address));
        }

        return results;
    }

    /**
     * @description      Retrieves SurveySubscription__c records used in Recipient/s lookup field
     * @param            searchKey                  String                  Search key used to filter results
     * @param            surveyVersionRecord        SurveyVersion__c        SurveyVersion record used to filter results
     * @return           List<SurveyLookupSearchResult>                     List of SurveySubscription__c records formatted in SurveyLookupSearchResult object
     **/
    @AuraEnabled(cacheable=true)
    public static List<SurveyLookupSearchResult> searchRecipient(String searchKey, SurveyVersion__c surveyVersionRecord) {
        List<SurveyLookupSearchResult> results = new List<SurveyLookupSearchResult>();

        String surveyId = surveyVersionRecord.SurveyId__c;
        String surveyVersionId = surveyVersionRecord.Id;

        String query = 
            'SELECT Id, Name, ContactSubscriptionCount__c ' +
            'FROM SurveySubscription__c ' +
            'WHERE IsActive__c = true ' +
            'AND IsSent__c = false ' +
            'AND Survey__c = :surveyId ' +
            'AND Survey_Version__c = :surveyVersionId ';
        if (String.isNotBlank(searchKey) && String.isNotEmpty(searchKey)) {
            String strKey = '%' + searchKey + '%';
            query += 'AND Name LIKE :strKey ORDER BY Name ASC LIMIT 5';
        } else {
            query += 'ORDER BY Name ASC LIMIT 5';
        }

        for (SurveySubscription__c ss : Database.query(query)) {
            results.add(
                new SurveyLookupSearchResult(
                    ss.Id,
                    'SurveySubscription__c',
                    'standard:groups',
                    ss.Name,
                    ss.ContactSubscriptionCount__c + ' Subscriber/s'
                )
            );
        }

        return results;
    }

    /**
     * @description      Retrieves EmailTemplate records used in Email Template lookup field
     * @param            searchKey       String             Search key used to filter results
     * @return           List<SurveyLookupSearchResult>     List of Email Templates formatted in SurveyLookupSearchResult object
     **/
    @AuraEnabled(cacheable=true)
    public static List<SurveyLookupSearchResult> searchEmlTemplate(String searchKey) {
        List<SurveyLookupSearchResult> results = new List<SurveyLookupSearchResult>();

        String query = 
            'SELECT Id, Name ' + 
            'FROM EmailTemplate ' + 
            'WHERE UiType = \'SFX\' ' + 
            'AND Folder.Name = \'Survey Templates\' ' + 
            'AND RelatedEntityType = \'SurveyInvitation__c\' ';

        if (String.isNotBlank(searchKey) && String.isNotEmpty(searchKey)) {
            String strKey = '%' + searchKey + '%';
            query += 'AND Name LIKE :strKey ORDER BY Name ASC LIMIT 5';
        } else {
            query += 'ORDER BY Name ASC LIMIT 5';
        }

        for (EmailTemplate eml : Database.query(query)) {
            results.add(new SurveyLookupSearchResult(eml.Id, 'EmailTemplate', 'standard:template', eml.Name, ''));
        }

        return results;
    }

    /**
     * @description      Retrieves Subject & HtmlValue of the selected EmailTemplate for Preview
     * @param            recordId       String      Id of EmailTemplate record used to retrive record values
     * @return           EmailTemplate              Returns the Subject & HtmlValue of EmailTemplate record
     **/
    @AuraEnabled(cacheable=true)
    public static EmailTemplate getEmailTemplateContent(String recordId) {
        return [SELECT Subject, HtmlValue FROM EmailTemplate WHERE Id = :recordId LIMIT 1];
    }

    /**
     * @description      Sends the Survey Invitation according to the selected values in Survey Send Module
     * @param            searchKey       String             Search key used to filter results
     **/
    @AuraEnabled
    public static void sendSurveyInvitation(SurveyVersion__c surveyVersionRecord, String emlTemplate, String fromAddr, String recipient) {
        try {
            List<SurveyInvitation__c> surveyInvitationList = new List<SurveyInvitation__c>();
             
            for (SurveyContactSubscription__c scs : [
                SELECT Contact__c, Survey_Subscription__c, Survey_Subscription__r.IsSent__c
                FROM SurveyContactSubscription__c
                WHERE
                    Survey_Subscription__c = :recipient
                    /*AND Survey_Subscription__r.Survey__c = :surveyVersionRecord.SurveyId__c
                     AND Survey_Subscription__r.Survey_Version__c = :surveyVersionRecord.Id*/
                    AND Survey_Subscription__r.IsActive__c = TRUE
                    AND IsActive__c = TRUE
            ]) {
                SurveyInvitation__c surveyInvitation = new SurveyInvitation__c();
                SurveySubscription__c surveySubscriptions = new surveySubscription__c(id =scs.Survey_Subscription__c);
                surveyInvitation.SurveyId__c = surveyVersionRecord.SurveyId__c;
                surveyInvitation.SurveyVersion__c = surveyVersionRecord.Id;
                surveyInvitation.ParticipantContactId__c = scs.Contact__c;
                surveyInvitation.Survey_Subscription__c = scs.Survey_Subscription__c;
                surveySubscriptions.IsSent__c = true;
                
                //Custom Setting for Survey App
                Survey_App_Setting__c surveyCS = Survey_App_Setting__c.getOrgDefaults();
                surveyInvitation.CommunityId__c = surveyCS.Community_Id__c;
                surveyInvitation.Uuid__c = new SurveyUtilsUuid().getValue();

                //Ex. https://phpdc--survey.sandbox.my.site.com/phpdcsurvey/s/flow/Screen_Flow_Survey_LWC_Renderer?surveyUuid=ffb5611d-6680-4969-8aca-0922d49b7a86
                surveyInvitation.InvitationLink__c = 
                    surveyCS.Community_URL__c + 'flow/' + surveyCS.Flow__c + '?' + surveyCS.Flow_Parameter__c + '=' + surveyInvitation.Uuid__c;

                surveyInvitationList.add(surveyInvitation);
                update surveySubscriptions;
            }
           

            if (!surveyInvitationList.isEmpty()) {
                insert surveyInvitationList;
                
                sendSurveyInvitationEmails(emlTemplate, fromAddr, surveyInvitationList);
            }
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
       
    }

    /**
     * @description      Retrieves OrgWideAddress records used in From Address survey send lookup field
     * @param            searchKey       String             Search key used to filter results
     **/
    private static void sendSurveyInvitationEmails(
        String emailTemplateId,
        String fromAddress,
        List<SurveyInvitation__c> surveyInvitations
    ) {
        List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();

        for (SurveyInvitation__c si : surveyInvitations) {
            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();

            mail.setOrgWideEmailAddressId(fromAddress);
            mail.setToAddresses(new List<String>{ si.ParticipantContactId__c });

            mail.setTemplateId(emailTemplateId);
            mail.setTargetObjectId(si.ParticipantContactId__c);
            mail.setWhatId(si.Id);

            emailList.add(mail);
        }

        if (!emailList.isEmpty() && !Test.isRunningTest()) {
            Messaging.SendEmailResult[] results = Messaging.sendEmail(emailList);
            for (Messaging.SendEmailResult rs : results) {
                if (rs.isSuccess()) {
                    //Do something for success
                } else {
                    // Operation failed, so get all errors
                    for (Messaging.SendEmailError err : rs.getErrors()) {
                        System.debug('The following error has occurred.');
                        System.debug(err.getStatusCode() + ': ' + err.getMessage());
                        System.debug('fields that affected this error: ' + err.getFields());
                    }
                }
            }
        }
    }


    /*Trial & Error methods - For Deletion*/
    @AuraEnabled
    public static String previewRenderedEmailTemplate() {
        EmailTemplate emlTemplateRecord = [
            SELECT Id, Subject, HtmlValue
            FROM EmailTemplate
            WHERE Id = '00X3J000000Vfm6UAC'
            LIMIT 1
        ];
        SurveyInvitation__c surveyInvitationRecord = [
            SELECT Id, ParticipantContactId__c
            FROM SurveyInvitation__c
            WHERE Id = 'a0L3J000003sBnMUAU'
            LIMIT 1
        ];

        List<Messaging.RenderEmailTemplateBodyResult> result = Messaging.renderEmailTemplate(
            surveyInvitationRecord.ParticipantContactId__c,
            surveyInvitationRecord.Id,
            new List<String>{ emlTemplateRecord.HtmlValue }
        );

        return result[0].getMergedBody();
    }

    private static String renderEmailTemplate(String whoId, String whatId, String emailBody) {

        List<Messaging.RenderEmailTemplateBodyResult> renderedEmlBody = 
            Messaging.renderEmailTemplate(whoId, whatId, new List<String>{ emailBody });

        return renderedEmlBody[0].getMergedBody();
    }
}