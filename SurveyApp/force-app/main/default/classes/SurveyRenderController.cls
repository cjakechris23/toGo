/*
Name: SurveyRenderController.js
==========================================================================================================
Purpose: Apex controller for the custom survey LWC renderer
==========================================================================================================
History

VERSION    AUTHOR                                               DATE                DESCRIPTION
1.0        Kenneth Kim (kennkim@deloitte.com)            		01/30/2023          Initial version
*********************************************************************************************************
*/
public with sharing class SurveyRenderController {
    
    // Method for retriving survey question details
    @AuraEnabled(cacheable=true)
    public static List<SurveyQuestion__c> getSurveyQuestion(String surveyVersionId){
        return [SELECT Id, Name, QuestionType__c, QuestionOrder__c, IsRequired__c, (SELECT Id, Name, ChoiceOrder__c, QuestionId__c  FROM SurveyQuestionChoices__r ORDER BY ChoiceOrder__c ASC) FROM SurveyQuestion__c WHERE SurveyVersionId__c = :surveyVersionId ORDER BY QuestionOrder__c ASC];
    } 
    
    @AuraEnabled
    public static void saveSurveyResponses(String jsonResponseArray, String surveyName, String surveyId, String surveyVersionId, String customSurveyInvitationId, String participantContactId){
        
        System.debug('--------------- saveSurveyResponses -------------------');
        System.debug('suveyId: ---------------->' + surveyId); // a0H3J000002hwlkUAA
        System.debug('surveyName: ------------->' + surveyName);
        System.debug('surveyVersionId: -------->' + surveyVersionId); // a0I3J000001ActeUAC
        System.debug('customSurveyInvitationId: -------->' + customSurveyInvitationId); // a0I3J000001ActeUAC
        System.debug('participantContactId: -------->' + participantContactId); // a0I3J000001ActeUAC
        
        
        // Initialize a SurveyResponse__c object
        SurveyResponse__c surveyResponse = new SurveyResponse__c();
        surveyResponse.SurveyId__c = surveyId;
        surveyResponse.SurveyVersionId__c = surveyVersionId;
        surveyResponse.Status__c = 'Completed';
        surveyResponse.CompletionDateTime__c = DateTime.Now();
        surveyResponse.Name = surveyName + ' -- ' + UserInfo.getName();
        surveyResponse.InvitationId__c = customSurveyInvitationId;
        surveyresponse.ResponseSubmitterContactID__c = participantContactId;
        
        Id surveyResponseId = insertSurveyResponse(surveyResponse);
        
        // Create a collection for bulk insert
        List<SurveyQuestionResponse__c> surveyQuestionResponseList = new List<SurveyQuestionResponse__c>();
        
        // Deserialize JSON array of questions and answers from LWC
        List<Object> responseList = (List<Object>)JSON.deserializeUntyped(jsonResponseArray);
        
        // Loop through the array of objects containing the reponses. Convert each element to a Map (key: property name, value: property value)
        for(Object response : responseList){   
            
            Map<String,Object> data = (Map<String,Object>) response;
            SurveyQuestionResponse__c surveyQuestionResponse = new SurveyQuestionResponse__c();
            surveyQuestionResponse.ResponseId__c =  surveyResponseId;
            surveyQuestionResponse.SurveyVersionId__c = surveyVersionId;
            surveyQuestionResponse.Name = (String) data.get('questionName');
            surveyQuestionResponse.QuestionId__c = (String) data.get('questionId');
            surveyQuestionResponse.InvitationId__c = customSurveyInvitationId;
            
            // DEBUG:
            System.debug('Current Question Type: ---------------------------------------------> ' + data.get('questionType'));
            
            // Handle ResponseValue__c for multi-select: If current response is a MultiSelectPicklist. Do not store QuestionChoiceId__c
            if(data.get('questionType') == 'ShortText' && data.get('answerValue') != ''){
                surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
                surveyQuestionResponse.DataType__c = 'String';
            }
            else if(data.get('questionType') == 'MultiSelectPicklist' && data.get('answerValue') != ''){
                surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
                surveyQuestionResponse.DataType__c = 'String';
            }
            else if(data.get('questionType') == 'RadioButton' && data.get('answerValue') != ''){
                surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
                surveyQuestionResponse.DataType__c = 'String';
                surveyQuestionResponse.QuestionChoiceId__c = (String) data.get('answerId');
            }
            
            else if( data.get('questionType') == 'Boolean'){
                surveyQuestionResponse.DataType__c = 'Boolean'; 
                if((data.get('answerValue').toString() == 'Happy') || (data.get('answerValue').toString() == 'Like') || (data.get('answerValue').toString() == 'Yes')){
                    surveyQuestionResponse.IsTrueOrFalse__c = true;
                    surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
                }
                else{
                    surveyQuestionResponse.IsTrueOrFalse__c = false;
                    surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
                }
                surveyQuestionResponse.QuestionChoiceId__c = (String) data.get('answerId');
                
            }
            else if(data.get('questionType') == 'Rating' && data.get('answerValue') != ''){
                surveyQuestionResponse.DataType__c = 'Number';  
                surveyQuestionResponse.Rank__c = Decimal.valueOf(data.get('answerValue').toString());
                surveyQuestionResponse.QuestionChoiceId__c = (String) data.get('answerId');
                surveyQuestionResponse.ResponseValue__c = data.get('answerValue').toString();
            }
            
            
            // Add response to list
            surveyQuestionResponseList.add(surveyQuestionResponse);	
            
        }
        // Insert surveyQuestionResponses
        insertSurveyQuestionResponse(surveyQuestionResponseList);
        
        //Update SurveyInvitation__c ResponseStatus__c to completed
        SurveyInvitation__c surveyInvitation = new SurveyInvitation__c();
        surveyInvitation.Id = customSurveyInvitationId;
        surveyInvitation.ResponseStatus__c = 'Completed';
        
        //Update SurveyInvitation__c
        updateSurveyInvitation(surveyInvitation);
    }
    
    @AuraEnabled
    public static Id cloneSurvey(String surveyVersionId){
        System.debug('************ cloneSurvey ************');
        System.debug('surveyVersionId -------> ' + surveyVersionId);
        
        // Get exisitng Survey__c record
        Survey__c customSurvey = [SELECT Id, Name, SurveyType__c FROM Survey__c WHERE Survey__c.LatestVersionId__c = :surveyVersionId LIMIT 1];
        
        // Initialize a new Survey__c
        Survey__c newCustomSurvey = new Survey__c();
        newCustomSurvey.Name = customSurvey.Name + ' - copy';
        newCustomSurvey.SurveyType__c = customSurvey.SurveyType__c;
        
        // Insert new custom survey
        Id customSurveyId = upsertCustomSurvey(newCustomSurvey);
        System.debug('NEW CUSTOM SURVEY ID: ' + customSurveyId);
        
        // Get exisitng surveyVersion record 
        SurveyVersion__c surveyVersion = [SELECT Id, Name, SurveyStatus__c, VersionNumber__c, SurveyId__c FROM SurveyVersion__c WHERE Id = :surveyVersionId LIMIT 1];
        
        // Initialize a new SurveyVersion__c
        SurveyVersion__c newSurveyVersion = new SurveyVersion__c();
        newSurveyVersion.Name = newCustomSurvey.Name + ' v1';
        newSurveyVersion.SurveyStatus__c = 'Draft';
        newSurveyVersion.VersionNumber__c = 1;
        newSurveyVersion.SurveyId__c = customSurveyId;
        
        // Insert new custom survey version record
        Id newSurveyVersionId = upsertCustomSurveyVersion(newSurveyVersion);
        System.debug('NEW CUSTOM SURVEY VERSION ID: ' + newSurveyVersionId);
        
        // Update the LatestVersionId__c of new custom survey
        newCustomSurvey.Id = customSurveyId;
        newCustomSurvey.LatestVersionId__c = newSurveyVersionId;
        
        // Upsert new custom survey record
        upsertCustomSurvey(newCustomSurvey);
        
        // Get SurveyQuestion__c records
        List<SurveyQuestion__c>	surveyQuestionList = [SELECT Id, Name, QuestionName__c, QuestionType__c, QuestionOrder__c, IsRequired__c, (SELECT Id, Name, ChoiceOrder__c, QuestionId__c FROM SurveyQuestionChoices__r ORDER BY ChoiceOrder__c ASC) FROM SurveyQuestion__c WHERE SurveyVersionId__c = :surveyVersionId ORDER BY QuestionOrder__c ASC];
        List<SurveyQuestion__c> newSurveyQuestionList = new List<SurveyQuestion__c>();
        
        Map<String, List<SurveyQuestionChoice__c>> surveyQuestionChoicesMap = new Map<String, List<SurveyQuestionChoice__c>>();
        
        for(SurveyQuestion__c surveyQues : surveyQuestionList){
            
            surveyQuestionChoicesMap.put(String.valueof(surveyQues.QuestionOrder__c), surveyQues.SurveyQuestionChoices__r);
            
            SurveyQuestion__c newSurveyQues = surveyQues.clone(false, true, false, false);
            newSurveyQues.SurveyVersionId__c = newSurveyVersionId;
            newSurveyQuestionList.add(newSurveyQues);
        }
        
        // Insert new SurveyQuestion__c records
        List<SurveyQuestion__c> insertedSurveyQuestionList = upsertSurveyQuestion(newSurveyQuestionList);
        
        // Create a list for SurveyQuestionChoice__c records to be inserted
        List<SurveyQuestionChoice__c> newSurveyQuestionChoiceList = new List<SurveyQuestionChoice__c>();
        
        // Loop through newly inserted SurveyQuestion__c records
        for(SurveyQuestion__c question : insertedSurveyQuestionList){
            List<SurveyQuestionChoice__c> choiceList = surveyQuestionChoicesMap.get(String.valueof(question.QuestionOrder__c));
            
            for(SurveyQuestionChoice__c choice : choiceList){
                SurveyQuestionChoice__c newChoice = choice.clone(false, true, false, false);
                newChoice.SurveyVersionId__c = newSurveyVersionId;
                newChoice.QuestionId__c = question.Id;
                newSurveyQuestionChoiceList.add(newChoice);
            }   
        } 
        
        // Upsert new question choices
        upsertSurveyQuestionChoice(newSurveyQuestionChoiceList);
        return newCustomSurvey.Id;
    }    
    
    //*********************************************** PRIVATE METHODS ***********************************************
    
    // Method for inserting survey response
    private static Id insertSurveyResponse(SurveyResponse__c surveyResponse){
        System.debug('Saving survey response');
        
        try{	
            Database.SaveResult result = Database.insert(surveyResponse, true);
            
            if(result.isSuccess()) {
                System.debug('Successfully created SurveyResponse__c : ' + result.getId());
            } else {        
                for(Database.Error error : result.getErrors()) {
                    System.debug('Error Status : ' + error.getStatusCode() + ' : ' + 'Error Fields : ' + error.getFields());
                }
            }    
            
        }catch(DMLException e){
            throw new DMLException('Unable to Perform the DML Operation on SurveyResponse__c : ' +e.getMessage());
        }
        return surveyResponse.Id;
    }
    
    // Method for inserting survey question response
    private static void insertSurveyQuestionResponse(List<SurveyQuestionResponse__c> surveyQuestionResponseList){
        System.debug('Saving survey question response');
        
        try{	
            Database.SaveResult[] results = Database.insert(surveyQuestionResponseList, true);
            
            // Iterate over the list of returned results
            for(Database.SaveResult result : results) {
                if(result.isSuccess()) {
                    System.debug('Successfully inserted SurveyQuestionResponse__c : ' + result.getId());
                } else {        
                    for(Database.Error error : result.getErrors()) {
                        System.debug('Error Status : ' + error.getStatusCode() + ' : ' + 'Error Fields : ' + error.getFields());
                    }
                }
            }
        }catch(DMLException e){
            throw new DMLException('Unable to Perform the DML Operation on SurveyQuestionResponse__c : ' +e.getMessage());
        } 
    }
    
    private static void updateSurveyInvitation(SurveyInvitation__c surveyInvitation){
        System.debug('Updating Survey Invitation');
        
        try{	
            Database.SaveResult result = Database.update(surveyInvitation, true);
            
            if(result.isSuccess()) {
                System.debug('Successfully updated SurveyInvitation__c : ' + result.getId());
            } else {        
                for(Database.Error error : result.getErrors()) {
                    System.debug('Error Status : ' + error.getStatusCode() + ' : ' + 'Error Fields : ' + error.getFields());
                }
            }    
            
        }catch(DMLException e){
            throw new DMLException('Unable to Perform the DML Operation on SurveyInvitation__c : ' +e.getMessage());
        }  
    }
    
    // Method for inserting new custom survey (Survey__c)
    private static Id upsertCustomSurvey(Survey__c customSurvey){
        System.debug('Upserting custom survey');
        
        try{	
            Database.UpsertResult result = Database.upsert(customSurvey, true);
            
            if(result.isSuccess()) {
                System.debug('Successfully upserted Survey__c : ' + result.getId());
            } else {        
                for(Database.Error error : result.getErrors()) {
                    System.debug('Error Status : ' + error.getStatusCode() + ' : ' + 'Error Fields : ' + error.getFields());
                }
            }    
            
        }catch(DMLException e){
            throw new DMLException('Unable to Perform the DML Operation on Survey__c : ' +e.getMessage());
        }
        return customSurvey.Id;
    }
    
    // Method for upserting new custom survey version (SurveyVersion__c)
    private static Id upsertCustomSurveyVersion(SurveyVersion__c customSurveyVersion){
        System.debug('Upserting custom survey version');
        
        try{	
            Database.UpsertResult result = Database.upsert(customSurveyVersion, true);
            
            if(result.isSuccess()) {
                System.debug('Successfully upserted SurveyVersion__c : ' + result.getId());
            } else {        
                for(Database.Error error : result.getErrors()) {
                    System.debug('Error Status : ' + error.getStatusCode() + ' : ' + 'Error Fields : ' + error.getFields());
                }
            }    
            
        }catch(DMLException e){
            throw new DMLException('Unable to Perform the DML Operation on SurveyVersion__c : ' +e.getMessage());
        }
        return customSurveyVersion.Id;
    }
    
    // Method for upserting new custom survey questions (SurveyQuestion__c)
    private static List<SurveyQuestion__c> upsertSurveyQuestion(List<SurveyQuestion__c> customSurveyQuestionList){
        System.debug('Upserting custom survey questions');
        
        try{	
            Database.UpsertResult[] results = Database.upsert(customSurveyQuestionList, true);
            
            // Iterate over the list of returned results
            for(Database.UpsertResult result : results) {
                if(result.isSuccess()) {
                    System.debug('>> Successfully upserted SurveyQuestion__c :  ----------> ' + result.getId());
                } else {        
                    for(Database.Error error : result.getErrors()) {
                        System.debug('>> Error Status :  ----------> ' + error.getStatusCode() + ' : ' + 'Error Fields : ' + error.getFields());
                    }
                }
            }     
        }catch(DMLException e){
            throw new DMLException('Unable to Perform the DML Operation on SurveyQuestion__c : ' +e.getMessage());
        }
        return customSurveyQuestionList;
    }
    
    // Method for upserting new custom survey question choices (SurveyQuestionChoice__c)
    private static void upsertSurveyQuestionChoice(List<SurveyQuestionChoice__c> questionChoiceList){
        System.debug('Upserting custom survey question choices');
        
        try{	
            Database.UpsertResult[] results = Database.upsert(questionChoiceList, true);
            
            // Iterate over the list of returned results
            for(Database.UpsertResult result : results) {
                if(result.isSuccess()) {
                    System.debug('>> Successfully upserted SurveyQuestionChoice__c :  ----------> ' + result.getId());
                } else {        
                    for(Database.Error error : result.getErrors()) {
                        System.debug('>> Error Status :  ----------> ' + error.getStatusCode() + ' : ' + 'Error Fields : ' + error.getFields());
                    }
                }
            }     
        }catch(DMLException e){
            throw new DMLException('Unable to Perform the DML Operation on SurveyQuestionChoice__c : ' +e.getMessage());
        }
    }
}